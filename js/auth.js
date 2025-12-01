// auth.js - نظام المصادقة
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

function initAuth() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleRegistration(e) {
    e.preventDefault();
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        studentPhone: document.getElementById('studentPhone').value,
        parentPhone: document.getElementById('parentPhone').value,
        grade: document.getElementById('grade').value
    };
    
    registerUser(formData);
}

function handleLogin(e) {
    e.preventDefault();
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    loginUser(formData);
}

function registerUser(userData) {
    // التحقق من صحة البيانات
    if (!userData.fullName || !userData.email || !userData.password || !userData.studentPhone || !userData.parentPhone || !userData.grade) {
        showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
        return false;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'error');
        return false;
    }

    // التحقق من قوة كلمة المرور
    if (userData.password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return false;
    }

    const users = storage.getUsers();
    
    // التحقق من عدم وجود مستخدم بنفس البريد
    if (users.find(user => user.email === userData.email)) {
        showNotification('هذا البريد الإلكتروني مسجل بالفعل', 'error');
        return false;
    }
    
    const newUser = {
        id: 'user_' + Date.now(),
        ...userData,
        role: 'student',
        createdAt: new Date().toISOString(),
        subscription: {
            status: 'inactive',
            plan: null,
            startDate: null,
            endDate: null,
            features: []
        }
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('تم تسجيل مستخدم جديد:', newUser);
    showNotification('تم إنشاء الحساب بنجاح!', 'success');
    closeRegisterModal();
    
    // تسجيل الدخول تلقائياً
    setTimeout(() => {
        loginUser({ email: userData.email, password: userData.password });
    }, 1000);
    
    return true;
}

function loginUser(credentials) {
    const users = storage.getUsers();
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (user) {
        storage.setCurrentUser(user);
        showNotification('تم تسجيل الدخول بنجاح!', 'success');
        closeLoginModal();
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'student-dashboard.html';
            }
        }, 1500);
    } else {
        showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    }
}

// دوال فتح وإغلاق الموديلات
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