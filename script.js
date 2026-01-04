document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.main-button');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownNumber = document.getElementById('countdownNumber');
    const targetUrl = "https://daihoidang.cand.vn/";
    // Beep sound for countdown numbers
    const beepAudio = new Audio('beep.mp3');
    // Explosion sound for zero
    const explosionAudio = new Audio('explosion.mp3');

    // Adjust volume levels
    beepAudio.volume = 0.3; // Quieter beep
    explosionAudio.volume = 1.0; // Max volume for explosion

    let isCountingDown = false;

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

        // Hide all buttons, show countdown
        buttons.forEach(btn => btn.classList.add('hide'));
        countdownDisplay.classList.remove('hide');

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
