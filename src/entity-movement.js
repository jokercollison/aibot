export const movementTopics=['lifetime','relocation','teleportation'];
export function movementTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:despawn|despawns|despawning|disappear|disappears|disappearing|persistent|persistence|vanished|missing|lifetime|live forever|last forever)\b|\bkeep\b.*\bforever\b/.test(q))return 'lifetime';
 if(/\b(?:teleport|teleports|teleporting|teleportation)\b/.test(q))return 'teleportation';
 if(/\b(?:how do i|how can i|can i|best way to)\b.*\b(?:move|transport|relocate|bring|take home)\b/.test(q))return 'relocation';
 return null;
}
