# Solo Leveling Mobile - Safe Progression Edition

This is a separate, lightweight Bedrock edition. The original project folders are preserved unchanged.

## Features
- Hunter levels and E/D/C/B/A/S ranks
- XP from mining blocks
- Mining Trial mission: break 25 blocks for bonus XP and Hunter Coins
- Persistent scoreboard progress
- Lightweight actionbar HUD
- Commands: `!sl help`, `!sl status`, `!sl mission`

This edition intentionally excludes combat skills, hostile-mob spawning, weapons, boss encounters and combat companions.

## Compatibility
Targets Minecraft Bedrock 1.21.90+ and `@minecraft/server` 2.0.0.

## Import
Download the generated `.mcaddon` from the GitHub Actions artifact, extract the artifact ZIP, then open `SoloLeveling-Mobile-Safe.mcaddon` with Minecraft. The separate BP and RP `.mcpack` files are included as fallbacks. Activate both packs in world settings.

## Test status
CI validates JSON manifests, pack root structure, nested archive integrity and JavaScript syntax. Actual in-game testing is still required on the target Minecraft version/device.
