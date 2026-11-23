import { world, system } from "@minecraft/server";

const OBJECTIVES = {
  level: "sl_level",
  xp: "sl_xp",
  points: "sl_points",
  blocks: "sl_blocks",
  mission: "sl_mission",
  missionBlocks: "sl_mblocks",
  coins: "sl_coins",
  initialized: "sl_init"
};
const RANKS = [
  { min: 1, name: "E" }, { min: 10, name: "D" },
  { min: 20, name: "C" }, { min: 35, name: "B" },
  { min: 50, name: "A" }, { min: 75, name: "S" }
];

function objective(key) {
  const id = OBJECTIVES[key];
  return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, id);
}
function get(player, key) {
  try { return objective(key).getScore(player) ?? 0; } catch { return 0; }
}
function set(player, key, value) {
  objective(key).setScore(player, Math.max(0, Math.floor(value)));
}
function add(player, key, value) { set(player, key, get(player, key) + value); }
function rank(level) {
  return [...RANKS].reverse().find(item => level >= item.min)?.name ?? "E";
}
function xpNeeded(level) { return level * 100; }
function say(player, message) { player.sendMessage("§b[HUNTER SYSTEM] §f" + message); }

function init(player) {
  for (const key of Object.keys(OBJECTIVES)) objective(key);
  if (get(player, "initialized") < 1) {
    set(player, "level", 1);
    set(player, "xp", 0);
    set(player, "initialized", 1);
  }
}
function giveXp(player, amount) {
  let level = Math.max(1, get(player, "level"));
  let xp = get(player, "xp") + amount;
  let gained = 0;
  while (xp >= xpNeeded(level)) {
    xp -= xpNeeded(level);
    level += 1;
    gained += 1;
    add(player, "points", 2);
  }
  set(player, "level", level);
  set(player, "xp", xp);
  if (gained) say(player, "LEVEL UP! Level " + level + " | +" + (gained * 2) + " exploration points.");
}
function status(player) {
  const level = Math.max(1, get(player, "level"));
  say(player, "Level " + level + " | " + rank(level) + " Rank | XP " + get(player, "xp") + "/" + xpNeeded(level));
  say(player, "Blocks mined: " + get(player, "blocks") + " | Exploration points: " + get(player, "points") + " | Coins: " + get(player, "coins"));
}
function startMission(player) {
  if (get(player, "mission") === 1) {
    say(player, "Mining Trial progress: " + get(player, "missionBlocks") + "/25 blocks.");
    return;
  }
  set(player, "mission", 1);
  set(player, "missionBlocks", 0);
  say(player, "Mining Trial started: break 25 blocks to earn 100 XP and 20 Hunter Coins.");
}
function command(player, message) {
  const args = message.trim().toLowerCase().split(/\s+/);
  const action = args[1] ?? "help";
  if (action === "help") {
    say(player, "!sl status | mission | help");
  } else if (action === "status") {
    status(player);
  } else if (action === "mission") {
    startMission(player);
  } else {
    say(player, "Unknown command. Type !sl help.");
  }
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  init(player);
  if (initialSpawn) {
    say(player, "Mobile Hunter Progression is ready. Type !sl help.");
    status(player);
  }
});

world.afterEvents.playerBreakBlock.subscribe(({ player }) => {
  init(player);
  add(player, "blocks", 1);
  giveXp(player, 5);
  if (get(player, "mission") === 1) {
    const progress = get(player, "missionBlocks") + 1;
    set(player, "missionBlocks", progress);
    if (progress >= 25) {
      set(player, "mission", 0);
      set(player, "missionBlocks", 0);
      giveXp(player, 100);
      add(player, "coins", 20);
      say(player, "MINING TRIAL COMPLETE! +100 XP and +20 Hunter Coins.");
    }
  }
});

world.beforeEvents.chatSend.subscribe(event => {
  if (!event.message.toLowerCase().startsWith("!sl")) return;
  event.cancel = true;
  const player = event.sender;
  const message = event.message;
  system.run(() => { init(player); command(player, message); });
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    init(player);
    const level = Math.max(1, get(player, "level"));
    player.onScreenDisplay.setActionBar(
      "§bHUNTER §fLv." + level + " §7| §e" + rank(level) +
      " RANK §7| §aXP " + get(player, "xp") + "/" + xpNeeded(level) +
      " §7| §dPTS " + get(player, "points")
    );
  }
}, 40);
