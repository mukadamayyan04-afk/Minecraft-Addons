# Solo Leveling Bedrock Addon

Android / Bedrock addon with a command-driven Hunter RPG foundation.

## Current implemented systems
- Hunter levels, XP progression, E/D/C/B/A/S ranks and actionbar HUD.
- Stat points on level-up: Strength, Vitality, Agility and Intelligence.
- Mana regeneration and a temporary Power Surge skill with cooldown.
- Dungeon encounter: Elite Husk boss and three guards; boss defeat grants bonus XP and mana.
- Shadow companion summon using a tamed wolf (only when the installed Bedrock API exposes tameable support).
- XP and kill tracking for a curated list of hostile mobs.
- Chat commands: `!sl help`, `!sl status`, `!sl stats`, `!sl add strength` (also vitality/agility/intelligence), `!sl skill`, `!sl dungeon`, `!sl shadow`.

## Install
1. Download the latest `.mcaddon` from GitHub Releases.
2. Open it with Minecraft.
3. Activate both the Solo Leveling Behavior Pack and Resource Pack in a world.
4. Enable the Script/Beta APIs only if Minecraft prompts for them.

## Compatibility
The pack targets Bedrock 1.21.90+ and uses `@minecraft/server` 2.0.0. Exact compatibility depends on the installed Android Bedrock build. This repository is not yet a complete recreation of the anime: custom dungeon dimensions, original 3D boss models, custom weapons/armor, cinematic UI, and persistent shadow army are not implemented yet.
