# Decision register
- Offline-only AI Bot for Bedrock Marketplace; no cloud LLM or internet dependencies.
- Custom name onboarding via text UI; text-based command interaction.
- Stable interaction/UI first; direct player chat only after stable API validation.
- Separate per-player bots and ownership checks; do not assume player.persistentId is stable.
- Local structured knowledge, synonym matching, varied dialogue and nonverbal robot sounds.
- Use TTS-specific unique namespaces and UUIDs; reference Factions add-on without copying identifiers.
- Use v1.26.50.4 vanilla samples and Microsoft Learn with stable/preview distinction.
- Full cumulative ZIP releases Minecraft_AI_N.zip, preserving all prior planning and databases.

- 2026-10-20: Build entirely new add-on from scratch; legacy prototype naming and code are not retained.
- 2026-10-20: Scripting V2 startup/worldLoad restrictions must guide initialization.
- 2026-10-20: Keep Microsoft Learn research separate from the offline bot knowledge database; user will provide additional sites later.

- 2026-10-20: Mojang Creator Tools approved as optional development-time validation, preview, export and Codex MCP tooling. Not part of offline in-game knowledge/runtime. Source: research/CREATOR_TOOLS.md.
