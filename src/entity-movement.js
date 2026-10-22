export const movementTopics=['lifetime','relocation','teleportation'];
export function movementTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:despawn|despawns|despawning|disappear|disappears|disappearing|persistent|persistence|vanished|missing|lifetime|live forever|last forever)\b|\bkeep\b.*\bforever\b/.test(q))return 'lifetime';
 if(/\b(?:teleport|teleports|teleporting|teleportation)\b/.test(q))return 'teleportation';
 if(/\b(?:how (?:do|can) (?:i|you|we)|can (?:i|you|we)|best way to)\b.*\b(?:move|transport|relocate|bring|take home)\b/.test(q))return 'relocation';
 return null;
}
