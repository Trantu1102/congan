const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. Update body and add .led-wrapper
css = css.replace(/body,\s*html\s*\{[\s\S]*?body\s*\{[\s\S]*?\}/, `body,
html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-color);
    background-color: #000;
}

body {
    overscroll-behavior: none;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
}

.led-wrapper {
    position: relative;
    width: 100vw;
    height: 56.25vw;
    max-height: 100vh;
    max-width: 177.7777vh;
    overflow: hidden;
    container-type: size;
}`);

// 2. fixed to absolute and 100dvh removal
css = css.replace(/\.background-container\s*\{[\s\S]*?z-index: 0;\n\}/, (match) => {
    return match.replace('fixed', 'absolute').replace('min-height: 100dvh;', '');
});

css = css.replace(/\.buttons-wrapper\s*\{[\s\S]*?pointer-events: none;\n\}/, (match) => {
    return match.replace('fixed', 'absolute').replace('padding-bottom: max(var(--buttons-bottom-spacing), calc(env(safe-area-inset-bottom, 0px) + 24px));', 'padding-bottom: var(--buttons-bottom-spacing);');
});

css = css.replace(/#particlesCanvas\s*\{[\s\S]*?z-index: 1;\n\}/, (match) => {
    return match.replace('fixed', 'absolute').replace('min-height: 100dvh;', '');
});

css = css.replace(/\.blur-overlay\s*\{[\s\S]*?transition:/, (match) => {
    return match.replace('fixed', 'absolute').replace('min-height: 100dvh;', '');
});

css = css.replace(/\.countdown-display\s*\{[\s\S]*?z-index: 15;/, (match) => {
    return match.replace('fixed', 'absolute');
});

css = css.replace(/\.start-overlay\s*\{[\s\S]*?cursor: pointer;/, (match) => {
    return match.replace('fixed', 'absolute').replace('min-height: 100dvh;', '');
});

css = css.replace(/\.rotate-overlay\s*\{[\s\S]*?box-sizing: border-box;/, (match) => {
    return match.replace('fixed', 'absolute').replace('min-height: 100dvh;', '');
});

// 3. vw/vh to cqw/cqh replacements in elements
// root variable
css = css.replace('--buttons-bottom-spacing: 40vh;', '--buttons-bottom-spacing: 40cqh;');

// Replace vw with cqw globally except in .led-wrapper
const parts = css.split('.led-wrapper {');
let afterLedWrapper = parts[1];
// careful, there are vw in box-shadow etc.
afterLedWrapper = afterLedWrapper.replace(/([0-9.]+)vw/g, '$1cqw');
afterLedWrapper = afterLedWrapper.replace(/([0-9.]+)vh/g, '$1cqh');

css = parts[0] + '.led-wrapper {' + afterLedWrapper;

fs.writeFileSync('style.css', css);
console.log('CSS updated successfully.');
