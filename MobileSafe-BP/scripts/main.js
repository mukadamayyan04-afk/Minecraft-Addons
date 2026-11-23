import { world, system } from "@minecraft/server";

const OBJECTIVES = {
  level: "sl_level", xp: "sl_xp", points: "sl_points", blocks: "sl_blocks",
  mission: "sl_mission", missionBlocks: "sl_mblocks", coins: "sl_coins",
  initialized: "sl_init", chapter: "sl_chapter", storyBlocks: "sl_sblocks",
  storyReady: "sl_sready", storyStarted: "sl_sstart"
};
const RANKS = [
  { min: 1, name: "E" }, { min: 10, name: "D" }, { min: 20, name: "C" },
  { min: 35, name: "B" }, { min: 50, name: "A" }, { min: 75, name: "S" }
];
const CHAPTERS = [
  { title: "The First Awakening", target: 10, rewardXp: 100, rewardCoins: 20,
    intro: "A strange blue notification appears before you. The Hunter Registry has detected an unusual potential within you. Your first task is simple: gather materials and prove you can prepare for the journey.",
    objective: "Break 10 blocks to gather supplies for the Hunter Registry.",
    complete: "The registrar studies your gathered supplies. 'You are inexperienced, but you have potential. Your registration is complete.'" },
  { title: "A Message from the Outpost", target: 20, rewardXp: 150, rewardCoins: 30,
    intro: "A remote outpost has stopped sending reports. The route is quiet, but the surrounding land is full of clues. The registry asks you to survey the area and bring back useful materials.",
    objective: "Break 20 blocks while surveying the nearby land.",
    complete: "Your survey reaches the registry. The missing report was delayed by a damaged supply route. The outpost is safe, and your work matters." },
  { title: "Echoes of the Old Mine", target: 30, rewardXp: 200, rewardCoins: 40,
    intro: "Miners have discovered an old chamber beneath the hills. Strange symbols cover its walls. No one knows who built it, so the registry needs a careful explorer to document the site.",
    objective: "Gather 30 blocks for the old-mine survey.",
    complete: "The symbols match an ancient map. It points toward a forgotten archive. Your discovery earns the attention of the senior researchers." },
  { title: "The Sealed Archive", target: 40, rewardXp: 250, rewardCoins: 50,
    intro: "The archive entrance is sealed behind a collapsed passage. The registry asks you to collect materials so the research team can safely restore the path.",
    objective: "Break 40 blocks to prepare restoration materials.",
    complete: "The archive is accessible again. Inside, researchers find records of hunters who mapped the world long before the registry existed." },
  { title: "A New Chapter", target: 50, rewardXp: 400, rewardCoins: 100,
    intro: "The registry has reviewed your journey. You began as an unknown newcomer; now your exploration reports are helping other hunters. One final supply mission remains before your first major evaluation.",
    objective: "Break 50 blocks to complete your final supply assignment.",
    complete: "Your first evaluation is complete. The registry recognizes you as a dependable explorer. This is not the end of your story; it is the beginning of a much larger world."
  }
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
function rank(level) { return [...RANKS].reverse().find(item => level >= item.min)?.name ?? "E"; }
function xpNeeded(level) { return level * 100; }
function say(player, message) { player.sendMessage("§b[HUNTER SYSTEM] §f" + message); }

function init(player) {
  for (const key of Object.keys(OBJECTIVES)) objective(key);
  if (get(player, "initialized") < 1) {
    set(player, "level", 1); set(player, "xp", 0); set(player, "initialized", 1);
    set(player, "chapter", 0); set(player, "storyBlocks", 0);
    set(player, "storyReady", 0); set(player, "storyStarted", 0);
  }
}
function giveXp(player, amount) {
  let level = Math.max(1, get(player, "level"));
  let xp = get(player, "xp") + amount;
  let gained = 0;
  while (xp >= xpNeeded(level)) {
    xp -= xpNeeded(level); level += 1; gained += 1; add(player, "points", 2);
  }
  set(player, "level", level); set(player, "xp", xp);
  if (gained) say(player, "LEVEL UP! Level " + level + " | +" + (gained * 2) + " exploration points.");
}
function status(player) {
  const level = Math.max(1, get(player, "level"));
  say(player, "Level " + level + " | " + rank(level) + " Rank | XP " + get(player, "xp") + "/" + xpNeeded(level));
  say(player, "Blocks gathered: " + get(player, "blocks") + " | Exploration points: " + get(player, "points") + " | Coins: " + get(player, "coins"));
}
function story(player) {
  if (get(player, "storyStarted") < 1) {
    say(player, "STORY MODE: Five chapters follow your journey from a new registry recruit to a trusted explorer.");
    say(player, "Type !sl accept to begin Chapter 1: The First Awakening.");
    return;
  }
  const chapterNumber = get(player, "chapter");
  if (chapterNumber > CHAPTERS.length) {
    say(player, "STORY COMPLETE: Your first Hunter Registry journey is finished. Type !sl help to see your other progression commands.");
    return;
  }
  const chapter = CHAPTERS[chapterNumber - 1];
  say(player, "CHAPTER " + chapterNumber + ": " + chapter.title);
  if (get(player, "storyReady") === 1) {
    say(player, chapter.complete);
    say(player, "Reward ready: +" + chapter.rewardXp + " XP and +" + chapter.rewardCoins + " Hunter Coins. Type !sl continue.");
  } else {
    say(player, chapter.intro);
    say(player, "OBJECTIVE: " + chapter.objective);
    say(player, "Progress: " + get(player, "storyBlocks") + "/" + chapter.target + " blocks.");
  }
}
function acceptStory(player) {
  if (get(player, "storyStarted") > 0) { say(player, "Your story has already started. Type !sl story to view your chapter."); return; }
  set(player, "storyStarted", 1); set(player, "chapter", 1); set(player, "storyBlocks", 0);
  set(player, "storyReady", 0);
  say(player, "STORY ACCEPTED. Your Hunter Registry journey begins now.");
  story(player);
}
function continueStory(player) {
  if (get(player, "storyStarted") < 1) { say(player, "Start your story first with !sl accept."); return; }
  const number = get(player, "chapter");
  if (number > CHAPTERS.length) { say(player, "You have completed every available story chapter."); return; }
  if (get(player, "storyReady") !== 1) { say(player, "Your current chapter is not complete yet. Type !sl story to check the objective."); return; }
  const chapter = CHAPTERS[number - 1];
  giveXp(player, chapter.rewardXp); add(player, "coins", chapter.rewardCoins);
  set(player, "chapter", number + 1); set(player, "storyBlocks", 0); set(player, "storyReady", 0);
  say(player, "CHAPTER CLEAR: " + chapter.title + " | +" + chapter.rewardXp + " XP | +" + chapter.rewardCoins + " Hunter Coins.");
  story(player);
}
function startMission(player) {
  if (get(player, "mission") === 1) {
    say(player, "Mining Trial progress: " + get(player, "missionBlocks") + "/25 blocks."); return;
  }
  set(player, "mission", 1); set(player, "missionBlocks", 0);
  say(player, "Mining Trial started: break 25 blocks to earn 100 XP and 20 Hunter Coins.");
}
function command(player, message) {
  const args = message.trim().toLowerCase().split(/\s+/);
  const action = args[1] ?? "help";
  if (action === "help") {
    say(player, "Commands: !sl status | mission | story | accept | continue | help");
  } else if (action === "status") status(player);
  else if (action === "mission") startMission(player);
  else if (action === "story") story(player);
  else if (action === "accept") acceptStory(player);
  else if (action === "continue") continueStory(player);
  else say(player, "Unknown command. Type !sl help.");
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  init(player);
  if (initialSpawn) {
    say(player, "Mobile Hunter Story Mode is ready. Type !sl help.");
    say(player, "A story awaits. Type !sl story to begin.");
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
      set(player, "mission", 0); set(player, "missionBlocks", 0);
      giveXp(player, 100); add(player, "coins", 20);
      say(player, "MINING TRIAL COMPLETE! +100 XP and +20 Hunter Coins.");
    }
  }
  if (get(player, "storyStarted") === 1 && get(player, "storyReady") === 0) {
    const chapterNumber = get(player, "chapter");
    const chapter = CHAPTERS[chapterNumber - 1];
    if (chapter) {
      const progress = get(player, "storyBlocks") + 1;
      set(player, "storyBlocks", progress);
      if (progress >= chapter.target) {
        set(player, "storyReady", 1);
        say(player, "CHAPTER OBJECTIVE COMPLETE: " + chapter.title + ". Type !sl story to read the ending.");
      }
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
    const chapter = get(player, "chapter");
    const storyLabel = get(player, "storyStarted") === 1 && chapter <= CHAPTERS.length ? " §7| §dCH " + chapter + "/5" : "";
    player.onScreenDisplay.setActionBar(
      "§bHUNTER §fLv." + level + " §7| §e" + rank(level) +
      " RANK §7| §aXP " + get(player, "xp") + "/" + xpNeeded(level) +
      " §7| §dPTS " + get(player, "points") + storyLabel
    );
  }
}, 40);
