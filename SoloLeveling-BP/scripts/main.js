import { world, system } from "@minecraft/server";

const IDS = {
  level: "sl_level", xp: "sl_xp", mana: "sl_mana", points: "sl_points",
  strength: "sl_str", vitality: "sl_vit", agility: "sl_agi", intelligence: "sl_int",
  kills: "sl_kills"
};
const RANKS = [
  { min: 1, name: "E" }, { min: 10, name: "D" }, { min: 20, name: "C" },
  { min: 35, name: "B" }, { min: 50, name: "A" }, { min: 75, name: "S" }
];
const cooldowns = new Map();
const hostileTypes = new Set([
  "minecraft:zombie", "minecraft:husk", "minecraft:drowned", "minecraft:skeleton",
  "minecraft:stray", "minecraft:bogged", "minecraft:creeper", "minecraft:spider",
  "minecraft:cave_spider", "minecraft:enderman", "minecraft:witch", "minecraft:phantom",
  "minecraft: slime", "minecraft:slime", "minecraft:magma_cube", "minecraft:blaze",
  "minecraft:ghast", "minecraft:pillager", "minecraft:vindicator", "minecraft:evoker",
  "minecraft:ravager", "minecraft:warden", "minecraft:guardian", "minecraft:elder_guardian",
  "minecraft:piglin_brute", "minecraft:zoglin", "minecraft:wither_skeleton"
]);

function obj(key) {
  const id = IDS[key];
  return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, id);
}
function get(player, key) {
  try { return obj(key).getScore(player) ?? 0; } catch { return 0; }
}
function set(player, key, value) { obj(key).setScore(player, Math.max(0, Math.floor(value))); }
function add(player, key, value) { set(player, key, get(player, key) + value); }
function rank(level) { return [...RANKS].reverse().find(r => level >= r.min)?.name ?? "E"; }
function needXp(level) { return level * 100; }
function initialize(player) {
  for (const key of Object.keys(IDS)) obj(key);
  if (get(player, "level") < 1) set(player, "level", 1);
  if (get(player, "mana") < 1) set(player, "mana", 100);
}
function tell(player, message) { player.sendMessage(`§b[HUNTER SYSTEM] §f${message}`); }

function grantXp(player, amount) {
  let level = Math.max(1, get(player, "level"));
  let xp = get(player, "xp") + amount;
  let gained = 0;
  while (xp >= needXp(level)) {
    xp -= needXp(level);
    level++;
    gained++;
    add(player, "points", 5);
  }
  set(player, "level", level);
  set(player, "xp", xp);
  if (gained) tell(player, `LEVEL UP! You reached Lv.${level}. +${gained * 5} stat points.`);
}

