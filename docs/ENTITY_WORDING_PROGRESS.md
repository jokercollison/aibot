# Source work started after 0.2.13: age wording and short follow-ups

The published 0.2.13 artifact remains unchanged with its 172-test release record.
This next source batch begins with fixes to age interpretation:

- “not a baby”, “not babies”, “no longer a baby” and equivalent contractions do
  not trigger the baby-breeding rejection.
- Mentioning a parent’s existing babies does not classify that parent as a baby.
- After discussing breeding, “what about adults?” and “and babies” retain the
  previous species and topic. This context remains private to the conversation.

No new factual topic summaries were added; this improves access to existing
facts. The source now passes 177 automated tests plus API/readable-bundle checks.
These changes are not in the downloadable 0.2.13 build and require a future
version before Minecraft testing. Wider wording/state audits remain ongoing.

The next routing pass also fixes XP questions that mention “not a baby”, “no
longer a baby”, contractions, or a parent's existing offspring. These select the
existing adult reward rather than a baby reward. After an XP question, short
adult/baby follow-ups retain the species and XP topic. Switching to breeding
resets that topic normally; another conversation does not inherit the context.
Regression checks cover cows, zombies, piglins and hoglins. No factual summaries
were added and no numerical evidence conflicts were resolved by these changes.
