// storage.js - إدارة التخزين المحلي
class StorageManager {
    constructor() {
        this.init();
    }

    init() {
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