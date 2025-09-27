// Enhanced Background Video System
document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.getElementById('hero-video');
    const videoContainer = document.getElementById('hero-video-container');
    const videoOverlay = document.getElementById('video-overlay');
    const videoFallback = document.getElementById('video-fallback');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const overlayBtns = document.querySelectorAll('.overlay-btn');
    
    let isVideoLoaded = false;
    let isMobile = window.innerWidth <= 768;
    let connectionSpeed = 'high';
    
    if (!heroVideo || !videoContainer) {
        return;
    }
    
    function detectConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                connectionSpeed = 'low';
            } else if (connection.effectiveType === '3g') {
                connectionSpeed = 'medium';
            } else {
                connectionSpeed = 'high';
            }
        }
        
        if (isMobile || window.devicePixelRatio < 2) {
            connectionSpeed = 'medium';
        }
    }
    
    function initVideoLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isVideoLoaded) {
                    loadVideo();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(videoContainer);
    }
    
    function loadVideo() {
        if (connectionSpeed === 'low' || isMobile) {
            showFallbackImage();
            return;
        }
        
        const sources = heroVideo.querySelectorAll('source');
        let selectedSource = sources[0];
        
        if (connectionSpeed === 'medium') {
            const lowQualitySource = Array.from(sources).find(s => s.dataset.quality === 'low');
            if (lowQualitySource) {
                selectedSource = lowQualitySource;
            }
        }
        
        heroVideo.src = selectedSource.src;
        heroVideo.load();
        
        heroVideo.addEventListener('loadeddata', handleVideoLoaded);
        heroVideo.addEventListener('error', handleVideoError);
        
        isVideoLoaded = true;
    }
    
    function handleVideoLoaded() {
        heroVideo.classList.add('loaded');
        if (connectionSpeed === 'high') {
            heroVideo.classList.add('high-quality');
        }
        
        if (!isMobile) {
            initParallaxEffect();
        }
    }
    
    function handleVideoError() {
        console.warn('Video failed to load, showing fallback image');
        showFallbackImage();
    }
    
    function showFallbackImage() {
        if (heroVideo) heroVideo.style.display = 'none';
        if (videoFallback) videoFallback.style.display = 'block';
    }
    
    function initParallaxEffect() {
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            
            videoContainer.style.setProperty('--parallax-y', rate + 'px');
            videoContainer.classList.add('parallax');
            
            ticking = false;
        }
        
        function requestParallaxUpdate() {
            if (!ticking && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }
    
    function initMobileOptimization() {
        if (isMobile) {
            if (heroVideo && !heroVideo.paused) {
                heroVideo.pause();
            }
            
            if (videoOverlay) {
                videoOverlay.className = 'video-overlay dark';
            }
            
            const videoControls = document.getElementById('video-controls');
            if (videoControls) {
                videoControls.style.display = 'none';
            }
        }
    }
    
    function initVideoControls() {
        if (isMobile) return;
        
        if (playPauseBtn && heroVideo) {
            playPauseBtn.addEventListener('click', function() {
                if (heroVideo.paused) {
                    heroVideo.play();
                    this.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    heroVideo.pause();
                    this.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
        }
        
        if (muteBtn && heroVideo) {
            muteBtn.addEventListener('click', function() {
                if (heroVideo.muted) {
                    heroVideo.muted = false;
                    this.innerHTML = '<i class="fas fa-volume-up"></i>';
                } else {
                    heroVideo.muted = true;
                    this.innerHTML = '<i class="fas fa-volume-mute"></i>';
                }
            });
        }
        
        if (overlayBtns.length > 0) {
            overlayBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    overlayBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const overlayType = this.dataset.overlay;
                    if (videoOverlay) {
                        videoOverlay.className = 'video-overlay ' + overlayType;
                    }
                    
                    localStorage.setItem('videoOverlay', overlayType);
                });
            });
        }
        
        const savedOverlay = localStorage.getItem('videoOverlay');
        if (savedOverlay) {
            const savedBtn = document.querySelector('[data-overlay="' + savedOverlay + '"]');
            if (savedBtn) {
                savedBtn.click();
            }
        }
    }
    
    function initBatterySaving() {
        document.addEventListener('visibilitychange', function() {
            if (heroVideo) {
                if (document.hidden) {
                    if (!heroVideo.paused) {
                        heroVideo.pause();
                        heroVideo.dataset.wasPlaying = 'true';
                    }
                } else {
                    if (heroVideo.dataset.wasPlaying === 'true' && !isMobile) {
                        heroVideo.play();
                        delete heroVideo.dataset.wasPlaying;
                    }
                }
            }
        });
    }
    
    function handleResize() {
        const wasIsMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        
        if (wasIsMobile !== isMobile) {
            if (isMobile) {
                initMobileOptimization();
            } else {
                if (heroVideo && heroVideo.paused && isVideoLoaded) {
                    heroVideo.play();
                }
            }
        }
    }
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    function init() {
        detectConnectionSpeed();
        initVideoLazyLoading();
        initMobileOptimization();
        initVideoControls();
        initBatterySaving();
    }
    
    init();
});

