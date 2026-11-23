import { world, system } from "@minecraft/server";

const IDS = {
  level:"sl_level", xp:"sl_xp", mana:"sl_mana", points:"sl_points",
  strength:"sl_str", vitality:"sl_vit", agility:"sl_agi", intelligence:"sl_int",
  kills:"sl_kills", quest:"sl_quest", questKills:"sl_qkills", dungeons:"sl_dungeons"
};
const RANKS = [{min:1,name:"E"},{min:10,name:"D"},{min:20,name:"C"},{min:35,name:"B"},{min:50,name:"A"},{min:75,name:"S"}];
const HOSTILES = new Set([
 "minecraft:zombie","minecraft:husk","minecraft:drowned","minecraft:skeleton","minecraft:stray",
 "minecraft:bogged","minecraft:creeper","minecraft:spider","minecraft:cave_spider","minecraft:enderman",
 "minecraft:witch","minecraft:phantom","minecraft:slime","minecraft:magma_cube","minecraft:blaze",
 "minecraft:ghast","minecraft:pillager","minecraft:vindicator","minecraft:evoker","minecraft:ravager",
 "minecraft:warden","minecraft:guardian","minecraft:elder_guardian","minecraft:piglin_brute",
 "minecraft:zoglin","minecraft:wither_skeleton"
]);
const cooldowns = new Map();
const dungeonCooldowns = new Map();
const shadowCooldowns = new Map();

