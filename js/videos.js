// videos.js - إدارة الفيديوهات
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleVideoUpload);
    }
});

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
    
    return true;
}

function uploadVideo(data) {
    showNotification('جاري رفع الفيديو...', 'info');
    
    // محاكاة الرفع
    setTimeout(() => {
        const videos = storage.getVideos();
        const newVideo = {
            id: 'video_' + Date.now(),
            title: data.title,
            description: data.description,
            grade: data.grade,
            duration: '00:00',
            views: 0,
            uploadDate: new Date().toISOString(),
            fileName: data.file.name,
            fileSize: (data.file.size / (1024 * 1024)).toFixed(2) + ' MB'
        };
        
        videos.unshift(newVideo);
        localStorage.setItem('videos', JSON.stringify(videos));
        
        closeUploadModal();
        
        if (typeof displayVideos === 'function') {
            displayVideos(videos);
        }
        
        if (typeof loadStats === 'function') {
            loadStats();
        }
        
        showNotification('تم رفع الفيديو بنجاح', 'success');
        document.getElementById('uploadForm').reset();
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
        
        if (typeof displayVideos === 'function') {
            displayVideos(videos);
        }
    }
}

function deleteVideo(videoId) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
        const videos = storage.getVideos();
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