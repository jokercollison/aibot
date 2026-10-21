# Minecraft AI Bot — verified research notes
Review date: 2026-10-20. This is a working reference, not a claim of exhaustive review.

## Primary references
- Minecraft Creator portal: https://learn.microsoft.com/en-us/minecraft/creator/?view=minecraft-bedrock-stable
- API module and available versions: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable
- API changelog: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/changelog?view=minecraft-bedrock-stable
- Before events: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/worldbeforeevents?view=minecraft-bedrock-stable
- Text forms: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/modalformdata?view=minecraft-bedrock-stable
- Entity interaction event: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/playerinteractwithentityafterevent?view=minecraft-bedrock-stable
- Reference overview: https://learn.microsoft.com/en-us/minecraft/creator/reference/?view=minecraft-bedrock-stable
- Bedrock Samples guide: https://learn.microsoft.com/en-us/minecraft/creator/documents/moreinfosources?view=minecraft-bedrock-stable

## Confirmed findings and cautions
- Uploaded Bedrock Samples v1.26.50.4 are a vanilla pack/schema/metadata reference, NOT a complete demonstration of script-powered gameplay. Microsoft explicitly cautions that samples do not cover all platform capabilities.
- The current API module page lists stable @minecraft/server 2.10.0 and previous 2.9.0; its note refers to 1.26.60 beta. Do NOT equate vanilla sample version 1.26.50 with a script module version. Test chosen dependency in actual target stable Minecraft client.
- WorldBeforeEvents.chatSend is marked pre-release in the stable reference. Do not make player-chat interception the only way to talk to bot.
- ModalFormData.textField and .show are documented; show cannot run in restricted-execution mode.
- PlayerInteractWithEntityAfterEvent exposes player and target; appropriate interaction entry point.
- Per-robot persistence, owner validation, navigation, and multi-bot identity require implementation/testing; design decisions are not proof of working code.

## Next technical checks
1. Inspect stable world/entity dynamic properties, limits and behavior after entity unload/reload.
2. Confirm UI show scheduling and form cancellation handling.
3. Verify navigation components, follow-owner behavior and return-home reliability.
4. Validate event availability and dependency versions on the actual Minecraft 1.26.50 client.
5. Review entity, Molang, animation, sound and multiplayer documentation in depth.
6. Track all reviewed URLs with version/date and stable vs preview status.

## DigMinecraft (2026-10-20)
- Homepage: https://www.digminecraft.com/index.php
- See DIGMINECRAFT_RESEARCH.md and DIGMINECRAFT_COVERAGE.csv for verified sections, access limitations, edition caveats, and intake strategy.
