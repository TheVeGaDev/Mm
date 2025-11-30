// إدارة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.dashboard')) {
        // التحقق من صلاحيات الأدمن
        if (!checkPermission('admin')) {
            window.location.href = 'index.html';
            return;
        }
        
        initDashboard();
        loadDashboardData();
    }
});

// تحميل بيانات لوحة التحكم
function loadDashboardData() {
    loadStats();
    loadVideos();
    loadStudents();
}

// تحميل الإحصائيات
function loadStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    
    const totalStudents = users.filter(user => user.role === 'student').length;
    const activeSubscriptions = users.filter(user => 
        user.role === 'student' && user.subscription.status === 'active'
    ).length;
    const totalVideos = videos.length;
    
    // تحديث واجهة المستخدم
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('activeSubscriptions').textContent = activeSubscriptions;
    document.getElementById('totalVideos').textContent = totalVideos;
}

// تحميل الفيديوهات
function loadVideos() {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    displayVideos(videos);
}

function displayVideos(videos) {
    const videosGrid = document.getElementById('videosList');
    if (!videosGrid) return;
    
    if (videos.length === 0) {
        videosGrid.innerHTML = `
            <div class="no-content">
                <i class="fas fa-video-slash"></i>
                <p>لا توجد فيديوهات مرفوعة بعد</p>
            </div>
        `;
        return;
    }
    
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
                    <span>${getGradeName(video.grade)}</span>
                    ${video.views ? `<span><i class="fas fa-eye"></i> ${video.views} مشاهد</span>` : ''}
                </div>
                <div class="video-actions">
                    <button class="btn-action btn-edit" onclick="editVideo('${video.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteVideo('${video.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// تحميل الطلاب
function loadStudents() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const students = users.filter(user => user.role === 'student');
    displayStudents(students);
}

function displayStudents(students) {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;
    
    if (students.length === 0) {
        studentsList.innerHTML = `
            <div class="no-content">
                <i class="fas fa-users-slash"></i>
                <p>لا توجد طلاب مسجلين بعد</p>
            </div>
        `;
        return;
    }
    
    studentsList.innerHTML = students.map(student => `
        <div class="student-item">
            <div class="student-avatar">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="student-info">
                <h4>${student.fullName}</h4>
                <p>${student.email}</p>
                <span class="student-grade">${getGradeName(student.grade)}</span>
                <span class="subscription-status ${student.subscription.status}">
                    ${student.subscription.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </div>
            <div class="student-actions">
                <button class="btn-action" onclick="viewStudent('${student.id}')">
                    <i class="fas fa-eye"></i>
                    عرض
                </button>
            </div>
        </div>
    `).join('');
}

function getGradeName(grade) {
    const grades = {
        'first': 'أولى ثانوي',
        'second': 'ثانية ثانوي',
        'third': 'ثالثة ثانوي'
    };
    return grades[grade] || 'غير محدد';
}