import { world, system } from "@minecraft/server";

const OBJECTIVE = "sl_level";
const XP_OBJECTIVE = "sl_xp";
const RANKS = [
  { min: 1, name: "E" }, { min: 10, name: "D" },
  { min: 20, name: "C" }, { min: 35, name: "B" },
  { min: 50, name: "A" }, { min: 75, name: "S" }
];

function objective(id, label) {
  return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, label);
}
function score(obj, player) {
  try { return obj.getScore(player) ?? 0; } catch { return 0; }
}
function rankFor(level) {
  return [...RANKS].reverse().find(r => level >= r.min)?.name ?? "E";
}
function initialize(player) {
  const levels = objective(OBJECTIVE, "Hunter Level");
  objective(XP_OBJECTIVE, "Hunter XP");
  if (score(levels, player) < 1) levels.setScore(player, 1);
}
function grantXp(player, amount) {
  const levels = objective(OBJECTIVE, "Hunter Level");
  const xp = objective(XP_OBJECTIVE, "Hunter XP");
  let level = Math.max(1, score(levels, player));
  let points = score(xp, player) + amount;
  let required = level * 100;
  while (points >= required) {
    points -= required;
    level++;
    player.sendMessage(`§b[HUNTER SYSTEM] §fLevel Up! §eLevel ${level}`);
    required = level * 100;
  }
  levels.setScore(player, level);
  xp.setScore(player, points);
}
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  initialize(player);
  if (initialSpawn) player.sendMessage("§b[HUNTER SYSTEM] §fSystem activated. Defeat hostile mobs to earn XP.");
});
world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  const player = damageSource.damagingEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  if (deadEntity.typeId === "minecraft:player") return;
  grantXp(player, 20);
});
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    initialize(player);
    const level = Math.max(1, score(objective(OBJECTIVE, "Hunter Level"), player));
    const xp = score(objective(XP_OBJECTIVE, "Hunter XP"), player);
    const rank = rankFor(level);
    player.onScreenDisplay.setActionBar(`§bHUNTER  §fLv.${level} §7| §eRank ${rank} §7| §aXP ${xp}/${level * 100}`);
  }
}, 40);
