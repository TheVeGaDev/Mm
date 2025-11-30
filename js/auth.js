// إدارة المصادقة
let currentUser = null;

// نماذج المصادقة
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                studentPhone: document.getElementById('studentPhone').value,
                parentPhone: document.getElementById('parentPhone').value,
                grade: document.getElementById('grade').value,
                role: 'student' // دور افتراضي
            };
            
            if (validateRegistration(formData)) {
                registerUser(formData);
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };
            
            if (validateLogin(formData)) {
                loginUser(formData);
            }
        });
    }

    // إنشاء مستخدم أدمن افتراضي إذا لم يكن موجود
    createDefaultAdmin();
});

// إنشاء أدمن افتراضي
function createDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = users.find(user => user.role === 'admin');
    
    if (!adminExists) {
        const defaultAdmin = {
            id: 'admin_001',
            fullName: 'مدير النظام',
            email: 'admin@themaster.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString(),
            subscription: { status: 'active' }
        };
        users.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// التحقق من صحة البيانات
function validateRegistration(data) {
    if (!data.fullName.trim()) {
        showNotification('الرجاء إدخال الاسم الكامل', 'error');
        return false;
    }
    
    if (!validateEmail(data.email)) {
        showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'error');
        return false;
    }
    
    if (data.password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return false;
    }
    
    if (!validatePhone(data.studentPhone)) {
        showNotification('رقم هاتف الطالب غير صحيح', 'error');
        return false;
    }
    
    if (!validatePhone(data.parentPhone)) {
        showNotification('رقم هاتف ولي الأمر غير صحيح', 'error');
        return false;
    }
    
    if (!data.grade) {
        showNotification('الرجاء اختيار المرحلة التعليمية', 'error');
        return false;
    }
    
    return true;
}

function validateLogin(data) {
    if (!validateEmail(data.email)) {
        showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'error');
        return false;
    }
    
    if (!data.password) {
        showNotification('الرجاء إدخال كلمة المرور', 'error');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^01[0-2,5]{1}[0-9]{8}$/;
    return re.test(phone);
}

// تسجيل المستخدم
function registerUser(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    if (users.find(user => user.email === userData.email)) {
        showNotification('هذا البريد الإلكتروني مسجل بالفعل', 'error');
        return;
    }
    
    // إضافة المستخدم
    const newUser = {
        id: generateId(),
        ...userData,
        createdAt: new Date().toISOString(),
        subscription: {
            status: 'inactive',
            plan: null,
            startDate: null,
            endDate: null
        },
        progress: {}
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('تم إنشاء الحساب بنجاح!', 'success');
    closeRegisterModal();
    
    // تسجيل الدخول تلقائياً
    loginUser({ email: userData.email, password: userData.password });
}

// تسجيل الدخول
function loginUser(credentials) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showNotification(`مرحباً بعودتك، ${user.fullName}!`, 'success');
        closeLoginModal();
        
        // إعادة التوجيه إلى لوحة التحكم المناسبة
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

// إنشاء معرف فريد
function generateId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// التحقق من الصلاحيات
function checkPermission(requiredRole) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.role === requiredRole;
}

// التحقق من الاشتراك النشط
function checkSubscription() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.subscription && currentUser.subscription.status === 'active';
}