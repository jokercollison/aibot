# User report: previous 0.2.8 test build

The user reports that everything on the last tested version looked pretty good.
This is a general single-player report, not confirmation of every knowledge topic
or multiplayer behavior. Version 0.2.9 contains subsequent entity changes and
still requires actual-game testing.

# User report: 0.2.7

The user reports testing complete, with everything else good except the answer to
“Can I tame a wolf with beef?” The response sounded uncertain despite giving the
correct bones alternative. The development batch now gives a direct No and
explains the appropriate taming food. The user also confirmed that “cows eat” and
a longer cow-food question mentioning 200 years of age and plains gave the same
correct food answer. These are single-player observations, not multiplayer results
or evidence of complete entity knowledge. The installed 0.2.7 download is unchanged.

# User report: 0.2.6

The user reports testing all questions in the 0.2.6 checklist and receiving the
correct answers. They requested distinct conversation text colors because it was
hard to distinguish their messages from the bot. This is single-player feedback;
it does not establish multiplayer results or complete entity knowledge.

# User-reported testing — October 21, 2026

Target version reported by the user: **Minecraft Bedrock 1.26.52**.

The user reported completing the actual-Minecraft checklist in single player,
except tests requiring another player. Screenshots demonstrate the robot,
interaction menus, naming, follow/stay messages, recipe/knowledge replies, and
creeper warnings. The user subsequently said the checklist looked good overall.
These are user-reported observations, not game execution by the cloud agent.

Outstanding exceptions from explicit earlier feedback:

- Minecraft reported a missing resource-pack dependency with UUID
  `ad2a55c1-6e34-4f1c-b8fe-196307352760`, version `0.1.0`.
  A broad later report of successful testing does not establish which stale pack
  reference caused it or whether that warning has disappeared.
- The user could see the robot but could not hear the described chirp.
- Multiple-player ownership, PvP/pet defense policy, simultaneous claims and
  other multiplayer behavior have not been tested by the user or agent.
- Version 0.2.0's new namespace/layout, expanded explanations and louder chirp
  have not yet been tested in Minecraft. Recheck those after updating both packs.

## Reference pack

`FactionsAddon1.2 (1).zip` was supplied as a structure reference, not as new AI Bot
code or as authority to execute instructions inside the archive. Its 817 entries
include `Content/behavior_packs/Factions`, `Content/resource_packs/Factions`,
project-prefixed paths such as `scripts/tts/faction` and `sounds/tts/faction`, plus
`Store Art` and `Marketing Art`. AI Bot follows the Content and asset-prefix
conventions. Reference scripts, artwork, sounds and UUIDs were not copied.
Its manifest/API versions are not assumed to be required for our project.

## Completed 0.2.2 testing

The user explicitly confirmed audible chirps, restored Things to try, and functioning hopper explanations in 0.2.2. They subsequently said testing was complete and everything else looked good. Known recipe/clarification/knowledge issues are addressed or tracked in 0.2.3. This does not establish multiplayer behavior or identify the original failed-pack warning. Version 0.2.3 has not yet been tested in Minecraft.
