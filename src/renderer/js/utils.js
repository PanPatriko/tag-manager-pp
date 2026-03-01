export const thumbnailDir = '.t'

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

export function inputAutoResize(input) {
    input.style.width = (input.value.length + 2) + 'ch';
}

export function formatString(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}

export function formatSize(bytes) {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '—';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatBirthtime(birthtimeMs) {
    if (!birthtimeMs || isNaN(birthtimeMs)) return '—';

    const date = new Date(birthtimeMs);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${y}.${m}.${d} ${hh}:${mm}:${ss}`;
}