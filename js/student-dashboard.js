// student-dashboard.js - لوحة تحكم الطالب
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.student-dashboard')) {
        initStudentDashboard();
    }
});

function initStudentDashboard() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    loadStudentData();
    loadStudentVideos();
}

function loadStudentData() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;

    document.getElementById('studentName').textContent = currentUser.fullName;
    document.getElementById('studentGrade').textContent = `طالب - ${getGradeName(currentUser.grade)}`;
    
    const subscriptionStatus = document.getElementById('subscriptionStatus');
    if (currentUser.subscription.status === 'active') {
        subscriptionStatus.className = 'subscription-status active';
        subscriptionStatus.innerHTML = '<i class="fas fa-crown"></i> مشترك نشط';
    } else {
        subscriptionStatus.className = 'subscription-status inactive';
        subscriptionStatus.innerHTML = '<i class="fas fa-clock"></i> في انتظار التفعيل';
    }

    updateSubscriptionInfo();
}

function loadStudentVideos() {
    const currentUser = storage.getCurrentUser();
    const allVideos = storage.getVideos();
    const userProgress = storage.getUserProgress();

    const studentVideos = allVideos.filter(video => video.grade === currentUser.grade);
    displayStudentVideos(studentVideos, userProgress);
    updateProgressStats(studentVideos, userProgress);
}

function displayStudentVideos(videos, userProgress) {
    const videosGrid = document.getElementById('studentVideosList');
    const allVideosGrid = document.getElementById('allVideosList');
    
    if (videos.length === 0) {
        const noVideosHTML = `
            <div class="no-content">
                <i class="fas fa-video-slash"></i>
                <h3>لا توجد فيديوهات متاحة حالياً</h3>
                <p>سيتم إضافة فيديوهات جديدة قريباً</p>
            </div>
        `;
        if (videosGrid) videosGrid.innerHTML = noVideosHTML;
        if (allVideosGrid) allVideosGrid.innerHTML = noVideosHTML;
        return;
    }

    const videosHTML = videos.map(video => {
        const progress = userProgress[video.id] || 0;
        const isCompleted = progress === 100;
        const isStarted = progress > 0 && progress < 100;
        
        let progressText = 'غير مشاهد';
        let progressClass = '';
        
        if (isCompleted) {
            progressText = 'مكتمل';
            progressClass = 'completed';
        } else if (isStarted) {
            progressText = `قيد المشاهدة ${progress}%`;
            progressClass = 'in-progress';
        }

        return `
            <div class="video-item ${progressClass}" onclick="playVideo('${video.id}')">
                <div class="video-thumbnail" style="background: linear-gradient(135deg, ${getGradeColor(video.grade)})">
                    <i class="fas fa-play-circle"></i>
                    ${video.duration ? `<div class="video-duration">${video.duration}</div>` : ''}
                    ${isCompleted ? `<div class="video-completed"><i class="fas fa-check"></i></div>` : ''}
                </div>
                <div class="video-info">
                    <h4 class="video-title">${video.title}</h4>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                    <div class="video-meta">
                        <span><i class="fas fa-clock"></i> ${video.duration || 'غير محدد'}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(video.uploadDate)}</span>
                    </div>
                    <div class="video-progress">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progress}%"></div>
                        </div>
                        <span>${progressText}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (videosGrid) videosGrid.innerHTML = videosHTML;
    if (allVideosGrid) allVideosGrid.innerHTML = videosHTML;
}

function updateProgressStats(videos, userProgress) {
    const totalVideos = videos.length;
    const watchedVideos = Object.keys(userProgress).filter(videoId => 
        userProgress[videoId] === 100
    ).length;
    
    const overallProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

    document.getElementById('overallProgress').style.width = `${overallProgress}%`;
    document.getElementById('progressStats').innerHTML = `
        <span>${overallProgress}% مكتمل</span>
        <span>${watchedVideos}/${totalVideos} فيديو</span>
    `;

    document.getElementById('watchedVideos').textContent = watchedVideos;
    document.getElementById('completionRate').textContent = `${overallProgress}%`;
    
    const totalMinutes = watchedVideos * 30;
    document.getElementById('totalTime').textContent = `${totalMinutes} دقيقة`;
}

function updateSubscriptionInfo() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;

    document.getElementById('subStatus').textContent = 
        currentUser.subscription.status === 'active' ? 'نشط' : 'غير نشط';
    
    document.getElementById('subExpiry').textContent = 
        currentUser.subscription.endDate ? formatDate(currentUser.subscription.endDate) : 'غير محدد';
    
    document.getElementById('subPlan').textContent = 
        currentUser.subscription.plan || 'غير مشترك';
}

function playVideo(videoId) {
    const videos = storage.getVideos();
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        document.getElementById('videoModalTitle').textContent = video.title;
        document.getElementById('videoModalDescription').textContent = video.description || 'لا يوجد وصف';
        document.getElementById('videoModalDuration').textContent = video.duration || 'غير محدد';
        document.getElementById('videoModalDate').textContent = formatDate(video.uploadDate);
        
        document.getElementById('videoModal').style.display = 'block';
        
        // تحديث التقدم
        updateVideoProgress(videoId, 100);
    }
}

function updateVideoProgress(videoId, progress) {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;
    
    const userProgress = storage.getUserProgress();
    if (!userProgress[currentUser.id]) {
        userProgress[currentUser.id] = {};
    }
    userProgress[currentUser.id][videoId] = progress;
    storage.saveUserProgress(userProgress);
    
    loadStudentVideos();
}

function closeVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
}

function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

function renewSubscription() {
    showNotification('سيتم تفعيل تجديد الاشتراك قريباً', 'info');
}