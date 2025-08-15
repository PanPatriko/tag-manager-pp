import { refreshLabels } from './content/filesInfo.js';

export function formatString(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}