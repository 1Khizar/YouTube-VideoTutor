// ========================================
// State Management
// ========================================
let isProcessing = false;

// ========================================
// Wait for DOM to be fully loaded
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Get DOM Elements
    const elements = {
        videoUrl: document.getElementById('video-url'),
        processBtn: document.getElementById('process-btn'),
        welcomeDashboard: document.getElementById('welcome-dashboard'),
        chatDashboard: document.getElementById('chat-dashboard'),
        videoThumbnail: document.getElementById('video-thumbnail'),
        videoTitle: document.getElementById('video-title'),
        videoAuthor: document.getElementById('video-author'),
        changeVideoBtn: document.getElementById('change-video-btn'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendBtn: document.getElementById('send-btn'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text'),
        suggestedQuestions: document.getElementById('suggested-questions')
    };

    // Utility Functions
    function showLoading(text = 'Processing...') {
        if (elements.loadingText) elements.loadingText.textContent = text;
        if (elements.loadingOverlay) elements.loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        if (elements.loadingOverlay) elements.loadingOverlay.style.display = 'none';
    }

    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    function addMessage(text, sender = 'assistant', isError = false) {
        if (!elements.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}${isError ? ' off-topic' : ''}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' 
            ? '<svg width="20" height="20" fill="white" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/></svg>'
            : '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v8H5V6z"/></svg>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        elements.chatMessages.appendChild(messageDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function clearMessages() {
        if (elements.chatMessages) {
            elements.chatMessages.innerHTML = '';
        }
    }

    function autoResizeTextarea() {
        if (!elements.chatInput) return;
        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 120) + 'px';
    }

    // API Functions
    async function processVideo(videoUrl) {
        try {
            const formData = new FormData();
            formData.append('video_url', videoUrl);

            const response = await fetch('/load-video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function sendQuestion(question) {
        try {
            const formData = new FormData();
            formData.append('question', question);

            const response = await fetch('/ask', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            return data;
        } catch (err) {
            throw err;
        }
    }

    // UI Functions
    function showChatInterface(videoInfo) {
        if (elements.welcomeDashboard) elements.welcomeDashboard.style.display = 'none';
        if (elements.chatDashboard) elements.chatDashboard.style.display = 'block';

        const videoId = extractVideoId(videoInfo.video_url || videoInfo.url);
        if (elements.videoThumbnail) elements.videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        if (elements.videoTitle) elements.videoTitle.textContent = videoInfo.title || 'Unknown Title';
        if (elements.videoAuthor) elements.videoAuthor.textContent = videoInfo.author || 'Unknown Channel';

        clearMessages();
        addMessage(
            `Great! I've processed the video "${videoInfo.title}". You can now ask me any questions about its content.`,
            'assistant'
        );

        if (elements.chatInput) elements.chatInput.focus();
    }

    function showWelcomeInterface() {
        if (elements.chatDashboard) elements.chatDashboard.style.display = 'none';
        if (elements.welcomeDashboard) elements.welcomeDashboard.style.display = 'block';
        if (elements.videoUrl) elements.videoUrl.value = '';
        clearMessages();
    }

    // Event Handlers
    async function handleProcessVideo() {
        if (!elements.videoUrl) return;

        const videoUrl = elements.videoUrl.value.trim();
        if (!videoUrl) {
            alert('Please enter a YouTube video URL');
            return;
        }

        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        try {
            showLoading('Processing video transcript...');
            if (elements.processBtn) elements.processBtn.disabled = true;

            const result = await processVideo(videoUrl);

            if (result.status === 'Video loaded successfully') {
                showChatInterface({ video_url: videoUrl, title: 'Video', author: 'Unknown' });
            } else {
                throw new Error(result.error || 'Failed to process video');
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            hideLoading();
            if (elements.processBtn) elements.processBtn.disabled = false;
        }
    }

    async function handleSendMessage() {
        if (!elements.chatInput || !elements.sendBtn) return;

        const question = elements.chatInput.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        elements.chatInput.value = '';
        autoResizeTextarea();

        showLoading('Generating answer...');
        elements.chatInput.disabled = true;
        elements.sendBtn.disabled = true;

        try {
            const data = await sendQuestion(question);
            addMessage(data.answer || "No answer returned", 'assistant');
        } catch (err) {
            addMessage(`Error: ${err.message}`, 'assistant', true);
        } finally {
            hideLoading();
            elements.chatInput.disabled = false;
            elements.sendBtn.disabled = false;
            elements.chatInput.focus();
        }
    }

    // Event Listeners
    if (elements.processBtn) elements.processBtn.addEventListener('click', handleProcessVideo);
    if (elements.sendBtn) elements.sendBtn.addEventListener('click', handleSendMessage);

    if (elements.videoUrl) {
        elements.videoUrl.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleProcessVideo();
        });
    }

    if (elements.chatInput) {
        elements.chatInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        elements.chatInput.addEventListener('input', () => {
            autoResizeTextarea();
            if (elements.sendBtn) elements.sendBtn.disabled = !elements.chatInput.value.trim();
        });
    }

    if (elements.changeVideoBtn) {
        elements.changeVideoBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to load a different video? Current chat will be cleared.')) {
                showWelcomeInterface();
            }
        });
    }

    console.log('VidMind initialized successfully');
    if (elements.videoUrl) elements.videoUrl.focus();
}
