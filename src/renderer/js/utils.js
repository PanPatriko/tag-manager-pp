function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function invertColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;
    return rgbToHex(invertedR, invertedG, invertedB);
}

export function setInvertedColor(span, color) {
    const invertedColor = invertColor(color);
    span.style.setProperty('--inverted-color', invertedColor);
}

export function highlightText(query, containerId, spanSelector) { 
    const container = document.getElementById(containerId);
    const spans = container.querySelectorAll(spanSelector);
    const lowerCaseQuery = query.toLowerCase();

    spans.forEach(span => {
        const text = span.textContent;
        const lowerCaseText = text.toLowerCase();
        const startIndex = lowerCaseText.indexOf(lowerCaseQuery);

        if (startIndex !== -1) {
            const endIndex = startIndex + query.length;
            const highlightedText = text.substring(startIndex, endIndex);
            const beforeText = text.substring(0, startIndex);
            const afterText = text.substring(endIndex);

            span.innerHTML = `${beforeText}<span class="highlight">${highlightedText}</span>${afterText}`;
        } else {
            span.innerHTML = text;
        }
    });
}

export function formatString(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}