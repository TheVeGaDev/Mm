// storage.js - إدارة التخزين المحلي
class StorageManager {
    constructor() {
        this.init();
    }

    init() {
        // تهيئة الهياكل الأساسية إذا لم تكن موجودة
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('videos')) {
            localStorage.setItem('videos', JSON.stringify([]));
        }
        if (!localStorage.getItem('subscriptions')) {
            localStorage.setItem('subscriptions', JSON.stringify([]));
        }
        if (!localStorage.getItem('payments')) {
            localStorage.setItem('payments', JSON.stringify([]));
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

    // تحديث تقدم الطالب
    updateStudentProgress(studentId, videoId, progress) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === studentId);
        
        if (userIndex >= 0) {
            if (!users[userIndex].progress) {
                users[userIndex].progress = {};
            }
            users[userIndex].progress[videoId] = progress;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// إنشاء نسخة عامة
const storage = new StorageManager();