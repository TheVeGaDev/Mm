<!-- ملف جديد: enhanced-notifications.js -->
<script>
// enhanced-notifications.js - نظام إشعارات محسن
class EnhancedNotificationSystem {
    constructor() {
        this.notificationContainer = null;
        this.initContainer();
    }

    // تهيئة حاوية الإشعارات
    initContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notifications-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.notificationContainer);
    }

    // إظهار إشعار محسن
    showEnhancedNotification(message, type = 'info', options = {}) {
        const {
            title = '',
            duration = type === 'error' ? 0 : 5000, // الأخطاء لا تختفي تلقائياً
            action = null,
            icon = null,
            progress = false
        } = options;

        const notificationId = 'notif_' + Date.now();
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `enhanced-notification ${type}`;
        
        const iconName = icon || this.getNotificationIcon(type);
        const iconColor = this.getNotificationColor(type);

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <i class="fas fa-${iconName}" style="color: ${iconColor}"></i>
                    <span>${title || this.getNotificationTitle(type)}</span>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <p>${message}</p>
            </div>
            ${progress ? '<div class="notification-progress"></div>' : ''}
            ${action ? `
                <div class="notification-actions">
                    <button class="btn-action" onclick="${action.handler}">
                        ${action.text}
                    </button>
                </div>
            ` : ''}
        `;

        this.notificationContainer.appendChild(notification);

        // إضافة أنيميشن الدخول
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // الإخفاء التلقائي
        if (duration > 0) {
            if (progress) {
                this.startProgressBar(notification, duration);
            } else {
                setTimeout(() => {
                    this.removeNotification(notificationId);
                }, duration);
            }
        }

        return notificationId;
    }

    // بدء شريط التقدم
    startProgressBar(notification, duration) {
        const progressBar = notification.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.animation = `progressShrink ${duration}ms linear`;
            
            progressBar.addEventListener('animationend', () => {
                this.removeNotification(notification.id);
            });
        }
    }

    // إزالة الإشعار
    removeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }

    // إشعار تأكيد
    showConfirmation(message, confirmText = 'تأكيد', cancelText = 'إلغاء') {
        return new Promise((resolve) => {
            const notificationId = this.showEnhancedNotification(message, 'warning', {
                title: 'تأكيد الإجراء',
                duration: 0,
                action: {
                    text: confirmText,
                    handler: `enhancedNotifications.confirmAction('${notificationId}', true)`
                }
            });

            const notification = document.getElementById(notificationId);
            const cancelButton = document.createElement('button');
            cancelButton.className = 'btn-cancel';
            cancelButton.textContent = cancelText;
            cancelButton.onclick = () => this.confirmAction(notificationId, false);
            
            const actionsContainer = notification.querySelector('.notification-actions');
            actionsContainer.appendChild(cancelButton);

            this.pendingConfirmations = this.pendingConfirmations || new Map();
            this.pendingConfirmations.set(notificationId, resolve);
        });
    }

    // تأكيد الإجراء
    confirmAction(notificationId, confirmed) {
        const resolve = this.pendingConfirmations?.get(notificationId);
        if (resolve) {
            resolve(confirmed);
            this.pendingConfirmations.delete(notificationId);
            this.removeNotification(notificationId);
        }
    }

    // إشعار بسيط
    toast(message, type = 'info', duration = 3000) {
        const toastId = 'toast_' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, duration);

        return toastId;
    }

    // دوال مساعدة
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle',
            'warning': 'exclamation-triangle',
            'upload': 'cloud-upload-alt',
            'download': 'cloud-download-alt'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#4caf50',
            'error': '#f44336',
            'info': '#2196f3',
            'warning': '#ff9800',
            'upload': '#9c27b0',
            'download': '#009688'
        };
        return colors[type] || '#2196f3';
    }

    getNotificationTitle(type) {
        const titles = {
            'success': 'تم بنجاح',
            'error': 'خطأ',
            'info': 'معلومة',
            'warning': 'تحذير',
            'upload': 'رفع الملف',
            'download': 'تحميل'
        };
        return titles[type] || 'إشعار';
    }
}

const enhancedNotifications = new EnhancedNotificationSystem();
</script>