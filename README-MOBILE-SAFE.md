# Solo Leveling Mobile - Story Edition

A mobile-focused, non-combat Minecraft Bedrock add-on with a five-chapter Hunter Registry story.

## Story mode
- Five original chapters with narrative introductions, mission objectives and chapter endings
- Persistent chapter and objective progress using the world scoreboard
- Chapter rewards: XP and Hunter Coins
- Hunter levels and E/D/C/B/A/S ranks
- Exploration XP from breaking blocks
- Separate Mining Trial side mission
- Lightweight actionbar HUD showing hunter level, rank, XP and current story chapter

## Commands
- `!sl help` — show commands
- `!sl story` — read the current chapter and objective
- `!sl accept` — begin the story
- `!sl continue` — claim the chapter reward and unlock the next chapter
- `!sl status` — show hunter stats
- `!sl mission` — start the optional Mining Trial

## Safety and scope
This edition focuses on exploration, discovery, collection and story progression. It does not add combat skills, hostile-mob spawning, weapons, boss encounters or combat companions.

## Compatibility
Targets Minecraft Bedrock 1.21.90+ and `@minecraft/server` 2.0.0.

## Import
Download the GitHub Actions artifact, extract the artifact ZIP, then open `SoloLeveling-Mobile-Story.mcaddon` with Minecraft. Separate BP and RP `.mcpack` files are included.

## Test status
GitHub Actions checks JavaScript syntax, manifest JSON, pack roots and nested archive integrity. Actual in-game testing on the target phone and Minecraft version is still required.
