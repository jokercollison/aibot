# Entity action prerequisites and carried-item drops after 0.2.12

43 reviewed conditional answers across 30 entity subjects strengthen the existing
knowledge rather than adding new species. Total reviewed topic summaries: 1,762.
Every subject remains complete=false; this is not an exhaustive state simulator.
Published 0.2.12 remains unchanged and awaits user testing.

## Behavior changes

- Reviewed breedable species reject baby breeding before the ordinary food answer.
  Requests to breed adults to produce a baby still work. A short baby follow-up
  can retain the previous species, independently for each conversation.
- Taming prerequisites apply to relevant adult parents; wolf/sniffer health
  requirements are checked separately from which food to use. The resolver does
  not apply ownership requirements to every wild animal by assumption.
- A baby sniffer cannot dig ancient seeds; adult ground and cooldown requirements
  remain separate.
- A fox’s held totem is consumed to prevent death, not returned as a normal drop.
  Food already eaten cannot be recovered as a held item.
- Piglin ingot admiration and picked-up pork exceptions have scoped replies;
  they do not replace unrelated experience or equipment questions.
- Zombie-to-drowned conversion does not create a naturally equipped trident.
  A held nautilus shell has its own guaranteed-on-death rule, supported by the
  preserved Nautilus Shell article, not an invented missing loot table.

Special answers retain their article revision/hash provenance. The conditions
module selects only a supported topic for that species; no article text or
external regular expressions are executed as code. Generic loot tables still
handle other kills. The fox and piglin sample loot payloads remain missing, the
parched-disc disagreement remains withheld, and existing XP conflicts remain.

Validation: API checking, 172 automated tests and temporary readable bundling.
Cases cover age/ownership/health, baby follow-ups, positive adult breeding,
consumed items, conversion, separate rewards and unrelated ordinary loot. Cloud
checks are not Minecraft execution; no new download was packaged in this batch.
