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
        setupEventListeners();
    }
});

function initDashboard() {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
        document.getElementById('adminName').textContent = currentUser.fullName;
    }
}

function setupEventListeners() {
    // إضافة مستخدم جديد (أدمن)
    const addAdminForm = document.getElementById('addAdminForm');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewAdmin();
        });
    }
}

// تحميل بيانات لوحة التحكم
function loadDashboardData() {
    loadStats();
    loadVideos();
    loadStudents();
    loadAdmins();
}

// تحميل الإحصائيات
function loadStats() {
    const users = storage.getUsers();
    const videos = storage.getVideos();
    
    const totalStudents = users.filter(user => user.role === 'student').length;
    const activeSubscriptions = users.filter(user => 
        user.role === 'student' && user.subscription && user.subscription.status === 'active'
    ).length;
    const totalVideos = videos.length;
    const totalAdmins = users.filter(user => user.role === 'admin').length;
    
    // تحديث واجهة المستخدم
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('activeSubscriptions').textContent = activeSubscriptions;
    document.getElementById('totalVideos').textContent = totalVideos;
    document.getElementById('totalAdmins').textContent = totalAdmins;
}

// تحميل الفيديوهات
function loadVideos() {
    const videos = storage.getVideos();
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
            <div class="video-thumbnail" style="background: linear-gradient(135deg, ${getGradeColor(video.grade)})">
                <i class="fas fa-play-circle"></i>
                ${video.duration ? `<div class="video-duration">${video.duration}</div>` : ''}
            </div>
            <div class="video-info">
                <h4 class="video-title">${video.title}</h4>
                ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                <div class="video-meta">
                    <span class="grade-badge ${video.grade}">${getGradeName(video.grade)}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(video.uploadDate)}</span>
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
    const users = storage.getUsers();
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
                <div class="student-details">
                    <span class="student-grade">${getGradeName(student.grade)}</span>
                    <span class="subscription-status ${student.subscription?.status || 'inactive'}">
                        ${student.subscription?.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </div>
                <small>مسجل منذ: ${formatDate(student.createdAt)}</small>
            </div>
            <div class="student-actions">
                <button class="btn-action btn-edit" onclick="toggleSubscription('${student.id}')">
                    <i class="fas ${student.subscription?.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                    ${student.subscription?.status === 'active' ? 'إيقاف' : 'تفعيل'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>
    `).join('');
}

// تحميل الأدمنز
function loadAdmins() {
    const users = storage.getUsers();
    const admins = users.filter(user => user.role === 'admin');
    displayAdmins(admins);
}

function displayAdmins(admins) {
    const adminsList = document.getElementById('adminsList');
    if (!adminsList) return;
    
    adminsList.innerHTML = admins.map(admin => `
        <div class="admin-item">
            <div class="admin-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="admin-info">
                <h4>${admin.fullName}</h4>
                <p>${admin.email}</p>
                <small>مسجل منذ: ${formatDate(admin.createdAt)}</small>
            </div>
            ${admin.id !== storage.getCurrentUser().id ? `
            <div class="admin-actions">
                <button class="btn-action btn-delete" onclick="deleteAdmin('${admin.id}')">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
            ` : '<span class="current-user">أنت</span>'}
        </div>
    `).join('');
}

// إضافة أدمن جديد
function addNewAdmin() {
    const formData = {
        fullName: document.getElementById('adminName').value,
        email: document.getElementById('adminEmail').value,
        password: document.getElementById('adminPassword').value
    };
    
    if (!formData.fullName || !formData.email || !formData.password) {
        showNotification('الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    const users = storage.getUsers();
    
    // التحقق من عدم وجود مستخدم بنفس البريد
    if (users.find(user => user.email === formData.email)) {
        showNotification('هذا البريد الإلكتروني مسجل بالفعل', 'error');
        return;
    }
    
    const newAdmin = {
        id: 'admin_' + Date.now(),
        ...formData,
        role: 'admin',
        createdAt: new Date().toISOString(),
        subscription: { status: 'active' }
    };
    
    users.push(newAdmin);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('تم إضافة الأدمن بنجاح', 'success');
    document.getElementById('addAdminForm').reset();
    closeAddAdminModal();
    loadAdmins();
    loadStats();
}

// تفعيل/إيقاف اشتراك طالب
function toggleSubscription(studentId) {
    const users = storage.getUsers();
    const userIndex = users.findIndex(user => user.id === studentId);
    
    if (userIndex !== -1) {
        if (!users[userIndex].subscription) {
            users[userIndex].subscription = { status: 'inactive' };
        }
        
        users[userIndex].subscription.status = 
            users[userIndex].subscription.status === 'active' ? 'inactive' : 'active';
        
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('تم تحديث حالة الاشتراك', 'success');
        loadStudents();
        loadStats();
    }
}

// حذف طالب
function deleteStudent(studentId) {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        const users = storage.getUsers();
        const updatedUsers = users.filter(user => user.id !== studentId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        showNotification('تم حذف الطالب بنجاح', 'success');
        loadStudents();
        loadStats();
    }
}

// حذف أدمن
function deleteAdmin(adminId) {
    if (confirm('هل أنت متأكد من حذف هذا الأدمن؟')) {
        const users = storage.getUsers();
        const updatedUsers = users.filter(user => user.id !== adminId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        showNotification('تم حذف الأدمن بنجاح', 'success');
        loadAdmins();
        loadStats();
    }
}

// دوال مساعدة
function getGradeColor(grade) {
    const colors = {
        'first': '#4caf50, #81c784',
        'second': '#2196f3, #64b5f6',
        'third': '#ff9800, #ffb74d'
    };
    return colors[grade] || '#d32f2f, #f44336';
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

function openAddAdminModal() {
    document.getElementById('addAdminModal').style.display = 'block';
}

function closeAddAdminModal() {
    document.getElementById('addAdminModal').style.display = 'none';
}

function openUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}