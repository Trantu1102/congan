const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. Fix .led-wrapper to use vw/vh
css = css.replace('.led-wrapper {\n    position: relative;\n    width: 100cqw;\n    height: 56.25cqw;\n    max-height: 100cqh;\n    max-width: 177.7777cqh;', 
`.led-wrapper {
    position: relative;
    width: 100vw;
    height: 56.25vw;
    max-height: 100vh;
    max-width: 177.7777vh;`);

// 2. Fix background-container
css = css.replace(/\.background-container\s*\{[\s\S]*?z-index: 0;\n\}/, (match) => {
    return match.replace('position: fixed;', 'position: absolute;').replace('min-height: 100dvh;', '');
});

// 3. Fix buttons-wrapper
css = css.replace(/\.buttons-wrapper\s*\{[\s\S]*?pointer-events: none;\n\}/, (match) => {
    return match.replace('position: fixed;', 'position: absolute;').replace(/padding-bottom: max[^;]+;/, 'padding-bottom: var(--buttons-bottom-spacing);');
});

// 4. Fix particlesCanvas
css = css.replace(/#particlesCanvas\s*\{[\s\S]*?z-index: 1;\n\}/, (match) => {
    return match.replace('position: fixed;', 'position: absolute;').replace('min-height: 100dvh;', '');
});

// 5. Fix blur-overlay
css = css.replace(/\.blur-overlay\s*\{[\s\S]*?transition:[^;]+;/m, (match) => {
    return match.replace('position: fixed;', 'position: absolute;').replace('min-height: 100dvh;', '');
});

// 6. Fix countdown-display
css = css.replace(/\.countdown-display\s*\{[\s\S]*?z-index: 15;\n\}/, (match) => {
    return match.replace('position: fixed;', 'position: absolute;');
});

// 7. Fix start-overlay
css = css.replace(/\.start-overlay\s*\{[\s\S]*?cursor: pointer;/m, (match) => {
    return match.replace('position: fixed;', 'position: absolute;').replace('min-height: 100dvh;', '');
});

// 8. Fix rotate-overlay
css = css.replace(/\.rotate-overlay\s*\{[\s\S]*?box-sizing: border-box;/m, (match) => {
    return match.replace('position: fixed;', 'position: absolute;').replace('min-height: 100dvh;', '');
});

// Force background-size contain on background-container just in case
css = css.replace('background-size: cover;', 'background-size: contain;');

fs.writeFileSync('style.css', css);
console.log('Fixed CSS.');
