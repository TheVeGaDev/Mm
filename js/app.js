// app.js - تهيئة التطبيق النهائية
class TheMasterApp {
    constructor() {
        this.init();
    }

    init() {
        // تهيئة جميع الأنظمة
        this.initStorage();
        this.initAuth();
        this.initSubscriptions();
        this.initNotifications();
        this.initUI();
    }

    initStorage() {
        // تم التهيئة تلقائياً في storage.js
        console.log('✅ نظام التخزين جاهز');
    }

    initAuth() {
        // التحقق من تسجيل الدخول
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            console.log(`✅ مستخدم مسجل: ${currentUser.fullName}`);
        }
    }

    initSubscriptions() {
        // التحقق من الاشتراكات المنتهية
        this.checkExpiredSubscriptions();
        console.log('✅ نظام الاشتراكات جاهز');
    }

    initNotifications() {
        // إنشاء الإشعارات التلقائية
        notificationSystem.createAutomaticNotifications();
        console.log('✅ نظام الإشعارات جاهز');
    }

    initUI() {
        // تهيئة واجهة المستخدم
        this.updateUserInterface();
        console.log('✅ واجهة المستخدم جاهزة');
    }

    checkExpiredSubscriptions() {
        const users = storage.getUsers();
        const now = new Date();
        let updated = false;

        users.forEach(user => {
            if (user.role === 'student' && user.subscription.status === 'active') {
                const endDate = new Date(user.subscription.endDate);
                if (now > endDate) {
                    user.subscription.status = 'expired';
                    updated = true;
                    
                    // إرسال إشعار انتهاء الاشتراك
                    notificationSystem.sendNotification(
                        user.id,
                        'انتهاء الاشتراك',
                        'انتهت مدة اشتراكك. قم بتجديده للاستمرار في الوصول للدورات.',
                        'error',
                        'subscription.html'
                    );
                }
            }
        });

        if (updated) {
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    updateUserInterface() {
        // تحديث واجهة المستخدم بناءً على حالة المستخدم
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const authButtons = document.querySelector('.auth-buttons');
        
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

    // إنشاء فيديو تجريبي
    createSampleVideos() {
        const existingVideos = storage.getVideos();
        if (existingVideos.length === 0) {
            const sampleVideos = [
                {
                    id: 'video_1',
                    title: 'المبتدئ في القواعد الإنجليزية',
                    description: 'شرح أساسيات القواعد الإنجليزية للمبتدئين',
                    grade: 'first',
                    duration: '15:30',
                    views: 0,
                    uploadDate: new Date().toISOString(),
                    fileName: 'beginner-grammar.mp4'
                },
                {
                    id: 'video_2',
                    title: 'تحليل النصوص الأدبية',
                    description: 'كيفية تحليل وفهم النصوص الأدبية المعقدة',
                    grade: 'second',
                    duration: '22:45',
                    views: 0,
                    uploadDate: new Date().toISOString(),
                    fileName: 'literary-analysis.mp4'
                },
                {
                    id: 'video_3',
                    title: 'إستراتيجيات امتحان الثانوية',
                    description: 'أفضل الطرق والاستراتيجيات لاجتياز امتحان الثانوية',
                    grade: 'third',
                    duration: '30:15',
                    views: 0,
                    uploadDate: new Date().toISOString(),
                    fileName: 'exam-strategies.mp4'
                }
            ];

            sampleVideos.forEach(video => {
                storage.saveVideo(video);
            });

            console.log('✅ تم إنشاء فيديوهات تجريبية');
        }
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    window.app = new TheMasterApp();
    
    // إنشاء فيديوهات تجريبية (للتجربة فقط)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.app.createSampleVideos();
    }
});

// دوال مساعدة إضافية
function goToDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    }
}

function startSubscription(planType) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'error');
        openLoginModal();
        return;
    }

    try {
        const payment = subscriptionManager.createPaymentOrder(currentUser.id, planType);
        window.location.href = `payment.html?paymentId=${payment.id}`;
    } catch (error) {
        showNotification(error.message, 'error');
    }
}