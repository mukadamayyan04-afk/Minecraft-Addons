# Solo Leveling - Minecraft Bedrock Addon

A starter addon for Minecraft Bedrock Edition (Android / PE).

## Included packs

- **SoloLeveling-BP** — Behavior Pack with the Hunter progression foundation:
  - Hunter levels and XP scoreboards
  - E, D, C, B, A and S rank thresholds
  - XP for defeating entities
  - On-screen Hunter level, rank and XP display
- **SoloLeveling-RP** — Resource Pack with pack metadata and localization foundation.

## Build downloads

GitHub Actions packages three files:
- `SoloLeveling-BP.mcpack`
- `SoloLeveling-RP.mcpack`
- `SoloLeveling.mcaddon` (combined pack)

Open the repository's **Actions** tab, select **Package Solo Leveling Addon**, run the workflow, then download the artifact from the completed run.

## Install on Android

1. Download the combined `.mcaddon` file, or download both separate `.mcpack` files.
2. Open the downloaded file with Minecraft.
3. In the world settings, enable both the Behavior Pack and Resource Pack.
4. Create or enter the world and check that the Hunter System action bar appears.

## Compatibility note

The pack uses the stable `@minecraft/server` 2.0.0 script module. Compatibility depends on the installed Bedrock release. The GitHub workflow validates the JSON manifests and creates the package files; it does not replace an in-game test on the target Android device.

## Current scope

This is the first playable foundation, not a complete Solo Leveling remake. Dungeons, boss encounters, quests, custom hunter gear, shadow companions and custom art are not included yet.
