// videos.js - إدارة الفيديوهات
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleVideoUpload);
    }
});

function handleVideoUpload(e) {
    e.preventDefault();
    console.log('بدء رفع الفيديو...');
    
    const formData = {
        title: document.getElementById('videoTitle').value,
        grade: document.getElementById('videoGrade').value,
        description: document.getElementById('videoDescription').value,
        file: document.getElementById('videoFile').files[0]
    };
    
    console.log('بيانات الفيديو:', formData);
    
    if (validateVideoUpload(formData)) {
        uploadVideo(formData);
    }
}

function validateVideoUpload(data) {
    if (!data.title || !data.title.trim()) {
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
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mkv', 'video/mov'];
    if (!allowedTypes.includes(data.file.type)) {
        showNotification('الرجاء اختيار ملف فيديو صالح (MP4, AVI, MKV, MOV)', 'error');
        return false;
    }
    
    // التحقق من حجم الملف (50MB كحد أقصى)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (data.file.size > maxSize) {
        showNotification('حجم الفيديو يجب أن يكون أقل من 50 ميجابايت', 'error');
        return false;
    }
    
    return true;
}

function uploadVideo(data) {
    showNotification('جاري رفع الفيديو...', 'info');
    console.log('بدء عملية الرفع...');
    
    // محاكاة الرفع (في التطبيق الحقيقي هنا يتم رفع الملف للسيرفر)
    setTimeout(() => {
        try {
            const videos = storage.getVideos();
            const newVideo = {
                id: 'video_' + Date.now(),
                title: data.title,
                description: data.description,
                grade: data.grade,
                duration: '00:00', // يمكن حساب المدة الحقيقية في التطبيق الحقيقي
                views: 0,
                uploadDate: new Date().toISOString(),
                fileName: data.file.name,
                fileSize: (data.file.size / (1024 * 1024)).toFixed(2) + ' MB',
                status: 'active'
            };
            
            console.log('فيديو جديد:', newVideo);
            
            videos.unshift(newVideo);
            localStorage.setItem('videos', JSON.stringify(videos));
            
            // إعادة تحميل البيانات
            if (typeof loadVideos === 'function') {
                loadVideos();
            }
            
            if (typeof loadStats === 'function') {
                loadStats();
            }
            
            // إغلاق الموديل وإعادة تعيين النموذج
            closeUploadModal();
            document.getElementById('uploadForm').reset();
            
            showNotification('تم رفع الفيديو بنجاح', 'success');
            console.log('تم رفع الفيديو بنجاح');
            
        } catch (error) {
            console.error('خطأ في رفع الفيديو:', error);
            showNotification('حدث خطأ أثناء رفع الفيديو', 'error');
        }
    }, 2000);
}

function editVideo(videoId) {
    const videos = storage.getVideos();
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        document.getElementById('editVideoTitle').value = video.title;
        document.getElementById('editVideoGrade').value = video.grade;
        document.getElementById('editVideoDescription').value = video.description || '';
        document.getElementById('editVideoId').value = videoId;
        
        document.getElementById('editVideoModal').style.display = 'block';
    }
}

function saveVideoEdit(e) {
    e.preventDefault();
    
    const videoId = document.getElementById('editVideoId').value;
    const updatedData = {
        title: document.getElementById('editVideoTitle').value,
        grade: document.getElementById('editVideoGrade').value,
        description: document.getElementById('editVideoDescription').value
    };
    
    const videos = storage.getVideos();
    const videoIndex = videos.findIndex(v => v.id === videoId);
    
    if (videoIndex !== -1) {
        videos[videoIndex] = { ...videos[videoIndex], ...updatedData };
        localStorage.setItem('videos', JSON.stringify(videos));
        
        showNotification('تم تحديث الفيديو بنجاح', 'success');
        closeEditVideoModal();
        
        if (typeof loadVideos === 'function') {
            loadVideos();
        }
    }
}

function deleteVideo(videoId) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
        const videos = storage.getVideos();
        const updatedVideos = videos.filter(video => video.id !== videoId);
        localStorage.setItem('videos', JSON.stringify(updatedVideos));
        
        showNotification('تم حذف الفيديو بنجاح', 'success');
        
        if (typeof loadVideos === 'function') {
            loadVideos();
        }
        
        if (typeof loadStats === 'function') {
            loadStats();
        }
    }
}

function closeEditVideoModal() {
    document.getElementById('editVideoModal').style.display = 'none';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}