function objective(key) {
 const id=IDS[key];
 return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id,id);
}
function score(player,key) { try { return objective(key).getScore(player) ?? 0; } catch { return 0; } }
function set(player,key,value) { objective(key).setScore(player,Math.max(0,Math.floor(value))); }
function add(player,key,value) { set(player,key,score(player,key)+value); }
function rank(level) { return [...RANKS].reverse().find(r=>level>=r.min)?.name ?? "E"; }
function xpNeed(level) { return level*100; }
function tell(player,msg) { player.sendMessage("§b[HUNTER SYSTEM] §f"+msg); }
function init(player) {
 for(const key of Object.keys(IDS)) objective(key);
 if(score(player,"level")<1) set(player,"level",1);
 if(score(player,"mana")<1) set(player,"mana",100);
}
function grantXp(player,amount) {
 let level=Math.max(1,score(player,"level")), xp=score(player,"xp")+amount, gained=0;
 while(xp>=xpNeed(level)){xp-=xpNeed(level);level++;gained++;add(player,"points",5);}
 set(player,"level",level);set(player,"xp",xp);
 if(gained) tell(player,"LEVEL UP! Lv."+level+" reached. +"+(gained*5)+" stat points.");
}
function status(player) {
 const l=score(player,"level");
 tell(player,"LEVEL "+l+" | RANK "+rank(l)+" | XP "+score(player,"xp")+"/"+xpNeed(l));
 tell(player,"MANA "+score(player,"mana")+"/100 | KILLS "+score(player,"kills")+" | DUNGEONS "+score(player,"dungeons"));
 tell(player,"STAT POINTS "+score(player,"points")+" | Active quest: "+(score(player,"quest")===1?"Slay 5 hostile mobs":"None"));
}
function stats(player) {
 tell(player,"STR "+score(player,"strength")+" | VIT "+score(player,"vitality")+" | AGI "+score(player,"agility")+" | INT "+score(player,"intelligence"));
 tell(player,"Spend: !sl add strength OR vitality OR agility OR intelligence");
}
function allocate(player,stat) {
 if(!["strength","vitality","agility","intelligence"].includes(stat)){tell(player,"Choose strength, vitality, agility or intelligence.");return;}
 if(score(player,"points")<1){tell(player,"No points available. Level up to earn 5.");return;}
 set(player,"points",score(player,"points")-1);add(player,stat,1);
 tell(player,stat.toUpperCase()+" increased to "+score(player,stat)+".");
}
function skill(player) {
 const until=cooldowns.get(player.id)??0;
 if(system.currentTick<until){tell(player,"Skill cooldown: "+Math.ceil((until-system.currentTick)/20)+" seconds.");return;}
 const cost=Math.max(15,30-score(player,"intelligence"));
 if(score(player,"mana")<cost){tell(player,"Not enough mana. Need "+cost+".");return;}
 set(player,"mana",score(player,"mana")-cost);cooldowns.set(player.id,system.currentTick+360);
 try {
  player.addEffect("strength",240,{amplifier:Math.min(2,Math.floor(score(player,"strength")/10)),showParticles:false});
  player.addEffect("speed",240,{amplifier:Math.min(1,Math.floor(score(player,"agility")/15)),showParticles:false});
  if(score(player,"vitality")>=5) player.addEffect("resistance",160,{amplifier:0,showParticles:false});
  tell(player,"POWER SURGE activated for 12 seconds!");
 } catch { tell(player,"Skill effects are unavailable on this Bedrock build."); }
}
function quest(player) {
 if(score(player,"quest")===1){tell(player,"Quest active: defeat 5 hostile mobs. Progress "+score(player,"questKills")+"/5.");return;}
 set(player,"quest",1);set(player,"questKills",0);
 tell(player,"NEW QUEST: Hunter Trial — defeat 5 hostile mobs for 120 XP and 25 Mana.");
}
function dungeon(player,tier) {
 const level=score(player,"level"), now=system.currentTick, until=dungeonCooldowns.get(player.id)??0;
 if(now<until){tell(player,"Dungeon gate recharge: "+Math.ceil((until-now)/20)+" seconds.");return;}
 const t=(tier||"normal").toLowerCase();
 const config={normal:{min:1,bossAmp:1,xp:250,guards:3,label:"E-RANK"},hard:{min:20,bossAmp:2,xp:500,guards:4,label:"C-RANK"},elite:{min:50,bossAmp:3,xp:900,guards:5,label:"A-RANK"}}[t];
 if(!config){tell(player,"Choose !sl dungeon normal, hard or elite.");return;}
 if(level<config.min){tell(player,config.label+" gate requires Hunter Lv."+config.min+".");return;}
 try {
  const p=player.location,dim=player.dimension;
  const boss=dim.spawnEntity(t==="elite"?"minecraft:ravager":"minecraft:husk",{x:p.x+5,y:p.y,z:p.z+5});
  boss.nameTag="§5"+config.label+" DUNGEON BOSS";
  boss.addTag("sl_dungeon_boss_"+t);boss.addTag("sl_dungeon_boss");
  boss.addEffect("strength",12000,{amplifier:config.bossAmp,showParticles:true});
  boss.addEffect("resistance",12000,{amplifier:Math.min(2,config.bossAmp-1),showParticles:true});
  for(let i=0;i<config.guards;i++){
   const mob=dim.spawnEntity(i%2===0?"minecraft:husk":"minecraft:stray",{x:p.x+3+(i%3)*2,y:p.y,z:p.z+8+Math.floor(i/3)*2});
   mob.nameTag="§8Dungeon Guard";mob.addTag("sl_dungeon_guard");
   if(config.bossAmp>1) mob.addEffect("strength",1200,{amplifier:1,showParticles:false});
  }
  dungeonCooldowns.set(player.id,now+1200);add(player,"dungeons",1);
  tell(player,config.label+" GATE OPENED! Defeat the boss and guards. Stay in a safe open area.");
 } catch {tell(player,"Could not open gate here. Try a clear, flat area.");}
}
function shadow(player) {
 const until=shadowCooldowns.get(player.id)??0;
 if(system.currentTick<until){tell(player,"Shadow summon recharge: "+Math.ceil((until-system.currentTick)/20)+" seconds.");return;}
 if(score(player,"level")<10){tell(player,"Shadow extraction unlocks at Hunter Lv.10.");return;}
 try {
  const p=player.location, wolf=player.dimension.spawnEntity("minecraft:wolf",{x:p.x+1,y:p.y,z:p.z+1});
  wolf.nameTag="§5SHADOW HOUND";wolf.addTag("sl_shadow_companion");
  const tame=wolf.getComponent("minecraft:tameable");
  if(tame&&typeof tame.tame==="function"){tame.tame(player);shadowCooldowns.set(player.id,system.currentTick+1200);tell(player,"Shadow Hound summoned!");}
  else {wolf.remove();tell(player,"Taming API unavailable on this Bedrock build.");}
 } catch {tell(player,"Summon failed. Try an open area.");}
}
function command(player,raw) {
 const a=raw.trim().toLowerCase().split(/\s+/), action=a[1]??"help";
 if(action==="help") tell(player,"!sl status | stats | add <stat> | skill | quest | dungeon <normal|hard|elite> | shadow");
 else if(action==="status") status(player);
 else if(action==="stats") stats(player);
 else if(action==="add") allocate(player,a[2]);
 else if(action==="skill") skill(player);
 else if(action==="quest") quest(player);
 else if(action==="dungeon") dungeon(player,a[2]);
 else if(action==="shadow") shadow(player);
 else tell(player,"Unknown command. Type !sl help.");
}
world.afterEvents.playerSpawn.subscribe(({player,initialSpawn})=>{
 init(player);
 if(initialSpawn){tell(player,"Hunter System online. Type !sl help.");status(player);}
});
world.afterEvents.entityDie.subscribe(({deadEntity,damageSource})=>{
 const killer=damageSource.damagingEntity;
 if(!killer||killer.typeId!=="minecraft:player"||deadEntity.typeId==="minecraft:player") return;
 init(killer);add(killer,"kills",1);
 if(deadEntity.hasTag("sl_dungeon_boss")){
  const bonus=deadEntity.hasTag("sl_dungeon_boss_elite")?900:deadEntity.hasTag("sl_dungeon_boss_hard")?500:250;
  grantXp(killer,bonus);add(killer,"mana",30);
  tell(killer,"DUNGEON CLEARED! +"+bonus+" XP and +30 Mana.");
 } else if(HOSTILES.has(deadEntity.typeId)){
  grantXp(killer,20);
  if(score(killer,"quest")===1){
   add(killer,"questKills",1);
   const progress=score(killer,"questKills");
   if(progress>=5){set(killer,"quest",0);set(killer,"questKills",0);grantXp(killer,120);add(killer,"mana",25);tell(killer,"QUEST COMPLETE! +120 XP and +25 Mana.");}
   else tell(killer,"Hunter Trial progress: "+progress+"/5.");
  }
 }
});
world.beforeEvents.chatSend.subscribe(event=>{
 if(!event.message.toLowerCase().startsWith("!sl")) return;
 event.cancel=true;const player=event.sender,message=event.message;
 system.run(()=>{init(player);command(player,message);});
});
system.runInterval(()=>{
 for(const player of world.getAllPlayers()){
  init(player);set(player,"mana",Math.min(100,score(player,"mana")+1));
  const l=Math.max(1,score(player,"level"));
  player.onScreenDisplay.setActionBar("§bHUNTER §fLv."+l+" §7| §e"+rank(l)+"-RANK §7| §dMP "+score(player,"mana")+"/100 §7| §aXP "+score(player,"xp")+"/"+xpNeed(l));
 }
},40);
