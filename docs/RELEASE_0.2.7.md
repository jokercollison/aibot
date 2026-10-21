# Test release 0.2.7 — conversation colors and entity feeding

Conversation history now shows player messages in aqua and bot replies in yellow,
retaining speaker labels and chronological order. New robots now start with
500 health points (250 hearts), matching a warden, instead of 40. Formatting resets after each
message; user-supplied formatting cannot change subsequent speaker colors.

Adds the entity work saved after 0.2.6: 498 curated topic summaries across 129
catalog subjects plus 95 component-backed health/feeding topic summaries. Food
uses remain separate for taming, breeding, healing and baby growth. Harmful
interactions such as parrot cookies are warnings; conflicting food advice is
withheld. Feeding questions and pronoun follow-ups retain the creature as subject.
The 208-page wiki entity inventory is classified for future Bedrock gap review.

Entity knowledge remains incomplete. Wiki classification is not answer coverage.
Complete conditional loot, additional mechanics and Bedrock reference gaps remain
pending. Automatic form bottom scrolling is unchanged; multiplayer is untested.

The user reports all 0.2.6 checklist questions answered correctly in single-player.
The 0.2.7 checklist covers only changed behavior. Both pack names and descriptions
show 0.2.7; all header/module UUIDs are fresh, content names are version-specific,
and the .mcaddon has ordinary pack folders directly at its root.

Validation: API checking, 89 automated tests and build/archive checks. These checks
do not execute Minecraft; 0.2.7 visual color/readability testing remains pending.
