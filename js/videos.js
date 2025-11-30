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
    // في التطبيق الحقيقي، هنا سيتم رفع الملف إلى الخادم
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
            duration: '00:00', // سيتم حسابها من الملف
            views: 0,
            comments: 0,
            uploadDate: new Date().toISOString(),
            fileName: data.file.name
        };
        
        videos.push(newVideo);
        localStorage.setItem('videos', JSON.stringify(videos));
        
        // إغلاق الموديل وإعادة التحميل
        closeUploadModal();
        displayVideos(videos);
        showNotification('تم رفع الفيديو بنجاح', 'success');
        
        // إعادة تعيين النموذج
        document.getElementById('uploadForm').reset();
    }, 2000);
}

// إنشاء معرف فيديو فريد
function generateVideoId() {
    return 'video_' + Math.random().toString(36).substr(2, 9);
}

// تشغيل الفيديو
function playVideo(videoId) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        // تحديث التقدم
        updateVideoProgress(videoId, 100);
        
        // في التطبيق الحقيقي، هنا سيتم فتح مشغل الفيديو
        showNotification(`جاري تشغيل: ${video.title}`, 'info');
    }
}

// تحديث تقدم الفيديو
function updateVideoProgress(videoId, progress) {
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    userProgress[videoId] = progress;
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
    
    // تحديث الواجهة
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    displayVideos(videos);
}

// إدارة التعليقات
function addComment(videoId, comment) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const video = videos.find(v => v.id === videoId);
    
    if (video) {
        if (!video.comments) {
            video.comments = [];
        }
        
        const newComment = {
            id: generateId(),
            userId: JSON.parse(localStorage.getItem('currentUser')).id,
            userName: JSON.parse(localStorage.getItem('currentUser')).fullName,
            comment: comment,
            timestamp: new Date().toISOString()
        };
        
        video.comments.push(newComment);
        video.commentsCount = video.comments.length;
        
        localStorage.setItem('videos', JSON.stringify(videos));
        displayVideos(videos);
        
        showNotification('تم إضافة التعليق بنجاح', 'success');
    }
}

// البحث في الفيديوهات
function searchVideos(query) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
    );
    
    displayVideos(filteredVideos);
}

// ترتيب الفيديوهات
function sortVideos(criteria) {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    let sortedVideos = [...videos];
    
    switch(criteria) {
        case 'date':
            sortedVideos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'views':
            sortedVideos.sort((a, b) => b.views - a.views);
            break;
        case 'title':
            sortedVideos.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    displayVideos(sortedVideos);
}