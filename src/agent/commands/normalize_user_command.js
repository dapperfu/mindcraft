import { directDigCommand } from './direct_dig.js';

/**
 * Turn common user chat shorthand into real Mindcraft !commands.
 * Leaves already-valid parenthesized commands alone.
 * @param {string} message
 * @param {string} source player name for defaults like !follow
 * @returns {string|null} rewritten command message, or null to leave unchanged
 */
export function normalizeUserCommand(message, source) {
    const text = String(message ?? '').trim();
    if (!text)
        return null;

    // Already canonical parenthesized forms — do not rewrite.
    if (/^!(?:collectBlocks|followPlayer|digStairs|boreTunnel|digDown)\s*\(/i.test(text))
        return null;

    const dig = directDigCommand(text);
    if (dig)
        return dig;

    let match = text.match(/^!mine\s+([A-Za-z0-9_]+)(?:\s+(\d+))?$/i);
    if (match)
        return `!collectBlocks("${match[1]}", ${match[2] || 1})`;

    match = text.match(/^!collectBlocks?\s+([A-Za-z0-9_]+)(?:\s+(\d+))?$/i);
    if (match)
        return `!collectBlocks("${match[1]}", ${match[2] || 1})`;

    match = text.match(/^!follow(?:\s+([A-Za-z0-9_]+))?(?:\s+([\d.]+))?$/i);
    if (match) {
        const player = match[1] || source;
        if (!player || player === 'system')
            return null;
        const dist = match[2] != null ? match[2] : 3;
        return `!followPlayer("${player}", ${dist})`;
    }

    return null;
}
