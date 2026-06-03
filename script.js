document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.main-button');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownNumber = document.getElementById('countdownNumber');
    const blurOverlay = document.getElementById('blurOverlay');
    const startOverlay = document.getElementById('startOverlay');
    const flashOverlay = document.getElementById('flashOverlay');
    const eventVideo = document.getElementById('eventVideo');
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
    if (eventVideo) {
        eventVideo.volume = 1.0; // Max volume for the event video
    }

    let fadeIntervalId = null;

    const fadeOutAudio = (audio, duration = 2000) => {
        if (!audio) return;
        if (fadeIntervalId) {
            clearInterval(fadeIntervalId);
        }
        
        const startVolume = 1.0;
        audio.volume = startVolume;
        const steps = 40;
        const stepVolume = startVolume / steps;
        const stepTime = duration / steps;
        let currentStep = 0;

        fadeIntervalId = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                audio.volume = 0;
                audio.pause();
                audio.currentTime = 0;
                audio.volume = startVolume; // Restore original volume for next play
                clearInterval(fadeIntervalId);
                fadeIntervalId = null;
            } else {
                audio.volume = Math.max(0, startVolume - (stepVolume * currentStep));
            }
        }, stepTime);
    };

    let isCountingDown = false;
    let isStarted = false;
    let isReady = false; // Trạng thái đã ấn Enter để hiện nút
    let isFinished = false; // Trạng thái đếm ngược xong
    
    const buttonsWrapper = document.querySelector('.buttons-wrapper');
    if (buttonsWrapper) {
        buttonsWrapper.classList.add('hide');
    }

    // Start preloading the video as a Blob immediately on page load
    let isVideoBlobLoaded = false;
    let videoBlobUrl = '';

    if (eventVideo) {
        const sourceEl = eventVideo.querySelector('source');
        const videoUrl = sourceEl ? sourceEl.getAttribute('src') : 'Video/clip_2.mp4';
        
        fetch(videoUrl)
            .then(response => {
                if (!response.ok) throw new Error("Video download failed");
                return response.blob();
            })
            .then(blob => {
                videoBlobUrl = URL.createObjectURL(blob);
                isVideoBlobLoaded = true;
                
                // Only swap source if video is not currently playing or counting down
                if (!isCountingDown && !isFinished) {
                    eventVideo.src = videoBlobUrl;
                    eventVideo.load();
                    // Warm up the video decoder with the cached blob
                    eventVideo.play().then(() => {
                        eventVideo.pause();
                        eventVideo.currentTime = 0;
                        console.log("Background preloaded Blob decoder warmed up.");
                    }).catch(e => console.log("Blob warm-up failed:", e));
                    console.log("Video preloaded as Blob successfully on page load.");
                }
            })
            .catch(err => {
                console.log("Background preloading failed, will stream directly:", err);
            });
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

        // Warm up the video decoder to prevent lag/delay on play
        if (eventVideo) {
            // If blob loaded in background, swap source now
            if (isVideoBlobLoaded && videoBlobUrl) {
                eventVideo.src = videoBlobUrl;
            }
            eventVideo.load();
            eventVideo.play().then(() => {
                eventVideo.pause();
                eventVideo.currentTime = 0;
                console.log("Video decoder pre-warmed successfully in handleStart.");
            }).catch(e => {
                console.log("Video decoder pre-warm failed in handleStart:", e);
            });
        }

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

    // Spark particle class for the explosion effect
    class SparkParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4; // Fast radiating speed
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed - 1.5; // Slight upward bias
            this.size = Math.random() * 5 + 2; // Size
            this.opacity = 1;
            this.decay = Math.random() * 0.02 + 0.015; // Fade decay
            this.gravity = 0.08; // Gravity pulls sparks downward
            
            const colors = [
                'rgba(255, 255, 255, ', // White hot
                'rgba(0, 229, 255, ',   // Neon Cyan
                'rgba(0, 150, 255, ',   // Electric Blue
                'rgba(130, 240, 255, '  // Light Ice Blue
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
            this.opacity -= this.decay;
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }
    }

    const triggerSparkBurst = () => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // Spawn 120 sparks
        for (let i = 0; i < 120; i++) {
            particles.push(new SparkParticle(centerX, centerY));
        }
    };

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

        // Filter and update/draw particles (garbage-collect dead sparks)
        particles = particles.filter(p => {
            if (p instanceof Particle) {
                p.update(timestamp);
                p.draw();
                return true;
            } else {
                p.update();
                p.draw();
                return p.opacity > 0;
            }
        });

        requestAnimationFrame(animateParticles);
    };

    // Start particles system
    initParticles();
    animateParticles();

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

        // Stop any running fade out
        if (fadeIntervalId) {
            clearInterval(fadeIntervalId);
            fadeIntervalId = null;
        }
        nhacAudio.volume = 1.0;

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
                        triggerSparkBurst();

                        // Add light explosion flash animation
                        if (flashOverlay) {
                            flashOverlay.classList.remove('flash-active');
                            flashOverlay.offsetHeight; /* trigger reflow */
                            flashOverlay.classList.add('flash-active');
                        }

                        // Add zoom out animation to the number
                        countdownNumber.style.animation = 'zoomOut 1s ease-in forwards';

                        // At the peak of the flash (200ms), swap elements and play video
                        setTimeout(() => {
                            // Hide countdown Display
                            if (countdownDisplay) {
                                countdownDisplay.classList.add('hide');
                            }
                            
                            // Hide buttons
                            const buttonsWrapper = document.querySelector('.buttons-wrapper');
                            if (buttonsWrapper) {
                                buttonsWrapper.style.display = 'none';
                            }

                            // Turn off blur overlay
                            if (blurOverlay) {
                                blurOverlay.classList.remove('active');
                            }



                            // Play background music nhac.mp3 immediately
                            nhacAudio.currentTime = 0;
                            nhacAudio.play().catch(e => console.log("Nhac audio play failed:", e));

                            // Hide the first LED background immediately to prevent it from showing behind/under the video
                            const bg1 = document.querySelector('.background-container.bg-1');
                            if (bg1) {
                                bg1.style.display = 'none';
                            }
                            
                            // Start video playback muted as visual background
                            if (eventVideo) {
                                eventVideo.muted = true;
                                eventVideo.classList.add('active');
                                                                // Đóng băng hình ở giây cuối cùng (freeze on the last frame)
                                 eventVideo.ontimeupdate = () => {
                                     if (eventVideo.duration && eventVideo.currentTime >= eventVideo.duration - 1.09) {
                                         eventVideo.pause();
                                         eventVideo.ontimeupdate = null; // Gỡ bỏ sự kiện sau khi đã đóng băng để giữ nguyên hình ảnh
                                         console.log("Video frozen on the last frame without seeking.");
                                     }
                                 };

                                eventVideo.play().then(() => {
                                    console.log("Video started successfully without delay.");
                                }).catch(e => {
                                    console.log("Video play failed:", e);
                                });
                            }

                            isFinished = true; // Mark as finished to allow tap/click reset
                        }, 200); // 200ms corresponds to the peak opacity of the light flash
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
            // Chồng mờ về background chính (cross-fade back to main bg)
            const bg1 = document.querySelector('.background-container.bg-1');
            if (bg1) {
                bg1.style.display = '';
                bg1.style.opacity = '0';
                bg1.offsetHeight; // trigger reflow
                bg1.style.opacity = '1';
            }
            
            // Xuống nhạc từ từ (fade down music slowly)
            fadeOutAudio(nhacAudio, 2000);

            if (eventVideo) {
                eventVideo.classList.remove('active');
                // Chờ video ẩn hoàn toàn mới pause và reset
                setTimeout(() => {
                    eventVideo.pause();
                    eventVideo.currentTime = 0;
                }, 500);
            }

            if (flashOverlay) {
                flashOverlay.classList.remove('flash-active');
            }

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
                // Chồng mờ về background chính (cross-fade back to main bg)
                const bg1 = document.querySelector('.background-container.bg-1');
                if (bg1) {
                    bg1.style.display = '';
                    bg1.style.opacity = '0';
                    bg1.offsetHeight; // trigger reflow
                    bg1.style.opacity = '1';
                }
                
                // Xuống nhạc từ từ (fade down music slowly)
                fadeOutAudio(nhacAudio, 2000);

                if (eventVideo) {
                    eventVideo.classList.remove('active');
                    // Chờ video ẩn hoàn toàn mới pause và reset
                    setTimeout(() => {
                        eventVideo.pause();
                        eventVideo.currentTime = 0;
                    }, 500);
                }

                if (flashOverlay) {
                    flashOverlay.classList.remove('flash-active');
                }
                
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