function showStatus(player) {
  const level = get(player, "level");
  tell(player, `Lv.${level} | Rank ${rank(level)} | XP ${get(player, "xp")}/${needXp(level)} | Mana ${get(player, "mana")}/100`);
  tell(player, `Unspent points: ${get(player, "points")} | Kills: ${get(player, "kills")}`);
}
function showStats(player) {
  tell(player, `STR ${get(player, "strength")} | VIT ${get(player, "vitality")} | AGI ${get(player, "agility")} | INT ${get(player, "intelligence")}`);
  tell(player, "Use: !sl add strength|vitality|agility|intelligence");
}
function allocate(player, stat) {
  if (!["strength", "vitality", "agility", "intelligence"].includes(stat)) {
    tell(player, "Choose strength, vitality, agility or intelligence."); return;
  }
  if (get(player, "points") < 1) { tell(player, "No stat points available. Level up to earn 5."); return; }
  set(player, "points", get(player, "points") - 1);
  add(player, stat, 1);
  tell(player, `${stat.toUpperCase()} increased to ${get(player, stat)}.`);
}
function useSkill(player) {
  const key = player.id;
  const until = cooldowns.get(key) ?? 0;
  if (system.currentTick < until) {
    tell(player, `Skill cooldown: ${Math.ceil((until - system.currentTick) / 20)}s.`); return;
  }
  const cost = Math.max(15, 30 - get(player, "intelligence"));
  if (get(player, "mana") < cost) { tell(player, `Not enough mana. Need ${cost}.`); return; }
  set(player, "mana", get(player, "mana") - cost);
  cooldowns.set(key, system.currentTick + 20 * 18);
  try {
    player.addEffect("strength", 20 * 12, { amplifier: Math.min(2, Math.floor(get(player, "strength") / 10)), showParticles: false });
    player.addEffect("speed", 20 * 12, { amplifier: Math.min(1, Math.floor(get(player, "agility") / 15)), showParticles: false });
    if (get(player, "vitality") >= 5) player.addEffect("resistance", 20 * 8, { amplifier: 0, showParticles: false });
    tell(player, "POWER SURGE activated! Strength and speed boosted.");
  } catch { tell(player, "Skill effects are unavailable on this game version."); }
}
function startDungeon(player) {
  try {
    const p = player.location;
    const dim = player.dimension;
    const boss = dim.spawnEntity("minecraft:husk", { x: p.x + 5, y: p.y, z: p.z + 5 });
    boss.nameTag = "§5Dungeon Boss §d[ELITE]";
    boss.addTag("sl_dungeon_boss");
    boss.addEffect("strength", 20 * 60 * 10, { amplifier: 2, showParticles: true });
    boss.addEffect("resistance", 20 * 60 * 10, { amplifier: 1, showParticles: true });
    boss.addEffect("health_boost", 20 * 60 * 10, { amplifier: 3, showParticles: true });
    for (let i = 0; i < 3; i++) {
      const mob = dim.spawnEntity("minecraft:husk", { x: p.x + 3 + i * 2, y: p.y, z: p.z + 8 });
      mob.nameTag = "§8Dungeon Guard";
      mob.addTag("sl_dungeon_guard");
    }
    tell(player, "DUNGEON OPENED! Defeat the Elite Boss and its guards. Stay alert.");
  } catch { tell(player, "Could not create dungeon here. Try an open area."); }
}
function summonShadow(player) {
  try {
    const p = player.location;
    const wolf = player.dimension.spawnEntity("minecraft:wolf", { x: p.x + 1, y: p.y, z: p.z + 1 });
    wolf.nameTag = "§5Igris' Shadow Hound";
    const tameable = wolf.getComponent("minecraft:tameable");
    if (tameable && typeof tameable.tame === "function") {
      tameable.tame(player);
      tell(player, "Shadow companion summoned!");
    } else {
      wolf.remove();
      tell(player, "Shadow taming is not supported by this Bedrock version.");
    }
  } catch { tell(player, "Shadow summon failed. Try again in an open area."); }
}
function command(player, raw) {
  const args = raw.trim().toLowerCase().split(/\s+/);
  const action = args[1] ?? "help";
  if (action === "help") {
    tell(player, "Commands: !sl status | stats | add <stat> | skill | dungeon | shadow");
  } else if (action === "status") showStatus(player);
  else if (action === "stats") showStats(player);
  else if (action === "add") allocate(player, args[2]);
  else if (action === "skill") useSkill(player);
  else if (action === "dungeon") startDungeon(player);
  else if (action === "shadow") summonShadow(player);
  else tell(player, "Unknown command. Type !sl help.");
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  initialize(player);
  if (initialSpawn) {
    tell(player, "Hunter System online. Defeat hostile mobs for XP. Type !sl help.");
    showStatus(player);
  }
});

world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  const killer = damageSource.damagingEntity;
  if (!killer || killer.typeId !== "minecraft:player" || deadEntity.typeId === "minecraft:player") return;
  initialize(killer);
  add(killer, "kills", 1);
  if (deadEntity.hasTag("sl_dungeon_boss")) {
    grantXp(killer, 250);
    add(killer, "mana", 30);
    tell(killer, "DUNGEON CLEARED! +250 XP and +30 Mana.");
  } else if (hostileTypes.has(deadEntity.typeId)) {
    grantXp(killer, 20);
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  if (!event.message.toLowerCase().startsWith("!sl")) return;
  event.cancel = true;
  const player = event.sender;
  const message = event.message;
  system.run(() => { initialize(player); command(player, message); });
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    initialize(player);
    set(player, "mana", Math.min(100, get(player, "mana") + 1));
    const level = Math.max(1, get(player, "level"));
    player.onScreenDisplay.setActionBar(
      `§bHUNTER §fLv.${level} §7| §eRank ${rank(level)} §7| §dMP ${get(player, "mana")}/100 §7| §aXP ${get(player, "xp")}/${needXp(level)}`
    );
  }
}, 40);
