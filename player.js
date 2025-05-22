// DOM Elements
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const progressModal = document.getElementById('progressModal');
const buttonModal = document.getElementById('buttonModal');
const progressBar = document.getElementById('progressBar');
const keyInput = document.getElementById('keyInput');
const keySubmit = document.getElementById('keySubmit');
const keyMessage = document.getElementById('keyMessage');
const videoSelect = document.getElementById('videoSelect');
const keyInputSection = document.getElementById('keyInputSection');
const accessInfo = document.getElementById('accessInfo');
const expiryCountdown = document.getElementById('expiryCountdown');

// State variables
let premiumAccess = false;
let expiryDate = null;
let countdownInterval = null;

// Initialize the player
function initPlayer() {
    // Check for existing access
    const savedAccess = localStorage.getItem('videoPlayerAccess');
    if (savedAccess) {
        const accessData = JSON.parse(savedAccess);
        
        // Check if access is still valid
        if (new Date(accessData.expiry) > new Date()) {
            premiumAccess = true;
            expiryDate = new Date(accessData.expiry);
            updateUIForPremiumAccess();
            startCountdown();
        } else {
            localStorage.removeItem('videoPlayerAccess');
        }
    }
    
    // Load first video
    loadFirstVideo();
}

// Load first available video
function loadFirstVideo() {
    const firstVideo = "https://kurtzph.netlify.app/storage/watch-1/katrina-lim-09.mp4";
    loadVideo(firstVideo);
}

// Load a video
function loadVideo(url) {
    videoSource.src = url;
    videoPlayer.load();
    videoPlayer.play().catch(e => console.log("Autoplay prevented:", e));
}

// Show modal functions
function showProgressModal() {
    if (!premiumAccess) progressModal.style.display = 'flex';
}

function showButtonModal() {
    if (!premiumAccess) buttonModal.style.display = 'flex';
}

// Update UI when premium access is granted
function updateUIForPremiumAccess() {
    keyMessage.style.display = 'block';
    keyInputSection.style.display = 'none';
    accessInfo.style.display = 'block';
}

// Start countdown timer
function startCountdown() {
    clearInterval(countdownInterval);
    
    function updateCountdown() {
        const now = new Date();
        const diff = expiryDate - now;
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            expiryCountdown.textContent = "EXPIRED";
            premiumAccess = false;
            localStorage.removeItem('videoPlayerAccess');
            keyInputSection.style.display = 'flex';
            accessInfo.style.display = 'none';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        expiryCountdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Event Listeners

// Video selection handler
videoSelect.addEventListener('change', function() {
    if (!premiumAccess) {
        showButtonModal();
        videoSelect.value = "";
        return;
    }
    
    const selectedVideo = videoSelect.value;
    if (selectedVideo) {
        loadVideo(selectedVideo);
    }
});

// Modal buy buttons
document.getElementById('progressModalBuyBtn').addEventListener('click', function() {
    window.location.href = "mailto:2j1tbqr6@gmail.com?subject=Buy%20Access%20Key&body=Hi%20KurtZ,%0AI%20want%20to%20buy%20an%20access%20key.%20Please%20send%20me%20the%20details.";
});

document.getElementById('buttonModalBuyBtn').addEventListener('click', function() {
    window.location.href = "mailto:2j1tbqr6@gmail.com?subject=Buy%20Access%20Key&body=Hi%20KurtZ,%0AI%20want%20to%20buy%20an%20access%20key.%20Please%20send%20me%20the%20details.";
});

// Share Button
document.getElementById('shareBtn').addEventListener('click', function() {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this video player',
            text: 'Manood at mag Enjoy mga bagong Viral sa Pinas!',
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
        });
    } else {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
});

// Video progress tracking
videoPlayer.addEventListener('timeupdate', function() {
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.style.width = progress + '%';
    
    if (progress >= 40 && videoPlayer.duration > 0 && !premiumAccess) {
        videoPlayer.pause();
        showProgressModal();
    }
});

// Key submission handler
keySubmit.addEventListener('click', function() {
    const enteredKey = keyInput.value.trim();
    
    // Try to fetch keys from keys.json
    fetch('5002d83fb7c809cb870d53ed8d1783cf/keys.json')
        .then(response => response.json())
        .then(keysData => {
            const keyObj = keysData.keys.find(k => k.key === enteredKey && !k.used);
            
            if (keyObj) {
                // Set expiry date
                const expiry = keyObj.expiry ? new Date(keyObj.expiry) : new Date();
                if (!keyObj.expiry) {
                    expiry.setDate(expiry.getDate() + 7); // Default 7 days if no expiry
                }
                
                // Grant premium access
                premiumAccess = true;
                expiryDate = expiry;
                
                // Save to localStorage
                localStorage.setItem('videoPlayerAccess', JSON.stringify({
                    key: enteredKey,
                    expiry: expiry.toISOString()
                }));
                
                // Update UI
                updateUIForPremiumAccess();
                keyInput.value = '';
                
                // Close any open modals
                progressModal.style.display = 'none';
                buttonModal.style.display = 'none';
                
                // Resume video if paused
                if (videoPlayer.paused) {
                    videoPlayer.play();
                }
                
                // Start countdown
                startCountdown();
            } else {
                alert("Incorrect access key. Please try again.");
                keyInput.value = '';
            }
        })
        .catch(error => {
            console.error('Error loading keys:', error);
            alert("Error verifying key. Please try again later.");
        });
});

// Also allow Enter key to submit
keyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        keySubmit.click();
    }
});

// Prevent video download
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'VIDEO') {
        e.preventDefault();
    }
});

// Initialize the player when the page loads
window.addEventListener('DOMContentLoaded', initPlayer);