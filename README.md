# Solo Leveling Bedrock Addon

Android Bedrock RPG addon. Current content is a gameplay foundation, not a complete anime recreation.

## Hunter progression
- Levels, XP, E/D/C/B/A/S ranks, actionbar HUD, stat points.
- STR, VIT, AGI and INT stats.
- Mana regeneration and Power Surge skill with cooldown.
- Hostile-mob kill tracking.

## Missions and gates
- Hunter Trial quest: defeat 5 hostile mobs for bonus XP and mana.
- Normal E-rank, Hard C-rank and Elite A-rank dungeon encounters.
- Dungeon boss and guard waves, rank/level gates, cooldown and boss rewards.
- Shadow Hound summon unlocks at level 10, subject to Bedrock tameable API support.

## Commands
- `!sl help`
- `!sl status`
- `!sl stats`
- `!sl add strength` (also vitality, agility, intelligence)
- `!sl skill`
- `!sl quest`
- `!sl dungeon normal`, `!sl dungeon hard`, `!sl dungeon elite`
- `!sl shadow`

## Install
Download the latest `.mcaddon` from Releases and open it with Minecraft. Activate both packs in world settings.

## Compatibility and limitations
Targets Bedrock 1.21.90+ with `@minecraft/server` 2.0.0. The exact Android build must be tested in-game. The current RP is a minimal resource-pack shell; original HD textures, custom geometry, animations, custom sounds, and custom UI are still under development. Do not treat the package size as a measure of completeness.
