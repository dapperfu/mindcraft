const DIRECTION_ALIASES = {
    '+x': '+x',
    '-x': '-x',
    '+z': '+z',
    '-z': '-z',
    east: '+x',
    west: '-x',
    south: '+z',
    north: '-z',
};

const DIRECTION_RE = /\+x|-x|\+z|-z|\beast\b|\bwest\b|\bnorth\b|\bsouth\b/ig;

function axis(token) {
    if (token == null)
        return null;
    return DIRECTION_ALIASES[String(token).trim().replace(/^["']|["']$/g, '').toLowerCase()] || null;
}

function firstAxis(text) {
    const match = text.match(DIRECTION_RE);
    return match ? axis(match[0]) : null;
}

function unquote(token) {
    return String(token).trim().replace(/^["']|["']$/g, '');
}

function boreCommand(distance, direction) {
    const length = Number(distance);
    const dir = axis(direction);
    if (!dir || !Number.isInteger(length) || length < 1)
        return null;
    return `!boreTunnel(${length}, "${dir}")`;
}

function stairsCommand(direction, y) {
    const dir = axis(direction);
    const target = Number(y);
    if (!dir || !Number.isInteger(target))
        return null;
    return `!digStairs("${dir}", ${target})`;
}

function commandFromPair(name, left, right) {
    if (name === 'boretunnel')
        return boreCommand(left, right) || boreCommand(right, left);
    if (name === 'digstairs')
        return stairsCommand(left, right) || stairsCommand(right, left);
    return null;
}

/**
 * Rewrite only digStairs / boreTunnel user shorthand into real commands.
 * Must not rewrite unrelated commands such as !followPlayer or !collectBlocks.
 * @param {string} message
 * @returns {string|null}
 */
export function directDigCommand(message) {
    const text = String(message ?? '').trim();
    if (!text)
        return null;

    // Only digStairs / boreTunnel call forms — never all 2-arg !commands.
    const call = text.match(/^!?(digstairs|boretunnel)\(\s*([^)]*)\s*\)$/i);
    if (call) {
        const args = call[2].split(',').map(unquote);
        if (args.length !== 2)
            return null;
        return commandFromPair(call[1].toLowerCase(), args[0], args[1]);
    }

    const shorthand = text.match(/^!?digStairs\s+(\S+)\s+(?:to\s+)?(-?\d+)$/i);
    if (shorthand)
        return stairsCommand(shorthand[1], shorthand[2]);

    if (/\b(?:stairs?|stairway|staircase|digstairs)\b/i.test(text)) {
        const dir = firstAxis(text);
        const target = text.match(/\by\s*(-?\d+)/i)?.[1] ?? text.match(/(-?\d+)\s*$/)?.[1];
        return stairsCommand(dir, target);
    }

    if (/\b(?:bore|tunnel|boretunnel)\b/i.test(text)) {
        const dir = firstAxis(text);
        const length = text.match(/(\d+)\s*blocks?/i)?.[1] ?? text.match(/(\d+)/)?.[1];
        return boreCommand(length, dir);
    }

    return null;
}
