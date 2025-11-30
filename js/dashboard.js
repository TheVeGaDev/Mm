// إدارة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.dashboard')) {
        initDashboard();
        loadDashboardData();
    }
});

// تحميل بيانات لوحة التحكم
function loadDashboardData() {
    // تحميل الإحصائيات
    loadStats();
    
    // تحميل الفيديوهات
    loadVideos();
    
    // تحميل الإشعارات
    loadNotifications();
}

// تحميل الإحصائيات
function loadStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser && currentUser.role === 'teacher') {
        // إحصائيات المدرس
        const activeStudents = users.filter(user => 
            user.role === 'student' && 
            user.subscription.status === 'active'
        ).length;
        
        const totalVideos = 500; // سيتم جلبها من قاعدة البيانات
        const monthlyRevenue = 50000; // سيتم جلبها من قاعدة البيانات
        
        // تحديث واجهة المستخدم
        updateStatsUI(activeStudents, totalVideos, monthlyRevenue);
    } else if (currentUser) {
        // إحصائيات الطالب
        const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
        const completedLessons = Object.values(userProgress).filter(progress => progress === 100).length;
        const totalLessons = 20; // إجمالي الدروس
        
        updateStudentStats(completedLessons, totalLessons);
    }
}

function updateStatsUI(students, videos, revenue) {
    const studentsElement = document.querySelector('.stat-card.students h3');
    const videosElement = document.querySelector('.stat-card.courses h3');
    const revenueElement = document.querySelector('.stat-card.revenue h3');
    
    if (studentsElement) studentsElement.textContent = students.toLocaleString();
    if (videosElement) videosElement.textContent = videos.toLocaleString() + '+';
    if (revenueElement) revenueElement.textContent = revenue.toLocaleString() + ' ج.م';
}

function updateStudentStats(completed, total) {
    const progressElement = document.querySelector('.progress');
    const progressStats = document.querySelector('.progress-stats');
    
    if (progressElement) {
        const percentage = (completed / total) * 100;
        progressElement.style.width = `${percentage}%`;
    }
    
    if (progressStats) {
        progressStats.innerHTML = `
            <span>${Math.round((completed / total) * 100)}% مكتمل</span>
            <span>${completed}/${total} درس</span>
        `;
    }
}

// تحميل الفيديوهات
function loadVideos() {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    
    if (videos.length === 0) {
        // بيانات تجريبية
        const sampleVideos = [
            {
                id: 1,
                title: 'القواعد الأساسية - أولى ثانوي',
                description: 'شرح شامل للقواعد الأساسية في اللغة الإنجليزية',
                grade: 'first',
                duration: '25:15',
                views: 250,
                comments: 15,
                progress: 100
            },
            {
                id: 2,
                title: 'الزمن الماضي - ثانية ثانوي',
                description: 'فهم واستخدام الزمن الماضي بأنواعه',
                grade: 'second', 
                duration: '30:45',
                views: 380,
                comments: 22,
                progress: 0
            }
        ];
        localStorage.setItem('videos', JSON.stringify(sampleVideos));
        videos = sampleVideos;
    }
    
    displayVideos(videos);
}

function displayVideos(videos) {
    const videosGrid = document.querySelector('.videos-grid');
    if (!videosGrid) return;
    
    videosGrid.innerHTML = videos.map(video => `
        <div class="video-item">
            <div class="video-thumbnail">
                <i class="fas fa-play-circle"></i>
                ${video.duration ? `<div class="video-duration">${video.duration}</div>` : ''}
            </div>
            <div class="video-info">
                <h4 class="video-title">${video.title}</h4>
                ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                <div class="video-meta">
                    <span><i class="fas fa-eye"></i> ${video.views} مشاهد</span>
                    ${video.comments ? `<span><i class="fas fa-comment"></i> ${video.comments} تعليق</span>` : ''}
                </div>
                ${typeof video.progress !== 'undefined' ? `
                    <div class="video-progress">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${video.progress}%"></div>
                        </div>
                        <span>${video.progress === 100 ? 'مكتمل' : video.progress === 0 ? 'غير مشاهد' : 'قيد المشاهدة'}</span>
                    </div>
                ` : ''}
                ${document.querySelector('.teacher-dashboard') ? `
                    <div class="video-actions">
                        <button class="btn-action btn-edit" onclick="editVideo(${video.id})">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteVideo(${video.id})">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// تحميل الإشعارات
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    if (notifications.length === 0) {
        // إشعارات تجريبية
        const sampleNotifications = [
            {
                id: 1,
                type: 'info',
                title: 'طالب جديد',
                message: 'طالب جديد انضم إلى دورة ثالثة ثانوي',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                important: false
            },
            {
                id: 2, 
                type: 'payment',
                title: 'تجديد اشتراك',
                message: 'تم تجديد اشتراك أحمد محمد بنجاح',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                important: false
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
        notifications = sampleNotifications;
    }
    
    displayNotifications(notifications);
}

function displayNotifications(notifications) {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.important ? 'important' : ''}">
            <div class="notification-icon">
                <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                ${notification.title ? `<h4>${notification.title}</h4>` : ''}
                <p>${notification.message}</p>
                <span>${formatTime(notification.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
        return `منذ ${hours} ساعة`;
    } else {
        return `منذ ${days} يوم`;
    }
}

// إدارة الفيديوهات للمدرس
function openUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

function editVideo(videoId) {
    // تحرير الفيديو
    showNotification('فتح نموذج تحرير الفيديو', 'info');
}

function deleteVideo(videoId) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        const updatedVideos = videos.filter(video => video.id !== videoId);
        localStorage.setItem('videos', JSON.stringify(updatedVideos));
        displayVideos(updatedVideos);
        showNotification('تم حذف الفيديو بنجاح', 'success');
    }
}

// إرسال إشعارات
function sendNotification() {
    const message = prompt('أدخل نص الإشعار:');
    if (message) {
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        const newNotification = {
            id: generateId(),
            type: 'info',
            title: 'إشعار جديد',
            message: message,
            timestamp: new Date().toISOString(),
            important: true
        };
        notifications.unshift(newNotification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        displayNotifications(notifications);
        showNotification('تم إرسال الإشعار بنجاح', 'success');
    }
}

// تصفية الفيديوهات
function filterVideos(filter) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    let filteredVideos = videos;
    
    switch(filter) {
        case 'unwatched':
            filteredVideos = videos.filter(video => video.progress === 0);
            break;
        case 'completed':
            filteredVideos = videos.filter(video => video.progress === 100);
            break;
    }
    
    displayVideos(filteredVideos);
}

// إغلاق الموديلات في لوحة التحكم
window.addEventListener('click', function(event) {
    const uploadModal = document.getElementById('uploadModal');
    if (event.target === uploadModal) {
        closeUploadModal();
    }
});