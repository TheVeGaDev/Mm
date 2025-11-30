// main.js - الدوال الأساسية للتطبيق
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
    
    // التحقق من حالة المصادقة
    checkAuthStatus();
    
    // تهيئة الموديلات
    initModals();
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
    // إضافة كلاس للعناصر التي تظهر عند التمرير
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, observerOptions);

    // مراقبة جميع العناصر التي تحتوي على كلاس fade-in
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// كروت المراحل التعليمية
function initGradeCards() {
    const gradeCards = document.querySelectorAll('.grade-card');
    
    gradeCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // منع التنشيط عند النقر على الزر مباشرة
            if (e.target.classList.contains('card-btn')) return;
            
            this.classList.toggle('flipped');
        });
    });
}

// تهيئة الموديلات
function initModals() {
    // إغلاق الموديلات بالنقر خارجها
    window.addEventListener('click', function(event) {
        const modals = ['loginModal', 'registerModal', 'uploadModal', 'addAdminModal', 'editVideoModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && event.target === modal) {
                modal.style.display = 'none';
            }
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

// التمرير إلى قسم الدورات
function scrollToCourses() {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
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

// تسجيل الخروج
function logout() {
    storage.setCurrentUser(null);
    window.location.href = 'index.html';
}

// التحقق من حالة تسجيل الدخول
function checkAuthStatus() {
    const currentUser = storage.getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    
    if (currentUser && authButtons) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <span>مرحباً، ${currentUser.fullName}</span>
                <div class="user-dropdown">
                    <button class="btn-profile" onclick="goToDashboard()">
                        <i class="fas fa-tachometer-alt"></i>
                        لوحة التحكم
                    </button>
                    <button class="btn-logout" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        `;
    }
}

// الذهاب إلى لوحة التحكم المناسبة
function goToDashboard() {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    }
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الأنيميشن
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 300px;
        max-width: 90vw;
        transition: all 0.3s ease;
    `;
    
    // إضافة زر الإغلاق
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.2rem;
        margin-right: auto;
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // إخفاء الإشعار تلقائياً بعد 5 ثوان (ما عدا الأخطاء)
    if (type !== 'error') {
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(-50%) translateY(-100px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    return notification;
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

// دوال مساعدة
function getGradeName(grade) {
    const grades = {
        'first': 'أولى ثانوي',
        'second': 'ثانية ثانوي',
        'third': 'ثالثة ثانوي'
    };
    return grades[grade] || 'غير محدد';
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

// التحقق من الصلاحيات
function checkPermission(requiredRole) {
    const currentUser = storage.getCurrentUser();
    return currentUser && currentUser.role === requiredRole;
}