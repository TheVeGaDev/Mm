// storage.js - إدارة التخزين المحلي
class StorageManager {
    constructor() {
        this.init();
    }

    init() {
        // إنشاء مستخدم الأدمن الافتراضي إذا لم يكن موجوداً
        this.createDefaultAdmin();
        
        // تهيئة الهياكل الأساسية إذا لم تكن موجودة
        const structures = {
            'users': [],
            'videos': [],
            'subscriptions': [],
            'payments': [],
            'notifications': [],
            'userProgress': {}
        };

        for (const [key, defaultValue] of Object.entries(structures)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaultValue));
            }
        }
    }

    createDefaultAdmin() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const adminExists = users.find(user => user.role === 'admin');
        
        if (!adminExists) {
            const defaultAdmin = {
                id: 'admin_001',
                fullName: 'مدير النظام',
                email: 'admin@themaster.com',
                password: 'admin123', // في التطبيق الحقيقي يجب تشفير كلمة المرور
                role: 'admin',
                createdAt: new Date().toISOString(),
                subscription: {
                    status: 'active',
                    plan: 'premium',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    features: ['جميع الصلاحيات']
                },
                phone: '01000000000'
            };
            
            users.push(defaultAdmin);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ تم إنشاء مستخدم الأدمن الافتراضي');
        }
    }

    // إدارة المستخدمين
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    saveUser(user) {
        const users = this.getUsers();
        const existingIndex = users.findIndex(u => u.id === user.id);
        
        if (existingIndex >= 0) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    deleteUser(userId) {
        const users = this.getUsers();
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    // إدارة الفيديوهات
    getVideos() {
        return JSON.parse(localStorage.getItem('videos')) || [];
    }

    saveVideo(video) {
        const videos = this.getVideos();
        const existingIndex = videos.findIndex(v => v.id === video.id);
        
        if (existingIndex >= 0) {
            videos[existingIndex] = video;
        } else {
            videos.push(video);
        }
        
        localStorage.setItem('videos', JSON.stringify(videos));
        return video;
    }

    deleteVideo(videoId) {
        const videos = this.getVideos();
        const filteredVideos = videos.filter(v => v.id !== videoId);
        localStorage.setItem('videos', JSON.stringify(filteredVideos));
    }

    // إدارة الاشتراكات
    getSubscriptions() {
        return JSON.parse(localStorage.getItem('subscriptions')) || [];
    }

    saveSubscription(subscription) {
        const subscriptions = this.getSubscriptions();
        const existingIndex = subscriptions.findIndex(s => s.id === subscription.id);
        
        if (existingIndex >= 0) {
            subscriptions[existingIndex] = subscription;
        } else {
            subscriptions.push(subscription);
        }
        
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        return subscription;
    }

    // إدارة المدفوعات
    getPayments() {
        return JSON.parse(localStorage.getItem('payments')) || [];
    }

    savePayment(payment) {
        const payments = this.getPayments();
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
        return payment;
    }

    // إدارة التقدم
    getUserProgress() {
        return JSON.parse(localStorage.getItem('userProgress')) || {};
    }

    saveUserProgress(progress) {
        localStorage.setItem('userProgress', JSON.stringify(progress));
    }

    updateVideoProgress(userId, videoId, progress) {
        const userProgress = this.getUserProgress();
        if (!userProgress[userId]) {
            userProgress[userId] = {};
        }
        userProgress[userId][videoId] = progress;
        this.saveUserProgress(userProgress);
    }

    // الحصول على فيديوهات حسب المرحلة
    getVideosByGrade(grade) {
        const videos = this.getVideos();
        return videos.filter(video => video.grade === grade);
    }

    // الحصول على طلاب حسب المرحلة
    getStudentsByGrade(grade) {
        const users = this.getUsers();
        return users.filter(user => user.role === 'student' && user.grade === grade);
    }

    // البحث عن المستخدم الحالي
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    // حفظ المستخدم الحالي
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // تنظيف البيانات (للتطوير)
    clearAll() {
        const keys = ['users', 'videos', 'subscriptions', 'payments', 'notifications', 'userProgress', 'currentUser'];
        keys.forEach(key => localStorage.removeItem(key));
        this.init();
    }
}

// إنشاء نسخة عامة
const storage = new StorageManager();

// إضافة دوال مساعدة مفقودة
function getGradeName(grade) {
    const grades = {
        'first': 'أولى ثانوي',
        'second': 'ثانية ثانوي',
        'third': 'ثالثة ثانوي'
    };
    return grades[grade] || 'غير محدد';
}

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