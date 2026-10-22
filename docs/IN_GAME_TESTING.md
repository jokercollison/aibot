# Current release checks

For 0.2.17, use only the [short changed-feature checklist](../downloads/Robot_Test_Checklist-0.2.17.txt). The list below is retained as a historical full-system reference, not a request to repeat completed checks. Multiplayer remains untested.

# Actual Minecraft test checklist — not run in cloud

Use a disposable Creative world, current retail Bedrock, both packs enabled and all experimental toggles off. Enable the Creator Content Log in Minecraft settings and record the exact game version, platform and log output.

1. Import the `.mcaddon`. Confirm two packs, no missing dependencies, no JSON/component/script errors and no experimental requirements.
2. Spawn `tts_ai_bot_v0_2_1:robot`. Check its texture, geometry, walking animation, visible name, interaction prompt and audible original chirp. Confirm it neither burns in daylight nor attacks players on spawn.
3. First player interacts: confirm a single introduction, successful ownership and menu. Close and reopen forms. Try with full inventory, controller and touchscreen as available. Close chat before opening forms if Minecraft reports the player is busy.
4. Second player interacts: confirm owner-only rejection and no rename, control or transfer. Test simultaneous first claims on a fresh robot. Attempt interaction while the owner has a settings form open.
5. Follow owner on ordinary terrain. Check stop distance, walls, slopes, water and loaded-chunk edges. Stay should disable following; gravity, pushing and enabled combat can still move the robot. There is no cross-dimension recall or long-distance unloaded-chunk recovery.
6. Enable defense and have a hostile mob attack the owner. Confirm target selection and damage. Test PvP and another player's pets; do not ship multiplayer behavior until these policies are reviewed. Disable defense and ensure future targeting stops; inspect whether an existing native target persists.
7. Set home at a safe location. Walk away and return. Block the home or unload its chunk and confirm a clear failure rather than forced placement. Try home across dimensions; it must refuse. The current return is a checked teleport, not walking home.
8. Rename and change settings; save, leave and reload the world. Confirm owner identity, name, mode, home and settings persist. Confirm another robot has independent state.
9. Ask crafting, fear, breeding, unknown, enchantment and follow-up questions. Confirm ingredient-only answers with no grid positions or developer notes, and check text lengths on all target devices. Ask ingredient-use and ambiguous queries. Verify no arbitrary chat interception or external network is needed.
10. Bring a creeper nearby, approach lava at foot level and lower player health. Confirm contextual warning and one-minute cooldown. These checks do not cover all lava geometry or hazards.
11. Stress test multiple players/robots, profile startup of the ~3 MB bundled script, tick time and memory on low-end devices. Confirm bounded scans do not cause a watchdog stop and content logs stay clean. Run fully disconnected from the internet.

Record pass/fail and logs for each item before calling the build playable or Marketplace-ready. Automated Node and simulated-API tests do not establish any of these engine outcomes.

For 0.2.0 also verify existing saved tts:robot companions, the new tts_ai_bot:robot spawn egg, both versioned pack entries, Test robot sound, and hopper what/does/crafting follow-ups. The user reports earlier single-player checks; new release and multiplayer checks remain distinct.

From 0.2.1 onward, use a fresh world and matching versioned pair. Confirm v0.2.1 in the menu, Things to try, the exact diamond sword ingredient answer, and the unchanged 0.1.1 body mapping. Old robot compatibility instructions above apply only to historical 0.2.0; isolated versions deliberately do not manage earlier robots.
