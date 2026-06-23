(() => {
  "use strict";
  const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
  const transitionCanvas=document.getElementById("transitionCanvas"),transitionCtx=transitionCanvas.getContext("2d");
  const transitionMask=document.getElementById("transitionMask");
  const bootOverlay=document.getElementById("bootOverlay"),bootHint=document.getElementById("bootHint");
  const bootProgressFill=document.getElementById("bootProgressFill"),bootPercent=document.getElementById("bootPercent");
  const bootMascotCanvas=document.getElementById("bootMascots"),bootMascotCtx=bootMascotCanvas?.getContext("2d");
  const APP_VERSION=363;
  ctx.imageSmoothingEnabled=false;
  transitionCtx.imageSmoothingEnabled=false;
  if(bootMascotCtx)bootMascotCtx.imageSmoothingEnabled=false;
  const W=540,H=960;
  const DURATION=600,wrap=document.getElementById("wrap");
  const intro=document.getElementById("intro"),levelScreen=document.getElementById("levelup");
  const endScreen=document.getElementById("end"),choicesEl=document.getElementById("choices");
  const characterScreen=document.getElementById("characterScreen"),rewardScreen=document.getElementById("rewardScreen"),stageScreen=document.getElementById("stageScreen"),adventureBookScreen=document.getElementById("adventureBookScreen"),shopScreen=document.getElementById("shopScreen");
  const volumeSettings=document.getElementById("volumeSettings");
  const rewardTrack=document.getElementById("rewardTrackModal"),accountBox=document.getElementById("accountBox");
  const pauseScreen=document.getElementById("pauseScreen"),pauseStats=document.getElementById("pauseStats");
  const metaStatsEl=document.getElementById("metaStats"),metaPointsEl=document.getElementById("metaPoints"),metaRecordEl=document.getElementById("metaRecord"),powerBox=document.getElementById("powerBox");
  const adventureBookContent=document.getElementById("adventureBookContent"),bookSubTabs=document.getElementById("bookSubTabs");
  const bookTabSkills=document.getElementById("bookTabSkills"),bookTabStages=document.getElementById("bookTabStages"),bookTabBosses=document.getElementById("bookTabBosses");
  const rewardPlaytimeEl=document.getElementById("rewardPlaytime");
  const devModeBtn=document.getElementById("devModeBtn"),devResetBtn=document.getElementById("devResetBtn");
  const settingsOverlay=document.getElementById("settingsOverlay"),settingsHint=document.getElementById("settingsHint");
  const accountExportBtn=document.getElementById("accountExportBtn"),accountImportBtn=document.getElementById("accountImportBtn");
  const developerEntryBtn=document.getElementById("developerEntryBtn"),closeSettingsBtn=document.getElementById("closeSettingsBtn");
  const settingsDialog=document.getElementById("settingsDialog"),settingsDialogTitle=document.getElementById("settingsDialogTitle");
  const settingsDialogText=document.getElementById("settingsDialogText"),settingsDialogInput=document.getElementById("settingsDialogInput");
  const settingsDialogConfirm=document.getElementById("settingsDialogConfirm"),settingsDialogCancel=document.getElementById("settingsDialogCancel");
  const testModeOverlay=document.getElementById("testModeOverlay"),testModeHint=document.getElementById("testModeHint"),testModeStatus=document.getElementById("testModeStatus");
  const testModeRecorderText=document.getElementById("testModeRecorderText");
  const testModeMobileBtn=document.getElementById("testModeMobileBtn"),testModeDesktopBtn=document.getElementById("testModeDesktopBtn");
  const testModeStartBtn=document.getElementById("testModeStartBtn"),testModeStopBtn=document.getElementById("testModeStopBtn"),testModeExportBtn=document.getElementById("testModeExportBtn");
  const testInvincibleBtn=document.getElementById("testInvincibleBtn"),testAutoSkillBtn=document.getElementById("testAutoSkillBtn");
  const accountLevelEl=document.getElementById("accountLevel"),accountExpFill=document.getElementById("accountExpFill"),accountExpText=document.getElementById("accountExpText"),coinBox=document.getElementById("coinBox"),coinCountEl=document.getElementById("coinCount"),coinDevSubBtn=document.getElementById("coinDevSubBtn"),coinDevAddBtn=document.getElementById("coinDevAddBtn"),coinDebugBox=document.getElementById("coinDebugBox"),shopCoinCount=document.getElementById("shopCoinCount"),shopGrid=document.getElementById("shopGrid");
  const stageArt=document.getElementById("stageArt"),stageName=document.getElementById("stageName"),stagePower=document.getElementById("stagePower");
  const keys={up:false,down:false,left:false,right:false};
  const stick={active:false,pointerId:null,x:0,y:0,startX:0,startY:0};
  let running=false,paused=false,ended=false,last=0,time=0,spawnClock=0,shotClock=0,battleStartDelay=0;
  let giantCarrotCooldown=0;
  let enemies=[],shots=[],enemyShots=[],gems=[],effects=[],texts=[],areas=[],petShots=[],bananas=[],chests=[],pickups=[];
  let groundCache={canvas:null,ctx:null,zone:null,firstX:null,firstY:null,cols:0,rows:0,grid:64};
  let enemyGrid=new Map();
  let announcements=[],activeAnnouncement=null;
  let kills=0,score=0,eliteKills=0,bossKills=0,nextId=1,levelQueue=0;
  let eligibleKills=0,instantKills=0,instantKillTimer=0;
  let kps=0,kpsWindowKills=0,kpsWindowTime=0,kpsPressure=0;
  let chestClock=0,chestTravel=0,lastChestX=0,lastChestY=0,magnetAll=false,magnetTimer=0;
  let carrotVolley=0,pinkyBoostTimer=0,pinkyDamageBoost=1,pendingCarrotShots=0;
  let poisonTimer=0,poisonRate=0,stunTimer=0,potionHealTimer=0,currentStage=1,infiniteBossZone=0;
  let encirclementPressure=0,encirclementCharge=0,encirclementSampleClock=0,encirclementPressureRounds=0;
  let encirclementReservedHp=0,encirclementSectorBits=0,encirclementSectorCount=0,encirclementPrewarn=false,encirclementDebts=[];
  let infiniteDisplayOffset=0,infiniteDisplayFreezeStart=0,infiniteClearCount=0;
  let runRewarded=false,transitioning=false;
  let settingsDialogState=null;
  let bookMainTab="skills",bookStageTab=1;
  const BATTLE_START_DELAY=1.6;
  let escalationStart=null;
  let killSurgeActive=false;
  let finalPhase="none",finalTimer=0;
  let bossArena={active:false,x:0,y:0,r:360};
  let audio=null,muted=false;
  let runCoins=0,runCoinsSettled=false,walletCoins=0,autoSaveTimer=0;
  let coinSaveStatus={saveLocal:"-",saveSession:"-",metaLocal:"-",metaSession:"-",coinLocal:"-",coinSession:"-",coinCookie:"-"};
  let critSampleBuffer=null,critSampleLoading=false,critSoundLastTime=0;
  const CARROT_BASE_COOLDOWN=.72;
  const CARROT_MIN_CHAIN_INTERVAL=2/60;
  let xpSoundLastTime=0;
  let debugOverlayEnabled=false,debugFrameMs=16.7,debugFps=60,debugHeapMb=0,debugPeakFrameMs=16.7;
  let hudSampleTimer=0,hudEnemyCount=0,hudKills=0,hudKps=0;
  let sharedTargetCache=null,sharedTargetTimer=0;
  let debugPanelMode="perf",audioDebugTimer=0;
  let devTestProfile="mobile",devInvincible=false,devAutoUpgrade=false;
  let devTestRecorder={active:false,profile:"mobile",interval:2,elapsed:0,lastSampleAt:0,startReal:0,samples:[],perfPeaks:{},summary:null,battery:null};
  const IMPLEMENTED_STAGE_COUNT=3;
  let audioDebugCurrent={
    total:0,beep:0,external:0,xp:0,crit:0,
    ui:0,pickup:0,smallCarrot:0,giantLaunch:0,giantExplosion:0,
    externalFail:0
  };
  let audioDebugLast={...audioDebugCurrent};
  let perfDebugTimer=0,perfDebugAccumulator={frameMs:0,fps:0,samples:0,peak:0};
  let perfDebugLast={frameMs:16.7,fps:60,peak:16.7};
  let perfWorkCurrent={
    targetSearch:0,gridRebuild:0,nearQuery:0,
    collisionShot:0,collisionArea:0,collisionOrbit:0,collisionEnemyShot:0,collisionCrater:0,collisionChest:0,collisionBanana:0,
    enemyMove:0,gemUpdate:0,spawn:0,groundDraw:0,enemyDraw:0,projectileDraw:0,
    gridCells:0,gridEntries:0,effectDraw:0,textDraw:0
  };
  let perfWorkLast={...perfWorkCurrent};

  const META_KEY="bunnyCarrotSurvivorsMetaV1";
  const WALLET_KEY="bunnyCarrotSurvivorsWalletV1";
  const COIN_KEY="bunnyCarrotSurvivorsCoinsV1";
  const COIN_COOKIE_KEY="bunnyCarrotSurvivorsCoinsCookieV1";
  const SAVE_KEY="bunnyCarrotSurvivorsSaveV2";
  const BASE_META_DAMAGE=18;
  const BASE_META_LIFE=100;
  const META_DAMAGE_STEP=1.2;
  const META_LIFE_STEP=8;
  const META_DAMAGE_TIER_GROWTH=.002;
  const META_LIFE_TIER_GROWTH=.005;
  const META_REGEN_BASE_STEP=.32;
  const META_REGEN_STAGE_STEP=.02;
  const MAX_CRIT_DAMAGE_LEVEL=100;
  const MAX_CRIT_DAMAGE_MULTIPLIER=3;
  const META_CRIT_DAMAGE_STEP=(MAX_CRIT_DAMAGE_MULTIPLIER-1.6)/MAX_CRIT_DAMAGE_LEVEL;
  const MAX_META_ARMOR_PEN=.7;
  const MAX_PLAYER_LEVEL=100;
  const FIXED_MAGNET_RANGE=120;
  const BURST_RADIUS_CAP=170;
  const MAX_NORMAL_TEXTS=42;
  const MAX_CRITICAL_TEXTS=30;
  const MAX_BOSS_TEXTS=60;
  const ENEMY_GRID_SIZE=96;
  const ENEMY_QUERY_PADDING=80;
  // Reminder: every small gameplay/UI change should also bump bunny-shell.html homeVersion by +1.

  function metaCritChance(levels){
    const level=Math.max(0,Math.min(100,levels));
    if(level<=30)return Math.min(1,.05+level*.015);
    if(level<=60)return Math.min(1,.5+(level-30)*.004);
    return Math.min(1,.62+(level-60)*.0095);
  }
  function metaCritDamageBonusPercent(levels){
    const level=Math.max(0,Math.min(100,levels));
    if(level<=30)return level*1.8;
    if(level<=60)return 54+(level-30)*1.2;
    return 90+(level-60)*1.25;
  }
  function baseMetaCritDamageMultiplier(levels=meta.critDamage){
    return Math.min(MAX_CRIT_DAMAGE_MULTIPLIER,1.6+metaCritDamageBonusPercent(levels)/100);
  }
  function metaDamagePerLevel(level){
    const stage=Math.floor(Math.max(0,level)/10);
    return META_DAMAGE_STEP*(1+stage*META_DAMAGE_TIER_GROWTH);
  }
  function metaLifePerLevel(level){
    const stage=Math.floor(Math.max(0,level)/10);
    return META_LIFE_STEP*(1+stage*META_LIFE_TIER_GROWTH);
  }
  function metaCritPerLevel(level){
    const safeLevel=Math.max(0,Math.min(100,level));
    if(safeLevel<30)return 1.5;
    if(safeLevel<60)return 0.4;
    return 0.95;
  }
  function metaCritDamagePerLevel(level){
    const safeLevel=Math.max(0,Math.min(100,level));
    if(safeLevel<30)return 1.8;
    if(safeLevel<60)return 1.2;
    return 1.25;
  }

  const metaDefs=[
    {id:"damage",name:"攻擊力",cost:5,desc:`每級 +${META_DAMAGE_STEP} 攻擊力；每10級成長 +${(META_DAMAGE_TIER_GROWTH*100).toFixed(1)}%`,value:m=>`+${scaledMetaGain(m.damage,META_DAMAGE_STEP,META_DAMAGE_TIER_GROWTH).toFixed(1).replace(/\\.0$/,"")}`},
    {id:"crit",name:"爆擊率",cost:8,cap:100,desc:"分3階段成長，LV100 = 100%",value:m=>`${Math.round(metaCritChance(m.crit)*1000)/10}%`},
    {id:"speed",name:"攻擊速度",cost:7,cap:100,desc:"+3% 初始攻速，最高 LV100",value:m=>`+${Math.min(100,m.speed)*3}%`},
    {id:"critDamage",name:"爆擊傷害",cost:6,cap:MAX_CRIT_DAMAGE_LEVEL,desc:"分3階段成長，LV100 = 300%",value:m=>`${Math.round(baseMetaCritDamageMultiplier(m.critDamage)*100)}%`},
    {id:"life",name:"生命力",cost:4,desc:`每級 +${META_LIFE_STEP} 最大生命；每10級成長 +${(META_LIFE_TIER_GROWTH*100).toFixed(1)}%`,value:m=>`+${scaledMetaGain(m.life,META_LIFE_STEP,META_LIFE_TIER_GROWTH).toFixed(1).replace(/\\.0$/,"")}`},
    {id:"regen",name:"回復力",cost:10,desc:`每級 +${META_REGEN_BASE_STEP.toFixed(2)} HP/秒；每10級成長 +${META_REGEN_STAGE_STEP.toFixed(2)}`,value:m=>formatMetaRegenValue(Math.max(0,m.regen||0))},
    {id:"armorPen",name:"無視防禦",cost:12,cap:100,unlock:m=>m.crit>=48,desc:"+0.7% 無視敵人防禦，最高 LV100（70%）",value:m=>`${(Math.min(100,m.armorPen)*0.7).toFixed(1).replace(/\\.0$/,"")}%`}
  ];
  let meta=loadMeta();
  syncCoinState(true);
  let devModeActive=false;
  muted=!!meta.muted;

  function defaultMeta(){
    return{
      points:0,totalKills:0,totalElites:0,totalBosses:0,totalPlaySeconds:0,
      totalDeathKills:0,totalDeaths:0,bestInfiniteSeconds:0,
      infiniteTotalKills:0,coins:0,
      claimedRewards:[],damage:0,crit:0,speed:0,critDamage:0,life:0,regen:0,armorPen:0,
      desertUnlocked:false,snowUnlocked:false,
      stage1Cleared:false,stage2Cleared:false,stage3Cleared:false,
      muted:false,cheat8888Used:false,
      masterVolume:.8,synthVolume:.6,critVolume:.7,giantExplosionVolume:.75
    };
  }

  function scaledMetaGain(levels,baseStep,tierGrowth){
    let total=0;
    for(let i=0;i<levels;i++)total+=baseStep*(1+Math.floor(i/10)*tierGrowth);
    return total;
  }
  function enemyGridKey(cx,cy){
    return `${cx},${cy}`;
  }
  function rebuildEnemyGrid(){
    enemyGrid.clear();
    countPerfWork("gridRebuild");
    for(const e of enemies){
      if(e.dead||e.hp<=0)continue;
      const cx=Math.floor(e.x/ENEMY_GRID_SIZE),cy=Math.floor(e.y/ENEMY_GRID_SIZE);
      const key=enemyGridKey(cx,cy);
      let bucket=enemyGrid.get(key);
      if(!bucket){
        bucket=[];
        enemyGrid.set(key,bucket);
      }
      bucket.push(e);
      countPerfWork("gridRebuild");
      countPerfWork("gridEntries");
    }
    countPerfWork("gridCells",enemyGrid.size);
  }
  function forEachEnemyNear(x,y,radius,fn){
    countPerfWork("nearQuery");
    const minX=Math.floor((x-radius)/ENEMY_GRID_SIZE);
    const maxX=Math.floor((x+radius)/ENEMY_GRID_SIZE);
    const minY=Math.floor((y-radius)/ENEMY_GRID_SIZE);
    const maxY=Math.floor((y+radius)/ENEMY_GRID_SIZE);
    for(let cy=minY;cy<=maxY;cy++){
      for(let cx=minX;cx<=maxX;cx++){
        const bucket=enemyGrid.get(enemyGridKey(cx,cy));
        if(!bucket)continue;
        countPerfWork("nearQuery",bucket.length);
        for(const e of bucket){
          if(fn(e)===false)return false;
        }
      }
    }
    return true;
  }
  function encirclementRadius(){
    return 55*player.area;
  }
  function encirclementStagePercent(fill){
    if(fill<20)return 0;
    if(fill<40)return .01;
    if(fill<60)return .05;
    if(fill<80)return .25;
    if(fill<100)return .40;
    return .50;
  }
  function encirclementChargeRate(fill){
    if(fill<20)return 20;
    if(fill<40)return 20;
    if(fill<60)return 8;
    if(fill<80)return 8;
    return 6.6667;
  }
  function currentEncirclementSampleDuration(){
    return Math.max(1,5-encirclementPressureRounds);
  }
  function encirclementTierLabel(fill){
    if(fill<20)return "-";
    if(fill<40)return "I";
    if(fill<60)return "II";
    if(fill<80)return "III";
    if(fill<100)return "IV";
    return "V";
  }
  function encirclementDebtTotal(){
    let total=0;
    for(const debt of encirclementDebts)total+=debt.left;
    return total;
  }
  function encirclementDebtMaxTime(){
    let remaining=0;
    for(const debt of encirclementDebts)if(debt.time>remaining)remaining=debt.time;
    return remaining;
  }

  function parseMetaCandidate(raw){
    if(!raw)return null;
    try{
      const parsed=JSON.parse(raw);
      if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return null;
      if(parsed.coins!==undefined&&!Number.isFinite(Number(parsed.coins)))parsed.coins=0;
      return parsed;
    }catch(_error){
      return null;
    }
  }
  function safeSetStorage(getStorage,key,value){
    try{
      const storage=getStorage();
      if(!storage)return false;
      storage.setItem(key,value);
      return storage.getItem(key)===value;
    }catch(_error){
      return false;
    }
  }
  function readCookieValue(name){
    try{
      const prefix=`${name}=`;
      const parts=String(document.cookie||"").split("; ");
      for(const part of parts){
        if(part.startsWith(prefix))return decodeURIComponent(part.slice(prefix.length));
      }
    }catch(_error){}
    return null;
  }
  function writeCookieValue(name,value){
    try{
      document.cookie=`${name}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`;
      return readCookieValue(name)===String(value);
    }catch(_error){
      return false;
    }
  }

  function readMetaRaw(){
    const stores=[
      ()=>localStorage.getItem(SAVE_KEY),
      ()=>sessionStorage.getItem(SAVE_KEY),
      ()=>localStorage.getItem(META_KEY),
      ()=>sessionStorage.getItem(META_KEY),
      ()=>{
        const saveKey=`${SAVE_KEY}=`;
        const raw=String(window.name||"");
        if(raw.includes(saveKey)){
          const start=raw.indexOf(saveKey)+saveKey.length;
          const end=raw.indexOf(";",start);
          return end>=0?raw.slice(start,end):raw.slice(start);
        }
        const key=`${META_KEY}=`;
        if(raw.includes(key)){
          const start=raw.indexOf(key)+key.length;
          const end=raw.indexOf(";",start);
          return end>=0?raw.slice(start,end):raw.slice(start);
        }
        return null;
      }
    ];
    for(const read of stores){
      try{
        const value=read();
        const parsed=parseMetaCandidate(value);
        if(parsed)return JSON.stringify(parsed);
      }catch(_error){}
    }
    return null;
  }

  function readStoredCoins(){
    const stores=[
      ()=>localStorage.getItem(WALLET_KEY),
      ()=>sessionStorage.getItem(WALLET_KEY),
      ()=>{
        const raw=localStorage.getItem(SAVE_KEY);
        if(!raw)return null;
        const parsed=JSON.parse(raw);
        return parsed&&Number.isFinite(Number(parsed.coins))?Math.floor(Number(parsed.coins)):null;
      },
      ()=>{
        const raw=sessionStorage.getItem(SAVE_KEY);
        if(!raw)return null;
        const parsed=JSON.parse(raw);
        return parsed&&Number.isFinite(Number(parsed.coins))?Math.floor(Number(parsed.coins)):null;
      },
      ()=>localStorage.getItem(COIN_KEY),
      ()=>sessionStorage.getItem(COIN_KEY),
      ()=>readCookieValue(COIN_COOKIE_KEY),
      ()=>{
        const saveKey=`${SAVE_KEY}=`;
        const raw=String(window.name||"");
        if(raw.includes(saveKey)){
          const start=raw.indexOf(saveKey)+saveKey.length;
          const end=raw.indexOf(";",start);
          const payload=end>=0?raw.slice(start,end):raw.slice(start);
          try{
            const parsed=JSON.parse(payload);
            if(parsed&&Number.isFinite(Number(parsed.coins)))return Math.floor(Number(parsed.coins));
          }catch(_error){}
        }
        const key=`${COIN_KEY}=`;
        if(!raw.includes(key))return null;
        const start=raw.indexOf(key)+key.length;
        const end=raw.indexOf(";",start);
        return end>=0?raw.slice(start,end):raw.slice(start);
      }
    ];
    let best=null;
    for(const read of stores){
      try{
        const value=read();
        if(value!==null&&value!==undefined&&value!==""){
          const parsed=Number(value);
          if(Number.isFinite(parsed)&&parsed>=0){
            const safe=Math.floor(parsed);
            best=best===null?safe:Math.max(best,safe);
          }
        }
      }catch(_error){}
    }
    return best;
  }

  function writeWalletCoins(value){
    const safe=String(Math.floor(Math.max(0,Number(value)||0)));
    safeSetStorage(()=>localStorage,WALLET_KEY,safe);
    safeSetStorage(()=>sessionStorage,WALLET_KEY,safe);
    writeCookieValue(COIN_COOKIE_KEY,safe);
    return Number(safe);
  }

  function loadMeta(){
    try{
      const saved=parseMetaCandidate(readMetaRaw());
      const data=Object.assign(defaultMeta(),saved||{});
      if(!Array.isArray(data.claimedRewards))data.claimedRewards=[];
      if(!Number.isFinite(Number(data.masterVolume)))data.masterVolume=.8;
      if(!Number.isFinite(Number(data.synthVolume)))data.synthVolume=.6;
      if(!Number.isFinite(Number(data.critVolume)))data.critVolume=.7;
      if(!Number.isFinite(Number(data.giantExplosionVolume)))data.giantExplosionVolume=.75;
      data.masterVolume=Math.max(0,Math.min(1,Number(data.masterVolume)));
      data.synthVolume=Math.max(0,Math.min(1,Number(data.synthVolume)));
      data.critVolume=Math.max(0,Math.min(1,Number(data.critVolume)));
      data.giantExplosionVolume=Math.max(0,Math.min(1,Number(data.giantExplosionVolume)));
      migrateLegacyStageClears(data);
      const recoveredCoins=readStoredCoins();
      if(recoveredCoins!==null)data.coins=Math.max(Math.floor(Number(data.coins)||0),recoveredCoins);
      delete data.devMode;
      return data;
    }catch(_error){
      return defaultMeta();
    }
  }
  function migrateLegacyStageClears(data){
    if(data.desertUnlocked)data.stage1Cleared=true;
    if(data.snowUnlocked)data.stage2Cleared=true;
    const bossCount=Math.max(0,data.totalBosses||0);
    if(!data.stage2Cleared&&data.desertUnlocked&&bossCount>=2)data.stage2Cleared=true;
    if(!data.stage3Cleared&&data.snowUnlocked&&bossCount>=3)data.stage3Cleared=true;
    return data;
  }

  function saveMeta(){
    meta.coins=Math.floor(Math.max(0,Number(meta.coins)||0));
    meta.masterVolume=volumeValue("masterVolume");
    meta.synthVolume=volumeValue("synthVolume");
    meta.critVolume=volumeValue("critVolume");
    meta.giantExplosionVolume=volumeValue("giantExplosionVolume");
    walletCoins=meta.coins;
    const raw=JSON.stringify(meta);
    coinSaveStatus.saveLocal=safeSetStorage(()=>localStorage,SAVE_KEY,raw)?"ok":"fail";
    coinSaveStatus.saveSession=safeSetStorage(()=>sessionStorage,SAVE_KEY,raw)?"ok":"fail";
    coinSaveStatus.metaLocal=safeSetStorage(()=>localStorage,META_KEY,raw)?"ok":"fail";
    coinSaveStatus.metaSession=safeSetStorage(()=>sessionStorage,META_KEY,raw)?"ok":"fail";
    try{window.name=`${SAVE_KEY}=${raw}`;}catch(_error){}
    const coinRaw=String(meta.coins);
    writeWalletCoins(meta.coins);
    coinSaveStatus.coinLocal=safeSetStorage(()=>localStorage,COIN_KEY,coinRaw)?"ok":"fail";
    coinSaveStatus.coinSession=safeSetStorage(()=>sessionStorage,COIN_KEY,coinRaw)?"ok":"fail";
    coinSaveStatus.coinCookie=writeCookieValue(COIN_COOKIE_KEY,coinRaw)?"ok":"fail";
    try{
      const savePart=`${SAVE_KEY}=${raw}`;
      const coinPart=`${COIN_KEY}=${coinRaw}`;
      window.name=`${savePart};${coinPart}`;
    }catch(_error){}
  }
  function saveCoinsOnly(){
    saveMeta();
  }
  function syncCoinState(forceSave=false){
    const storedCoins=readStoredCoins();
    const metaCoins=Math.floor(Number(meta.coins)||0);
    const nextCoins=storedCoins===null?metaCoins:Math.max(metaCoins,storedCoins);
    if(nextCoins!==walletCoins||nextCoins!==metaCoins)forceSave=true;
    meta.coins=nextCoins;
    walletCoins=nextCoins;
    if(forceSave)saveMeta();
    return walletCoins;
  }
  function isDevProtectedRun(){
    return devModeActive&&devInvincible;
  }
  function getDevTestInterval(profile=devTestProfile){
    return profile==="desktop"?1:2;
  }
  function currentStageLabel(){
    if(isInfiniteMode())return infiniteZoneName();
    if(currentStage===3)return "雪原";
    if(currentStage===2)return "沙漠";
    return "菜園";
  }
  function orbitRingConfig(){
    const radius=55*player.area;
    if(skills.orbit>=5)return {
      active:true,
      radius,
      thickness:24*player.area,
      hitDelay:.22,
      damage:46*player.areaDamage,
      hitChance:.75
    };
    return {
      active:false,
      radius,
      thickness:18,
      hitDelay:.45,
      damage:(8+skills.orbit*5)*player.areaDamage,
      hitChance:1
    };
  }
  const DEV_TEST_PERF_KEYS=[
    "collisionShot","collisionArea","collisionOrbit","collisionEnemyShot","collisionCrater","collisionChest","collisionBanana",
    "targetSearch","gridRebuild","gridCells","gridEntries","nearQuery",
    "enemyMove","gemUpdate","spawn","groundDraw","enemyDraw","projectileDraw","effectDraw","textDraw"
  ];
  const DEV_TEST_SAMPLE_KEYS=[
    "t","stageTime","stage","stageLabel","fps","frameMs","enemies","gems","shots","effects","texts","kps",
    "hp","maxHp","level","pressure","charge","orbit","burst","peanut","pinky",
    ...DEV_TEST_PERF_KEYS
  ];
  function buildDevPerfSnapshot(){
    return {
      collisionShot:perfWorkLast.collisionShot||0,
      collisionArea:perfWorkLast.collisionArea||0,
      collisionOrbit:perfWorkLast.collisionOrbit||0,
      collisionEnemyShot:perfWorkLast.collisionEnemyShot||0,
      collisionCrater:perfWorkLast.collisionCrater||0,
      collisionChest:perfWorkLast.collisionChest||0,
      collisionBanana:perfWorkLast.collisionBanana||0,
      targetSearch:perfWorkLast.targetSearch||0,
      nearQuery:perfWorkLast.nearQuery||0,
      gridRebuild:perfWorkLast.gridRebuild||0,
      gridCells:perfWorkLast.gridCells||0,
      gridEntries:perfWorkLast.gridEntries||0,
      enemyMove:perfWorkLast.enemyMove||0,
      gemUpdate:perfWorkLast.gemUpdate||0,
      spawn:perfWorkLast.spawn||0,
      groundDraw:perfWorkLast.groundDraw||0,
      enemyDraw:perfWorkLast.enemyDraw||0,
      projectileDraw:perfWorkLast.projectileDraw||0,
      effectDraw:perfWorkLast.effectDraw||0,
      textDraw:perfWorkLast.textDraw||0
    };
  }
  function updateDevPerfPeaks(perf,t){
    for(const [key,value] of Object.entries(perf)){
      const prev=devTestRecorder.perfPeaks[key];
      if(!prev||value>prev.value)devTestRecorder.perfPeaks[key]={value,t};
    }
  }
  async function captureBatteryInfo(){
    if(!navigator.getBattery)return {supported:false};
    try{
      const battery=await navigator.getBattery();
      return {supported:true,level:Math.round((battery.level||0)*100),charging:!!battery.charging};
    }catch(_error){
      return {supported:false};
    }
  }
  function resetDevTestRecorder(profile=devTestProfile){
    devTestRecorder={
      active:false,
      profile,
      interval:getDevTestInterval(profile),
      elapsed:0,
      lastSampleAt:0,
      startReal:0,
      samples:[],
      perfPeaks:{},
      summary:null,
      battery:null
    };
  }
  function buildDevTestSummary(){
    const samples=devTestRecorder.samples;
    if(!samples.length){
      return {
        duration:0,
        sampleCount:0,
        avgFps:0,
        minFps:0,
        maxEnemies:0,
        maxGems:0,
        maxShots:0,
        maxEffects:0,
        maxTexts:0,
        maxKps:0
      };
    }
    const totalFps=samples.reduce((sum,s)=>sum+s.fps,0);
    return {
      duration:Math.round(devTestRecorder.elapsed*10)/10,
      sampleCount:samples.length,
      avgFps:Math.round(totalFps/samples.length*10)/10,
      minFps:Math.round(Math.min(...samples.map(s=>s.fps))*10)/10,
      maxEnemies:Math.max(...samples.map(s=>s.enemies)),
      maxGems:Math.max(...samples.map(s=>s.gems)),
      maxShots:Math.max(...samples.map(s=>s.shots)),
      maxEffects:Math.max(...samples.map(s=>s.effects)),
      maxTexts:Math.max(...samples.map(s=>s.texts)),
      maxKps:Math.round(Math.max(...samples.map(s=>s.kps))*10)/10
    };
  }
  function formatDevRecordTime(seconds){
    const total=Math.max(0,Math.floor(seconds));
    const m=Math.floor(total/60);
    const s=total%60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
  function sampleDevTestRecorder(){
    if(!devTestRecorder.active)return;
    const t=Math.round(devTestRecorder.elapsed*10)/10;
    const perf=buildDevPerfSnapshot();
    const sample={
      t,
      stageTime:Math.round((isInfiniteMode()?infiniteDisplayedTime():time)*10)/10,
      stage:currentStage,
      stageLabel:currentStageLabel(),
      fps:Math.round(perfDebugLast.fps*10)/10,
      frameMs:Math.round(perfDebugLast.frameMs*10)/10,
      enemies:hudEnemyCount,
      gems:gems.length,
      shots:shots.length+petShots.length+enemyShots.length+bananas.length,
      effects:effects.length,
      texts:texts.length,
      kps:Math.round(kps*10)/10,
      hp:Math.round(player.hp),
      maxHp:Math.round(player.maxHp),
      level:player.level,
      pressure:Math.round(encirclementPressure*100),
      charge:Math.round(encirclementCharge),
      skills:{orbit:skills.orbit,burst:skills.burst,peanut:skills.peanut,pinky:skills.pinky},
      perf:perf
    };
    devTestRecorder.samples.push(sample);
    updateDevPerfPeaks(perf,t);
  }
  function updateTestModeUi(){
    testModeMobileBtn.classList.toggle("active",devTestProfile==="mobile");
    testModeDesktopBtn.classList.toggle("active",devTestProfile==="desktop");
    testInvincibleBtn.classList.toggle("active",devInvincible);
    testAutoSkillBtn.classList.toggle("active",devAutoUpgrade);
    testInvincibleBtn.textContent=`HP0不死 ${devInvincible?"ON":"OFF"}`;
    testAutoSkillBtn.textContent=`自動選技 ${devAutoUpgrade?"ON":"OFF"}`;
    testModeOverlay.classList.toggle("recording",devTestRecorder.active);
    testModeRecorderText.textContent=`${devTestRecorder.active?"REC":"IDLE"} ${formatDevRecordTime(devTestRecorder.elapsed)}`;
    devTestBtn.classList.toggle("active",devTestRecorder.active||testModeOverlay.classList.contains("visible"));
    devTestBtn.textContent=devTestRecorder.active?`REC ${formatDevRecordTime(devTestRecorder.elapsed)}`:"測試紀錄";
    const summary=devTestRecorder.summary||buildDevTestSummary();
    testModeStatus.textContent=
      `模式：${devTestProfile==="desktop"?"電腦":"手機"}（每 ${devTestRecorder.interval.toFixed(devTestRecorder.interval<1?2:0)} 秒取樣）\n`+
      `紀錄狀態：${devTestRecorder.active?"進行中":"未開始"}\n`+
      `已收集樣本：${devTestRecorder.samples.length}\n`+
      `本輪時長：${summary.duration||0} 秒\n`+
      `平均 FPS：${summary.avgFps||0}｜最低 FPS：${summary.minFps||0}\n`+
      `怪物峰值：${summary.maxEnemies||0}｜經驗球峰值：${summary.maxGems||0}\n`+
      `射彈峰值：${summary.maxShots||0}｜特效峰值：${summary.maxEffects||0}\n`+
      `文字峰值：${summary.maxTexts||0}｜KPS 峰值：${summary.maxKps||0}\n`+
      `不死：${devInvincible?"ON":"OFF"}｜自動選技：${devAutoUpgrade?"ON":"OFF"}`;
    testModeStartBtn.disabled=devTestRecorder.active;
    testModeStopBtn.disabled=!devTestRecorder.active;
    testModeExportBtn.disabled=!devTestRecorder.samples.length;
  }
  function openTestModeOverlay(message=""){
    if(message)testModeHint.textContent=message;
    else testModeHint.textContent="可切換手機/電腦取樣，並在本局內開啟不死與自動選技。";
    testModeOverlay.classList.add("visible");
    testModeOverlay.setAttribute("aria-hidden","false");
    devTestBtn.classList.add("active");
    updateTestModeUi();
  }
  function closeTestModeOverlay(){
    testModeOverlay.classList.remove("visible");
    testModeOverlay.setAttribute("aria-hidden","true");
    devTestBtn.classList.remove("active");
  }
  async function startDevTestRecording(){
    resetDevTestRecorder(devTestProfile);
    devTestRecorder.active=true;
    devTestRecorder.startReal=Date.now();
    updateTestModeUi();
    devTestRecorder.battery=await captureBatteryInfo();
    sampleDevTestRecorder();
    updateTestModeUi();
    beep(720,.09,.03,"triangle");
  }
  function stopDevTestRecording(){
    if(!devTestRecorder.active)return;
    devTestRecorder.active=false;
    devTestRecorder.summary=buildDevTestSummary();
    updateTestModeUi();
    beep(360,.08,.025);
  }
  function buildDevTestExportData(){
    return {
      version:1,
      profile:devTestRecorder.profile,
      stage:currentStage,
      infinite:isInfiniteMode(),
      exportedAt:Date.now(),
      battery:devTestRecorder.battery||{supported:false},
      flags:{
        invincible:devInvincible,
        autoSkill:devAutoUpgrade
      },
      summary:devTestRecorder.summary||buildDevTestSummary(),
      peaks:devTestRecorder.perfPeaks,
      samples:devTestRecorder.samples
    };
  }
  function buildCompactDevTestExportData(){
    const raw=buildDevTestExportData();
    const labels=[];
    const labelToIndex=new Map();
    const getLabelIndex=(label)=>{
      const safe=label||"";
      if(labelToIndex.has(safe))return labelToIndex.get(safe);
      const index=labels.length;
      labels.push(safe);
      labelToIndex.set(safe,index);
      return index;
    };
    const summary=raw.summary||buildDevTestSummary();
    return {
      v:2,
      p:raw.profile==="desktop"?1:0,
      s:raw.stage||1,
      i:raw.infinite?1:0,
      e:raw.exportedAt||Date.now(),
      b:raw.battery?.supported?[1,raw.battery.level||0,raw.battery.charging?1:0]:[0],
      f:[raw.flags?.invincible?1:0,raw.flags?.autoSkill?1:0],
      u:[
        summary.duration||0,
        summary.sampleCount||0,
        summary.avgFps||0,
        summary.minFps||0,
        summary.maxEnemies||0,
        summary.maxGems||0,
        summary.maxShots||0,
        summary.maxEffects||0,
        summary.maxTexts||0,
        summary.maxKps||0
      ],
      z:labels,
      k:Object.entries(raw.peaks||{})
        .map(([key,peak])=>[DEV_TEST_PERF_KEYS.indexOf(key),peak?.value||0,peak?.t||0])
        .filter(item=>item[0]>=0),
      x:(raw.samples||[]).map(sample=>DEV_TEST_SAMPLE_KEYS.map(key=>{
        if(key==="stageLabel")return getLabelIndex(sample.stageLabel||"");
        if(key==="orbit"||key==="burst"||key==="peanut"||key==="pinky")return sample.skills?.[key]||0;
        if(DEV_TEST_PERF_KEYS.includes(key))return sample.perf?.[key]||0;
        return sample[key]??0;
      }))
    };
  }
  function exportDevTestRecording(){
    const payload=JSON.stringify(buildCompactDevTestExportData());
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(payload).then(()=>{
        openTestModeOverlay("測試紀錄 JSON 已複製，可直接貼給我分析。");
      }).catch(()=>{
        openSettingsDialog({
          title:"測試紀錄匯出",
          message:"剪貼簿失敗，請手動複製下方 JSON。",
          inputValue:payload,
          confirmLabel:"關閉",
          cancelLabel:"關閉",
          showInput:true,
          onConfirm:()=>closeSettingsDialog()
        });
      });
      return;
    }
    openSettingsDialog({
      title:"測試紀錄匯出",
      message:"請完整複製下方 JSON。",
      inputValue:payload,
      confirmLabel:"關閉",
      cancelLabel:"關閉",
      showInput:true,
      onConfirm:()=>closeSettingsDialog()
    });
  }
  function openSettingsOverlay(message){
    settingsHint.textContent=message||"可匯出帳號碼到其他裝置，也能從這裡進入開發模式。";
    renderVolumeSettings();
    settingsOverlay.classList.add("visible");
    settingsOverlay.setAttribute("aria-hidden","false");
  }
  function closeSettingsOverlay(){
    settingsOverlay.classList.remove("visible");
    settingsOverlay.setAttribute("aria-hidden","true");
    closeSettingsDialog();
  }
  function openSettingsDialog({
    title="設定",
    message="",
    inputValue="",
    inputPlaceholder="",
    confirmLabel="確定",
    cancelLabel="取消",
    showInput=false,
    onConfirm=null
  }={}){
    settingsDialogState={onConfirm};
    settingsDialogTitle.textContent=title;
    settingsDialogText.textContent=message;
    settingsDialogConfirm.textContent=confirmLabel;
    settingsDialogCancel.textContent=cancelLabel;
    settingsDialogInput.classList.toggle("hidden",!showInput);
    settingsDialogInput.value=inputValue||"";
    settingsDialogInput.placeholder=inputPlaceholder||"";
    settingsDialog.classList.add("visible");
    settingsDialog.setAttribute("aria-hidden","false");
    if(showInput){
      requestAnimationFrame(()=>{
        settingsDialogInput.focus();
        settingsDialogInput.select();
      });
    }else{
      requestAnimationFrame(()=>settingsDialogConfirm.focus());
    }
  }
  function closeSettingsDialog(){
    settingsDialog.classList.remove("visible");
    settingsDialog.setAttribute("aria-hidden","true");
    settingsDialogState=null;
    settingsDialogInput.value="";
  }
  function confirmSettingsDialog(){
    if(!settingsDialogState||typeof settingsDialogState.onConfirm!=="function"){
      closeSettingsDialog();
      return;
    }
    settingsDialogState.onConfirm(settingsDialogInput.value);
  }
  function buildAccountTransferData(){
    return{
      v:3,
      d:[
        meta.points||0,
        meta.totalKills||0,
        meta.totalElites||0,
        meta.totalBosses||0,
        meta.totalPlaySeconds||0,
        meta.totalDeathKills||0,
        meta.totalDeaths||0,
        meta.bestInfiniteSeconds||0,
        meta.infiniteTotalKills||0,
        Array.isArray(meta.claimedRewards)?meta.claimedRewards:[],
        meta.damage||0,
        meta.crit||0,
        meta.speed||0,
        meta.critDamage||0,
        meta.life||0,
        meta.regen||0,
        meta.armorPen||0,
        meta.desertUnlocked?1:0,
        meta.snowUnlocked?1:0,
        meta.stage1Cleared?1:0,
        meta.stage2Cleared?1:0,
        meta.stage3Cleared?1:0,
        meta.muted?1:0,
        meta.cheat8888Used?1:0,
        meta.coins||0,
        Math.round(volumeValue("masterVolume")*10),
        Math.round(volumeValue("synthVolume")*10),
        Math.round(volumeValue("critVolume")*10),
        Math.round(volumeValue("giantExplosionVolume")*10)
      ]
    };
  }
  function encodeAccountTransferCode(data){
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }
  function decodeAccountTransferCode(code){
    const decoded=JSON.parse(decodeURIComponent(escape(atob(code))));
    if(decoded&&decoded.v===3&&Array.isArray(decoded.d)){
      const data=decoded.d;
      const extended=data.length>=24;
      return{
        v:3,
        meta:{
          points:data[0]||0,
          totalKills:data[1]||0,
          totalElites:data[2]||0,
          totalBosses:data[3]||0,
          totalPlaySeconds:data[4]||0,
          totalDeathKills:data[5]||0,
          totalDeaths:data[6]||0,
          bestInfiniteSeconds:data[7]||0,
          infiniteTotalKills:data[8]||0,
          claimedRewards:Array.isArray(data[9])?data[9]:[],
          damage:data[10]||0,
          crit:data[11]||0,
          speed:data[12]||0,
          critDamage:data[13]||0,
          life:data[14]||0,
          regen:data[15]||0,
          armorPen:data[16]||0,
          desertUnlocked:!!data[17],
          snowUnlocked:!!data[18],
          stage1Cleared:extended?!!data[19]:!!data[17],
          stage2Cleared:extended?!!data[20]:!!data[18],
          stage3Cleared:extended?!!data[21]:false,
          muted:extended?!!data[22]:!!data[19],
          cheat8888Used:extended?!!data[23]:!!data[20],
          coins:data.length>=25?(data[24]||0):0,
          masterVolume:data.length>=29?(data[25]||0)/10:.8,
          synthVolume:data.length>=29?(data[26]||0)/10:.6,
          critVolume:data.length>=29?(data[27]||0)/10:.7,
          giantExplosionVolume:data.length>=29?(data[28]||0)/10:.75
        }
      };
    }
    if(decoded&&decoded.v===2&&decoded.d){
      const data=decoded.d;
      return{
        v:2,
        meta:{
          points:data.p||0,
          totalKills:data.k||0,
          totalElites:data.e||0,
          totalBosses:data.b||0,
          totalPlaySeconds:data.t||0,
          totalDeathKills:data.dk||0,
          totalDeaths:data.dd||0,
          bestInfiniteSeconds:data.bi||0,
          infiniteTotalKills:data.ik||0,
          claimedRewards:Array.isArray(data.r)?data.r:[],
          damage:data.dmg||0,
          crit:data.crt||0,
          speed:data.spd||0,
          critDamage:data.cdm||0,
          life:data.hp||0,
          regen:data.reg||0,
          armorPen:data.ap||0,
          desertUnlocked:!!data.du,
          snowUnlocked:!!data.su,
          stage1Cleared:!!data.s1||!!data.du,
          stage2Cleared:!!data.s2||!!data.su,
          stage3Cleared:!!data.s3,
          muted:!!data.mt,
          cheat8888Used:!!data.c8,
          coins:data.cn||0
        }
      };
    }
    if(decoded&&decoded.v===1&&decoded.meta){
      return decoded;
    }
    throw new Error("invalid save code");
  }
  function exportAccountCode(){
    const code=encodeAccountTransferCode(buildAccountTransferData());
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(code).then(()=>{
        openSettingsOverlay("帳號碼已複製，可直接貼到另一個裝置匯入。");
      }).catch(()=>{
        openSettingsDialog({
          title:"帳號匯出",
          message:"剪貼簿權限失敗，請手動複製下方帳號碼。",
          inputValue:code,
          confirmLabel:"關閉",
          cancelLabel:"關閉",
          showInput:true,
          onConfirm:()=>closeSettingsDialog()
        });
      });
      return;
    }
    openSettingsDialog({
      title:"帳號匯出",
      message:"請完整複製下方帳號碼。",
      inputValue:code,
      confirmLabel:"關閉",
      cancelLabel:"關閉",
      showInput:true,
      onConfirm:()=>closeSettingsDialog()
    });
    openSettingsOverlay("帳號碼已產生，若要跨裝置可直接貼上使用。");
  }
  function importAccountCode(){
    openSettingsDialog({
      title:"帳號匯入",
      message:"貼上帳號碼後按確定，會直接覆蓋目前進度。",
      inputPlaceholder:"貼上帳號碼",
      confirmLabel:"匯入",
      cancelLabel:"取消",
      showInput:true,
      onConfirm:raw=>{
        const code=(raw||"").trim();
        if(!code){
          openSettingsOverlay("沒有貼入任何帳號碼。");
          closeSettingsDialog();
          beep(140,.08,.02,"sawtooth");
          return;
        }
        try{
          const decoded=decodeAccountTransferCode(code);
          if(!decoded||!decoded.meta)throw new Error("invalid");
          const nextMeta=Object.assign(defaultMeta(),decoded.meta);
          if(!Array.isArray(nextMeta.claimedRewards))nextMeta.claimedRewards=[];
          delete nextMeta.devMode;
            meta=migrateLegacyStageClears(nextMeta);
          muted=!!meta.muted;
          updateMuteButton();
          saveMeta();
          renderMeta();
          closeSettingsDialog();
          closeSettingsOverlay();
          beep(820,.12,.04,"triangle");
          openSettingsOverlay("帳號匯入完成。");
        }catch(_error){
          openSettingsOverlay("帳號碼格式不正確，請確認有完整貼上。");
          beep(140,.08,.02,"sawtooth");
        }
      }
    });
  }
  function handleDeveloperEntry(){
    openSettingsDialog({
      title:"開發人員",
      message:"輸入開發密碼。",
      inputPlaceholder:"輸入密碼",
      confirmLabel:"確定",
      cancelLabel:"取消",
      showInput:true,
      onConfirm:password=>{
        const safePassword=(password||"").trim();
        if(safePassword==="00516"){
          closeSettingsDialog();
          closeSettingsOverlay();
          devModeActive=true;
          debugOverlayEnabled=true;
          debugPanelMode="perf";
          rewardScreen.classList.add("hidden");
          renderMeta();
          syncCoinDisplay();
          characterScreen.classList.remove("hidden");
          updateMonitorButtons();
          beep(760,.1,.03,"triangle");
          return;
        }
        if(safePassword==="8888"){
          if(meta.cheat8888Used){
            openSettingsOverlay("8888 已使用過，除非刪除紀錄才會重置。");
            closeSettingsDialog();
            beep(140,.08,.02,"sawtooth");
            return;
          }
          meta.cheat8888Used=true;
          meta.points+=20000;
          saveMeta();
          renderMeta();
          closeSettingsDialog();
          openSettingsOverlay("已獲得 20000 強化點數。");
          beep(980,.14,.04,"triangle");
          return;
        }
        openSettingsOverlay("密碼不正確。");
        beep(140,.08,.02,"sawtooth");
      }
    });
  }

  function xpRequirement(level,killCount){
    const normal=18*Math.pow(1.18,level-1)+level*4;
    const earlyScale=.45+.55*Math.min(1,killCount/200);
    return Math.max(8,Math.floor(normal*earlyScale));
  }

  function metaUpgradeCost(def){
    const level=meta[def.id]||0;
    return metaUpgradeCostAtLevel(def,level);
  }

  function metaUpgradeCostAtLevel(def,level){
    const tier=Math.floor(level/10);
    let multiplier=1+tier*.5;
    if(["damage","regen"].includes(def.id)&&level>=20){
      const extra=level-19;
      multiplier+=extra*.18+extra*extra*.028;
    }
    if(def.id==="life"){
      if(level>=20){
        const extra=level-19;
        multiplier+=extra*.08+extra*extra*.012;
      }
      if(level>=70){
        multiplier+=(level-69)*2;
      }
      if(level>=80){
        multiplier+=(level-79)*3.2;
      }
      if(level>=90){
        multiplier+=(level-89)*2.2;
      }
    }
    if(["speed","crit","critDamage"].includes(def.id)&&level>=30){
      const extra=level-29;
      multiplier+=extra*.16+extra*extra*.022;
    }
    return Math.ceil(def.cost*multiplier);
  }

  function metaSpentCost(def,levels){
    let total=0;
    for(let level=0;level<levels;level++){
      total+=metaUpgradeCostAtLevel(def,level);
    }
    return total;
  }

  function metaBulkUpgradeInfo(def,targetCount){
    let points=meta.points;
    let level=meta[def.id]||0;
    let count=0;
    let totalCost=0;
    while(count<targetCount){
      if(def.cap!==undefined&&level>=def.cap)break;
      const cost=metaUpgradeCostAtLevel(def,level);
      if(points<cost)break;
      points-=cost;
      totalCost+=cost;
      level++;
      count++;
    }
    return {count,totalCost};
  }

  function accountLevelInfo(){
    let exp=Math.floor((meta.totalPlaySeconds||0)/60),level=1;
    while(level<100){
      const need=5+level;
      if(exp<need)break;
      exp-=need;level++;
    }
    const next=level>=100?0:5+level;
    return{level,exp,next,total:Math.floor((meta.totalPlaySeconds||0)/60)};
  }

  function metaRegenPerLevel(level){
    const safeLevel=Math.max(1,Math.floor(level));
    const stage=Math.floor((safeLevel-1)/10);
    return META_REGEN_BASE_STEP+stage*META_REGEN_STAGE_STEP;
  }

  function metaRegenFlatTotal(level){
    let total=0;
    const safeLevel=Math.max(0,Math.floor(level));
    for(let currentLevel=1;currentLevel<=safeLevel;currentLevel++)total+=metaRegenPerLevel(currentLevel);
    return Math.round(total*1000)/1000;
  }

  function formatMetaRegenValue(level){
    return `+${metaRegenFlatTotal(level).toFixed(3)} HP/秒`;
  }

  function formatCostShort(value){
    const abs=Math.abs(value);
    if(abs>=1e9)return `${(value/1e9).toFixed(value>=1e10?1:2).replace(/\.0+$|(\.\d*[1-9])0+$/,"$1")}B`;
    if(abs>=1e6)return `${(value/1e6).toFixed(value>=1e7?1:2).replace(/\.0+$|(\.\d*[1-9])0+$/,"$1")}M`;
    if(abs>=1e3)return `${(value/1e3).toFixed(value>=1e4?1:2).replace(/\.0+$|(\.\d*[1-9])0+$/,"$1")}K`;
    return String(value);
  }

  function formatPlaytimeSummary(totalSeconds){
    const totalMinutes=Math.floor(Math.max(0,totalSeconds)/60);
    const hours=Math.floor(totalMinutes/60);
    const minutes=totalMinutes%60;
    if(hours<=0)return `累計遊玩 ${totalMinutes} 分鐘`;
    return `累計遊玩 ${hours} 小時 ${minutes} 分鐘`;
  }
  function formatCommaNumber(value){
    return Math.floor(Math.max(0,value||0)).toLocaleString("en-US");
  }
  function syncCoinDisplay(){
    syncCoinState();
    if(coinCountEl)coinCountEl.textContent=formatCommaNumber(walletCoins||0);
    if(shopCoinCount)shopCoinCount.textContent=formatCommaNumber(walletCoins||0);
    if(coinDevSubBtn)coinDevSubBtn.classList.toggle("hidden",!devModeActive);
    if(coinDebugBox){
      let saveCoins="-",walletKeyCoins="-",coinKeyCoins="-",cookieCoins="-";
      try{
        const saveRaw=localStorage.getItem(SAVE_KEY)||sessionStorage.getItem(SAVE_KEY);
        if(saveRaw){
          const parsed=JSON.parse(saveRaw);
          saveCoins=Number.isFinite(Number(parsed?.coins))?formatCommaNumber(Number(parsed.coins)):"-";
        }
      }catch(_error){}
      try{
        const walletRaw=localStorage.getItem(WALLET_KEY)||sessionStorage.getItem(WALLET_KEY);
        if(walletRaw!==null&&walletRaw!==undefined&&walletRaw!=="")walletKeyCoins=formatCommaNumber(Number(walletRaw));
      }catch(_error){}
      try{
        const coinRaw=localStorage.getItem(COIN_KEY)||sessionStorage.getItem(COIN_KEY);
        if(coinRaw!==null&&coinRaw!==undefined&&coinRaw!=="")coinKeyCoins=formatCommaNumber(Number(coinRaw));
      }catch(_error){}
      try{
        const rawCookie=readCookieValue(COIN_COOKIE_KEY);
        if(rawCookie!==null&&rawCookie!==undefined&&rawCookie!=="")cookieCoins=formatCommaNumber(Number(rawCookie));
      }catch(_error){}
      if(devModeActive){
        const navigationEntry=performance.getEntriesByType?.("navigation")?.[0];
        const loadType=navigationEntry?.type||"unknown";
        coinDebugBox.classList.remove("hidden");
        coinDebugBox.textContent=[
          `diamond ${formatCommaNumber(walletCoins||0)}`,
          `metaDiamond ${formatCommaNumber(Number(meta.coins)||0)}`,
          `runDiamond ${formatCommaNumber(Number(runCoins)||0)}`,
          `saveDiamond ${saveCoins}`,
          `walletKey ${walletKeyCoins}`,
          `diamondKey ${coinKeyCoins}`,
          `cookieDiamond ${cookieCoins}`,
          `ok ${coinSaveStatus.saveLocal}/${coinSaveStatus.saveSession}/${coinSaveStatus.coinCookie}`,
          `load ${loadType}`,
          `ver ${APP_VERSION}`,
          `proto ${location.protocol}`
        ].join("\n");
      }else{
        coinDebugBox.classList.add("hidden");
        coinDebugBox.textContent="";
      }
    }
  }
  const volumeKeys=["masterVolume","synthVolume","critVolume","giantExplosionVolume"];
  function volumeValue(key){
    const defaults={masterVolume:.8,synthVolume:.6,critVolume:.7,giantExplosionVolume:.75};
    return Math.max(0,Math.min(1,Number(meta[key]??defaults[key]??1)));
  }
  function renderVolumeSettings(){
    if(!volumeSettings)return;
    for(const row of volumeSettings.querySelectorAll(".volumeRow")){
      const key=row.dataset.volumeKey;
      const valueEl=row.querySelector("em");
      if(valueEl)valueEl.textContent=`${Math.round(volumeValue(key)*100)}%`;
    }
  }
  function masterVolume(){
    return volumeValue("masterVolume");
  }
  function synthVolume(){
    return masterVolume()*volumeValue("synthVolume");
  }
  function externalVolumeForKey(key){
    const perKey=key.startsWith("crit")?volumeValue("critVolume"):
      key==="giantExplosion"?volumeValue("giantExplosionVolume"):1;
    return masterVolume()*perKey;
  }
  function previewVolumeKey(key){
    if(muted)return;
    if(key==="critVolume")playCritSample(1,1);
    else if(key==="giantExplosionVolume")playGiantExplosionSound();
    else playUiClick();
  }
  function adjustVolume(key,delta){
    if(!volumeKeys.includes(key))return;
    meta[key]=Math.max(0,Math.min(1,Math.round((volumeValue(key)+delta*.1)*10)/10));
    saveMeta();
    renderVolumeSettings();
    previewVolumeKey(key);
  }
  function renderShop(){
    syncCoinDisplay();
    if(!shopGrid)return;
    const goods=[
      ["🥕","胡蘿蔔禮盒","SOLD"],
      ["🍌","香蕉束","SOLD"],
      ["🧪","體力藥水","SOLD"],
      ["💎","藍色碎晶","SOLD"],
      ["📜","古老卷軸","SOLD"],
      ["💎","鑽石袋","SOLD"],
      ["🧤","冒險手套","SOLD"],
      ["🧿","護身符","SOLD"],
      ["🧵","精靈絲線","SOLD"],
      ["📦","補給木箱","SOLD"],
      ["🥜","花生跟班","SOLD"],
      ["💚","回復護符","SOLD"],
      ["⏩","疾跑徽章","SOLD"],
      ["🍀","幸運草牌","SOLD"],
      ["⭕","範圍符印","SOLD"],
      ["🧠","超級頭腦","SOLD"],
      ["🛡️","雪原毛披","SOLD"],
      ["🔥","燃燒地坑","SOLD"],
      ["❄️","冰霜瓶","SOLD"],
      ["⭐","神祕商品","SOLD"]
    ];
    shopGrid.innerHTML=goods.map(([icon,name,state])=>`
      <div class="shopCard">
        <div class="shopCardIcon">${icon}</div>
        <div class="shopCardName">${name}</div>
        <button type="button" class="${state==="BUY"?"shopBuyBtn":"shopSoldBtn"}" ${state==="SOLD"?"disabled":""}>${state}</button>
      </div>
    `).join("");
  }
  function refreshWalletFromUi(){
    syncCoinState(true);
    syncCoinDisplay();
    if(coinBox){
      coinBox.classList.add("refreshing");
      setTimeout(()=>coinBox.classList.remove("refreshing"),180);
    }
    beep(620,.06,.018,"triangle");
    countAudioSubtype("ui");
  }
  function refreshWalletSilently(){
    syncCoinState(true);
    syncCoinDisplay();
  }
  function scheduleWalletBootRefresh(){
    refreshWalletSilently();
    requestAnimationFrame(refreshWalletSilently);
    setTimeout(refreshWalletSilently,150);
    setTimeout(refreshWalletSilently,700);
  }
  const bootHints=[
    "兔兔正在整理胡蘿蔔背包...",
    "檢查小胡蘿蔔發射器...",
    "花生正在找自己的小石頭...",
    "PINKY 正在清點香蕉...",
    "精靈店員正在打開櫃台燈...",
    "冒險筆記正在翻到最新一頁...",
    "胡蘿蔔種子正在發芽...",
    "兔兔正在暖身，準備割草...",
    "確認鑽石袋沒有破洞...",
    "幫花生洗乾淨腳底泥土...",
    "幫 PINKY 綁好小圍巾...",
    "兔兔正在把耳朵調成戰鬥角度...",
    "把備用胡蘿蔔排成一整列...",
    "檢查寶箱鑰匙有沒有放反...",
    "把雪原圍巾和沙漠水壺塞進背包...",
    "兔兔正在偷偷多帶一根胡蘿蔔..."
  ];
  const bootFinalHint="準備出發...";
  function bootRect(x,y,w,h,c){
    if(!bootMascotCtx)return;
    bootMascotCtx.fillStyle=c;
    bootMascotCtx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));
  }
  function drawBootPeanut(x,y,bob){
    const oy=y+bob;
    bootRect(x-9,oy-12,18,24,"#c98b4f");
    bootRect(x-7,oy-9,14,8,"#e1aa67");
    bootRect(x-5,oy-2,3,4,"#17131a");
    bootRect(x+3,oy-2,3,4,"#17131a");
    bootRect(x-12,oy+3,5,10,"#a96d3e");
    bootRect(x+7,oy+3,5,10,"#a96d3e");
  }
  function drawBootPinky(x,y,bob){
    bootMascotCtx.save();
    bootMascotCtx.translate(x,y+bob);
    bootMascotCtx.strokeStyle="#d95c92";
    bootMascotCtx.lineWidth=6;
    bootMascotCtx.lineCap="square";
    bootMascotCtx.beginPath();
    bootMascotCtx.moveTo(9,8);
    bootMascotCtx.lineTo(18,7);
    bootMascotCtx.lineTo(21,-2);
    bootMascotCtx.lineTo(17,-9);
    bootMascotCtx.lineTo(11,-9);
    bootMascotCtx.lineTo(9,-4);
    bootMascotCtx.lineTo(13,0);
    bootMascotCtx.stroke();
    bootRect(-9,5,18,18,"#f58fba");
    bootRect(-13,-12,26,24,"#f58fba");
    bootRect(-10,-10,7,5,"#ffc4da");
    bootRect(-17,-7,6,10,"#f2b693");
    bootRect(11,-7,6,10,"#f2b693");
    bootRect(-8,-7,8,11,"#ffd9c8");
    bootRect(0,-7,8,11,"#ffd9c8");
    bootRect(-6,3,12,5,"#ffd9c8");
    bootRect(-5,-2,3,4,"#251b20");
    bootRect(3,-2,3,4,"#251b20");
    bootRect(-1,2,3,2,"#6d2948");
    bootRect(-4,6,3,2,"#ffd9c8");
    bootRect(2,6,3,2,"#ffd9c8");
    bootRect(-13,21,7,5,"#f2b693");
    bootRect(6,21,7,5,"#f2b693");
    bootMascotCtx.restore();
  }
  function drawBootBunny(x,y,bob){
    const oy=y+bob;
    bootMascotCtx.save();
    bootMascotCtx.translate(x,oy);
    bootRect(-11,-26,7,18,"#fff0cb");
    bootRect(4,-28,7,20,"#fff0cb");
    bootRect(-9,-23,3,12,"#ef9a91");
    bootRect(6,-25,3,14,"#ef9a91");
    bootRect(-15,-12,29,23,"#fff2d0");
    bootRect(10,-3,8,7,"#cf794d");
    bootRect(5,-7,4,5,"#17131a");
    bootRect(-17,13,7,20,"#f1ddbd");
    bootRect(-18,28,8,8,"#ead2ad");
    bootRect(-14,10,29,6,"#236a96");
    bootRect(-11,16,24,18,"#f3e5c8");
    bootRect(-11,18,24,4,"#e84037");
    bootRect(-11,26,24,4,"#e84037");
    bootRect(10,15,7,20,"#f5e4c4");
    bootRect(12,30,9,8,"#ead2ad");
    bootRect(17,25,15,7,"#f2792f");
    bootRect(28,26,7,5,"#d95228");
    bootRect(15,22,6,4,"#55aa4f");
    bootRect(16,30,6,4,"#78c55c");
    bootRect(-10,34,22,9,"#287cad");
    bootRect(-9,42,7,8,"#f1ddbd");
    bootRect(5,42,7,8,"#f1ddbd");
    bootMascotCtx.restore();
  }
  function drawBootMascots(now=0){
    if(!bootMascotCtx||!bootMascotCanvas)return;
    bootMascotCtx.clearRect(0,0,bootMascotCanvas.width,bootMascotCanvas.height);
    const step=Math.floor(now/240)%4;
    const groundY=84;
    drawBootPeanut(44,groundY-13,step===2?-4:0);
    drawBootPinky(116,groundY-26,step===1?-4:0);
    drawBootBunny(196,groundY-50,step===0?-4:0);
  }
  function playBootReveal(){
    if(!bootOverlay)return;
    bootOverlay.classList.add("revealing");
    const duration=1700;
    const start=performance.now();
    const maxRadius=Math.hypot(innerWidth,innerHeight);
    function draw(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      const radius=maxRadius*eased;
      const edge=radius+Math.max(1,18*(1-eased));
      bootOverlay.style.background=`radial-gradient(circle at 50% 50%, transparent 0, transparent ${radius}px, #000 ${edge}px, #000 100%)`;
      if(t<1){
        requestAnimationFrame(draw);
        return;
      }
      bootOverlay.classList.add("done");
      bootOverlay.style.background="";
    }
    requestAnimationFrame(draw);
  }
  function startBootOverlay(){
    if(!bootOverlay)return;
    const duration=5;
    const shuffled=[...bootHints].sort(()=>Math.random()-.5);
    const selected=[shuffled[0]||bootHints[0],shuffled[1]||bootHints[1]||bootHints[0],bootFinalHint];
    let hintIndex=0,startTime=0,finished=false;
    if(bootHint)bootHint.textContent=selected[0];
    if(bootProgressFill)bootProgressFill.style.width="0%";
    if(bootPercent)bootPercent.textContent="0%";
    drawBootMascots(0);
    refreshWalletSilently();
    const refreshTimer=setInterval(refreshWalletSilently,520);
    function bootStep(now){
      if(!startTime)startTime=now;
      const elapsed=(now-startTime)/1000;
      const nextHintAt=hintIndex===0?2:4;
      if(elapsed>=nextHintAt&&hintIndex<selected.length-1){
        hintIndex++;
        if(bootHint)bootHint.textContent=selected[hintIndex];
      }
      const ratio=Math.min(1,elapsed/duration);
      let eased=0;
      if(ratio<.18)eased=ratio/.18*.32;
      else if(ratio<.72)eased=.32+(ratio-.18)/.54*.46;
      else if(ratio<.9)eased=.78+(ratio-.72)/.18*.12;
      else eased=.9+(ratio-.9)/.1*.1;
      const percent=Math.round(eased*100);
      if(bootProgressFill)bootProgressFill.style.width=`${percent}%`;
      if(bootPercent)bootPercent.textContent=`${percent}%`;
      drawBootMascots(now);
      if(ratio<1){
        requestAnimationFrame(bootStep);
        return;
      }
      if(finished)return;
      finished=true;
      clearInterval(refreshTimer);
      refreshWalletSilently();
      setTimeout(playBootReveal,300);
    }
    requestAnimationFrame(bootStep);
  }
  function settleRunCoins(){
    if(runCoinsSettled||runCoins<=0)return;
    syncCoinState();
    meta.coins=Math.max(0,Math.floor(Number(meta.coins)||0)+Math.floor(runCoins));
    walletCoins=meta.coins;
    runCoinsSettled=true;
    saveCoinsOnly();
    syncCoinDisplay();
  }

  function buildCostButtonMarkup(label,cost){
    return `<span class="costButton"><span class="lineTop">${label}</span><span class="lineBottom"><span class="pointDiamond"></span><span>${formatCostShort(cost)}</span></span></span>`;
  }

  function renderAccount(){
    const info=accountLevelInfo();
    accountLevelEl.textContent=`LV-${String(info.level).padStart(2,"0")}`;
    accountExpFill.style.width=info.level>=100?"100%":`${Math.floor(info.exp/info.next*100)}%`;
    accountExpText.textContent=info.level>=100?`MAX・總EXP ${info.total}`:`EXP ${info.exp} / ${info.next}`;
    syncCoinDisplay();
    rewardTrack.innerHTML="";
    for(let lv=5;lv<=100;lv+=5){
      const node=document.createElement("div");
      node.className="rewardNode"+(info.level>=lv?" done":"");
      node.innerHTML=`<b>LV-${String(lv).padStart(2,"0")}</b><small>${info.level>=lv?"可領取":"未達成"}<br>獎勵尚未開放</small>`;
      const btn=document.createElement("button");
      btn.textContent="領取";
      btn.disabled=true;
      node.appendChild(btn);
      rewardTrack.appendChild(node);
    }
  }

  function renderMeta(){
    renderAccount();
    metaPointsEl.innerHTML=`<span class="pointDiamond"></span><span>強化點數 ${formatCostShort(meta.points)}</span>`;
    metaRecordEl.innerHTML=`總擊破 ${meta.totalKills||0}｜菁英 ${meta.totalElites||0}｜BOSS ${meta.totalBosses||0}`;
    metaStatsEl.innerHTML="";
    for(const def of metaDefs){
      if(def.unlock&&!def.unlock(meta))continue;
      const cost=metaUpgradeCost(def);
      const tier=Math.floor(meta[def.id]/10)+1;
      const card=document.createElement("div");
      card.className="statCard";
      card.innerHTML=`<b>${def.name} LV${meta[def.id]}</b><small>${def.desc}<br>目前 ${def.value(meta)}・強化階級 ${tier}</small>`;
      const button=document.createElement("button");
      const maxed=def.cap!==undefined&&meta[def.id]>=def.cap;
      button.textContent=maxed?"已滿級":`強化 1 點（花費 ${cost}）`;
      button.disabled=maxed||meta.points<cost;
      button.onclick=()=>{
        const currentCost=metaUpgradeCost(def);
        if(meta.points<currentCost)return;
        meta.points-=currentCost;
        meta[def.id]++;
        saveMeta();
        button.classList.add("flash");
        setTimeout(()=>button.classList.remove("flash"),110);
        renderMeta();
        beep(620,.09,.025);
      };
      card.appendChild(button);
      metaStatsEl.appendChild(card);
    }
    gardenStage.classList.toggle("active",currentStage===1);
    desertStage.classList.toggle("active",currentStage===2);
    snowStage.classList.toggle("active",currentStage===3);
    infiniteStage.classList.toggle("active",currentStage===4);
    desertStage.disabled=stageAvailability(2)!=="open";
    snowStage.disabled=stageAvailability(3)!=="open";
    gardenStage.innerHTML=stageButtonMarkup("第一關・菜園",1);
    desertStage.innerHTML=stageAvailability(2)==="open"?stageButtonMarkup("第二關・沙漠",2):stageButtonMarkup("第二關・沙漠（未解鎖）",2);
    snowStage.innerHTML=stageAvailability(3)==="open"?stageButtonMarkup("第三關・雪原",3):stageButtonMarkup("第三關・雪原（未解鎖）",3);
    infiniteStage.innerHTML=stageButtonMarkup("無限輪迴模式",4);
    document.getElementById("start").textContent="開始割草";
  }

  function rewardClaimable(level,accountLevel){
    return false;
  }

  function hasClaimableReward(info=accountLevelInfo()){
    return info.level>=5;
  }

  function combatPower(){
    const damageLevel=Math.max(0,meta.damage);
    const speedLevel=Math.max(0,Math.min(100,meta.speed));
    const critLevel=Math.max(0,Math.min(100,meta.crit));
    const critDamageLevel=Math.max(0,Math.min(MAX_CRIT_DAMAGE_LEVEL,meta.critDamage));
    const armorPenLevel=Math.max(0,Math.min(100,meta.armorPen));
    const lifeLevel=Math.max(0,meta.life);
    const regenLevel=Math.max(0,meta.regen);

    const baseDamage=BASE_META_DAMAGE+scaledMetaGain(damageLevel,META_DAMAGE_STEP,META_DAMAGE_TIER_GROWTH);
    const attackRate=1+speedLevel*.03;
    const critChance=metaCritChance(critLevel);
    const critDamage=Math.min(MAX_CRIT_DAMAGE_MULTIPLIER,1.6+critDamageLevel*META_CRIT_DAMAGE_STEP);
    const critExpected=1+critChance*(critDamage-1);
    const armorPenExpected=1+Math.min(MAX_META_ARMOR_PEN,armorPenLevel*.007)*.85;
    const dpsPower=baseDamage*attackRate*critExpected*armorPenExpected*5.8;
    const survivalPower=(BASE_META_LIFE+scaledMetaGain(lifeLevel,META_LIFE_STEP,META_LIFE_TIER_GROWTH))*.55+metaRegenFlatTotal(regenLevel)*32;
    const utilityPower=armorPenLevel*4+critChance*200;
    return Math.floor(100+dpsPower+survivalPower+utilityPower);
  }

  function stageRecommendedPower(stage){
    return stage===4?2000:stage===3?2800:stage===2?850:120;
  }

  function stageDifficultyInfo(stage){
    const power=combatPower();
    const ratio=power/stageRecommendedPower(stage);
    if(ratio<.5)return {label:"危險",className:"danger"};
    if(ratio<.8)return {label:"困難",className:"hard"};
    if(ratio<1.1)return {label:"挑戰",className:"challenge"};
    if(ratio<1.6)return {label:"普通",className:"normal"};
    return {label:"容易",className:"easy"};
  }

  function stageButtonMarkup(label,stage){
    const info=stageDifficultyInfo(stage);
    return `<span class="stageLabel">${label}</span><span class="stageBadge ${info.className}">${info.label}</span>`;
  }

  function formatStageTime(seconds){
    const total=Math.max(0,Math.floor(seconds));
    const h=Math.floor(total/3600);
    const m=Math.floor(total/60);
    const mm=Math.floor((total%3600)/60);
    const s=total%60;
    if(h>0)return `${h}:${String(mm).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function isInfiniteMode(){
    return currentStage===4;
  }

  function infiniteZoneAt(value=time){
    if(!isInfiniteMode())return currentStage===3?2:currentStage===2?1:0;
    return Math.max(0,Math.floor(value/600));
  }

  function infiniteZoneName(zone=infiniteZoneAt()){
    if(zone===0)return "菜園";
    if(zone===1)return "沙漠";
    if(zone===2)return "雪原";
    return "惡魔城";
  }

  function effectiveZone(){
    if(isInfiniteMode()){
      if(finalPhase!=="none")return Math.max(0,infiniteBossZone);
      return infiniteZoneAt();
    }
    return currentStage===3?2:currentStage===2?1:0;
  }

  function infiniteGrowth(){
    const zone=isInfiniteMode()?infiniteZoneAt():0;
    const clearBonus=isInfiniteMode()?infiniteClearCount:0;
    return {
      hp:1+zone*.8+clearBonus*.18,
      damage:1+zone*.18+clearBonus*.08,
      speed:1+zone*.05,
      elite:Math.min(.18,zone*.02)
    };
  }

  function infiniteDisplayedTime(){
    if(!isInfiniteMode())return time;
    if(finalPhase!=="none")return infiniteDisplayFreezeStart-infiniteDisplayOffset;
    return Math.max(0,time-infiniteDisplayOffset);
  }
  function finalBossDisplayName(type){
    if(type==="whale")return "暴雪鯨魚";
    if(type==="reaper")return "惡魔死神";
    if(type==="stoneface")return "遠古石面怪";
    return "霸王食人花";
  }
  function normalStagePointReward(){
    return Math.floor(Math.max(0,kills-eliteKills-bossKills)/25)+eliteKills*3+bossKills*10+Math.floor(time/60)*3;
  }
  function infiniteStagePointReward(){
    return Math.floor(normalStagePointReward()*.3);
  }
  function stageTimerLabel(){
    if(isInfiniteMode()){
      if(finalPhase!=="none"){
        const bossType=bossTypeForZone(infiniteBossZone);
        return `${infiniteZoneName(infiniteBossZone)} BOSS ${finalBossDisplayName(bossType)}`;
      }
      return `${infiniteZoneName()} ${formatStageTime(infiniteDisplayedTime())}`;
    }
    return time>=DURATION?"關卡 BOSS":formatStageTime(Math.max(1,time));
  }

  function renderStageArt(stage){
    if(stage===4){
      stageArt.className="stageInfinite";
      stageArt.innerHTML='<div class="trail1"></div><div class="trail2"></div><div class="trail3"></div><div class="rift"></div><div class="spark1"></div><div class="spark2"></div><div class="spark3"></div>';
      stageName.textContent="無限輪迴模式";
      stagePower.innerHTML=`建議戰力 ∞｜每 10 分鐘進入擂台<br>目前最高生存時間：${formatStageTime(meta.bestInfiniteSeconds||0)}<br>敵人擊破總數：${meta.infiniteTotalKills||0}`;
      return;
    }
    if(stage===3){
      stageArt.className="stageSnow";
      stageArt.innerHTML='<div class="snowHill1"></div><div class="snowHill2"></div><div class="iceRock"></div><div class="pine"></div><div class="flake1"></div><div class="flake2"></div><div class="flake3"></div>';
      stageName.textContent="第三關・雪原";
    }else if(stage===2){
      stageArt.className="stageDesert";
      stageArt.innerHTML='<div class="sun"></div><div class="dune1"></div><div class="dune2"></div><div class="cactus"></div>';
      stageName.textContent="第二關・沙漠";
    }else{
      stageArt.className="stageGarden";
      stageArt.innerHTML='<div class="gardenBed gardenBed1"></div><div class="gardenBed gardenBed2"></div><div class="shadow"></div><div class="sprout sprout1"></div><div class="sprout sprout2"></div><div class="flower flower1"></div><div class="flower flower2"></div><div class="leaf1"></div><div class="leaf2"></div><div class="leaf3"></div><div class="carrot"></div>';
      stageName.textContent="第一關・菜園";
    }
    stagePower.textContent=`建議戰力 ${stageRecommendedPower(stage)}｜目前戰力 ${combatPower()}`;
  }

  function detailLineMarkup(text){
    const currentClass=text.startsWith("目前 ")?" current":"";
    return `<div class="detailLine${currentClass}"><span class="detailTrack"><span class="detailText">${text}</span><span class="detailClone" aria-hidden="true">${text}</span></span></div>`;
  }

  function setupMetaMarquees(){
    requestAnimationFrame(()=>{
      metaStatsEl.querySelectorAll(".detailLine").forEach(line=>{
        const textEl=line.querySelector(".detailText");
        if(!textEl)return;
        line.classList.remove("marquee");
        line.style.removeProperty("--marquee-shift");
        line.style.removeProperty("--marquee-duration");
        const overflow=textEl.scrollWidth-line.clientWidth;
        if(overflow>8){
          const shift=Math.ceil(overflow+30);
          const duration=Math.max(10,Math.min(22,shift/11));
          line.style.setProperty("--marquee-shift",`${shift}px`);
          line.style.setProperty("--marquee-duration",`${duration}s`);
          line.classList.add("marquee");
        }
      });
    });
  }

  function metaDetailLines(def){
    const tier=Math.floor(meta[def.id]/10)+1;
    if(def.id==="damage")return [
      `每級 +${metaDamagePerLevel(meta.damage).toFixed(3).replace(/\.?0+$/,"")} 攻擊`,
      "每10級成長 +0.2%",
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    if(def.id==="life")return [
      `每級 +${metaLifePerLevel(meta.life).toFixed(2).replace(/\.?0+$/,"")} 生命`,
      "每10級成長 +0.5%",
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    if(def.id==="regen")return [
      `每級 +${metaRegenPerLevel(Math.max(1,meta.regen||1)).toFixed(2)} HP/秒`,
      `每10級成長 +${META_REGEN_STAGE_STEP.toFixed(2)}`,
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    if(def.id==="speed")return [
      "每等級 +3%攻速",
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    if(def.id==="crit")return [
      `每級 +${metaCritPerLevel(meta.crit).toFixed(2).replace(/\.?0+$/,"")}%`,
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    if(def.id==="critDamage")return [
      `每級 +${metaCritDamagePerLevel(meta.critDamage).toFixed(2).replace(/\.?0+$/,"")}%爆傷`,
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    if(def.id==="armorPen")return [
      "每等級 +0.7%穿防",
      `目前 ${def.value(meta)}`,
      `費用階段 ${tier}`
    ];
    return [`目前 ${def.value(meta)}`,`費用階段 ${tier}`];
  }

  renderAccount=function(){
    const info=accountLevelInfo();
    rewardPlaytimeEl.textContent=formatPlaytimeSummary(meta.totalPlaySeconds||0);
    accountLevelEl.textContent=`LV-${String(info.level).padStart(2,"0")}`;
    accountExpFill.style.width=info.level>=100?"100%":`${Math.floor(info.exp/info.next*100)}%`;
    accountExpText.textContent=info.level>=100?`MAX｜總EXP ${info.total}`:`EXP ${info.exp} / ${info.next}`;
    accountBox.classList.toggle("claimable",hasClaimableReward(info));
    if(coinDevAddBtn)coinDevAddBtn.classList.toggle("hidden",!devModeActive);
    rewardTrack.innerHTML="";
    for(let lv=5;lv<=100;lv+=5){
      const claimed=meta.claimedRewards.includes(lv);
      const claimable=rewardClaimable(lv,info.level);
      const unlocked=info.level>=lv;
      const node=document.createElement("div");
      node.className=`rewardNode${claimed?" done":""}${claimable?" claimable":""}`;
      node.innerHTML=`<b>LV-${String(lv).padStart(2,"0")}</b><small>${claimed?"已領取":unlocked?"已達成":"未達成"}<br>獎勵尚未開放</small>`;
      const btn=document.createElement("button");
      btn.textContent=claimed?"已領取":"尚未開放";
      btn.classList.toggle("claimable",claimable);
      btn.disabled=true;
      btn.onclick=()=>{
        if(!rewardClaimable(lv,accountLevelInfo().level))return;
        meta.claimedRewards.push(lv);
        saveMeta();
        renderMeta();
      beep(760,.08,.025);
      countAudioSubtype("ui");
      };
      node.appendChild(btn);
      rewardTrack.appendChild(node);
    }
  };

  renderMeta=function(){
    renderAccount();
    document.querySelector(".homeTitle").innerHTML=`兔兔割草大冒險 <span class="homeVersion">V.${APP_VERSION}</span>`;
    document.getElementById("start").textContent="開始割草";
    characterBtn.textContent="角色資訊";
    adventureBookBtn.textContent="冒險筆記";
    shopBtn.textContent="精靈商城";
    metaPointsEl.innerHTML=`<span class="pointDiamond"></span><span>強化點數 ${formatCostShort(meta.points)}</span>`;
    metaRecordEl.innerHTML=`總擊破 ${meta.totalKills||0}｜菁英 ${meta.totalElites||0}｜BOSS ${meta.totalBosses||0}`;
    powerBox.innerHTML=`<span class="powerLabel">戰力</span><span class="powerValue">${combatPower()}</span>`;
    devResetBtn.classList.toggle("hidden",!devModeActive);
    document.getElementById("devTestBtn").classList.toggle("hidden",!devModeActive);
    renderStageArt(currentStage);
    metaStatsEl.innerHTML="";
    for(const def of metaDefs){
      if(def.unlock&&!def.unlock(meta))continue;
      const cost=metaUpgradeCost(def);
      const card=document.createElement("div");
      card.className="statCard";
      const maxed=def.cap!==undefined&&meta[def.id]>=def.cap;
      const detailLines=metaDetailLines(def);
      card.innerHTML=`<b>${def.name} LV${meta[def.id]}</b><small>${detailLines.map(detailLineMarkup).join("")}</small>`;
      const actions=document.createElement("div");
      actions.className="statActions";
      const singleButton=document.createElement("button");
      singleButton.innerHTML=maxed?`<span class="costButton"><span class="lineTop">已達上限</span><span class="lineBottom"></span></span>`:buildCostButtonMarkup("強化 1 次",cost);
      singleButton.disabled=maxed||meta.points<cost;
      singleButton.onclick=()=>{
        const currentCost=metaUpgradeCost(def);
        if(meta.points<currentCost)return;
        meta.points-=currentCost;
        meta[def.id]++;
        saveMeta();
        singleButton.classList.add("flash");
        setTimeout(()=>singleButton.classList.remove("flash"),110);
        renderMeta();
        beep(620,.09,.025);
        countAudioSubtype("ui");
      };
      const bulkInfo=metaBulkUpgradeInfo(def,10);
      const bulkButton=document.createElement("button");
      if(maxed){
        bulkButton.innerHTML=`<span class="costButton"><span class="lineTop">已達上限</span><span class="lineBottom"></span></span>`;
        bulkButton.disabled=true;
      }else if(bulkInfo.count===0){
        bulkButton.innerHTML=`<span class="costButton"><span class="lineTop">點數不足</span><span class="lineBottom"><span class="pointDiamond"></span><span>${formatCostShort(cost)}</span></span></span>`;
        bulkButton.disabled=true;
      }else{
        bulkButton.innerHTML=buildCostButtonMarkup(`強化 ${bulkInfo.count} 次`,bulkInfo.totalCost);
        bulkButton.disabled=false;
        bulkButton.onclick=()=>{
          const applyInfo=metaBulkUpgradeInfo(def,10);
          if(applyInfo.count===0)return;
          meta.points-=applyInfo.totalCost;
          meta[def.id]+=applyInfo.count;
          saveMeta();
          bulkButton.classList.add("flash");
          setTimeout(()=>bulkButton.classList.remove("flash"),110);
          renderMeta();
          beep(700,.11,.03);
          countAudioSubtype("ui");
        };
      }
      actions.appendChild(singleButton);
      actions.appendChild(bulkButton);
      card.appendChild(actions);
      metaStatsEl.appendChild(card);
    }
    setupMetaMarquees();
    gardenStage.classList.toggle("active",currentStage===1);
    desertStage.classList.toggle("active",currentStage===2);
    snowStage.classList.toggle("active",currentStage===3);
    infiniteStage.classList.toggle("active",currentStage===4);
    desertStage.disabled=stageAvailability(2)!=="open";
    snowStage.disabled=stageAvailability(3)!=="open";
    desertStage.classList.toggle("locked",stageAvailability(2)!=="open");
    snowStage.classList.toggle("locked",stageAvailability(3)!=="open");
    gardenStage.innerHTML=stageButtonMarkup("第一關・菜園",1);
    desertStage.innerHTML=stageAvailability(2)==="open"?
      stageButtonMarkup("第二關・沙漠",2):
      stageButtonMarkup("第二關・沙漠（未解鎖）",2);
    snowStage.innerHTML=stageAvailability(3)==="open"?
      stageButtonMarkup("第三關・雪原",3):
      stageButtonMarkup("第三關・雪原（未解鎖）",3);
    infiniteStage.innerHTML=stageButtonMarkup("無限輪迴模式",4);
  };

  const player={
    x:0,y:0,r:18,speed:210,hp:100,maxHp:100,regen:0,regenFlat:0,
    regenBoost:1,
    level:1,xp:0,nextXp:18,damage:18,attackSpeed:1,projectiles:1,
    crit:0.05,critStack:0.05,critDamage:1.6,pierce:0,magnet:FIXED_MAGNET_RANGE,area:1,areaDamage:1,xpGain:1,invuln:0,
    armorPen:0,facing:1
  };
  const skills={orbit:0,burst:0,peanut:0,pinky:0,brain:0};
  const upgradeLevels={
    speed:0,heal:0,haste:0,damage:0,crit:0,critd:0,
    pierce:0,vital:0,area:0,multi:0,armorPen:0
  };
  const BASIC_UPGRADE_CAP=5;
  const KILL_SURGE_THRESHOLD=500;
  const KILL_SURGE_HP_MULTIPLIER=1.6;
  const KILL_SURGE_WAVE_MULTIPLIER=1.75;

  const upgrades=[
    {id:"speed",icon:"👟",name:"兔兔快跑",desc:"+12% 移動速度",basic:true,apply(){player.speed*=1.12;}},
    {id:"heal",icon:"💚",name:"生命回復",desc:"基礎回復 +20%・每秒回復最大生命 1.2%",cap:5,apply(){player.regen+=0.012;player.regenBoost+=0.2;}},
    {id:"haste",icon:"⏩",name:"攻擊速度",desc:"+15% 攻擊速度",basic:true,apply(){player.attackSpeed*=1.15;}},
    {id:"damage",icon:"⚔",name:"胡蘿蔔威力",desc:"+18% 攻擊力",basic:true,apply(){player.damage*=1.18;}},
    {id:"crit",icon:"🍀",name:"幸運一擊",desc:"+7% 基礎爆擊率",basic:true,valid(){return player.crit<1;},apply(){const old=player.crit;player.crit=Math.min(1,player.crit+.07);player.critStack=Math.min(1,player.critStack+player.crit-old);}},
    {id:"critd",icon:"💥",name:"爆擊強化",desc:"+30% 場內爆擊傷害",basic:true,apply(){player.critDamage+=.3;}},
    {id:"pierce",icon:"➶",name:"銳利蘿蔔",desc:"+1 穿透敵人數",basic:true,apply(){player.pierce++;}},
    {id:"multi",icon:"🥕",name:"同步發射",desc:"同步發射 +1；點滿後含本體共 6 支蘿蔔，並以散射射出",valid(){return player.projectiles<6;},apply(){player.projectiles++;}},
    {id:"vital",icon:"❤",name:"強健兔兔",desc:"+20% 最大生命並回復",basic:true,apply(){player.maxHp*=1.2;player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.3);}},
    {id:"area",icon:"⭕",name:"範圍性胡蘿蔔",desc:"+18% 附加技能範圍、+4% 全武器與技能傷害",basic:true,apply(){player.area*=1.18;player.areaDamage*=1.04;}},
    {id:"orbit",icon:"🌀",name:"蘿蔔旋風",desc:"環繞胡蘿蔔傷害敵人；LV5進化高速切割",valid(){return skills.orbit<5;},apply(){skills.orbit++;}},
    {id:"burst",icon:"🌱",name:"菜園爆發",desc:"定時造成範圍傷害；LV5進化巨大衝擊圈",valid(){return skills.burst<5;},apply(){skills.burst++;}},
    {id:"peanut",icon:"🥜",name:"花生跟班",desc:"花生自動丟石頭；LV5進化貫穿滾石",valid(){return skills.peanut<5;},apply(){skills.peanut++;}},
    {id:"pinky",icon:"🍌",name:"PINKY 跟班",desc:"香蕉直線穿透後原路返回；接回強化攻擊與移速",valid(){return skills.pinky<5;},apply(){skills.pinky++;}},
    {id:"brain",icon:"🧠",name:"超級頭腦",desc:"經驗獲取量累計：LV1 +40%／LV2 +100%／LV3 +180%／LV4 +280%／LV5 +400%",valid(){return skills.brain<5;},apply(){const gain=[.4,.6,.8,1,1.2][skills.brain]||0;player.xpGain+=gain;skills.brain++;}},
    {id:"armorPen",icon:"🛡",name:"破甲胡蘿蔔",desc:"+8% 無視防禦（第二關 / 第三關 / 無限輪迴）",cap:5,valid(){return (currentStage===2||currentStage===3||isInfiniteMode())&&upgradeLevels.armorPen<5;},apply(){player.armorPen+=.08;}}
  ];

  const enemyData={
    turtle:{hp:34,speed:48,damage:10,xp:4,r:18,color:"#55a94d"},
    mushroom:{hp:22,speed:68,damage:8,xp:3,r:15,color:"#9b5a3d"},
    bombcloud:{hp:48,speed:42,damage:14,xp:6,r:20,color:"#60667b"},
    plant:{hp:60,speed:34,damage:16,xp:7,r:19,color:"#dd4a45",defense:0},
    snake:{hp:35,speed:92,damage:10,xp:4,r:14,color:"#b7a83b",defense:5},
    scorpion:{hp:85,speed:44,damage:20,xp:8,r:21,color:"#d5c6a2",defense:20},
    mouse:{hp:32,speed:105,damage:8,xp:4,r:13,color:"#8f8b83",defense:4},
    vulture:{hp:62,speed:72,damage:14,xp:7,r:20,color:"#6b5a4a",defense:10},
    centipede:{hp:70,speed:58,damage:16,xp:8,r:19,color:"#b5793b",defense:14},
    stoneface:{hp:40000,speed:30,damage:30,xp:300,r:64,color:"#7d7162",defense:45},
    penguin:{hp:120,speed:102,damage:18,xp:4,r:16,color:"#263d52",defense:14},
    snowman:{hp:260,speed:42,damage:30,xp:6,r:23,color:"#edf8ff",defense:24},
    polarbear:{hp:360,speed:60,damage:38,xp:7,r:25,color:"#e7f1f3",defense:30},
    seal:{hp:180,speed:84,damage:24,xp:4,r:19,color:"#91aebe",defense:18},
    whale:{hp:120000,speed:24,damage:52,xp:340,r:72,color:"#568caa",defense:70},
    skeleton:{hp:160,speed:70,damage:24,xp:14,r:18,color:"#d8d0c0",defense:18},
    wisp:{hp:125,speed:100,damage:22,xp:13,r:16,color:"#4db6ff",defense:8},
    bat:{hp:105,speed:128,damage:18,xp:12,r:15,color:"#4b304e",defense:8},
    eyeball:{hp:190,speed:58,damage:26,xp:16,r:20,color:"#e2d7c8",defense:16},
    imp:{hp:260,speed:78,damage:34,xp:20,r:21,color:"#aa3348",defense:24},
    reaper:{hp:98000,speed:36,damage:42,xp:520,r:68,color:"#331421",defense:60}
  };
  const adventureSkillEntries=[
    {id:"damage",icon:"⚔",name:"胡蘿蔔威力",type:"攻擊",effect:"+18% 攻擊力",detail:"直接提升主武器基礎傷害。"},
    {id:"haste",icon:"⏩",name:"攻擊速度",type:"攻速",effect:"+15% 攻擊速度",detail:"提升胡蘿蔔每秒發射頻率。"},
    {id:"crit",icon:"🍀",name:"幸運一擊",type:"爆擊",effect:"+7% 基礎爆擊率",detail:"提高爆擊觸發機率。"},
    {id:"critd",icon:"💥",name:"爆擊強化",type:"爆傷",effect:"+30% 場內爆擊傷害",detail:"只放大爆擊時的傷害上限。"},
    {id:"multi",icon:"🥕",name:"同步發射",type:"主武器",effect:"+1 發同步蘿蔔",detail:"點滿後含本體共 6 支，並以散射發射。"},
    {id:"pierce",icon:"➶",name:"銳利蘿蔔",type:"穿透",effect:"+1 穿透數",detail:"讓主武器連續打穿更多敵人。"},
    {id:"speed",icon:"👟",name:"兔兔快跑",type:"移動",effect:"+12% 移動速度",detail:"讓兔兔更容易拉扯與閃避。"},
    {id:"vital",icon:"❤",name:"強健兔兔",type:"生存",effect:"+20% 最大生命",detail:"提升最大生命並立即回一段血。"},
    {id:"heal",icon:"💚",name:"生命回復",type:"回復",effect:"基礎回復 +20%・每秒回復最大生命 1.2%",detail:"兼顧固定回復與最大生命回復。"},
    {id:"area",icon:"⭕",name:"範圍性胡蘿蔔",type:"範圍",effect:"+18% 附加技能範圍・+4% 全武器技能傷害",detail:"不影響小胡蘿蔔本體大小，只放大巨大胡蘿蔔與各種附加技能範圍。"},
    {id:"orbit",icon:"🌀",name:"蘿蔔旋風",type:"技能",effect:"環繞切割；LV5 高速進化",detail:"貼身護體，適合清理近身怪。"},
    {id:"burst",icon:"🌱",name:"菜園爆發",type:"技能",effect:"定時爆圈；LV5 巨大衝擊圈",detail:"穩定補充範圍傷害。"},
    {id:"peanut",icon:"🥜",name:"花生跟班",type:"跟班",effect:"自動丟石頭；LV5 貫穿滾石",detail:"提供額外遠程火力。"},
    {id:"pinky",icon:"🍌",name:"PINKY 跟班",type:"增益",effect:"香蕉返回接住後增傷加速",detail:"接到香蕉可短時間爆發。"},
    {id:"brain",icon:"🧠",name:"超級頭腦",type:"成長",effect:"LV5 累計 +400% 經驗獲取",detail:"累計效果：LV1 +40%／LV2 +100%／LV3 +180%／LV4 +280%／LV5 +400%。"},
    {id:"armorPen",icon:"🛡",name:"破甲胡蘿蔔",type:"破防",effect:"+8% 無視防禦",detail:"第二關、第三關與輪迴特別實用。"}
  ];
  const stageBestiary={
    1:[
      {type:"turtle",name:"菜龜",skill:"厚殼慢推"},
      {type:"mushroom",name:"蘑菇怪",skill:"短距衝臉"},
      {type:"bombcloud",name:"炸雲",skill:"高血量慢壓迫"},
      {type:"plant",name:"食人花",skill:"高血量站樁壓場"},
    ],
    2:[
      {type:"snake",name:"沙蛇",skill:"高速突進"},
      {type:"mouse",name:"沙鼠",skill:"敏捷亂竄"},
      {type:"vulture",name:"禿鷹",skill:"中速追擊"},
      {type:"centipede",name:"沙地蜈蚣",skill:"穩定推進"},
      {type:"scorpion",name:"木乃伊蠍",skill:"高防近戰"},
    ],
    3:[
      {type:"penguin",name:"企鵝",skill:"高速貼身"},
      {type:"seal",name:"海豹",skill:"中速壓迫"},
      {type:"snowman",name:"雪人",skill:"高血防守"},
      {type:"polarbear",name:"北極熊",skill:"厚血重擊"},
    ]
  };
  const bossBestiary=[
    {type:"plant",name:"霸王食人花",stage:1,unlock:()=>!!meta.stage1Cleared,skill:"近身壓場・噴火骨彈",stats:{hp:70000,damage:32,defense:15,speed:52}},
    {type:"stoneface",name:"遠古石面怪",stage:2,unlock:()=>!!meta.stage2Cleared,skill:"落石砸擊・25% 機率暈眩 1 秒",stats:{hp:120000,damage:30,defense:45,speed:30}},
    {type:"whale",name:"暴雪鯨魚",stage:3,unlock:()=>!!meta.stage3Cleared,skill:"急凍光線・暴風雪壓制",stats:{hp:120000,damage:52,defense:70,speed:24}}
  ];
  function stageAvailability(stage){
    if(stage>IMPLEMENTED_STAGE_COUNT)return "comingSoon";
    if(stage<=1)return "open";
    if(stage===2)return meta.desertUnlocked?"open":"locked";
    if(stage===3)return meta.snowUnlocked?"open":"locked";
    return "locked";
  }
  function stageBookUnlocked(stage){
    return stageAvailability(stage)==="open";
  }
  function bookPreviewCanvas(type,{silhouette=false,size=82}={}){
    const c=document.createElement("canvas");
    c.width=size;
    c.height=size;
    const px=c.getContext("2d");
    px.imageSmoothingEnabled=false;
    px.clearRect(0,0,size,size);
    drawEnemyPreview(px,type,size/2,size/2,size*.68,silhouette);
    if(silhouette)c.classList.add("bookLockedSilhouette");
    return c;
  }
  const snowSnapshotTypes=new Set(["penguin","snowman","polarbear","seal","whale"]);
  const enemySnapshotCache=new Map();
  function getEnemySnapshot(type){
    if(!snowSnapshotTypes.has(type))return null;
    if(enemySnapshotCache.has(type))return enemySnapshotCache.get(type);
    const size=96;
    const c=document.createElement("canvas");
    c.width=size;
    c.height=size;
    const px=c.getContext("2d");
    px.imageSmoothingEnabled=false;
    px.clearRect(0,0,size,size);
    drawEnemyPreview(px,type,size/2,size/2,44,false);
    enemySnapshotCache.set(type,c);
    return c;
  }
  function enemyStatLines(type,extraSkill){
    const base=enemyData[type];
    if(!base)return "資料整理中";
    const defense=base.defense||0;
    return `HP ${base.hp}\n攻擊力 ${base.damage}\n防禦力 ${defense}\n移動速度 ${base.speed}\n技能 ${extraSkill||"—"}`;
  }
  function bossStatLines(boss){
    const stats=boss.stats;
    if(!stats)return enemyStatLines(boss.type,boss.skill);
    const phaseConfig=finalBossPhaseConfig(boss.type);
    const hpBars=phaseConfig&&Array.isArray(phaseConfig.hp)?phaseConfig.hp:[stats.hp];
    return `HP1 ${hpBars[0]||stats.hp}\nHP2 ${hpBars[1]||stats.hp}\nHP3 ${hpBars[2]||stats.hp}\n攻擊力 ${stats.damage}\n防禦力 ${stats.defense}\n移動速度 ${stats.speed}\n技能 ${boss.skill||"—"}`;
  }
  function renderBookCard({title,lines,previewType,silhouette=false,extraClass=""}){
    const card=document.createElement("div");
    card.className=`bookCard ${extraClass}`.trim();
    const preview=document.createElement("div");
    preview.className="bookPreview";
    preview.appendChild(bookPreviewCanvas(previewType,{silhouette}));
    const info=document.createElement("div");
    info.className="bookInfo";
    const titleEl=document.createElement("b");
    titleEl.textContent=title;
    const small=document.createElement("small");
    small.textContent=lines;
    info.appendChild(titleEl);
    info.appendChild(small);
    card.appendChild(preview);
    card.appendChild(info);
    return card;
  }
  function drawEnemyPreview(px,type,cx,cy,box,silhouette=false){
    const scale=Math.max(.55,Math.min(1.3,box/44));
    const rect=(x,y,w,h,color)=>{px.fillStyle=silhouette?"#050507":color;px.fillRect(Math.round(cx+x*scale),Math.round(cy+y*scale),Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale)));};
    px.save();
    px.translate(0,0);
    if(type==="turtle"){
      rect(-15,-10,27,23,"#397d3f");rect(-10,-14,22,22,"#67b551");rect(-5,-9,12,12,"#b0d867");rect(9,-10,11,9,"#ead17c");rect(14,-8,3,3,"#171624");
    }else if(type==="mushroom"){
      rect(-12,-2,24,17,"#9a633f");rect(-17,-12,34,16,"#7b4432");rect(-12,-9,7,6,"#e6b16e");rect(5,-9,7,6,"#e6b16e");rect(-7,3,4,5,"#171624");rect(4,3,4,5,"#171624");
    }else if(type==="bombcloud"){
      rect(-17,-7,34,18,"#686d80");rect(-11,-14,22,25,"#858b9c");rect(-8,-4,5,4,"#151525");rect(5,-4,5,4,"#151525");rect(13,-15,12,5,"#333747");rect(23,-17,4,4,"#ffb83e");
    }else if(type==="plant"){
      rect(-7,12,14,20,"#3f7d3a");
      rect(-18,-2,36,18,"#dd4a45");
      rect(-12,-12,24,14,"#c53b46");
      rect(-8,-9,6,6,"#171624");
      rect(2,-9,6,6,"#171624");
      rect(-16,-14,8,10,"#78c75f");
      rect(8,-14,8,10,"#78c75f");
      rect(-22,3,8,12,"#78c75f");
      rect(14,3,8,12,"#78c75f");
      rect(-9,16,18,4,"#2e5f2b");
    }else if(type==="snake"){
      rect(-16,5,8,8,"#a99b35");rect(-9,0,8,9,"#c7b943");rect(-2,-5,8,10,"#a99b35");rect(5,-10,13,13,"#d5c64d");rect(11,-7,3,3,"#231c25");rect(17,-3,6,2,"#d6534c");
    }else if(type==="scorpion"){
      rect(-9,-18,18,13,"#d8c7a0");rect(-12,-5,24,25,"#cdbb94");
      rect(-15,-2,7,22,"#d8c7a0");rect(8,-2,7,22,"#d8c7a0");
      rect(-10,19,7,12,"#bda77f");rect(3,19,7,12,"#bda77f");
      rect(-13,-15,26,4,"#efe3c4");rect(-12,-7,24,4,"#efe3c4");rect(-13,1,26,4,"#efe3c4");rect(-11,9,22,4,"#efe3c4");rect(-10,17,20,4,"#efe3c4");
      rect(-6,-12,5,2,"#16131c");rect(2,-12,5,2,"#16131c");
      rect(-16,4,7,3,"#efe3c4");rect(9,10,7,3,"#efe3c4");
    }else if(type==="mouse"){
      rect(-14,-6,27,16,"#85817a");rect(-18,-9,9,8,"#aaa49a");rect(7,-10,9,8,"#aaa49a");rect(8,-1,4,4,"#211b20");rect(-3,0,5,3,"#f0c2ba");rect(12,5,13,3,"#6f6a64");
    }else if(type==="vulture"){
      rect(-8,-13,16,26,"#5e4f43");rect(-20,-5,15,8,"#806b56");rect(5,-5,15,8,"#806b56");rect(-6,-17,12,9,"#c7b69f");rect(-3,-14,2,2,"#191624");rect(2,-14,2,2,"#191624");rect(-2,-9,4,8,"#d6a13e");
    }else if(type==="centipede"){
      for(let i=0;i<5;i++){
        const x=-22+i*9;
        const y=-5+(i%2?3:0);
        rect(x,y,10,11,i%2?"#c1823f":"#a76736");
        rect(x+2,11,3,5,"#6b3a26");
      }
      rect(20,-7,12,14,"#d19a4d");
      rect(25,-3,3,3,"#211b20");
      rect(30,-1,6,2,"#d65045");
    }else if(type==="stoneface"){
      rect(-17,-18,34,38,"#746b60");rect(-13,-14,26,30,"#948779");rect(-10,-7,7,7,"#241f20");rect(4,-7,7,7,"#241f20");rect(-7,7,14,5,"#443c38");
    }else if(type==="penguin"){
      rect(-10,-18,20,36,"#263d52");
      rect(-7,-10,14,24,"#f2fbff");
      rect(-5,-15,4,4,"#111827");
      rect(3,-15,4,4,"#111827");
      rect(-3,-8,6,4,"#f0a33a");
      rect(-12,14,8,5,"#f0a33a");
      rect(4,14,8,5,"#f0a33a");
    }else if(type==="snowman"){
      rect(-12,-3,24,22,"#edf8ff");rect(-9,-21,18,18,"#edf8ff");rect(-7,-17,4,4,"#1e2533");rect(3,-17,4,4,"#1e2533");rect(-2,-10,4,7,"#ff9a45");
    }else if(type==="polarbear"){
      rect(-16,-12,32,28,"#edf5f7");
      rect(-10,-19,20,12,"#edf5f7");
      rect(-12,-23,5,5,"#edf5f7");rect(7,-23,5,5,"#edf5f7");
      rect(-6,-15,4,4,"#1b2231");rect(2,-15,4,4,"#1b2231");
      rect(-3,-9,6,4,"#8b6d63");
      rect(-18,10,8,11,"#d5e5e8");rect(10,10,8,11,"#d5e5e8");
    }else if(type==="seal"){
      rect(-18,-8,36,18,"#8caab8");rect(-10,-14,20,10,"#9db8c5");rect(10,-3,6,4,"#1d2731");rect(-7,8,10,5,"#6f8f9b");
    }else if(type==="whale"){
      rect(-28,-10,56,20,"#4f86a6");rect(-18,-18,32,18,"#689cc0");rect(20,-6,12,8,"#2b5069");rect(-24,6,14,10,"#d5edf8");rect(16,10,10,8,"#3e6988");
    }
    px.restore();
  }
  function renderAdventureBook(){
    if(!adventureBookContent)return;
    bookTabSkills.classList.toggle("active",bookMainTab==="skills");
    bookTabStages.classList.toggle("active",bookMainTab==="stages");
    bookTabBosses.classList.toggle("active",bookMainTab==="bosses");
    adventureBookContent.innerHTML="";
    if(bookMainTab==="stages"){
      bookSubTabs.classList.remove("hidden");
      bookSubTabs.innerHTML="";
      [1,2,3].forEach(stage=>{
        const btn=document.createElement("button");
        const state=stageAvailability(stage);
        const unlocked=state==="open";
        btn.type="button";
        btn.textContent=stage===1?"第一關・菜園":stage===2?"第二關・沙漠":"第三關・雪原";
        btn.classList.toggle("active",bookStageTab===stage);
        btn.classList.toggle("locked",!unlocked);
        btn.classList.toggle("comingSoon",state==="comingSoon");
        if(!unlocked)btn.textContent+=" 🔒";
        btn.disabled=!unlocked;
        btn.onclick=()=>{if(!unlocked)return;playUiClick();bookStageTab=stage;renderAdventureBook();};
        bookSubTabs.appendChild(btn);
      });
    }else{
      bookSubTabs.classList.add("hidden");
      bookSubTabs.innerHTML="";
    }
    if(bookMainTab==="skills"){
      const note=document.createElement("div");
      note.className="bookSectionNote";
      note.textContent="記錄兔兔在關卡內可取得的能力，方便回看攻擊、爆擊、生存與特殊技能效果。";
      adventureBookContent.appendChild(note);
      const grid=document.createElement("div");
      grid.className="bookSkillGrid";
      for(const entry of adventureSkillEntries){
        grid.appendChild(renderBookCard({
          title:`${entry.icon} ${entry.name}`,
          lines:`類型 ${entry.type}\n效果 ${entry.effect}\n說明 ${entry.detail}`,
          previewType:"turtle",
          silhouette:false
        }));
      }
      adventureBookContent.appendChild(grid);
      grid.querySelectorAll(".bookPreview").forEach((el,i)=>{el.textContent="";const icon=document.createElement("div");icon.style.fontSize="34px";icon.style.lineHeight="1";icon.textContent=adventureSkillEntries[i].icon;el.appendChild(icon);});
      return;
    }
    if(bookMainTab==="stages"){
      const grid=document.createElement("div");
      grid.className="bookStageGrid";
      for(const enemy of stageBestiary[bookStageTab]||[]){
        grid.appendChild(renderBookCard({
          title:enemy.name,
          lines:enemyStatLines(enemy.type,enemy.skill),
          previewType:enemy.type
        }));
      }
      adventureBookContent.appendChild(grid);
      return;
    }
    const note=document.createElement("div");
    note.className="bookSectionNote";
    note.textContent="未真正擊敗過的關卡 BOSS 會以黑色剪影顯示。";
    adventureBookContent.appendChild(note);
    const grid=document.createElement("div");
    grid.className="bookBossGrid";
    for(const boss of bossBestiary){
      const unlocked=boss.unlock();
      grid.appendChild(renderBookCard({
        title:unlocked?boss.name:"？？？",
        lines:unlocked?bossStatLines(boss):"HP ？？？\n攻擊力 ？？？\n防禦力 ？？？\n移動速度 ？？？\n技能 ？？？",
        previewType:boss.type,
        silhouette:!unlocked,
        extraClass:unlocked?"":"bookUnknown"
      }));
    }
    adventureBookContent.appendChild(grid);
  }
  // Optional external audio files. Only list files that actually exist to avoid HTTP 404 spam.
  const externalAudioDefs={
    crit:"audio/ro/Blunt-Critical-Hit.wav",
    crit2:"audio/ro/Blunt-Critical-Hit-2.wav",
    crit3:"audio/ro/Blunt-Critical-Hit-3.wav",
    giantExplosion:"audio/giant-explosion.wav"
  };
  const externalAudioConfig={
    crit:{minInterval:70},
    crit2:{minInterval:70},
    crit3:{minInterval:70},
    smallCarrot:{minInterval:24},
    giantLaunch:{minInterval:120},
    giantExplosion:{minInterval:120}
  };
  const externalAudio={};

  function resetExternalAudioState(){
    for(const key of Object.keys(externalAudio))delete externalAudio[key];
  }

  function initExternalAudio(){
    if(!audio)return;
    for(const [key,src] of Object.entries(externalAudioDefs)){
      if(externalAudio[key]?.loading||externalAudio[key]?.ok!==undefined)continue;
      const config=externalAudioConfig[key]||{minInterval:60};
      externalAudio[key]={buffer:null,ok:null,lastPlayed:0,minInterval:config.minInterval,loading:true};
      fetch(src)
        .then(res=>{
          if(!res.ok)throw new Error(`audio fetch failed: ${src}`);
          return res.arrayBuffer();
        })
        .then(buf=>audio.decodeAudioData(buf.slice(0)))
        .then(buffer=>{
          if(externalAudio[key]){
            externalAudio[key].buffer=buffer;
            externalAudio[key].ok=true;
          }
        })
        .catch(()=>{
          if(externalAudio[key])externalAudio[key].ok=false;
        })
        .finally(()=>{
          if(externalAudio[key])externalAudio[key].loading=false;
        });
    }
  }

  function playExternalAudio(key,volume=1,rate=1){
    const entry=externalAudio[key];
    if(!entry||entry.ok!==true||!entry.buffer||muted||!audio)return false;
    const finalVolume=Math.max(0,Math.min(1,volume*externalVolumeForKey(key)));
    if(finalVolume<=0)return true;
    const now=performance.now();
    if(now-entry.lastPlayed<entry.minInterval)return false;
    try{
      const source=audio.createBufferSource();
      const gain=audio.createGain();
      entry.lastPlayed=now;
      source.buffer=entry.buffer;
      source.playbackRate.setValueAtTime(Math.max(.5,Math.min(2,rate)),audio.currentTime);
      gain.gain.setValueAtTime(finalVolume,audio.currentTime);
      source.connect(gain).connect(audio.destination);
      source.start();
      countAudioDebug("external");
      return true;
    }catch{
      countAudioDebug("externalFail");
      return false;
    }
  }

  function initAudio(){
    if(muted)return;
    if(!audio||audio.state==="closed")audio=new(window.AudioContext||window.webkitAudioContext)();
    if(audio.state==="suspended")audio.resume().catch(()=>{});
    initExternalAudio();
    if(!critSampleBuffer&&!critSampleLoading&&window.RO_CRIT_WAV_BASE64){
      critSampleLoading=true;
      const binary=atob(window.RO_CRIT_WAV_BASE64);
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      audio.decodeAudioData(bytes.buffer.slice(0)).then(buffer=>{
        critSampleBuffer=buffer;
      }).catch(()=>{}).finally(()=>{
        critSampleLoading=false;
      });
    }
  }
  function ensureAudioReady(){
    if(muted)return false;
    try{
      if(!audio||audio.state==="closed")initAudio();
      if(!audio)return false;
      if(audio.state==="suspended")audio.resume().catch(()=>{});
      return audio.state!=="closed";
    }catch{
      return false;
    }
  }
  async function reloadAudioEngine(){
    try{
      if(audio&&audio.state!=="closed"){
        try{await audio.close();}catch(_error){}
      }
      audio=null;
      critSampleBuffer=null;
      critSampleLoading=false;
      resetExternalAudioState();
      initAudio();
      if(audio&&audio.state==="suspended"){
        try{await audio.resume();}catch(_error){}
      }
      text(player.x||0,(player.y||0)-54,"音效已重新載入","#9eeaff",18,"pickup");
      return true;
    }catch(_error){
      text(player.x||0,(player.y||0)-54,"音效重新載入失敗","#ff9aa8",18,"pickup");
      return false;
    }
  }
  function countAudioDebug(kind){
    audioDebugCurrent.total++;
    if(audioDebugCurrent[kind]!==undefined)audioDebugCurrent[kind]++;
  }
  function countAudioSubtype(kind){
    if(audioDebugCurrent[kind]!==undefined)audioDebugCurrent[kind]++;
  }
  function countPerfWork(kind,amount=1){
    if(perfWorkCurrent[kind]!==undefined)perfWorkCurrent[kind]+=amount;
  }
  function audioMonitorRows(){
    const labelMap={
      crit:"爆擊音",
      xp:"吸經驗音",
      external:"外部音檔",
      beep:"系統提示音",
      ui:"介面提示",
      pickup:"拾取/獎勵",
      smallCarrot:"小蘿蔔",
      giantLaunch:"巨蘿蔔發射",
      giantExplosion:"巨蘿蔔爆炸",
      externalFail:"外部失敗"
    };
    return Object.entries(audioDebugLast)
      .filter(([key])=>key!=="total")
      .map(([key,count])=>({
        label:labelMap[key]||key,
        value:count,
        color:debugColor(count,key==="xp"?8:4,key==="xp"?16:10)
      }))
      .sort((a,b)=>(b.value-a.value)||a.label.localeCompare(b.label,"zh-Hant"));
  }
  function perfMonitorRows(){
    const labelMap={
      targetSearch:"索敵判定",
      gridRebuild:"格網重建",
      gridCells:"格網格數累計",
      gridEntries:"格網填入累計",
      nearQuery:"附近查詢",
      collisionShot:"子彈碰撞",
      collisionArea:"範圍碰撞",
      collisionOrbit:"旋風碰撞",
      collisionEnemyShot:"敵彈碰撞",
      collisionCrater:"地坑碰撞",
      collisionChest:"寶箱碰撞",
      collisionBanana:"香蕉碰撞",
      enemyMove:"怪物移動",
      gemUpdate:"經驗球更新",
      spawn:"補怪批次",
      groundDraw:"地板繪製",
      enemyDraw:"敵人繪製",
      projectileDraw:"射彈繪製",
      effectDraw:"特效繪製",
      textDraw:"文字繪製"
    };
    const rowOrder=[
      "collisionShot","collisionArea","collisionOrbit","collisionEnemyShot","collisionCrater","collisionChest","collisionBanana",
      "targetSearch","gridRebuild","gridCells","gridEntries","nearQuery",
      "enemyMove","gemUpdate","spawn","groundDraw","enemyDraw","projectileDraw","effectDraw","textDraw"
    ];
    return rowOrder
      .filter(key=>Object.prototype.hasOwnProperty.call(perfWorkLast,key))
      .map(key=>[key,perfWorkLast[key]])
      .map(([key,count])=>({
        label:labelMap[key]||key,
        value:count,
        color:debugColor(count,
          key==="groundDraw"?180:
          key==="enemyDraw"?200:
          key==="projectileDraw"?140:
          key==="collisionShot"?160:
          key==="collisionArea"?140:
          key==="collisionOrbit"?120:
          key==="collisionEnemyShot"?90:
          key==="collisionCrater"?80:
          key==="collisionChest"?40:
          key==="collisionBanana"?80:
          key==="gemUpdate"?120:90,
          key==="groundDraw"?320:
          key==="enemyDraw"?360:
          key==="projectileDraw"?260:
          key==="collisionShot"?320:
          key==="collisionArea"?260:
          key==="collisionOrbit"?220:
          key==="collisionEnemyShot"?180:
          key==="collisionCrater"?160:
          key==="collisionChest"?120:
          key==="collisionBanana"?180:
          key==="gemUpdate"?240:180)
      }));
  }
  function beep(f,d=.06,v=.025,type="square"){if(!ensureAudioReady())return;const finalVolume=Math.max(0,v*synthVolume());if(finalVolume<=0)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(finalVolume,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(audio.destination);o.start();o.stop(t+d);countAudioDebug("beep");}
  function playUiClick(){
    beep(520,.055,.018,"triangle");
    countAudioSubtype("ui");
  }
  function playSmallCarrotSound(){
    if(playExternalAudio("smallCarrot",.42,1))return;
    if(!ensureAudioReady())return;
    const sv=synthVolume();
    if(sv<=0)return;
    countAudioDebug("smallCarrot");
    const t=audio.currentTime;
    const osc=audio.createOscillator();
    const gain=audio.createGain();
    const filter=audio.createBiquadFilter();
    osc.type="triangle";
    osc.frequency.setValueAtTime(420,t);
    osc.frequency.linearRampToValueAtTime(900,t+.025);
    filter.type="bandpass";
    filter.frequency.setValueAtTime(1450,t);
    filter.Q.setValueAtTime(1.1,t);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.045*sv,t+.004);
    gain.gain.exponentialRampToValueAtTime(.016*sv,t+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,t+.03);
    osc.connect(filter).connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t+.05);
  }
  function playGiantLaunchSound(){
    if(playExternalAudio("giantLaunch",.56,1))return;
    if(!ensureAudioReady())return;
    const sv=synthVolume();
    if(sv<=0)return;
    countAudioDebug("giantLaunch");
    const t=audio.currentTime;
    const osc=audio.createOscillator();
    const gain=audio.createGain();
    osc.type="sawtooth";
    osc.frequency.setValueAtTime(170,t);
    osc.frequency.exponentialRampToValueAtTime(110,t+.08);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.06*sv,t+.006);
    gain.gain.exponentialRampToValueAtTime(.0001,t+.11);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t+.13);
  }
  function playCritSample(volume=1,rate=1){
    if(!ensureAudioReady())return;
    const now=performance.now();
    if(now-critSoundLastTime<70)return;
    const critVolume=Math.max(.25,Math.min(.85,volume*.9));
    const keys=["crit","crit2","crit3"];
    const start=Math.floor(Math.random()*keys.length);
    for(let i=0;i<keys.length;i++){
      if(playExternalAudio(keys[(start+i)%keys.length],critVolume,rate)){
        critSoundLastTime=now;
        return;
      }
    }
    return;
  }
  function playXpPickupSound({waveform="sine",baseFreq=2169,duration=.2,overtone=.05,rippleCount=1}={}){
    if(!ensureAudioReady())return;
    const sv=synthVolume();
    if(sv<=0)return;
    const now=performance.now();
    if(now-xpSoundLastTime<45)return;
    xpSoundLastTime=now;
    const t=audio.currentTime;
    const d=Math.max(.04,duration);
    const gain=audio.createGain();
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.01*sv,t+.01);
    gain.gain.exponentialRampToValueAtTime(.0001,t+d);
    gain.connect(audio.destination);

    const main=audio.createOscillator();
    main.type=waveform;
    main.frequency.setValueAtTime(baseFreq,t);
    for(let i=0;i<Math.max(1,rippleCount);i++){
      const pct=(i+1)/(Math.max(1,rippleCount)+1);
      main.frequency.exponentialRampToValueAtTime(baseFreq*(1+.035*pct),t+d*pct);
    }
    main.connect(gain);
    main.start(t);
    main.stop(t+d+.02);

    if(overtone>0){
      const high=audio.createOscillator();
      const highGain=audio.createGain();
      high.type="triangle";
      high.frequency.setValueAtTime(baseFreq*2.02,t);
      highGain.gain.setValueAtTime(.0001,t);
      highGain.gain.exponentialRampToValueAtTime(overtone*.01*sv,t+.008);
      highGain.gain.exponentialRampToValueAtTime(.0001,t+d*.7);
      high.connect(highGain).connect(audio.destination);
      high.start(t);
      high.stop(t+d*.72);
    }
    countAudioDebug("xp");
  }
  function playGiantExplosionSound({startFreq=80,duration=.14,noiseGain=.18,rippleSpeed=12,jitterDepth=10}={}){
    if(playExternalAudio("giantExplosion",.72,1))return;
    if(!ensureAudioReady())return;
    const sv=synthVolume();
    if(sv<=0)return;
    countAudioDebug("giantExplosion");
    const t=audio.currentTime;
    const d=Math.max(.08,duration);

    const osc=audio.createOscillator();
    const oscGain=audio.createGain();
    osc.type="sawtooth";
    osc.frequency.setValueAtTime(startFreq,t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40,startFreq*.42),t+d);
    const steps=Math.max(3,Math.floor(d*rippleSpeed));
    for(let i=1;i<=steps;i++){
      const at=t+d*(i/steps);
      const wobble=Math.max(40,startFreq*.42 + Math.sin(i*1.7)*jitterDepth);
      osc.frequency.linearRampToValueAtTime(wobble,at);
    }
    oscGain.gain.setValueAtTime(.0001,t);
    oscGain.gain.exponentialRampToValueAtTime(.085*sv,t+.01);
    oscGain.gain.exponentialRampToValueAtTime(.0001,t+d);
    osc.connect(oscGain).connect(audio.destination);
    osc.start(t);
    osc.stop(t+d+.03);

    const buffer=audio.createBuffer(1,Math.max(1,Math.floor(audio.sampleRate*d)),audio.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const noise=audio.createBufferSource();
    const filter=audio.createBiquadFilter();
    const noiseAmp=audio.createGain();
    noise.buffer=buffer;
    filter.type="bandpass";
    filter.frequency.setValueAtTime(Math.max(80,startFreq*4.2),t);
    filter.Q.setValueAtTime(1.2,t);
    noiseAmp.gain.setValueAtTime(.0001,t);
    noiseAmp.gain.exponentialRampToValueAtTime(Math.max(.0001,noiseGain*.06*sv),t+.01);
    noiseAmp.gain.exponentialRampToValueAtTime(.0001,t+d*.95);
    noise.connect(filter).connect(noiseAmp).connect(audio.destination);
    noise.start(t);
    noise.stop(t+d);
  }
  function playSweep(fromFreq,toFreq,durationMs,volume=.028,type="triangle"){
    if(!ensureAudioReady())return;
    const sv=synthVolume();
    if(sv<=0)return;
    const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime,d=Math.max(.05,durationMs/1000);
    o.type=type;
    o.frequency.setValueAtTime(Math.max(40,fromFreq),t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40,toFreq),t+d);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(volume*sv,t+.025);
    g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.72*sv),t+d*.72);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t+d+.02);
  }
  function gemStackLabel(count){
    if(count>=60)return "+60";
    if(count>=50)return "+50";
    if(count>=40)return "+40";
    if(count>=30)return "+30";
    if(count>=25)return "+25";
    if(count>=20)return "+20";
    if(count>=15)return "+15";
    if(count>=10)return "+10";
    if(count>=5)return "+5";
    if(count>=3)return "+3";
    return "+1";
  }
  function circleHitXY(ax,ay,ar,bx,by,br){
    const dx=ax-bx,dy=ay-by,r=ar+br;
    return dx*dx+dy*dy<=r*r;
  }
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function outsideNineGrid(x,y,padding=0){
    return Math.abs(x-player.x)>W*1.5+padding||Math.abs(y-player.y)>H*1.5+padding;
  }
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
  function cameraPosition(){return{x:Math.round(player.x),y:Math.round(player.y)};}
  function worldToScreen(x,y){
    const camera=cameraPosition();
    return{x:Math.round(x-camera.x+W/2),y:Math.round(y-camera.y+H/2)};
  }

  function resizeTransitionCanvas(){
    transitionCanvas.width=W;
    transitionCanvas.height=H;
    transitionCtx.clearRect(0,0,W,H);
    transitionMask.style.background="radial-gradient(circle at 50% 50%, transparent 0, transparent 120vmax, #000 120vmax, #000 100%)";
    transitionMask.style.opacity="0";
  }

  function playSceneTransition(onMidpoint,{shrinkDuration=420,holdDuration=180,expandDuration=480}={}){
    if(transitioning)return;
    transitioning=true;
    initAudio();
    const maxRadius=Math.hypot(W/2,H/2);
    const totalDuration=shrinkDuration+holdDuration+expandDuration;
    let startTime=0,midpointDone=false,openSweepPlayed=false;

    playSweep(960,180,shrinkDuration,.03,"triangle");

    function drawFrame(radius){
      transitionCtx.clearRect(0,0,W,H);
      const safeRadius=Math.max(0,Math.round(radius));
      const edge=safeRadius;
      transitionMask.style.opacity="1";
      transitionMask.style.background=`radial-gradient(circle at 50% 50%, transparent 0, transparent ${edge}px, #000 ${safeRadius}px, #000 100%)`;
    }

    function animate(timestamp){
      if(!startTime)startTime=timestamp;
      const elapsed=timestamp-startTime;

      if(elapsed<shrinkDuration){
        const p=elapsed/shrinkDuration;
        const eased=1-Math.pow(1-p,5);
        drawFrame(maxRadius*(1-eased));
        requestAnimationFrame(animate);
        return;
      }

      if(!midpointDone){
        drawFrame(0);
        midpointDone=true;
        onMidpoint?.();
      }

      if(elapsed<shrinkDuration+holdDuration){
        drawFrame(0);
        requestAnimationFrame(animate);
        return;
      }

      if(elapsed<totalDuration){
        if(!openSweepPlayed){
          openSweepPlayed=true;
          playSweep(180,880,expandDuration,.026,"triangle");
        }
        const p=(elapsed-shrinkDuration-holdDuration)/expandDuration;
        const eased=p<.5?16*Math.pow(p,5):1-Math.pow(-2*p+2,5)/2;
        drawFrame(maxRadius*eased);
        requestAnimationFrame(animate);
        return;
      }

      transitionCtx.clearRect(0,0,W,H);
      transitionMask.style.opacity="0";
      transitionMask.style.background="radial-gradient(circle at 50% 50%, transparent 0, transparent 120vmax, #000 120vmax, #000 100%)";
      transitioning=false;
      if(running&&!ended)battleStartDelay=BATTLE_START_DELAY;
    }

    requestAnimationFrame(animate);
  }

  function reset(){
    const maxHp=BASE_META_LIFE+scaledMetaGain(meta.life,META_LIFE_STEP,META_LIFE_TIER_GROWTH);
    const baseCrit=metaCritChance(meta.crit);
    Object.assign(player,{
      x:0,y:0,r:18,speed:210,hp:maxHp,maxHp,regen:0,regenFlat:metaRegenFlatTotal(meta.regen),regenBoost:1,
      level:1,xp:0,nextXp:xpRequirement(1,0),damage:BASE_META_DAMAGE+scaledMetaGain(meta.damage,META_DAMAGE_STEP,META_DAMAGE_TIER_GROWTH),
      attackSpeed:1+meta.speed*.03,projectiles:1,
      crit:baseCrit,critStack:baseCrit,critDamage:baseMetaCritDamageMultiplier(meta.critDamage),
      pierce:0,magnet:FIXED_MAGNET_RANGE,area:1,areaDamage:1,invuln:0,
      armorPen:Math.min(MAX_META_ARMOR_PEN,meta.armorPen*.007),facing:1
    });
    skills.orbit=skills.burst=skills.peanut=skills.pinky=skills.brain=0;
    updatePlayer.pet=updatePlayer.burst=updatePlayer.pinky=0;
    for(const id of Object.keys(upgradeLevels))upgradeLevels[id]=0;
    enemies=[];shots=[];enemyShots=[];gems=[];effects=[];texts=[];areas=[];petShots=[];bananas=[];chests=[];pickups=[];
    announcements=[];activeAnnouncement=null;
    kills=score=eliteKills=bossKills=eligibleKills=instantKills=0;instantKillTimer=0;time=spawnClock=shotClock=0;battleStartDelay=0;nextId=1;levelQueue=0;
    kps=kpsWindowKills=kpsWindowTime=kpsPressure=0;
    giantCarrotCooldown=0;
    sharedTargetCache=null;sharedTargetTimer=0;
    chestClock=10;chestTravel=0;lastChestX=player.x;lastChestY=player.y;magnetAll=false;magnetTimer=0;carrotVolley=0;pinkyBoostTimer=0;pinkyDamageBoost=1;pendingCarrotShots=0;runCoins=0;runCoinsSettled=false;
    encirclementPressure=0;encirclementCharge=0;encirclementSampleClock=0;encirclementPressureRounds=0;
    encirclementReservedHp=0;encirclementSectorBits=0;encirclementSectorCount=0;encirclementPrewarn=false;encirclementDebts=[];
    infiniteClearCount=0;
    poisonTimer=poisonRate=stunTimer=0;
    potionHealTimer=0;
    running=true;paused=false;ended=false;runRewarded=false;escalationStart=null;killSurgeActive=false;
    finalPhase="none";finalTimer=0;bossArena.active=false;bossArena.zone=effectiveZone();bossArena.r=currentStage>=2||isInfiniteMode()?470:430;bossArena.x=player.x;bossArena.y=player.y;
    keys.up=keys.down=keys.left=keys.right=false;
    resetStick();
  }

  function start(){
    initAudio();reset();
    intro.classList.add("hidden");endScreen.classList.add("hidden");levelScreen.classList.add("hidden");pauseScreen.classList.add("hidden");
    pauseBtn.classList.add("visible");
    positionMonitorTabs();
    updateMonitorButtons();
    last=performance.now();
  }

  function finalBossPhaseConfig(type){
    if(type==="stoneface"){
      return {
        hp:[120000,120000,180000],
        defense:[45,58,72]
      };
    }
    if(type==="whale"){
      return {
        hp:[120000,120000,186000],
        defense:[70,86,104]
      };
    }
    if(type==="reaper"){
      return {
        hp:[98000,98000,156000],
        defense:[60,76,92]
      };
    }
    return {
      hp:[70000,70000,110000],
      defense:[15,22,34]
    };
  }

  function applyFinalBossPhase(enemy,phaseIndex){
    if(!enemy.finalPhaseHp||!enemy.finalPhaseHp.length)return;
    const index=clamp(phaseIndex,0,enemy.finalPhaseHp.length-1);
    enemy.phaseIndex=index;
    enemy.maxHp=enemy.finalPhaseHp[index];
    enemy.hp=enemy.maxHp;
    enemy.defense=enemy.finalPhaseDefense[index]||enemy.defense||0;
  }

  function spawnEnemy(type,kind="normal",flags={}){
    const angle=Math.random()*Math.PI*2,range=rand(530,700);
    const base=enemyData[type],scale=1+time/600*.9,growth=infiniteGrowth();
    let hp=base.hp*scale,size=base.r,speed=base.speed*(1+time/1200),damage=base.damage*scale,xp=base.xp;
    if(isInfiniteMode()){hp*=growth.hp;damage*=growth.damage;speed*=growth.speed;xp*=1+infiniteZoneAt()*.18;}
    if(kind==="elite"){hp*=7;size*=1.45;speed*=1.08;damage*=1.8;xp*=8;}
    if(kind==="boss"){hp*=35;size*=2.25;speed*=.82;damage*=2.8;xp*=35;}
    let defense=base.defense||0;
    const zone=effectiveZone();
    if(zone>=1&&defense===0)defense=5;
    if(kind==="elite")defense+=zone>=1?10:0;
    if(kind==="boss")defense+=zone>=1?18:6;
    if(kind==="final"){
      if(isInfiniteMode()){
        const bossZone=Math.max(0,infiniteBossZone);
        const bossHpMult=infiniteBossHpMultiplier(bossZone);
        const bossDamageMult=1+bossZone*.18;
        if(type==="whale"){hp=120000*bossHpMult;size=72;speed=24;damage=52*bossDamageMult;xp=420;defense=70+bossZone*4;}
        else if(type==="reaper"){hp=98000*bossHpMult;size=68;speed=36;damage=42*bossDamageMult;xp=520;defense=60+bossZone*5;}
        else if(type==="stoneface"){hp=120000*bossHpMult;size=64;speed=30;damage=30*bossDamageMult;xp=340;defense=45+bossZone*4;}
        else{hp=70000*bossHpMult;size=62;speed=52;damage=32*bossDamageMult;xp=280;defense=15+bossZone*3;}
      }else if(currentStage===3){hp=120000;size=72;speed=24;damage=52;xp=420;defense=70;}
      else if(currentStage===2){hp=120000;size=64;speed=30;damage=30;xp=300;defense=45;}
      else{hp=70000;size=62;speed=52;damage=32;xp=250;defense=15;}
    }
    if(kind==="normal"&&kpsPressure>0)hp*=1+kpsPressure*.35;
    if(kind==="elite"&&kpsPressure>0)hp*=1+kpsPressure*.18;
    if(killSurgeActive)hp*=KILL_SURGE_HP_MULTIPLIER;
    const enemy={id:nextId++,type,kind,defense,x:player.x+Math.cos(angle)*range,y:player.y+Math.sin(angle)*range,r:size,hp,maxHp:hp,speed,damage,xp,hit:0,attack:rand(0,1),shoot:rand(.8,2.2),slow:0,phase:0,cling:0,bars:kind==="final"?3:1,totalBars:kind==="final"?3:1,kpsSpawned:!!flags.kpsSpawned,spawnAt:time,lastHitAt:time,burnTime:0,burnDps:0,cullTimer:0};
    if(kind==="final"){
      const phaseConfig=finalBossPhaseConfig(type);
      const hpScale=isInfiniteMode()?infiniteBossHpMultiplier(Math.max(0,infiniteBossZone)):1;
      const defenseScale=isInfiniteMode()?Math.max(0,infiniteBossZone)*4:0;
      enemy.finalPhaseHp=phaseConfig.hp.map(value=>Math.round(value*hpScale));
      enemy.finalPhaseDefense=phaseConfig.defense.map(value=>value+defenseScale);
      applyFinalBossPhase(enemy,0);
    }
    enemies.push(enemy);
  }

  function enemyPoolForCurrentTime(){
    if(!isInfiniteMode()){
      if(currentStage===3){
        return time<60?["penguin","seal"]:time<240?["penguin","seal","snowman"]:["penguin","seal","snowman","polarbear"];
      }
      return currentStage===2
        ?(time<60?["snake","mouse"]:time<240?["snake","mouse","vulture"]:["snake","mouse","vulture","centipede","scorpion"])
        :(time<60?["turtle","mushroom"]:time<240?["turtle","mushroom","bombcloud"]:["turtle","mushroom","bombcloud","plant"]);
    }
    const zone=infiniteZoneAt();
    if(zone===0)return time%600<60?["turtle","mushroom"]:["turtle","mushroom","bombcloud","plant"];
    if(zone===1)return ["snake","mouse","vulture","centipede","scorpion"];
    if(zone===2)return ["penguin","seal","snowman","polarbear"];
    return ["skeleton","wisp","bat","eyeball","imp"];
  }

  function bossTypeForZone(zone){
    if(zone===0)return "plant";
    if(zone===1)return "stoneface";
    if(zone===2)return "whale";
    return "reaper";
  }

  function infiniteBossHpMultiplier(zone){
    if(zone<=0)return 3;
    if(zone===1)return 4;
    if(zone===2)return 5;
    if(zone===3)return 6;
    return 6.5+(zone-4)*0.5;
  }

  function spawnWave(count,kind="normal"){
    const types=enemyPoolForCurrentTime();
    const finalCount=Math.ceil(count*(killSurgeActive?KILL_SURGE_WAVE_MULTIPLIER:1));
    for(let i=0;i<finalCount;i++)spawnEnemy(types[Math.floor(Math.random()*types.length)],kind);
    announce(
      kind==="elite"?"菁英怪來襲！":kind==="boss"?"BOSS 出現！":"怪潮來襲！",
      kind==="elite"?"強大的敵人氣息正在接近":kind==="boss"?"準備迎戰巨大敵人":"敵人數量大幅增加",
      kind==="normal"?"#ffe45f":"#ff826b"
    );
    beep(kind==="normal"?180:120,.35,.045,"sawtooth");
  }

  function timeline(){
    const sec=Math.floor(time);
    if(isInfiniteMode()){
      if(sec>0&&sec%600===0&&!timeline.seen.has("infinite-boss-"+sec)){
        timeline.seen.add("infinite-boss-"+sec);
        infiniteBossZone=Math.max(0,Math.floor(sec/600)-1);
        beginFinalBossEntrance();
        announce(`${infiniteZoneName(infiniteBossZone)}擂台開啟！`,"擊敗三條血 BOSS 後進入下一輪","#ffdb6c",4);
        return;
      }
      if(finalPhase==="none"){
        if(sec>0&&sec%60===0&&!timeline.seen.has("infinite-wave"+sec)){timeline.seen.add("infinite-wave"+sec);spawnWave(16+Math.floor(sec/45));}
        if(sec>0&&sec%150===0&&!timeline.seen.has("infinite-elite"+sec)){timeline.seen.add("infinite-elite"+sec);spawnWave(2+Math.floor(sec/900),"elite");}
        if(sec>0&&sec%300===0&&!timeline.seen.has("infinite-midboss"+sec)){timeline.seen.add("infinite-midboss"+sec);spawnEnemy(enemyPoolForCurrentTime()[0],"boss");announce("輪迴強敵出現！","下一個擂台正在逼近","#ff8a5c");}
      }
      return;
    }
    const escalationReady=eligibleKills>=200||sec>=480;
    if(escalationReady&&escalationStart===null){
      escalationStart=time;
      announce("終盤怪潮啟動！",eligibleKills>=200?"有效擊殺 200 隻，敵軍全面進攻":"第 8 分鐘，敵軍全面進攻","#ffb35c",4);
    }

    if(escalationStart===null){
      if(sec>0&&sec%60===0&&!timeline.seen.has("early-wave"+sec)){timeline.seen.add("early-wave"+sec);spawnWave(12+sec/10);}
      if([120,270,420].includes(sec)&&!timeline.seen.has("early-elite"+sec)){timeline.seen.add("early-elite"+sec);spawnWave(2,"elite");}
      if([180,360].includes(sec)&&!timeline.seen.has("early-boss"+sec)){
        timeline.seen.add("early-boss"+sec);
        spawnEnemy(currentStage===3?(sec===360?"polarbear":"snowman"):currentStage===2?(sec===360?"scorpion":"centipede"):(sec===360?"bombcloud":"plant"),"boss");
        announce("BOSS 出現！",currentStage===3?"雪原強敵正在逼近":currentStage===2?"沙漠強敵正在逼近":"強敵已進入菜園","#ff775e");
      }
    }else if(sec<DURATION){
      const elapsed=Math.floor(time-escalationStart);
      const waveSlot=Math.floor(elapsed/30);
      const eliteSlot=Math.floor(elapsed/60);
      const bossSlot=Math.floor(elapsed/120);
      if(waveSlot>0&&!timeline.seen.has("rush-wave"+waveSlot)){timeline.seen.add("rush-wave"+waveSlot);spawnWave(20+Math.floor(time/30));}
      if(eliteSlot>0&&!timeline.seen.has("rush-elite"+eliteSlot)){timeline.seen.add("rush-elite"+eliteSlot);spawnWave(2+Math.floor(time/240),"elite");}
      if(bossSlot>0&&!timeline.seen.has("rush-boss"+bossSlot)){
        timeline.seen.add("rush-boss"+bossSlot);
        spawnEnemy(currentStage===3?(bossSlot%2?"polarbear":"snowman"):currentStage===2?(bossSlot%2?"scorpion":"vulture"):(bossSlot%2?"plant":"bombcloud"),"boss");
        announce("終盤 BOSS 出現！","高威脅敵人加入戰場","#ff775e");
      }
    }

    if(sec>=DURATION&&!timeline.seen.has("final")){
      timeline.seen.add("final");
      beginFinalBossEntrance();
    }
  }
  timeline.seen=new Set();

  function beginFinalBossEntrance(){
    finalPhase="warning";
    finalTimer=4.2;
    if(isInfiniteMode())infiniteDisplayFreezeStart=(Math.floor(time/600)+1)*600;
    bossArena.active=true;
    bossArena.zone=isInfiniteMode()?infiniteBossZone:effectiveZone();
    bossArena.x=player.x;
    bossArena.y=player.y;
    enemies=[];gems=[];shots=[];petShots=[];bananas=[];enemyShots=[];areas=[];
    effects=effects.filter(e=>e.kind==="flash");
    announcements=[];activeAnnouncement=null;
    effects.push({kind:"flash",life:.28});
    beep(72,1,.075,"sawtooth");
  }

  function spawnFinalBoss(){
    spawnEnemy(isInfiniteMode()?bossTypeForZone(infiniteBossZone):(currentStage===3?"whale":currentStage===2?"stoneface":"plant"),"final");
    const boss=enemies[enemies.length-1];
    boss.x=bossArena.x+Math.min(210,bossArena.r*.58);
    boss.y=bossArena.y;
    finalPhase="fight";
    const bossName=boss.type==="whale"?"暴雪鯨魚！":boss.type==="reaper"?"惡魔死神！":boss.type==="stoneface"?"遠古石面怪！":"霸王食人花！";
    text(boss.x,boss.y-boss.r-24,bossName,"#ff4f68",28);
    effects.push({kind:"shockwave",x:boss.x,y:boss.y,r:20,max:190,life:.75});
    beep(80,.8,.06,"sawtooth");
  }

  function inTargetView(target){
    const p=worldToScreen(target.x,target.y);
    const radius=target.r||0;
    return p.x>=-radius&&p.x<=W+radius&&p.y>=-radius&&p.y<=H+radius;
  }
  function getReservedDamage(target){
    return !target||"opened" in target?0:Math.max(0,target.reservedDamage||0);
  }
  function clearReservedDamage(target){
    if(target&&!("opened" in target))target.reservedDamage=0;
  }
  function reserveDamageForTarget(target,amount){
    if(!target||"opened" in target||!(amount>0))return;
    target.reservedDamage=(target.reservedDamage||0)+amount;
  }
  function releaseDamageReservation(target,amount){
    if(!target||"opened" in target||!(amount>0))return;
    target.reservedDamage=Math.max(0,(target.reservedDamage||0)-amount);
  }
  function getEnemyById(id){
    if(!id)return null;
    for(const e of enemies)if(e.id===id)return e;
    return null;
  }
  function releaseShotReservation(shot){
    if(!shot||!shot.reservedTargetId||!shot.reservedDamage)return;
    releaseDamageReservation(getEnemyById(shot.reservedTargetId),shot.reservedDamage);
    shot.reservedTargetId=0;
    shot.reservedDamage=0;
  }
  function predictedShotDamage(baseDamage){
    return baseDamage*Math.max(1,1+player.critStack*(player.critDamage-1));
  }

  function nearest(x,y,exclude=new Set()){
    countPerfWork("targetSearch");
    let best=null,bd=Infinity;
    for(const e of enemies){countPerfWork("targetSearch");if(e.hp<=0||exclude.has(e.id)||!inTargetView(e))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e;}}
    for(const chest of chests){
      countPerfWork("targetSearch");
      if(chest.opened||exclude.has(chest.id)||!inTargetView(chest))continue;
      const d=(chest.x-x)**2+(chest.y-y)**2;
      if(d<bd){bd=d;best=chest;}
    }
    return best;
  }
  function targetInvalid(target){
    if(!target)return true;
    if("opened" in target)return target.opened||!inTargetView(target);
    return target.dead||target.hp<=0||!inTargetView(target);
  }
  function getOnlyBoss(){
    return finalPhase==="fight"&&enemies.length===1&&enemies[0]&&enemies[0].kind==="final"&&!enemies[0].dead&&enemies[0].hp>0?enemies[0]:null;
  }
  function getSharedTarget(force=false){
    if(force||sharedTargetTimer<=0||targetInvalid(sharedTargetCache)){
      sharedTargetCache=nearest(player.x,player.y);
      sharedTargetTimer=.12;
    }
    return sharedTargetCache;
  }
  function pickReservedAwareTarget(baseDamage){
    const estimate=predictedShotDamage(baseDamage);
    let bestEnemy=null,bd=Infinity;
    countPerfWork("targetSearch");
    for(const e of enemies){
      countPerfWork("targetSearch");
      if(e.dead||e.hp<=0||!inTargetView(e))continue;
      const effectiveHp=e.hp-getReservedDamage(e);
      if(effectiveHp<=0)continue;
      const d=(e.x-player.x)**2+(e.y-player.y)**2;
      if(d<bd){bd=d;bestEnemy=e;}
    }
    if(bestEnemy){
      reserveDamageForTarget(bestEnemy,estimate);
      return {target:bestEnemy,reservedAmount:estimate};
    }
    const fallback=nearest(player.x,player.y);
    if(fallback&&!("opened" in fallback)){
      reserveDamageForTarget(fallback,estimate);
      return {target:fallback,reservedAmount:estimate};
    }
    return {target:fallback,reservedAmount:0};
  }

  function beginCarrotVolley(){
    if(!enemies.length&&!chests.some(c=>!c.opened))return false;
    pendingCarrotShots=Math.max(1,player.projectiles);
    carrotVolley++;
    if(player.projectiles>=6&&giantCarrotCooldown<=0){
      const target=getSharedTarget();
      if(target){
        const a=Math.atan2(target.y-player.y,target.x-player.x);
        shots.push({
          kind:"giant",x:player.x,y:player.y,vx:Math.cos(a)*330,vy:Math.sin(a)*330,
          r:18*player.area,life:2.2,damage:player.damage*12.8*player.areaDamage,pierce:0,angle:a
        });
        giantCarrotCooldown=3;
      }
    }
    return true;
  }

  function fireCarrotShot(){
    const targetInfo=pickReservedAwareTarget(player.damage*player.areaDamage);
    const target=targetInfo.target;
    const volleyCount=Math.max(1,Math.min(6,player.projectiles));
    const volleyIndex=Math.max(0,Math.min(volleyCount-1,volleyCount-pendingCarrotShots));
    const spreadStep=volleyCount<=1?0:0.095;
    const spreadOffset=volleyCount<=1?0:(volleyIndex-(volleyCount-1)/2)*spreadStep;
    let angle;
    if(target)angle=Math.atan2(target.y-player.y,target.x-player.x)+spreadOffset+rand(-.01,.01);
    else angle=(player.facing<0?Math.PI:0)+spreadOffset+rand(-.01,.01);
    shots.push({
      x:player.x,y:player.y,
      vx:Math.cos(angle)*520,vy:Math.sin(angle)*520,
      r:6,life:1.8,
      damage:player.damage*player.areaDamage,pierce:player.pierce,angle,
      reservedTargetId:target&&!("opened" in target)?target.id:0,
      reservedDamage:targetInfo.reservedAmount||0
    });
  }

  function firePet(){
    const target=getSharedTarget();if(!target)return;
    const a=Math.atan2(target.y-player.y,target.x-player.x);
    const evolved=skills.peanut>=5;
    petShots.push({
      kind:evolved?"rolling":"stone",x:player.x-28,y:player.y+22,
      vx:Math.cos(a)*(evolved?300:390),vy:Math.sin(a)*(evolved?300:390),
      r:(evolved?15:6)*player.area,life:evolved?3.4:2,damage:(evolved?58:9+skills.peanut*8)*player.areaDamage,
      hit:new Set(),debris:0
    });
  }

  function fireBanana(){
    const level=skills.pinky;
    const target=getSharedTarget();
    const angle=target?Math.atan2(target.y-player.y,target.x-player.x):(player.facing<0?Math.PI:0);
    const startX=player.x+Math.cos(angle)*30,startY=player.y+Math.sin(angle)*30;
    const speed=310+level*24,range=(170+level*18)*player.area;
    bananas.push({
      x:startX,y:startY,launchX:startX,launchY:startY,
      vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      traveled:0,range,phase:"out",
      r:8*(level>=5?1.35:1)*player.area,damage:(12+level*9)*player.areaDamage,
      hit:new Set(),spin:0,missedLife:.45
    });
  }

  function catchBanana(banana){
    banana.dead=true;
    burst(player.x,player.y,"#ffe45f",8);
    pinkyBoostTimer=3;
    pinkyDamageBoost=skills.pinky>=5?1.2:1.1;
    for(let i=0;i<7;i++)effects.push({kind:"pinkyLine",x:player.x+rand(-16,16),y:player.y+28+rand(0,18),vx:0,vy:rand(-150,-105),life:.55,r:rand(2,4),color:"#ff9fc7"});
    if(skills.pinky>=5){
      const healed=player.maxHp*.08;
      player.hp=Math.min(player.maxHp,player.hp+healed);
      effects.push({kind:"shockwave",x:player.x,y:player.y,r:10,max:70*player.area,life:.5});
      for(let i=0;i<6;i++)effects.push({kind:"heart",x:player.x+rand(-28,28),y:player.y+rand(-5,28),vx:rand(-15,15),vy:rand(-85,-50),life:.8,r:rand(4,7),color:"#ff75ad"});
      text(player.x,player.y-48,`+${Math.round(healed)} HP・攻擊+20%・加速`,"#ff9fc7",17,"pickup");
      beep(880,.16,.035,"triangle");
    }else{
      text(player.x,player.y-42,"攻擊+10%・移速+15%","#ffb5d0",15,"pickup");
    }
  }

  function updateBananas(dt){
    for(const b of bananas){
      b.spin+=dt*12;
      const step=Math.hypot(b.vx,b.vy)*dt;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.phase==="out"){
        b.traveled+=step;
        if(b.traveled>=b.range){
          b.phase="return";b.vx*=-1;b.vy*=-1;b.hit.clear();
        }
      }else if(b.phase==="return"){
        if(dist(b,player)<b.r+player.r+5){catchBanana(b);continue;}
        if((b.x-b.launchX)*b.vx+(b.y-b.launchY)*b.vy>=0)b.phase="missed";
      }else{
        b.missedLife-=dt;
        if(b.missedLife<=0){
          b.dead=true;
          continue;
        }
        const p=worldToScreen(b.x,b.y),margin=b.r+24;
        if(p.x<-margin||p.x>W+margin||p.y<-margin||p.y>H+margin){
          b.dead=true;
          continue;
        }
      }
      const boss=getOnlyBoss();
      if(boss){
        countPerfWork("collisionBanana");
        if(!b.hit.has(boss.id)&&dist(b,boss)<=b.r+boss.r){
          b.hit.add(boss.id);
          damageEnemy(boss,b.damage,false,"banana");
        }
      }else{
        forEachEnemyNear(b.x,b.y,b.r+ENEMY_QUERY_PADDING,e=>{
          countPerfWork("collisionBanana");
          if(e.dead||b.hit.has(e.id)||!circleHitXY(b.x,b.y,b.r,e.x,e.y,e.r))return;
          b.hit.add(e.id);damageEnemy(e,b.damage,false,"banana");
        });
      }
    }
    bananas=bananas.filter(b=>!b.dead);
  }

  function damageEnemy(e,amount,critical=false,source="normal"){
    if(source!=="chestBomb"){
      amount*=pinkyBoostTimer>0?pinkyDamageBoost:1;
      const variance=rand(.01,.05)*(Math.random()<.5?-1:1);
      amount*=1+variance;
      if(critical)amount*=1+rand(.01,.10);
    }
    if(source!=="chestBomb"){
      const ignored=Math.min(.75,player.armorPen);
      const effectiveDefense=(e.defense||0)*(1-ignored);
      amount*=100/(100+effectiveDefense);
    }
    e.lastHitAt=time;
    e.hp-=amount;e.hit=.1;
    const silentDamage=source==="giantBurn";
    if(!silentDamage){
      const textKind=critical?"critical":(e.kind==="boss"||e.kind==="final"?"boss":"normal");
      text(e.x,e.y-e.r,critical?formatCriticalDamage(amount):Math.round(amount),critical?"#ffe45f":"#fff",critical?19:14,textKind);
      if(critical)playCritSample(.38,1+rand(-.04,.04));
    }
    if(e.kind==="final"&&e.hp<=0&&e.bars>1){
      e.bars--;
      applyFinalBossPhase(e,e.totalBars-e.bars);
      e.speed*=1.12;
      e.damage*=1.18;
      e.phase=0;
      burst(e.x,e.y,"#ff5269",32);
      effects.push({kind:"shockwave",x:e.x,y:e.y,r:20,max:180,life:.65});
      announce(`關卡 BOSS 剩餘 ${e.bars} 條血！`,"攻擊速度與威力提升","#ff5c72",4);
      beep(95,.55,.06,"sawtooth");
      return;
    }
    if(e.hp<=0){
      clearReservedDamage(e);
      killEnemy(e,source);
    }
  }

  function killEnemy(e,source="normal"){
    if(e.dead)return;e.dead=true;kills++;score+=e.kind==="normal"?10:e.kind==="elite"?150:500;
    if(source!=="chestBomb")kpsWindowKills++;
    if(source!=="chestBomb"){
      eligibleKills++;
      instantKills++;
      instantKillTimer=1.25;
    }
    if(!killSurgeActive&&eligibleKills>=KILL_SURGE_THRESHOLD){
      killSurgeActive=true;
      announce("500 有效擊殺：狂暴怪潮！","寶箱炸彈不計；往後怪潮 +75%・生命 +60%","#ff596f",5);
    }
    if(e.kind==="elite")eliteKills++;if(e.kind==="boss"||e.kind==="final")bossKills++;
    if(player.level<MAX_PLAYER_LEVEL){
      const count=e.kind==="normal"?1:e.kind==="elite"?5:e.kind==="boss"?12:25;
      for(let i=0;i<count;i++)gems.push({id:nextId++,x:e.x+rand(-e.r,e.r),y:e.y+rand(-e.r,e.r),value:e.xp/count,type:Math.floor(Math.random()*5),r:9,phase:Math.random()*6.28,spawnTime:time,stackCount:1});
    }
    burst(e.x,e.y,e.kind==="normal"?"#ffe174":"#ff6b68",e.kind==="normal"?5:18);
    if(source==="orbit"&&skills.orbit>=5){
      effects.push(
        {kind:"half",x:e.x-e.r*.25,y:e.y,vx:-90,vy:-70,life:.55,r:e.r,color:enemyData[e.type].color,side:-1},
        {kind:"half",x:e.x+e.r*.25,y:e.y,vx:90,vy:-70,life:.55,r:e.r,color:enemyData[e.type].color,side:1}
      );
      effects.push({kind:"slash",x:e.x,y:e.y,life:.22,r:e.r*1.8});
    }
    if(e.kind==="final"){
      if(isInfiniteMode())finishInfiniteBoss();
      else win();
    }
  }

  function finishInfiniteBoss(){
    if(isInfiniteMode())infiniteDisplayOffset+=Math.max(0,time-infiniteDisplayFreezeStart);
    if(isInfiniteMode())infiniteClearCount++;
    kps=0;
    kpsWindowKills=0;
    kpsWindowTime=0;
    kpsPressure=0;
    spawnClock=0;
    finalPhase="none";
    finalTimer=0;
    bossArena.active=false;
    enemyShots=[];areas=[];
    effects.push({kind:"flash",life:.2});
    const nextZone=infiniteZoneAt();
    announce("擂台突破！",`進入 ${infiniteZoneName(nextZone)} 輪迴，敵人繼續變強`,"#ffe16a",4);
    beep(660,.35,.045,"triangle");
  }

  function gainXp(v){
    if(player.level>=MAX_PLAYER_LEVEL){
      player.level=MAX_PLAYER_LEVEL;
      player.xp=0;
      return;
    }
    player.xp+=v*Math.max(1,player.xpGain||1);
    while(player.level<MAX_PLAYER_LEVEL&&player.xp>=player.nextXp){
      player.xp-=player.nextXp;
      player.level++;
      if(player.level>=MAX_PLAYER_LEVEL){
        player.level=MAX_PLAYER_LEVEL;
        player.xp=0;
        player.nextXp=1;
        break;
      }
      player.nextXp=xpRequirement(player.level,kills);
      levelQueue++;
    }
    if(player.level>=MAX_PLAYER_LEVEL){
      magnetAll=false;
      magnetTimer=0;
    }
    if(levelQueue&&!paused)showLevelUp();
  }

  function showLevelUp(){
    paused=true;levelScreen.classList.remove("hidden");choicesEl.innerHTML="";
    updateMonitorButtons();
    const pool=upgrades.filter(u=>{
      if(u.basic&&upgradeLevels[u.id]>=BASIC_UPGRADE_CAP)return false;
      if(u.cap&&upgradeLevels[u.id]>=u.cap)return false;
      return !u.valid||u.valid();
    }),picked=[];
    while(picked.length<4&&pool.length){const i=Math.floor(Math.random()*pool.length);picked.push(pool.splice(i,1)[0]);}
    for(const u of picked){
      const card=document.createElement("div");card.className="choice";
      let current="";
      let nextLevelLabel=u.name;
      let descText=u.desc;
      if(["orbit","burst","peanut","pinky","brain"].includes(u.id))current=`目前 LV${skills[u.id]}/5`;
      if(["orbit","burst","peanut","pinky","brain"].includes(u.id))nextLevelLabel=`${u.name} LV${Math.min(5,skills[u.id]+1)}`;
      else if(u.id==="multi"){current=`目前 ${player.projectiles}/6 支`;nextLevelLabel=`同步發射 LV${Math.min(5,upgradeLevels.multi+1)}`;}
      else if(u.cap){current=`目前 LV${upgradeLevels[u.id]}/${u.cap}`;nextLevelLabel=`${u.name} LV${Math.min(u.cap,upgradeLevels[u.id]+1)}`;}
      else if(u.basic){current=`目前 LV${upgradeLevels[u.id]}/${BASIC_UPGRADE_CAP}`;nextLevelLabel=`${u.name} LV${Math.min(BASIC_UPGRADE_CAP,upgradeLevels[u.id]+1)}`;}
      if(u.id==="brain"){
        const nextGain=Math.round(([40,60,80,100,120][skills.brain]||0));
        descText=`+${nextGain}% 經驗獲取`;
      }
      card.innerHTML=`<span class="icon">${u.icon}</span><b>${nextLevelLabel}</b><small>${descText}<br>${current}</small>`;
      card.onclick=()=>{
        u.apply();
        if(Object.hasOwn(upgradeLevels,u.id))upgradeLevels[u.id]++;
        levelQueue--;
        if(!gems.length){magnetAll=false;magnetTimer=0;}
        levelScreen.classList.add("hidden");
        paused=false;
        updateMonitorButtons();
        beep(660,.1,.04);
        if(levelQueue)setTimeout(showLevelUp,80);
      };
      choicesEl.appendChild(card);
    }
    if(devModeActive&&devAutoUpgrade&&picked.length){
      const cards=[...choicesEl.querySelectorAll(".choice")];
      const pickIndex=Math.floor(Math.random()*cards.length);
      setTimeout(()=>{
        if(paused&&!levelScreen.classList.contains("hidden")&&cards[pickIndex])cards[pickIndex].click();
      },420);
    }
  }

  function spawnChest(){
    const angle=Math.random()*Math.PI*2,distance=rand(360,620);
    chests.push({
      id:nextId++,
      x:player.x+Math.cos(angle)*distance,
      y:player.y+Math.sin(angle)*distance,
      r:22,
      phase:Math.random()*6.28,
      opened:false,
      reward:null,
      rewardLife:0,
      hintLife:10
    });
    text(player.x,player.y-90,"附近出現了寶箱！","#ffe16c",22);
    beep(520,.12,.025);
  }

  function openChest(chest){
    if(chest.opened)return;
    chest.opened=true;
    const rewards=["coin","bomb","heal","potion"];
    chest.reward=rewards[Math.floor(Math.random()*rewards.length)];
    chest.rewardLife=.55;
    burst(chest.x,chest.y,"#ffe273",18);
    pickups.push({id:nextId++,type:chest.reward,x:chest.x,y:chest.y-12,r:18,phase:Math.random()*6.28,life:10});
    const rewardColor=chest.reward==="coin"?"#ffe16c":chest.reward==="heal"?"#84ff91":chest.reward==="potion"?"#ff8fc3":"#ff9a55";
    text(chest.x,chest.y-35,"寶物掉落，10 秒內碰觸拾取！",rewardColor,19,"pickup");
    beep(520,.22,.035,"triangle");
  }

  function applyChestPickup(pickup){
    if(pickup.type==="coin"){
      const goldGain=20+Math.floor(rand(0,41));
      runCoins+=goldGain;
      text(player.x,player.y-42,`💎 +${formatCommaNumber(goldGain)}`,"#ffe16c",24,"pickup");
      beep(760,.18,.03,"triangle");
      countAudioSubtype("pickup");
      return;
    }
    if(pickup.type==="heal"){
      player.hp=player.maxHp;
      text(player.x,player.y-42,"生命完全恢復！","#8cff9b",24,"pickup");
      burst(player.x,player.y,"#8cff9b",18);
      beep(620,.4,.04,"sine");
      countAudioSubtype("pickup");
      return;
    }
    if(pickup.type==="potion"){
      potionHealTimer=10;
      text(player.x,player.y-42,"恢復藥水：10 秒回復 20% HP！","#ff9fc7",22,"pickup");
      burst(player.x,player.y,"#ff9fc7",16);
      beep(700,.3,.04,"triangle");
      countAudioSubtype("pickup");
      return;
    }
    text(player.x,player.y-42,"畫面炸彈！","#ff9a55",24,"pickup");
    beep(105,.5,.055,"sawtooth");
    countAudioSubtype("pickup");
    for(const e of enemies){
      if(e.dead)continue;
      const p=worldToScreen(e.x,e.y);
      if(p.x<-e.r||p.x>W+e.r||p.y<-e.r||p.y>H+e.r)continue;
      if(e.kind==="boss"||e.kind==="final")damageEnemy(e,e.maxHp*.2,true,"chestBomb");
      else damageEnemy(e,e.hp+1,true,"chestBomb");
    }
    effects.push({kind:"flash",life:.35});
  }

  function updatePickups(dt){
    for(const pickup of pickups){
      if(outsideNineGrid(pickup.x,pickup.y,pickup.r+24)){
        pickup.dead=true;
        chestClock=Math.max(chestClock,10);
        continue;
      }
      pickup.life-=dt;
      if(dist(pickup,player)<pickup.r+player.r){
        pickup.dead=true;
        applyChestPickup(pickup);
        chestClock=Math.max(chestClock,10);
      }else if(pickup.life<=0){
        pickup.dead=true;
        chestClock=Math.max(chestClock,10);
      }
    }
    pickups=pickups.filter(p=>!p.dead);
  }

  function updateChests(dt,moved){
    let recycled=false;
    chests=chests.filter(chest=>{
      if(outsideNineGrid(chest.x,chest.y,chest.r+28)){
        recycled=true;
        return false;
      }
      return true;
    });
    if(recycled)chestClock=Math.max(chestClock,10);
    const unopened=chests.filter(c=>!c.opened).length;
    const activeTreasures=unopened+pickups.length;
    if(activeTreasures===0&&finalPhase==="none")chestClock-=dt;
    if(chestClock<=0&&activeTreasures===0&&finalPhase==="none"){
      spawnChest();
      chestClock=10;
    }
    for(const chest of chests){
      if(chest.opened)chest.rewardLife-=dt;
      else chest.hintLife=Math.max(0,chest.hintLife-dt);
    }
    chests=chests.filter(c=>!c.opened||c.rewardLife>0);
  }

  function hurt(amount){
    if(player.invuln>0)return;
    player.hp-=amount;
    player.invuln=.7;
    burst(player.x,player.y,"#ff776e",8);
    if(isDevProtectedRun())player.hp=Math.max(1,player.hp);
    else if(player.hp<=0)lose();
  }

  function hurtPercent(percent,lethal=false,ignoreInvuln=false,grantInvuln=true){
    if(!ignoreInvuln&&player.invuln>0)return;
    const damage=Math.max(1,player.maxHp*percent);
    if(lethal)hurt(damage);
    else{
      player.hp=Math.max(1,player.hp-damage);
      if(grantInvuln)player.invuln=.55;
      burst(player.x,player.y,"#cf2648",10);
      text(player.x,player.y-52,`-${Math.round(percent*100)}% HP`,"#ff6680",18);
    }
  }
  function startEncirclementDot(percent){
    const total=Math.max(1,player.maxHp*percent);
    encirclementDebts.push({left:total,rate:total/5,time:5});
    encirclementReservedHp=encirclementDebtTotal();
    encirclementSampleClock=0;
    encirclementPressureRounds+=1;
    burst(player.x,player.y,"#ff7b96",7);
    text(player.x,player.y-52,`包圍壓力 ${encirclementTierLabel(encirclementCharge)} ${Math.round(percent*100)}%`,"#ffb0cb",18,"pickup");
  }

  function giantCarrotImpact(shot){
    if(shot.impacted)return;
    shot.impacted=true;
    shot.life=0;
    const radius=105*player.area;
    const craterRadius=radius*.48;
    const burnDps=shot.damage*.18;
    effects.push(
      {kind:"crater",id:nextId++,x:shot.x,y:shot.y,r:craterRadius,life:.8,burnDps},
      {kind:"shockwave",x:shot.x,y:shot.y,r:15,max:radius,life:.45}
    );
    burst(shot.x,shot.y,"#8a5b36",24);
    const boss=getOnlyBoss();
    if(boss){
      if(dist(shot,boss)<radius+boss.r){
        damageEnemy(boss,shot.damage,false,"giant");
        if(circleHitXY(shot.x,shot.y,craterRadius,boss.x,boss.y,boss.r*.35)){
          boss.burnTime=Math.max(boss.burnTime||0,2);
          boss.burnDps=Math.max(boss.burnDps||0,burnDps);
        }
      }
    }else{
      forEachEnemyNear(shot.x,shot.y,radius+ENEMY_QUERY_PADDING,e=>{
        if(e.dead)return;
        if(dist(shot,e)<radius+e.r){
          damageEnemy(e,shot.damage,false,"giant");
          if(!e.dead&&circleHitXY(shot.x,shot.y,craterRadius,e.x,e.y,e.r*.35)){
            e.burnTime=Math.max(e.burnTime||0,2);
            e.burnDps=Math.max(e.burnDps||0,burnDps);
          }
        }
      });
    }
    playGiantExplosionSound({startFreq:80,duration:.1,noiseGain:0,rippleSpeed:10,jitterDepth:10});
  }

  function updatePlayer(dt){
    let dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0);
    if(stick.active){dx=stick.x;dy=stick.y;}
    let moved=0;
    if(stunTimer<=0&&(dx||dy)){
      const l=Math.hypot(dx,dy),strength=Math.min(1,l);
      dx/=l;dy/=l;
      moved=player.speed*(pinkyBoostTimer>0?(skills.pinky>=5?1.25:1.15):1)*dt*strength;
      player.x+=dx*moved;player.y+=dy*moved;
      if(dx)player.facing=Math.sign(dx);
    }
    if(bossArena.active){
      const ax=player.x-bossArena.x,ay=player.y-bossArena.y,d=Math.hypot(ax,ay),limit=bossArena.r-player.r-18;
      if(d>limit){player.x=bossArena.x+ax/d*limit;player.y=bossArena.y+ay/d*limit;}
      if(isInfiniteMode()&&bossArena.zone>=3&&d>bossArena.r-58)hurtPercent(.08);
    }
    updateChests(dt,moved);
    if(player.regen||player.regenFlat)player.hp=Math.min(player.maxHp,player.hp+((player.regenFlat*player.regenBoost)+player.maxHp*player.regen)*dt);
    if(poisonTimer>0){
      poisonTimer=Math.max(0,poisonTimer-dt);
      player.hp-=player.maxHp*poisonRate*dt;
      if(isDevProtectedRun())player.hp=Math.max(1,player.hp);
      else if(player.hp<=0)lose();
    }
    stunTimer=Math.max(0,stunTimer-dt);
    pinkyBoostTimer=Math.max(0,pinkyBoostTimer-dt);
    if(pinkyBoostTimer<=0)pinkyDamageBoost=1;
    player.invuln=Math.max(0,player.invuln-dt);
    giantCarrotCooldown=Math.max(0,giantCarrotCooldown-dt);
    shotClock-=dt;
    while(shotClock<=0){
      if(pendingCarrotShots<=0){
        if(!beginCarrotVolley()){
          shotClock=Math.max(CARROT_MIN_CHAIN_INTERVAL,CARROT_BASE_COOLDOWN/player.attackSpeed);
          break;
        }
      }
      fireCarrotShot();
      pendingCarrotShots=Math.max(0,pendingCarrotShots-1);
      const volleyInterval=Math.max(CARROT_MIN_CHAIN_INTERVAL,CARROT_BASE_COOLDOWN/Math.max(1,player.attackSpeed*Math.max(1,player.projectiles)));
      shotClock+=volleyInterval;
    }
    if(skills.peanut){updatePlayer.pet=(updatePlayer.pet||0)-dt;if(updatePlayer.pet<=0){updatePlayer.pet=Math.max(.35,1.3-skills.peanut*.16);firePet();}}
    if(skills.pinky){
      updatePlayer.pinky=(updatePlayer.pinky||0)-dt;
      if(updatePlayer.pinky<=0){
        updatePlayer.pinky=3;
        fireBanana();
      }
    }
    if(skills.burst){
      updatePlayer.burst=(updatePlayer.burst||0)-dt;
      if(updatePlayer.burst<=0){
        const evolved=skills.burst>=5;
        updatePlayer.burst=evolved?2.4:Math.max(3.2,5.8-skills.burst*.42);
        const maxRadius=Math.min(BURST_RADIUS_CAP,(evolved?220:(120+skills.burst*14))*player.area);
        const waveDamage=(evolved?38:10+skills.burst*7)*player.areaDamage;
        for(let wave=0;wave<6;wave++){
          areas.push({
            x:player.x,y:player.y,r:8,max:maxRadius,
            life:1.05,delay:wave*.16,damage:waveDamage,
            hit:new Set(),evolved,wave,started:false
          });
        }
      }
    }
  }

  function updateEnemies(dt){
    const dangerRadius=encirclementRadius();
    let sectorBits=0;
    for(let enemyIndex=0;enemyIndex<enemies.length;enemyIndex++){
      countPerfWork("enemyMove");
      const e=enemies[enemyIndex];
      if(e.dead)continue;
      e.hit=Math.max(0,e.hit-dt);
      e.attack-=dt;
      e.shoot-=dt;
      e.slow=Math.max(0,e.slow-dt);
      if(e.burnTime>0&&e.burnDps>0){
        const burnTick=Math.min(e.burnTime,dt);
        e.burnTime=Math.max(0,e.burnTime-dt);
        damageEnemy(e,e.burnDps*burnTick,false,"giantBurn");
        if(e.dead)continue;
      }
      if(outsideNineGrid(e.x,e.y,e.r+48)){
        e.cullTimer=(e.cullTimer||0)+dt;
        if(e.cullTimer>=3&&time-(e.lastHitAt||e.spawnAt||time)>=3){
          e.dead=true;
          continue;
        }
      }else{
        e.cullTimer=0;
      }
      const screenPos=worldToScreen(e.x,e.y);
      const nearScreen=screenPos.x>-90&&screenPos.x<W+90&&screenPos.y>-90&&screenPos.y<H+90;
      const farBucket=((e.id||enemyIndex)+Math.floor(time*60))%3;
      if(!nearScreen&&farBucket!==0){
        const aLite=Math.atan2(player.y-e.y,player.x-e.x);
        let speedLite=e.speed;
        if(e.slow>0)speedLite*=.48;
        e.x+=Math.cos(aLite)*speedLite*dt*.34;
        e.y+=Math.sin(aLite)*speedLite*dt*.34;
        continue;
      }
      let a=Math.atan2(player.y-e.y,player.x-e.x),speed=e.speed;
      if(e.type==="bombcloud")a+=Math.sin(time*2+e.id)*.5;
      if(e.type==="snake")a+=Math.sin(time*5+e.id)*.32;
      if(e.type==="vulture"){a+=Math.sin(time*3.2+e.id)*.22;speed*=1+.18*Math.sin(time*4+e.id);}
      if(e.type==="centipede")a+=Math.sin(time*7+e.id)*.18;
      e.x+=Math.cos(a)*speed*dt;e.y+=Math.sin(a)*speed*dt;
      if(dist(e,player)<e.r+player.r){
        hurt(e.damage);
      }
      const ranged=e.type==="plant"&&currentStage!==1;
      if(ranged&&e.shoot<=0&&dist(e,player)<650){
        const shotSpeed=e.kind==="normal"?185:e.kind==="elite"?225:250;
        enemyShots.push({kind:"normal",x:e.x,y:e.y,vx:Math.cos(a)*shotSpeed,vy:Math.sin(a)*shotSpeed,r:e.kind==="normal"?7:10,damage:e.damage*.55,life:4,poison:0});
        e.shoot=e.kind==="normal"?rand(2.1,3.2):e.kind==="elite"?rand(1.3,2):rand(.8,1.35);
      }
      if(e.kind==="final"&&e.type==="stoneface"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=Math.max(1.4,3.2-(3-e.bars)*.55);
          const count=e.bars===1?Math.floor(rand(3,6)):e.bars===2?2:1;
          for(let i=0;i<count;i++){
            effects.push({kind:"bossRock",x:player.x+rand(-90,90),y:player.y+rand(-90,90),r:32,delay:.8,life:1.15,damage:18+(3-e.bars)*5});
          }
        }
      }
      if(e.kind==="final"&&e.type==="plant"&&currentStage!==1){
        e.phase-=dt;if(e.phase<=0){e.phase=2.2;for(let i=0;i<8;i++){const q=i*Math.PI/4;enemyShots.push({x:e.x,y:e.y,vx:Math.cos(q)*150,vy:Math.sin(q)*150,life:4,r:12,damage:12});}}
      }
      if(e.kind==="final"&&e.type==="whale"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?4.2:e.bars===2?5.2:6.4;
          const a=Math.atan2(player.y-e.y,player.x-e.x);
          effects.push({kind:"beamWarning",x:e.x,y:e.y,a,width:70,delay:1.05,life:1.55,percent:.35,color:"#66d7ff",line:"#ff4a58",hit:false});
          if(e.bars<=2)text(player.x,player.y-55,"暴風雪逼近！","#d8f6ff",18);
          beep(180,.24,.035,"triangle");
        }
      }
      if(e.kind==="final"&&e.type==="reaper"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=10;
          const count=e.bars===1?3:e.bars===2?2:1;
          const baseA=Math.atan2(player.y-e.y,player.x-e.x);
          for(let i=0;i<count;i++)effects.push({kind:"beamWarning",x:e.x,y:e.y,a:baseA+(i-(count-1)/2)*.28,width:54,delay:1.1,life:1.65,percent:.5,color:"#7b1026",line:"#ff2e55",hit:false});
          beep(82,.45,.055,"sawtooth");
        }else if(e.shoot<=0){
      const count=e.bars===1?5:e.bars===2?4:3;
          for(let i=0;i<count;i++){
            const q=Math.atan2(player.y-e.y,player.x-e.x)+(i-(count-1)/2)*.18;
            enemyShots.push({kind:"skull",x:e.x,y:e.y,vx:Math.cos(q)*185,vy:Math.sin(q)*185,life:4.5,r:10,damage:e.damage*.42});
          }
          e.shoot=1.4;
        }
      }
      const centerDist=dist(e,player);
      const closeDist=centerDist-e.r-player.r;
      if(closeDist<dangerRadius){
        let ang=Math.atan2(e.y-player.y,e.x-player.x);
        if(ang<0)ang+=Math.PI*2;
        const sector=Math.min(7,Math.floor(ang/(Math.PI/4)));
        sectorBits|=(1<<sector);
      }
    }
    enemies=enemies.filter(e=>!e.dead);
    rebuildEnemyGrid();
    encirclementSectorBits=sectorBits;
    encirclementSectorCount=sectorBits.toString(2).replace(/0/g,"").length;
    encirclementPrewarn=encirclementSectorCount>=6;
    const pressureTarget=encirclementSectorCount/8;
    const riseLerp=pressureTarget>encirclementPressure?Math.min(1,dt*4.2):0;
    const fallLerp=pressureTarget<encirclementPressure?Math.min(1,dt*2.1):0;
    if(riseLerp)encirclementPressure+=(pressureTarget-encirclementPressure)*riseLerp;
    else if(fallLerp)encirclementPressure+=(pressureTarget-encirclementPressure)*fallLerp;
    if(pressureTarget<=0.01)encirclementPressure=Math.max(0,encirclementPressure-dt*.1);
    if(encirclementSectorCount>=8){
      const sampleDuration=currentEncirclementSampleDuration();
      encirclementCharge=Math.min(100,encirclementCharge+encirclementChargeRate(encirclementCharge)*dt);
      encirclementSampleClock=Math.min(sampleDuration,encirclementSampleClock+dt);
    }else{
      encirclementCharge=Math.max(0,encirclementCharge-10*dt);
      if(encirclementCharge<=0){
        encirclementSampleClock=0;
        encirclementPressureRounds=0;
      }
    }
    if(encirclementSectorCount>=8&&encirclementSampleClock>=currentEncirclementSampleDuration()){
      const percent=encirclementStagePercent(encirclementCharge);
      if(percent>0)startEncirclementDot(percent);
      else{
        encirclementSampleClock=0;
        encirclementPressureRounds=0;
      }
    }
    if(encirclementDebts.length){
      let totalTickDamage=0;
      for(let i=encirclementDebts.length-1;i>=0;i--){
        const debt=encirclementDebts[i];
        const tickDamage=Math.min(debt.left,debt.rate*dt);
        debt.left=Math.max(0,debt.left-tickDamage);
        debt.time=Math.max(0,debt.time-dt);
        totalTickDamage+=tickDamage;
        if(debt.left<=0||debt.time<=0)encirclementDebts.splice(i,1);
      }
      if(totalTickDamage>0)player.hp-=totalTickDamage;
      encirclementReservedHp=encirclementDebtTotal();
      if(encirclementCharge<=0&&!encirclementDebts.length){
        encirclementSampleClock=0;
        encirclementPressureRounds=0;
      }
      if(isDevProtectedRun())player.hp=Math.max(1,player.hp);
      else if(player.hp<=0){
        lose();
        return;
      }
    }
    if(potionHealTimer>0){
      player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.02*dt);
      potionHealTimer=Math.max(0,potionHealTimer-dt);
    }
  }

  function updateEnemyShots(dt){
    const orbitCount=skills.orbit?skills.orbit+1:0;
    const orbitRadius=55*player.area;
    const orbitSpeed=skills.orbit>=5?4.6:1.8+skills.orbit*.1;
    const ring=orbitRingConfig();
    for(const shot of enemyShots){
      countPerfWork("projectileDraw");
      shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;
      if(orbitCount){
        if(skills.orbit>=5){
          countPerfWork("collisionOrbit");
          const outer=ring.radius+ring.thickness*.5;
          const inner=Math.max(0,ring.radius-ring.thickness*.5);
          const d=dist(shot,player);
          if(!(shot.orbitChecked&&time-shot.orbitChecked<=ring.hitDelay)&&d+shot.r>=inner&&d-shot.r<=outer){
            shot.orbitChecked=time;
            if(Math.random()<ring.hitChance){
              shot.life=0;
              burst(shot.x,shot.y,"#ffb14e",5);
            }
          }
        }else{
          for(let i=0;i<orbitCount;i++){
            countPerfWork("collisionOrbit");
            const a=time*orbitSpeed+i*Math.PI*2/orbitCount;
            const guard={x:player.x+Math.cos(a)*orbitRadius,y:player.y+Math.sin(a)*orbitRadius};
            if(dist(shot,guard)<shot.r+12){
              shot.life=0;
              burst(shot.x,shot.y,"#ffb14e",5);
              break;
            }
          }
        }
        if(shot.life<=0){
          continue;
        }
      }
      countPerfWork("collisionEnemyShot");
      if(shot.life>0&&circleHitXY(shot.x,shot.y,shot.r,player.x,player.y,player.r)){
        shot.life=0;
        hurt(shot.damage);
        if(shot.poison){
          poisonRate=Math.max(poisonRate,shot.poison);
          poisonTimer=3;
          text(player.x,player.y-48,"中毒 3 秒","#9cff68",17);
        }
      }
    }
    enemyShots=enemyShots.filter(s=>s.life>0&&dist(s,player)<1100);
  }

  function shatterRollingStone(shot,enemy){
    shot.life=0;
    burst(enemy.x,enemy.y,"#aa9278",12);
    effects.push({kind:"shockwave",x:enemy.x,y:enemy.y,r:8,max:48,life:.3});
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7+rand(-.2,.2),speed=rand(70,145);
      effects.push({
        kind:"rockFragment",x:enemy.x,y:enemy.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
        z:rand(14,26),vz:rand(150,230),r:rand(4,7),life:2,damage:(14+skills.peanut*2)*player.areaDamage
      });
    }
  }

  function updateShots(dt,list,isPet=false){
    for(const s of list){
      countPerfWork("projectileDraw");
      s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
      if(s.life<=0){
        releaseShotReservation(s);
        continue;
      }

      if(s.kind==="rolling"){
        s.debris-=dt;
        if(s.debris<=0){
          s.debris=.055;
          effects.push({kind:"chip",x:s.x+rand(-8,8),y:s.y+rand(-8,8),vx:rand(-70,70),vy:rand(-95,-25),life:.35,r:rand(2,5),color:"#8a735e"});
        }
      }

      if(s.kind==="giant"){
        let impact=s.life<=0;
        if(!impact){
          const boss=getOnlyBoss();
          if(boss){
            countPerfWork("collisionShot");
            if(circleHitXY(s.x,s.y,s.r,boss.x,boss.y,boss.r))impact=true;
          }else{
            forEachEnemyNear(s.x,s.y,s.r+ENEMY_QUERY_PADDING,e=>{
              countPerfWork("collisionShot");
              if(impact||e.dead)return false;
              if(circleHitXY(s.x,s.y,s.r,e.x,e.y,e.r)){
                impact=true;
                return false;
              }
            });
          }
        }
        if(impact)giantCarrotImpact(s);
        if(s.life<=0)continue;
      }

      let hitEnemy=false;
      const boss=getOnlyBoss();
      if(boss){
        countPerfWork("collisionShot");
        if(!hitEnemy&&!boss.dead&&s.life>0&&circleHitXY(s.x,s.y,s.r,boss.x,boss.y,boss.r)){
          if(!(s.kind==="rolling"&&s.hit.has(boss.id))){
            let crit=false;
            if(!isPet){
              crit=Math.random()<player.critStack;
              player.critStack=crit?player.crit:Math.min(1,player.critStack+player.crit);
            }
            const damage=s.damage*(crit?player.critDamage:1);
            releaseShotReservation(s);
            damageEnemy(boss,damage,crit,s.kind||"normal");
            if(s.kind==="rolling"){
              s.hit.add(boss.id);
              shatterRollingStone(s,boss);
              hitEnemy=true;
            }else{
              if(isPet||s.pierce--<=0)s.life=0;else{s.x+=s.vx*dt*2;s.y+=s.vy*dt*2;}
              hitEnemy=true;
            }
          }
        }
      }else{
        forEachEnemyNear(s.x,s.y,s.r+ENEMY_QUERY_PADDING,e=>{
          countPerfWork("collisionShot");
          if(hitEnemy||e.dead||s.life<=0)return false;
          if(!circleHitXY(s.x,s.y,s.r,e.x,e.y,e.r))return;
          if(s.kind==="rolling"&&s.hit.has(e.id))return;
          let crit=false;
          if(!isPet){
            crit=Math.random()<player.critStack;
            player.critStack=crit?player.crit:Math.min(1,player.critStack+player.crit);
          }
          const damage=s.damage*(crit?player.critDamage:1);
          releaseShotReservation(s);
          damageEnemy(e,damage,crit,s.kind||"normal");
          if(s.kind==="rolling"){
            s.hit.add(e.id);
            shatterRollingStone(s,e);
            hitEnemy=true;
            return false;
          }
          if(isPet||s.pierce--<=0)s.life=0;else{s.x+=s.vx*dt*2;s.y+=s.vy*dt*2;}
          hitEnemy=true;
          if(s.life<=0||hitEnemy)return false;
        });
      }
      if(s.life>0&&!isPet&&!s.kind){
        for(const chest of chests){
          countPerfWork("collisionChest");
          if(chest.opened||!circleHitXY(s.x,s.y,s.r,chest.x,chest.y,chest.r))continue;
          releaseShotReservation(s);
          openChest(chest);
          s.life=0;
          break;
        }
      }
    }
    return list.filter(s=>s.life>0);
  }

  function updateSkills(dt){
    if(skills.orbit){
      const count=skills.orbit+1,rad=55*player.area;
      const orbitSpeed=skills.orbit>=5?4.6:1.8+skills.orbit*.1;
      const ring=orbitRingConfig();
      const hitDelay=ring.hitDelay;
      const boss=getOnlyBoss();
      if(skills.orbit>=5){
        const outer=ring.radius+ring.thickness*.5;
        const inner=Math.max(0,ring.radius-ring.thickness*.5);
        if(boss){
          countPerfWork("collisionOrbit");
          if(!(boss.dead||boss.orbitHit&&time-boss.orbitHit<=hitDelay)){
            const d=dist(boss,player);
            if(d+boss.r>=inner&&d-boss.r<=outer){
              boss.orbitHit=time;
              if(Math.random()<ring.hitChance)damageEnemy(boss,ring.damage,false,"orbit");
            }
          }
        }else{
          forEachEnemyNear(player.x,player.y,outer+ENEMY_QUERY_PADDING,e=>{
            countPerfWork("collisionOrbit");
            if(e.dead||e.orbitHit&&time-e.orbitHit<=hitDelay)return;
            const d=dist(e,player);
            if(d+e.r>=inner&&d-e.r<=outer){
              e.orbitHit=time;
              if(Math.random()<ring.hitChance)damageEnemy(e,ring.damage,false,"orbit");
            }
          });
        }
      }else{
        for(let i=0;i<count;i++){
          const a=time*orbitSpeed+i*Math.PI*2/count,x=player.x+Math.cos(a)*rad,y=player.y+Math.sin(a)*rad;
          if(boss){
            countPerfWork("collisionOrbit");
            if(!(boss.dead||boss.orbitHit&&time-boss.orbitHit<=hitDelay)){
              const dx=boss.x-x,dy=boss.y-y,reach=boss.r+9;
              if(dx*dx+dy*dy<reach*reach){
                boss.orbitHit=time;
                damageEnemy(boss,ring.damage,false,"orbit");
              }
            }
          }else{
            forEachEnemyNear(x,y,56,e=>{
              countPerfWork("collisionOrbit");
              if(e.dead||e.orbitHit&&time-e.orbitHit<=hitDelay)return;
              const dx=e.x-x,dy=e.y-y,reach=e.r+9;
              if(dx*dx+dy*dy<reach*reach){
                e.orbitHit=time;
                damageEnemy(e,ring.damage,false,"orbit");
              }
            });
          }
        }
      }
    }
    for(const a of areas){
      if(a.delay>0){a.delay-=dt;continue;}
      if(!a.started){
        a.started=true;
        beep(a.wave%2===0?760:260,.11,a.evolved?.035:.025,a.wave%2===0?"square":"triangle");
      }
      a.life-=dt;
      a.r+=(a.max-a.r)*dt*(a.evolved?4.2:3.5);
      const band=Math.max(24,a.max*.16);
      const boss=getOnlyBoss();
      if(boss){
        countPerfWork("collisionArea");
        if(!boss.dead&&!a.hit.has(boss.id)){
          const d=dist(a,boss);
          if(d<=a.r+boss.r&&d>=Math.max(0,a.r-band-boss.r)){
            a.hit.add(boss.id);
            damageEnemy(boss,a.damage,false,"burst");
          }
        }
      }else{
        forEachEnemyNear(a.x,a.y,a.r+band+ENEMY_QUERY_PADDING,e=>{
          countPerfWork("collisionArea");
          if(e.dead||a.hit.has(e.id))return;
          const dx=e.x-a.x,dy=e.y-a.y,d2=dx*dx+dy*dy;
          const outer=a.r+e.r,inner=Math.max(0,a.r-band-e.r);
          if(d2<=outer*outer&&d2>=inner*inner){
            a.hit.add(e.id);
            damageEnemy(e,a.damage,false,"burst");
          }
        });
      }
    }
    areas=areas.filter(a=>a.delay>0||a.life>0);
  }

  function updateGems(dt){
    const frameBucket=Math.floor(time*60);
    for(let i=0;i<gems.length;i++){
      const g=gems[i];
      const lifeTime=time-(g.spawnTime??time);
      const d=dist(g,player);
      const magnetized=d<player.magnet;
      if(lifeTime>=5){
        g.dead=true;
        gainXp(g.value||0);
        continue;
      }
      const near=d<340||magnetized;
      if(!near){
        const bucketBase=(g.id||i)+frameBucket;
        if(d>=700){
          if(bucketBase%3!==0)continue;
        }else if(bucketBase%2!==0)continue;
      }
      countPerfWork("gemUpdate");
      if(magnetized){
        const a=Math.atan2(player.y-g.y,player.x-g.x),sp=180+(player.magnet-d)*4;
        g.x+=Math.cos(a)*sp*dt;
        g.y+=Math.sin(a)*sp*dt;
      }
      if(d<player.r+9){
        g.dead=true;
        gainXp(g.value||0);
        playXpPickupSound({waveform:"sine",baseFreq:2169,duration:.2,overtone:.05,rippleCount:1});
      }
    }
    gems=gems.filter(g=>!g.dead);
  }

  function update(dt){
    if(!running||paused||ended)return;
    sharedTargetTimer=Math.max(0,sharedTargetTimer-dt);
    debugFrameMs=debugFrameMs*.88+dt*1000*.12;
    debugPeakFrameMs=Math.max(debugFrameMs,debugPeakFrameMs*.965);
    debugFps=1000/Math.max(1,debugFrameMs);
    autoSaveTimer+=dt;
    if(autoSaveTimer>=30){
      autoSaveTimer=0;
      saveMeta();
    }
    if(performance&&performance.memory&&performance.memory.usedJSHeapSize)debugHeapMb=performance.memory.usedJSHeapSize/1048576;
    perfDebugTimer+=dt;
    perfDebugAccumulator.frameMs+=dt*1000;
    perfDebugAccumulator.fps+=1000/Math.max(1,dt*1000);
    perfDebugAccumulator.samples++;
    perfDebugAccumulator.peak=Math.max(perfDebugAccumulator.peak,dt*1000);
    if(perfDebugTimer>=2){
      const sampleCount=Math.max(1,perfDebugAccumulator.samples);
      perfDebugLast={
        frameMs:perfDebugAccumulator.frameMs/sampleCount,
        fps:perfDebugAccumulator.fps/sampleCount,
        peak:perfDebugAccumulator.peak
      };
      perfWorkLast={...perfWorkCurrent};
      perfDebugTimer=0;
      perfDebugAccumulator={frameMs:0,fps:0,samples:0,peak:0};
      perfWorkCurrent={
        targetSearch:0,gridRebuild:0,nearQuery:0,
        collisionShot:0,collisionArea:0,collisionOrbit:0,collisionEnemyShot:0,collisionCrater:0,collisionChest:0,collisionBanana:0,
        enemyMove:0,gemUpdate:0,spawn:0,groundDraw:0,enemyDraw:0,projectileDraw:0,
        gridCells:0,gridEntries:0,effectDraw:0,textDraw:0
      };
    }
    audioDebugTimer+=dt;
    if(audioDebugTimer>=.5){
      audioDebugTimer=0;
      audioDebugLast={...audioDebugCurrent};
      audioDebugCurrent={total:0,beep:0,external:0,xp:0,crit:0,ui:0,pickup:0,smallCarrot:0,giantLaunch:0,giantExplosion:0,externalFail:0};
    }
    if(devTestRecorder.active){
      devTestRecorder.elapsed+=dt;
      devTestRecorder.lastSampleAt+=dt;
      if(testModeOverlay.classList.contains("visible"))updateTestModeUi();
      if(devTestRecorder.lastSampleAt>=devTestRecorder.interval){
        devTestRecorder.lastSampleAt=0;
        sampleDevTestRecorder();
        devTestRecorder.summary=buildDevTestSummary();
        updateTestModeUi();
      }
    }
    if(transitioning){
      updateAnnouncements(dt);
      return;
    }
    const preBattleActive=battleStartDelay>0;
    if(preBattleActive){
      battleStartDelay=Math.max(0,battleStartDelay-dt);
      updateAnnouncements(dt);
    }else{
      time+=dt;
      timeline();
      updateAnnouncements(dt);
    }
    hudSampleTimer+=dt;
    if(hudSampleTimer>=.1){
      hudSampleTimer=0;
      hudEnemyCount=livingEnemyCount();
      hudKills=kills;
      hudKps=kps;
    }
    kpsWindowTime+=dt;
    if(kpsWindowTime>=.5){
      const sample=kpsWindowKills/kpsWindowTime;
      kps=kps*.55+sample*.45;
      kpsWindowKills=0;
      kpsWindowTime=0;
      kpsPressure=clamp((kps-10)/55,0,1);
    }
    if(!preBattleActive&&finalPhase==="warning"){
      finalTimer-=dt;
      if(finalTimer<=0)spawnFinalBoss();
    }
    if(!preBattleActive)spawnClock-=dt;
    const intensity=1+time/150;
    if(!preBattleActive&&finalPhase==="none"&&(isInfiniteMode()||time<DURATION)&&spawnClock<=0){
      countPerfWork("spawn");
      const livingCount=nearbyLivingEnemyCount();
      let targetEnemyCount=0;
      let variance=.12;
      if(kps>=10){
        targetEnemyCount=Math.min(200,Math.round(kps*10));
        variance=targetEnemyCount>=200?.3:.2;
      }else{
        const baseTarget=time<240?60:72;
        targetEnemyCount=Math.round(baseTarget*Math.min(1.35,intensity));
      }
      const minTarget=Math.round(targetEnemyCount*(1-variance));
      const maxTarget=Math.round(targetEnemyCount*(1+variance));
      const needCount=Math.max(0,minTarget-livingCount);
      const densityGap=Math.max(0,targetEnemyCount-livingCount);
      spawnClock=kps>=10?Math.max(.08,.2-densityGap*.0004):Math.max(.12,.5/(intensity*.95));
      if(livingCount<maxTarget&&needCount>0){
        const types=enemyPoolForCurrentTime();
        const eliteChance=.012+Math.max(0,(kps-10)/190)*.065+infiniteGrowth().elite;
        const spawnBatch=Math.min(14,Math.max(1,needCount,Math.ceil(densityGap*.18)));
        for(let i=0;i<spawnBatch&&livingCount+i<maxTarget;i++){
          const kind=kps>=10&&Math.random()<eliteChance?"elite":"normal";
          spawnEnemy(types[Math.floor(Math.random()*types.length)],kind,{kpsSpawned:kps>=10});
        }
      }
    }
    updatePlayer(dt);updateEnemies(dt);shots=updateShots(dt,shots);petShots=updateShots(dt,petShots,true);updateBananas(dt);updateSkills(dt);updateEnemyShots(dt);updateGems(dt);if(!preBattleActive)updatePickups(dt);
    for(const e of effects){
      if(e.kind==="particle"||e.kind==="chip"||e.kind==="half"||e.kind==="pinkyLine"||e.kind==="heart"){
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;
        if(e.kind==="chip"||e.kind==="half")e.vy+=260*dt;
      }
      if(e.kind==="crater"||e.kind==="shockwave"||e.kind==="slash")e.life-=dt;
      if(e.kind==="beamWarning"){
        e.life-=dt;
        e.delay-=dt;
        if(e.delay<=0&&!e.hit){
          e.hit=true;
          const px=player.x-e.x,py=player.y-e.y;
          const along=px*Math.cos(e.a)+py*Math.sin(e.a);
          const side=Math.abs(-px*Math.sin(e.a)+py*Math.cos(e.a));
          if(along>-80&&along<950&&side<e.width*.5+player.r)hurtPercent(e.percent);
          beep(58,.28,.055,"sawtooth");
        }
      }
      if(e.kind==="bossRock"){
        e.delay-=dt;
        if(e.delay<=0&&!e.landed){
          e.landed=true;
          if(dist(e,player)<e.r+player.r){
            hurt(e.damage);
            if(Math.random()<.25){stunTimer=1;resetStick();text(player.x,player.y-55,"暈眩 1 秒！","#ffd15e",20);}
          }
          burst(e.x,e.y,"#9b8267",14);
        }
        e.life-=dt;
      }
      if(e.kind==="shockwave")e.r+=(e.max-e.r)*dt*11;
      if(e.kind==="flash")e.life-=dt;
      if(e.kind==="rockFragment"){
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.z+=e.vz*dt;e.vz-=480*dt;e.life-=dt;
        if(e.z<=0&&e.vz<0){
          e.z=0;e.life=0;
          burst(e.x,e.y,"#806d5d",5);
          for(const enemy of enemies)if(!enemy.dead&&dist(e,enemy)<34+enemy.r)damageEnemy(enemy,e.damage,false,"rockFragment");
        }
      }
    }
    effects=effects.filter(e=>e.life===undefined||e.life>0);
    for(const t of texts){t.y-=30*dt;t.life-=dt;}texts=texts.filter(t=>t.life>0);
    if(instantKillTimer>0){
      instantKillTimer-=dt;
      if(instantKillTimer<=0)instantKills=0;
    }
  }

  function burst(x,y,color,n){for(let i=0;i<n;i++)effects.push({kind:"particle",x,y,vx:rand(-140,140),vy:rand(-140,140),life:rand(.25,.65),color,r:rand(2,6)});}
  function text(x,y,value,color="#fff",size=14,kind="normal"){
    if(kind==="normal"||kind==="critical"||kind==="boss"){
      let sameKindCount=0;
      for(const t of texts)if(t.kind===kind)sameKindCount++;
      if(kind==="normal"&&sameKindCount>=MAX_NORMAL_TEXTS)return;
      if(kind==="critical"&&sameKindCount>=MAX_CRITICAL_TEXTS)return;
      if(kind==="boss"&&sameKindCount>=MAX_BOSS_TEXTS)return;
    }
    texts.push({x,y,value:String(value),color,size,kind,life:1});
  }

  function compactDamageNumber(value,unit){
    const compacted=value<10?Math.floor(value*10)/10:Math.floor(value);
    const text=compacted<10&&compacted%1!==0?compacted.toFixed(1):String(compacted);
    return `${text.replace(/\.0$/,"")}${unit}`;
  }

  function formatCompactCount(value){
    const count=Math.max(0,Math.floor(value));
    const format=(base,unit)=>{
      const truncated=Math.floor(base*100)/100;
      const text=truncated.toFixed(2).replace(/\.?0+$/,"");
      return `${text}${unit}`;
    };
    if(count>=1000000000)return format(count/1000000000,"B");
    if(count>=1000000)return format(count/1000000,"M");
    if(count>=1000)return format(count/1000,"K");
    return String(count);
  }

  function formatCriticalDamage(amount){
    const value=Math.max(0,Math.round(amount));
    if(value>=1000000)return `${compactDamageNumber(value/1000000,"M")}!`;
    if(value>=1000)return `${compactDamageNumber(value/1000,"K")}!`;
    return `${value}!`;
  }

  function drawCriticalText(t,p){
    ctx.save();
    ctx.translate(p.x,p.y-6);
    ctx.globalAlpha=clamp(t.life*2,0,1);
    ctx.font=`bold ${t.size}px sans-serif`;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    const textWidth=ctx.measureText(t.value).width;
    const spikes=12,outerX=Math.max(25,textWidth*.5+14),outerY=25,innerX=Math.max(17,outerX*.76),innerY=17;
    ctx.fillStyle="#c72f35";
    ctx.strokeStyle="#ff784f";
    ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<spikes*2;i++){
      const a=-Math.PI/2+i*Math.PI/spikes;
      const rx=i%2===0?outerX:innerX,ry=i%2===0?outerY:innerY;
      const x=Math.cos(a)*rx,y=Math.sin(a)*ry;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.lineWidth=4;
    ctx.lineJoin="round";
    ctx.strokeStyle="#5c1725";
    ctx.fillStyle="#ffe75f";
    ctx.strokeText(t.value,0,1);
    ctx.fillText(t.value,0,1);
    ctx.restore();
  }
  function announce(title,subtitle="",color="#ffe45f",duration=3.5){
    announcements.push({title,subtitle,color,duration});
  }

  function updateAnnouncements(dt){
    if(!activeAnnouncement&&announcements.length){
      const next=announcements.shift();
      activeAnnouncement={...next,life:next.duration,age:0};
    }
    if(!activeAnnouncement)return;
    activeAnnouncement.life-=dt;
    activeAnnouncement.age+=dt;
    if(activeAnnouncement.life<=0)activeAnnouncement=null;
  }

  function drawAnnouncement(){
    if(!activeAnnouncement)return;
    const a=activeAnnouncement;
    const alpha=Math.min(1,a.age/.45,a.life/.55);
    const y=H>W?220:94,boxWidth=Math.min(530,W-20),boxX=(W-boxWidth)/2;
    const outlinedText=(value,x,y,color,lineWidth=7)=>{
      ctx.lineWidth=lineWidth;
      ctx.lineJoin="round";
      ctx.strokeStyle="#100b1f";
      ctx.fillStyle=color;
      ctx.strokeText(value,x,y);
      ctx.fillText(value,x,y);
    };
    ctx.globalAlpha=alpha*.82;
    rect(boxX,y-36,boxWidth,a.subtitle?82:62,"#17132c");
    rect(boxX,y-36,8,a.subtitle?82:62,a.color);
    rect(boxX+boxWidth-8,y-36,8,a.subtitle?82:62,a.color);
    ctx.globalAlpha=alpha;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.font="bold 31px 'Courier New','Microsoft JhengHei',monospace";
    outlinedText(a.title,W/2,y-19,a.color,7);
    if(a.subtitle){
      ctx.font="bold 16px 'Courier New','Microsoft JhengHei',monospace";
      outlinedText(a.subtitle,W/2,y+23,"#fff4d4",5);
    }
    ctx.textAlign="left";
    ctx.textBaseline="alphabetic";
    ctx.globalAlpha=1;
  }

  function drawGround(){
    const zone=effectiveZone();
    rect(0,0,W,H,zone>=3?"#2a0f1b":zone===2?"#cfefff":zone===1?"#d7b66f":"#79bd58");
    const grid=64,camera=cameraPosition();
    const left=camera.x-W/2-grid,top=camera.y-H/2-grid;
    const firstX=Math.floor(left/grid),firstY=Math.floor(top/grid);
    const cols=Math.ceil(W/grid)+3,rows=Math.ceil(H/grid)+3;
    if(!groundCache.canvas){
      groundCache.canvas=document.createElement("canvas");
      groundCache.ctx=groundCache.canvas.getContext("2d");
    }
    if(
      groundCache.zone!==zone||
      groundCache.firstX!==firstX||
      groundCache.firstY!==firstY||
      groundCache.cols!==cols||
      groundCache.rows!==rows
    ){
      groundCache.zone=zone;
      groundCache.firstX=firstX;
      groundCache.firstY=firstY;
      groundCache.cols=cols;
      groundCache.rows=rows;
      groundCache.canvas.width=cols*grid;
      groundCache.canvas.height=rows*grid;
      const gctx=groundCache.ctx;
      gctx.clearRect(0,0,groundCache.canvas.width,groundCache.canvas.height);
      countPerfWork("groundDraw",cols*rows);
      for(let gx=0;gx<cols;gx++)for(let gy=0;gy<rows;gy++){
        drawGroundTile(gctx,zone,firstX+gx,firstY+gy,gx*grid,gy*grid,grid);
      }
    }
    const offsetX=firstX*grid-camera.x+W/2;
    const offsetY=firstY*grid-camera.y+H/2;
    ctx.drawImage(groundCache.canvas,Math.round(offsetX),Math.round(offsetY));
  }

  function drawGroundTile(targetCtx,zone,gx,gy,x,y,grid=64){
    const hash=((gx*928371+gy*1237)%7+7)%7;
    if(zone>=3){
      targetCtx.fillStyle=hash%2?"#321421":"#3c1825";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#160912";
      targetCtx.fillRect(x,y,grid,3);
      targetCtx.fillRect(x,y,3,grid);
      if(hash===2){
        targetCtx.fillStyle="#7d1f2c";targetCtx.fillRect(x+12,y+34,34,4);
        targetCtx.fillStyle="#c0393c";targetCtx.fillRect(x+20,y+37,18,3);
      }
      if(hash===5){targetCtx.fillStyle="#9d2530";targetCtx.fillRect(x+46,y+13,5,5);}
    }else if(zone===2){
      targetCtx.fillStyle=hash%2?"#dff7ff":"#c8eaff";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#8fc9e8";
      targetCtx.fillRect(x,y,grid,2);
      targetCtx.fillRect(x,y,2,grid);
      if(hash===1){
        targetCtx.fillStyle="#f7fbff";
        targetCtx.fillRect(x+12,y+18,28,5);
        targetCtx.fillRect(x+19,y+24,18,4);
      }
      if(hash===4){
        targetCtx.fillStyle="#6fa9cc";
        targetCtx.fillRect(x+36,y+34,18,3);
        targetCtx.fillRect(x+45,y+28,3,12);
      }
    }else if(zone===1){
      if(hash===1){
        targetCtx.fillStyle="#c09a58";targetCtx.fillRect(x+10,y+44,28,5);
        targetCtx.fillStyle="#e2c481";targetCtx.fillRect(x+18,y+38,22,4);
      }
      if(hash===3){
        targetCtx.fillStyle="#8d7150";targetCtx.fillRect(x+43,y+31,10,7);
        targetCtx.fillStyle="#b59465";targetCtx.fillRect(x+47,y+27,7,5);
      }
      if(hash===5){
        targetCtx.fillStyle="#8f6b3f";
        targetCtx.fillRect(x+17,y+36,24,4);
        targetCtx.fillRect(x+25,y+29,4,11);
        targetCtx.fillStyle="#b89055";targetCtx.fillRect(x+10,y+13,3,3);
        targetCtx.fillStyle="#f0d08a";targetCtx.fillRect(x+48,y+48,2,2);
      }
      if(hash===6){
        targetCtx.fillStyle="#eee0b6";
        targetCtx.fillRect(x+12,y+50,27,4);
        targetCtx.fillRect(x+10,y+47,6,5);
      }
    }else{
      if(hash===1){
        targetCtx.fillStyle="#3e9148";targetCtx.fillRect(x+12,y+15,4,12);
        targetCtx.fillStyle="#55a64d";targetCtx.fillRect(x+18,y+10,4,17);
      }
      if(hash===3){
        targetCtx.fillStyle="#f5da62";targetCtx.fillRect(x+40,y+35,5,5);
        targetCtx.fillStyle="#fff1a0";targetCtx.fillRect(x+45,y+35,5,5);
      }
      if(hash===5){
        targetCtx.fillStyle="#69aa51";
        targetCtx.fillRect(x+24,y+28,22,10);
        targetCtx.fillRect(x+29,y+22,12,16);
      }
    }
  }
  function currentGroundTileCount(){
    const grid=64;
    return (Math.ceil(W/grid)+3)*(Math.ceil(H/grid)+3);
  }
  function nearbyLivingEnemyCount(radius=1400){
    const radiusSq=radius*radius;
    let count=0;
    for(const e of enemies){
      if(e.dead)continue;
      const dx=e.x-player.x,dy=e.y-player.y;
      if(dx*dx+dy*dy<=radiusSq)count++;
    }
    return count;
  }

  function drawBossArena(){
    if(!bossArena.active)return;
    const center=worldToScreen(bossArena.x,bossArena.y);
    const zone=bossArena.zone??effectiveZone();
    ctx.save();
    ctx.globalAlpha=.12;
    ctx.fillStyle=zone>=3?"#b62031":zone===2?"#dff8ff":"#f7d58a";ctx.beginPath();ctx.arc(center.x,center.y,bossArena.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    const blocks=44;
    for(let i=0;i<blocks;i++){
      const a=i*Math.PI*2/blocks;
      const x=center.x+Math.cos(a)*bossArena.r,y=center.y+Math.sin(a)*bossArena.r;
      ctx.save();ctx.translate(x,y);ctx.rotate(a);
      if(zone>=3){
        rect(-10,-18,20,28,i%2?"#ff6a2a":"#d52635");
        rect(-6,-28,12,14,"#ffd15b");
        rect(-13,8,26,5,"#260912");
      }else if(zone===2){
        rect(-13,-10,26,20,i%2?"#a8e6ff":"#d9f8ff");
        rect(-10,-7,20,5,"#f8ffff");
        rect(-13,7,26,4,"#74b8d6");
      }else{
        rect(-13,-10,26,20,i%2?"#70493d":"#865849");
        rect(-10,-7,20,5,i%2?"#a9795d":"#ba8967");
        rect(-13,7,26,4,"#3e2d2a");
      }
      ctx.restore();
    }
    ctx.strokeStyle=zone>=3?"#ff2e3e":zone===2?"#72ddff":"#ff5a55";ctx.lineWidth=4;ctx.globalAlpha=.62;
    ctx.beginPath();ctx.arc(center.x,center.y,bossArena.r-15,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  function drawBossWarning(){
    if(finalPhase!=="warning")return;
    const pulse=.72+.28*Math.sin(time*12);
    ctx.save();
    ctx.globalAlpha=.18*pulse;rect(0,0,W,H,"#a90020");
    ctx.translate(W/2,H/2);
    ctx.rotate(-.28);
    for(let i=-2;i<=2;i++)rect(-W*.7,i*58-14,W*1.4,28,i%2?"#ff1738":"#8b001d");
    ctx.rotate(.28);
    ctx.globalAlpha=pulse;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.lineWidth=9;ctx.strokeStyle="#27000b";ctx.fillStyle="#ff334e";
    ctx.font="bold 54px sans-serif";
    ctx.strokeText("WARNING",0,-12);ctx.fillText("WARNING",0,-12);
    ctx.font="bold 25px sans-serif";ctx.fillStyle="#fff";
    ctx.strokeText("關卡 BOSS 即將入場",0,42);ctx.fillText("關卡 BOSS 即將入場",0,42);
    ctx.restore();
  }
  function drawEncirclementWarning(){
    if(!encirclementPrewarn)return;
    const alpha=.16+Math.max(0,encirclementPressure-.7)*.22;
    const thickness=30;
    ctx.save();
    const topGrad=ctx.createLinearGradient(0,0,0,thickness);
    topGrad.addColorStop(0,`rgba(180,0,24,${alpha})`);
    topGrad.addColorStop(1,"rgba(180,0,24,0)");
    ctx.fillStyle=topGrad;ctx.fillRect(0,0,W,thickness);
    const bottomGrad=ctx.createLinearGradient(0,H,0,H-thickness);
    bottomGrad.addColorStop(0,`rgba(180,0,24,${alpha})`);
    bottomGrad.addColorStop(1,"rgba(180,0,24,0)");
    ctx.fillStyle=bottomGrad;ctx.fillRect(0,H-thickness,W,thickness);
    const leftGrad=ctx.createLinearGradient(0,0,thickness,0);
    leftGrad.addColorStop(0,`rgba(180,0,24,${alpha})`);
    leftGrad.addColorStop(1,"rgba(180,0,24,0)");
    ctx.fillStyle=leftGrad;ctx.fillRect(0,0,thickness,H);
    const rightGrad=ctx.createLinearGradient(W,0,W-thickness,0);
    rightGrad.addColorStop(0,`rgba(180,0,24,${alpha})`);
    rightGrad.addColorStop(1,"rgba(180,0,24,0)");
    ctx.fillStyle=rightGrad;ctx.fillRect(W-thickness,0,thickness,H);
    ctx.restore();
  }

  function drawCarrot(s){
    const p=worldToScreen(s.x,s.y);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(s.angle||Math.atan2(s.vy,s.vx));
    if(s.kind==="giant"){
      ctx.scale(2.6,2.6);
      rect(-10,-5,16,10,"#ff8a32");rect(5,-4,8,8,"#d94b25");rect(-15,-8,7,5,"#55aa4f");rect(-15,3,7,5,"#78c55c");rect(-2,-3,5,3,"#ffd069");
    }else{
      rect(-9,-4,14,8,"#f2792f");rect(5,-3,7,6,"#de5127");rect(-13,-6,6,4,"#54a94d");rect(-13,2,6,4,"#76c45b");
    }
    ctx.restore();
  }

  function drawEnemy(e){
    const p=worldToScreen(e.x,e.y),s=e.r/18;
    const snapshot=getEnemySnapshot(e.type);
    if(snapshot){
      ctx.save();
      if(e.hit)ctx.globalAlpha=.55;
      ctx.imageSmoothingEnabled=false;
      const size=96*s;
      ctx.drawImage(snapshot,Math.round(p.x-size/2),Math.round(p.y-size/2),Math.round(size),Math.round(size));
      ctx.restore();
    }else{
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);
      if(e.hit)ctx.globalAlpha=.55;
      if(e.type==="turtle"){
      rect(-15,-10,27,23,"#397d3f");rect(-10,-14,22,22,"#67b551");rect(-5,-9,12,12,"#b0d867");rect(9,-10,11,9,"#ead17c");rect(14,-8,3,3,"#171624");
    }else if(e.type==="mushroom"){
      rect(-12,-2,24,17,"#9a633f");rect(-17,-12,34,16,"#7b4432");rect(-12,-9,7,6,"#e6b16e");rect(5,-9,7,6,"#e6b16e");rect(-7,3,4,5,"#171624");rect(4,3,4,5,"#171624");
    }else if(e.type==="bombcloud"){
      rect(-17,-7,34,18,"#686d80");rect(-11,-14,22,25,"#858b9c");rect(-8,-4,5,4,"#151525");rect(5,-4,5,4,"#151525");rect(13,-15,12,5,"#333747");rect(23,-17,4,4,"#ffb83e");
    }else if(e.type==="snake"){
      rect(-16,5,8,8,"#a99b35");rect(-9,0,8,9,"#c7b943");rect(-2,-5,8,10,"#a99b35");rect(5,-10,13,13,"#d5c64d");rect(11,-7,3,3,"#231c25");rect(17,-3,6,2,"#d6534c");
    }else if(e.type==="scorpion"){
      rect(-9,-18,18,13,"#d8c7a0");rect(-12,-5,24,25,"#cdbb94");
      rect(-15,-2,7,22,"#d8c7a0");rect(8,-2,7,22,"#d8c7a0");
      rect(-10,19,7,12,"#bda77f");rect(3,19,7,12,"#bda77f");
      rect(-13,-15,26,4,"#efe3c4");rect(-12,-7,24,4,"#efe3c4");rect(-13,1,26,4,"#efe3c4");rect(-11,9,22,4,"#efe3c4");rect(-10,17,20,4,"#efe3c4");
      rect(-6,-12,5,2,"#16131c");rect(2,-12,5,2,"#16131c");
      rect(-16,4,7,3,"#efe3c4");rect(9,10,7,3,"#efe3c4");
    }else if(e.type==="mouse"){
      rect(-14,-6,27,16,"#85817a");rect(-18,-9,9,8,"#aaa49a");rect(7,-10,9,8,"#aaa49a");rect(8,-1,4,4,"#211b20");rect(-3,0,5,3,"#f0c2ba");rect(12,5,13,3,"#6f6a64");rect(-9,9,8,4,"#c5b9a8");rect(4,9,8,4,"#c5b9a8");
    }else if(e.type==="vulture"){
      rect(-8,-13,16,26,"#5e4f43");rect(-20,-5,15,8,"#806b56");rect(5,-5,15,8,"#806b56");rect(-6,-17,12,9,"#c7b69f");rect(-3,-15,3,3,"#191624");rect(3,-15,3,3,"#191624");rect(-2,-9,4,8,"#d6a13e");rect(-8,14,5,6,"#6f5130");rect(3,14,5,6,"#6f5130");
    }else if(e.type==="centipede"){
      for(let i=0;i<5;i++){rect(-22+i*9,-5+Math.sin(time*8+i)*2,10,11,i%2?"#a76736":"#c1823f");rect(-20+i*9,6,3,5,"#6b3a26");}
      rect(20,-7,12,14,"#d19a4d");rect(25,-3,3,3,"#211b20");rect(30,-1,6,2,"#d65045");
    }else if(e.type==="stoneface"){
      rect(-17,-18,34,38,"#746b60");rect(-13,-14,26,30,"#948779");rect(-10,-7,7,7,"#241f20");rect(4,-7,7,7,"#241f20");rect(-7,7,14,5,"#443c38");rect(-22,-12,7,28,"#5e574f");rect(15,-12,7,28,"#5e574f");
    }else if(e.type==="penguin"){
      rect(-10,-18,20,36,"#263d52");rect(-7,-10,14,24,"#f2fbff");rect(-5,-15,4,4,"#111827");rect(3,-15,4,4,"#111827");rect(-3,-8,6,4,"#f0a33a");rect(-12,14,8,5,"#f0a33a");rect(4,14,8,5,"#f0a33a");
    }else if(e.type==="snowman"){
      rect(-14,-4,28,25,"#f5fbff");rect(-11,-24,22,22,"#e8f6ff");rect(-5,-18,4,4,"#111827");rect(4,-18,4,4,"#111827");rect(-2,-12,5,3,"#f08d3c");rect(-12,2,24,3,"#9fd5f0");
    }else if(e.type==="polarbear"){
      rect(-18,-10,34,24,"#e7f1f3");rect(-12,-20,24,18,"#f7ffff");rect(-15,-24,8,8,"#e7f1f3");rect(7,-24,8,8,"#e7f1f3");rect(-6,-14,4,4,"#111827");rect(4,-14,4,4,"#111827");rect(-3,-8,7,4,"#2b3340");
    }else if(e.type==="seal"){
      rect(-18,-8,36,20,"#91aebe");rect(8,-15,16,17,"#b7d2de");rect(14,-10,4,4,"#111827");rect(20,-5,7,3,"#dff8ff");rect(-24,2,12,5,"#7d9dab");
    }else if(e.type==="whale"){
      rect(-28,-15,56,30,"#568caa");rect(-36,-8,14,13,"#7db5cf");rect(16,-24,16,14,"#7db5cf");rect(15,-8,5,5,"#101827");rect(-18,9,34,5,"#d8f6ff");
    }else if(e.type==="skeleton"){
      rect(-10,-18,20,18,"#d8d0c0");rect(-7,-13,5,5,"#111");rect(3,-13,5,5,"#111");rect(-5,-4,10,4,"#111");rect(-8,0,16,20,"#c5bca8");rect(-16,1,7,18,"#c5bca8");rect(9,1,7,18,"#c5bca8");
    }else if(e.type==="wisp"){
      rect(-12,-12,24,24,"#4db6ff");rect(-8,-18,16,12,"#8de6ff");rect(-5,-5,4,5,"#10233a");rect(3,-5,4,5,"#10233a");rect(-10,12,6,10,"#2e7ed8");rect(4,12,6,10,"#2e7ed8");
    }else if(e.type==="bat"){
      rect(-8,-8,16,16,"#4b304e");rect(-25,-7,18,10,"#6d4771");rect(7,-7,18,10,"#6d4771");rect(-5,-11,4,4,"#ff6c7a");rect(2,-11,4,4,"#ff6c7a");
    }else if(e.type==="eyeball"){
      rect(-16,-16,32,32,"#e2d7c8");rect(-9,-9,18,18,"#8e2f45");rect(-4,-4,8,8,"#111");rect(-20,-3,9,3,"#b94155");rect(11,4,9,3,"#b94155");
    }else if(e.type==="imp"){
      rect(-12,-14,24,31,"#aa3348");rect(-18,-22,10,12,"#d1515b");rect(8,-22,10,12,"#d1515b");rect(-5,-9,4,4,"#ffe07a");rect(3,-9,4,4,"#ffe07a");rect(14,-3,18,4,"#d9b66a");rect(28,-8,5,14,"#d9b66a");
    }else if(e.type==="reaper"){
      rect(-18,-22,36,44,"#22101c");rect(-12,-15,24,25,"#331421");rect(-7,-9,5,5,"#ff3e58");rect(3,-9,5,5,"#ff3e58");rect(-24,10,48,6,"#171019");rect(20,-18,5,48,"#8d7b68");rect(18,-23,18,6,"#c8c0b2");
    }else{
      rect(-5,4,10,20,"#47974b");rect(-17,-13,34,26,"#d84d48");rect(-11,-8,22,17,"#f0e6b4");rect(-8,-6,5,5,"#191624");rect(4,-6,5,5,"#191624");rect(-14,-17,8,7,"#f3e8a9");rect(6,-17,8,7,"#f3e8a9");
    }
      ctx.restore();
    }
    if(e.kind!=="normal"){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.scale(s,s);
      ctx.strokeStyle=e.kind==="elite"?"#ffe767":e.kind==="final"?"#ff405d":"#ff875d";
      ctx.lineWidth=3;
      ctx.strokeRect(-22,-22,44,44);
      ctx.restore();
    }
    if(e.kind==="final"){
      const totalW=e.r*2.8,gap=4,barW=(totalW-gap*2)/3,y=p.y-e.r-18;
      for(let i=0;i<3;i++){
        rect(p.x-totalW/2+i*(barW+gap),y,barW,8,"#391d2c");
        let ratio=0;
        if(i<e.bars-1)ratio=1;
        else if(i===e.bars-1)ratio=clamp(e.hp/e.maxHp,0,1);
        rect(p.x-totalW/2+i*(barW+gap),y,barW*ratio,8,i===2?"#ff405d":i===1?"#ff765d":"#ffad5d");
      }
      ctx.fillStyle="#fff";ctx.font="bold 12px monospace";ctx.textAlign="center";
      ctx.fillText(`關卡 BOSS ${e.bars}/3`,p.x,y-15);ctx.textAlign="left";
    }else if(e.kind!=="normal"){
      const w=e.r*2.2;rect(p.x-w/2,p.y-e.r-12,w,5,"#391d2c");rect(p.x-w/2,p.y-e.r-12,w*(e.hp/e.maxHp),5,"#ffd45e");
    }
    if(e.slow>0){
      ctx.globalAlpha=.65;
      ctx.strokeStyle="#77d8ff";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y+e.r*.65,e.r*.75,e.r*.25,0,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
  }

  function drawGem(g){
    const p=worldToScreen(g.x,g.y),colors=["#f07a32","#7fc957","#d54743","#f5d253","#a8da73"];
    const x=p.x,y=p.y;
    rect(x-8,y-8,16,16,"#273c36");
    rect(x-6,y-6,12,12,colors[g.type]);
    rect(x-3,y-10,6,5,"#3f9548");
    rect(x-1,y-12,4,5,"#78d260");
    rect(x-4,y-4,4,4,"#fff4a0");
    if((g.stackCount||1)>1){
      const stackCount=g.stackCount||1;
      const label=gemStackLabel(stackCount);
      ctx.shadowBlur=0;
      ctx.shadowColor="transparent";
      if(stackCount>=50){
        ctx.shadowBlur=14;
        ctx.shadowColor="rgba(255,72,72,.95)";
      }else if(stackCount>=40){
        ctx.shadowBlur=12;
        ctx.shadowColor="rgba(90,255,120,.9)";
      }else if(stackCount>=30){
        ctx.shadowBlur=10;
        ctx.shadowColor="rgba(80,150,255,.9)";
      }
      ctx.fillStyle="#111";
      ctx.font="bold 12px monospace";
      ctx.textAlign="center";
      ctx.fillText(label,x,y+22);
      ctx.shadowBlur=0;
      ctx.shadowColor="transparent";
      ctx.textAlign="left";
    }
  }

  function drawChest(chest){
    const p=worldToScreen(chest.x,chest.y),bob=Math.round(Math.sin(time*3+chest.phase)*3);
    if(chest.opened){
      rect(p.x-21,p.y+3,42,14,"#6f3d27");
      rect(p.x-18,p.y+5,36,9,"#a95d2e");
      rect(p.x-22,p.y+1,44,5,"#f0bd4b");
      return;
    }
    ctx.globalAlpha=.22+.1*Math.sin(time*4+chest.phase);
    ctx.fillStyle="#ffe66b";ctx.beginPath();ctx.arc(p.x,p.y+bob,34,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    rect(p.x-21,p.y-13+bob,42,29,"#6f3d27");
    rect(p.x-18,p.y-10+bob,36,10,"#d18a35");
    rect(p.x-18,p.y+2+bob,36,11,"#a95d2e");
    rect(p.x-3,p.y-2+bob,8,13,"#ffe069");
    rect(p.x-22,p.y-2+bob,44,5,"#f0bd4b");
    rect(p.x-16,p.y-8+bob,12,3,"#ffe58c");
  }

  function drawPickup(pickup){
    const p=worldToScreen(pickup.x,pickup.y),bob=Math.sin(time*5+pickup.phase)*5;
    ctx.globalAlpha=.22+.12*Math.sin(time*7+pickup.phase);
    ctx.fillStyle=pickup.type==="coin"?"#ffe16c":pickup.type==="heal"?"#77ff89":pickup.type==="potion"?"#ff8fc3":"#ff8b55";
    ctx.beginPath();ctx.arc(p.x,p.y+bob,29,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    if(pickup.type==="coin"){
      rect(p.x-13,p.y-13+bob,26,26,"#b77a1d");
      rect(p.x-10,p.y-10+bob,20,20,"#ffd84f");
      rect(p.x-7,p.y-7+bob,14,14,"#fff2a6");
      rect(p.x-3,p.y-6+bob,6,12,"#d8a927");
    }else if(pickup.type==="bomb"){
      rect(p.x-13,p.y-10+bob,26,24,"#d7333f");
      rect(p.x-9,p.y-14+bob,18,30,"#ed4b50");
      rect(p.x+5,p.y-17+bob,11,5,"#79533e");
      rect(p.x+14,p.y-20+bob,5,5,"#ffdf3d");
      rect(p.x-5,p.y-7+bob,6,5,"#ff9890");
    }else if(pickup.type==="potion"){
      rect(p.x-10,p.y-14+bob,20,24,"#ff8fc3");
      rect(p.x-8,p.y-12+bob,16,20,"#ffd3e8");
      rect(p.x-5,p.y-20+bob,10,6,"#7c5c69");
      rect(p.x-6,p.y-5+bob,12,8,"#ff8fc3");
    }else{
      ctx.fillStyle="#e83f58";ctx.beginPath();
      ctx.moveTo(p.x,p.y+14+bob);
      ctx.bezierCurveTo(p.x-25,p.y-2+bob,p.x-14,p.y-19+bob,p.x,p.y-8+bob);
      ctx.bezierCurveTo(p.x+14,p.y-19+bob,p.x+25,p.y-2+bob,p.x,p.y+14+bob);
      ctx.fill();
      rect(p.x-3,p.y-10+bob,6,18,"#fff");
      rect(p.x-9,p.y-4+bob,18,6,"#fff");
    }
    ctx.fillStyle="#fff";ctx.font="bold 13px monospace";ctx.textAlign="center";
    ctx.fillText(`碰觸拾取 ${Math.max(0,Math.ceil(pickup.life))}s`,p.x,p.y+35+bob);ctx.textAlign="left";
  }

  function drawGroundEffects(){
    for(const e of effects){
      if(e.kind!=="crater")continue;
      const p=worldToScreen(e.x,e.y);
      ctx.globalAlpha=Math.min(1,e.life);
      ctx.strokeStyle="#6d4328";ctx.lineWidth=5;
      ctx.beginPath();ctx.ellipse(p.x,p.y,e.r,e.r*.56,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#5f0f15";
      ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*.98,e.r*.54,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#7d171d";
      ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*.8,e.r*.44,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#912127";
      ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*.62,e.r*.34,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#a93234";
      ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*.44,e.r*.24,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#ff6b5f";
      ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*.23,e.r*.12,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
  }

  function drawBeamWarnings(){
    for(const e of effects){
      if(e.kind!=="beamWarning")continue;
      const p=worldToScreen(e.x,e.y);
      const active=e.delay<=0;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(e.a);
      ctx.globalAlpha=active?clamp(e.life*2,0,1):.35+.25*Math.sin(time*18);
      rect(-80,-e.width/2,1030,e.width,active?e.color:e.line);
      ctx.globalAlpha=1;
      rect(-80,-2,1030,4,active?"#fff0bd":e.line);
      ctx.restore();
    }
  }

  function drawEnemyShot(shot){
    const p=worldToScreen(shot.x,shot.y);
    ctx.globalAlpha=.28;ctx.fillStyle="#ff263f";ctx.beginPath();ctx.arc(p.x,p.y,shot.r+7,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.fillStyle="#d71932";ctx.beginPath();ctx.arc(p.x,p.y,shot.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ff8b76";ctx.beginPath();ctx.arc(p.x-shot.r*.28,p.y-shot.r*.3,Math.max(2,shot.r*.3),0,Math.PI*2);ctx.fill();
  }

  function drawChestHints(){
    for(const chest of chests){
      if(chest.opened||chest.hintLife<=0)continue;
      const p=worldToScreen(chest.x,chest.y);
      if(p.x>=48&&p.x<=W-48&&p.y>=48&&p.y<=H-48)continue;
      const dx=p.x-W/2,dy=p.y-H/2;
      if(Math.hypot(dx,dy)<2)continue;
      const angle=Math.atan2(dy,dx);
      const margin=52;
      const sx=Math.abs(dx)>1?(W/2-margin)/Math.abs(dx):Infinity;
      const sy=Math.abs(dy)>1?(H/2-margin)/Math.abs(dy):Infinity;
      const scale=Math.min(sx,sy);
      const x=W/2+dx*scale,y=H/2+dy*scale;
      const iconX=x-Math.cos(angle)*28,iconY=y-Math.sin(angle)*28;

      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angle);
      ctx.fillStyle="#fff07a";
      ctx.beginPath();
      ctx.moveTo(23,0);
      ctx.lineTo(-5,-14);
      ctx.lineTo(-5,14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha=.28+.12*Math.sin(time*8);
      ctx.fillStyle="#fff07a";ctx.beginPath();ctx.arc(iconX,iconY,25,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      rect(iconX-13,iconY-11,26,21,"#6f3d27");
      rect(iconX-11,iconY-9,22,7,"#d18a35");
      rect(iconX-14,iconY-2,28,5,"#f0bd4b");
      rect(iconX-2,iconY-3,5,10,"#ffe069");
      ctx.fillStyle="#fff";
      ctx.font="bold 14px monospace";
      ctx.textAlign="center";
      ctx.fillText(`${Math.ceil(chest.hintLife)}s`,iconX,iconY+23);
    }
    ctx.textAlign="left";
  }

  function drawTreasureHintIcon(type,iconX,iconY,seconds,arrowX=null,arrowY=null,angle=0){
    ctx.save();
    if(arrowX!==null){
      ctx.translate(arrowX,arrowY);
      ctx.rotate(angle);
      ctx.fillStyle="#fff07a";
      ctx.beginPath();
      ctx.moveTo(23,0);
      ctx.lineTo(-5,-14);
      ctx.lineTo(-5,14);
      ctx.closePath();
      ctx.fill();
      ctx.setTransform(1,0,0,1,0,0);
    }
    const glow=type==="coin"?"#ffe16c":type==="heal"?"#77ff89":type==="potion"?"#ff8fc3":"#ff8b55";
    ctx.globalAlpha=.34+.16*Math.sin(time*8);
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(iconX,iconY,27,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
    if(type==="coin"){
      rect(iconX-13,iconY-13,26,26,"#b77a1d");
      rect(iconX-10,iconY-10,20,20,"#ffd84f");
      rect(iconX-7,iconY-7,14,14,"#fff2a6");
      rect(iconX-3,iconY-6,6,12,"#d8a927");
    }else if(type==="bomb"){
      rect(iconX-13,iconY-10,26,24,"#d7333f");
      rect(iconX-9,iconY-14,18,30,"#ed4b50");
      rect(iconX+5,iconY-17,11,5,"#79533e");
      rect(iconX+14,iconY-20,5,5,"#ffdf3d");
      rect(iconX-5,iconY-7,6,5,"#ff9890");
    }else if(type==="potion"){
      rect(iconX-10,iconY-14,20,24,"#ff8fc3");
      rect(iconX-8,iconY-12,16,20,"#ffd3e8");
      rect(iconX-5,iconY-20,10,6,"#7c5c69");
      rect(iconX-6,iconY-5,12,8,"#ff8fc3");
    }else{
      ctx.fillStyle="#e83f58";
      ctx.beginPath();
      ctx.moveTo(iconX,iconY+14);
      ctx.bezierCurveTo(iconX-25,iconY-2,iconX-14,iconY-19,iconX,iconY-8);
      ctx.bezierCurveTo(iconX+14,iconY-19,iconX+25,iconY-2,iconX,iconY+14);
      ctx.fill();
      rect(iconX-3,iconY-10,6,18,"#fff");
      rect(iconX-9,iconY-4,18,6,"#fff");
    }
    ctx.font="bold 13px monospace";
    ctx.textAlign="center";
    ctx.lineWidth=4;
    ctx.strokeStyle="#111";
    ctx.strokeText(`${seconds}s`,iconX,iconY+25);
    ctx.fillStyle="#fff";
    ctx.fillText(`${seconds}s`,iconX,iconY+25);
    ctx.restore();
  }

  function drawPickupHints(){
    for(const pickup of pickups){
      if(pickup.life<=0)continue;
      const p=worldToScreen(pickup.x,pickup.y);
      const seconds=Math.max(0,Math.ceil(pickup.life));
      const margin=52;
      if(p.x>=48&&p.x<=W-48&&p.y>=48&&p.y<=H-48){
        const iconX=Math.max(margin,Math.min(W-margin,p.x));
        const iconY=Math.max(margin,Math.min(H-margin,p.y-54));
        drawTreasureHintIcon(pickup.type,iconX,iconY,seconds);
        continue;
      }
      const dx=p.x-W/2,dy=p.y-H/2;
      if(Math.hypot(dx,dy)<2)continue;
      const angle=Math.atan2(dy,dx);
      const sx=Math.abs(dx)>1?(W/2-margin)/Math.abs(dx):Infinity;
      const sy=Math.abs(dy)>1?(H/2-margin)/Math.abs(dy):Infinity;
      const scale=Math.min(sx,sy);
      const x=W/2+dx*scale,y=H/2+dy*scale;
      const iconX=x-Math.cos(angle)*28,iconY=y-Math.sin(angle)*28;
      drawTreasureHintIcon(pickup.type,iconX,iconY,seconds,x,y,angle);
    }
    ctx.globalAlpha=1;
    ctx.textAlign="left";
  }

  function drawBunny(){
    const x=W/2,y=H/2,flip=player.facing,flash=player.invuln&&Math.floor(player.invuln*16)%2===0;if(flash)return;
    ctx.save();ctx.translate(x,y);ctx.scale(flip,1);
    rect(-11,-26,7,18,"#fff0cb");rect(4,-28,7,20,"#fff0cb");rect(-9,-23,3,12,"#ef9a91");rect(6,-25,3,14,"#ef9a91");
    rect(-15,-12,29,23,"#fff2d0");rect(10,-3,8,7,"#cf794d");rect(5,-7,4,5,"#17131a");
    // Rear arm behind the striped shirt.
    rect(-17,13,7,20,"#f1ddbd");rect(-18,28,8,8,"#ead2ad");
    rect(-14,10,29,6,"#236a96");rect(-11,16,24,18,"#f3e5c8");rect(-11,18,24,4,"#e84037");rect(-11,26,24,4,"#e84037");
    // Front arm holds a ready carrot.
    rect(10,15,7,20,"#f5e4c4");rect(12,30,9,8,"#ead2ad");
    rect(17,25,15,7,"#f2792f");rect(28,26,7,5,"#d95228");
    rect(15,22,6,4,"#55aa4f");rect(16,30,6,4,"#78c55c");
    rect(-10,34,22,9,"#287cad");rect(-9,42,7,8,"#f1ddbd");rect(5,42,7,8,"#f1ddbd");
    ctx.restore();
  }

  function drawPet(){
    if(skills.peanut){
      const a=time*1.7,p=worldToScreen(player.x+Math.cos(a)*46,player.y+Math.sin(a)*34);
      rect(p.x-9,p.y-12,18,24,"#c98b4f");rect(p.x-7,p.y-9,14,8,"#e1aa67");rect(p.x-5,p.y-2,3,4,"#17131a");rect(p.x+3,p.y-2,3,4,"#17131a");rect(p.x-12,p.y+3,5,10,"#a96d3e");rect(p.x+7,p.y+3,5,10,"#a96d3e");
    }
    if(skills.pinky){
      const a=time*1.45+Math.PI,p=worldToScreen(player.x+Math.cos(a)*58,player.y+Math.sin(a)*40);
      ctx.save();ctx.translate(p.x,p.y);
      // Curled tail behind the body.
      ctx.strokeStyle="#d95c92";ctx.lineWidth=6;ctx.lineCap="square";
      ctx.beginPath();ctx.moveTo(9,8);ctx.lineTo(18,7);ctx.lineTo(21,-2);ctx.lineTo(17,-9);ctx.lineTo(11,-9);ctx.lineTo(9,-4);ctx.lineTo(13,0);ctx.stroke();
      rect(-9,5,18,18,"#f58fba");rect(-13,-12,26,24,"#f58fba");rect(-10,-10,7,5,"#ffc4da");
      rect(-17,-7,6,10,"#f2b693");rect(11,-7,6,10,"#f2b693");
      // Two rounded lobes make the pale face read as a heart.
      rect(-8,-7,8,11,"#ffd9c8");rect(0,-7,8,11,"#ffd9c8");rect(-6,3,12,5,"#ffd9c8");
      rect(-5,-2,3,4,"#251b20");rect(3,-2,3,4,"#251b20");
      rect(-1,2,3,2,"#6d2948");rect(-4,6,3,2,"#ffd9c8");rect(2,6,3,2,"#ffd9c8");
      rect(-13,21,7,5,"#f2b693");rect(6,21,7,5,"#f2b693");
      ctx.restore();
    }
  }

  function drawBanana(b){
    const p=worldToScreen(b.x,b.y);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(b.spin);
    ctx.strokeStyle="#ffe04f";ctx.lineWidth=Math.max(5,b.r*.72);ctx.lineCap="square";
    ctx.beginPath();ctx.arc(0,0,b.r*.85,.25,Math.PI*1.35);ctx.stroke();
    rect(-b.r*.9,-b.r*.45,3,4,"#7b5424");rect(b.r*.55,b.r*.45,3,4,"#7b5424");
    ctx.restore();
  }

  function drawFlower(x,y,size,alpha){
    ctx.globalAlpha=alpha;
    ctx.fillStyle="#fffdf1";
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      ctx.beginPath();
      ctx.arc(x+Math.cos(a)*size*.62,y+Math.sin(a)*size*.62,size*.48,0,Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle="#ffd83d";
    ctx.beginPath();ctx.arc(x,y,size*.46,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff19a";
    ctx.beginPath();ctx.arc(x-size*.12,y-size*.12,size*.15,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }

  function activeStatusRows(){
    const rows=[];
    if(pinkyBoostTimer>0)rows.push([`香蕉增益 ${pinkyBoostTimer.toFixed(1)}s`,"#ffef72"]);
    if(poisonTimer>0)rows.push([`中毒 ${poisonTimer.toFixed(1)}s`,"#9cff68"]);
    if(stunTimer>0)rows.push([`暈眩 ${stunTimer.toFixed(1)}s`,"#ffd15e"]);
    if(killSurgeActive)rows.push(["狂暴怪潮 +75%","#ff6978"]);
    if(encirclementDebts.length&&encirclementReservedHp>0)rows.push([`包圍壓力 ${encirclementTierLabel(encirclementCharge)} ${encirclementDebtMaxTime().toFixed(1)}s ×${encirclementDebts.length} R${encirclementPressureRounds}`,"#a10f24"]);
    return rows;
  }

  function drawStatusRows(x,y,lineHeight){
    const rows=activeStatusRows();
    for(let i=0;i<rows.length;i++){
      const [label,color]=rows[i];
      ctx.fillStyle=color;
      ctx.fillText(label,x,y+i*lineHeight);
    }
    return y+rows.length*lineHeight;
  }

  function drawSkills(){
    if(skills.orbit){
      const n=skills.orbit+1,r=55*player.area,speed=skills.orbit>=5?4.6:1.8+skills.orbit*.1;
      if(skills.orbit>=5){
        const p=worldToScreen(player.x,player.y);
        ctx.save();
        ctx.globalAlpha=.28;
        ctx.strokeStyle="#fff8cf";
        ctx.lineWidth=Math.max(10,24*player.area);
        ctx.beginPath();
        ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.stroke();
        ctx.globalAlpha=.16;
        ctx.strokeStyle="#ffb94e";
        ctx.lineWidth=Math.max(4,10*player.area);
        ctx.beginPath();
        ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }
      for(let i=0;i<n;i++){
        const a=time*speed+i*Math.PI*2/n,x=player.x+Math.cos(a)*r,y=player.y+Math.sin(a)*r;
        drawCarrot({x,y,vx:Math.cos(a),vy:Math.sin(a),angle:a});
        if(skills.orbit>=5){
          const p=worldToScreen(x,y);
          ctx.globalAlpha=.65;ctx.strokeStyle="#fff8cf";ctx.lineWidth=3;
          ctx.beginPath();ctx.arc(W/2,H/2,r,a-.42,a+.05);ctx.stroke();ctx.globalAlpha=1;
        }
      }
    }
    for(const a of areas){
      if(a.delay>0)continue;
      const p=worldToScreen(a.x,a.y);
      const alpha=clamp(a.life*1.8,0,1);
      const flowerCount=a.evolved?18:12;
      const flowerSize=a.evolved?8:6;
      if(a.r<24)drawFlower(p.x,p.y,flowerSize+2,alpha);
      for(let i=0;i<flowerCount;i++){
        const angle=i*Math.PI*2/flowerCount+a.wave*.22;
        drawFlower(
          p.x+Math.cos(angle)*a.r,
          p.y+Math.sin(angle)*a.r,
          flowerSize,
          alpha
        );
      }
    }
  }

  function livingEnemyCount(){
    return enemies.reduce((count,e)=>count+(!e.dead&&e.hp>0?1:0),0);
  }
  function formatHudPercent(value){
    return `${String(Math.max(0,Math.min(100,Math.round(value)))).padStart(3," ")}%`;
  }

  function drawMobileHUD(){
    const enemyCount=hudEnemyCount;
    if(H>W){
      const stageTimeLabel=stageTimerLabel();
      ctx.save();
      rect(12,14,W-24,24,"#3a2435");
      const hpBarWidth=(W-30);
      const reservedRatio=Math.min(1,encirclementReservedHp/player.maxHp);
      const hpRatio=player.hp/player.maxHp;
      rect(15,17,hpBarWidth*hpRatio,18,"#df4b4f");
      if(encirclementReservedHp>0){
        rect(15+hpBarWidth*Math.max(0,hpRatio-reservedRatio),17,hpBarWidth*Math.min(reservedRatio,hpRatio),18,"#6c1424");
      }
      rect(12,42,W-24,22,"#302344");rect(15,45,(W-30)*(player.xp/player.nextXp),16,"#6ed7df");
      rect(12,66,W-24,8,"#2c2040");rect(15,68,(W-30)*encirclementPressure,4,"#de79ff");rect(15,68,(W-30)*(encirclementCharge/100),4,"#8f33bd");
      ctx.textBaseline="middle";ctx.font="bold 15px monospace";ctx.lineWidth=4;ctx.strokeStyle="#111";ctx.fillStyle="#fff";
      ctx.strokeText(`HP ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`,22,26);ctx.fillText(`HP ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`,22,26);
      ctx.strokeText(`LV ${player.level}  EXP ${Math.floor(player.xp)} / ${player.nextXp}`,22,53);ctx.fillText(`LV ${player.level}  EXP ${Math.floor(player.xp)} / ${player.nextXp}`,22,53);
      ctx.font="bold 18px monospace";ctx.lineWidth=1;ctx.strokeStyle="#000";ctx.fillStyle=isInfiniteMode()?"#d8f6ff":"#fff4b2";ctx.strokeText(stageTimeLabel,14,101);ctx.fillText(stageTimeLabel,14,101);
      ctx.textAlign="right";ctx.font="bold 15px monospace";ctx.fillStyle="#ffe16c";
      ctx.fillText(`💎 ${formatCommaNumber(runCoins)}`,W-14,100);
      ctx.fillStyle="#fff";
      ctx.fillText(`擊倒 ${hudKills}`,W-14,124);
      ctx.fillStyle=kpsPressure>0?"#ffe15b":"#d8f2ff";
      ctx.fillText(`KPS ${Math.round(hudKps)}  怪物 ${enemyCount}`,W-14,148);
      ctx.fillStyle="#fff";
      ctx.fillText(`🥕×${player.projectiles} 穿透${player.pierce} 爆擊${formatHudPercent(player.critStack*100)}`,W-14,172);
      ctx.fillText(`旋風${skills.orbit} 菜園${skills.burst} 花生${skills.peanut} PINKY${skills.pinky}`,W-14,196);
      drawStatusRows(W-14,220,24);
      if(time<4||battleStartDelay>0){ctx.textAlign="center";ctx.font="bold 18px sans-serif";ctx.fillStyle="#fff";ctx.fillText("按住畫面拖曳移動",W/2,H-42);}
      ctx.restore();
      return;
    }
    const scale=1.22,VW=W/scale,VH=H/scale,barWidth=218;
    ctx.save();ctx.scale(scale,scale);
    rect(14,14,barWidth,21,"#3a2435");
    const innerHpWidth=barWidth-4;
    const reservedRatio=Math.min(1,encirclementReservedHp/player.maxHp);
    const hpRatio=player.hp/player.maxHp;
    rect(16,16,innerHpWidth*hpRatio,17,"#df4b4f");
    if(encirclementReservedHp>0){
      rect(16+innerHpWidth*Math.max(0,hpRatio-reservedRatio),16,innerHpWidth*Math.min(reservedRatio,hpRatio),17,"#6c1424");
    }
    rect(14,39,barWidth,19,"#302344");rect(16,41,(barWidth-4)*(player.xp/player.nextXp),15,"#6ed7df");
    rect(14,59,barWidth,7,"#2c2040");rect(16,61,(barWidth-4)*encirclementPressure,3,"#de79ff");rect(16,61,(barWidth-4)*(encirclementCharge/100),3,"#8f33bd");
    ctx.textBaseline="middle";ctx.font="bold 14px monospace";ctx.lineWidth=4;ctx.strokeStyle="#111";ctx.fillStyle="#fff";
    ctx.strokeText(`HP ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`,23,24);ctx.fillText(`HP ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`,23,24);
    ctx.strokeText(`LV ${player.level}  EXP ${Math.floor(player.xp)} / ${player.nextXp}`,23,49);ctx.fillText(`LV ${player.level}  EXP ${Math.floor(player.xp)} / ${player.nextXp}`,23,49);
    ctx.font="bold 15px monospace";ctx.fillStyle="#ffe16c";ctx.fillText(`💎 ${formatCommaNumber(runCoins)}`,14,88);
    ctx.fillStyle="#fff";ctx.fillText(`擊倒 ${hudKills}  KPS ${Math.round(hudKps)}  怪物 ${enemyCount}`,14,108);
    const stageTimeLabel=stageTimerLabel();
    ctx.textAlign="center";ctx.font="bold 25px monospace";ctx.lineWidth=1;ctx.strokeStyle="#000";ctx.fillStyle=isInfiniteMode()?"#d8f6ff":time>=480?"#ff6270":"#fff4b2";
    ctx.strokeText(stageTimeLabel,VW/2,22);
    ctx.fillText(stageTimeLabel,VW/2,22);
    ctx.textAlign="right";ctx.font="bold 13px monospace";ctx.fillStyle="#fff";
    ctx.fillText(`🥕×${player.projectiles} 穿透${player.pierce} 爆擊${formatHudPercent(player.critStack*100)}`,VW-14,21);
    ctx.fillText(`旋風${skills.orbit} 菜園${skills.burst} 花生${skills.peanut}`,VW-14,43);
    const nextStatusY=drawStatusRows(VW-14,95,20);
    if(instantKills>0&&instantKillTimer>0){
      ctx.font="bold 20px sans-serif";ctx.fillStyle="#ffe45f";ctx.strokeStyle="#7b2035";ctx.lineWidth=5;
      const comboY=Math.max(94,nextStatusY+12);
      ctx.strokeText(`瞬間擊倒 ×${instantKills}`,VW-16,comboY);ctx.fillText(`瞬間擊倒 ×${instantKills}`,VW-16,comboY);
    }
    if(time<4||battleStartDelay>0){ctx.textAlign="center";ctx.font="bold 17px sans-serif";ctx.fillStyle="#fff";ctx.fillText("按住任意位置拖曳移動，武器自動攻擊",VW/2,VH-28);}
    ctx.restore();
  }

  function drawHUD(){
    const enemyCount=hudEnemyCount;
    if(H>W||matchMedia("(pointer:coarse)").matches||innerWidth<=620){drawMobileHUD();return;}
    rect(18,18,260,20,"#3a2435");
    const reservedRatio=Math.min(1,encirclementReservedHp/player.maxHp);
    const hpRatio=player.hp/player.maxHp;
    rect(20,20,256*hpRatio,16,"#df4b4f");
    if(encirclementReservedHp>0){
      rect(20+256*Math.max(0,hpRatio-reservedRatio),20,256*Math.min(reservedRatio,hpRatio),16,"#6c1424");
    }
    rect(18,43,260,18,"#302344");rect(20,45,256*(player.xp/player.nextXp),14,"#6ed7df");
    rect(18,63,260,7,"#2c2040");rect(20,65,256*encirclementPressure,3,"#de79ff");rect(20,65,256*(encirclementCharge/100),3,"#8f33bd");
    ctx.save();
    ctx.textBaseline="middle";ctx.font="bold 14px monospace";ctx.lineWidth=4;ctx.strokeStyle="#111";ctx.fillStyle="#fff";
    ctx.strokeText(`HP ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`,28,28);
    ctx.fillText(`HP ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`,28,28);
    ctx.strokeText(`LV ${player.level}  EXP ${Math.floor(player.xp)} / ${player.nextXp}`,28,52);
    ctx.fillText(`LV ${player.level}  EXP ${Math.floor(player.xp)} / ${player.nextXp}`,28,52);
    ctx.restore();
    ctx.font="bold 16px monospace";ctx.fillStyle="#ffe16c";ctx.fillText(`💎 ${formatCommaNumber(runCoins)}`,18,92);
    ctx.fillStyle="#fff";ctx.fillText(`擊倒 ${hudKills}  KPS ${Math.round(hudKps)}  怪物 ${enemyCount}`,18,116);
    if(hudKills<200){ctx.font="bold 12px monospace";ctx.fillStyle="#bff58a";ctx.fillText(`前期經驗減免 ${Math.round((1-(.45+.55*hudKills/200))*100)}%`,18,138);}
    if(killSurgeActive){ctx.font="bold 13px monospace";ctx.fillStyle="#ff6978";ctx.fillText("狂暴怪潮：數量+75%・生命+60%",18,159);}
    const remain=isInfiniteMode()?Math.max(0,600-infiniteDisplayedTime()%600):Math.max(0,DURATION-time),m=Math.floor(remain/60),s=Math.floor(remain%60);
    const stageTimeLabel=stageTimerLabel();
    ctx.font="bold 28px monospace";ctx.textAlign="center";ctx.lineWidth=1;ctx.strokeStyle="#000";ctx.fillStyle=isInfiniteMode()?"#d8f6ff":time>=480?"#ff6270":"#fff4b2";
    ctx.strokeText(stageTimeLabel,W/2,22);ctx.fillText(stageTimeLabel,W/2,22);ctx.textAlign="left";
    ctx.font="bold 14px monospace";ctx.fillStyle="#fff";ctx.fillText(`🥕×${player.projectiles}  穿透${player.pierce}  爆擊${Math.round(player.crit*100)}→${Math.round(player.critStack*100)}%`,W-315,24);
    const evolved=[];
    if(player.projectiles>=6)evolved.push("巨蘿蔔");
    if(skills.orbit>=5)evolved.push("旋風進化");
    if(skills.burst>=5)evolved.push("菜園進化");
    if(skills.peanut>=5)evolved.push("滾石進化");
    if(skills.pinky>=5)evolved.push("PINKY進化");
    ctx.fillText(`旋風${skills.orbit} 菜園${skills.burst} 花生${skills.peanut} PINKY${skills.pinky}`,W-350,47);
    if(evolved.length){ctx.fillStyle="#ffe15b";ctx.fillText(`進化：${evolved.join("・")}`,W-310,68);}
    ctx.textAlign="right";
    ctx.font="bold 14px monospace";
    const statusStartY=evolved.length?126:102;
    const nextStatusY=drawStatusRows(W-24,statusStartY,20);
    if(instantKills>0&&instantKillTimer>0){
      ctx.font="bold 22px sans-serif";
      ctx.fillStyle="#ffe45f";
      ctx.strokeStyle="#7b2035";
      ctx.lineWidth=5;
      const comboY=Math.max(104,nextStatusY+14);
      ctx.strokeText(`瞬間擊倒 ×${instantKills}`,W-26,comboY);
      ctx.fillText(`瞬間擊倒 ×${instantKills}`,W-26,comboY);
    }
    ctx.textAlign="left";
    if(time<4){ctx.textAlign="center";ctx.font="bold 20px sans-serif";ctx.fillStyle="#fff";ctx.fillText("WASD / 方向鍵移動，武器自動攻擊",W/2,H-34);ctx.textAlign="left";}
  }

  function debugColor(value,warn,danger,invert=false){
    if(invert){
      if(value<=warn)return "#7eff8f";
      if(value<=danger)return "#ffe57a";
      return "#ff6d78";
    }
    if(value>=danger)return "#ff6d78";
    if(value>=warn)return "#ffe57a";
    return "#7eff8f";
  }

  function drawDebugOverlay(){
    if(!debugOverlayEnabled||!running)return;
    const heapSupported=!!(performance&&performance.memory&&performance.memory.usedJSHeapSize);
    const heapText=heapSupported?`${debugHeapMb.toFixed(1)} MB`:"N/A";
    const audioRows=audioMonitorRows();
    const perfRows=perfMonitorRows();
    const liveProjectileCount=shots.length+petShots.length+enemyShots.length+bananas.length;
    const liveEnemyCount=livingEnemyCount();
    const rows=debugPanelMode==="audio"
      ?[
        ["總開關",muted?"靜音":"開啟",muted?"#ff6d78":"#7eff8f"],
        ["音訊引擎",audio?audio.state:"未建立",audio&&audio.state==="running"?"#7eff8f":"#ffe57a"],
        ["0.5秒總數",`${audioDebugLast.total}`,debugColor(audioDebugLast.total,18,36)],
        ...audioRows.map(row=>[row.label,`${row.value}`,row.value>0?row.color:"#615a79"]),
        ["XP節流",`45 ms`,"#d7d0ec"],
        ["外部載入",`${Object.values(externalAudio).filter(entry=>entry.ok===true).length}/${Object.keys(externalAudioDefs).length}`,"#d7d0ec"]
      ]
      :[
        ["2秒平均FPS",`${perfDebugLast.fps.toFixed(1)}`,debugColor(perfDebugLast.fps,55,40,true)],
        ["2秒平均Frame",`${perfDebugLast.frameMs.toFixed(1)} ms`,debugColor(perfDebugLast.frameMs,18,28)],
        ["2秒最高Frame",`${perfDebugLast.peak.toFixed(1)} ms`,debugColor(perfDebugLast.peak,24,40)],
        ...perfRows.map(row=>[row.label,`${row.value}`,row.color]),
        ["壓力",`${Math.round(encirclementPressure*100)}%`,debugColor(encirclementPressure*100,45,75)],
        ["深紫",`${Math.round(encirclementCharge)}%`,debugColor(encirclementCharge,45,75)],
        ["取樣",`${Math.max(0,currentEncirclementSampleDuration()-encirclementSampleClock).toFixed(1)}s / R${encirclementPressureRounds}`,"#d7d0ec"],
        ["KPS",`${kps.toFixed(1)}`,debugColor(kps,10,25)],
        ["怪物",`${liveEnemyCount}`,debugColor(liveEnemyCount,120,180)],
        ["格網格數",`${enemyGrid.size}`,"#d7d0ec"],
        ["地板格數",`${currentGroundTileCount()}`,"#d7d0ec"],
        ["經驗球數",`${gems.length}`,debugColor(gems.length,120,220)],
        ["特效數",`${effects.length}`,debugColor(effects.length,100,180)],
        ["文字數",`${texts.length}`,debugColor(texts.length,30,60)],
        ["射彈數",`${liveProjectileCount}`,debugColor(liveProjectileCount,60,120)],
        ["Heap",heapText,heapSupported?debugColor(debugHeapMb,80,140):"#d7d0ec"]
      ];
    const x=12,y=182,rowH=18,w=170,h=rows.length*rowH+18;
    ctx.save();
    ctx.globalAlpha=.88;
    rect(x,y,w,h,"#0f1024");
    ctx.globalAlpha=1;
    ctx.strokeStyle="#7b67a7";
    ctx.lineWidth=2;
    ctx.strokeRect(x+.5,y+.5,w-1,h-1);
    ctx.fillStyle="#b8f1ff";
    ctx.font="bold 13px monospace";
    ctx.fillText(debugPanelMode==="audio"?"音效監控":"效能監控",x+10,y+16);
    ctx.font="bold 12px monospace";
    for(let i=0;i<rows.length;i++){
      const [label,value,color]=rows[i];
      const py=y+34+i*rowH;
      ctx.fillStyle="#f4efff";
      ctx.fillText(label,x+10,py);
      ctx.textAlign="right";
      ctx.fillStyle=color;
      ctx.fillText(value,x+w-10,py);
      ctx.textAlign="left";
    }
    ctx.restore();
  }

  function drawFinalBossBar(){
    const boss=enemies.find(e=>e.kind==="final"&&!e.dead);
    if(!boss)return;
    const width=Math.min(620,W*(H>W?.88:.58)),x=(W-width)/2,y=H>W?178:48,gap=6,barW=(width-gap*2)/3;
    ctx.textAlign="center";ctx.font="bold 17px sans-serif";ctx.fillStyle="#fff4c7";
    ctx.fillText(`${isInfiniteMode()?"擂台 BOSS":"關卡 BOSS"}　剩餘 ${boss.bars} / 3 條血`,W/2,y-7);
    for(let i=0;i<3;i++){
      const bx=x+i*(barW+gap);
      rect(bx,y,barW,18,"#321827");
      let ratio=0;
      if(i<boss.bars-1)ratio=1;
      else if(i===boss.bars-1)ratio=clamp(boss.hp/boss.maxHp,0,1);
      rect(bx+2,y+2,(barW-4)*ratio,14,i===2?"#ef3153":i===1?"#ff6b50":"#ffad48");
      ctx.strokeStyle="#ffe9ad";ctx.lineWidth=2;ctx.strokeRect(Math.round(bx)+.5,y+.5,Math.round(barW)-1,17);
    }
    ctx.textAlign="left";
  }

  function draw(){
    countPerfWork("enemyDraw",enemies.length);
    countPerfWork("projectileDraw",shots.length+petShots.length+enemyShots.length+bananas.length);
    countPerfWork("effectDraw",effects.length);
    countPerfWork("textDraw",texts.length);
    drawGround();drawBossArena();drawGroundEffects();drawBeamWarnings();for(const g of gems)drawGem(g);for(const chest of chests)drawChest(chest);for(const pickup of pickups)drawPickup(pickup);drawSkills();
    for(const e of enemies)drawEnemy(e);
    for(const s of shots)drawCarrot(s);
    for(const s of petShots){
      const p=worldToScreen(s.x,s.y);
      if(s.kind==="rolling"){
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(time*8);
        rect(-s.r,-s.r,s.r*2,s.r*2,"#655a50");rect(-s.r+4,-s.r+3,s.r,6,"#a08c77");rect(1,1,8,7,"#3f3a36");
        ctx.restore();
      }else{
        rect(p.x-s.r,p.y-s.r,s.r*2,s.r*2,"#756052");rect(p.x-3,p.y-4,5,4,"#b09b82");
      }
    }
    for(const b of bananas)drawBanana(b);
    for(const shot of enemyShots)drawEnemyShot(shot);
    for(const e of effects){
      if(e.kind==="flash"||e.kind==="crater")continue;
      const p=worldToScreen(e.x,e.y);
      if(e.kind==="particle"||e.kind==="chip")rect(p.x,p.y,e.r,e.r,e.color);
      else if(e.kind==="pinkyLine"){ctx.globalAlpha=clamp(e.life*2,0,1);rect(p.x-1,p.y-e.r*3,3,e.r*6,e.color);ctx.globalAlpha=1;}
      else if(e.kind==="heart"){ctx.globalAlpha=clamp(e.life*2,0,1);rect(p.x-e.r,p.y-e.r,e.r,e.r,e.color);rect(p.x,p.y-e.r,e.r,e.r,e.color);rect(p.x-e.r*.5,p.y,e.r,e.r,e.color);ctx.globalAlpha=1;}
      else if(e.kind==="bossRock"){
        if(e.delay>0){
          ctx.globalAlpha=.28+.18*Math.sin(time*14);ctx.fillStyle="#d72f3f";ctx.beginPath();ctx.arc(p.x,p.y,e.r,0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=1;ctx.strokeStyle="#ffbf67";ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,e.r,0,Math.PI*2);ctx.stroke();
        }else{
          rect(p.x-e.r*.6,p.y-e.r*.6,e.r*1.2,e.r*1.2,"#75695c");rect(p.x-e.r*.35,p.y-e.r*.35,e.r*.55,e.r*.4,"#a18f7b");
        }
      }
      else if(e.kind==="rockFragment"){
        const shadowScale=clamp(1-e.z/90,.25,1);
        ctx.globalAlpha=.28;ctx.fillStyle="#2f2925";ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*shadowScale,e.r*.45*shadowScale,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;rect(p.x-e.r,p.y-e.z-e.r,e.r*2,e.r*2,"#756252");rect(p.x-e.r*.4,p.y-e.z-e.r*.6,e.r*.7,e.r*.55,"#b49a7c");
      }else if(e.kind==="shockwave"){
        ctx.globalAlpha=clamp(e.life*2,0,1);ctx.strokeStyle="#ffd36a";ctx.lineWidth=9;ctx.beginPath();ctx.arc(p.x,p.y,e.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      }else if(e.kind==="slash"){
        ctx.globalAlpha=clamp(e.life*5,0,1);ctx.strokeStyle="#fffbe1";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x-e.r,p.y+e.r);ctx.lineTo(p.x+e.r,p.y-e.r);ctx.stroke();ctx.globalAlpha=1;
      }else if(e.kind==="half"){
        ctx.globalAlpha=clamp(e.life*2,0,1);rect(p.x+(e.side<0?-e.r:0),p.y-e.r/2,e.r,e.r,e.color);ctx.globalAlpha=1;
      }
    }
    drawPet();drawBunny();
    for(const t of texts){
      const p=worldToScreen(t.x,t.y);
      if(t.kind==="critical"){
        drawCriticalText(t,p);
      }else{
        ctx.globalAlpha=clamp(t.life*2,0,1);ctx.font=`bold ${t.size}px sans-serif`;ctx.textAlign="center";
        if(t.kind==="pickup"){ctx.lineWidth=Math.max(4,Math.round(t.size*.18));ctx.strokeStyle="#111";ctx.strokeText(t.value,p.x,p.y);}
        ctx.fillStyle=t.color;ctx.fillText(t.value,p.x,p.y);
      }
    }
    ctx.globalAlpha=1;ctx.textAlign="left";ctx.textBaseline="alphabetic";
    drawHUD();
    drawDebugOverlay();
    drawFinalBossBar();
    drawChestHints();
    drawPickupHints();
    drawAnnouncement();
    drawBossWarning();
    drawEncirclementWarning();
    const flash=effects.find(e=>e.kind==="flash");
    if(flash){ctx.globalAlpha=clamp(flash.life*2.5,0,.7);rect(0,0,W,H,"#fff1b0");ctx.globalAlpha=1;}
  }

  function awardRun(success){
    if(runRewarded)return 0;
    runRewarded=true;
    const normalKills=Math.max(0,kills-eliteKills-bossKills);
    const baseEarned=Math.floor(normalKills/25)+eliteKills*3+bossKills*10+(success?25:0)+Math.floor(time/60)*3;
    settleRunCoins();
    if(isInfiniteMode()){
      const earned=Math.floor(baseEarned*.3);
      meta.points+=earned;
      meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
      meta.infiniteTotalKills=(meta.infiniteTotalKills||0)+kills;
      saveMeta();
      return earned;
    }
    const earned=baseEarned;
    meta.points+=earned;
    meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
    meta.totalKills+=kills;
    meta.totalElites+=eliteKills;
    meta.totalBosses+=bossKills;
    saveMeta();
    return earned;
  }

  function recordDeathRunStats(){
    settleRunCoins();
    meta.totalDeaths=(meta.totalDeaths||0)+1;
    meta.totalDeathKills=(meta.totalDeathKills||0)+Math.max(0,kills);
    if(isInfiniteMode()){
      meta.bestInfiniteSeconds=Math.max(meta.bestInfiniteSeconds||0,Math.floor(time));
    }
    saveMeta();
  }

  function win(){
    if(ended)return;
    ended=true;running=false;
    pauseBtn.classList.remove("visible");pauseScreen.classList.add("hidden");
    updateMonitorButtons();
    const earned=awardRun(true);
    if(currentStage===1)meta.stage1Cleared=true;
    if(currentStage===2)meta.stage2Cleared=true;
    if(currentStage===3)meta.stage3Cleared=true;
    if(currentStage===1&&!meta.desertUnlocked)meta.desertUnlocked=true;
    if(currentStage===2&&!meta.snowUnlocked)meta.snowUnlocked=true;
    saveMeta();
    renderMeta();
    endScreen.classList.remove("hidden");
    document.getElementById("endTitle").textContent=currentStage===3?"雪原深處征服成功！":currentStage===2?"沙漠遺跡征服成功！":"菜園守護成功！";
    document.getElementById("endSub").textContent=currentStage===3?"兔兔擊敗了暴雪鯨魚":currentStage===2?"兔兔擊敗了遠古石面怪":"兔兔擊敗了最終魔王";
    document.getElementById("endText").innerHTML=`等級 ${player.level}<br>擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>本局獲得強化點數 ${earned}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>目前共 ${meta.points} 點`;
    beep(660,.4,.05);
  }

  function lose(){
    if(ended)return;
    ended=true;running=false;
    pauseBtn.classList.remove("visible");pauseScreen.classList.add("hidden");
    updateMonitorButtons();
    const earned=awardRun(false);
    recordDeathRunStats();
    renderMeta();
    endScreen.classList.remove("hidden");
    document.getElementById("endTitle").textContent="兔兔倒下了";
    document.getElementById("endSub").textContent=`生存 ${Math.floor(time/60)} 分 ${Math.floor(time%60)} 秒`;
    document.getElementById("endText").innerHTML=`擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>本局獲得強化點數 ${earned}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>死亡總擊破 ${meta.totalDeathKills}・死亡次數 ${meta.totalDeaths}<br>目前共 ${meta.points} 點`;
    beep(180,.7,.05,"sawtooth");
  }

  function leaveStage(){
    if(ended||!running||transitioning)return;
    ended=true;running=false;paused=false;resetStick();
    pauseBtn.classList.remove("visible");pauseScreen.classList.add("hidden");levelScreen.classList.add("hidden");
    updateMonitorButtons();
    let earned=0;
    if(!runRewarded){
      runRewarded=true;
      settleRunCoins();
      earned=isInfiniteMode()?infiniteStagePointReward():Math.floor(time/60)*3;
      meta.points+=earned;
      meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
      saveMeta();
    }
    renderMeta();
    endScreen.classList.remove("hidden");
    document.getElementById("endTitle").textContent="已離開關卡";
    document.getElementById("endSub").textContent=`生存 ${Math.floor(time/60)} 分 ${Math.floor(time%60)} 秒`;
    document.getElementById("endText").innerHTML=isInfiniteMode()
      ?`擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>本局獲得強化點數 ${earned}（已扣除 70%）<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>目前共 ${meta.points} 點`
      :`中途離開不計完整擊殺點數<br>生存點數 ${earned}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>目前共 ${meta.points} 點`;
    beep(220,.22,.035,"square");
  }

  function loop(now){const dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop);}
  function setKey(k,v){keys[k]=v;}
  const touch=document.getElementById("touch"),touchKnob=document.getElementById("touchKnob"),touchHint=document.getElementById("touchHint");
  const pauseBtn=document.getElementById("pauseBtn"),resumeBtn=document.getElementById("resumeBtn"),leaveStageBtn=document.getElementById("leaveStageBtn"),muteBtn=document.getElementById("muteBtn"),reloadAudioBtn=document.getElementById("reloadAudioBtn");
  const devTestBtn=document.getElementById("devTestBtn");
  const monitorTabs=document.getElementById("monitorTabs"),perfMonitorBtn=document.getElementById("perfMonitorBtn"),audioMonitorBtn=document.getElementById("audioMonitorBtn");
  const leaveConfirm=document.getElementById("leaveConfirm"),cancelLeaveBtn=document.getElementById("cancelLeaveBtn"),confirmLeaveBtn=document.getElementById("confirmLeaveBtn");
  const characterBtn=document.getElementById("characterBtn"),adventureBookBtn=document.getElementById("adventureBookBtn"),shopBtn=document.getElementById("shopBtn"),closeCharacter=document.getElementById("closeCharacter"),closeAdventureBook=document.getElementById("closeAdventureBook"),closeShop=document.getElementById("closeShop");
  const chooseStageBtn=document.getElementById("chooseStageBtn"),closeStage=document.getElementById("closeStage"),closeRewards=document.getElementById("closeRewards");
  const gardenStage=document.getElementById("gardenStageModal"),desertStage=document.getElementById("desertStageModal"),snowStage=document.getElementById("snowStageModal"),infiniteStage=document.getElementById("infiniteStageModal");
  function updateMuteButton(){
    muteBtn.classList.toggle("muted",muted);
    muteBtn.innerHTML=`<span class="systemSoundIcon" aria-hidden="true">${muted?"🔇":"🔊"}</span>`;
    muteBtn.setAttribute("aria-label",muted?"開啟音效":"關閉音效");
    muteBtn.title=muted?"開啟音效":"關閉音效";
  }
  function positionMonitorTabs(){
    const canvasRect=canvas.getBoundingClientRect();
    const wrapRect=wrap.getBoundingClientRect();
    const panelLeft=canvasRect.left-wrapRect.left+12;
    const panelTop=canvasRect.top-wrapRect.top+92;
    monitorTabs.style.left=`${Math.round(panelLeft)}px`;
    monitorTabs.style.top=`${Math.round(panelTop)}px`;
    testModeOverlay.style.left=`${Math.round(panelLeft)}px`;
    testModeOverlay.style.top=`${Math.round(panelTop+48)}px`;
  }
  function updateMonitorButtons(){
    const gameplayVisible=
      running &&
      intro.classList.contains("hidden") &&
      levelScreen.classList.contains("hidden") &&
      pauseScreen.classList.contains("hidden") &&
      endScreen.classList.contains("hidden") &&
      rewardScreen.classList.contains("hidden") &&
      stageScreen.classList.contains("hidden") &&
      characterScreen.classList.contains("hidden") &&
      shopScreen.classList.contains("hidden");
    const visible=debugOverlayEnabled&&gameplayVisible;
    monitorTabs.classList.toggle("visible",visible);
    devTestBtn.classList.toggle("hidden",!devModeActive);
    perfMonitorBtn.classList.toggle("active",debugPanelMode==="perf");
    audioMonitorBtn.classList.toggle("active",debugPanelMode==="audio");
    if(!visible)closeTestModeOverlay();
    if(visible)positionMonitorTabs();
  }
  function toggleMute(){
    muted=!muted;meta.muted=muted;saveMeta();updateMuteButton();
    if(!muted){initAudio();beep(620,.08,.025);}
  }
  function renderPauseStats(){
    const baseCarrotDamage=player.damage*player.areaDamage*(pinkyBoostTimer>0?pinkyDamageBoost:1);
    const critMaxDamage=baseCarrotDamage*player.critDamage*1.1;
    const totalCarrotDamageText=`${Math.round(baseCarrotDamage)} ~ ${Math.round(critMaxDamage)}`;
    const baseCritDamagePercent=Math.round(baseMetaCritDamageMultiplier(meta.critDamage)*100);
    const bonusCritDamagePercent=Math.max(0,Math.round(player.critDamage*100-baseCritDamagePercent));
    const boostedFlatRegen=player.regenFlat*player.regenBoost;
    const hpRegenPerSecond=player.maxHp*player.regen;
    const totalRegenPerSecond=boostedFlatRegen+hpRegenPerSecond;
    const baseMaxHp=BASE_META_LIFE+scaledMetaGain(meta.life,META_LIFE_STEP,META_LIFE_TIER_GROWTH);
    const baseDamageValue=BASE_META_DAMAGE+scaledMetaGain(meta.damage,META_DAMAGE_STEP,META_DAMAGE_TIER_GROWTH);
    const baseMoveSpeed=210;
    const baseAttackSpeed=1+meta.speed*.03;
    const baseCritChance=metaCritChance(meta.crit);
    const baseArmorPen=Math.min(MAX_META_ARMOR_PEN,meta.armorPen*.007);
    const lifeBonusPct=Math.max(0,Math.round((player.maxHp/baseMaxHp-1)*100));
    const damageBonusPct=Math.max(0,Math.round((player.damage/baseDamageValue-1)*100));
    const speedBonusPct=Math.max(0,Math.round((player.speed/baseMoveSpeed-1)*100));
    const attackSpeedBonusPct=Math.max(0,Math.round((player.attackSpeed/baseAttackSpeed-1)*100));
    const critBonusPct=Math.max(0,Math.round((player.crit-baseCritChance)*100));
    const armorPenBonusPct=Math.max(0,Math.round((Math.min(.75,player.armorPen)-baseArmorPen)*100));
    const giantCarrotBonusPct=Math.round((12.8-1)*100);
    const withBonus=(value,bonusPct,suffix="%")=>bonusPct>0?`${value}（+${bonusPct}${suffix}）`:String(value);
    const withFieldTotal=(baseValue,bonusPct,totalValue,suffix="",decimals=0)=>{
      const baseText=decimals>0?Number(baseValue).toFixed(decimals):Math.round(baseValue);
      const totalText=decimals>0?Number(totalValue).toFixed(decimals):Math.round(totalValue);
      return bonusPct>0
        ?`${baseText}${suffix} + 場內${bonusPct}%<span class="pauseValueMain">= ${totalText}${suffix}</span>`
        :`${totalText}${suffix}`;
    };
    const withFieldTotalTop=(baseValue,bonusPct,totalValue,suffix="",decimals=0,totalLabel="總值",baseLabel="基礎")=>{
      const baseText=decimals>0?Number(baseValue).toFixed(decimals):Math.round(baseValue);
      const totalText=decimals>0?Number(totalValue).toFixed(decimals):Math.round(totalValue);
      if(bonusPct<=0){
        return `<span class="pauseValueMain">${totalLabel} ${totalText}${suffix}</span><span class="pauseValueSub">${baseLabel} ${baseText}${suffix}</span>`;
      }
      return `<span class="pauseValueMain">${totalLabel} ${totalText}${suffix}</span><span class="pauseValueSub">${baseLabel} ${baseText}${suffix} + 場內${bonusPct}%</span>`;
    };
    const attackSpeedLine=(baseValue,bonusPct,suffix="×",decimals=2)=>{
      const baseText=decimals>0?Number(baseValue).toFixed(decimals):Math.round(baseValue);
      return bonusPct>0?`基礎攻速 ${baseText}${suffix} + 場內${bonusPct}%`:`基礎攻速 ${baseText}${suffix}`;
    };
    const stats=[
      ["攻擊速度",attackSpeedLine(baseAttackSpeed,attackSpeedBonusPct,"×",2)],
      ["等級",player.level],
      ["生命",lifeBonusPct>0?`${Math.ceil(player.hp)} / ${Math.ceil(baseMaxHp)} + 場內${lifeBonusPct}%<span class="pauseValueMain">= ${Math.ceil(player.maxHp)}</span>`:`${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`],
      ["傷害",withFieldTotal(baseDamageValue,damageBonusPct,player.damage,"",1)],
      ["移動速度",withFieldTotal(baseMoveSpeed,speedBonusPct,player.speed,"",0)],
      ["生命回復",player.regen>0?`${boostedFlatRegen.toFixed(2)} + ${hpRegenPerSecond.toFixed(2)} = ${totalRegenPerSecond.toFixed(2)} HP/秒`:`${boostedFlatRegen.toFixed(2)} HP/秒`],
      ["爆擊率",critBonusPct>0?`${Math.round(baseCritChance*100)}% + 場內${critBonusPct}%<span class="pauseValueMain">= ${Math.round(player.crit*100)}%</span>`:`${Math.round(player.crit*100)}%`],
      ["爆擊傷害",bonusCritDamagePercent>0?`${baseCritDamagePercent}% + 場內${bonusCritDamagePercent}%<span class="pauseValueMain">= ${Math.round(player.critDamage*100)}%</span>`:`${Math.round(player.critDamage*100)}%`],
      ["無視防禦",withBonus(`${Math.round(Math.min(.75,player.armorPen)*100)}%`,armorPenBonusPct)],
      ["胡蘿蔔數",player.projectiles],
      ["巨蘿蔔",player.projectiles>=6?`已解鎖・傷害 +${giantCarrotBonusPct}%`:"未解鎖"],
      ["穿透",player.pierce],
      ["吸取範圍",`固定 ${Math.round(player.magnet)} 像素`],
      ["技能範圍",`${player.area.toFixed(2)}×`],
      ["範圍傷害",`${player.areaDamage.toFixed(2)}×`],
      ["胡蘿蔔旋風",`LV ${skills.orbit}`],
      ["胡蘿蔔菜園",`LV ${skills.burst}`],
      ["花生幫手",`LV ${skills.peanut}`],
      ["PINKY",`LV ${skills.pinky}`],
      ["超級頭腦",`LV ${skills.brain}・${Math.round((Math.max(1,player.xpGain)-1)*100)}%`],
      ["香蕉增益",pinkyBoostTimer>0?`${pinkyBoostTimer.toFixed(1)} 秒`:"未啟動"]
      ,["中毒",poisonTimer>0?`${poisonTimer.toFixed(1)} 秒・${(poisonRate*100).toFixed(2)}%/秒`:"無"]
      ,["暈眩",stunTimer>0?`${stunTimer.toFixed(1)} 秒`:"無"]
    ];
    pauseStats.innerHTML=`<div class="pauseStatWide"><b>總攻擊力</b><span>${totalCarrotDamageText}</span></div>`+
      stats.map(([label,value])=>`<div class="pauseStat"><b>${label}</b><span>${value}</span></div>`).join("");
  }
  function pauseGame(){
    if(!running||ended||paused||!levelScreen.classList.contains("hidden"))return;
    paused=true;resetStick();renderPauseStats();
    leaveConfirm.classList.remove("visible");
    leaveStageBtn.classList.remove("hidden");
    pauseScreen.classList.remove("hidden");pauseBtn.classList.remove("visible");
    updateMonitorButtons();
  }
  function resumeGame(){
    if(ended)return;
    leaveConfirm.classList.remove("visible");
    leaveStageBtn.classList.remove("hidden");
    pauseScreen.classList.add("hidden");paused=false;last=performance.now();
    pauseBtn.classList.add("visible");
    updateMonitorButtons();
  }
  function askLeaveStage(){
    const leaveConfirmText=leaveConfirm.querySelector(".leaveConfirmText");
    if(leaveConfirmText){
      leaveConfirmText.innerHTML=isInfiniteMode()
        ?"您確定要中途離開輪迴嗎？<br>將帶走完整鑽石，擊殺點數會扣除 70%。"
        :"您確定要中途離開關卡嗎？<br>將帶走完整鑽石，但不會帶走完整擊殺點數。";
    }
    leaveConfirm.classList.add("visible");
    leaveStageBtn.classList.add("hidden");
    beep(260,.08,.02);
  }
  function resetStick(){
    stick.active=false;stick.pointerId=null;stick.x=stick.y=0;
    touch.classList.remove("active");
    touchKnob.style.transform="translate(-50%,-50%)";
  }
  function moveStick(e){
    const canvasRect=canvas.getBoundingClientRect();
    const wrapRect=wrap.getBoundingClientRect();
    const radius=Math.max(38,Math.min(56,(touch.offsetWidth||138)*.34));
    let dx=e.clientX-stick.startX,dy=e.clientY-stick.startY;
    const distance=Math.hypot(dx,dy);
    if(distance>radius){dx=dx/distance*radius;dy=dy/distance*radius;}
    stick.x=dx/radius;stick.y=dy/radius;
    touchKnob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
    const visualRadius=(touch.offsetWidth||138)/2+5;
    const centerX=clamp(stick.startX,canvasRect.left+visualRadius,canvasRect.right-visualRadius);
    const centerY=clamp(stick.startY,canvasRect.top+visualRadius,canvasRect.bottom-visualRadius);
    touch.style.left=`${centerX-wrapRect.left}px`;
    touch.style.top=`${centerY-wrapRect.top}px`;
  }
  canvas.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"||!running||paused||ended)return;
    e.preventDefault();
    stick.active=true;stick.pointerId=e.pointerId;stick.startX=e.clientX;stick.startY=e.clientY;
    canvas.setPointerCapture(e.pointerId);
    touch.classList.add("active");
    touchHint.style.display="none";
    moveStick(e);
  });
  canvas.addEventListener("pointermove",e=>{
    if(stick.active&&e.pointerId===stick.pointerId){e.preventDefault();moveStick(e);}
  });
  canvas.addEventListener("pointerup",e=>{if(e.pointerId===stick.pointerId)resetStick();});
  canvas.addEventListener("pointercancel",e=>{if(e.pointerId===stick.pointerId)resetStick();});
  for(const eventName of ["selectstart","dragstart","contextmenu"]){
    wrap.addEventListener(eventName,e=>{
      if(running||eventName!=="contextmenu")e.preventDefault();
    });
  }
  let lastTouchEnd=0;
  wrap.addEventListener("touchend",e=>{
    const now=performance.now();
    if(now-lastTouchEnd<380){e.preventDefault();resetStick();}
    lastTouchEnd=now;
  },{passive:false});
  wrap.addEventListener("dblclick",e=>e.preventDefault());
  document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});
  wrap.addEventListener("touchmove",e=>{
    if(e.target.closest(".panelBody,#rewardTrackModal"))return;
    if(running)e.preventDefault();
  },{passive:false});
  const keyMap={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
  addEventListener("keydown",e=>{if(keyMap[e.code]){e.preventDefault();setKey(keyMap[e.code],true);}});
  addEventListener("keyup",e=>{if(keyMap[e.code]){e.preventDefault();setKey(keyMap[e.code],false);}});
  addEventListener("blur",()=>{Object.keys(keys).forEach(k=>keys[k]=false);resetStick();});
  addEventListener("focus",()=>{ensureAudioReady();});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      if(running&&!ended)settleRunCoins();
      saveMeta();
    }
    else{
      ensureAudioReady();
      syncCoinState(true);
      renderMeta();
    }
  });
  addEventListener("pageshow",()=>{ensureAudioReady();syncCoinState(true);renderMeta();});
  addEventListener("pagehide",()=>{
    if(running&&!ended)settleRunCoins();
    saveMeta();
  });
  addEventListener("beforeunload",()=>{
    if(running&&!ended)settleRunCoins();
    saveMeta();
  });
  addEventListener("resize",positionMonitorTabs);
  pauseBtn.addEventListener("click",()=>{if(!running||ended||paused||!levelScreen.classList.contains("hidden"))return;playUiClick();pauseGame();});
  resumeBtn.addEventListener("click",()=>{if(!running||ended||!paused)return;playUiClick();resumeGame();});
  leaveStageBtn.addEventListener("click",()=>{playUiClick();askLeaveStage();});
  cancelLeaveBtn.addEventListener("click",()=>{
    leaveConfirm.classList.remove("visible");
    leaveStageBtn.classList.remove("hidden");
    beep(480,.06,.02);
  });
  confirmLeaveBtn.addEventListener("click",()=>{playUiClick();leaveStage();});
  muteBtn.addEventListener("click",toggleMute);
  reloadAudioBtn.addEventListener("click",async()=>{
    playUiClick();
    reloadAudioBtn.disabled=true;
    reloadAudioBtn.classList.remove("success","fail");
    reloadAudioBtn.classList.add("loading");
    const ok=await reloadAudioEngine();
    reloadAudioBtn.classList.remove("loading");
    reloadAudioBtn.classList.add(ok?"success":"fail");
    setTimeout(()=>{
      reloadAudioBtn.disabled=false;
      reloadAudioBtn.classList.remove("success","fail");
    },1200);
  });
  accountBox.addEventListener("click",()=>{playUiClick();renderMeta();rewardScreen.classList.remove("hidden");});
  accountBox.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();playUiClick();renderMeta();rewardScreen.classList.remove("hidden");}});
  coinBox?.addEventListener("click",refreshWalletFromUi);
  coinBox?.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      refreshWalletFromUi();
    }
  });
  closeRewards.addEventListener("click",()=>{playUiClick();rewardScreen.classList.add("hidden");syncCoinState(true);renderMeta();});
  chooseStageBtn.addEventListener("click",()=>{playUiClick();renderMeta();stageScreen.classList.remove("hidden");});
  closeStage.addEventListener("click",()=>{playUiClick();stageScreen.classList.add("hidden");syncCoinState(true);renderMeta();});
  gardenStage.addEventListener("click",()=>{playUiClick();currentStage=1;renderMeta();});
  desertStage.addEventListener("click",()=>{if(meta.desertUnlocked){playUiClick();currentStage=2;renderMeta();}});
  snowStage.addEventListener("click",()=>{if(meta.snowUnlocked){playUiClick();currentStage=3;renderMeta();}});
  infiniteStage.addEventListener("click",()=>{playUiClick();currentStage=4;renderMeta();});
  characterBtn.addEventListener("click",()=>{
    playUiClick();
    renderMeta();
    characterScreen.classList.remove("hidden");
    requestAnimationFrame(()=>requestAnimationFrame(setupMetaMarquees));
  });
  closeCharacter.addEventListener("click",()=>{playUiClick();characterScreen.classList.add("hidden");syncCoinState(true);renderMeta();});
  adventureBookBtn.addEventListener("click",()=>{
    playUiClick();
    renderAdventureBook();
    adventureBookScreen.classList.remove("hidden");
  });
  closeAdventureBook.addEventListener("click",()=>{playUiClick();adventureBookScreen.classList.add("hidden");syncCoinState(true);renderMeta();});
  bookTabSkills.addEventListener("click",()=>{playUiClick();bookMainTab="skills";renderAdventureBook();});
  bookTabStages.addEventListener("click",()=>{playUiClick();bookMainTab="stages";renderAdventureBook();});
  bookTabBosses.addEventListener("click",()=>{playUiClick();bookMainTab="bosses";renderAdventureBook();});
  shopBtn.addEventListener("click",()=>{
    renderShop();
    shopScreen.classList.remove("hidden");
    playUiClick();
  });
  closeShop.addEventListener("click",()=>{
    playUiClick();
    shopScreen.classList.add("hidden");
    syncCoinState(true);
    renderMeta();
  });
  perfMonitorBtn.addEventListener("click",()=>{
    playUiClick();
    debugPanelMode=debugPanelMode==="perf"?"off":"perf";
    updateMonitorButtons();
  });
  audioMonitorBtn.addEventListener("click",()=>{
    playUiClick();
    debugPanelMode=debugPanelMode==="audio"?"off":"audio";
    updateMonitorButtons();
  });
  devModeBtn.addEventListener("click",()=>{playUiClick();openSettingsOverlay();});
  closeSettingsBtn.addEventListener("click",()=>{playUiClick();closeSettingsOverlay();});
  settingsOverlay.addEventListener("click",e=>{if(e.target===settingsOverlay)closeSettingsOverlay();});
  settingsDialog.addEventListener("click",e=>{if(e.target===settingsDialog)closeSettingsDialog();});
  settingsDialogConfirm.addEventListener("click",()=>{playUiClick();confirmSettingsDialog();});
  settingsDialogCancel.addEventListener("click",()=>{playUiClick();closeSettingsDialog();});
  volumeSettings?.addEventListener("click",e=>{
    const button=e.target.closest("button[data-volume-delta]");
    if(!button)return;
    const row=button.closest(".volumeRow");
    if(!row)return;
    adjustVolume(row.dataset.volumeKey,Number(button.dataset.volumeDelta)||0);
  });
  document.addEventListener("pointerdown",e=>{
    if(testModeOverlay.classList.contains("visible")&&!e.target.closest("#testModeOverlay")&&!e.target.closest("#devTestBtn")){
      closeTestModeOverlay();
    }
  });
  settingsDialogInput.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&!e.shiftKey){
      e.preventDefault();
      confirmSettingsDialog();
    }else if(e.key==="Escape"){
      e.preventDefault();
      closeSettingsDialog();
    }
  });
  accountExportBtn.addEventListener("click",()=>{playUiClick();exportAccountCode();});
  accountImportBtn.addEventListener("click",()=>{playUiClick();importAccountCode();});
  developerEntryBtn.addEventListener("click",()=>{playUiClick();handleDeveloperEntry();});
  coinDevAddBtn?.addEventListener("click",()=>{
    if(!devModeActive)return;
    syncCoinState();
    meta.coins=Math.max(0,Math.floor(Number(meta.coins)||0)+100);
    walletCoins=meta.coins;
    saveMeta();
    syncCoinDisplay();
    beep(780,.08,.02,"square");
    countAudioSubtype("ui");
  });
  coinDevSubBtn?.addEventListener("click",()=>{
    if(!devModeActive)return;
    syncCoinState();
    meta.coins=Math.max(0,Math.floor(Number(meta.coins)||0)-100);
    walletCoins=meta.coins;
    saveMeta();
    syncCoinDisplay();
    beep(240,.08,.02,"square");
    countAudioSubtype("ui");
  });
  devTestBtn.addEventListener("click",()=>{
    if(!devModeActive)return;
    playUiClick();
    if(testModeOverlay.classList.contains("visible"))closeTestModeOverlay();
    else openTestModeOverlay();
  });
  testModeMobileBtn.addEventListener("click",()=>{
    playUiClick();
    devTestProfile="mobile";
    if(!devTestRecorder.active)devTestRecorder.interval=getDevTestInterval(devTestProfile);
    updateTestModeUi();
  });
  testModeDesktopBtn.addEventListener("click",()=>{
    playUiClick();
    devTestProfile="desktop";
    if(!devTestRecorder.active)devTestRecorder.interval=getDevTestInterval(devTestProfile);
    updateTestModeUi();
  });
  testInvincibleBtn.addEventListener("click",()=>{
    devInvincible=!devInvincible;
    updateTestModeUi();
    beep(devInvincible?720:320,.07,.02,"triangle");
  });
  testAutoSkillBtn.addEventListener("click",()=>{
    devAutoUpgrade=!devAutoUpgrade;
    updateTestModeUi();
    beep(devAutoUpgrade?760:340,.07,.02,"triangle");
  });
  testModeStartBtn.addEventListener("click",()=>{startDevTestRecording();});
  testModeStopBtn.addEventListener("click",()=>{stopDevTestRecording();});
  testModeExportBtn.addEventListener("click",()=>{playUiClick();stopDevTestRecording();exportDevTestRecording();});
  devResetBtn.addEventListener("click",()=>{
    if(!devModeActive)return;
    let refund=0;
    for(const def of metaDefs){
      refund+=metaSpentCost(def,meta[def.id]||0);
      meta[def.id]=0;
    }
    meta.points+=refund;
    saveMeta();
    renderMeta();
    beep(180,.12,.04,"square");
  });
  document.getElementById("start").onclick=()=>{
    if(transitioning)return;
    playUiClick();
    playSceneTransition(()=>{
      timeline.seen.clear();
      start();
    },{shrinkDuration:1100,holdDuration:1100,expandDuration:800});
  };
  document.getElementById("again").onclick=()=>{
    if(transitioning)return;
    playUiClick();
    playSceneTransition(()=>{
      endScreen.classList.add("hidden");
      intro.classList.remove("hidden");
      characterScreen.classList.add("hidden");
      adventureBookScreen.classList.add("hidden");
      rewardScreen.classList.add("hidden");
      stageScreen.classList.add("hidden");
      pauseScreen.classList.add("hidden");pauseBtn.classList.remove("visible");
      renderMeta();
      updateMonitorButtons();
    },{shrinkDuration:1100,holdDuration:1100,expandDuration:800});
  };
  window.addEventListener("resize",()=>{
    resizeTransitionCanvas();
    setupMetaMarquees();
  });
  resizeTransitionCanvas();
  syncCoinState(true);
  updateMuteButton();renderMeta();startBootOverlay();draw();requestAnimationFrame(loop);
})();

