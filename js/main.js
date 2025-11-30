// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // تهيئة القائمة المتنقلة
    initNavigation();
    
    // تهيئة تأثيرات التمرير
    initScrollEffects();
    
    // تهيئة المراحل التعليمية
    initGradeCards();
    
    // تهيئة النظام
    initTheme();
    
    // التحقق من حالة المصادقة
    checkAuthStatus();
}

// القائمة المتنقلة
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // إغلاق القائمة عند النقر على رابط
        document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
}

// تأثيرات التمرير
function initScrollEffects() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(el => observer.observe(el));
}

// كروت المراحل التعليمية
function initGradeCards() {
    const gradeCards = document.querySelectorAll('.grade-card');
    
    gradeCards.forEach(card => {
        card.addEventListener('click', function() {
            const grade = this.getAttribute('data-grade');
            selectGrade(grade);
        });
    });
}

// اختيار مرحلة تعليمية
function selectGrade(grade) {
    const gradeNames = {
        'first': 'أولى ثانوي',
        'second': 'ثانية ثانوي', 
        'third': 'ثالثة ثانوي'
    };
    
    // حفظ الاختيار
    localStorage.setItem('selectedGrade', grade);
    
    // فتح موديل التسجيل مع تعبئة المرحلة
    openRegisterModal();
    const gradeSelect = document.getElementById('grade');
    if (gradeSelect) {
        gradeSelect.value = grade;
    }
    
    // إشعار نجاح
    showNotification(`تم اختيار مرحلة ${gradeNames[grade]}`, 'success');
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنصراف إذا كان في لوحة التحكم
    if (window.location.pathname.includes('dashboard')) {
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // إضافة الأنيميشن
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#4caf50',
        'error': '#f44336', 
        'info': '#2196f3',
        'warning': '#ff9800'
    };
    return colors[type] || '#2196f3';
}

// النظام
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// التحكم في الفيديوهات
function playVideo(videoId) {
    // هنا سيتم دمج مشغل الفيديو
    showNotification('جاري تحميل الفيديو...', 'info');
}

// إدارة التقدم
function updateProgress(lessonId, progress) {
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    userProgress[lessonId] = progress;
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

function getProgress(lessonId) {
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    return userProgress[lessonId] || 0;
}

// فتح وإغلاق الموديلات
function openLoginModal() {
    closeRegisterModal();
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openRegisterModal() {
    closeLoginModal();
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

// إغلاق الموديلات بالنقر خارجها
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
});

// تسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProgress');
    window.location.href = 'index.html';
}

// التحقق من حالة تسجيل الدخول
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authButtons = document.querySelector('.auth-buttons');
    
    if (currentUser && authButtons) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <span>مرحباً، ${currentUser.fullName}</span>
                <button class="btn-logout" onclick="logout()">تسجيل الخروج</button>
            </div>
        `;
    }
}

// تحميل بيانات المستخدم في لوحة التحكم
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // تحديث الاسم في لوحة التحكم
        const studentName = document.getElementById('studentName');
        if (studentName) {
            studentName.textContent = currentUser.fullName;
        }
        
        // تحديث المرحلة التعليمية
        const userGrade = document.querySelector('.profile-section p');
        if (userGrade && currentUser.grade) {
            const gradeNames = {
                'first': 'أولى ثانوي',
                'second': 'ثانية ثانوي',
                'third': 'ثالثة ثانوي'
            };
            userGrade.textContent = `طالب - ${gradeNames[currentUser.grade]}`;
        }
    }
}

// تهيئة لوحة التحكم
function initDashboard() {
    loadUserData();
    
    // تهيئة التنقل في لوحة التحكم
    const navItems = document.querySelectorAll('.dashboard-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // إخفاء جميع الأقسام
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // إظهار القسم المحدد
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}