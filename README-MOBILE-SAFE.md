# Solo Leveling Mobile - Story Edition

A mobile-focused, non-combat Minecraft Bedrock add-on with selectable play modes, characters, five original illustrated chapter cards and a five-chapter Hunter Registry story.

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

## Import on Android
1. Open the GitHub Release page for `v0.4.1-mobile-safe` and download the actual `SoloLeveling-Story-Edition.mcaddon` release asset (not the Actions artifact ZIP).
2. Open Minecraft, then use Android Files to locate the downloaded `.mcaddon` and choose **Open with Minecraft** if prompted.
3. If `.mcaddon` is still not associated with Minecraft, download the two actual `.mcpack` release assets and open each with Minecraft separately; then activate both packs in the world's settings.
4. Do not rename a GitHub Actions artifact ZIP to `.mcaddon`. The artifact ZIP is only a container; the release assets are the actual Bedrock files.

**Android note:** Some file managers do not register .mcaddon/.mcpack as supported file types and show a generic '?' icon. That icon alone does not prove the pack is corrupt. If Minecraft is still absent from the file-opening/share options, the remaining issue is Android's file-handler association; a packaging change cannot guarantee that the file manager will show Minecraft.

## Test status
GitHub Actions checks JavaScript syntax, manifest JSON, pack roots and nested archive integrity. Actual in-game testing on the target phone and Minecraft version is still required.
