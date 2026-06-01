document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.main-button');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownNumber = document.getElementById('countdownNumber');
    const blurOverlay = document.getElementById('blurOverlay');
    const startOverlay = document.getElementById('startOverlay');
    const targetUrl = "https://cand.vn/";
    // Beep sound for countdown numbers
    const beepAudio = new Audio('beep.mp3');
    // Explosion sound for zero
    const explosionAudio = new Audio('explosion.mp3');
    // Background music after countdown
    const nhacAudio = new Audio('nhac.mp3');

    // Adjust volume levels
    beepAudio.volume = 0.3; // Quieter beep
    explosionAudio.volume = 1.0; // Max volume for explosion
    nhacAudio.volume = 1.0; // Max volume for background music

    let isCountingDown = false;
    let isStarted = false;
    let isReady = false; // Trạng thái đã ấn Enter để hiện nút
    let isFinished = false; // Trạng thái đếm ngược xong
    
    const buttonsWrapper = document.querySelector('.buttons-wrapper');
    if (buttonsWrapper) {
        buttonsWrapper.classList.add('hide');
    }

    // ========================================
    // Fullscreen Functions
    // ========================================
    const enterFullscreen = async () => {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }

            // Try to lock orientation to landscape on mobile
            if (screen.orientation && screen.orientation.lock) {
                try {
                    await screen.orientation.lock('landscape');
                } catch (e) {
                    console.log('Orientation lock not available');
                }
            }
        } catch (err) {
            console.log('Fullscreen not available:', err.message);
        }
    };

    // ========================================
    // Start Overlay Handler
    // ========================================
    const handleStart = async () => {
        if (isStarted) return;
        isStarted = true;

        // Enter fullscreen
        await enterFullscreen();

        // Unlock audio on iOS/mobile browsers without glitching
        [beepAudio, explosionAudio, nhacAudio].forEach(audio => {
            audio.muted = true; // Mute reliably
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false; // Restore sound
                }).catch(e => {
                    audio.muted = false;
                    console.log("Audio unlock failed", e);
                });
            }
        });

        // Hide start overlay
        if (startOverlay) {
            startOverlay.classList.add('hidden');
        }
    };

    // Click/Touch on start overlay
    if (startOverlay) {
        startOverlay.addEventListener('click', handleStart);
        startOverlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleStart();
        }, { passive: false });
    }

    // ========================================
    // Particles System
    // ========================================
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const isMobile = window.matchMedia('(max-width: 926px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = prefersReducedMotion ? 0 : (isMobile ? 20 : 40);

    // Resize canvas to match the led-wrapper container
    const resizeCanvas = () => {
        const wrapper = document.querySelector('.led-wrapper');
        if (wrapper) {
            canvas.width = wrapper.clientWidth;
            canvas.height = wrapper.clientHeight;
        } else {
            const viewport = window.visualViewport;
            canvas.width = Math.round(viewport ? viewport.width : window.innerWidth);
            canvas.height = Math.round(viewport ? viewport.height : window.innerHeight);
        }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resizeCanvas);
    }

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            // Random position
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;

            // Random size
            this.size = Math.random() * 4 + 1;

            // Random velocity (slow floating movement)
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.speedY = (Math.random() - 0.5) * 1.5 - 0.5; // Slight upward bias

            // Random opacity
            this.opacity = Math.random() * 0.6 + 0.2;

            // Random color (golden/red tones)
            const colors = [
                'rgba(255, 215, 100, ',  // Gold
                'rgba(255, 180, 50, ',   // Orange gold
                'rgba(255, 100, 50, ',   // Orange red
                'rgba(255, 150, 80, ',   // Light orange
                'rgba(255, 255, 200, ',  // Light yellow
                'rgba(255, 80, 30, ',    // Red orange
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // Twinkle effect
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinkleOffset = Math.random() * Math.PI * 2;
        }

        update(timestamp) {
            this.x += this.speedX;
            this.y += this.speedY;

            // Twinkle effect - use cached timestamp
            this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(timestamp * this.twinkleSpeed + this.twinkleOffset));

            // Reset particle if out of bounds
            if (this.x < -10 || this.x > canvas.width + 10 ||
                this.y < -10 || this.y > canvas.height + 10) {
                this.reset();
                // Spawn from edges
                if (Math.random() > 0.5) {
                    this.x = Math.random() > 0.5 ? -5 : canvas.width + 5;
                    this.y = Math.random() * canvas.height;
                } else {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + 5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.currentOpacity + ')';
            ctx.fill();
            // Removed shadowBlur - too expensive
        }
    }

    // Initialize particles
    const initParticles = () => {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };

    // Animate particles with timestamp
    const animateParticles = (timestamp) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(timestamp);
            particles[i].draw();
        }

        requestAnimationFrame(animateParticles);
    };

    // Start particles system
    if (particleCount > 0) {
        initParticles();
        animateParticles();
    }

    const playBeep = () => {
        beepAudio.currentTime = 0;
        beepAudio.play().catch(e => console.log("Beep audio play failed:", e));
    };

    const playExplosion = () => {
        explosionAudio.currentTime = 0;
        explosionAudio.play().catch(e => console.log("Explosion audio play failed:", e));
    };

    const startCountdown = () => {
        if (isCountingDown) return;
        isCountingDown = true;

        // Play first beep immediately for "5"
        playBeep();

        // Add fast radial wave effect to all buttons (don't hide them)
        buttons.forEach(btn => {
            const waves = btn.querySelectorAll('.radial-wave');
            waves.forEach(wave => wave.classList.add('radial-wave-fast'));
        });

        // Show countdown and activate blur
        countdownDisplay.classList.remove('hide');
        blurOverlay.classList.add('active');

        let count = 5;
        countdownNumber.textContent = count;
        countdownNumber.setAttribute('data-text', count);

        const timer = setInterval(() => {
            count--;
            if (count >= 1) {
                // Play beep for 4, 3, 2, 1
                playBeep();

                // Reset animation to trigger it again for each number
                countdownNumber.style.animation = 'none';
                countdownNumber.offsetHeight; /* trigger reflow */
                countdownNumber.style.animation = 'zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

                countdownNumber.textContent = count;
                countdownNumber.setAttribute('data-text', count);

                // If we just showed "1", prepare to zoom out
                if (count === 1) {
                    clearInterval(timer);

                    // Play explosion sound after showing 1
                    setTimeout(() => {
                        playExplosion();

                        // Add zoom out animation to the number
                        countdownNumber.style.animation = 'zoomOut 1s ease-in forwards';

                        // Chuyển nền sang bg led_1.png và tắt hiệu ứng mờ
                        setTimeout(() => {
                            const bg1 = document.querySelector('.background-container.bg-1');
                            const bg2 = document.querySelector('.background-container.bg-2');
                            if (bg1 && bg2) {
                                // Transition opacity 1.5s (cross-fade)
                                bg1.style.opacity = '0';
                                bg2.style.opacity = '1';
                                
                                // Play nhac.mp3
                                nhacAudio.currentTime = 0;
                                nhacAudio.play().catch(e => console.log("Nhac audio play failed:", e));
                            }
                            blurOverlay.classList.remove('active');
                            
                            // Ẩn các nút bấm đi để hiện rõ nền mới
                            const buttonsWrapper = document.querySelector('.buttons-wrapper');
                            if (buttonsWrapper) {
                                buttonsWrapper.style.display = 'none';
                            }
                            
                            isFinished = true; // Đánh dấu đã xong để xử lý tap/click reset
                        }, 500); // Wait 500ms into the 1s zoomOut animation
                    }, 1000); // Wait 1 second after showing "1"
                }
            }
        }, 1000);
    };

    // Click event for all buttons
    buttons.forEach(button => {
        button.addEventListener('click', startCountdown);
    });

    // Touch event for mobile devices
    buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent double-firing with click
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
        }, { passive: false });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = '';
            startCountdown();
        }, { passive: false });
    });



    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // Nếu chưa ready và chưa đếm ngược -> chuyển sang trạng thái hiện nút và mờ nền
            if (!isReady && !isCountingDown) {
                isReady = true;
                if (buttonsWrapper) {
                    buttonsWrapper.classList.remove('hide');
                    buttonsWrapper.style.display = '';
                }
                blurOverlay.classList.add('active');
            }
        } else if (e.key === '1') {
            // Nếu đã ready thì ấn 1 sẽ đếm ngược
            if (isReady && !isCountingDown) {
                startCountdown();
            }
        } else if (e.key === '2') {
            // Bấm 2 để quay lại nền ban đầu với hiệu ứng chồng mờ
            const bg1 = document.querySelector('.background-container.bg-1');
            const bg2 = document.querySelector('.background-container.bg-2');
            if (bg1 && bg2) {
                bg1.style.opacity = '1';
                bg2.style.opacity = '0';
            }
            
            // Tắt nhạc khi quay về nền cũ
            nhacAudio.pause();
            nhacAudio.currentTime = 0;

            // Reset buttons wrapper and waves
            if (buttonsWrapper) {
                buttonsWrapper.style.display = '';
                buttonsWrapper.classList.add('hide');
            }
            buttons.forEach(btn => {
                const waves = btn.querySelectorAll('.radial-wave');
                waves.forEach(wave => wave.classList.remove('radial-wave-fast'));
            });

            isFinished = false;
            isReady = false;
            isCountingDown = false;
        }
    });

    // Thêm điều khiển bằng màn hình cảm ứng/chuột thay cho phím cứng
    const bgWrapper = document.querySelector('.background-wrapper');
    if (bgWrapper) {
        bgWrapper.addEventListener('click', (e) => {
            // Ngăn sự kiện này kích hoạt lung tung
            e.preventDefault();

            // Tương đương ấn phím 'Enter'
            if (!isReady && !isCountingDown && !isFinished) {
                isReady = true;
                if (buttonsWrapper) {
                    buttonsWrapper.classList.remove('hide');
                    buttonsWrapper.style.display = '';
                }
                blurOverlay.classList.add('active');
            } 
            // Tương đương ấn phím '2'
            else if (isFinished) {
                const bg1 = document.querySelector('.background-container.bg-1');
                const bg2 = document.querySelector('.background-container.bg-2');
                if (bg1 && bg2) {
                    bg1.style.opacity = '1';
                    bg2.style.opacity = '0';
                }
                
                // Tắt nhạc khi quay về nền cũ
                nhacAudio.pause();
                nhacAudio.currentTime = 0;
                
                // Reset buttons wrapper and waves
                if (buttonsWrapper) {
                    buttonsWrapper.style.display = '';
                    buttonsWrapper.classList.add('hide');
                }
                buttons.forEach(btn => {
                    const waves = btn.querySelectorAll('.radial-wave');
                    waves.forEach(wave => wave.classList.remove('radial-wave-fast'));
                });
                
                // Reset lại trạng thái để có thể bắt đầu lại từ đầu
                isFinished = false;
                isReady = false;
                isCountingDown = false;
            }
        });
    }

    // Handle initial focus on first button (only on non-touch devices)
    if (buttons.length > 0 && !('ontouchstart' in window)) {
        buttons[0].focus();
    }

    // Prevent zoom on double-tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
});
