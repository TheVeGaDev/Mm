// notifications.js - إدارة الإشعارات
class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    }

    // إرسال إشعار للمستخدم
    sendNotification(userId, title, message, type = 'info', link = null) {
        const notification = {
            id: 'notif_' + Date.now(),
            userId: userId,
            title: title,
            message: message,
            type: type,
            link: link,
            read: false,
            createdAt: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        
        // إظهار إشعار فوري إذا كان المستخدم متصل
        if (this.isUserOnline(userId)) {
            this.showInstantNotification(notification);
        }
        
        return notification;
    }

    // إرسال إشعار جماعي
    sendBulkNotification(userIds, title, message, type = 'info') {
        userIds.forEach(userId => {
            this.sendNotification(userId, title, message, type);
        });
    }

    // إرسال إشعار لجميع الطلاب في مرحلة معينة
    sendNotificationToGrade(grade, title, message, type = 'info') {
        const students = storage.getStudentsByGrade(grade);
        const studentIds = students.map(student => student.id);
        this.sendBulkNotification(studentIds, title, message, type);
    }

    // الحصول على إشعارات المستخدم
    getUserNotifications(userId, unreadOnly = false) {
        let userNotifications = this.notifications.filter(notif => notif.userId === userId);
        
        if (unreadOnly) {
            userNotifications = userNotifications.filter(notif => !notif.read);
        }
        
        return userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // تعليم الإشعار كمقروء
    markAsRead(notificationId) {
        const notificationIndex = this.notifications.findIndex(notif => notif.id === notificationId);
        if (notificationIndex >= 0) {
            this.notifications[notificationIndex].read = true;
            this.saveNotifications();
        }
    }

    // تعليم جميع إشعارات المستخدم كمقروءة
    markAllAsRead(userId) {
        this.notifications.forEach(notif => {
            if (notif.userId === userId) {
                notif.read = true;
            }
        });
        this.saveNotifications();
    }

    // الحصول على عدد الإشعارات غير المقروءة
    getUnreadCount(userId) {
        return this.getUserNotifications(userId, true).length;
    }

    // حذف إشعار
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(notif => notif.id !== notificationId);
        this.saveNotifications();
    }

    // إظهار إشعار فوري
    showInstantNotification(notification) {
        // استخدام نظام الإشعارات الموجود في main.js
        if (typeof showNotification === 'function') {
            showNotification(notification.message, notification.type);
        }
    }

    // التحقق إذا كان المستخدم متصل
    isUserOnline(userId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return currentUser && currentUser.id === userId;
    }

    // حفظ الإشعارات
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // إنشاء إشعارات تلقائية
    createAutomaticNotifications() {
        // إشعار تجديد الاشتراك (قبل 7 أيام من الانتهاء)
        this.createRenewalReminders();
        
        // إشعار فيديو جديد
        this.createNewVideoNotifications();
    }

    // إنشاء تذكير بتجديد الاشتراك
    createRenewalReminders() {
        const users = storage.getUsers();
        const now = new Date();
        
        users.forEach(user => {
            if (user.role === 'student' && user.subscription.status === 'active') {
                const endDate = new Date(user.subscription.endDate);
                const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysLeft === 7) {
                    this.sendNotification(
                        user.id,
                        'تذكير بتجديد الاشتراك',
                        `ينتهي اشتراكك بعد ${daysLeft} أيام. قم بالتجديد الآن للحفاظ على الوصول للدورات.`,
                        'warning',
                        'subscription.html'
                    );
                } else if (daysLeft === 3) {
                    this.sendNotification(
                        user.id,
                        'اشتراكك على وشك الانتهاء',
                        `ينتهي اشتراكك بعد ${daysLeft} أيام فقط! قم بالتجديد الآن.`,
                        'error',
                        'subscription.html'
                    );
                }
            }
        });
    }

    // إنشاء إشعارات لفيديوهات جديدة
    createNewVideoNotifications() {
        // يمكن تنفيذ هذا عند رفع فيديو جديد
    }
}

// إنشاء نسخة عامة
const notificationSystem = new NotificationSystem();