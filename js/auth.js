// ملف محسن: enhanced-auth.js
// auth.js محسن مع ميزات إضافية
document.addEventListener('DOMContentLoaded', function() {
    initEnhancedAuth();
});

function initEnhancedAuth() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    // تحسين تجربة المستخدم في النماذج
    initFormEnhancements();
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleRegistration(this);
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin(this);
        });
    }
}

async function handleRegistration(form) {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        studentPhone: document.getElementById('studentPhone').value,
        parentPhone: document.getElementById('parentPhone').value,
        grade: document.getElementById('grade').value,
        role: 'student'
    };
    
    // التحقق من صحة البيانات
    const validation = validateEnhancedRegistration(formData);
    if (!validation.isValid) {
        enhancedNotifications.showEnhancedNotification(validation.message, 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="btn-loading"></div>';
    submitButton.disabled = true;
    
    try {
        await registerUserEnhanced(formData);
        enhancedNotifications.showEnhancedNotification('تم إنشاء الحساب بنجاح!', 'success', {
            title: 'مرحباً!',
            action: {
                text: 'ابدأ التعلم',
                handler: 'closeRegisterModal()'
            }
        });
        
        closeRegisterModal();
        
        // تسجيل الدخول تلقائياً
        await loginUserEnhanced({ email: formData.email, password: formData.password });
        
    } catch (error) {
        enhancedNotifications.showEnhancedNotification(error.message, 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

async function handleLogin(form) {
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    // التحقق من الحساب المقفل
    const lockStatus = securityManager.isAccountLocked(formData.email);
    if (lockStatus.locked) {
        enhancedNotifications.showEnhancedNotification(lockStatus.message, 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="btn-loading"></div>';
    submitButton.disabled = true;
    
    try {
        await loginUserEnhanced(formData);
        enhancedNotifications.showEnhancedNotification('تم تسجيل الدخول بنجاح!', 'success');
        closeLoginModal();
        
    } catch (error) {
        securityManager.logFailedAttempt(formData.email);
        enhancedNotifications.showEnhancedNotification(error.message, 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function validateEnhancedRegistration(data) {
    // التحقق الأساسي
    if (!data.fullName.trim()) {
        return { isValid: false, message: 'الرجاء إدخال الاسم الكامل' };
    }
    
    if (!securityManager.validateEmail(data.email)) {
        return { isValid: false, message: 'الرجاء إدخال بريد إلكتروني صحيح' };
    }
    
    const passwordValidation = securityManager.validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
        return { isValid: false, message: passwordValidation.message };
    }
    
    if (!securityManager.validateEgyptianPhone(data.studentPhone)) {
        return { isValid: false, message: 'رقم هاتف الطالب غير صحيح' };
    }
    
    if (!securityManager.validateEgyptianPhone(data.parentPhone)) {
        return { isValid: false, message: 'رقم هاتف ولي الأمر غير صحيح' };
    }
    
    if (!data.grade) {
        return { isValid: false, message: 'الرجاء اختيار المرحلة التعليمية' };
    }
    
    return { isValid: true };
}

async function registerUserEnhanced(userData) {
    const users = storage.getUsers();
    
    // التحقق من عدم وجود مستخدم بنفس البريد
    if (users.find(user => user.email === userData.email)) {
        throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
    }
    
    // تشفير كلمة المرور
    const hashedPassword = securityManager.hashPassword(userData.password);
    
    // إنشاء المستخدم
    const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...userData,
        password: hashedPassword, // تخزين النسخة المشفرة
        createdAt: new Date().toISOString(),
        subscription: {
            status: 'inactive',
            plan: null,
            startDate: null,
            endDate: null,
            features: []
        },
        profile: {
            avatar: null,
            bio: '',
            preferences: {}
        },
        lastLogin: null,
        loginCount: 0
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // إرسال إشعار ترحيبي
    if (typeof notificationSystem !== 'undefined') {
        notificationSystem.sendNotification(
            newUser.id,
            'مرحباً بك في THE MASTER!',
            'نحن سعداء بانضمامك إلى عائلتنا التعليمية. ابدأ رحلتك الآن!',
            'info',
            'student-dashboard.html'
        );
    }
    
    return newUser;
}

async function loginUserEnhanced(credentials) {
    const users = storage.getUsers();
    const hashedPassword = securityManager.hashPassword(credentials.password);
    const user = users.find(u => u.email === credentials.email && u.password === hashedPassword);
    
    if (user) {
        // تحديث إحصائيات الدخول
        user.lastLogin = new Date().toISOString();
        user.loginCount = (user.loginCount || 0) + 1;
        storage.saveUser(user);
        
        // إعادة تعيين محاولات الدخول الفاشلة
        securityManager.resetFailedAttempts(credentials.email);
        
        // حفظ المستخدم الحالي
        storage.setCurrentUser(user);
        
        // إعادة التوجيه بعد تأخير قصير
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'student-dashboard.html';
            }
        }, 1000);
        
    } else {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
}

function initFormEnhancements() {
    // التحقق في الوقت الحقيقي
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const validation = securityManager.validatePasswordStrength(this.value);
            const feedback = document.getElementById('passwordFeedback');
            
            if (!feedback) {
                const feedbackEl = document.createElement('div');
                feedbackEl.id = 'passwordFeedback';
                feedbackEl.className = 'form-feedback';
                this.parentNode.appendChild(feedbackEl);
            }
            
            const feedbackEl = document.getElementById('passwordFeedback');
            if (this.value.length > 0) {
                if (validation.isValid) {
                    feedbackEl.textContent = 'كلمة مرور قوية';
                    feedbackEl.className = 'form-feedback valid';
                } else {
                    feedbackEl.textContent = validation.message;
                    feedbackEl.className = 'form-feedback invalid';
                }
            } else {
                feedbackEl.textContent = '';
            }
        });
    }
}