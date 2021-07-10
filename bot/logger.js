const colors = {
    'boldtext': 1,
    'inversetext': 7,
    'blacktext': 30,
    'redtext': 31,
    'greentext': 32,
    'yellowtext': 33,
    'bluetext': 34,
    'magentatext': 35,
    'cyantext': 36,
    'whitetext': 37,
    'redbg': 41,
    'greenbg': 42,
    'yellowbg': 43,
    'bluebg': 44,
    'magentabg': 45,
    'cyanbg': 46,
    'whitebg': 47
};

const handleColor = (color) => color.toLowerCase().split('_').filter(t => /(bg|text)$/.test(t)).map(x => `\x1b[${colors[x]}m`).join('');

/**
 * Logs strings and stuff.
 * @param {any[]} arg A string of args.
 */
module.exports = (...arg) => {
    text = arg.map(x => `${x}`).join(' ');
    for (let match of text.match(/\{(\w+)\:(.*?)\}/g) || [])
        text = text.replace(match, `${handleColor(match.match(/^\{(\w+)\:/)[1])}${match.split(':').slice(1).join(':').slice(0, -1).replace(/\<ob\>/g, '{').replace(/\<cb>/g, '}')}\x1b[0m`)
    console.log(text);
};