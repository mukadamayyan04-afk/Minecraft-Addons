# Solo Leveling Mobile - Story Edition

A mobile-focused, non-combat Minecraft Bedrock add-on with selectable play modes, characters and a five-chapter Hunter Registry story.

## Choose your mode
- **Story** — five original chapters, narrative dialogue, objectives and rewards.
- **Explorer** — open-ended resource gathering and exploration XP.
- **Builder** — creative building progression with XP for placing blocks.

## Choose your character
- **Scout** — earns bonus XP from gathering blocks.
- **Scholar** — earns a 10% bonus to chapter XP rewards.
- **Architect** — earns bonus XP when placing blocks in Builder mode.

## Commands
- `!sl setup` — show setup and choices
- `!sl mode story|explore|builder` — choose a play mode
- `!sl character scout|scholar|architect` — choose a character
- `!sl story` — read the current chapter (Story Mode)
- `!sl accept` — begin the story
- `!sl continue` — claim a chapter reward and unlock the next chapter
- `!sl status` — show hunter stats
- `!sl mission` — start the optional Mining Trial
- `!sl help` — show commands

Mode and character choices are locked once the story begins. Player progress is stored in the world scoreboard.

## Safety and scope
This edition focuses on exploration, discovery, collection, construction and story progression. It does not add combat skills, hostile-mob spawning, weapons, boss encounters or combat companions.

## Compatibility
Targets Minecraft Bedrock 1.21.90+ and `@minecraft/server` 2.0.0.

## Import
Download the GitHub Actions artifact, extract the artifact ZIP, then open `SoloLeveling-Story-Edition.mcaddon` with Minecraft. Separate BP and RP `.mcpack` files are included.

## Test status
GitHub Actions checks JavaScript syntax, manifest JSON, pack roots and nested archive integrity. Actual in-game testing on the target phone and Minecraft version is still required.
