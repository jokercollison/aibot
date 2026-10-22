# Test release 0.2.18 — initial block facets

Adds 30 reviewed mining/location summaries for 15 terrain/resource blocks.
Includes Silk Touch, Fortune and tool requirements, with drop exceptions for
budding amethyst, gravel, clay, glass and ender chests. Preserves more detailed
existing ore-location answers. Block questions select the block rather than an
incidental enchantment; pronoun follow-ups work. Unreviewed mining questions
admit the gap instead of substituting a definition. Full block coverage remains
in progress. See BLOCK_PROGRESS.md.

Validation: npm run validate passes TypeScript, 213 automated tests, the 5,780
entity-question audit and build/package checks. Actual Minecraft testing pending.
Readable script: 6,180,385 bytes, 177,790 lines, longest line 1,607 characters.
Fresh five header/module UUIDs, exact version labels and matching dependency
verified. Add-on and standalone pack contents match the validated build byte for
byte. Add-on contains ordinary BP/RP folders directly at root. Earlier downloads
and approved banter are unchanged. Use a fresh world/new robot and matching pair.

Add-on SHA-256: `72a3ec9888d9e1323ddea8f8fa818f4b2c13034a4abded3a26057928bc21944f`.
