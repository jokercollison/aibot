export const DEFAULTS = Object.freeze({name: 'TTR-1', mode: 'stay', defend: false, warnings: true});
export function owns(playerId, ownerId) { return typeof ownerId === 'string' && ownerId.length > 0 && playerId === ownerId; }
export function safeName(value) {
  return String(value ?? '').replace(/§./g, '').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 24) || DEFAULTS.name;
}
export function decodeHome(raw) {
  try {
    const h = JSON.parse(raw);
    return h && ['minecraft:overworld','minecraft:nether','minecraft:the_end'].includes(h.dimension) && ['x','y','z'].every(k => Number.isFinite(h[k])) ? h : null;
  } catch { return null; }
}
export function canWarn(now, last, cooldown = 1200) { return last === undefined || now - last >= cooldown; }
