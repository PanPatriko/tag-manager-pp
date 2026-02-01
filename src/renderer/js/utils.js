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

export function formatString(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}