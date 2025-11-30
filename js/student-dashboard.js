// إدارة لوحة تحكم الطالب
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.student-dashboard')) {
        initStudentDashboard();
    }
});

function initStudentDashboard() {
    // التحقق من تسجيل الدخول
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    loadStudentData();
    loadStudentVideos();
    setupStudentEventListeners();
}

function loadStudentData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // تحديث بيانات الطالب
    document.getElementById('studentName').textContent = currentUser.fullName;
    document.getElementById('studentGrade').textContent = `طالب - ${getGradeName(currentUser.grade)}`;
    
    // تحديث حالة الاشتراك
    const subscriptionStatus = document.getElementById('subscriptionStatus');
    if (currentUser.subscription.status === 'active') {
        subscriptionStatus.className = 'subscription-status active';
        subscriptionStatus.innerHTML = '<i class="fas fa-crown"></i> مشترك نشط';
    } else {
        subscriptionStatus.className = 'subscription-status inactive';
        subscriptionStatus.innerHTML = '<i class="fas fa-clock"></i> في انتظار التفعيل';
    }

    // رسالة ترحيب
    const welcomeMessage = document.getElementById('welcomeMessage');
    const hour = new Date().getHours();
    if (hour < 12) {
        welcomeMessage.textContent = 'صباح الخير!';
    } else if (hour < 18) {
        welcomeMessage.textContent = 'مساء الخير!';
    } else {
        welcomeMessage.textContent = 'مساء النور!';
    }

    // تحديث حالة الاشتراك في قسم الاشتراك
    updateSubscriptionInfo();
}

function loadStudentVideos() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allVideos = JSON.parse(localStorage.getItem('videos')) || [];
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};

    // تصفية الفيديوهات حسب مرحلة الطالب
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
    
    const inProgressVideos = Object.keys(userProgress).filter(videoId => 
        userProgress[videoId] > 0 && userProgress[videoId] < 100
    ).length;

    const overallProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

    // تحديث التقدم العام
    document.getElementById('overallProgress').style.width = `${overallProgress}%`;
    document.getElementById('progressStats').innerHTML = `
        <span>${overallProgress}% مكتمل</span>
        <span>${watchedVideos}/${totalVideos} فيديو</span>
    `;

    // تحديث الإحصائيات
    document.getElementById('watchedVideos').textContent = watchedVideos;
    document.getElementById('completionRate').textContent = `${overallProgress}%`;
    
    // حساب إجمالي الوقت (افتراضي 30 دقيقة لكل فيديو)
    const totalMinutes = watchedVideos * 30;
    document.getElementById('totalTime').textContent = `${totalMinutes} دقيقة`;

    // تحديث تفاصيل التقدم
    updateProgressDetails(videos, userProgress);
}

function updateProgressDetails(videos, userProgress) {
    const progressDetails = document.getElementById('progressDetails');
    if (!progressDetails) return;

    const detailsHTML = videos.map(video => {
        const progress = userProgress[video.id] || 0;
        const progressClass = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';
        
        return `
            <div class="progress-item ${progressClass}">
                <div class="progress-info">
                    <h4>${video.title}</h4>
                    <span>${progress === 100 ? 'مكتمل' : progress > 0 ? `قيد المشاهدة (${progress}%)` : 'لم يبدأ'}</span>
                </div>
                <div class="progress-bar small">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');

    progressDetails.innerHTML = detailsHTML;
}

function updateSubscriptionInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    document.getElementById('subStatus').textContent = 
        currentUser.subscription.status === 'active' ? 'نشط' : 'غير نشط';
    
    document.getElementById('subExpiry').textContent = 
        currentUser.subscription.endDate ? formatDate(currentUser.subscription.endDate) : 'غير محدد';
    
    document.getElementById('subPlan').textContent = 
        currentUser.subscription.plan || 'غير مشترك';
}

function playVideo(videoId) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        // تحديث واجهة الموديل
        document.getElementById('videoModalTitle').textContent = video.title;
        document.getElementById('videoModalDescription').textContent = video.description || 'لا يوجد وصف';
        document.getElementById('videoModalDuration').textContent = video.duration || 'غير محدد';
        document.getElementById('videoModalDate').textContent = formatDate(video.uploadDate);
        
        // فتح الموديل
        document.getElementById('videoModal').style.display = 'block';
        
        // تحديث التقدم
        updateVideoProgress(videoId, 100);
    }
}

function updateVideoProgress(videoId, progress) {
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    userProgress[videoId] = progress;
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
    
    // إعادة تحميل البيانات
    loadStudentVideos();
}

function closeVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
}

function filterVideos(filter) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // في التطبيق الحقيقي، سيتم تطبيق الفلتر
    loadStudentVideos();
}

function searchVideos(query) {
    // في التطبيق الحقيقي، سيتم تطبيق البحث
    console.log('بحث عن:', query);
}

function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إلغاء تفعيل جميع عناصر القائمة
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

function renewSubscription() {
    showNotification('سيتم تفعيل تجديد الاشتراك قريباً', 'info');
}

// دوال مساعدة
function getGradeName(grade) {
    const grades = {
        'first': 'أولى ثانوي',
        'second': 'ثانية ثانوي',
        'third': 'ثالثة ثانوي'
    };
    return grades[grade] || 'غير محدد';
}

function getGradeColor(grade) {
    const colors = {
        'first': '#4caf50, #81c784',
        'second': '#2196f3, #64b5f6',
        'third': '#ff9800, #ffb74d'
    };
    return colors[grade] || '#1a237e, #534bae';
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}