// إدارة الفيديوهات
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleVideoUpload);
    }
});

// معالجة رفع الفيديو
function handleVideoUpload(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('videoTitle').value,
        grade: document.getElementById('videoGrade').value,
        description: document.getElementById('videoDescription').value,
        file: document.getElementById('videoFile').files[0]
    };
    
    if (validateVideoUpload(formData)) {
        uploadVideo(formData);
    }
}

// التحقق من صحة بيانات الفيديو
function validateVideoUpload(data) {
    if (!data.title.trim()) {
        showNotification('الرجاء إدخال عنوان الفيديو', 'error');
        return false;
    }
    
    if (!data.grade) {
        showNotification('الرجاء اختيار المرحلة التعليمية', 'error');
        return false;
    }
    
    if (!data.file) {
        showNotification('الرجاء اختيار ملف الفيديو', 'error');
        return false;
    }
    
    // التحقق من نوع الملف
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(data.file.type)) {
        showNotification('نوع الملف غير مدعوم. الرجاء اختيار ملف فيديو', 'error');
        return false;
    }
    
    // التحقق من حجم الملف (50MB كحد أقصى)
    if (data.file.size > 50 * 1024 * 1024) {
        showNotification('حجم الملف كبير جداً. الحد الأقصى 50MB', 'error');
        return false;
    }
    
    return true;
}

// رفع الفيديو
function uploadVideo(data) {
    showNotification('جاري رفع الفيديو...', 'info');
    
    // محاكاة الرفع
    setTimeout(() => {
        // حفظ بيانات الفيديو
        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        const newVideo = {
            id: generateVideoId(),
            title: data.title,
            description: data.description,
            grade: data.grade,
            duration: '00:00',
            views: 0,
            uploadDate: new Date().toISOString(),
            fileName: data.file.name,
            fileSize: (data.file.size / (1024 * 1024)).toFixed(2) + ' MB'
        };
        
        videos.unshift(newVideo); // إضافة في البداية
        localStorage.setItem('videos', JSON.stringify(videos));
        
        // إغلاق الموديل وإعادة التحميل
        closeUploadModal();
        
        // إعادة تحميل الفيديوهات في الصفحة
        if (typeof displayVideos === 'function') {
            displayVideos(videos);
        }
        
        if (typeof loadStats === 'function') {
            loadStats();
        }
        
        showNotification('تم رفع الفيديو بنجاح', 'success');
        
        // إعادة تعيين النموذج
        document.getElementById('uploadForm').reset();
    }, 2000);
}

// إنشاء معرف فيديو فريد
function generateVideoId() {
    return 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// تشغيل الفيديو
function playVideo(videoId) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        // زيادة عدد المشاهدات
        video.views = (video.views || 0) + 1;
        localStorage.setItem('videos', JSON.stringify(videos));
        
        // فتح الفيديو في نافذة جديدة
        window.open(`video-player.html?id=${videoId}`, '_blank');
    }
}

// تحرير الفيديو
function editVideo(videoId) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        // تعبئة النموذج ببيانات الفيديو
        document.getElementById('editVideoTitle').value = video.title;
        document.getElementById('editVideoGrade').value = video.grade;
        document.getElementById('editVideoDescription').value = video.description || '';
        document.getElementById('editVideoId').value = videoId;
        
        // فتح موديل التحرير
        document.getElementById('editVideoModal').style.display = 'block';
    }
}

// حفظ التعديلات
function saveVideoEdit(e) {
    e.preventDefault();
    
    const videoId = document.getElementById('editVideoId').value;
    const updatedData = {
        title: document.getElementById('editVideoTitle').value,
        grade: document.getElementById('editVideoGrade').value,
        description: document.getElementById('editVideoDescription').value
    };
    
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const videoIndex = videos.findIndex(v => v.id === videoId);
    
    if (videoIndex !== -1) {
        videos[videoIndex] = { ...videos[videoIndex], ...updatedData };
        localStorage.setItem('videos', JSON.stringify(videos));
        
        showNotification('تم تحديث الفيديو بنجاح', 'success');
        closeEditVideoModal();
        
        if (typeof displayVideos === 'function') {
            displayVideos(videos);
        }
    }
}

// حذف الفيديو
function deleteVideo(videoId) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        const updatedVideos = videos.filter(video => video.id !== videoId);
        localStorage.setItem('videos', JSON.stringify(updatedVideos));
        
        showNotification('تم حذف الفيديو بنجاح', 'success');
        
        if (typeof displayVideos === 'function') {
            displayVideos(updatedVideos);
        }
        
        if (typeof loadStats === 'function') {
            loadStats();
        }
    }
}

function closeEditVideoModal() {
    document.getElementById('editVideoModal').style.display = 'none';
}