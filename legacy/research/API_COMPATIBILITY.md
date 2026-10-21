# API compatibility and implementation checks — 2026-10-20

## Confirmed from Microsoft Learn stable-view pages

1. **`@minecraft/server` module versions:** current module overview lists 2.10.0 and 2.9.0, with latest page context mentioning Minecraft 1.26.60 beta. This does **not** establish which version is available on the user’s 1.26.50.4 runtime. Do not pin 2.10.0 until tested on target release. Source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable
2. **`ModalFormData.textField()` changed between major versions.** Current reference: `textField(label, placeholderText, textFieldOptions?)`; prior 1.x reference: `textField(label, placeholderText, defaultValue?)`. Existing AI.zip uses older `@minecraft/server-ui` 1.2.0; port carefully and test. Sources: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/modalformdata?view=minecraft-bedrock-stable and https://learn.microsoft.com/en-us/minecraft/creator/priorscriptapi/minecraft/server-ui-1xx/modalformdata?view=minecraft-bedrock-stable
3. **UI show is asynchronous and cannot run in restricted-execution mode.** Defer UI invocation appropriately, handle canceled forms, player disconnects, and rejected promises. Source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/modalformdata?view=minecraft-bedrock-stable
4. **`ModalFormResponse.formValues` is an ordered array** of booleans, numbers, strings, or undefined. Validate index and type before using entered robot name. Source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/modalformresponse?view=minecraft-bedrock-stable
5. **Entity dynamic properties:** `getDynamicProperty`, `setDynamicProperty`, `getDynamicPropertyIds`, and `getDynamicPropertyTotalByteCount` are documented. Values include boolean, number, string, Vector3. These are candidates for each robot's name, owner, and settings; implement validation, migrations and size limits. Source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entity?view=minecraft-bedrock-stable
6. **World dynamic properties** also exist, useful for world-level indices and configuration. World exposes `getEntity(id)` but entity ID persistence/reliability across sessions still requires testing. Source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/world?view=minecraft-bedrock-stable
7. **UI API evolution:** `ActionFormData` has current `header`, `label`, and `divider` methods; avoid assuming all old and new signatures are interchangeable. Source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/actionformdata?view=minecraft-bedrock-stable
8. **Chat interception:** earlier documentation pass found `world.beforeEvents.chatSend` flagged pre-release; maintain interaction + text form as the stable baseline, verify again before shipping.

## Implementation consequences
- Separate UI adapter from bot logic so different form API versions can be supported if needed.
- Do not promise free-form chat wake words as a stable Marketplace capability until verified.
- Persist `tts_ai_bot:name`, `tts_ai_bot:owner`, `tts_ai_bot:mode`, and a schema version, with sanitization and error handling; property key names are proposals, not tested code.
- Build a test matrix: fresh world, rejoin, unload/reload, two players, two bots with same name, owner disconnect, canceled form, UI busy, addon update/migration.

## Not yet verified
- Exact server-ui stable dependency version on 1.26.50.4.
- Dynamic-property persistence edge cases after entity destruction and pack UUID changes.
- Stable owner identity strategy and entity follow-owner implementation.
- Actual runtime behavior of all APIs. No game test has been performed.
