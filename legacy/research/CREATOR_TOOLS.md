# Mojang Minecraft Creator Tools — evaluated 2026-10-20

Source: https://www.npmjs.com/package/@minecraft/creator-tools (npm page blocked by HTTP 403 in this review)
Primary verified documentation: https://learn.microsoft.com/en-us/minecraft/creator/documents/mctoolsoverview?view=minecraft-bedrock-stable (page last updated 2026-05-05)
Upstream: https://github.com/Mojang/minecraft-creator-tools
CLI instructions: https://github.com/Mojang/minecraft-creator-tools/blob/main/app/jsnode/README.md
Changelog: https://github.com/Mojang/minecraft-creator-tools/blob/main/CHANGELOG.md

## Relevance to AI Bot
Development workflow, not player-facing offline knowledge. Use to scaffold brand-new packs, generate entity starter files, inspect and validate behavior/resource pack JSON, preview assets, export .mcaddon, and deploy to test Minecraft installation. Do not transplant code from the old AI prototype.

## Requirements and tested documentation
- Node.js 22+ and npm 10+ for CLI, per upstream CLI README.
- Install `npm install -g @minecraft/creator-tools` (installation NOT performed here).
- `mct eula` is a one-time prerequisite for workflows; user must accept applicable terms themselves.
- `mct create -o ./my-addon` to scaffold.
- `mct add cow my_cow -i ./my-addon` example to add an entity template; actual robot entity should have its own identifier/model.
- `mct validate -i ./my-addon` validation, and `mct view -i ./my-addon` preview.
- `mct deploy retail -i ./my-addon --test-world --launch` requires Windows and Minecraft installed.
- `mct exportaddon` packages a .mcaddon; see `mct exportaddon --help` for exact flags.
- `mct mcp` provides local MCP interface for AI coding agents. Upstream explicitly shows `codex mcp add minecraft -- mct mcp`.
- `mct skills` lists bundled, version-matched assistant workflows.
- Web tool mctools.dev can inspect ZIP/MCAddon/MCPack locally in browser; project storage can be cleared, so back up files.
- Validation reports export as CSV/HTML; validation does not replace Minecraft runtime and Marketplace QA.

## Status and limitations
- Upstream describes the tool as pre-release alpha; pin and test versions before production use.
- No Creator Tools binary has been installed, run, or used to validate AI Bot in this research stage.
- npm page could not be opened (HTTP 403); installation commands corroborated from official Mojang repository and Microsoft Learn.
- Do not assume package release version or API module versions from these references; check at implementation time.

## Project decision
Adopt as an optional development/validation tool. The offline bot runtime must NOT depend on Creator Tools or internet access. Record validation results with future build artifacts.
