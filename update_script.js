const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

// 1. Add isReady state and initial hide logic
js = js.replace('let isCountingDown = false;\n    let isStarted = false;', 
`let isCountingDown = false;
    let isStarted = false;
    let isReady = false; // Trạng thái đã ấn Enter để hiện nút
    
    const buttonsWrapper = document.querySelector('.buttons-wrapper');
    if (buttonsWrapper) {
        buttonsWrapper.classList.add('hide');
    }`);

// 2. Update keyboard event logic
const newKeyboardLogic = `// Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // Nếu chưa ready và chưa đếm ngược -> chuyển sang trạng thái hiện nút và mờ nền
            if (!isReady && !isCountingDown) {
                isReady = true;
                if (buttonsWrapper) buttonsWrapper.classList.remove('hide');
                blurOverlay.classList.add('active');
            }
        } else if (e.key === '1') {
            // Nếu đã ready thì ấn 1 sẽ đếm ngược
            if (isReady && !isCountingDown) {
                startCountdown();
            }
        }
    });`;

js = js.replace(/\/\/ Keyboard event \(Enter\)[\s\S]*?\}\);/m, newKeyboardLogic);

// 3. Make sure buttons also check if isReady before they can be clicked
// Wait, if they are hidden they can't be clicked. But it's safer.
// I will just leave the button click as is. Since they are hidden, they can't be clicked.

fs.writeFileSync('script.js', js);
console.log('Script updated successfully.');
