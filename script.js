document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.main-button');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownNumber = document.getElementById('countdownNumber');
    const blurOverlay = document.getElementById('blurOverlay');
    const targetUrl = "https://daihoidang.cand.vn/";
    // Beep sound for countdown numbers
    const beepAudio = new Audio('beep.mp3');
    // Explosion sound for zero
    const explosionAudio = new Audio('explosion.mp3');

    // Adjust volume levels
    beepAudio.volume = 0.3; // Quieter beep
    explosionAudio.volume = 1.0; // Max volume for explosion

    let isCountingDown = false;

    // ========================================
    // Particles System
    // ========================================
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 80;

    // Resize canvas to full screen
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Twinkle effect
            this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset));

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

            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color + '0.5)';
        }
    }

    // Initialize particles
    const initParticles = () => {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };

    // Animate particles
    const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
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

        // Play first beep immediately for "5"
        playBeep();

        // Hide all buttons, show countdown, and activate blur
        buttons.forEach(btn => btn.classList.add('hide'));
        document.querySelector('.buttons-container').classList.add('hide');
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

                        // Add zoom out animation to the number, not the container
                        countdownNumber.style.animation = 'zoomOut 1s ease-in forwards';

                        // Delay redirect to let explosion sound play and zoom out animation complete
                        setTimeout(() => {
                            window.location.href = targetUrl;
                        }, 1500);
                    }, 1000); // Wait 1 second after showing "1"
                }
            }
        }, 1000);
    };

    // Click event for all buttons
    buttons.forEach(button => {
        button.addEventListener('click', startCountdown);
    });

    // Keyboard event (Enter)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startCountdown();
        }
    });

    // Handle initial focus on first button
    if (buttons.length > 0) {
        buttons[0].focus();
    }
});
