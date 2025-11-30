<!-- ملف جديد: loading.js -->
<script>
// loading.js - نظام التحميل والتقدم
class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
    }

    // إظهار حالة التحميل
    showLoading(container, message = 'جاري التحميل...') {
        const loadingId = 'loading_' + Date.now();
        const loadingHTML = `
            <div id="${loadingId}" class="loading-overlay">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', loadingHTML);
        
        this.loadingStates.set(container, loadingId);
        return loadingId;
    }

    // إخفاء حالة التحميل
    hideLoading(container) {
        const loadingId = this.loadingStates.get(container);
        if (loadingId) {
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            this.loadingStates.delete(container);
        }
    }

    // إظهار شريط التقدم
    showProgressBar(container, totalSteps) {
        const progressId = 'progress_' + Date.now();
        const progressHTML = `
            <div id="${progressId}" class="progress-overlay">
                <div class="progress-container">
                    <div class="progress-header">
                        <h4>جاري المعالجة</h4>
                        <span class="progress-percentage">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-steps"></div>
                </div>
            </div>
        `;
        
        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', progressHTML);
        
        return {
            update: (currentStep, stepMessage) => this.updateProgress(progressId, currentStep, totalSteps, stepMessage),
            complete: () => this.completeProgress(progressId),
            error: (message) => this.errorProgress(progressId, message)
        };
    }

    // تحديث شريط التقدم
    updateProgress(progressId, currentStep, totalSteps, stepMessage) {
        const progressElement = document.getElementById(progressId);
        if (!progressElement) return;

        const percentage = Math.round((currentStep / totalSteps) * 100);
        const progressFill = progressElement.querySelector('.progress-fill');
        const progressPercentage = progressElement.querySelector('.progress-percentage');
        const progressSteps = progressElement.querySelector('.progress-steps');

        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;

        if (stepMessage) {
            progressSteps.innerHTML = `<p>${stepMessage}</p>`;
        }
    }

    // إكمال شريط التقدم
    completeProgress(progressId) {
        const progressElement = document.getElementById(progressId);
        if (progressElement) {
            progressElement.querySelector('.progress-fill').style.width = '100%';
            progressElement.querySelector('.progress-percentage').textContent = '100%';
            
            setTimeout(() => {
                progressElement.remove();
            }, 1000);
        }
    }

    // خطأ في شريط التقدم
    errorProgress(progressId, message) {
        const progressElement = document.getElementById(progressId);
        if (progressElement) {
            progressElement.querySelector('.progress-fill').style.background = 'var(--error-color)';
            progressElement.querySelector('.progress-percentage').textContent = 'خطأ';
            progressElement.querySelector('.progress-steps').innerHTML = `<p style="color: var(--error-color)">${message}</p>`;
            
            setTimeout(() => {
                progressElement.remove();
            }, 3000);
        }
    }

    // تحميل متدرج للبيانات
    async lazyLoadData(container, dataLoader, chunkSize = 10) {
        const loadingId = this.showLoading(container, 'جاري تحميل البيانات...');
        
        try {
            const allData = await dataLoader();
            const chunks = this.chunkArray(allData, chunkSize);
            let currentChunk = 0;
            
            const renderNextChunk = () => {
                if (currentChunk < chunks.length) {
                    const chunkData = chunks[currentChunk];
                    // رندر البيانات هنا
                    currentChunk++;
                    
                    this.updateProgress(loadingId, currentChunk, chunks.length, 
                        `جاري تحمين البيانات ${currentChunk * chunkSize} من ${allData.length}`);
                    
                    setTimeout(renderNextChunk, 100);
                } else {
                    this.hideLoading(container);
                }
            };
            
            renderNextChunk();
        } catch (error) {
            this.hideLoading(container);
            showNotification('حدث خطأ في تحميل البيانات', 'error');
        }
    }

    // تقسيم المصفوفة إلى أجزاء
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}

const loadingManager = new LoadingManager();
</script>