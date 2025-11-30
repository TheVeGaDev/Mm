// payment.js - إدارة عملية الدفع
document.addEventListener('DOMContentLoaded', function() {
    initPaymentPage();
});

function initPaymentPage() {
    // التحقق من وجود طلب دفع
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    
    if (!paymentId) {
        window.location.href = 'index.html';
        return;
    }
    
    loadPaymentDetails(paymentId);
    setupPaymentEventListeners();
}

function loadPaymentDetails(paymentId) {
    const payments = storage.getPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        showNotification('طلب الدفع غير موجود', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    const plan = subscriptionManager.plans[payment.plan];
    
    // تحديث واجهة المستخدم
    document.getElementById('planName').textContent = plan.name;
    document.getElementById('planPrice').textContent = `${plan.price} جنيه`;
    
    const featuresHtml = plan.features.map(feature => 
        `<div class="feature-item"><i class="fas fa-check"></i> ${feature}</div>`
    ).join('');
    
    document.getElementById('planFeatures').innerHTML = featuresHtml;
    
    // حفظ معرف الدفع
    document.getElementById('paymentForm').dataset.paymentId = paymentId;
}

function setupPaymentEventListeners() {
    // اختيار طريقة الدفع
    document.querySelectorAll('.method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.method').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            showPaymentMethodInfo(this.dataset.method);
        });
    });
    
    // تقديم نموذج الدفع
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment(this);
    });
}

function showPaymentMethodInfo(method) {
    const paymentInfo = document.getElementById('paymentInfo');
    let infoHtml = '';
    
    switch(method) {
        case 'vodafone_cash':
            infoHtml = `
                <div class="info-card vodafone">
                    <h4>الدفع عبر فودافون كاش</h4>
                    <div class="phone-number">
                        <strong>01012345678</strong>
                        <button type="button" class="btn-copy" onclick="copyNumber('01012345678')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p>قم بإرسال المبلغ إلى هذا الرقم ثم أدخل كود التحقق أدناه</p>
                </div>
            `;
            break;
        case 'etisalat_cash':
            infoHtml = `
                <div class="info-card etisalat">
                    <h4>الدفع عبر اتصالات كاش</h4>
                    <div class="phone-number">
                        <strong>01112345678</strong>
                        <button type="button" class="btn-copy" onclick="copyNumber('01112345678')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p>قم بإرسال المبلغ إلى هذا الرقم ثم أدخل كود التحقق أدناه</p>
                </div>
            `;
            break;
        case 'orange_cash':
            infoHtml = `
                <div class="info-card orange">
                    <h4>الدفع عبر اورانج كاش</h4>
                    <div class="phone-number">
                        <strong>01212345678</strong>
                        <button type="button" class="btn-copy" onclick="copyNumber('01212345678')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p>قم بإرسال المبلغ إلى هذا الرقم ثم أدخل كود التحقق أدناه</p>
                </div>
            `;
            break;
        case 'bank_transfer':
            infoHtml = `
                <div class="info-card bank">
                    <h4>التحويل البنكي</h4>
                    <div class="bank-details">
                        <p><strong>اسم البنك:</strong> البنك الأهلي</p>
                        <p><strong>اسم الحساب:</strong> THE MASTER</p>
                        <p><strong>رقم الحساب:</strong> 123456789</p>
                        <p><strong>IBAN:</strong> EG123456789012345678901</p>
                    </div>
                    <p>قم بإرسال صورة إثبات التحويل</p>
                </div>
            `;
            break;
    }
    
    paymentInfo.innerHTML = infoHtml;
}

function processPayment(form) {
    const paymentId = form.dataset.paymentId;
    const transactionCode = document.getElementById('transactionCode').value;
    const paymentMethod = document.querySelector('.method.active').dataset.method;
    
    if (!transactionCode) {
        showNotification('الرجاء إدخال كود التحقق', 'error');
        return;
    }
    
    // محاكاة عملية الدفع
    showNotification('جاري معالجة الدفع...', 'info');
    
    setTimeout(() => {
        try {
            subscriptionManager.processSuccessfulPayment(paymentId, transactionCode, paymentMethod);
            showNotification('تم الدفع بنجاح! جاري تفعيل الاشتراك...', 'success');
            
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 2000);
            
        } catch (error) {
            showNotification('حدث خطأ في عملية الدفع: ' + error.message, 'error');
        }
    }, 2000);
}

function copyNumber(number) {
    navigator.clipboard.writeText(number).then(() => {
        showNotification('تم نسخ الرقم', 'success');
    });
}