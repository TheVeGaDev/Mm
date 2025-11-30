<!-- ملف جديد: security.js -->
<script>
// security.js - تحسينات الأمان والتحقق
class SecurityManager {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 دقيقة
    }

    // تشفير بسيط لكلمات المرور (في تطبيق حقيقي نستخدم backend)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    // التحقق من قوة كلمة المرور
    validatePasswordStrength(password) {
        const requirements = {
            minLength: 6,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const strength = Object.values(requirements).filter(Boolean).length;
        
        if (password.length < requirements.minLength) {
            return { isValid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        if (strength < 3) {
            return { 
                isValid: false, 
                message: 'كلمة المرور ضعيفة. يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام' 
            };
        }

        return { isValid: true, strength: strength };
    }

    // منع هجمات XSS
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // التحقق من البريد الإلكتروني
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // التحقق من رقم الهاتف المصري
    validateEgyptianPhone(phone) {
        const re = /^01[0-2,5]{1}[0-9]{8}$/;
        return re.test(phone);
    }

    // تسجيل محاولات الدخول الفاشلة
    logFailedAttempt(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
        
        if (!attempts[email]) {
            attempts[email] = {
                count: 1,
                lastAttempt: Date.now(),
                locked: false
            };
        } else {
            attempts[email].count++;
            attempts[email].lastAttempt = Date.now();
            
            if (attempts[email].count >= this.maxLoginAttempts) {
                attempts[email].locked = true;
                setTimeout(() => {
                    this.unlockAccount(email);
                }, this.lockoutTime);
            }
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    // فتح الحساب بعد انتهاء المدة
    unlockAccount(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
        if (attempts[email]) {
            attempts[email] = {
                count: 0,
                lastAttempt: Date.now(),
                locked: false
            };
            localStorage.setItem('loginAttempts', JSON.stringify(attempts));
        }
    }

    // التحقق إذا كان الحساب مقفل
    isAccountLocked(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
        const attempt = attempts[email];
        
        if (attempt && attempt.locked) {
            const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
            if (timeSinceLastAttempt < this.lockoutTime) {
                const remainingTime = Math.ceil((this.lockoutTime - timeSinceLastAttempt) / 60000);
                return {
                    locked: true,
                    message: `الحساب مقفل مؤقتاً. حاول مرة أخرى بعد ${remainingTime} دقيقة`
                };
            } else {
                this.unlockAccount(email);
            }
        }
        
        return { locked: false };
    }

    // إعادة تعيين محاولات الدخول الناجحة
    resetFailedAttempts(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
        if (attempts[email]) {
            attempts[email] = {
                count: 0,
                lastAttempt: Date.now(),
                locked: false
            };
            localStorage.setItem('loginAttempts', JSON.stringify(attempts));
        }
    }
}

const securityManager = new SecurityManager();
</script>