// Media switch system
document.addEventListener('DOMContentLoaded', function() {
    const showPhotosBtn = document.getElementById('show-photos');
    const showVideosBtn = document.getElementById('show-videos');
    const photosDiv = document.getElementById('photos');
    const videosDiv = document.getElementById('videos');

    if (showPhotosBtn && showVideosBtn) {
        showPhotosBtn.addEventListener('click', () => {
            showPhotosBtn.classList.add('active');
            showVideosBtn.classList.remove('active');
            if (photosDiv) photosDiv.style.display = '';
            if (videosDiv) videosDiv.style.display = 'none';
        });
        
        showVideosBtn.addEventListener('click', () => {
            showVideosBtn.classList.add('active');
            showPhotosBtn.classList.remove('active');
            if (videosDiv) videosDiv.style.display = '';
            if (photosDiv) photosDiv.style.display = 'none';
        });
    }
});

// Fetch and display uploaded media
async function loadMedia() {
    try {
        const res = await fetch('/api/media');
        const media = await res.json();
        const photosDiv = document.getElementById('photos');
        const videosDiv = document.getElementById('videos');
        
        if (photosDiv) photosDiv.innerHTML = '';
        if (videosDiv) videosDiv.innerHTML = '';
        
        let hasImage = false, hasVideo = false;
        
        media.forEach(file => {
            if (file.type === 'image') {
                hasImage = true;
                const img = document.createElement('img');
                img.src = file.url;
                img.alt = file.filename;
                img.style.maxWidth = '320px';
                img.style.maxHeight = '220px';
                img.style.width = '100%';
                img.style.borderRadius = '8px';
                img.style.boxShadow = '0 2px 8px rgba(30,42,56,0.10)';
                img.style.display = 'block';
                img.style.margin = '0 auto 1rem auto';
                if (photosDiv) photosDiv.appendChild(img);
            } else if (file.type === 'video') {
                hasVideo = true;
                const video = document.createElement('video');
                video.src = file.url;
                video.controls = true;
                video.style.maxWidth = '320px';
                video.style.maxHeight = '220px';
                video.style.width = '100%';
                video.style.borderRadius = '8px';
                video.style.boxShadow = '0 2px 8px rgba(30,42,56,0.10)';
                video.style.display = 'block';
                video.style.margin = '0 auto 1rem auto';
                if (videosDiv) videosDiv.appendChild(video);
            }
        });
        
        if (!hasImage && photosDiv) {
            photosDiv.innerHTML = '<p style="text-align:center;color:#888;">No photos uploaded yet.</p>';
        }
        if (!hasVideo && videosDiv) {
            videosDiv.innerHTML = '<p style="text-align:center;color:#888;">No videos uploaded yet.</p>';
        }
    } catch (err) {
        const photosDiv = document.getElementById('photos');
        const videosDiv = document.getElementById('videos');
        if (photosDiv) photosDiv.innerHTML = '<p style="color:red;">Error loading media.</p>';
        if (videosDiv) videosDiv.innerHTML = '<p style="color:red;">Error loading media.</p>';
    }
}

window.addEventListener('DOMContentLoaded', loadMedia);

// Testimonials Animation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (testimonialCards.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    testimonialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
        
        observer.observe(card);
        
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
        
        const statusDot = card.querySelector('.status-dot');
        if (statusDot) {
            statusDot.style.animationDelay = (Math.random() * 2) + 's';
        }
    });
    
    const profiles = document.querySelectorAll('.testimonial-profile');
    profiles.forEach((profile, index) => {
        profile.style.animation = 'float ' + (3 + (index % 3)) + 's ease-in-out infinite';
        profile.style.animationDelay = (index * 0.5) + 's';
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
});

// Enhanced Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.contact-btn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    contactStatus.className = 'success';
                    contactStatus.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully. I\'ll get back to you soon!';
                    contactForm.reset();
                    
                    setTimeout(() => {
                        contactStatus.style.display = 'none';
                    }, 5000);
                    
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                contactStatus.className = 'error';
                contactStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Sorry, there was an error sending your message. Please try again or email me directly.';
            }
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
        
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        function validateField(field) {
            const isValid = field.checkValidity();
            
            if (isValid) {
                field.style.borderColor = '#10b981';
                field.classList.remove('error');
            } else {
                field.style.borderColor = '#ef4444';
                field.classList.add('error');
            }
        }
    }
});