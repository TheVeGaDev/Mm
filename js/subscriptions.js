// subscriptions.js - إدارة الاشتراكات والمدفوعات
class SubscriptionManager {
    constructor() {
        this.plans = {
            basic: {
                name: "الباقة الأساسية",
                price: 500,
                duration: 30, // 30 يوم
                features: ["وصول كامل للفيديوهات", "دعم فني", "شهادة إنجاز"]
            },
            premium: {
                name: "الباقة المميزة",
                price: 800,
                duration: 90, // 90 يوم
                features: ["كل ميزات الباقة الأساسية", "جلسات مباشرة", "مراجعة إضافية"]
            }
        };
    }

    // إنشاء طلب دفع جديد
    createPaymentOrder(studentId, planType) {
        const plan = this.plans[planType];
        if (!plan) {
            throw new Error('نوع الباقة غير صحيح');
        }

        const paymentId = 'pay_' + Date.now();
        const payment = {
            id: paymentId,
            studentId: studentId,
            plan: planType,
            amount: plan.price,
            status: 'pending', // pending, completed, failed
            createdAt: new Date().toISOString(),
            paymentMethod: null,
            transactionId: null
        };

        storage.savePayment(payment);
        return payment;
    }

    // معالجة الدفع الناجح
    processSuccessfulPayment(paymentId, transactionId, paymentMethod = 'vodafone_cash') {
        const payments = storage.getPayments();
        const paymentIndex = payments.findIndex(p => p.id === paymentId);
        
        if (paymentIndex >= 0) {
            payments[paymentIndex].status = 'completed';
            payments[paymentIndex].transactionId = transactionId;
            payments[paymentIndex].paymentMethod = paymentMethod;
            payments[paymentIndex].completedAt = new Date().toISOString();
            
            localStorage.setItem('payments', JSON.stringify(payments));
            
            // تفعيل الاشتراك
            this.activateSubscription(payments[paymentIndex].studentId, payments[paymentIndex].plan);
            
            return payments[paymentIndex];
        }
        
        throw new Error('الدفعة غير موجودة');
    }

    // تفعيل الاشتراك
    activateSubscription(studentId, planType) {
        const plan = this.plans[planType];
        const users = storage.getUsers();
        const userIndex = users.findIndex(u => u.id === studentId);
        
        if (userIndex >= 0) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.duration);
            
            users[userIndex].subscription = {
                status: 'active',
                plan: planType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                features: plan.features
            };
            
            localStorage.setItem('users', JSON.stringify(users));
            
            // إنشاء سجل الاشتراك
            const subscription = {
                id: 'sub_' + Date.now(),
                studentId: studentId,
                plan: planType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: 'active',
                paymentId: null
            };
            
            storage.saveSubscription(subscription);
            
            // إرسال إشعار
            showNotification('تم تفعيل الاشتراك بنجاح!', 'success');
            
            return users[userIndex].subscription;
        }
        
        throw new Error('الطالب غير موجود');
    }

    // التحقق من صلاحية الاشتراك
    checkSubscriptionStatus(studentId) {
        const users = storage.getUsers();
        const user = users.find(u => u.id === studentId);
        
        if (!user || !user.subscription) {
            return { isValid: false, reason: 'لا يوجد اشتراك' };
        }
        
        const now = new Date();
        const endDate = new Date(user.subscription.endDate);
        
        if (now > endDate) {
            user.subscription.status = 'expired';
            localStorage.setItem('users', JSON.stringify(users));
            return { isValid: false, reason: 'انتهت مدة الاشتراك' };
        }
        
        return { 
            isValid: true, 
            plan: user.subscription.plan,
            daysLeft: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
        };
    }

    // تجديد الاشتراك
    renewSubscription(studentId, planType) {
        return this.createPaymentOrder(studentId, planType);
    }

    // الحصول على الإحصائيات المالية
    getFinancialStats() {
        const payments = storage.getPayments();
        const completedPayments = payments.filter(p => p.status === 'completed');
        
        const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const monthlyRevenue = completedPayments
            .filter(p => {
                const paymentDate = new Date(p.completedAt);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && 
                       paymentDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
            totalRevenue,
            monthlyRevenue,
            totalTransactions: completedPayments.length,
            activeSubscriptions: storage.getUsers().filter(u => 
                u.role === 'student' && u.subscription.status === 'active'
            ).length
        };
    }
}

// إنشاء نسخة عامة
const subscriptionManager = new SubscriptionManager();