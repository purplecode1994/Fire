(() => {
  "use strict";
  const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
  const transitionCanvas=document.getElementById("transitionCanvas"),transitionCtx=transitionCanvas.getContext("2d");
  const transitionMask=document.getElementById("transitionMask");
  const bootOverlay=document.getElementById("bootOverlay"),bootHint=document.getElementById("bootHint");
  const bootProgressFill=document.getElementById("bootProgressFill"),bootPercent=document.getElementById("bootPercent");
  const bootMascotCanvas=document.getElementById("bootMascots"),bootMascotCtx=bootMascotCanvas?.getContext("2d");
  const APP_VERSION=637;
  const GARDEN_PRELOAD_ASSETS=[
    `assets/garden/早上.png?v=${APP_VERSION}`,
    `assets/garden/中午.png?v=${APP_VERSION}`,
    `assets/garden/下午.png?v=${APP_VERSION}`,
    `assets/garden/晚上.png?v=${APP_VERSION}`,
    `assets/garden/白天下雨.png?v=${APP_VERSION}`,
    `assets/garden/plant-button-frame-clean.png?v=1`,
    `assets/garden/user-carrot-growth-v5/carrot-growth-13-empty.png?v=${APP_VERSION}`,
    `assets/garden/user-carrot-growth-v5/carrot-growth-00-seed.png?v=${APP_VERSION}`
  ];
  const INFINITE_STAGE=12;
  const BOSS_CHALLENGE_STAGE=13;
  const EVENT_STAGE=14;
  const EVENT_DURATION=600;
  const EVENT_DAILY_LIMIT=3;
  const ACTIVITY_CARROT_MODE="carrot";
  const ACTIVITY_TRIAL_MODE="trial";
  const RARE_BREAK_STONE_PRICE=30;
  const BREAK_STONE_MERGE_COST=3;
  const ACTIVITY_CARROT_COIN_MIN=5;
  const ACTIVITY_CARROT_COIN_MAX=20;
  const GARDEN_DRAIN_SHOVEL_PRICE=20;
  const GARDEN_MOISTURE_METER_PRICE=600;
  const GARDEN_EC_METER_PRICE=600;
  const GARDEN_INSECTICIDE_PRICE=15;
  const GARDEN_PRUNING_SCISSORS_PRICE=20;
  const GARDEN_SUPPORT_FRAME_PRICE=20;
  const GARDEN_SHADE_NET_PRICE=20;
  const GARDEN_FERTILIZER_PRICE=10;
  const GARDEN_SLOW_FERTILIZER_PRICE=25;
  const GARDEN_PREMIUM_SLOW_FERTILIZER_PRICE=45;
  const EQUIPMENT_QUALITY_ORDER=["rare","uncommon","epic","legendary","mythic","immortal","eternal"];
  const LUMINOUS_SLASH_DURATION=20;
  const LUMINOUS_SLASH_COOLDOWN=60;
  const LUMINOUS_SLASH_CHANCES=[0,.05,.10,.15,.25,.40];
  const LUMINOUS_SLASH_ASSET=`assets/skills/combo-slash-up-right.png?v=${APP_VERSION}`;
  const LUMINOUS_SLASH_CONFIG={
    imageAnchorX:.37,imageAnchorY:.64,imageScale:.11,imageOpacity:.94,
    rightAngleDeg:71,leftAngleDeg:103,baseRotationDeg:-45,
    singleDuration:.459,drawSec:.329,secondDelay:.191,
    rightFadeIn:.05,rightFadeOut:.13,leftFadeIn:.095,leftFadeOut:.193
  };
  const luminousSlashImg=new Image();
  luminousSlashImg.decoding="async";
  luminousSlashImg.src=LUMINOUS_SLASH_ASSET;
  ctx.imageSmoothingEnabled=false;
  transitionCtx.imageSmoothingEnabled=false;
  if(bootMascotCtx)bootMascotCtx.imageSmoothingEnabled=false;
  const W=540,H=960;
  const SHOT_POOL_INITIAL_SIZE=400;
  const PERFORMANCE_PROFILES=[
    {
      id:0,name:"極省電",maxFps:30,enemyCap:100,gridStride:2,targetTtl:.15,offScreenDiv:8,hudInterval:.25,sectorCount:4,
      textLimits:{normal:0,critical:10,boss:24,default:999},
      critProfile:{life:.55,vxMin:0,vxMax:0,vyMin:-46,vyMax:-46,gravity:0,minScale:.9,noFade:true},
      burst:{largeThreshold:12,largeCap:2,smallCap:0},
      gemPressure:{low:12000,mid:22000,high:36000,slow:.1,medium:.07,fast:.04},
      gemFar:{near:200,far:520,nearMod:5,farMod:10},
      groundStride:3,perfSampleSeconds:3,critSoundThrottleMs:70,
      disabledEffectKinds:["particle","chip","half","slash"],particleCap:0,
      orbitHalfEffects:false,
      projectileGlow:false,particleGlow:false,impactGlow:false
    },
    {
      id:1,name:"一般模式",maxFps:60,enemyCap:150,gridStride:1,targetTtl:.12,offScreenDiv:5,hudInterval:.15,sectorCount:8,
      textLimits:{normal:18,critical:18,boss:40,default:999},
      critProfile:{life:.82,vxMin:-16,vxMax:16,vyMin:-76,vyMax:-58,gravity:80,minScale:.8,noFade:false},
      burst:{largeThreshold:12,largeCap:8,smallCap:2},
      gemPressure:{low:20000,mid:32000,high:45000,slow:.16,medium:.1,fast:.06},
      gemFar:{near:260,far:600,nearMod:3,farMod:5},
      groundStride:1,perfSampleSeconds:2,critSoundThrottleMs:70,
      disabledEffectKinds:[],particleCap:24,
      orbitHalfEffects:false,
      projectileGlow:false,particleGlow:false,impactGlow:false
    },
    {
      id:2,name:"高畫質",maxFps:60,enemyCap:220,gridStride:1,targetTtl:.08,offScreenDiv:3,hudInterval:.10,sectorCount:8,
      textLimits:{normal:42,critical:999,boss:80,default:999},
      critProfile:{life:1.08,vxMin:-34,vxMax:34,vyMin:-112,vyMax:-86,gravity:150,minScale:.72,noFade:false},
      burst:{largeThreshold:12,largeCap:Infinity,smallCap:Infinity},
      gemPressure:{low:30000,mid:40000,high:50000,slow:.2,medium:.12,fast:.07},
      gemFar:{near:340,far:700,nearMod:2,farMod:3},
      groundStride:1,perfSampleSeconds:2,critSoundThrottleMs:45,
      disabledEffectKinds:[],particleCap:Infinity,
      orbitHalfEffects:true,
      projectileGlow:true,particleGlow:true,impactGlow:true
    }
  ];
  const DURATION=600,wrap=document.getElementById("wrap");
  const intro=document.getElementById("intro"),levelScreen=document.getElementById("levelup");
  const endScreen=document.getElementById("end"),choicesEl=document.getElementById("choices");
  const autoTrainingGuard=document.getElementById("autoTrainingGuard");
  const characterScreen=document.getElementById("characterScreen"),rewardScreen=document.getElementById("rewardScreen"),stageScreen=document.getElementById("stageScreen"),adventureBookScreen=document.getElementById("adventureBookScreen"),shopScreen=document.getElementById("shopScreen"),gardenScreen=document.getElementById("gardenScreen");
  const volumeSettings=document.getElementById("volumeSettings"),graphicsSettings=document.getElementById("graphicsSettings"),computeSettings=document.getElementById("computeSettings");
  const rewardTrack=document.getElementById("rewardTrackModal"),accountBox=document.getElementById("accountBox");
  const pauseScreen=document.getElementById("pauseScreen"),pauseStats=document.getElementById("pauseStats");
  const metaStatsEl=document.getElementById("metaStats"),metaPointsEl=document.getElementById("metaPoints"),metaRecordEl=document.getElementById("metaRecord"),powerBox=document.getElementById("powerBox"),characterModeTabs=document.getElementById("characterModeTabs"),abilityPanelBtn=document.getElementById("abilityPanelBtn"),equipmentPanelBtn=document.getElementById("equipmentPanelBtn"),equipmentPanel=document.getElementById("equipmentPanel");
  const adventureBookContent=document.getElementById("adventureBookContent"),bookSubTabs=document.getElementById("bookSubTabs");
  const bookTabSkills=document.getElementById("bookTabSkills"),bookTabStages=document.getElementById("bookTabStages"),bookTabBosses=document.getElementById("bookTabBosses");
  const rewardPlaytimeEl=document.getElementById("rewardPlaytime");
  const devModeBtn=document.getElementById("devModeBtn"),devResetBtn=document.getElementById("devResetBtn"),abilityResetBtn=document.getElementById("abilityResetBtn");
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
  const accountLevelEl=document.getElementById("accountLevel"),accountExpFill=document.getElementById("accountExpFill"),accountExpText=document.getElementById("accountExpText"),coinBox=document.getElementById("coinBox"),coinCountEl=document.getElementById("coinCount"),coinDevSubBtn=document.getElementById("coinDevSubBtn"),coinDevAddBtn=document.getElementById("coinDevAddBtn"),coinDebugBox=document.getElementById("coinDebugBox"),shopCoinCount=document.getElementById("shopCoinCount"),shopGrid=document.getElementById("shopGrid"),shopTitle=document.getElementById("shopTitle"),shopModeShopBtn=document.getElementById("shopModeShopBtn"),shopModeForgeBtn=document.getElementById("shopModeForgeBtn"),shopModeEventBtn=document.getElementById("shopModeEventBtn");
  const homeStageBadge=document.getElementById("homeStageBadge"),stageArt=document.getElementById("stageArt"),stageName=document.getElementById("stageName"),stagePower=document.getElementById("stagePower"),homeStageBadgeCanvas=document.getElementById("homeStageBadgeCanvas"),homeStageBadgeText=document.querySelector(".homeStageBadgeText");
  const keys={up:false,down:false,left:false,right:false};
  if(settingsOverlay&&settingsOverlay.parentElement!==wrap)wrap.appendChild(settingsOverlay);
  if(settingsDialog&&settingsDialog.parentElement!==wrap)wrap.appendChild(settingsDialog);
  const stick={active:false,pointerId:null,x:0,y:0,startX:0,startY:0};
  let running=false,paused=false,ended=false,last=0,loopAccumulator=0,time=0,spawnClock=0,shotClock=0,battleStartDelay=0,computeFrameCount=0;
  let giantCarrotCooldown=0;
  let enemies=[],shots=[],enemyShots=[],gems=[],effects=[],texts=[],areas=[],petShots=[],bananas=[],chests=[],pickups=[],bossObstacles=[];
  const shotPool=[];
  let shotScanCursor=0;
  for(let i=0;i<SHOT_POOL_INITIAL_SIZE;i++)shotPool.push(makeEmptyShot());
  let groundCache={canvas:null,ctx:null,zone:null,firstX:null,firstY:null,cols:0,rows:0,grid:64};
  let enemyGrid=new Map();
  let announcements=[],activeAnnouncement=null;
  let kills=0,score=0,eliteKills=0,bossKills=0,nextId=1,levelQueue=0;
  let eligibleKills=0,instantKills=0,instantKillTimer=0;
  let kps=0,kpsWindowKills=0,kpsWindowTime=0,kpsPressure=0,kpsBonusTimer=0,kpsSpawnBonus=0;
  let chestClock=0,chestTravel=0,lastChestX=0,lastChestY=0,magnetAll=false,magnetTimer=0,gemPressureRecycleTimer=0;
  let carrotVolley=0,pinkyBoostTimer=0,pinkyDamageBoost=1,pendingCarrotShots=0;
  let luminousSlashActiveTimer=0,luminousSlashCooldownTimer=0;
  let poisonTimer=0,poisonRate=0,stunTimer=0,confuseTimer=0,potionHealTimer=0,blizzardTimer=0,blizzardPushTimer=0,blizzardPushAngle=0,blizzardPushSpeed=0,currentStage=1,infiniteBossZone=0;
  let bossChallengeType="plant",bossChallengeSourceStage=1,bossChallengeMenuOpen=false,bossChallengeStartTime=0;
  let encirclementPressure=0,encirclementCharge=0,encirclementSampleClock=0,encirclementPressureRounds=0;
  let encirclementReservedHp=0,encirclementSectorBits=0,encirclementSectorCount=0,encirclementPrewarn=false,encirclementDebts=[];
  let infiniteDisplayOffset=0,infiniteDisplayFreezeStart=0,infiniteClearCount=0;
  let gardenDevDateOverride="";
  let runRewarded=false,activityRewarded=false,transitioning=false;
  let activityStageMode=ACTIVITY_CARROT_MODE,lastActivityReward={mode:ACTIVITY_CARROT_MODE,seeds:0,coins:0,points:0,stones:[]};
  let settingsDialogState=null;
  let bookMainTab="skills",bookStageTab=1;
  const BATTLE_START_DELAY=1.6;
  let escalationStart=null;
  let killSurgeActive=false;
  let finalPhase="none",finalTimer=0;
  let bossArena={active:false,x:0,y:0,r:360};
  let audio=null,muted=false;
  let runCoins=0,runCoinsSettled=false,walletCoins=0,autoSaveTimer=0,coinDebugExpanded=false,testModeSilentPaused=false;
  let autoTrainingActive=false,autoTrainingSource="",autoTrainingPromptOpen=false,shopPurchasePromptOpen=false,autoTrainingSettled=false;
  let synthBeepWindowAt=0,synthBeepWindowCount=0;
  let dialogOnlyOverlayHostWasHidden=false;
  let coinSaveStatus={saveLocal:"-",saveSession:"-",metaLocal:"-",metaSession:"-",coinLocal:"-",coinSession:"-",coinCookie:"-"};
  let critSampleBuffer=null,critSampleLoading=false,critSoundLastTime=0;
  const CARROT_BASE_COOLDOWN=.72;
  const CARROT_MIN_CHAIN_INTERVAL=2/60;
  let xpSoundLastTime=0;
  let debugOverlayEnabled=false,debugFrameMs=16.7,debugFps=60,debugHeapMb=0,debugPeakFrameMs=16.7;
  let hudSampleTimer=0,hudEnemyCount=0,hudKills=0,hudKps=0,hudKpsBonus=0,hudWaveSeconds=0;
  let sharedTargetCache=null,sharedTargetTimer=0;
  let allowPageUnloadOnce=false,reloadConfirmActive=false,reloadConfirmWasPaused=false;
  let debugPanelMode="perf",audioDebugTimer=0;
  let devTestProfile="mobile",devInvincible=false,devAutoUpgrade=false;
  let devTestRecorder={active:false,profile:"mobile",interval:2,elapsed:0,lastSampleAt:0,startReal:0,samples:[],perfPeaks:{},summary:null,battery:null};
  const IMPLEMENTED_STAGE_COUNT=11;
  let audioDebugCurrent={
    total:0,beep:0,external:0,xp:0,crit:0,
    ui:0,pickup:0,smallCarrot:0,giantLaunch:0,giantExplosion:0,
    externalFail:0
  };
  let audioDebugLast={...audioDebugCurrent};
  let perfDebugTimer=0,perfDebugAccumulator={frameMs:0,fps:0,samples:0,peak:0,catchUpMax:0};
  let perfDebugLast={frameMs:16.7,fps:60,peak:16.7,catchUpMax:0};
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
  const EQUIPMENT_UNLOCK_POWER=20000;
  const EVENT_UNLOCK_POWER=20000;
  const EQUIPMENT_DEFS={
    bittenCarrot:{id:"bittenCarrot",name:"啃過的胡蘿蔔",type:"weapon",quality:"normal",attack:18,source:"starter"},
    wholeCarrot:{id:"wholeCarrot",name:"完整的胡蘿蔔",type:"weapon",quality:"rare",attack:100,price:5000,source:"shop"},
    soulRing:{id:"soulRing",name:"獵魂戒指",type:"ring",quality:"rare",price:3500,pointBonus:.05,pointBonusPerForge:.01,source:"shop",forge:{cost:100,success:.9,pointBonus:.01}}
  };
  const EQUIPMENT_QUALITY={
    normal:{name:"一般",className:"normal",color:"#d8d3c8"},
    rare:{name:"稀有",className:"rare",color:"#56b7ff"},
    uncommon:{name:"罕見",className:"uncommon",color:"#bb7cff"},
    epic:{name:"史詩",className:"epic",color:"#ff9f3f"},
    legendary:{name:"傳說",className:"legendary",color:"#5ee071"},
    mythic:{name:"神話",className:"mythic",color:"#ff5f8e"},
    immortal:{name:"不朽",className:"immortal",color:"#f3f5ff"},
    eternal:{name:"永恆",className:"eternal",color:"#ffe66b"}
  };
  const BREAK_STONE_QUALITIES=["normal","rare","uncommon","epic","legendary","mythic","immortal","eternal"];
  const BREAK_STONE_NAMES={
    normal:"一般突破原石",
    rare:"稀有突破原石",
    uncommon:"罕見突破原石",
    epic:"史詩突破原石",
    legendary:"傳說突破原石",
    mythic:"神話突破原石",
    immortal:"不朽突破原石",
    eternal:"永恆突破原石"
  };
  const ACTIVITY_TRIAL_STONE_WEIGHTS=[
    ["normal",35],
    ["rare",30],
    ["uncommon",18],
    ["epic",10],
    ["legendary",5],
    ["mythic",1.4],
    ["immortal",.5],
    ["eternal",.1]
  ];
  const GARDEN_STORAGE_BASE_CAP=9;
  const GARDEN_DEV_CARROT_CODE="8811";
  const POINT_8888_CODE="8888";
  const POINT_8888_REWARD=2000;
  const POINT_DEV_CODE="00020000";
  const POINT_DEV_REWARD=20000;
  const POINT_MAX_CODE="09999999";
  const POINT_MAX_TARGET=9999999;
  const GARDEN_CARROT_QUALITIES=[
    {id:"common",name:"凡品胡蘿蔔",rank:"一般",className:"gardenQCommon",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-00-common.png",devWeight:55},
    {id:"rare",name:"開脈胡蘿蔔",rank:"稀有",className:"gardenQRare",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-01-rare.png",devWeight:25},
    {id:"uncommon",name:"聚氣胡蘿蔔",rank:"罕見",className:"gardenQUncommon",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-02-uncommon.png",devWeight:12},
    {id:"epic",name:"玄靈胡蘿蔔",rank:"史詩",className:"gardenQEpic",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-03-epic.png",devWeight:5},
    {id:"legendary",name:"龍脈胡蘿蔔",rank:"傳說",className:"gardenQLegendary",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-04-legendary.png",devWeight:2},
    {id:"mythic",name:"天道胡蘿蔔",rank:"神話",className:"gardenQMythic",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-05-mythic.png",devWeight:.8},
    {id:"immortal",name:"萬劫胡蘿蔔",rank:"不朽",className:"gardenQImmortal",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-06-immortal.png",devWeight:.19},
    {id:"eternal",name:"太初胡蘿蔔",rank:"永恆",className:"gardenQEternal",asset:"assets/garden/harvest-carrots-v1/harvest-carrot-07-eternal.png",devWeight:.01}
  ];
  const GARDEN_BUYER_DIAMOND_REWARDS={
    common:900,
    rare:1500,
    uncommon:2200,
    epic:3200,
    legendary:4500,
    mythic:6200,
    immortal:8000,
    eternal:10000
  };
  const GARDEN_ENHANCE_NEED={
    common:2,
    rare:4,
    uncommon:7,
    epic:11,
    legendary:16,
    mythic:22,
    immortal:30,
    eternal:40
  };
  const GARDEN_ENHANCE_RANKS=["D","D+","C","C+","B","B+","A","A+","S","S+"];
  const GARDEN_ENHANCE_MAX_LEVEL=GARDEN_ENHANCE_RANKS.length-1;
  const GARDEN_WATER_SLOTS=["morning","noon","afternoon","night"];
  const GARDEN_WATER_SLOT_NAMES={morning:"早上",noon:"中午",afternoon:"下午",night:"晚上"};
  const GARDEN_CHOICE_EVENT_GATE_RATE=.30;
  const GARDEN_CHOICE_EVENT_RATES_BEFORE={yellow:.08,red:.04,purple:.015,gold:0};
  const GARDEN_CHOICE_EVENT_RATES_MATURE={yellow:.08,red:.04,purple:.015,gold:.003};
  const GARDEN_MAX_WATER_PER_DAY=4;
  const GARDEN_MAX_OBSERVE_PER_DAY=2;
  const GARDEN_RAIN_WATER_COUNT=3;
  const GARDEN_MOISTURE_INITIAL=3;
  const GARDEN_MOISTURE_MAX=8;
  const GARDEN_NUTRIENTS_INITIAL=50;
  const GARDEN_NUTRIENTS_MAX=100;
  const GARDEN_NUTRIENTS_LEGACY_MAX=6;
  const GARDEN_NUTRIENT_GROWTH_COST=5;
  const GARDEN_RAIN_NUTRIENT_LOSS=10;
  const GARDEN_QUICK_FERTILIZER_NUTRIENTS=20;
  const GARDEN_SLOW_FERTILIZER_NUTRIENTS=10;
  const GARDEN_PREMIUM_SLOW_FERTILIZER_NUTRIENTS=15;
  const GARDEN_SLOW_FERTILIZER_DAILY=6;
  const GARDEN_PREMIUM_SLOW_FERTILIZER_DAILY=8;
  const GARDEN_STAGE_NUTRIENT_RANGES=[
    {name:"種子",best:[25,45],ok:[15,55]},
    {name:"發芽",best:[30,50],ok:[20,60]},
    {name:"長出小葉",best:[35,55],ok:[25,65]},
    {name:"葉子茂盛",best:[40,65],ok:[30,75]},
    {name:"胡蘿蔔長胖",best:[50,75],ok:[40,85]},
    {name:"成熟",best:[45,70],ok:[35,80]},
    {name:"可採收",best:[40,70],ok:[30,80]}
  ];
  const GARDEN_EXTREME_MOISTURE_DEATH_RATE=.9;
  const GARDEN_DRAIN_SHOVEL_COST=1;
  const GARDEN_DRAIN_MOISTURE_REDUCE=2;
  const GARDEN_CONDITION_IMAGES={
    leafDry:"leafDry",
    matureDry:"matureDry",
    leafOverwater:"leafOverwater",
    lushLeavesOverwater:"lushLeavesOverwater",
    fatteningOverwater:"fatteningOverwater",
    smallLeavesNutrientBurn:"smallLeavesNutrientBurn",
    lushLeavesNutrientBurn:"lushLeavesNutrientBurn",
    fatteningMatureNutrientBurn:"fatteningMatureNutrientBurn",
    smallLeavesBugBite:"smallLeavesBugBite",
    lushLeavesBugBite:"lushLeavesBugBite",
    fatteningBugBite:"fatteningBugBite",
    matureBugBite:"matureBugBite",
    smallLeavesDisease:"smallLeavesDisease",
    lushLeavesDisease:"lushLeavesDisease",
    fatteningDisease:"fatteningDisease",
    matureDisease:"matureDisease",
    moleEaten:"eaten"
  };
  const GARDEN_CONDITION_NAMES={
    leafDry:"小葉缺水",
    matureDry:"成熟缺水",
    leafOverwater:"小葉澆水過多",
    lushLeavesOverwater:"葉子茂盛澆水過多",
    fatteningOverwater:"長胖澆水過多",
    smallLeavesNutrientBurn:"發芽小葉肥傷",
    lushLeavesNutrientBurn:"葉子茂盛肥傷",
    fatteningMatureNutrientBurn:"長胖成熟肥傷",
    smallLeavesBugBite:"小葉蟲咬",
    lushLeavesBugBite:"葉子茂盛蟲咬",
    fatteningBugBite:"胡蘿蔔長胖蟲咬",
    matureBugBite:"成熟蟲咬",
    smallLeavesDisease:"小葉病害",
    lushLeavesDisease:"葉子茂盛病害",
    fatteningDisease:"胡蘿蔔長胖病害",
    matureDisease:"成熟病害",
    moleEaten:"被地鼠啃咬"
  };
  const GARDEN_FORGE_ATTACK={
    common:58,
    rare:180,
    uncommon:320,
    epic:620,
    legendary:1050,
    mythic:1650,
    immortal:2600,
    eternal:4200
  };
  const GARDEN_EQUIPMENT_PREFIX="garden:";
  // 裝備品質階級：稀有 -> 罕見 -> 史詩 -> 傳說 -> 神話 -> 不朽 -> 永恆。
  // 一般=無框；活動關卡為胡鬧的胡蘿蔔，2 萬戰力開放，擊敗活動 Boss 後掉落菜園種子。
  // 鍛造屋預備：藍框以上可鍛造，單件最多 +10；每日鍛造最多 7 次。
  const FORGE_DAILY_LIMIT=7;
  const FORGE_RULES={
    rare:{cost:120,success:.9,attack:8},
    uncommon:{cost:220,success:.75,attack:14},
    legendary:{cost:420,success:.55,attack:24},
    epic:{cost:700,success:.4,attack:40}
  };
  const BASE_META_LIFE=100;
  const META_DAMAGE_STEP=1.2;
  const META_LIFE_STEP=8;
  const META_DAMAGE_TIER_GROWTH=.002;
  const META_LIFE_TIER_GROWTH=.005;
  const META_REGEN_BASE_STEP=.32;
  const META_REGEN_STAGE_STEP=.013;
  const MAX_CRIT_DAMAGE_LEVEL=100;
  const MAX_CRIT_DAMAGE_MULTIPLIER=3;
  const META_CRIT_DAMAGE_STEP=(MAX_CRIT_DAMAGE_MULTIPLIER-1.6)/MAX_CRIT_DAMAGE_LEVEL;
  const MAX_META_ARMOR_PEN=.7;
  const MAX_TOTAL_ARMOR_PEN=1;
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
  function metaDefCap(def){
    if(!def||def.cap===undefined)return undefined;
    return def.cap;
  }
  function breakStoneQualityKey(quality){
    const key=String(quality||"normal");
    return BREAK_STONE_QUALITIES.includes(key)?key:"normal";
  }
  function normalizeBreakStoneState(source={},rareFallback=0){
    const raw=source&&typeof source==="object"&&!Array.isArray(source)?source:{};
    const stones={};
    BREAK_STONE_QUALITIES.forEach(quality=>{
      stones[quality]=Math.max(0,Math.floor(Number(raw[quality])||0));
    });
    stones.rare=Math.max(stones.rare,Math.max(0,Math.floor(Number(rareFallback)||0)));
    return stones;
  }
  function syncBreakStoneState(target=meta){
    target.breakStones=normalizeBreakStoneState(target.breakStones,target.rareBreakStones);
    target.rareBreakStones=target.breakStones.rare;
    return target.breakStones;
  }
  function breakStoneName(quality){
    const key=breakStoneQualityKey(quality);
    return BREAK_STONE_NAMES[key]||`${EQUIPMENT_QUALITY[key]?.name||"一般"}突破原石`;
  }
  function breakStoneCount(quality){
    const stones=syncBreakStoneState(meta);
    return stones[breakStoneQualityKey(quality)]||0;
  }
  function addBreakStone(quality,amount=1){
    const key=breakStoneQualityKey(quality);
    const stones=syncBreakStoneState(meta);
    stones[key]=Math.max(0,Math.floor(Number(stones[key])||0))+Math.max(1,Math.floor(Number(amount)||1));
    meta.rareBreakStones=stones.rare;
    return stones[key];
  }
  function spendBreakStone(quality,amount=1){
    const key=breakStoneQualityKey(quality);
    const cost=Math.max(1,Math.floor(Number(amount)||1));
    const stones=syncBreakStoneState(meta);
    if((stones[key]||0)<cost)return false;
    stones[key]-=cost;
    meta.rareBreakStones=stones.rare;
    return true;
  }
  function breakStoneInventoryText(){
    const stones=syncBreakStoneState(meta);
    const parts=BREAK_STONE_QUALITIES.filter(quality=>(stones[quality]||0)>0).map(quality=>`${breakStoneName(quality)} ${formatCommaNumber(stones[quality])}`);
    return parts.length?parts.join("｜"):"尚無突破原石";
  }
  function nextBreakStoneQuality(quality){
    const index=BREAK_STONE_QUALITIES.indexOf(breakStoneQualityKey(quality));
    if(index<0||index>=BREAK_STONE_QUALITIES.length-1)return "";
    return BREAK_STONE_QUALITIES[index+1];
  }
  function rollActivityTrialBreakStoneQuality(){
    const total=ACTIVITY_TRIAL_STONE_WEIGHTS.reduce((sum,item)=>sum+item[1],0);
    let roll=Math.random()*total;
    for(const [quality,weight] of ACTIVITY_TRIAL_STONE_WEIGHTS){
      roll-=weight;
      if(roll<=0)return breakStoneQualityKey(quality);
    }
    return "normal";
  }
  function activityTrialStoneCount(){
    return Math.max(1,Math.min(5,1+Math.floor(Math.max(0,kills)/6000)));
  }
  function formatBreakStoneDrops(drops=[]){
    const counts={};
    (Array.isArray(drops)?drops:[]).forEach(quality=>{
      const key=breakStoneQualityKey(quality);
      counts[key]=(counts[key]||0)+1;
    });
    const parts=BREAK_STONE_QUALITIES.filter(quality=>counts[quality]).map(quality=>`${breakStoneName(quality)} x${counts[quality]}`);
    return parts.length?parts.join("、"):"0";
  }
  function awardActivityTrialBreakStones(){
    const drops=[];
    const count=activityTrialStoneCount();
    for(let i=0;i<count;i++){
      const quality=rollActivityTrialBreakStoneQuality();
      addBreakStone(quality,1);
      drops.push(quality);
    }
    return drops;
  }

  const metaDefs=[
    {id:"damage",name:"攻擊力",cost:5,cap:200,desc:`每級 +${META_DAMAGE_STEP} 攻擊力；每10級成長 +${(META_DAMAGE_TIER_GROWTH*100).toFixed(1)}%，最高 LV200`,value:m=>`+${scaledMetaGain(m.damage,META_DAMAGE_STEP,META_DAMAGE_TIER_GROWTH).toFixed(1).replace(/\\.0$/,"")}`},
    {id:"crit",name:"爆擊率",cost:8,cap:100,desc:"分3階段成長，LV100 = 100%",value:m=>`${Math.round(metaCritChance(m.crit)*1000)/10}%`},
    {id:"speed",name:"攻擊速度",cost:7,cap:100,desc:"+3% 初始攻速，最高 LV100",value:m=>`+${Math.min(100,m.speed)*3}%`},
    {id:"critDamage",name:"爆擊傷害",cost:6,cap:MAX_CRIT_DAMAGE_LEVEL,desc:"分3階段成長，LV100 = 300%",value:m=>`${Math.round(baseMetaCritDamageMultiplier(m.critDamage)*100)}%`},
    {id:"life",name:"生命力",cost:4,cap:200,desc:`每級 +${META_LIFE_STEP} 最大生命；每10級成長 +${(META_LIFE_TIER_GROWTH*100).toFixed(1)}%，最高 LV200`,value:m=>`+${scaledMetaGain(m.life,META_LIFE_STEP,META_LIFE_TIER_GROWTH).toFixed(1).replace(/\\.0$/,"")}`},
    {id:"regen",name:"回復力",cost:10,cap:200,desc:`每級 +${META_REGEN_BASE_STEP.toFixed(2)} HP/秒；每10級成長 +${META_REGEN_STAGE_STEP.toFixed(3)}，最高 LV200`,value:m=>formatMetaRegenValue(Math.max(0,m.regen||0))},
    {id:"armorPen",name:"無視防禦",cost:12,cap:100,unlock:m=>m.crit>=48,desc:"+0.7% 無視敵人防禦，最高 LV100（70%）",value:m=>`${(Math.min(100,m.armorPen)*0.7).toFixed(1).replace(/\\.0$/,"")}%`}
  ];
  let meta=loadMeta();
  normalizeMetaCaps();
  ensureEquipmentState();
  syncCoinState(true);
  let devModeActive=false;
  let shopMode="shop";
  let forgeMessage="";
  let forgeSourceMode="";
  muted=!!meta.muted;

  function defaultMeta(){
    return{
      points:0,totalKills:0,totalElites:0,totalBosses:0,totalPlaySeconds:0,
      totalDeathKills:0,totalDeaths:0,bestInfiniteSeconds:0,
      infiniteTotalKills:0,coins:0,activityCoins:0,rareBreakStones:0,breakStones:{},activityRunDate:"",activityRunsToday:0,
      claimedRewards:[],damage:0,crit:0,speed:0,critDamage:0,life:0,regen:0,armorPen:0,
      equipmentUnlockSeen:false,equipmentInventory:["bittenCarrot"],equippedWeaponId:"bittenCarrot",equippedRingId:"",shopBoughtWholeCarrot:false,equipmentEnhance:{},equipmentBreakthrough:{},forgeDailyDate:"",forgeDailyUsed:0,
      desertUnlocked:false,snowUnlocked:false,forestPathUnlocked:false,forestSeaUnlocked:false,cookieUnlocked:false,toyUnlocked:false,
      stage1Cleared:false,stage2Cleared:false,stage3Cleared:false,stage4Cleared:false,stage5Cleared:false,stage6Cleared:false,stage7Cleared:false,stage8Cleared:false,stage9Cleared:false,stage10Cleared:false,stage11Cleared:false,
      muted:false,cheat8888Used:false,cheat00020000Used:false,
      autoTrainingCharm:false,autoTrainingCharmUsedMinutes:0,autoTrainingTickets:0,autoTrainingTicketDate:"",autoTrainingTicketBoughtToday:0,
      abilityResetTickets:0,abilityResetTicketDate:"",abilityResetTicketBoughtToday:0,
      garden:defaultGardenState(),
      masterVolume:.8,synthVolume:.6,critVolume:.7,giantExplosionVolume:.75,
      graphicsMode:1,computeMode:1,performanceProfile:1
    };
  }

  function defaultGardenState(){
    return{
      seeds:3,
      fertilizer:0,
      slowFertilizer:0,
      premiumSlowFertilizer:0,
      drainShovels:0,
      insecticide:0,
      pruningScissors:0,
      supportFrames:0,
      shadeNets:0,
      moistureMeter:false,
      ecMeter:false,
      plantingCount:0,
      harvestCount:0,
      totalPlantDays:0,
      storageCap:GARDEN_STORAGE_BASE_CAP,
      storage:[],
      depositBox:[],
      records:[],
      current:null
    };
  }

  function gardenQualityDef(quality){
    return GARDEN_CARROT_QUALITIES.find(item=>item.id===quality)||GARDEN_CARROT_QUALITIES[0];
  }

  function gardenQualityIndex(quality){
    return Math.max(0,GARDEN_CARROT_QUALITIES.findIndex(item=>item.id===gardenQualityDef(quality).id));
  }

  function gardenEnhanceNeed(quality){
    const def=gardenQualityDef(quality);
    return GARDEN_ENHANCE_NEED[def.id]||GARDEN_ENHANCE_NEED.common;
  }

  function gardenEnhanceRank(level){
    const index=Math.max(0,Math.min(GARDEN_ENHANCE_MAX_LEVEL,Math.floor(Number(level)||0)));
    return GARDEN_ENHANCE_RANKS[index]||GARDEN_ENHANCE_RANKS[0];
  }

  function gardenEnhanceRankText(level){
    return `階級 ${gardenEnhanceRank(level)}`;
  }

  function gardenCarrotStoredEnergy(item){
    const carrot=normalizeGardenCarrot(item);
    const baseEnergy=gardenEnhanceNeed(carrot.quality)+Math.max(0,Math.floor(Number(carrot.exp)||0));
    return baseEnergy*Math.max(1,Math.floor(Number(carrot.level)||0));
  }

  function gardenCompostValue(item){
    return gardenQualityIndex(item?.quality)+1;
  }

  function gardenCarrotLevelFromExp(quality,exp){
    const need=gardenEnhanceNeed(quality);
    return Math.max(0,Math.min(GARDEN_ENHANCE_MAX_LEVEL,Math.floor(Math.max(0,Math.floor(Number(exp)||0))/need)));
  }

  function normalizeGardenCarrot(item){
    if(!item||typeof item!=="object")item={};
    const quality=gardenQualityDef(item.quality).id;
    const maxExp=gardenEnhanceNeed(quality)*GARDEN_ENHANCE_MAX_LEVEL;
    return{
      id:String(item.id||`gc${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`),
      quality,
      level:Math.max(0,Math.min(GARDEN_ENHANCE_MAX_LEVEL,Math.floor(Number(item.level)||0))),
      exp:Math.max(0,Math.min(maxExp,Math.floor(Number(item.exp)||0))),
      forged:!!item.forged,
      createdAt:Math.max(0,Math.floor(Number(item.createdAt)||Date.now()))
    };
  }

  function normalizeGardenChoiceEvent(event){
    const source=event&&typeof event==="object"&&!Array.isArray(event)?event:null;
    if(!source)return null;
    const choices=Array.isArray(source.choices)?source.choices.map((choice,index)=>({
      id:String(choice?.id||`choice${index}`),
      label:String(choice?.label||"選擇"),
      result:String(choice?.result||"結果已記錄。"),
      growth:Math.max(-3,Math.min(3,Math.floor(Number(choice?.growth)||0))),
      quality:Math.max(-5,Math.min(5,Number(choice?.quality)||0)),
      moisture:Math.max(-3,Math.min(3,Math.floor(Number(choice?.moisture)||0))),
      fertility:Math.max(-3,Math.min(3,Math.floor(Number(choice?.fertility)||0))),
      nutrients:Math.max(-3,Math.min(3,Math.floor(Number(choice?.nutrients)||0))),
      fertilizer:Math.max(0,Math.min(3,Math.floor(Number(choice?.fertilizer)||0))),
      stall:Math.max(0,Math.min(3,Math.floor(Number(choice?.stall)||0))),
      coins:Math.max(0,Math.min(999999,Math.floor(Number(choice?.coins)||0))),
      sellPlant:!!choice?.sellPlant
    })).filter(choice=>choice.label):[];
    if(!choices.length)return null;
    return{
      id:String(source.id||`gce${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`),
      title:String(source.title||"菜園事件"),
      text:String(source.text||"菜園裡發生了一件小事。"),
      source:String(source.source||"event"),
      eventKey:String(source.eventKey||""),
      choices
    };
  }

  function normalizeGardenRecord(record){
    const source=record&&typeof record==="object"&&!Array.isArray(record)?record:{};
    const choices=Array.isArray(source.choices)?source.choices.map((choice,index)=>({
      id:String(choice?.id||`choice${index}`),
      label:String(choice?.label||"選擇"),
      result:String(choice?.result||"結果已記錄。")
    })):[];
    return{
      id:String(source.id||`gr${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`),
      date:isDateKey(source.date)?source.date:todayKey(),
      createdAt:Math.max(0,Math.floor(Number(source.createdAt)||Date.now())),
      plantingNo:Math.max(0,Math.floor(Number(source.plantingNo)||0)),
      plantDay:Math.max(0,Math.floor(Number(source.plantDay)||0)),
      slot:GARDEN_WATER_SLOTS.includes(source.slot)?source.slot:"",
      weatherName:String(source.weatherName||""),
      kind:String(source.kind||""),
      title:String(source.title||"菜園紀錄"),
      text:String(source.text||"今天還沒有新的紀錄。"),
      choices
    };
  }

  function normalizeGardenState(garden){
    const base=defaultGardenState();
    const source=garden&&typeof garden==="object"&&!Array.isArray(garden)?garden:{};
    const storage=Array.isArray(source.storage)?source.storage.map(normalizeGardenCarrot):[];
    const depositBox=Array.isArray(source.depositBox)?source.depositBox.map(normalizeGardenCarrot):[];
    const records=Array.isArray(source.records)?source.records.map(normalizeGardenRecord).slice(-40):[];
    return{
      seeds:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"seeds")?source.seeds:base.seeds)||0)),
      fertilizer:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"fertilizer")?source.fertilizer:base.fertilizer)||0)),
      slowFertilizer:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"slowFertilizer")?source.slowFertilizer:base.slowFertilizer)||0)),
      premiumSlowFertilizer:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"premiumSlowFertilizer")?source.premiumSlowFertilizer:base.premiumSlowFertilizer)||0)),
      drainShovels:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"drainShovels")?source.drainShovels:base.drainShovels)||0)),
      insecticide:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"insecticide")?source.insecticide:base.insecticide)||0)),
      pruningScissors:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"pruningScissors")?source.pruningScissors:base.pruningScissors)||0)),
      supportFrames:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"supportFrames")?source.supportFrames:base.supportFrames)||0)),
      shadeNets:Math.max(0,Math.floor(Number(Object.prototype.hasOwnProperty.call(source,"shadeNets")?source.shadeNets:base.shadeNets)||0)),
      moistureMeter:!!source.moistureMeter,
      ecMeter:!!source.ecMeter,
      plantingCount:Math.max(0,Math.floor(Number(source.plantingCount)||0)),
      harvestCount:Math.max(0,Math.floor(Number(source.harvestCount)||0)),
      totalPlantDays:Math.max(0,Math.floor(Number(source.totalPlantDays)||0)),
      storageCap:Math.max(GARDEN_STORAGE_BASE_CAP,Math.floor(Number(source.storageCap)||base.storageCap)),
      storage,
      depositBox,
      records,
      current:normalizeGardenPlant(source.current)
    };
  }

  function gardenValidWaterSlot(slot){
    return GARDEN_WATER_SLOTS.includes(slot)?slot:gardenTimeSlot();
  }
  function gardenWaterSlotName(slot){
    return GARDEN_WATER_SLOT_NAMES[slot]||"早上";
  }
  function normalizeGardenWateredSlots(slots,legacyDate=""){
    const source=Array.isArray(slots)?slots:(legacyDate?["morning"]:[]);
    return [...new Set(source.map(slot=>String(slot||"")).filter(slot=>GARDEN_WATER_SLOTS.includes(slot)))];
  }
  function clampGardenSoilValue(value,defaultValue,maxValue=5){
    const raw=Number.isFinite(Number(value))?Number(value):defaultValue;
    return Math.max(0,Math.min(maxValue,Math.floor(raw)));
  }
  function clampGardenMoisture(value,defaultValue=GARDEN_MOISTURE_INITIAL){
    const raw=Number.isFinite(Number(value))?Number(value):defaultValue;
    return Math.max(0,Math.min(GARDEN_MOISTURE_MAX,Math.round(raw*2)/2));
  }
  function gardenMoistureValue(value){
    return Number.isFinite(Number(value))?Number(value):GARDEN_MOISTURE_INITIAL;
  }
  function clampGardenNutrients(value,defaultValue=GARDEN_NUTRIENTS_INITIAL){
    return clampGardenSoilValue(value,defaultValue,GARDEN_NUTRIENTS_MAX);
  }
  function gardenNutrientValue(value){
    return Number.isFinite(Number(value))?Number(value):GARDEN_NUTRIENTS_INITIAL;
  }
  function normalizeGardenNutrients(value,scale=""){
    const raw=Number(value);
    if(!Number.isFinite(raw))return GARDEN_NUTRIENTS_INITIAL;
    if(scale==="100")return clampGardenNutrients(raw);
    if(raw>=0&&raw<=GARDEN_NUTRIENTS_LEGACY_MAX){
      return clampGardenNutrients(Math.round(raw/GARDEN_NUTRIENTS_LEGACY_MAX*GARDEN_NUTRIENTS_MAX));
    }
    return clampGardenNutrients(raw);
  }
  function gardenNutrientEffectPoints(value){
    const raw=Math.floor(Number(value)||0);
    return raw*10;
  }
  function gardenNutrientsDepleted(value){return clampGardenNutrients(value)<=10;}
  function gardenNutrientsLow(value){return clampGardenNutrients(value)<=35;}
  function gardenNutrientsGood(value){const n=clampGardenNutrients(value); return n>=41&&n<=60;}
  function gardenNutrientsHigh(value){return clampGardenNutrients(value)>=81;}
  function gardenWateredSlotsForToday(plant,today=todayKey()){
    if(!plant)return[];
    if(plant.wateredSlotsDate!==today){
      plant.wateredSlotsDate=today;
      plant.wateredSlots=[];
    }
    plant.wateredSlots=normalizeGardenWateredSlots(plant.wateredSlots);
    return plant.wateredSlots;
  }
  function gardenRainObservedSlotsForToday(plant,today=todayKey()){
    if(!plant)return[];
    if(plant.rainObservedSlotsDate!==today){
      plant.rainObservedSlotsDate=today;
      plant.rainObservedSlots=[];
    }
    plant.rainObservedSlots=normalizeGardenWateredSlots(plant.rainObservedSlots);
    return plant.rainObservedSlots;
  }
  function gardenObservedSlotsForToday(plant,today=todayKey()){
    if(!plant)return[];
    if(plant.observeSlotsDate!==today){
      plant.observeSlotsDate=today;
      plant.observeSlots=[];
    }
    plant.observeSlots=normalizeGardenWateredSlots(plant.observeSlots);
    return plant.observeSlots;
  }
  function gardenDrainedSlotsForToday(plant,today=todayKey()){
    if(!plant)return[];
    if(plant.drainSlotsDate!==today){
      plant.drainSlotsDate=today;
      plant.drainSlots=[];
    }
    plant.drainSlots=normalizeGardenWateredSlots(plant.drainSlots);
    return plant.drainSlots;
  }
  function gardenIsRainObservation(weather,slot){
    return !!weather?.isRainy&&gardenValidWaterSlot(slot)!=="night";
  }
  function gardenHasWaterToday(plant,today=todayKey()){
    if(!plant)return false;
    return gardenWeatherForDate(today).isRainy||gardenWateredSlotsForToday(plant,today).length>0;
  }
  function gardenWeatherForDate(dateKey=todayKey()){
    const raw=String(dateKey||realTodayKey());
    let hash=0;
    for(let i=0;i<raw.length;i++)hash=(hash*31+raw.charCodeAt(i))>>>0;
    const roll=hash%100;
    if(roll<30)return{key:"rain",name:"下雨",isRainy:true,airHumidity:4+(hash%2),airTemperature:2};
    if(roll<50)return{key:"hot",name:"炎熱",isRainy:false,airHumidity:1,airTemperature:4+(hash%2)};
    if(roll<70)return{key:"clear",name:"晴朗",isRainy:false,airHumidity:2,airTemperature:2+(hash%2)};
    return{key:"cloudy",name:"陰天",isRainy:false,airHumidity:3,airTemperature:2};
  }
  function gardenEnvironmentForSlot(weather,slot){
    const validSlot=gardenValidWaterSlot(slot);
    const baseHumidity=clampGardenSoilValue(weather?.airHumidity,weather?.isRainy?4:2,5);
    const baseTemperature=clampGardenSoilValue(weather?.airTemperature,2,5);
    const slotTemp={morning:-1,noon:1,afternoon:0,night:-1}[validSlot]||0;
    const slotHumidity={morning:1,noon:-1,afternoon:0,night:1}[validSlot]||0;
    return{
      airHumidity:clampGardenSoilValue(baseHumidity+slotHumidity,2,5),
      airTemperature:clampGardenSoilValue(baseTemperature+slotTemp,2,5)
    };
  }

  function normalizeGardenPlant(plant){
    if(!plant||typeof plant!=="object"||Array.isArray(plant))return null;
    const status=["growing","dry","dead","eaten"].includes(plant.status)?plant.status:"growing";
    const condition=Object.prototype.hasOwnProperty.call(GARDEN_CONDITION_IMAGES,String(plant.condition||""))?String(plant.condition||""):"";
    return{
      id:String(plant.id||`gp${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`),
      plantingNo:Math.max(0,Math.floor(Number(plant.plantingNo)||0)),
      growth:Math.max(0,Math.min(15,Math.floor(Number(plant.growth)||0))),
      pendingGrowth:Math.max(0,Math.min(3,Math.floor(Number(plant.pendingGrowth)||0))),
      pendingGrowthDate:String(plant.pendingGrowthDate||""),
      overFertilizedDate:String(plant.overFertilizedDate||""),
      nutrientBlockDate:String(plant.nutrientBlockDate||""),
      nutrientBlockState:String(plant.nutrientBlockState||""),
      nutrientStressDate:String(plant.nutrientStressDate||""),
      nutrientDeathDate:String(plant.nutrientDeathDate||""),
      bonusGrowth:Math.max(0,Math.min(2,Math.floor(Number(plant.bonusGrowth)||0))),
      fertilizerUsed:Math.max(0,Math.floor(Number(plant.fertilizerUsed)||0)),
      slowFertilizerDays:Math.max(0,Math.min(10,Math.floor(Number(plant.slowFertilizerDays)||0))),
      slowFertilizerPower:Math.max(0,Math.min(20,Math.floor(Number(plant.slowFertilizerPower)||0))),
      missedStreak:Math.max(0,Math.floor(Number(plant.missedStreak)||0)),
      qualityShift:Math.max(-20,Math.min(20,Number(plant.qualityShift)||0)),
      airHumidity:clampGardenSoilValue(plant.airHumidity,2,5),
      airTemperature:clampGardenSoilValue(plant.airTemperature,2,5),
      moisture:clampGardenMoisture(plant.moisture),
      fertility:clampGardenSoilValue(plant.fertility,2,5),
      nutrients:normalizeGardenNutrients(plant.nutrients,plant.nutrientsScale),
      nutrientsScale:"100",
      condition,
      conditionDate:String(plant.conditionDate||""),
      status,
      eatenReason:String(plant.eatenReason||""),
      plantedDate:String(plant.plantedDate||todayKey()),
      moistureDate:String(plant.moistureDate||todayKey()),
      moistureQualityDate:String(plant.moistureQualityDate||""),
      lastCareDate:String(plant.lastCareDate||plant.plantedDate||todayKey()),
      wateredDate:String(plant.wateredDate||""),
      wateredSlotsDate:String(plant.wateredSlotsDate||plant.wateredDate||""),
      wateredSlots:normalizeGardenWateredSlots(plant.wateredSlots,plant.wateredDate),
      rainObservedSlotsDate:String(plant.rainObservedSlotsDate||""),
      rainObservedSlots:normalizeGardenWateredSlots(plant.rainObservedSlots),
      observeSlotsDate:String(plant.observeSlotsDate||""),
      observeSlots:normalizeGardenWateredSlots(plant.observeSlots),
      drainSlotsDate:String(plant.drainSlotsDate||""),
      drainSlots:normalizeGardenWateredSlots(plant.drainSlots),
      harvestReadyDate:String(plant.harvestReadyDate||""),
      eventDate:String(plant.eventDate||""),
      ambientEventKey:String(plant.ambientEventKey||""),
      choiceEventDate:String(plant.choiceEventDate||""),
      choiceEventSlot:GARDEN_WATER_SLOTS.includes(plant.choiceEventSlot)?plant.choiceEventSlot:"",
      lastEvent:plant.lastEvent&&typeof plant.lastEvent==="object"?plant.lastEvent:null,
      pendingChoiceEvent:normalizeGardenChoiceEvent(plant.pendingChoiceEvent)
    };
  }

  function createGardenCarrot(quality){
    return normalizeGardenCarrot({
      id:`gc${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`,
      quality,
      createdAt:Date.now()
    });
  }

  function rollDevGardenQuality(){
    const total=GARDEN_CARROT_QUALITIES.reduce((sum,item)=>sum+item.devWeight,0);
    let roll=Math.random()*total;
    for(const item of GARDEN_CARROT_QUALITIES){
      roll-=item.devWeight;
      if(roll<=0)return item.id;
    }
    return GARDEN_CARROT_QUALITIES[0].id;
  }

  function addGardenCarrot(quality){
    meta.garden=normalizeGardenState(meta.garden);
    const carrot=createGardenCarrot(quality);
    if(meta.garden.storage.length<meta.garden.storageCap){
      meta.garden.storage.push(carrot);
      return{carrot,location:"storage"};
    }
    meta.garden.depositBox.push(carrot);
    return{carrot,location:"depositBox"};
  }

  function addGardenCarrotToDeposit(quality){
    meta.garden=normalizeGardenState(meta.garden);
    const carrot=createGardenCarrot(quality);
    meta.garden.depositBox.push(carrot);
    return{carrot,location:"depositBox"};
  }

  function moveGardenDepositToStorage(){
    meta.garden=normalizeGardenState(meta.garden);
    let moved=0;
    while(meta.garden.depositBox.length&&meta.garden.storage.length<meta.garden.storageCap){
      meta.garden.storage.push(meta.garden.depositBox.shift());
      moved++;
    }
    return moved;
  }

  function discardGardenCarrot(action){
    meta.garden=normalizeGardenState(meta.garden);
    const index=Math.floor(Number(String(action).split(":")[1]));
    if(!Number.isFinite(index)||index<0||index>=meta.garden.storage.length){
      return{ok:false,message:"找不到這支胡蘿蔔。"};
    }
    const removed=meta.garden.storage.splice(index,1)[0];
    const def=gardenQualityDef(removed?.quality);
    const compost=gardenCompostValue(removed);
    meta.garden.fertilizer=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0))+compost;
    return{ok:true,message:`已將 ${def.rank}・${def.name} 堆肥，速效肥料 +${compost}。`};
  }

  function enhanceGardenCarrot(action){
    meta.garden=normalizeGardenState(meta.garden);
    const raw=String(action||"");
    const parts=raw.split(":");
    const baseIndex=Math.floor(Number(parts[1]));
    const materialIndexes=(parts[2]||"").split(",").map(value=>Math.floor(Number(value))).filter(Number.isFinite);
    const uniqueMaterialIndexes=[...new Set(materialIndexes)].filter(index=>index!==baseIndex);
    const storage=meta.garden.storage;
    if(!Number.isFinite(baseIndex)||baseIndex<0||baseIndex>=storage.length){
      return{ok:false,message:"請先選擇要強化的主體胡蘿蔔。"};
    }
    if(!uniqueMaterialIndexes.length){
      return{ok:false,message:"請再選其他胡蘿蔔作為素材。"};
    }
    const base=storage[baseIndex];
    if(!base){
      return{ok:false,message:"找不到強化主體。"};
    }
    if((base.level||0)>=GARDEN_ENHANCE_MAX_LEVEL){
      return{ok:false,message:`${gardenQualityDef(base.quality).name} 已經達到 ${gardenEnhanceRankText(base.level)}，可以前往鍛造屋。`};
    }
    const baseQualityIndex=gardenQualityIndex(base.quality);
    const materials=[];
    for(const index of uniqueMaterialIndexes){
      const material=storage[index];
      if(!material){
        return{ok:false,message:"素材清單裡有不存在的胡蘿蔔。"};
      }
      if(gardenQualityIndex(material.quality)>baseQualityIndex){
        return{ok:false,message:"不能吸收比主體品質更高的胡蘿蔔。"};
      }
      materials.push(material);
    }
    const oldLevel=Math.max(0,Math.floor(Number(base.level)||0));
    const oldExp=Math.max(0,Math.floor(Number(base.exp)||0));
    const gainedEnergy=materials.reduce((sum,item)=>sum+gardenCarrotStoredEnergy(item),0);
    const need=gardenEnhanceNeed(base.quality);
    const maxExp=need*GARDEN_ENHANCE_MAX_LEVEL;
    const nextExp=Math.min(maxExp,oldExp+gainedEnergy);
    base.exp=nextExp;
    base.level=gardenCarrotLevelFromExp(base.quality,nextExp);
    const removeSet=new Set(uniqueMaterialIndexes);
    meta.garden.storage=storage.filter((_,index)=>!removeSet.has(index));
    const def=gardenQualityDef(base.quality);
    const levelGain=Math.max(0,(base.level||0)-oldLevel);
    const rankText=gardenEnhanceRankText(base.level);
    const forgeHint=(base.level||0)>=GARDEN_ENHANCE_MAX_LEVEL?" 已達 S+，可前往鍛造屋。":"";
    return{
      ok:true,
      message:levelGain>0
        ? `${def.rank}・${def.name} 吸收成功，提升到 ${rankText}，共獲得 ${gainedEnergy} 點能量。${forgeHint}`
        : `${def.rank}・${def.name} 吸收完成，累積 ${gainedEnergy} 點能量，目前維持 ${rankText}。${forgeHint}`
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
  function clampProfileValue(value,fallback=1){
    return Math.max(0,Math.min(2,Math.floor(Number(value??fallback)||0)));
  }
  function normalizePerformanceSettings(data){
    const hasProfile=Number.isFinite(Number(data.performanceProfile));
    const legacyGraphics=Number.isFinite(Number(data.graphicsMode))?clampProfileValue(data.graphicsMode):1;
    const legacyCompute=Number.isFinite(Number(data.computeMode))?clampProfileValue(data.computeMode):1;
    const profile=hasProfile?clampProfileValue(data.performanceProfile):Math.min(legacyGraphics,legacyCompute);
    data.performanceProfile=profile;
    data.graphicsMode=profile;
    data.computeMode=profile;
    return data;
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
      normalizePerformanceSettings(data);
      data.autoTrainingCharm=!!data.autoTrainingCharm;
      data.autoTrainingCharmUsedMinutes=Math.max(0,Math.min(480,Math.floor(Number(data.autoTrainingCharmUsedMinutes)||0)));
      data.autoTrainingTickets=Math.max(0,Math.floor(Number(data.autoTrainingTickets)||0));
      data.autoTrainingTicketDate=String(data.autoTrainingTicketDate||"");
      data.autoTrainingTicketBoughtToday=Math.max(0,Math.floor(Number(data.autoTrainingTicketBoughtToday)||0));
      data.abilityResetTickets=Math.max(0,Math.floor(Number(data.abilityResetTickets)||0));
      data.abilityResetTicketDate=String(data.abilityResetTicketDate||"");
      data.abilityResetTicketBoughtToday=Math.max(0,Math.floor(Number(data.abilityResetTicketBoughtToday)||0));
      data.activityCoins=Math.max(0,Math.floor(Number(data.activityCoins)||0));
      data.rareBreakStones=Math.max(0,Math.floor(Number(data.rareBreakStones)||0));
      data.breakStones=normalizeBreakStoneState(data.breakStones,data.rareBreakStones);
      data.rareBreakStones=data.breakStones.rare;
      data.activityRunDate=String(data.activityRunDate||"");
      data.activityRunsToday=Math.max(0,Math.floor(Number(data.activityRunsToday)||0));
      data.garden=normalizeGardenState(data.garden);
      if(!data.equipmentBreakthrough||typeof data.equipmentBreakthrough!=="object"||Array.isArray(data.equipmentBreakthrough))data.equipmentBreakthrough={};
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
    if(data.stage3Cleared)data.forestPathUnlocked=true;
    if(data.stage4Cleared)data.forestSeaUnlocked=true;
    if(data.stage5Cleared)data.cookieUnlocked=true;
    if(data.stage6Cleared)data.toyUnlocked=true;
    return data;
  }

  function saveMeta(){
    meta.coins=Math.floor(Math.max(0,Number(meta.coins)||0));
    meta.autoTrainingCharm=!!meta.autoTrainingCharm;
    meta.autoTrainingCharmUsedMinutes=Math.max(0,Math.min(480,Math.floor(Number(meta.autoTrainingCharmUsedMinutes)||0)));
    meta.autoTrainingTickets=Math.max(0,Math.floor(Number(meta.autoTrainingTickets)||0));
    meta.autoTrainingTicketDate=String(meta.autoTrainingTicketDate||"");
    meta.autoTrainingTicketBoughtToday=Math.max(0,Math.floor(Number(meta.autoTrainingTicketBoughtToday)||0));
    meta.abilityResetTickets=Math.max(0,Math.floor(Number(meta.abilityResetTickets)||0));
    meta.abilityResetTicketDate=String(meta.abilityResetTicketDate||"");
    meta.abilityResetTicketBoughtToday=Math.max(0,Math.floor(Number(meta.abilityResetTicketBoughtToday)||0));
    meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0));
    meta.rareBreakStones=Math.max(0,Math.floor(Number(meta.rareBreakStones)||0));
    syncBreakStoneState(meta);
    meta.activityRunDate=String(meta.activityRunDate||"");
    meta.activityRunsToday=Math.max(0,Math.floor(Number(meta.activityRunsToday)||0));
    meta.garden=normalizeGardenState(meta.garden);
    if(!meta.equipmentBreakthrough||typeof meta.equipmentBreakthrough!=="object"||Array.isArray(meta.equipmentBreakthrough))meta.equipmentBreakthrough={};
    meta.masterVolume=volumeValue("masterVolume");
    meta.synthVolume=volumeValue("synthVolume");
    meta.critVolume=volumeValue("critVolume");
    meta.giantExplosionVolume=volumeValue("giantExplosionVolume");
    meta.performanceProfile=performanceProfile();
    meta.graphicsMode=meta.performanceProfile;
    meta.computeMode=meta.performanceProfile;
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
    if(isBossChallengeMode())return "頭目挑戰";
    if(currentStage===EVENT_STAGE)return isActivityTrialMode()?"強化試煉":"胡鬧的胡蘿蔔";
    if(isInfiniteMode())return infiniteZoneName();
    if(currentStage===11)return "虛空核心";
    if(currentStage===10)return "星夜鐘塔";
    if(currentStage===9)return "海底遺跡";
    if(currentStage===8)return "熔岩工坊";
    if(currentStage===7)return "玩具夢工廠";
    if(currentStage===6)return "奶油餅乾屋";
    if(currentStage===5)return "幽影樹海";
    if(currentStage===4)return "幽影林徑";
    if(currentStage===3)return "雪原";
    if(currentStage===2)return "沙漠";
    return "菜園";
  }
  function homeStageBadgeLabel(stage=currentStage){
    if(stage===INFINITE_STAGE)return "輪迴";
    if(stage===BOSS_CHALLENGE_STAGE)return "頭目";
    if(stage===EVENT_STAGE)return "活動";
    const labels={1:"菜園",2:"沙漠",3:"雪原",4:"林徑",5:"樹海",6:"餅乾屋",7:"夢工廠",8:"熔岩",9:"海底",10:"鐘塔",11:"虛空"};
    return labels[stage]||"菜園";
  }
  function updateHomeStageBadge(stage=currentStage){
    stage=1;
    if(homeStageBadgeText)homeStageBadgeText.innerHTML="我的<br>菜園";
    if(!homeStageBadgeCanvas)return;
    const bctx=homeStageBadgeCanvas.getContext("2d");
    if(!bctx)return;
    const w=homeStageBadgeCanvas.width,h=homeStageBadgeCanvas.height,cx=w/2,cy=h/2;
    bctx.clearRect(0,0,w,h);
    bctx.imageSmoothingEnabled=false;
    const palettes={
      1:["#9bd889","#6fac5e","#523323","#f17910"],
      2:["#f4c15e","#c68931","#6d4525","#f8dc73"],
      3:["#d8f4ff","#8cc7df","#31546d","#ffffff"],
      4:["#65448f","#224735","#111822","#d8d0ff"],
      5:["#444565","#193421","#0c1119","#aab3ff"],
      6:["#ffc2d6","#f5d7a2","#81544d","#ffffff"],
      7:["#8ec9ef","#e48b55","#4a5c85","#ffdd5a"],
      8:["#e15b32","#6d251e","#251214","#ffb347"],
      9:["#56c9e1","#1b566d","#092938","#9ff6ff"],
      10:["#58458f","#1b1730","#f1c95e","#fff0a8"],
      11:["#9d5cff","#12091f","#32104d","#ff8cff"],
      [INFINITE_STAGE]:["#9f57ff","#160821","#4d197a","#ff7dff"],
      [EVENT_STAGE]:["#68d7ff","#14384b","#1f7b9a","#ffe45f"],
      [BOSS_CHALLENGE_STAGE]:["#a33a3a","#1d0d16","#651c2e","#ffdb6c"]
    };
    const p=palettes[stage]||palettes[1];
    bctx.save();
    bctx.beginPath();
    bctx.arc(cx,cy,39,0,Math.PI*2);
    bctx.clip();
    const g=bctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,p[0]);
    g.addColorStop(.48,p[1]);
    g.addColorStop(1,p[2]);
    bctx.fillStyle=g;
    bctx.fillRect(0,0,w,h);
    bctx.fillStyle="rgba(255,255,255,.72)";
    bctx.fillRect(18,23,17,4);
    bctx.fillRect(47,17,15,4);
    bctx.fillStyle="rgba(0,0,0,.2)";
    bctx.fillRect(0,50,w,36);
    bctx.restore();
    bctx.lineWidth=5;
    bctx.strokeStyle="#2d1b21";
    bctx.beginPath();
    bctx.arc(cx,cy,39,0,Math.PI*2);
    bctx.stroke();
    bctx.lineWidth=3;
    bctx.strokeStyle="#b58b61";
    bctx.beginPath();
    bctx.arc(cx,cy,35,0,Math.PI*2);
    bctx.stroke();
    bctx.save();
    bctx.translate(cx,cy+6);
    if(stage===1){
      bctx.restore();
      bctx.save();
      bctx.beginPath();
      bctx.arc(cx,cy,34,0,Math.PI*2);
      bctx.clip();
      const sky=bctx.createLinearGradient(0,10,0,63);
      sky.addColorStop(0,"#f7a06b");
      sky.addColorStop(.55,"#f8c281");
      sky.addColorStop(1,"#7b442e");
      bctx.fillStyle=sky;
      bctx.fillRect(8,8,70,70);
      bctx.fillStyle="#ffe0a0";
      bctx.fillRect(14,36,58,8);
      bctx.fillStyle="#5a2f20";
      bctx.fillRect(5,49,78,28);
      bctx.fillStyle="#7c4327";
      bctx.fillRect(12,45,14,7);
      bctx.fillRect(29,52,18,6);
      bctx.fillRect(51,47,15,7);
      bctx.fillStyle="#3c211b";
      bctx.fillRect(4,58,78,18);
      bctx.fillStyle="#9b5a32";
      bctx.fillRect(18,61,12,4);
      bctx.fillRect(42,64,18,4);
      bctx.fillRect(58,56,13,4);
      bctx.fillStyle="#d85b14";
      bctx.fillRect(37,36,17,22);
      bctx.fillRect(40,55,11,9);
      bctx.fillStyle="#ff7f19";
      bctx.fillRect(34,31,18,21);
      bctx.fillRect(38,50,12,10);
      bctx.fillStyle="#ffb13f";
      bctx.fillRect(38,35,6,5);
      bctx.fillStyle="#e6a05a";
      bctx.fillRect(41,45,9,3);
      bctx.fillStyle="#123f2b";
      bctx.fillRect(42,18,8,17);
      bctx.fillRect(33,25,9,8);
      bctx.fillRect(51,26,9,8);
      bctx.fillStyle="#2f8a32";
      bctx.fillRect(43,16,9,14);
      bctx.fillRect(31,24,10,9);
      bctx.fillRect(52,25,9,9);
      bctx.fillStyle="#7bc44b";
      bctx.fillRect(46,18,4,7);
      bctx.fillRect(35,26,4,4);
      bctx.fillRect(54,27,4,4);
      bctx.restore();
      bctx.lineWidth=5;
      bctx.strokeStyle="#2d1b21";
      bctx.beginPath();
      bctx.arc(cx,cy,39,0,Math.PI*2);
      bctx.stroke();
      bctx.lineWidth=4;
      bctx.strokeStyle="#8e4f2f";
      bctx.beginPath();
      bctx.arc(cx,cy,34,0,Math.PI*2);
      bctx.stroke();
      bctx.strokeStyle="#b87544";
      bctx.lineWidth=3;
      bctx.beginPath();
      bctx.arc(cx,cy,29,Math.PI*.08,Math.PI*.92);
      bctx.stroke();
      bctx.save();
      bctx.translate(cx,cy+6);
    }else if(stage===2){
      bctx.fillStyle="#d99b39";
      bctx.beginPath();bctx.moveTo(-32,22);bctx.lineTo(-3,-5);bctx.lineTo(22,22);bctx.fill();
      bctx.fillStyle="#ffe15b";
      bctx.beginPath();bctx.arc(22,-17,10,0,Math.PI*2);bctx.fill();
      bctx.fillStyle="#21794a";bctx.fillRect(-26,0,5,24);bctx.fillRect(12,4,5,19);
    }else if(stage===3){
      bctx.fillStyle="#f0fbff";
      bctx.beginPath();bctx.moveTo(-35,24);bctx.lineTo(-3,-21);bctx.lineTo(35,24);bctx.fill();
      bctx.fillStyle="#7ec8e5";bctx.fillRect(-4,-24,8,43);bctx.fillRect(-18,-5,36,6);bctx.fillRect(-25,8,50,6);
    }else if(stage===INFINITE_STAGE||stage===11){
      bctx.strokeStyle=stage===11?"#ff7dff":"#b978ff";
      bctx.lineWidth=5;
      for(let r=8;r<26;r+=8){bctx.beginPath();bctx.arc(0,0,r,.2+r*.05,Math.PI*1.65+r*.04);bctx.stroke();}
      bctx.fillStyle=stage===11?"#ff8cff":"#de7cff";bctx.fillRect(-4,-4,8,8);
    }else if(stage===EVENT_STAGE){
      bctx.fillStyle="#3bd7ff";bctx.fillRect(-16,-18,32,17);bctx.fillStyle="#1f7b9a";bctx.fillRect(-24,-1,48,22);bctx.fillStyle="#ffe45f";bctx.fillRect(-6,-26,12,8);
    }else{
      bctx.fillStyle=p[3];
      bctx.beginPath();
      bctx.moveTo(0,-24);
      bctx.lineTo(22,-2);
      bctx.lineTo(11,26);
      bctx.lineTo(-18,19);
      bctx.lineTo(-24,-8);
      bctx.closePath();
      bctx.fill();
      bctx.fillStyle=p[0];
      bctx.fillRect(-8,-8,16,16);
    }
    bctx.restore();
  }
  function orbitRingConfig(){
    const radius=55*player.area;
    if(skills.orbit>=5)return {
      active:true,
      radius,
      thickness:24*player.area,
      hitDelay:.22,
      damage:orbitSkillDamage(),
      hitChance:.75
    };
    return {
      active:false,
      radius,
      thickness:18,
      hitDelay:.45,
      damage:orbitSkillDamage(),
      hitChance:1
    };
  }
  function skillScaledDamage(flat,attackRatio){
    return (flat+player.damage*attackRatio)*player.areaDamage;
  }
  function orbitSkillDamage(level=skills.orbit){
    const ratio=level>=5?1.3:.56+level*.25;
    return skillScaledDamage(level>=5?46:8+level*5,ratio);
  }
  function peanutSkillDamage(level=skills.peanut){
    const ratio=level>=5?2.5:1.65+level*.4;
    return skillScaledDamage(level>=5?58:9+level*8,ratio);
  }
  function peanutDebrisDamage(level=skills.peanut){
    return skillScaledDamage(14+level*2,.45+level*.08);
  }
  function pinkySkillDamage(level=skills.pinky){
    return skillScaledDamage(12+level*9,2.4+level*.42);
  }
  function burstSkillDamage(level=skills.burst){
    const ratio=level>=5?3.04:1.2+level*.38;
    return skillScaledDamage(level>=5?38:10+level*7,ratio);
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
    if(running&&!ended&&!paused&&levelScreen.classList.contains("hidden")){
      paused=true;
      testModeSilentPaused=true;
      resetStick();
      last=performance.now();loopAccumulator=0;
      pauseScreen.classList.add("hidden");
      pauseBtn.classList.add("visible");
    }
    testModeOverlay.classList.add("visible");
    testModeOverlay.setAttribute("aria-hidden","false");
    devTestBtn.classList.add("active");
    updateTestModeUi();
  }
  function closeTestModeOverlay(){
    testModeOverlay.classList.remove("visible");
    testModeOverlay.setAttribute("aria-hidden","true");
    devTestBtn.classList.remove("active");
    if(testModeSilentPaused){
      testModeSilentPaused=false;
      if(running&&!ended){
        paused=false;
        last=performance.now();loopAccumulator=0;
        pauseBtn.classList.add("visible");
      }
    }
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
    settingsHint.textContent=message||"調整音效、效能與帳號資料，可減少手機耗電量。";
    renderVolumeSettings();
    renderGraphicsSettings();
    renderComputeSettings();
    settingsOverlay.classList.add("visible");
    settingsOverlay.setAttribute("aria-hidden","false");
  }
  let quickToastTimer=null;
  function showQuickToast(message){
    const toast=document.getElementById("quickToast");
    if(!toast)return;
    toast.textContent=message||"";
    toast.classList.add("visible");
    if(quickToastTimer)clearTimeout(quickToastTimer);
    quickToastTimer=setTimeout(()=>{
      toast.classList.remove("visible");
      quickToastTimer=null;
    },1600);
  }
  function closeSettingsOverlay(){
    settingsOverlay.classList.remove("visible","dialogOnly");
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
    onConfirm=null,
    onCancel=null
  }={}){
    settingsDialogState={onConfirm,onCancel};
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
  function cancelSettingsDialog(){
    const onCancel=settingsDialogState?.onCancel;
    closeSettingsDialog();
    if(typeof onCancel==="function")onCancel();
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
        Math.round(volumeValue("giantExplosionVolume")*10),
        meta.forestPathUnlocked?1:0,
        meta.forestSeaUnlocked?1:0,
        meta.stage4Cleared?1:0,
        meta.stage5Cleared?1:0,
        meta.autoTrainingCharm?1:0,
        meta.autoTrainingCharmUsedMinutes||0,
        meta.autoTrainingTickets||0,
        meta.autoTrainingTicketDate||"",
        meta.autoTrainingTicketBoughtToday||0,
        graphicsMode(),
        meta.abilityResetTickets||0,
        meta.abilityResetTicketDate||"",
        meta.abilityResetTicketBoughtToday||0,
        meta.cookieUnlocked?1:0,
        meta.toyUnlocked?1:0,
        meta.stage6Cleared?1:0,
        meta.stage7Cleared?1:0,
        Array.isArray(meta.equipmentInventory)?meta.equipmentInventory:[],
        meta.equippedWeaponId||"bittenCarrot",
        meta.equipmentEnhance&&typeof meta.equipmentEnhance==="object"?meta.equipmentEnhance:{},
        meta.shopBoughtWholeCarrot?1:0,
        meta.stage8Cleared?1:0,
        meta.stage9Cleared?1:0,
        meta.stage10Cleared?1:0,
        meta.stage11Cleared?1:0,
        computeMode(),
        meta.equippedRingId||"",
        normalizeGardenState(meta.garden),
        meta.cheat00020000Used?1:0,
        normalizeBreakStoneState(meta.breakStones,meta.rareBreakStones)
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
          giantExplosionVolume:data.length>=29?(data[28]||0)/10:.75,
          forestPathUnlocked:data.length>=33?!!data[29]:!!data[21],
          forestSeaUnlocked:data.length>=33?!!data[30]:false,
          stage4Cleared:data.length>=33?!!data[31]:false,
          stage5Cleared:data.length>=33?!!data[32]:false,
          autoTrainingCharm:data.length>=37?!!data[33]:false,
          autoTrainingCharmUsedMinutes:data.length>=42?(data[34]||0):0,
          autoTrainingTickets:data.length>=42?(data[35]||0):(data.length>=37?(data[34]||0):0),
          autoTrainingTicketDate:data.length>=42?(data[36]||""):(data.length>=37?(data[35]||""):""),
          autoTrainingTicketBoughtToday:data.length>=42?(data[37]||0):(data.length>=37?(data[36]||0):0),
          graphicsMode:data.length>=42?Math.max(0,Math.min(2,Math.floor(Number(data[38])||0))):(data.length>=38?Math.max(0,Math.min(2,Math.floor(Number(data[37])||0))):1),
          abilityResetTickets:data.length>=42?(data[39]||0):(data.length>=41?(data[38]||0):0),
          abilityResetTicketDate:data.length>=42?(data[40]||""):(data.length>=41?(data[39]||""):""),
          abilityResetTicketBoughtToday:data.length>=42?(data[41]||0):(data.length>=41?(data[40]||0):0),
          cookieUnlocked:data.length>=46?!!data[42]:false,
          toyUnlocked:data.length>=46?!!data[43]:false,
          stage6Cleared:data.length>=46?!!data[44]:false,
          stage7Cleared:data.length>=46?!!data[45]:false,
          equipmentInventory:data.length>=50&&Array.isArray(data[46])?data[46]:["bittenCarrot"],
          equippedWeaponId:data.length>=50?(data[47]||"bittenCarrot"):"bittenCarrot",
          equipmentEnhance:data.length>=50&&data[48]&&typeof data[48]==="object"?data[48]:{},
          shopBoughtWholeCarrot:data.length>=50?!!data[49]:false,
          stage8Cleared:data.length>=54?!!data[50]:false,
          stage9Cleared:data.length>=54?!!data[51]:false,
          stage10Cleared:data.length>=54?!!data[52]:false,
          stage11Cleared:data.length>=54?!!data[53]:false,
          computeMode:data.length>=55?Math.max(0,Math.min(2,Math.floor(Number(data[54])||0))):1,
          equippedRingId:data.length>=56?(data[55]||""):"",
          garden:data.length>=57?normalizeGardenState(data[56]):defaultGardenState(),
          cheat00020000Used:data.length>=58?!!data[57]:false,
          breakStones:data.length>=59?normalizeBreakStoneState(data[58],data.length>=59?0:0):{}
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
          cheat00020000Used:!!data.c20,
          coins:data.cn||0,
          autoTrainingCharm:!!data.atc,
          autoTrainingCharmUsedMinutes:data.atm||0,
          autoTrainingTickets:data.att||0,
          autoTrainingTicketDate:data.atd||"",
          autoTrainingTicketBoughtToday:data.atb||0
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
          normalizePerformanceSettings(nextMeta);
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
        if(safePassword===POINT_8888_CODE){
          if(meta.cheat8888Used){
            openSettingsOverlay("8888 已使用過，除非刪除紀錄才會重置。");
            closeSettingsDialog();
            beep(140,.08,.02,"sawtooth");
            return;
          }
          meta.cheat8888Used=true;
          meta.points+=POINT_8888_REWARD;
          saveMeta();
          renderMeta();
          closeSettingsDialog();
          openSettingsOverlay(`已獲得 ${formatCommaNumber(POINT_8888_REWARD)} 強化點數。`);
          beep(980,.14,.04,"triangle");
          return;
        }
        if(safePassword===POINT_DEV_CODE){
          if(meta.cheat00020000Used){
            openSettingsOverlay("00020000 已使用過，除非刪除紀錄才會重置。");
            closeSettingsDialog();
            beep(140,.08,.02,"sawtooth");
            return;
          }
          meta.cheat00020000Used=true;
          meta.points+=POINT_DEV_REWARD;
          saveMeta();
          renderMeta();
          closeSettingsDialog();
          openSettingsOverlay(`已獲得 ${formatCommaNumber(POINT_DEV_REWARD)} 強化點數。`);
          beep(980,.14,.04,"triangle");
          return;
        }
        if(safePassword===POINT_MAX_CODE){
          meta.points=Math.max(Math.floor(Number(meta.points)||0),POINT_MAX_TARGET);
          saveMeta();
          renderMeta();
          closeSettingsDialog();
          openSettingsOverlay(`強化點數已達到 ${formatCommaNumber(POINT_MAX_TARGET)}。`);
          beep(980,.14,.04,"triangle");
          return;
        }
        if(safePassword===GARDEN_DEV_CARROT_CODE){
          meta.garden=normalizeGardenState(meta.garden);
          meta.garden.seeds=Math.max(99,Math.floor(Number(meta.garden.seeds)||0));
          meta.garden.fertilizer=Math.max(99,Math.floor(Number(meta.garden.fertilizer)||0));
          meta.garden.slowFertilizer=Math.max(99,Math.floor(Number(meta.garden.slowFertilizer)||0));
          meta.garden.premiumSlowFertilizer=Math.max(99,Math.floor(Number(meta.garden.premiumSlowFertilizer)||0));
          meta.garden.drainShovels=Math.max(99,Math.floor(Number(meta.garden.drainShovels)||0));
          meta.garden.insecticide=Math.max(99,Math.floor(Number(meta.garden.insecticide)||0));
          meta.garden.pruningScissors=Math.max(99,Math.floor(Number(meta.garden.pruningScissors)||0));
          meta.garden.supportFrames=Math.max(99,Math.floor(Number(meta.garden.supportFrames)||0));
          meta.garden.shadeNets=Math.max(99,Math.floor(Number(meta.garden.shadeNets)||0));
          meta.garden.moistureMeter=true;
          meta.garden.ecMeter=true;
          saveMeta();
          renderMeta();
          closeSettingsDialog();
          openSettingsOverlay("菜園測試資源已補齊：神秘種子 99、三種肥料各 99、挖溝鏟 99、殺蟲劑 99、剪刀 99、支撐架 99、遮陽網 99，並開啟水分儀與 EC 儀。");
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
    if(["speed","crit"].includes(def.id)&&level>=30){
      const extra=level-29;
      multiplier+=extra*.16+extra*extra*.022;
    }
    if(def.id==="critDamage"&&level>=30){
      const extra=level-29;
      multiplier+=extra*.22+extra*extra*.037;
    }
    if(def.id==="armorPen"&&level>=30){
      const extra=level-29;
      multiplier+=extra*.055+extra*extra*.007;
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
  function normalizeMetaCaps(){
    let refund=0;
    for(const def of metaDefs){
      const cap=metaDefCap(def);
      if(cap===undefined)continue;
      const level=Math.max(0,Math.floor(Number(meta[def.id])||0));
      if(level<=cap)continue;
      refund+=metaSpentCost(def,level)-metaSpentCost(def,cap);
      meta[def.id]=cap;
    }
    if(refund>0){
      meta.points=Math.max(0,Math.floor(Number(meta.points)||0))+refund;
    }
    return refund;
  }
  function ensureEquipmentState(){
    if(!Array.isArray(meta.equipmentInventory))meta.equipmentInventory=[];
    if(!meta.equipmentInventory.includes("bittenCarrot"))meta.equipmentInventory.unshift("bittenCarrot");
    meta.equipmentInventory=[...new Set(meta.equipmentInventory.filter(id=>EQUIPMENT_DEFS[id]))];
    if(!meta.equipmentEnhance||typeof meta.equipmentEnhance!=="object"||Array.isArray(meta.equipmentEnhance))meta.equipmentEnhance={};
    if(!meta.equipmentBreakthrough||typeof meta.equipmentBreakthrough!=="object"||Array.isArray(meta.equipmentBreakthrough))meta.equipmentBreakthrough={};
    const equipmentIds=[...meta.equipmentInventory,...gardenEquipmentItems().map(item=>item.id)];
    for(const id of equipmentIds){
      meta.equipmentEnhance[id]=Math.max(0,Math.min(10,Math.floor(Number(meta.equipmentEnhance[id])||0)));
      const raw=meta.equipmentBreakthrough[id]||{};
      meta.equipmentBreakthrough[id]={
        unlocked:!!raw.unlocked,
        level:Math.max(0,Math.min(10,Math.floor(Number(raw.level)||0)))
      };
    }
    meta.forgeDailyDate=String(meta.forgeDailyDate||"");
    meta.forgeDailyUsed=Math.max(0,Math.floor(Number(meta.forgeDailyUsed)||0));
    const weaponItem=equipmentItemById(meta.equippedWeaponId);
    if(!weaponItem||weaponItem.type!=="weapon"||!equipmentInventoryHas(meta.equippedWeaponId)){
      meta.equippedWeaponId="bittenCarrot";
    }
    if(!EQUIPMENT_DEFS[meta.equippedRingId]||!meta.equipmentInventory.includes(meta.equippedRingId)||EQUIPMENT_DEFS[meta.equippedRingId].type!=="ring"){
      meta.equippedRingId="";
    }
    meta.shopBoughtWholeCarrot=!!meta.shopBoughtWholeCarrot||meta.equipmentInventory.includes("wholeCarrot");
  }
  function equippedWeapon(){
    ensureEquipmentState();
    return equipmentItemById(meta.equippedWeaponId)||EQUIPMENT_DEFS.bittenCarrot;
  }
  function hasWholeCarrotEquipped(){
    return equippedWeapon()?.id==="wholeCarrot";
  }
  function equipmentBaseDamage(){
    return equipmentAttack(equippedWeapon());
  }
  function equipmentQualityInfo(item){
    return EQUIPMENT_QUALITY[item?.quality]||EQUIPMENT_QUALITY.normal;
  }
  function equipmentEnhanceLevel(id){
    ensureEquipmentState();
    return Math.max(0,Math.min(10,Math.floor(Number(meta.equipmentEnhance?.[id])||0)));
  }
  function equipmentBreakState(id){
    ensureEquipmentState();
    const raw=meta.equipmentBreakthrough?.[id]||{};
    return {
      unlocked:!!raw.unlocked,
      level:Math.max(0,Math.min(10,Math.floor(Number(raw.level)||0)))
    };
  }
  function setEquipmentBreakState(id,state){
    if(!meta.equipmentBreakthrough||typeof meta.equipmentBreakthrough!=="object"||Array.isArray(meta.equipmentBreakthrough))meta.equipmentBreakthrough={};
    meta.equipmentBreakthrough[id]={
      unlocked:!!state.unlocked,
      level:Math.max(0,Math.min(10,Math.floor(Number(state.level)||0)))
    };
  }
  function equipmentBreakLevel(id){
    const state=equipmentBreakState(id);
    return state.unlocked?state.level:0;
  }
  function equipmentBreakUnlocked(id){
    return equipmentBreakState(id).unlocked;
  }
  function equipmentForgeTotalLevel(id){
    return equipmentEnhanceLevel(id)+equipmentBreakLevel(id);
  }
  function forgeRuleFor(item){
    return item?item.forge||FORGE_RULES[item.quality]||null:null;
  }
  function equipmentAttack(item){
    if(!item)return 1;
    if(item.type!=="weapon")return 0;
    const rule=forgeRuleFor(item);
    const plus=rule?equipmentForgeTotalLevel(item.id)*rule.attack:0;
    return Math.max(1,Math.floor((Number(item.attack)||0)+plus));
  }
  function soulPointBonusRate(){
    ensureEquipmentState();
    const item=EQUIPMENT_DEFS.soulRing;
    if(!item||meta.equippedRingId!==item.id||!meta.equipmentInventory.includes(item.id))return 0;
    return (item.pointBonus||0)+equipmentEnhanceLevel(item.id)*(item.pointBonusPerForge||0);
  }
  function pointRewardMultiplier(){
    return 1+soulPointBonusRate();
  }
  function formatPercentRate(rate){
    return `${(rate*100).toFixed(1).replace(/\.0$/,"")}%`;
  }
  function equipmentMainStatText(item){
    if(!item)return "";
    if(item.type==="ring")return `強化點數 +${formatPercentRate((item.pointBonus||0)+equipmentEnhanceLevel(item.id)*(item.pointBonusPerForge||0))}`;
    return `攻擊力 +${equipmentAttack(item)}`;
  }
  function equipmentForgeGainText(item,rule){
    if(item?.type==="ring")return `成功 +${formatPercentRate(rule?.pointBonus||0)} 點數`;
    return `成功 +${rule?.attack||0} 攻擊`;
  }
  function equipmentForgeCost(item,rule,level=equipmentEnhanceLevel(item?.id)){
    const base=Math.max(0,Math.floor(Number(rule?.cost)||0));
    const forgeLevel=Math.max(0,Math.floor(Number(level)||0));
    return Math.max(1,Math.ceil(base*(1+forgeLevel*.01)));
  }
  function equipmentAdvancedForgeCost(item,rule,level=equipmentBreakLevel(item?.id)){
    return equipmentForgeCost(item,rule,10+level);
  }
  function resetForgeDaily(){
    const key=todayKey();
    if(meta.forgeDailyDate!==key){
      meta.forgeDailyDate=key;
      meta.forgeDailyUsed=0;
    }
  }
  function equipmentUnlocked(power=combatPower()){
    return !!meta.equipmentUnlockSeen||power>=EQUIPMENT_UNLOCK_POWER;
  }
  function baseMetaDamageValue(level=meta.damage){
    return equipmentBaseDamage()+scaledMetaGain(level,META_DAMAGE_STEP,META_DAMAGE_TIER_GROWTH);
  }
  function totalMetaAbilityLevels(){
    let total=0;
    for(const def of metaDefs)total+=Math.max(0,Math.floor(Number(meta[def.id])||0));
    return total;
  }
  function abilityResetTicketPrice(){
    return Math.max(50,Math.min(1000,50+totalMetaAbilityLevels()*10));
  }
  function resetPermanentAbilities(){
    let refund=0;
    for(const def of metaDefs){
      refund+=metaSpentCost(def,meta[def.id]||0);
      meta[def.id]=0;
    }
    meta.points+=refund;
    return refund;
  }

  function metaBulkUpgradeInfo(def,targetCount){
    let points=meta.points;
    let level=meta[def.id]||0;
    let count=0;
    let totalCost=0;
    const cap=metaDefCap(def);
    while(count<targetCount){
      if(cap!==undefined&&level>=cap)break;
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
  function drawAutoTrainingHudText(x,y,align="right"){
    if(!autoTrainingActive)return;
    ctx.save();
    ctx.font="bold 14px sans-serif";
    ctx.textAlign=align;
    ctx.textBaseline="middle";
    ctx.lineWidth=3;
    ctx.strokeStyle="#111";
    ctx.fillStyle="#8fffd0";
    ctx.strokeText("自動選技中",x,y);
    ctx.fillText("自動選技中",x,y);
    ctx.restore();
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
      if(devModeActive&&coinDebugExpanded){
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
  function graphicsMode(){
    return performanceProfile();
  }
  function computeMode(){
    return performanceProfile();
  }
  function performanceProfile(){
    return clampProfileValue(meta.performanceProfile);
  }
  function performanceConfig(){
    return PERFORMANCE_PROFILES[performanceProfile()]||PERFORMANCE_PROFILES[1];
  }
  function currentMaxFps(){
    return performanceConfig().maxFps||60;
  }
  function renderGraphicsSettings(){
    if(!graphicsSettings)return;
    const mode=performanceProfile();
    for(const button of graphicsSettings.querySelectorAll("button[data-performance-profile]")){
      button.classList.toggle("active",Number(button.dataset.performanceProfile)===mode);
    }
  }
  function graphicsTextLimit(kind){
    const limits=performanceConfig().textLimits||{};
    return limits[kind]??limits.default??999;
  }
  function graphicsCriticalProfile(){
    return performanceConfig().critProfile;
  }
  function graphicsBurstCount(n){
    const burst=performanceConfig().burst||{};
    const cap=n>=(burst.largeThreshold??12)?burst.largeCap:burst.smallCap;
    return Math.min(n,cap??n);
  }
  function graphicsGemPressureConfig(){
    return performanceConfig().gemPressure;
  }
  function graphicsGemFarConfig(){
    return performanceConfig().gemFar;
  }
  function graphicsGroundStride(){
    return performanceConfig().groundStride;
  }
  function graphicsPerfSampleSeconds(){
    return performanceConfig().perfSampleSeconds;
  }
  function pruneGraphicsEffects(){
    for(const kind of ["normal","critical","boss"]){
      const limit=graphicsTextLimit(kind);
      if(limit<=0)texts=texts.filter(t=>t.kind!==kind);
      else{
        let seen=0;
        texts=texts.filter(t=>{
          if(t.kind!==kind)return true;
          seen++;
          return seen<=limit;
        });
      }
    }
    const config=performanceConfig();
    const disabledKinds=new Set(config.disabledEffectKinds||[]);
    if(disabledKinds.size)effects=effects.filter(e=>!disabledKinds.has(e.kind));
    if(Number.isFinite(config.particleCap)){
      let particles=0;
      effects=effects.filter(e=>{
        if(!["particle","chip"].includes(e.kind))return true;
        particles++;
        return particles<=config.particleCap;
      });
    }
  }
  function setGraphicsMode(value){
    setPerformanceProfile(value);
  }
  function renderComputeSettings(){
    renderGraphicsSettings();
  }
  function computeGridStride(){
    return performanceConfig().gridStride;
  }
  function computeEnemyCap(){
    return performanceConfig().enemyCap;
  }
  function computeTargetTTL(){
    return performanceConfig().targetTtl;
  }
  function computeOffScreenDiv(){
    return performanceConfig().offScreenDiv;
  }
  function computeHudInterval(){
    return performanceConfig().hudInterval;
  }
  function computeSectorCount(){
    return performanceConfig().sectorCount;
  }
  function setComputeMode(value){
    setPerformanceProfile(value);
  }
  function setPerformanceProfile(value){
    meta.performanceProfile=clampProfileValue(value);
    meta.graphicsMode=meta.performanceProfile;
    meta.computeMode=meta.performanceProfile;
    groundCache.zone=null;
    pruneGraphicsEffects();
    saveMeta();
    renderComputeSettings();
    renderGraphicsSettings();
    playUiClick();
  }
  function usesTimedMonsterBudget(){
    return !isInfiniteMode()&&!isBossChallengeMode()&&!isEventMode()&&currentStage>=2&&currentStage<=10;
  }
  function calcKpsSpawnBonus(value=kps){
    if(value<=0)return 0;
    if(value<=50)return Math.min(10,Math.ceil(value/10)*2);
    return Math.min(30,10+Math.ceil((Math.min(value,100)-50)/10)*4);
  }
  function timedMonsterBudget(){
    const sec=Math.max(0,time);
    let base=20+Math.round(Math.min(1,sec/30)*30);
    let waveSeconds=0;
    if(sec>=30){
      const minutePhase=sec%60;
      const isWave=sec>=60&&minutePhase<5;
      waveSeconds=isWave?Math.max(0,5-minutePhase):0;
      const growth=clamp((sec-30)/(DURATION-30),0,1);
      base=isWave?Math.round(180+20*growth):Math.round(100+50*growth);
    }
    return {base,waveSeconds};
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
  function autoTrainingCharmStatusText(){
    if(!meta.autoTrainingCharm)return "輪迴專用・自動選技・經驗 +20%";
    const used=Math.max(0,Math.min(480,Math.floor(Number(meta.autoTrainingCharmUsedMinutes)||0)));
    const loss=Math.min(100,Math.floor(used/480*100));
    const remain=Math.max(0,480-used);
    return `持有｜損耗 ${loss}%｜剩餘 ${remain} 分`;
  }
  function renderShop(){
    syncCoinDisplay();
    if(!shopGrid)return;
    resetAutoTrainingDailyPurchase();
    resetForgeDaily();
    const forgeMode=shopMode==="forge";
    const eventMode=shopMode==="event";
    shopTitle.textContent="冒險市集";
    shopModeShopBtn?.classList.toggle("active",!forgeMode&&!eventMode);
    shopModeForgeBtn?.classList.toggle("active",forgeMode);
    shopModeEventBtn?.classList.toggle("active",eventMode);
    shopGrid.classList.toggle("forgeGrid",forgeMode);
    shopGrid.classList.toggle("eventGrid",eventMode);
    document.querySelector(".shopHero")?.classList.toggle("forgeHero",forgeMode);
    document.querySelector(".shopHero")?.classList.toggle("eventHero",eventMode);
    if(forgeMode){
      renderForgeShop();
      return;
    }
    if(eventMode){
      renderEventShop();
      return;
    }
    const canBuyCharm=!meta.autoTrainingCharm&&walletCoins>=6000;
    const ticketBought=Math.max(0,Math.floor(Number(meta.autoTrainingTicketBoughtToday)||0));
    const canBuyTicket=ticketBought<3&&walletCoins>=300;
    const resetTicketBought=Math.max(0,Math.floor(Number(meta.abilityResetTicketBoughtToday)||0));
    const resetTicketPrice=abilityResetTicketPrice();
    const canBuyResetTicket=resetTicketBought<1&&walletCoins>=resetTicketPrice;
    const showEquipmentShop=equipmentUnlocked();
    const wholeCarrot=EQUIPMENT_DEFS.wholeCarrot;
    const soulRing=EQUIPMENT_DEFS.soulRing;
    const ownsWholeCarrot=meta.shopBoughtWholeCarrot||meta.equipmentInventory?.includes("wholeCarrot");
    const ownsSoulRing=meta.equipmentInventory?.includes("soulRing");
    const goods=[
      {icon:"📿",name:"自動研修護符",state:meta.autoTrainingCharm?"SOLD":"BUY",price:6000,disabled:meta.autoTrainingCharm||!canBuyCharm,sub:autoTrainingCharmStatusText(),action:"charm"},
      {icon:"🎟️",name:"自動研修券",state:ticketBought>=3?"SOLD":"BUY",price:300,disabled:ticketBought>=3||!canBuyTicket,sub:`一般關卡用｜持有 ${meta.autoTrainingTickets||0}｜今日 ${ticketBought}/3`,action:"ticket"},
      {icon:"🔄",name:"能力重置券",state:resetTicketBought>=1?"SOLD":"BUY",price:resetTicketPrice,disabled:resetTicketBought>=1||!canBuyResetTicket,sub:`重置永久能力並退還點數｜持有 ${meta.abilityResetTickets||0}｜今日 ${resetTicketBought}/1`,action:"abilityReset"}
    ];
    if(showEquipmentShop){
      goods.push({icon:"🥕",name:wholeCarrot.name,state:ownsWholeCarrot?"SOLD":"BUY",price:wholeCarrot.price,disabled:ownsWholeCarrot||walletCoins<wholeCarrot.price,sub:"稀有武器｜攻擊力 +100｜購買後放入裝備欄",action:"wholeCarrot"});
      goods.push({icon:"💍",name:soulRing.name,state:ownsSoulRing?"SOLD":"BUY",price:soulRing.price,disabled:ownsSoulRing||walletCoins<soulRing.price,sub:"稀有戒指｜穿戴後強化點數 +5%｜可鍛造至 +10",action:"soulRing"});
    }
    shopGrid.innerHTML=goods.map((item,index)=>{
      if(Array.isArray(item)){
        const [icon,name,state]=item;
        item={icon,name,state,disabled:state==="SOLD",sub:"尚未上架"};
      }
      const buttonClass=item.state==="BUY"?"shopBuyBtn":"shopSoldBtn";
      const buttonText=item.state==="BUY"?`BUY ${formatCommaNumber(item.price||0)}`:"SOLD";
      return `
      <div class="shopCard">
        <div class="shopCardIcon">${item.icon}</div>
        <div class="shopCardName">${item.name}</div>
        <div class="shopCardSub">${item.sub||""}</div>
        <button type="button" class="${buttonClass}" data-shop-action="${item.action||""}" ${item.disabled?"disabled":""}>${buttonText}</button>
      </div>
    `;}).join("");
  }
  function renderEventShop(){
    syncCoinDisplay();
    meta.garden=normalizeGardenState(meta.garden);
    const activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0));
    const stones=breakStoneCount("rare");
    const fertilizer=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0));
    const slowFertilizer=Math.max(0,Math.floor(Number(meta.garden.slowFertilizer)||0));
    const premiumSlowFertilizer=Math.max(0,Math.floor(Number(meta.garden.premiumSlowFertilizer)||0));
    const drainShovels=Math.max(0,Math.floor(Number(meta.garden.drainShovels)||0));
    const insecticide=Math.max(0,Math.floor(Number(meta.garden.insecticide)||0));
    const pruningScissors=Math.max(0,Math.floor(Number(meta.garden.pruningScissors)||0));
    const supportFrames=Math.max(0,Math.floor(Number(meta.garden.supportFrames)||0));
    const shadeNets=Math.max(0,Math.floor(Number(meta.garden.shadeNets)||0));
    const hasMoistureMeter=!!meta.garden.moistureMeter;
    const hasEcMeter=!!meta.garden.ecMeter;
    const canBuyStone=activityCoins>=RARE_BREAK_STONE_PRICE;
    const canBuyDrainShovel=activityCoins>=GARDEN_DRAIN_SHOVEL_PRICE;
    const canBuyMoistureMeter=!hasMoistureMeter&&activityCoins>=GARDEN_MOISTURE_METER_PRICE;
    const canBuyEcMeter=!hasEcMeter&&activityCoins>=GARDEN_EC_METER_PRICE;
    const canBuyInsecticide=activityCoins>=GARDEN_INSECTICIDE_PRICE;
    const canBuyPruningScissors=activityCoins>=GARDEN_PRUNING_SCISSORS_PRICE;
    const canBuySupportFrame=activityCoins>=GARDEN_SUPPORT_FRAME_PRICE;
    const canBuyShadeNet=activityCoins>=GARDEN_SHADE_NET_PRICE;
    const canBuyFertilizer=activityCoins>=GARDEN_FERTILIZER_PRICE;
    const canBuySlowFertilizer=activityCoins>=GARDEN_SLOW_FERTILIZER_PRICE;
    const canBuyPremiumSlowFertilizer=activityCoins>=GARDEN_PREMIUM_SLOW_FERTILIZER_PRICE;
    const devTools=devModeActive?`
      <div class="shopEventBalance shopEventDevTools"><span>開發工具｜活動幣</span>
        <button type="button" class="shopBuyBtn" data-dev-shop-action="activityCoinSub">-100</button>
        <button type="button" class="shopBuyBtn" data-dev-shop-action="activityCoinAdd">+100</button>
      </div>
    `:"";
    shopGrid.innerHTML=`
      ${devTools}
      <div class="shopEventBalance">活動兌換幣 ${formatCommaNumber(activityCoins)}</div>
      <div class="shopEventSectionTitle">原石系列</div>
      <div class="shopCard">
        <div class="shopCardIcon">🔷</div>
        <div class="shopCardName">稀有突破原石</div>
        <div class="shopCardSub">稀有裝備鍛造 +10 後可突破｜持有 ${formatCommaNumber(stones)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="rareBreakStone" ${canBuyStone?"":"disabled"}>BUY 活動幣 ${RARE_BREAK_STONE_PRICE}</button>
      </div>
      <div class="shopEventSectionTitle">菜園系列</div>
      <div class="shopCard">
        <div class="shopCardIcon meterShopIcon"><img src="assets/garden/meters/shop-moisture-meter.png?v=${APP_VERSION}" alt=""></div>
        <div class="shopCardName">土壤水分儀</div>
        <div class="shopCardSub">菜園左下顯示水分｜${hasMoistureMeter?"已購買":"尚未購買"}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenMoistureMeter" ${canBuyMoistureMeter?"":"disabled"}>${hasMoistureMeter?"已擁有":`BUY 活動幣 ${GARDEN_MOISTURE_METER_PRICE}`}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon meterShopIcon"><img src="assets/garden/meters/shop-ec-meter.png?v=${APP_VERSION}" alt=""></div>
        <div class="shopCardName">土壤 EC 儀</div>
        <div class="shopCardSub">菜園右下顯示養分｜${hasEcMeter?"已購買":"尚未購買"}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenEcMeter" ${canBuyEcMeter?"":"disabled"}>${hasEcMeter?"已擁有":`BUY 活動幣 ${GARDEN_EC_METER_PRICE}`}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">🌿</div>
        <div class="shopCardName">速效肥料</div>
        <div class="shopCardSub">立即補養分，沿用原本施肥效果｜持有 ${formatCommaNumber(fertilizer)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenFertilizer" ${canBuyFertilizer?"":"disabled"}>BUY 活動幣 ${GARDEN_FERTILIZER_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">🌱</div>
        <div class="shopCardName">緩釋肥料</div>
        <div class="shopCardSub">當下補養分，之後 3 天每天再補｜持有 ${formatCommaNumber(slowFertilizer)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenSlowFertilizer" ${canBuySlowFertilizer?"":"disabled"}>BUY 活動幣 ${GARDEN_SLOW_FERTILIZER_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">🌾</div>
        <div class="shopCardName">高級緩釋肥料</div>
        <div class="shopCardSub">當下補養分，之後 5 天每天再補，品質 +1%｜持有 ${formatCommaNumber(premiumSlowFertilizer)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenPremiumSlowFertilizer" ${canBuyPremiumSlowFertilizer?"":"disabled"}>BUY 活動幣 ${GARDEN_PREMIUM_SLOW_FERTILIZER_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">⛏️</div>
        <div class="shopCardName">菜園挖溝鏟</div>
        <div class="shopCardSub">雨天排水專用｜持有 ${formatCommaNumber(drainShovels)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenDrainShovel" ${canBuyDrainShovel?"":"disabled"}>BUY 活動幣 ${GARDEN_DRAIN_SHOVEL_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">🐞</div>
        <div class="shopCardName">菜園殺蟲劑</div>
        <div class="shopCardSub">處理毛毛蟲與葉片蟲咬｜持有 ${formatCommaNumber(insecticide)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenInsecticide" ${canBuyInsecticide?"":"disabled"}>BUY 活動幣 ${GARDEN_INSECTICIDE_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">✂️</div>
        <div class="shopCardName">園藝剪刀</div>
        <div class="shopCardSub">處理菌害擴散與病葉｜持有 ${formatCommaNumber(pruningScissors)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenPruningScissors" ${canBuyPruningScissors?"":"disabled"}>BUY 活動幣 ${GARDEN_PRUNING_SCISSORS_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">🪵</div>
        <div class="shopCardName">菜園支撐架</div>
        <div class="shopCardSub">處理颱風、倒伏與強風｜持有 ${formatCommaNumber(supportFrames)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenSupportFrame" ${canBuySupportFrame?"":"disabled"}>BUY 活動幣 ${GARDEN_SUPPORT_FRAME_PRICE}</button>
      </div>
      <div class="shopCard">
        <div class="shopCardIcon">⛱️</div>
        <div class="shopCardName">菜園遮陽網</div>
        <div class="shopCardSub">處理炎熱、酷熱與烈日｜持有 ${formatCommaNumber(shadeNets)}</div>
        <button type="button" class="shopBuyBtn" data-shop-action="gardenShadeNet" ${canBuyShadeNet?"":"disabled"}>BUY 活動幣 ${GARDEN_SHADE_NET_PRICE}</button>
      </div>
    `;
  }
  function adjustActivityCoinsForDev(delta){
    if(!devModeActive)return;
    meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0)+Math.floor(Number(delta)||0));
    saveMeta();
    renderShop();
    beep(delta>=0?780:240,.08,.02,"square");
    countAudioSubtype("ui");
  }
  function resetEquipmentForDev(){
    if(!devModeActive)return;
    meta.equipmentInventory=["bittenCarrot"];
    meta.equippedWeaponId="bittenCarrot";
    meta.equippedRingId="";
    meta.shopBoughtWholeCarrot=false;
    meta.equipmentEnhance={};
    meta.equipmentBreakthrough={};
    meta.forgeDailyDate=todayKey();
    meta.forgeDailyUsed=0;
    forgeMessage="開發模式：裝備已初始化";
    ensureEquipmentState();
    saveMeta();
    renderMeta();
    renderShop();
    beep(760,.12,.035,"triangle");
    countAudioSubtype("ui");
  }
  function resetDailyLimitsForDev(){
    if(!devModeActive)return;
    const key=todayKey();
    meta.forgeDailyDate=key;
    meta.forgeDailyUsed=0;
    meta.activityRunDate=key;
    meta.activityRunsToday=0;
    meta.autoTrainingTicketDate=key;
    meta.autoTrainingTicketBoughtToday=0;
    meta.abilityResetTicketDate=key;
    meta.abilityResetTicketBoughtToday=0;
    forgeMessage="開發模式：今日次數已重置";
    saveMeta();
    renderMeta();
    renderShop();
    beep(860,.12,.03,"triangle");
    countAudioSubtype("ui");
  }
  function gardenForgeAttack(quality){
    const def=gardenQualityDef(quality);
    return GARDEN_FORGE_ATTACK[def.id]||0;
  }
  function gardenEquipmentId(carrot){
    return `${GARDEN_EQUIPMENT_PREFIX}${String(carrot?.id||"")}`;
  }
  function gardenEquipmentQuality(quality){
    const id=gardenQualityDef(quality).id;
    return id==="common"?"normal":id;
  }
  function gardenEquipmentFromCarrot(item){
    const carrot=normalizeGardenCarrot(item);
    if(!carrot.forged)return null;
    const def=gardenQualityDef(carrot.quality);
    return{
      id:gardenEquipmentId(carrot),
      name:def.name,
      type:"weapon",
      quality:gardenEquipmentQuality(def.id),
      attack:gardenForgeAttack(def.id),
      source:"garden",
      carrotId:carrot.id,
      asset:def.asset
    };
  }
  function gardenEquipmentItems(){
    meta.garden=normalizeGardenState(meta.garden);
    const seen=new Set();
    return [...(meta.garden.storage||[]),...(meta.garden.depositBox||[])]
      .map(gardenEquipmentFromCarrot)
      .filter(item=>{
        if(!item||seen.has(item.id))return false;
        seen.add(item.id);
        return true;
      });
  }
  function equipmentItemById(id){
    const key=String(id||"");
    return EQUIPMENT_DEFS[key]||gardenEquipmentItems().find(item=>item.id===key)||null;
  }
  function equipmentInventoryItems(){
    const seen=new Set();
    return [...meta.equipmentInventory.map(id=>EQUIPMENT_DEFS[id]).filter(Boolean),...gardenEquipmentItems()]
      .filter(item=>{
        if(!item||seen.has(item.id))return false;
        seen.add(item.id);
        return true;
      });
  }
  function equipmentInventoryHas(id){
    const key=String(id||"");
    if(EQUIPMENT_DEFS[key])return meta.equipmentInventory.includes(key);
    return gardenEquipmentItems().some(item=>item.id===key);
  }
  function equipmentDismantleBlockReason(item){
    if(!item)return "找不到這件裝備";
    if(item.id==="bittenCarrot")return "初始武器不能分解";
    if(item.source==="shop")return "商店購買的裝備不能分解成突破原石";
    if(item.type==="weapon"&&meta.equippedWeaponId===item.id)return "正在穿戴的裝備不能分解";
    if(item.type==="ring"&&meta.equippedRingId===item.id)return "正在穿戴的裝備不能分解";
    return "";
  }
  function canDismantleEquipment(item){
    if(equipmentDismantleBlockReason(item))return false;
    return item.type==="weapon"||item.type==="ring";
  }
  function removeGardenCarrotById(carrotId){
    const target=String(carrotId||"");
    if(!target)return false;
    meta.garden=normalizeGardenState(meta.garden);
    let removed=false;
    meta.garden.storage=(meta.garden.storage||[]).filter(item=>{
      if(!removed&&String(item.id)===target){removed=true;return false;}
      return true;
    });
    if(!removed){
      meta.garden.depositBox=(meta.garden.depositBox||[]).filter(item=>{
        if(!removed&&String(item.id)===target){removed=true;return false;}
        return true;
      });
    }
    return removed;
  }
  function dismantleEquipment(id){
    ensureEquipmentState();
    const item=equipmentItemById(id);
    if(!item||!equipmentInventoryHas(id)){
      forgeMessage="找不到這件裝備";
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    if(!canDismantleEquipment(item)){
      forgeMessage=equipmentDismantleBlockReason(item)||"這件裝備不能分解";
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    const stoneQuality=breakStoneQualityKey(item.quality);
    addBreakStone(stoneQuality,1);
    if(item.source==="garden"){
      removeGardenCarrotById(item.carrotId);
    }else{
      meta.equipmentInventory=meta.equipmentInventory.filter(equipId=>equipId!==item.id);
      if(item.id==="wholeCarrot")meta.shopBoughtWholeCarrot=false;
    }
    delete meta.equipmentEnhance[item.id];
    delete meta.equipmentBreakthrough[item.id];
    if(meta.equippedWeaponId===item.id)meta.equippedWeaponId="bittenCarrot";
    if(meta.equippedRingId===item.id)meta.equippedRingId="";
    forgeMessage=`${item.name} 已分解，獲得 ${breakStoneName(stoneQuality)} x1。`;
    saveMeta();
    renderShop();
    renderMeta();
    beep(620,.14,.035,"triangle");
  }
  function mergeBreakStone(quality){
    const key=breakStoneQualityKey(quality);
    const next=nextBreakStoneQuality(key);
    if(!next){
      forgeMessage="這個品質已經是最高階，無法再合成。";
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    if(!spendBreakStone(key,BREAK_STONE_MERGE_COST)){
      forgeMessage=`需要 ${breakStoneName(key)} x${BREAK_STONE_MERGE_COST} 才能合成。`;
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    addBreakStone(next,1);
    forgeMessage=`已合成 ${breakStoneName(next)} x1。`;
    saveMeta();
    renderShop();
    beep(760,.14,.035,"triangle");
  }
  function renderBreakStoneMergePanel({showHeader=true}={}){
    const stones=syncBreakStoneState(meta);
    const rows=BREAK_STONE_QUALITIES.map(quality=>{
      const next=nextBreakStoneQuality(quality);
      if(!next)return "";
      const count=Math.max(0,Math.floor(Number(stones[quality])||0));
      const ready=count>=BREAK_STONE_MERGE_COST;
      return `
        <div class="breakStoneMergeItem ${ready?"ready":""}">
          <div class="breakStoneMergeInfo">
            <b>${breakStoneName(quality)}</b>
            <small>持有 ${formatCommaNumber(count)}｜${BREAK_STONE_MERGE_COST} 合 1 → ${breakStoneName(next)}</small>
          </div>
          <button type="button" class="shopBuyBtn" data-break-stone-merge="${quality}" ${ready?"":"disabled"}>合成</button>
        </div>
      `;
    }).filter(Boolean).join("");
    return `
      <div class="breakStoneMergeBox">
        ${showHeader?`<div class="forgeHeader">
          <b>突破原石合成</b>
          <span>${BREAK_STONE_MERGE_COST} 顆同階原石可合成 1 顆下一階原石。</span>
        </div>`:""}
        <div class="breakStoneMergeGrid">${rows}</div>
      </div>
    `;
  }
  function gardenReadyForgeItems(){
    meta.garden=normalizeGardenState(meta.garden);
    return (meta.garden.storage||[])
      .map((item,index)=>({item,index,def:gardenQualityDef(item.quality)}))
      .filter(({item})=>Math.max(0,Math.floor(Number(item.level)||0))>=GARDEN_ENHANCE_MAX_LEVEL);
  }
  function renderForgeShop(){
    ensureEquipmentState();
    syncCoinDisplay();
    const used=Math.max(0,Math.floor(Number(meta.forgeDailyUsed)||0));
    const forgeable=equipmentInventoryItems().filter(item=>item&&(forgeRuleFor(item)||canDismantleEquipment(item)));
    const gardenForgeItems=gardenReadyForgeItems();
    const devTools=devModeActive?`
      <div class="forgeHeader">
        <b>開發工具</b>
        <button type="button" class="shopBuyBtn" data-dev-shop-action="equipmentInit">裝備初始化</button>
        <button type="button" class="shopBuyBtn" data-dev-shop-action="dailyReset">重置今日次數</button>
      </div>
    `:"";
    if(!["normal","garden","stone"].includes(forgeSourceMode)){
      shopGrid.innerHTML=`
        <div class="forgePanel">
          ${devTools}
          <div class="forgeHeader">
            <b>選擇鍛造來源</b>
            <span>先選裝備來源，再進入對應列表。</span>
          </div>
          <div class="forgeSourceList">
            <div class="forgeSourceItem stone">
              <div class="forgeSourceInfo">
                <b>合成突破原石</b>
                <small>${BREAK_STONE_MERGE_COST} 顆同階原石可合成 1 顆下一階原石。</small>
              </div>
              <button type="button" class="shopBuyBtn" data-forge-source="stone">選擇</button>
            </div>
            <div class="forgeSourceItem">
              <div class="forgeSourceInfo">
                <b>一般關卡</b>
                <small>一般關卡與精靈商店取得的裝備。</small>
              </div>
              <button type="button" class="shopBuyBtn" data-forge-source="normal">選擇裝備</button>
            </div>
            <div class="forgeSourceItem garden">
              <div class="forgeSourceInfo">
                <b>菜園</b>
                <small>菜園胡蘿蔔吸收到 S+ 後可鍛造。</small>
              </div>
              <button type="button" class="shopBuyBtn" data-forge-source="garden">選擇裝備</button>
            </div>
          </div>
        </div>
      `;
      return;
    }
    shopGrid.innerHTML=`
      <div class="forgePanel">
        ${devTools}
        <div class="forgeHeader forgeSubHeader">
          <b>${forgeSourceMode==="stone"?"突破原石合成":forgeSourceMode==="garden"?"菜園胡蘿蔔鍛造":`今日鍛造 ${used}/${FORGE_DAILY_LIMIT}`}</b>
          <span>${forgeMessage||(forgeSourceMode==="stone"?`${BREAK_STONE_MERGE_COST} 顆同階原石可合成 1 顆下一階原石。｜${breakStoneInventoryText()}`:forgeSourceMode==="garden"?"S+ 胡蘿蔔可直接鍛造":`藍框以上裝備可鍛造，單件最高 +10。｜${breakStoneInventoryText()}`)}</span>
          <button type="button" class="forgeBackBtn" data-forge-source-back>返回分類</button>
        </div>
        ${forgeSourceMode==="stone"?renderBreakStoneMergePanel({showHeader:false}):""}
        ${forgeSourceMode==="normal"?(forgeable.length?`
          <div class="forgeList">
            ${forgeable.map(item=>{
            const rule=forgeRuleFor(item);
            const canForge=!!rule;
            const quality=equipmentQualityInfo(item);
            const level=equipmentEnhanceLevel(item.id);
            const breakState=equipmentBreakState(item.id);
            const advanced=breakState.unlocked;
            const advancedLevel=advanced?breakState.level:0;
            const totalLevel=level+advancedLevel;
            const canBreak=canForge&&item.type==="weapon"&&item.quality==="rare"&&level>=10&&!advanced;
            const statText=equipmentMainStatText(item);
            const gainText=canForge?equipmentForgeGainText(item,rule):"不可鍛造，可分解";
            const forgeCost=canForge?(advanced?equipmentAdvancedForgeCost(item,rule,advancedLevel):equipmentForgeCost(item,rule,level)):0;
            const maxed=canForge?(advanced?advancedLevel>=10:(level>=10&&!canBreak)):true;
            const needsStone=canBreak&&breakStoneCount(item.quality)<1;
            const blocked=canForge?(canBreak?needsStone:(used>=FORGE_DAILY_LIMIT||maxed||walletCoins<forgeCost)):true;
            const dismantleable=canDismantleEquipment(item);
            return `
              <div class="forgeItem ${quality.className}${canBreak?" breakReady":""}">
                <div class="forgeItemInfo">
                  <b>${item.name} <span class="${quality.className}">${quality.name}</span>${totalLevel?` +${totalLevel}`:""}</b>
                  <small>目前${statText}｜鍛造 +${level}/10${advanced?`｜進階 +${advancedLevel}/10`:""}｜${canForge?`成功率 ${Math.round(rule.success*100)}%`:"不可鍛造"}｜${gainText}</small>
                </div>
                <div class="forgeItemActions">
                  <button type="button" class="shopBuyBtn" data-forge-id="${item.id}" ${blocked?"disabled":""}>
                    ${!canForge?"不可鍛造":canBreak?(needsStone?`需要${breakStoneName(item.quality)}`:"突破"):maxed?"已滿級":used>=FORGE_DAILY_LIMIT?"今日已滿":walletCoins<forgeCost?"鑽石不足":`鍛造 💎 ${formatCommaNumber(forgeCost)}`}
                  </button>
                  <button type="button" class="shopBuyBtn dismantleBtn" data-dismantle-id="${item.id}" ${dismantleable?"":"disabled"}>
                    ${dismantleable?`分解｜${breakStoneName(item.quality)} +1`:"不可分解"}
                  </button>
                </div>
              </div>
            `;
            }).join("")}
          </div>
        `:`<div class="forgeEmpty">尚未持有可鍛造裝備。<br>先到精靈商店購買藍框以上武器。</div>`):""}
        ${forgeSourceMode==="garden"?`<div class="gardenForgeBox compact">
          <div class="forgeHeader gardenForgeHeader">
            <b>菜園胡蘿蔔鍛造</b>
            <span>${gardenForgeItems.length?"S+ 胡蘿蔔可直接鍛造":"吸收到 S+ 後會出現在這裡"}</span>
          </div>
          <div class="forgeList gardenForgeList">
            ${gardenForgeItems.length?gardenForgeItems.map(({item,index,def})=>{
              const attack=gardenForgeAttack(item.quality);
              return `
                <div class="forgeItem gardenForgeItem ${item.forged?"forged":""}">
                  <img class="gardenForgeIcon" src="${def.asset}" alt="${def.name}">
                  <div class="forgeItemInfo">
                    <b>${def.name} <span>${def.rank}</span> ${gardenEnhanceRankText(item.level)}</b>
                    <small>${item.forged?"已鍛造，裝備鍛造 +0":"可鍛造"}｜鍛造後攻擊力 +${formatCommaNumber(attack)}</small>
                  </div>
                  <button type="button" class="shopBuyBtn" data-garden-forge-index="${index}" ${item.forged?"disabled":""}>
                    ${item.forged?"已鍛造":"鍛造"}
                  </button>
                </div>
              `;
            }).join(""):`<div class="forgeEmpty gardenForgeEmpty">尚未有 S+ 的菜園胡蘿蔔。</div>`}
          </div>
          ${gardenForgeItems.some(({item})=>item.forged)?`<div class="gardenForgeNotice">提示：已鍛造的菜園胡蘿蔔會保留在這裡，也會在 2 萬戰力後出現在角色裝備欄。</div>`:""}
        </div>`:""}
      </div>
    `;
  }
  function realTodayKey(){
    const now=new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  }
  function isDateKey(key){
    return /^\d{4}-\d{2}-\d{2}$/.test(String(key||""));
  }
  function todayKey(){
    if(devModeActive&&isDateKey(gardenDevDateOverride))return gardenDevDateOverride;
    return realTodayKey();
  }
  function addDaysToKey(key,days){
    const parts=String(key||realTodayKey()).split("-").map(Number);
    const date=new Date(parts[0]||2026,(parts[1]||1)-1,(parts[2]||1)+Math.floor(Number(days)||0));
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function dateKeyToDayNumber(key){
    const parts=String(key||"").split("-").map(Number);
    if(parts.length!==3||parts.some(n=>!Number.isFinite(n)))return Math.floor(Date.now()/86400000);
    return Math.floor(new Date(parts[0],parts[1]-1,parts[2]).getTime()/86400000);
  }
  function daysBetweenKeys(a,b){
    return Math.max(0,dateKeyToDayNumber(b)-dateKeyToDayNumber(a));
  }
  function gardenPlantAgeDays(plant,today=todayKey()){
    if(!plant)return 0;
    return Math.max(1,daysBetweenKeys(plant.plantedDate||today,today)+1);
  }
  function gardenShownTotalDays(garden=meta.garden,today=todayKey()){
    const state=normalizeGardenState(garden);
    return Math.max(0,Math.floor(Number(state.totalPlantDays)||0))+(state.current?gardenPlantAgeDays(state.current,today):0);
  }
  function gardenClosePlantDays(plant){
    if(!plant)return;
    meta.garden=normalizeGardenState(meta.garden);
    meta.garden.totalPlantDays=Math.max(0,Math.floor(Number(meta.garden.totalPlantDays)||0))+gardenPlantAgeDays(plant);
  }
  function gardenTrimRecords(){
    meta.garden=normalizeGardenState(meta.garden);
    const plantingCount=Math.max(0,Math.floor(Number(meta.garden.plantingCount)||0));
    const lostRecordId="garden-lost-notebook";
    const normalRecords=meta.garden.records.filter(record=>record?.id!==lostRecordId);
    if(plantingCount<8){
      meta.garden.records=normalRecords.slice(-80);
      return;
    }
    const minPlanting=Math.max(1,plantingCount-5);
    const lostRecord=normalizeGardenRecord({
      id:lostRecordId,
      date:todayKey(),
      createdAt:0,
      plantingNo:1,
      kind:"lostNotebook",
      title:"<筆記本遺失了>",
      text:"<筆記本遺失了>",
      choices:[]
    });
    meta.garden.records=[
      lostRecord,
      ...normalRecords.filter(record=>{
        const no=Math.max(0,Math.floor(Number(record.plantingNo)||0));
        return no>=minPlanting;
      })
    ].slice(-80);
  }
  function gardenTitleInfo(harvestCount=0){
    const count=Math.max(0,Math.floor(Number(harvestCount)||0));
    const titles=[
      {name:"菜園大神",at:200,mods:{immortal:1,eternal:.3}},
      {name:"萬物園藝師",at:100,mods:{mythic:1}},
      {name:"田園高手",at:50,mods:{legendary:1}},
      {name:"種菜好手",at:25,mods:{epic:1}},
      {name:"嫩芽小手",at:10,mods:{uncommon:1}},
      {name:"會澆水了",at:3,mods:{uncommon:.5}},
      {name:"超級菜鳥",at:0,mods:{}}
    ];
    const active=titles.find(item=>count>=item.at)||titles[titles.length-1];
    return{...active,count};
  }
  function gardenTitleLevelUpInfo(beforeCount,afterCount){
    const before=gardenTitleInfo(beforeCount);
    const after=gardenTitleInfo(afterCount);
    return before.name!==after.name?after:null;
  }
  function gardenStageIndex(growth=0){
    const value=Math.max(0,Math.floor(Number(growth)||0));
    if(value>=15)return 6;
    if(value>=11)return 5;
    if(value>=8)return 4;
    if(value>=6)return 3;
    if(value>=4)return 2;
    if(value>=2)return 1;
    return 0;
  }
  function gardenPlantImageKey(plant){
    if(!plant)return"empty";
    const normalized=normalizeGardenPlant(plant);
    if(normalized.status==="eaten")return normalized.eatenReason==="bird"?"empty":"eaten";
    if(normalized.status==="dead"){
      return normalized.growth<4?"empty":"withered";
    }
    if(normalized.condition&&GARDEN_CONDITION_IMAGES[normalized.condition])return GARDEN_CONDITION_IMAGES[normalized.condition];
    if(normalized.status==="dry"){
      if(normalized.growth<4)return gardenStageImageKey(normalized.growth);
      if(normalized.growth<8)return"leafDry";
      return"matureDry";
    }
    return gardenStageImageKey(normalized.growth);
  }
  function gardenStageImageKey(growth){
    const keys=["seed","sprout","smallLeaves","lushLeaves","fattening","mature","harvestReady"];
    return keys[gardenStageIndex(growth)]||"seed";
  }
  function gardenStageName(growth=0,status="growing",condition="",eatenReason=""){
    if(status==="eaten"){
      if(eatenReason==="bird")return"被小鳥啄走";
      if(eatenReason==="snail")return"被蝸牛吃掉";
      if(eatenReason==="forgotHarvest")return"太久未採收";
      return"被地鼠啃掉";
    }
    if(status==="dead")return growth<4?"無":"枯死";
    if(condition&&GARDEN_CONDITION_NAMES[condition])return GARDEN_CONDITION_NAMES[condition];
    if(status==="dry"){
      if(growth<4)return gardenStageName(growth,"growing");
      if(growth<8)return"小葉缺水";
      return"成熟缺水";
    }
    return["種子","發芽","長出小葉","葉子茂盛","胡蘿蔔長胖","成熟","可採收"][gardenStageIndex(growth)]||"無";
  }
  function gardenNutrientRangeForStage(stage){
    return GARDEN_STAGE_NUTRIENT_RANGES[Math.max(0,Math.min(GARDEN_STAGE_NUTRIENT_RANGES.length-1,Math.floor(Number(stage)||0)))]||GARDEN_STAGE_NUTRIENT_RANGES[0];
  }
  function gardenNutrientStatusForPlant(plant){
    const stage=gardenStageIndex(plant?.growth||0);
    const range=gardenNutrientRangeForStage(stage);
    const value=clampGardenNutrients(plant?.nutrients);
    if(value<range.ok[0]){
      return{state:"low",value,stage,range,label:"EC 偏低",text:`${range.name}階段需要更多養分，目前 EC 偏低，成長先停下來。`,qualityText:"品質狀況：養分不足，品質暫時沒有往好的方向推進。"};
    }
    if(value>range.ok[1]){
      return{state:"high",value,stage,range,label:"EC 過高",text:`${range.name}階段承受不了這麼高的養分，根邊有肥傷壓力，成長先停下來。`,qualityText:"品質狀況：養分過高，肥傷壓力正在拉低品質。"};
    }
    if(value>=range.best[0]&&value<=range.best[1]){
      return{state:"best",value,stage,range,label:"EC 最佳",text:`${range.name}階段的 EC 很漂亮，根邊吸收狀態穩。`,qualityText:"品質狀況：養分落在最佳區間，品質氣息穩定。"};
    }
    return{state:"ok",value,stage,range,label:"EC 可接受",text:`${range.name}階段的 EC 還能接受，成長可以繼續。`,qualityText:"品質狀況：養分仍在可接受範圍，品質維持穩定。"};
  }
  function gardenNutrientCanGrow(plant){
    const status=gardenNutrientStatusForPlant(plant);
    return status.state==="best"||status.state==="ok";
  }
  function gardenApplyNutrientStress(plant,status=gardenNutrientStatusForPlant(plant),date=todayKey()){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return false;
    if(status.state!=="high")return false;
    const condition=gardenNutrientBurnConditionForStage(status.stage);
    if(condition){
      plant.condition=condition;
      plant.conditionDate=date;
    }
    if(plant.nutrientStressDate!==date){
      plant.qualityShift=Math.max(-20,Math.min(20,(Number(plant.qualityShift)||0)-1));
      plant.nutrientStressDate=date;
    }
    if(status.value>=95&&plant.nutrientDeathDate!==date){
      plant.nutrientDeathDate=date;
      if(Math.random()<.25){
        plant.status="dead";
        plant.pendingGrowth=0;
        plant.pendingGrowthDate="";
        plant.lastEvent={title:"肥傷枯死",text:"EC 已經衝到危險區，根邊承受不住過量養分，這株胡蘿蔔枯死了。"};
        gardenAddRecord("肥傷枯死","EC 已經衝到危險區，根邊承受不住過量養分，這株胡蘿蔔枯死了。",{qualityText:"品質狀況：植株已經枯死，品質不再有改善空間。"});
        return true;
      }
    }
    return false;
  }
  function gardenCheckNutrientGrowthGate(plant,{date=todayKey(),title="養分失衡"}={}){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return{ok:false,status:gardenNutrientStatusForPlant(plant)};
    const status=gardenNutrientStatusForPlant(plant);
    if(gardenNutrientCanGrow(plant))return{ok:true,status};
    if(gardenApplyNutrientStress(plant,status,date))return{ok:false,status,dead:true};
    if(plant.nutrientBlockDate!==date||plant.nutrientBlockState!==status.state){
      plant.nutrientBlockDate=date;
      plant.nutrientBlockState=status.state;
      gardenAddRecord(title,status.text,{kind:"fertilize",qualityText:status.qualityText});
    }
    return{ok:false,status};
  }
  function gardenMinimumGrowthForAge(age=1){
    const day=Math.max(1,Math.floor(Number(age)||1));
    if(day>=17)return 15;
    if(day>=15)return 11;
    if(day>=12)return 8;
    if(day>=9)return 6;
    if(day>=6)return 4;
    if(day>=3)return 2;
    return 0;
  }
  function gardenApplyMinimumGrowthForAge(plant){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return;
    const age=gardenPlantAgeDays(plant,todayKey());
    if(daysBetweenKeys(plant.lastCareDate||plant.plantedDate||todayKey(),todayKey())>0)return;
    const minGrowth=gardenMinimumGrowthForAge(age);
    const before=Math.max(0,Math.floor(Number(plant.growth)||0));
    if(minGrowth<=before)return;
    const gate=gardenCheckNutrientGrowthGate(plant,{title:"養分停滯"});
    if(!gate.ok)return;
    plant.growth=Math.min(15,minGrowth);
    if(plant.growth>before)gardenConsumeNutrientsForGrowth(plant,1);
    plant.pendingGrowth=Math.min(Math.max(0,Math.floor(Number(plant.pendingGrowth)||0)),Math.max(0,15-plant.growth));
    if(plant.growth>=15&&!plant.harvestReadyDate)plant.harvestReadyDate=todayKey();
    const stage=gardenStageName(plant.growth,plant.status||"growing",plant.condition||"");
    gardenAddRecord("自然成長",`種植第 ${age} 天，胡蘿蔔慢慢長大，成長階段推進到「${stage}」。`);
  }
  function gardenApplyEarlyNeglectConsequences(plant){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return false;
    const today=todayKey();
    const growth=Math.max(0,Math.floor(Number(plant.growth)||0));
    const daysNoCare=daysBetweenKeys(plant.lastCareDate||plant.plantedDate||today,today);
    if(growth<2&&daysNoCare>=2){
      plant.status="eaten";
      plant.eatenReason="bird";
      plant.pendingGrowth=0;
      plant.pendingGrowthDate="";
      plant.lastEvent={title:"種子被鳥啄走",text:"種子種下後太久沒有照顧，路過的小鳥把土面啄開，種子不見了。"};
      gardenAddRecord("種子被鳥啄走","種子種下後太久沒有照顧，路過的小鳥把土面啄開，種子不見了。");
      return true;
    }
    if(growth>=2&&growth<4&&daysNoCare>=2){
      plant.status="eaten";
      plant.eatenReason="snail";
      plant.pendingGrowth=0;
      plant.pendingGrowthDate="";
      plant.lastEvent={title:"嫩芽被蝸牛吃掉",text:"發芽後太久沒有照顧，蝸牛慢慢爬進菜園，把嫩芽吃掉了。"};
      gardenAddRecord("嫩芽被蝸牛吃掉","發芽後太久沒有照顧，蝸牛慢慢爬進菜園，把嫩芽吃掉了。");
      return true;
    }
    return false;
  }
  function gardenQualityRecordText(plant){
    const status=String(plant?.status||"");
    const condition=String(plant?.condition||"");
    const reason=String(plant?.eatenReason||"");
    if(status==="dead")return"品質狀況：植株已經枯死，品質不再有改善空間。";
    if(status==="eaten"){
      if(reason==="bird")return"品質狀況：種子已被小鳥啄走，這次種植失敗了。";
      if(reason==="snail")return"品質狀況：嫩芽已被蝸牛吃掉，這次種植失敗了。";
      if(reason==="forgotHarvest")return"品質狀況：成熟後放太久被啃壞，已經無法採收。";
      return"品質狀況：植株已被破壞，這次種植失敗了。";
    }
    if(status==="dry")return"品質狀況：缺水狀態尚未解除，品質正在承受壓力。";
    if(/Overwater/.test(condition))return"品質狀況：水分過多，根邊氣息被悶住。";
    if(/NutrientBurn/.test(condition))return"品質狀況：養分過量造成肥傷，品質正在承受壓力。";
    if(/BugBite/.test(condition))return"品質狀況：葉片有蟲咬痕跡，品質氣息受到干擾。";
    if(condition==="matureDry"||condition==="leafDry")return"品質狀況：植株偏乾，品質正在承受壓力。";
    if(condition==="moleEaten")return"品質狀況：胡蘿蔔被啃壞，品質明顯受損。";
    const shift=Number(plant?.qualityShift)||0;
    if(shift>=6)return"品質狀況：運勢非常旺，高品質機率明顯提升。";
    if(shift>=3)return"品質狀況：運勢不錯，高品質機率正在上升。";
    if(shift>=1)return"品質狀況：略有起色，品質似乎往好的方向變化。";
    if(shift===0)return"品質狀況：一切平穩，品質沒有明顯變化。";
    if(shift<=-6)return"品質狀況：狀況很差，高品質機率明顯下滑。";
    if(shift<=-3)return"品質狀況：狀況偏差，高品質機率正在下降。";
    return"品質狀況：略微下滑，需要好好照顧。";
  }
  function gardenRecordBody(title,text,plant=meta.garden?.current,qualityText=""){
    const head=title?`${title}：${text}`:String(text||"今天還沒有新的紀錄。");
    return plant?`${head}\n${qualityText||gardenQualityRecordText(plant)}`:head;
  }
  function gardenReplaceQualityLine(text,qualityText){
    const lines=String(text||"").split("\n");
    const index=lines.findIndex(line=>String(line||"").trim().startsWith("品質狀況："));
    if(index>=0)lines[index]=qualityText;
    else lines.push(qualityText);
    return lines.join("\n");
  }
  function gardenDisplayRecordText(record){
    const title=String(record?.title||"");
    const text=String(record?.text||"");
    if(title.startsWith("施肥過量")){
      if(/枯死/.test(text))return gardenReplaceQualityLine(text,"品質狀況：植株已經枯死，品質不再有改善空間。");
      return gardenReplaceQualityLine(text,"品質狀況：肥料已經過量，根邊氣息混亂，高品質機率正在下滑。");
    }
    if(/枯死/.test(text))return gardenReplaceQualityLine(text,"品質狀況：植株已經枯死，品質不再有改善空間。");
    if(/種子被鳥啄走|被小鳥啄走/.test(text))return gardenReplaceQualityLine(text,"品質狀況：種子已被小鳥啄走，這次種植失敗了。");
    if(/嫩芽被蝸牛吃掉|被蝸牛吃掉/.test(text))return gardenReplaceQualityLine(text,"品質狀況：嫩芽已被蝸牛吃掉，這次種植失敗了。");
    if(/被啃壞/.test(text))return gardenReplaceQualityLine(text,"品質狀況：植株已被破壞，這次種植失敗了。");
    return text;
  }
  function gardenAddRecord(title,text,{choices=[],kind="",plant=meta.garden?.current,qualityText=""}={}){
    meta.garden=normalizeGardenState(meta.garden);
    const current=meta.garden.current;
    const slot=typeof activeGardenTimeSlot==="function"?activeGardenTimeSlot():gardenTimeSlot();
    const weather=gardenWeatherForDate(todayKey());
    const record=normalizeGardenRecord({
      date:todayKey(),
      createdAt:Date.now(),
      plantingNo:current?.plantingNo||meta.garden.plantingCount||0,
      plantDay:current?gardenPlantAgeDays(current,todayKey()):0,
      slot,
      weatherName:weather.name,
      kind,
      title,
      text:gardenRecordBody(title,text,plant,qualityText),
      choices
    });
    meta.garden.records.push(record);
    if(current)current.lastEvent={title,text,date:record.date};
    gardenTrimRecords();
    return record;
  }
  function gardenResolveRecordChoice(action){
    const parts=String(action||"").split(":");
    const recordId=parts[1]||"";
    const choiceId=parts[2]||"";
    meta.garden=normalizeGardenState(meta.garden);
    const record=meta.garden.records.find(item=>item.id===recordId);
    if(!record||!record.choices?.length)return{ok:false,message:"這個選項已經失效。"};
    const choice=record.choices.find(item=>item.id===choiceId)||record.choices[0];
    record.text=`${record.text}\n我按：${choice.label}。\n${choice.result}`;
    record.choices=[];
    return{ok:true,message:"成長紀錄已更新。"};
  }
  function gardenChoiceFertilizerGain(event,choice){
    const raw=Math.max(0,Math.floor(Number(choice?.fertilizer)||0));
    if(raw>0)return raw;
    const text=`${event?.title||""}${event?.text||""}${choice?.id||""}${choice?.label||""}${choice?.result||""}`;
    return /肥料/.test(text)&&/(keep|收|倉庫)/.test(text)?1:0;
  }
  function gardenChoiceCoinGain(event,choice){
    const raw=Math.max(0,Math.floor(Number(choice?.coins)||0));
    if(raw>0)return raw;
    const text=`${event?.title||""}${event?.text||""}${choice?.id||""}${choice?.label||""}${choice?.result||""}`;
    return /鑽石/.test(text)&&/(挖|撿|收|拿|帶走)/.test(text)?1:0;
  }
  function addGardenCoins(amount){
    const gain=Math.max(0,Math.floor(Number(amount)||0));
    if(!gain)return 0;
    syncCoinState();
    meta.coins=Math.max(0,Math.floor(Number(meta.coins)||0)+gain);
    walletCoins=meta.coins;
    return gain;
  }
  function gardenEffectSummary(effect,{fertilizerGain=0,coinsGain=0}={}){
    return[
      effect?.growth?`成長 ${effect.growth>0?"+":""}${effect.growth}`:"",
      effect?.stall?`成長停滯 +${effect.stall}`:"",
      effect?.quality?`品質 ${effect.quality>0?"+":""}${effect.quality}%`:"",
      effect?.moisture?`濕度 ${effect.moisture>0?"+":""}${effect.moisture}`:"",
      effect?.fertility?`肥力 ${effect.fertility>0?"+":""}${effect.fertility}`:"",
      effect?.nutrients?`EC ${effect.nutrients>0?"+":""}${effect.nutrients}`:"",
      effect?.condition&&GARDEN_CONDITION_NAMES[effect.condition]?`狀態：${GARDEN_CONDITION_NAMES[effect.condition]}`:"",
      fertilizerGain?`速效肥料 +${fertilizerGain}`:"",
      coinsGain?`鑽石 +${coinsGain}`:""
    ].filter(Boolean).join("，");
  }
  function gardenApplySimpleEventEffect(plant,event){
    if(!plant||!event)return"";
    const stall=Math.max(0,Math.floor(Number(event.stall)||0));
    const growth=Math.max(-3,Math.min(3,Math.floor(Number(event.growth)||0)));
    const quality=Number(event.quality)||0;
    const moisture=Math.max(-3,Math.min(3,Math.floor(Number(event.moisture)||0)));
    const fertility=Math.max(-3,Math.min(3,Math.floor(Number(event.fertility)||0)));
    const nutrients=Math.max(-3,Math.min(3,Math.floor(Number(event.nutrients)||0)));
    const fertilizerGain=Math.max(0,Math.floor(Number(event.fertilizer)||0));
    const coinsGain=Math.max(0,Math.floor(Number(event.coins)||0));
    const condition=Object.prototype.hasOwnProperty.call(GARDEN_CONDITION_IMAGES,String(event.condition||""))?String(event.condition||""):"";
    if(stall){
      plant.pendingGrowth=Math.max(0,Math.floor(Number(plant.pendingGrowth)||0)-stall);
      plant.bonusGrowth=Math.max(0,Math.floor(Number(plant.bonusGrowth)||0)-stall);
    }
    if(growth>0){
      const beforeGrowth=Math.max(0,Math.floor(Number(plant.growth)||0));
      plant.growth=Math.min(15,beforeGrowth+growth);
      if(plant.growth>beforeGrowth)gardenConsumeNutrientsForGrowth(plant,1);
      if(plant.growth>=15&&!plant.harvestReadyDate)plant.harvestReadyDate=todayKey();
    }else if(growth<0){
      plant.pendingGrowth=Math.max(0,Math.floor(Number(plant.pendingGrowth)||0)+growth);
      if(plant.pendingGrowth<=0)plant.pendingGrowthDate="";
    }
    if(quality)plant.qualityShift=Math.max(-20,Math.min(20,(Number(plant.qualityShift)||0)+quality));
    if(moisture)plant.moisture=clampGardenMoisture((Number(plant.moisture)||0)+moisture);
    if(fertility)plant.fertility=clampGardenSoilValue((Number(plant.fertility)||0)+fertility,2,5);
    const nutrientPoints=nutrients?gardenNutrientEffectPoints(nutrients):0;
    if(nutrientPoints)plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)+nutrientPoints);
    if(condition){
      plant.condition=condition;
      plant.conditionDate=todayKey();
      if(condition==="leafDry"||condition==="matureDry")plant.status="dry";
      else if(plant.status==="dry")plant.status="growing";
    }
    if(fertilizerGain)meta.garden.fertilizer=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0)+fertilizerGain);
    if(coinsGain)addGardenCoins(coinsGain);
    return gardenEffectSummary({...event,growth,stall,quality,moisture,fertility,nutrients:nutrientPoints,condition},{fertilizerGain,coinsGain});
  }
  function gardenEventTextWithEffect(plant,event){
    const effectText=gardenApplySimpleEventEffect(plant,event);
    return`${event.text}${effectText?`\n效果：${effectText}。`:""}`;
  }
  function gardenResolvePendingChoice(action){
    const parts=String(action||"").split(":");
    const choiceId=parts.slice(1).join(":")||"";
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    const event=normalizeGardenChoiceEvent(plant?.pendingChoiceEvent);
    if(!plant||!event)return{ok:false,message:"目前沒有可選事件。"};
    const choice=event.choices.find(item=>item.id===choiceId)||event.choices[0];
    const fertilizerGain=gardenChoiceFertilizerGain(event,choice);
    const coinsGain=gardenChoiceCoinGain(event,choice);
    if(choice.growth){
      const beforeGrowth=Math.max(0,Math.floor(Number(plant.growth)||0));
      plant.growth=Math.max(0,Math.min(15,beforeGrowth+choice.growth));
      if(plant.growth>beforeGrowth)gardenConsumeNutrientsForGrowth(plant,1);
    }
    if(choice.stall){
      plant.pendingGrowth=Math.max(0,Math.floor(Number(plant.pendingGrowth)||0)-choice.stall);
      plant.bonusGrowth=Math.max(0,Math.floor(Number(plant.bonusGrowth)||0)-choice.stall);
    }
    if(choice.quality){
      plant.qualityShift=Math.max(-20,Math.min(20,(Number(plant.qualityShift)||0)+choice.quality));
    }
    if(choice.moisture)plant.moisture=clampGardenMoisture((Number(plant.moisture)||0)+choice.moisture);
    if(choice.fertility)plant.fertility=clampGardenSoilValue((Number(plant.fertility)||0)+choice.fertility,2,5);
    if(choice.nutrients)plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)+gardenNutrientEffectPoints(choice.nutrients));
    if(fertilizerGain){
      meta.garden.fertilizer=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0)+fertilizerGain);
    }
    if(coinsGain)addGardenCoins(coinsGain);
    plant.pendingChoiceEvent=null;
    if(!plant.choiceEventDate)plant.choiceEventDate=todayKey();
    const effectText=gardenEffectSummary(choice,{fertilizerGain,coinsGain});
    gardenAddRecord(`觀察事件・${event.title}`,`${event.text}\n選擇：${choice.label}。\n${choice.result}${effectText?`\n效果：${effectText}。`:""}`);
    if(choice.sellPlant){
      gardenClosePlantDays(plant);
      meta.garden.current=null;
    }
    const afterFertilizer=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0));
    const stockText=fertilizerGain?`目前速效肥料 x ${afterFertilizer}。`:coinsGain?`目前鑽石 ${formatCommaNumber(walletCoins||0)}。`:"";
    return{ok:true,message:effectText?`${choice.result} 效果：${effectText}。${stockText?` ${stockText}`:""}`:choice.result};
  }
  function gardenClearRecords(){
    meta.garden=normalizeGardenState(meta.garden);
    gardenDevDateOverride="";
    devTimeSlotIndex=null;
    const keep={
      storageCap:meta.garden.storageCap,
      storage:meta.garden.storage,
      depositBox:meta.garden.depositBox
    };
    meta.garden=normalizeGardenState({
      ...keep,
      plantingCount:0,
      harvestCount:0,
      totalPlantDays:0,
      records:[],
      current:null
    });
    selectedRecordPlantingNo=null;
    return{ok:true,message:"成長紀錄、統計、神秘種子與所有菜園道具已清空。",clearRecords:true,focusPlantingNo:0};
  }
  function gardenDailyMoistureDelta(weather){
    let delta=-1;
    if(weather?.isRainy)delta+=GARDEN_RAIN_WATER_COUNT*.5;
    if(weather?.key==="hot")delta-=1;
    return delta;
  }
  function gardenApplyRainNutrientLoss(plant,weather){
    if(!plant||!weather?.isRainy)return 0;
    plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)-GARDEN_RAIN_NUTRIENT_LOSS);
    return -GARDEN_RAIN_NUTRIENT_LOSS;
  }
  function gardenConsumeNutrientsForGrowth(plant,amount=1){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return 0;
    const cost=Math.max(0,Math.floor(Number(amount)||0))*GARDEN_NUTRIENT_GROWTH_COST;
    if(!cost)return 0;
    plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)-cost);
    return -cost;
  }
  function gardenApplySlowFertilizerRelease(plant){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return 0;
    const days=Math.max(0,Math.floor(Number(plant.slowFertilizerDays)||0));
    if(!days)return 0;
    const power=Math.max(1,Math.min(20,Math.floor(Number(plant.slowFertilizerPower)||GARDEN_SLOW_FERTILIZER_DAILY)));
    plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)+power);
    plant.slowFertilizerDays=Math.max(0,days-1);
    if(!plant.slowFertilizerDays)plant.slowFertilizerPower=0;
    return power;
  }
  function gardenMoistureQualityDelta(moisture){
    const value=clampGardenMoisture(moisture);
    if(value<=0)return -3;
    if(value===1)return -2;
    if(value===2)return -1;
    if(value===3||value===4)return 1;
    if(value===5)return 0;
    if(value===6)return -1;
    if(value===7)return -2;
    return -3;
  }
  function gardenApplyDailyMoistureQuality(plant,dateKey){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return 0;
    if(plant.moistureQualityDate===dateKey)return 0;
    const delta=gardenMoistureQualityDelta(plant.moisture);
    if(delta)plant.qualityShift=Math.max(-20,Math.min(20,(Number(plant.qualityShift)||0)+delta));
    plant.moistureQualityDate=dateKey;
    return delta;
  }
  function gardenApplyExtremeMoistureRisk(plant,dateKey=todayKey(),weather=gardenWeatherForDate(dateKey)){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return true;
    const moisture=clampGardenMoisture(plant.moisture);
    if(moisture>0&&moisture<7)return false;
    const isDry=moisture<=0;
    if(isDry&&Math.random()<GARDEN_EXTREME_MOISTURE_DEATH_RATE){
      const title="乾旱枯死",failText=`${weather.name}後土壤水分降到 0，根邊完全乾裂，這株胡蘿蔔枯死了。`;
      plant.status="dead";
      plant.pendingGrowth=0;
      plant.pendingGrowthDate="";
      plant.condition="";
      plant.conditionDate="";
      plant.lastEvent={title,text:failText};
      gardenAddRecord(title,failText,{qualityText:"品質狀況：植株已經枯死，品質不再有改善空間。"});
      meta.garden.current=plant;
      return true;
    }
    if(isDry){
      plant.status="dry";
      plant.condition=plant.growth>=8?"matureDry":plant.growth>=4?"leafDry":"";
      plant.conditionDate=plant.condition?dateKey:"";
      gardenAddRecord("乾旱危機",`${weather.name}後土壤水分降到 0，植株勉強撐過，但品質氣息明顯下滑。`,{qualityText:"品質狀況：嚴重缺水，品質正在承受壓力。"});
      meta.garden.current=plant;
      return false;
    }
    const overwaterCondition=gardenRainConditionForStage(gardenStageIndex(plant.growth||0))||"fatteningOverwater";
    const alreadyRecorded=plant.conditionDate===dateKey&&/Overwater/.test(String(plant.condition||""));
    plant.condition=overwaterCondition;
    plant.conditionDate=overwaterCondition?dateKey:"";
    if(!alreadyRecorded){
      gardenAddRecord("積水危機",`${weather.name}後土壤水分累積到 ${moisture}，根部附近開始積水，但植株仍可繼續照顧。`,{qualityText:"品質狀況：土壤積水，品質正在承受壓力。"});
    }
    meta.garden.current=plant;
    return false;
  }
  function gardenApplyDailyMoisture(plant){
    if(!plant||plant.status==="dead"||plant.status==="eaten")return;
    const today=todayKey();
    let last=isDateKey(plant.moistureDate)?plant.moistureDate:today;
    let guard=0;
    while(daysBetweenKeys(last,today)>0&&guard<60){
      if(gardenApplyExtremeMoistureRisk(plant,last,gardenWeatherForDate(last)))return;
      const next=addDaysToKey(last,1);
      const weather=gardenWeatherForDate(next);
      const current=gardenMoistureValue(plant.moisture);
      plant.moisture=clampGardenMoisture(current+gardenDailyMoistureDelta(weather));
      gardenApplyRainNutrientLoss(plant,weather);
      const slowGain=gardenApplySlowFertilizerRelease(plant);
      if(slowGain){
        gardenAddRecord("緩釋肥生效",`緩釋肥慢慢釋放養分，EC +${slowGain}。剩餘 ${Math.max(0,Math.floor(Number(plant.slowFertilizerDays)||0))} 天。`,{kind:"fertilize",qualityText:"品質狀況：養分穩定釋放，土壤狀態比較容易維持。"});
      }
      plant.moistureDate=next;
      gardenApplyDailyMoistureQuality(plant,next);
      if(gardenApplyExtremeMoistureRisk(plant,next,weather))return;
      last=next;
      guard++;
    }
    plant.moistureDate=today;
  }
  function applyGardenPendingGrowth(){
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant||plant.status==="dead"||plant.status==="eaten")return;
    if(plant.overFertilizedDate&&daysBetweenKeys(plant.overFertilizedDate,todayKey())>0){
      plant.overFertilizedDate="";
    }
    gardenApplyDailyMoisture(plant);
    if(plant.status==="dead"||plant.status==="eaten")return;
    if(gardenApplyEarlyNeglectConsequences(plant))return;
    const pending=Math.max(0,Math.floor(Number(plant.pendingGrowth)||0));
    if(pending&&plant.pendingGrowthDate&&daysBetweenKeys(plant.pendingGrowthDate,todayKey())>0){
      const gate=gardenCheckNutrientGrowthGate(plant,{title:"養分停滯"});
      if(!gate.ok)return;
      const beforeGrowth=Math.max(0,Math.floor(Number(plant.growth)||0));
      plant.growth=Math.min(15,beforeGrowth+pending);
      if(plant.growth>beforeGrowth)gardenConsumeNutrientsForGrowth(plant,1);
      if(plant.growth>=15&&!plant.harvestReadyDate)plant.harvestReadyDate=todayKey();
      plant.pendingGrowth=0;
      plant.pendingGrowthDate="";
    }
    gardenApplyMinimumGrowthForAge(plant);
    if(plant.status==="dry"&&clampGardenMoisture(plant.moisture)>1)plant.status="growing";
  }
  function applyGardenMissedDays(){
    applyGardenPendingGrowth();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return;
    const today=todayKey();
    if(plant.growth>=15){
      if(!plant.harvestReadyDate)plant.harvestReadyDate=today;
      if(daysBetweenKeys(plant.harvestReadyDate,today)>=2){
        plant.status="eaten";
        plant.eatenReason="forgotHarvest";
        plant.lastEvent={title:"太久未採收",text:"成熟胡蘿蔔忘記採收，兩天後被路過的小傢伙偷啃了。"};
        gardenAddRecord("太久未採收","成熟胡蘿蔔忘記採收，兩天後被路過的小傢伙偷啃了。");
      }
      return;
    }
    plant.missedStreak=0;
    if(plant.status==="dry"&&clampGardenMoisture(plant.moisture)>1)plant.status="growing";
  }
  function gardenRates(){
    meta.garden=normalizeGardenState(meta.garden);
    const title=gardenTitleInfo(meta.garden.harvestCount);
    const plant=meta.garden.current;
    const rates={common:55,rare:25,uncommon:12,epic:5,legendary:2,mythic:.8,immortal:.19,eternal:.01};
    for(const [id,bonus] of Object.entries(title.mods||{})){
      rates[id]=(rates[id]||0)+bonus;
      rates.common=Math.max(5,rates.common-bonus);
    }
    if(plant){
      const shift=Math.max(-20,Math.min(20,Number(plant.qualityShift)||0));
      if(shift>0){
        rates.rare+=shift*.45;
        rates.uncommon+=shift*.25;
        rates.epic+=shift*.15;
        rates.legendary+=shift*.1;
        rates.mythic+=shift*.04;
        rates.immortal+=shift*.009;
        rates.eternal+=shift*.001;
        rates.common=Math.max(5,rates.common-shift);
      }else if(shift<0){
        const penalty=Math.abs(shift);
        rates.common+=penalty;
        for(const id of ["rare","uncommon","epic","legendary","mythic","immortal","eternal"]){
          rates[id]=Math.max(0,rates[id]-penalty*.14);
        }
      }
    }
    const sum=Object.values(rates).reduce((a,b)=>a+b,0)||1;
    for(const id of Object.keys(rates))rates[id]=rates[id]/sum*100;
    return rates;
  }
  function rollGardenHarvestQuality(){
    const rates=gardenRates();
    let roll=Math.random()*100;
    for(const item of GARDEN_CARROT_QUALITIES){
      roll-=rates[item.id]||0;
      if(roll<=0)return item.id;
    }
    return "common";
  }
  function gardenPredictedBuyerQuality(plant){
    const shift=Number(plant?.qualityShift)||0;
    if(shift>=16)return"eternal";
    if(shift>=12)return"immortal";
    if(shift>=9)return"mythic";
    if(shift>=6)return"legendary";
    if(shift>=4)return"epic";
    if(shift>=2)return"uncommon";
    if(shift>=1)return"rare";
    return"common";
  }
  function gardenBuyerDiamondReward(plant,{highPrice=false}={}){
    const quality=gardenPredictedBuyerQuality(plant);
    const base=GARDEN_BUYER_DIAMOND_REWARDS[quality]||GARDEN_BUYER_DIAMOND_REWARDS.common;
    const age=Math.max(1,gardenPlantAgeDays(plant,todayKey()));
    const ageBonus=Math.min(.25,Math.max(0,age-10)*.02);
    const multiplier=highPrice?10:.55+ageBonus;
    return Math.max(GARDEN_BUYER_DIAMOND_REWARDS.common,Math.round(base*multiplier));
  }
  function recentGardenEventTitles(plant,limit=2){
    meta.garden=normalizeGardenState(meta.garden);
    const plantingNo=Math.max(0,Math.floor(Number(plant?.plantingNo)||0));
    return new Set((meta.garden.records||[])
      .filter(record=>!plantingNo||Math.max(0,Math.floor(Number(record?.plantingNo)||0))===plantingNo)
      .filter(record=>!["plantStart","lostNotebook","harvest"].includes(record?.kind))
      .sort((a,b)=>(Number(b?.createdAt)||0)-(Number(a?.createdAt)||0))
      .slice(0,limit)
      .map(record=>String(record?.title||"").replace(/^觀察事件・/,""))
      .filter(Boolean));
  }
  function pickGardenEvent(events,recentTitles){
    const candidates=events.filter(event=>!recentTitles.has(event.title));
    const pool=candidates.length?candidates:events;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function pickGardenWeightedEvent(events,recentTitles){
    const candidates=events.filter(event=>!recentTitles.has(event.title));
    const pool=candidates.length?candidates:events;
    const total=pool.reduce((sum,event)=>sum+Math.max(1,Number(event.weight)||1),0)||1;
    let roll=Math.random()*total;
    for(const event of pool){
      roll-=Math.max(1,Number(event.weight)||1);
      if(roll<=0)return event;
    }
    return pool[0];
  }
  function gardenGeneratedEventPool(slot,stage,context={}){
    const slotName=gardenWaterSlotName(slot);
    const isSeedStage=stage<=0;
    const subjects=stage<=0
      ?["種子旁","淺土層","小土丘","播種處","土壤表面"]
      :stage===1
        ?["嫩芽邊","小葉尖","根鬚旁","幼苗周圍","葉柄下"]
        :["葉片間","根部旁","菜園角落","泥土深處","胡蘿蔔旁"];
    const slotMoods={
      morning:["晨光剛落","露氣還沒散","空氣偏涼","小鳥剛飛過","土面帶著微光"],
      noon:["日光正亮","熱氣浮在土上","雲影慢慢移動","菜園聲音變小","土面蒸起淡氣"],
      afternoon:["斜光照進菜園","風從籬笆旁吹過","影子變得很長","土壤慢慢回溫","葉片開始放鬆"],
      night:["星光落在土面","夜露慢慢聚起","菜園變得安靜","月光照著葉緣","草叢傳來細聲"]
    }[slot]||["菜園氣息穩定","土壤微微變化","葉片輕輕晃動","周圍安靜下來","泥土散出淡香"];
    const definitions=isSeedStage?[
      {
        titles:["自然調息","天光入土","清風巡田","露氣入土","土息流動"],
        actions:["水分沿著縫隙慢慢沉下去","土壤把水留在剛好的地方","種子周圍的濕度變得平穩","淺土層慢慢吸住水氣","細小水珠停在安全的位置"],
        endings:["種子安靜等待發芽","品質運勢有一點好兆頭","今天的狀態保持穩定","土面像是被輕輕整理過","播種處正在慢慢吸收水分"],
        growth:[0,0,0,1,0],
        quality:[0,1,0,0,1]
      },
      {
        titles:["細心照料","順手整理","人工調土","照顧得宜","小心補水"],
        actions:["你順手把水流引到旁邊","你把濕土輕輕撥鬆","你避開播種點直接沖水","你把周圍小碎石移開一點","你調整了水落下的位置"],
        endings:["這次照顧讓土壤更舒服","種子附近看起來更穩","淺土層變得比較透氣","水分分布比剛才均勻","今天的照顧做得剛剛好"],
        growth:[0,1,0,0,1],
        quality:[1,0,1,0,0]
      },
      {
        titles:["突發小事","不穩氣息","外來干擾","土面異動","菜園插曲"],
        actions:["一陣亂風把水珠吹偏","小碎石卡在濕土旁邊","附近草葉滴下多餘水分","土面忽然結出一小塊硬泥","暗處有小東西踩過土面"],
        endings:["品質運勢小幅晃動","今天需要多觀察一下","狀態沒有壞掉，但有點不穩","土壤需要時間自己調整","播種處看起來稍微受干擾"],
        growth:[0,0,0,0,0],
        quality:[-1,0,-1,0,-1]
      }
    ]:[
      {
        titles:["自然調息","天光照拂","清風巡田","露氣入土","土息流動"],
        actions:["水分沿著縫隙慢慢沉下去","土壤把水留在剛好的地方","葉片順著風輕輕舒展","根鬚附近的氣息變得平穩","細小水珠停在安全的位置"],
        endings:["看起來很適合繼續生長","品質運勢有一點好兆頭","今天的狀態保持穩定","菜園像是被輕輕整理過","胡蘿蔔安靜吸收著水分"],
        growth:[0,0,0,1,0],
        quality:[0,1,0,0,1]
      },
      {
        titles:["細心照料","順手整理","人工調土","照顧得宜","小心補水"],
        actions:["你順手把水流引到旁邊","你把濕土輕輕撥鬆","你避開葉心慢慢澆水","你把周圍雜物移開一點","你調整了水落下的位置"],
        endings:["這次照顧讓土壤更舒服","胡蘿蔔的狀態看起來更穩","根部附近變得比較透氣","水分分布比剛才均勻","今天的照顧做得剛剛好"],
        growth:[0,1,0,0,1],
        quality:[1,0,1,0,0]
      },
      {
        titles:["突發小事","不穩氣息","外來干擾","土面異動","菜園插曲"],
        actions:["一陣亂風把水珠吹偏","小碎石卡在濕土旁邊","附近草葉滴下多餘水分","土面忽然結出一小塊硬泥","暗處有小東西踩過土面"],
        endings:["品質運勢小幅晃動","今天需要多觀察一下","狀態沒有壞掉，但有點不穩","土壤需要時間自己調整","胡蘿蔔看起來稍微分心"],
        growth:[0,0,0,0,0],
        quality:[-1,0,-1,0,-1]
      }
    ];
    const pool=[];
    definitions.forEach((def,defIndex)=>{
      def.titles.forEach((title,titleIndex)=>{
        subjects.forEach((subject,subjectIndex)=>{
          slotMoods.forEach((mood,moodIndex)=>{
            const action=def.actions[(titleIndex+subjectIndex+moodIndex)%def.actions.length];
            const ending=def.endings[(titleIndex*2+subjectIndex+moodIndex)%def.endings.length];
            const effectIndex=(titleIndex+subjectIndex+moodIndex+defIndex)%def.growth.length;
            const rainNote=context.isRainy&&!isSeedStage?"雨意讓土壤更濕，":"";
            const waterNote=(context.waterCount||1)>1?"這是今天額外的一次補水，":"";
            pool.push({
              title:`${slotName}${title}・${subject}`,
              text:`${mood}，${rainNote}${waterNote}${action}，${ending}。`,
              growth:def.growth[effectIndex],
              quality:def.quality[effectIndex]
            });
          });
        });
      });
    });
    return pool;
  }
  function gardenEventTemplateToChoice(event){
    const good=(event.growth||event.quality>0||event.fertilizer||event.coins)&&!event.stall;
    return normalizeGardenChoiceEvent({
      id:event.id,
      title:event.title,
      text:event.text,
      choices:[{
        id:"resolve",
        label:good?"順勢照顧":event.stall||event.quality<0?"處理一下":"觀察記錄",
        result:event.result||"這次菜園變化已經記錄下來。",
        growth:event.growth||0,
        quality:event.quality||0,
        fertilizer:event.fertilizer||0,
        stall:event.stall||0,
        coins:event.coins||0
      }]
    });
  }
  function gardenStructuredEventPool(stage,context={}){
    const isRainy=!!context.isRainy;
    const slot=gardenValidWaterSlot(context.slot);
    if(stage<=0){
      return[
        {id:"seedWormSoil",title:"蚯蚓翻土",text:"土裡鑽出蚯蚓，泥土變得更鬆軟了。",growth:1,quality:1},
        {id:"seedSparrowPeck",title:"麻雀啄土",text:"麻雀在土上啄來啄去，種子好像被打擾了。",stall:1,quality:-1},
        {id:"seedWeedsSteal",title:"雜草搶養分",text:"小雜草先冒了出來，搶走一點土壤養分。",stall:1},
        {id:"seedGlow",title:"種子發亮",text:"種子在土裡微微發光，似乎很有生命力。",quality:1},
        {id:"seedHardSoil",title:"土壤太硬",text:"表層泥土有點結塊，種子暫時不好突破。",stall:1},
        {id:"seedCalm",title:"種子安穩",text:"今天土壤很平靜，種子正在安靜吸收養分。"}
      ];
    }
    const common=[
      {id:"wormLooseSoil",title:"蚯蚓鬆土",text:"蚯蚓在土裡鑽動，根部呼吸更順暢了。",growth:1,minStage:1},
      {id:"weedsSprout",title:"雜草冒出",text:"雜草從旁邊冒出來，搶走了一點養分。",stall:1,minStage:1},
      {id:"birdRestSafe",title:"小鳥歇腳",text:"小鳥停在菜園邊，好像只是路過。",minStage:1},
      {id:"birdRestBad",title:"小鳥歇腳",text:"小鳥停在菜園邊踩了一下土面，胡蘿蔔稍微被打擾了。",stall:1,minStage:1},
      {id:"hardSoil",title:"土壤結塊",text:"泥土變硬了，胡蘿蔔伸展得不太順。",stall:1,minStage:1},
      {id:"diamondFound",title:"挖到鑽石",text:"土裡閃了一下，竟然挖到一顆鑽石！",coins:1,quality:1,minStage:1},
      {id:"sunlightGood",title:"陽光正好",text:"今天陽光剛剛好，葉子挺得很精神。",growth:1,minStage:1,dayOnly:true},
      {id:"caterpillar",title:"毛毛蟲",text:"葉片邊緣被毛毛蟲咬了一點。",stall:1,quality:-1,minStage:2},
      {id:"ladybugPatrol",title:"瓢蟲巡邏",text:"瓢蟲停在葉片上，好像幫忙趕走了害蟲。",quality:1,minStage:2},
      {id:"beeVisit",title:"蜜蜂停留",text:"小蜜蜂繞著葉子飛，菜園充滿活力。",quality:1,minStage:2},
      {id:"stoneFound",title:"挖到石頭",text:"整理土壤時挖到石頭，根部空間變小了。",stall:1,quality:-1,minStage:3},
      {id:"cleanPebbles",title:"清理碎石",text:"清掉一些碎石後，胡蘿蔔有更多空間長大。",quality:1,minStage:3},
      {id:"snailClose",title:"蝸牛靠近",text:"蝸牛慢慢爬來，葉子被啃了一小塊。",stall:1,minStage:3}
    ].filter(event=>(event.minStage||1)<=stage&&(!event.dayOnly||slot!=="night"));
    if(!isRainy)return common;
    const rain=[
      {id:"rainTooMuch",title:"水太多",text:"雨下太久，土壤變得太濕了。",stall:1,minStage:1},
      {id:"rainSoilWashed",title:"土壤沖散",text:"雨水把表層泥土沖散，根部有點不穩。",stall:1,quality:-1,minStage:1,maxStage:4},
      {id:"rainFertilityWashed",title:"土壤肥力被沖掉",text:"養分被雨水帶走，土壤變得比較貧瘠。",quality:-2,minStage:1},
      {id:"rainFresh",title:"雨後清新",text:"雨後空氣清新，葉子吸飽水分。",growth:1,minStage:2},
      {id:"rainWaterloggedRoot",title:"積水悶根",text:"泥土裡積了太多水，根部有點喘不過氣。",stall:1,quality:-1,minStage:4},
      {id:"rainWorm",title:"雨中蚯蚓",text:"雨後蚯蚓變活躍，土壤被翻得更鬆。",quality:1,minStage:1},
      {id:"rainMudSplash",title:"泥水濺葉",text:"泥水濺到葉片上，看起來有點狼狽。",quality:-1,minStage:3},
      {id:"rainPuddleSafe",title:"小水窪",text:"菜園旁出現小水窪，幸好沒有泡到根部。",minStage:1},
      {id:"rainPuddleBad",title:"小水窪",text:"菜園旁出現小水窪，根部附近暫時太濕了。",stall:1,minStage:1},
      {id:"rainSunBreak",title:"雨停見光",text:"雨停後透出一點陽光，胡蘿蔔恢復精神。",growth:1,quality:1,minStage:1,dayOnly:true},
      {id:"rainSoilCollapse",title:"泥土塌陷",text:"雨水讓泥土變鬆，胡蘿蔔周圍有點塌陷。",stall:1,minStage:4}
    ].filter(event=>(event.minStage||1)<=stage&&(!event.maxStage||stage<=event.maxStage)&&(!event.dayOnly||slot!=="night"));
    return[...common,...rain];
  }
  function gardenStructuredChoiceEvents(stage,context={}){
    return gardenStructuredEventPool(stage,context).map(gardenEventTemplateToChoice).filter(Boolean);
  }
  function gardenAmbientChoiceEvents(stage,context={}){
    const events=gardenStructuredChoiceEvents(stage,context);
    if(stage>0){
      events.push(normalizeGardenChoiceEvent({
        id:"ambientOldCompost",
        title:"路邊肥料袋",
        text:"菜園邊出現一小袋看起來還能用的肥料。",
        choices:[
          {id:"keep",label:"收進倉庫",result:"你收下速效肥料，之後可以拿來施肥。",fertilizer:1},
          {id:"mix",label:"混進土裡",result:"你把一點肥料混進土裡，土壤氣息變好了。",quality:1}
        ]
      }));
    }
    return events.filter(Boolean);
  }
  function gardenTimeObservationEvents(slot){
    const pools={
      morning:[
        {title:"晨露滋養",text:"清晨露水附在葉片上，植株看起來很有精神。",growth:1},
        {title:"朝陽溫和",text:"早上的陽光剛剛好，葉色看起來更穩定。",quality:1},
        {title:"蚯蚓翻土",text:"土裡有蚯蚓活動，泥土變得鬆軟。",fertility:1},
        {title:"露水過重",text:"土壤看起來偏深，水分似乎有點多。",moisture:1},
        {title:"麻雀啄土",text:"麻雀在土面啄了幾下，植株受到一點干擾。",growth:-1},
        {title:"平靜早晨",text:"菜園很安靜，沒有特別變化。"}
      ],
      noon:[
        {title:"日照充足",text:"陽光充足，葉子挺得很直。",growth:1},
        {title:"光合作用旺盛",text:"葉片顏色飽滿，狀態看起來很好。",quality:1},
        {title:"土壤變乾",text:"土壤顏色變淺，水分正在下降。",moisture:-1},
        {title:"午熱曬傷",text:"葉片邊緣有些乾黃，可能被曬得太久。",quality:-1},
        {title:"養分吸收快",text:"植株吸收速度變快，但土壤養分也消耗了一些。",growth:1,nutrients:-1},
        {title:"熱氣悶土",text:"泥土有點悶熱，根部狀態不太舒服。",growth:-1}
      ],
      afternoon:[
        {title:"微風舒展",text:"微風吹過，葉子自然舒展開來。",growth:1},
        {title:"土溫穩定",text:"土壤溫度穩定，根部吸收狀態良好。",quality:1},
        {title:"雜草冒出",text:"旁邊冒出小雜草，開始搶走養分。",nutrients:-1},
        {title:"毛毛蟲出沒",text:"葉片邊緣出現被啃咬的痕跡。",quality:-1,minStage:2},
        {title:"瓢蟲巡邏",text:"瓢蟲停在葉片上，幫忙趕走了害蟲。",quality:1,minStage:2},
        {title:"泥土結塊",text:"表層泥土變硬，根部伸展不太順。",growth:-1}
      ],
      night:[
        {title:"夜露滋養",text:"夜露讓葉片恢復水分，看起來更有精神。",quality:1},
        {title:"根部安定",text:"夜晚溫度穩定，根部慢慢吸收養分。",growth:1},
        {title:"小動物腳印",text:"土面出現小腳印，植株附近被踩亂了。",growth:-1},
        {title:"地鼠靠近",text:"土面有奇怪隆起，可能有地鼠靠近。",quality:-2,minStage:4},
        {title:"靈光微現",text:"夜色中土壤微微發光，這株胡蘿蔔氣息不凡。",quality:2},
        {title:"安靜夜晚",text:"夜晚很平靜，菜園沒有異常。"}
      ]
    };
    return pools[gardenValidWaterSlot(slot)]||pools.morning;
  }
  function gardenStageObservationEvents(stage){
    const pools=[
      [
        {title:"種子安穩",text:"土壤很平靜，種子正在慢慢吸收水分。"},
        {title:"蚯蚓鬆土",text:"土裡有蚯蚓活動，泥土變得更鬆。",growth:1,fertility:1},
        {title:"種子微光",text:"土壤深處微微發亮，種子似乎很有生命力。",quality:1},
        {title:"麻雀啄土",text:"麻雀啄了幾下土面，種子受到打擾。",growth:-1},
        {title:"雜草先長",text:"雜草比種子更早冒出，搶走了一點養分。",nutrients:-1},
        {title:"土壤太硬",text:"土壤有些結塊，種子不容易突破。",growth:-1}
      ],
      [
        {title:"嫩芽冒出",text:"小芽從土裡探出頭，看起來很健康。",growth:1},
        {title:"微光新芽",text:"嫩芽帶著淡淡光澤，狀態不錯。",quality:1},
        {title:"土壤偏乾",text:"土色變淺，小芽有點缺水。",moisture:-1,growth:-1},
        {title:"嫩芽歪斜",text:"小芽有點歪，可能被風吹或土面擠壓。",growth:-1},
        {title:"雜草干擾",text:"雜草靠近嫩芽，開始搶養分。",nutrients:-1},
        {title:"平穩發芽",text:"小芽狀態穩定，沒有明顯變化。"}
      ],
      [
        {title:"小葉舒展",text:"小葉慢慢張開，植株看起來更穩。",growth:1},
        {title:"葉色鮮綠",text:"葉片顏色漂亮，養分吸收良好。",quality:1},
        {title:"毛毛蟲咬葉",text:"小葉邊緣被咬了一點。",quality:-1,condition:"smallLeavesBugBite"},
        {title:"葉尖泛黃",text:"葉片邊緣有些黃，可能水分或養分不平衡。",quality:-1},
        {title:"養分不足",text:"葉片顏色偏淡，土壤養分可能不夠。",nutrients:-1,growth:-1},
        {title:"瓢蟲停留",text:"瓢蟲停在葉片上，菜園狀態變安定。",quality:1}
      ],
      [
        {title:"葉脈清楚",text:"葉脈變得清楚，植株正在穩定生長。",quality:1},
        {title:"吸收順利",text:"根部吸收順暢，成長速度變快。",growth:1},
        {title:"雜草搶養",text:"旁邊雜草變多，土壤養分被分走。",nutrients:-1},
        {title:"葉片捲曲",text:"葉片微微捲曲，狀態不太穩。",growth:-1},
        {title:"水分過多",text:"土壤偏濕，葉片邊緣有點焦黃。",moisture:1,quality:-1},
        {title:"正常成形",text:"小葉穩定成形，沒有特別狀況。"},
        {title:"葉片茂盛",text:"葉子長得很旺，整株看起來有活力。",growth:1},
        {title:"毛毛蟲群",text:"多片葉子出現咬痕，需要清理蟲害。",quality:-2,condition:"lushLeavesBugBite"},
        {title:"葉多耗養",text:"葉子變多後，土壤養分消耗變快。",nutrients:-1},
        {title:"瓢蟲守護",text:"瓢蟲在葉間活動，蟲害壓力降低。",quality:1}
      ],
      [
        {title:"根部膨大",text:"土面微微隆起，胡蘿蔔正在變胖。",growth:1},
        {title:"養分充足",text:"土壤養分足夠，根部膨大很順利。",quality:1},
        {title:"根部卡石",text:"土裡似乎有石頭，根部伸展受阻。",growth:-1},
        {title:"挖到石頭",text:"整理土面時發現石頭，成長空間變小。",growth:-1,fertility:-1},
        {title:"肥傷",text:"養分太濃，葉片邊緣有些焦黃。",quality:-1,growth:-1,condition:"fatteningMatureNutrientBurn"},
        {title:"土壤鬆軟",text:"泥土保持鬆軟，胡蘿蔔有空間長大。",fertility:1}
      ],
      [
        {title:"香氣飄出",text:"胡蘿蔔散出淡淡香氣，看起來快完成了。",quality:1},
        {title:"色澤飽滿",text:"露出的部分顏色飽滿，品質不錯。",quality:1},
        {title:"根部穩定",text:"根部狀態穩定，離採收更近了。",growth:1},
        {title:"地鼠靠近",text:"土面有奇怪隆起，可能有地鼠靠近。",quality:-2},
        {title:"成熟停滯",text:"胡蘿蔔成熟速度變慢，可能養分不足。",growth:-1}
      ],
      [
        {title:"完美成熟",text:"胡蘿蔔狀態極佳，現在採收可能有好結果。",quality:2},
        {title:"採收時機",text:"現在是很好的採收時機。",quality:1},
        {title:"挖到鑽石",text:"土裡閃了一下，竟然發現鑽石。",coins:1},
        {title:"放太久",text:"胡蘿蔔已經成熟太久，品質可能開始下降。",quality:-1},
        {title:"地鼠啃咬",text:"胡蘿蔔被啃掉一角，損失明顯。",quality:-3}
      ]
    ];
    return pools[Math.max(0,Math.min(6,stage))]||pools[0];
  }
  function gardenRainObservationEvents(stage){
    if(stage<=0)return[];
    return[
      {title:"雨水滋潤",text:"雨水讓土壤濕潤，植株吸足了水分。",growth:1,moisture:1},
      {title:"雨後清新",text:"雨後空氣清新，葉片顏色變得更亮。",quality:1},
      {title:"雨中蚯蚓",text:"雨後蚯蚓活動頻繁，土壤被翻得更鬆。",fertility:1},
      {title:"水太多",text:"雨下太久，土壤看起來過濕。",moisture:1,growth:-1},
      {title:"土壤沖散",text:"雨水把表層泥土沖散，根部有些不穩。",fertility:-1},
      {title:"養分被沖掉",text:"雨水帶走部分養分，土壤變得比較貧。",nutrients:-2},
      {title:"積水悶根",text:"水分累積太多，根部有點喘不過氣。",growth:-2,moisture:1},
      {title:"泥水濺葉",text:"泥水濺到葉片上，葉面看起來髒亂。",quality:-1}
    ];
  }
  function gardenSoilObservationEvents(plant){
    const moisture=clampGardenMoisture(plant?.moisture),fertility=Number(plant?.fertility)||2,nutrients=clampGardenNutrients(plant?.nutrients),events=[];
    if(moisture<=0)events.push({title:"土面乾裂",text:"土壤乾裂，植株有缺水壓力。",growth:-2,quality:-1});
    else if(moisture<=2)events.push({title:"土壤偏乾",text:"土壤偏乾，今天需要注意補水。",growth:-1});
    else if(moisture>=8)events.push({title:"積水悶根",text:"土裡水分太多，根部很難呼吸。",growth:-2,quality:-2});
    else if(moisture>=6)events.push({title:"土壤過濕",text:"土壤偏濕，葉緣狀態有點不穩。",growth:-1,quality:-1});
    if(fertility<=0)events.push({title:"土壤貧瘠",text:"泥土缺乏活力，好事件變少了。",quality:-2});
    else if(fertility<=1)events.push({title:"肥力偏差",text:"土壤肥力不足，成長容易停滯。",growth:-1});
    else if(fertility>=5)events.push({title:"靈土氣息",text:"土壤散出淡淡靈氣，品質運勢上升。",quality:2});
    else if(fertility>=4)events.push({title:"鬆軟好土",text:"泥土鬆軟，根部伸展得很舒服。",growth:1});
    if(gardenNutrientsDepleted(nutrients))events.push({title:"養分耗盡",text:"土壤養分幾乎耗盡，必須盡快施肥。",growth:-2,quality:-2});
    else if(gardenNutrientsLow(nutrients))events.push({title:"養分不足",text:"養分偏低，葉色看起來不夠飽滿。",nutrients:-1,quality:-1});
    else if(gardenNutrientsHigh(nutrients))events.push({title:"養分過剩",text:"養分太濃，葉片邊緣有肥傷徵兆。",growth:-1,quality:-1,condition:gardenNutrientBurnConditionForStage(gardenStageIndex(plant?.growth||0))});
    else if(gardenNutrientsGood(nutrients))events.push({title:"養分充足",text:"土壤養分很足，植株狀態穩定。",growth:1,quality:1});
    return events.length?events:[{title:"土壤穩定",text:"濕度、肥力與養分都在穩定範圍。"}];
  }
  function gardenObservationText(result,quality,advice){
    return`觀察結果：${result}\n品質氣息：${quality}\n建議行動：${advice}`;
  }
  function gardenRoutineCareAdvice({moisture=GARDEN_MOISTURE_INITIAL,isRainy=false}={}){
    if(isRainy)return"不用清理，雨天先觀察狀態。";
    if(moisture<=2)return"不用清理，土壤偏乾時可以澆水。";
    if(moisture>=6)return"不用清理，先不要澆水。";
    return"不用清理，照常照顧。";
  }
  function gardenObservationEvent(id,title,result,quality,advice,effect={},weight=1){
    return{id,title,text:gardenObservationText(result,quality,advice),weight,...effect};
  }
  function gardenAddObservationEvent(pool,event,weight=1){
    if(!event)return;
    pool.push({...event,weight:Math.max(1,Number(weight)||1)});
  }
  function gardenRainConditionForStage(stage){
    if(stage<=0)return"";
    if(stage<=2)return"leafOverwater";
    if(stage===3)return"lushLeavesOverwater";
    if(stage===4)return"fatteningOverwater";
    return"";
  }
  function gardenNutrientBurnConditionForStage(stage){
    if(stage<=0)return"";
    if(stage<=2)return"smallLeavesNutrientBurn";
    if(stage===3)return"lushLeavesNutrientBurn";
    return"fatteningMatureNutrientBurn";
  }
  function gardenDryConditionForStage(stage){
    if(stage<=0)return"";
    return stage>=4?"matureDry":"leafDry";
  }
  function gardenBugConditionForStage(stage){
    if(stage<2)return"";
    if(stage===2)return"smallLeavesBugBite";
    if(stage===3)return"lushLeavesBugBite";
    if(stage===4)return"fatteningBugBite";
    return"matureBugBite";
  }
  function gardenDiseaseConditionForStage(stage){
    if(stage<=0)return"";
    if(stage<=2)return"smallLeavesDisease";
    if(stage===3)return"lushLeavesDisease";
    if(stage===4)return"fatteningDisease";
    return"matureDisease";
  }
  function gardenMoistureRiskProfile(moisture){
    const value=clampGardenMoisture(moisture);
    const profiles={
      0:{chance:.6,dry:80,bug:10,disease:0},
      1:{chance:.4,dry:70,bug:30,disease:0},
      2:{chance:.1,dry:0,bug:70,disease:0},
      6:{chance:.1,dry:0,bug:70,disease:30},
      7:{chance:.4,dry:0,bug:10,disease:70},
      8:{chance:.6,dry:0,bug:10,disease:80}
    };
    return profiles[value]||null;
  }
  function gardenMoistureRiskObservationEvent(plant,context={}){
    const stage=gardenStageIndex(plant?.growth||0);
    const moisture=clampGardenMoisture(plant?.moisture);
    const profile=gardenMoistureRiskProfile(moisture);
    if(!profile||Math.random()>=profile.chance)return null;
    const roll=Math.random()*100;
    if(roll<profile.dry){
      const condition=gardenDryConditionForStage(stage);
      return gardenObservationEvent(
        "moistureDryRisk",
        "缺水徵兆",
        stage<=0?"土壤表面乾得發白，種子周圍水分明顯不足。":"土壤顏色偏淺，葉片有些垂下來。",
        "氣息偏乾，品質正在承受壓力。",
        "澆水。",
        {growth:-1,moisture:-1,condition},
        1
      );
    }
    if(roll<profile.dry+profile.bug){
      const condition=gardenBugConditionForStage(stage);
      if(!condition)return null;
      return gardenObservationEvent(
        "moistureBugRisk",
        "蟲害出現",
        moisture<=2?"乾燥的土面旁出現蟲咬痕跡，葉片邊緣被啃了一點。":"土壤偏濕時仍有小蟲靠近，葉片邊緣出現細小咬痕。",
        "品質氣息被蟲害干擾。",
        "使用行動裡的除蟲處理。",
        {quality:-1,condition},
        1
      );
    }
    if(roll<profile.dry+profile.bug+profile.disease){
      const condition=gardenDiseaseConditionForStage(stage);
      if(!condition)return null;
      return gardenObservationEvent(
        "moistureDiseaseRisk",
        "潮濕病害",
        "土壤長時間偏濕，葉片附近出現悶斑，看起來像是病害開始擴散。",
        "濕氣壓住根邊氣息，品質正在下滑。",
        "先排水，之後再處理病害。",
        {growth:-1,quality:-1,condition},
        1
      );
    }
    return null;
  }
  function gardenIsMoistureRiskEvent(event){
    const condition=String(event?.condition||"");
    const id=String(event?.id||"");
    if(/BugBite|Disease|Overwater/.test(condition))return true;
    if(condition==="leafDry"||condition==="matureDry")return true;
    return /Dry|Wet|Bug|Overwater|Waterlog|TooMuch|Disease/i.test(id);
  }
  function gardenRainFinalObservationEvents(stage,context={}){
    if(stage<=0)return[];
    const slot=gardenValidWaterSlot(context.slot);
    const moisture=clampGardenMoisture(context.moisture);
    const nutrients=clampGardenNutrients(context.nutrients);
    const overwaterCondition=gardenRainConditionForStage(stage);
    const pool=[];
    const add=(event,weight=1)=>gardenAddObservationEvent(pool,event,weight);
    add(gardenObservationEvent("rainMoisture","雨水滋潤","雨水讓土壤濕潤，植株吸足了水分。","氣息被雨水穩穩托住。","今天不用再澆水，先觀察狀態。",{growth:1,moisture:1},4));
    add(gardenObservationEvent("rainFreshAir","雨後清新","雨後空氣清新，葉片顏色變得更亮。","品質氣息變得比較清亮。","繼續觀察。",{quality:1},3));
    add(gardenObservationEvent("rainWormActive","雨中蚯蚓","雨後蚯蚓活動頻繁，土壤被翻得更鬆。","根邊氣息變得順暢。",gardenRoutineCareAdvice({moisture,isRainy:true}),{fertility:1},3));
    add(gardenObservationEvent("rainSoilWash","土壤沖散","雨水把表層泥土沖散，根部附近有些不穩。","氣息稍微晃動。","等雨勢緩和後再整理土面。",{fertility:-1,quality:-1},3));
    add(gardenObservationEvent("rainNutrientsWashed","養分被沖掉","雨水帶走一部分養分，土壤變得比較貧。","品質氣息有點變淡。","雨停後可以考慮施肥。",{nutrients:-2},3));
    if(stage>=2)add(gardenObservationEvent("rainMudSplash","泥水濺葉","雨水把泥點濺到葉片上，葉面看起來有些狼狽。","氣息被濕泥干擾。","雨停後再整理葉片。",{quality:-1},2));
    if(slot!=="night")add(gardenObservationEvent("rainSunBreak","雨停見光","雨雲間透出一點光，胡蘿蔔在雨後恢復精神。","氣息重新亮了一些。","繼續觀察。",{growth:1,quality:1},2));
    if(moisture>=5)add(gardenObservationEvent("rainTooMuch","水太多","雨下得有點久，土壤顏色明顯偏深。","濕氣壓住根邊氣息。","先不要澆水。",{growth:-1,moisture:1,condition:overwaterCondition},6));
    if(moisture>=7)add(gardenObservationEvent("rainWaterlog","積水悶根","雨水累積太多，根部附近開始悶住。","氣息被濕氣壓住。","排掉積水，等土壤恢復。",{growth:-2,moisture:1,condition:overwaterCondition},5));
    if(gardenNutrientsLow(nutrients))add(gardenObservationEvent("rainPoorSoil","雨後貧土","雨水沖淡了原本就偏少的養分，葉色看起來更淡。","品質氣息變弱。","雨停後優先施肥。",{nutrients:-1,quality:-1},4));
    return pool;
  }
  function gardenCloudyFinalObservationEvents(stage,context={}){
    const moisture=clampGardenMoisture(context.moisture);
    const nutrients=clampGardenNutrients(context.nutrients);
    const pool=[];
    const add=(event,weight=1)=>gardenAddObservationEvent(pool,event,weight);
    add(gardenObservationEvent("cloudySoftLight","陰天柔光","雲層擋住強光，葉片慢慢舒展。","氣息平穩，沒有被日光曬傷。","繼續觀察。",{quality:1},3));
    add(gardenObservationEvent("cloudySlowGrowth","陰天慢長","今天日照偏弱，成長速度比較慢。","氣息沒有壞掉，只是推進較慢。","可以等待下一個時辰。",{},3));
    add(gardenObservationEvent("cloudyStableSoil","雲影穩土","陰天讓土壤水分散失變慢，濕度維持得比較穩。","根邊氣息穩定。","暫時不用急著澆水。",{},3));
    if(moisture>=5)add(gardenObservationEvent("cloudyDampAir","陰天潮氣","雲層壓低，土壤偏濕，水分散得比較慢。","濕氣稍微聚在根邊。","先不要澆水。",{moisture:1},4));
    if(moisture<=2)add(gardenObservationEvent("cloudyDrySoil","陰天乾土","雖然是陰天，土壤表面仍然偏乾。","氣息偏乾，需要補一點水。","可以澆水。",{moisture:-1},3));
    if(gardenNutrientsLow(nutrients))add(gardenObservationEvent("cloudyPaleLeaf","陰天葉淡","日照不足時，葉色偏淡的問題更明顯。","品質氣息有點弱。","可以考慮施肥。",{quality:-1},3));
    if(stage>=2)add(gardenObservationEvent("cloudyBugTrace","陰影蟲痕","陰影下葉片邊緣有細小咬痕。","氣息被小蟲干擾。","處理蟲害。",{quality:-1,condition:stage>=4?"fatteningBugBite":stage>=3?"lushLeavesBugBite":"smallLeavesBugBite"},2));
    return pool;
  }
  function gardenFinalObservationEvents(plant,context={}){
    const stage=gardenStageIndex(plant?.growth||0);
    const moisture=clampGardenMoisture(plant?.moisture);
    const fertility=clampGardenSoilValue(plant?.fertility,2,5);
    const nutrients=clampGardenNutrients(plant?.nutrients);
    const airHumidity=clampGardenSoilValue(plant?.airHumidity,2,5);
    const airTemperature=clampGardenSoilValue(plant?.airTemperature,2,5);
    const isRainy=!!context.isRainy&&stage>0;
    const pool=[];
    const add=(event,weight=1)=>gardenAddObservationEvent(pool,event,weight);
    const stableText=moisture>=3&&moisture<=4?"土壤濕度適中":moisture<3?"土壤偏乾":"土壤偏濕";

    if(stage<=0){
      add(gardenObservationEvent("seedCalm","種子安穩","土壤很平靜，種子正在慢慢吸收水分。","目前還看不出特別氣息。","再看看。",{},4));
      add(gardenObservationEvent("seedWorm","蚯蚓翻土","土裡有蚯蚓活動，泥土變得比較鬆。","種子的氣息平穩。",gardenRoutineCareAdvice({moisture}),{growth:1,nutrients:1},3));
      add(gardenObservationEvent("seedGlow","種子微光","土壤深處微微發亮，種子似乎很有生命力。","有一點細微的好兆頭。","繼續觀察。",{quality:1},2));
      add(gardenObservationEvent("seedSparrow","麻雀啄土","麻雀在土面啄了幾下，種子受到打擾。","氣息稍微散了一點。","可以先觀察，不需要急著處理。",{growth:-1},2));
      if(moisture<=2)add(gardenObservationEvent("seedDrySoil","土壤偏乾","土壤顏色偏淺，種子周圍水分不足。","種子氣息偏弱。","可以澆水。",{moisture:-1},5));
      if(moisture>=6)add(gardenObservationEvent("seedWetSoil","土壤太濕","土壤顏色偏深，播種處水分有點多。","種子氣息被濕氣悶住。","先不要澆水。",{moisture:1},5));
      return pool;
    }
    if(isRainy)return gardenRainFinalObservationEvents(stage,{slot:context.slot,moisture,fertility,nutrients,airHumidity,airTemperature});
    if(context.weather?.key==="cloudy")return gardenCloudyFinalObservationEvents(stage,{slot:context.slot,moisture,fertility,nutrients,airHumidity,airTemperature});

    if(stage<=2){
      add(gardenObservationEvent("sproutStable","嫩芽穩定","小芽狀態穩定，沒有明顯變化。","氣息平穩，正在慢慢長大。","繼續照顧。",{},3));
      add(gardenObservationEvent("smallLeafStretch","小葉舒展","小葉慢慢舒展開來，看起來很有精神。","葉色乾淨，氣息平穩。","繼續照顧。",{growth:1},3));
      add(gardenObservationEvent("leafGreen","葉色鮮綠","葉片顏色漂亮，養分吸收良好。","品質氣息變得清亮。","再看看。",{quality:1},2));
      if(moisture<=2||airTemperature>=4)add(gardenObservationEvent("smallLeafDry","小葉缺水","土壤顏色偏淺，小葉有些下垂。","氣息偏弱，需要補水。","澆水。",{growth:-1,moisture:-1,condition:"leafDry"},6));
      if(moisture>=6||airHumidity>=5)add(gardenObservationEvent("smallLeafWet","小葉水太多","葉片邊緣有些焦黃，土壤水分似乎太多。","根邊氣息有些悶住。","先不要澆水，可以整理土面或等待恢復。",{quality:-1,moisture:1,condition:"leafOverwater"},5));
      if(stage>=2)add(gardenObservationEvent("smallLeafBug","小葉蟲咬","葉片邊緣有被咬過的痕跡。","氣息有些不穩。","處理蟲害。",{quality:-1,condition:"smallLeavesBugBite"},3));
      if(gardenNutrientsLow(nutrients))add(gardenObservationEvent("leafNutrientLow","養分不足","葉片顏色偏淡，土壤養分可能不夠。","品質氣息偏弱。","可以考慮施肥。",{nutrients:-1},4));
      if(gardenNutrientsHigh(nutrients))add(gardenObservationEvent("smallLeafNutrientBurn","小葉肥傷","養分太濃，小葉邊緣開始焦黃捲曲。","氣息被肥氣壓住，品質可能下滑。","先不要施肥，等待土壤回穩。",{growth:-1,quality:-1,condition:"smallLeavesNutrientBurn"},4));
      return pool;
    }

    if(stage===3){
      add(gardenObservationEvent("lushGood","葉片茂盛","葉子長得很旺，整株看起來有活力。","氣息穩定，值得繼續培養。","再看看。",{growth:1},3));
      add(gardenObservationEvent("lushGreen","綠意濃厚","葉色濃綠，葉片狀態看起來很好。","品質氣息變得穩定。","繼續照顧。",{quality:1},2));
      add(gardenObservationEvent("lushConsume","葉多耗養","葉片變多後，土壤養分消耗變快。","氣息仍穩，但需要注意養分。","可以考慮施肥。",{nutrients:-1},3));
      if(gardenNutrientsLow(nutrients))add(gardenObservationEvent("lushNutrientLow","養分不足","葉色偏淡，茂盛的葉片正在消耗土壤養分。","成長氣息稍微放慢。","施肥。",{growth:-1,nutrients:-1},5));
      if(gardenNutrientsHigh(nutrients))add(gardenObservationEvent("lushNutrientBurn","茂盛肥傷","養分太濃，茂盛葉片的邊緣開始燒焦。","肥氣壓過根邊氣息，品質容易下滑。","先不要施肥，等待土壤回穩。",{growth:-1,quality:-1,condition:"lushLeavesNutrientBurn"},5));
      if(moisture>=6||airHumidity>=5||isRainy)add(gardenObservationEvent("lushOverwater","水分過多","土壤顏色偏深，葉片邊緣開始泛黃。","濕氣太重，氣息有些悶。","先不要澆水，可以排掉積水。",{quality:-1,moisture:1,condition:"lushLeavesOverwater"},6));
      add(gardenObservationEvent("lushBug","蟲害出現","葉片邊緣有被啃咬的痕跡。","品質氣息被干擾。","處理蟲害。",{quality:-1,condition:"lushLeavesBugBite"},3));
      add(gardenObservationEvent("lushBugBad","蟲害嚴重","多片葉子出現咬痕，需要盡快處理。","氣息明顯不穩。","處理蟲害。",{quality:-2,condition:"lushLeavesBugBite"},1));
      return pool;
    }

    if(stage===4){
      add(gardenObservationEvent("rootFattening","根部膨大","土面微微隆起，胡蘿蔔正在變胖。","根部氣息穩定。","繼續照顧。",{growth:1},3));
      add(gardenObservationEvent("rootNutrientGood","養分充足","土壤養分足夠，根部膨大很順利。","品質氣息飽滿。","再看看。",{quality:1},3));
      if(gardenNutrientsHigh(nutrients))add(gardenObservationEvent("fatteningNutrientBurn","長胖肥傷","養分太濃，葉片焦邊明顯，根部也有些悶住。","肥氣過重，品質正在承受壓力。","先不要施肥，等待土壤回穩。",{growth:-1,quality:-1,condition:"fatteningMatureNutrientBurn"},5));
      if(moisture>=6||airHumidity>=5||isRainy)add(gardenObservationEvent("fatteningWet","長胖水太多","土壤顏色偏深，根部似乎有些悶住。","氣息沉悶，不太清亮。","先不要澆水。",{growth:-1,quality:-1,moisture:1,condition:"fatteningOverwater"},6));
      if(moisture>=8)add(gardenObservationEvent("fatteningWaterlog","根部悶住","水分累積太多，根部有點喘不過氣。","根部氣息被壓住。","排掉積水。",{growth:-2,moisture:1,condition:"fatteningOverwater"},4));
      add(gardenObservationEvent("fatteningBug","長胖蟲咬","葉片和根邊出現蟲害痕跡。","品質氣息被干擾。","處理蟲害。",{quality:-1,condition:"fatteningBugBite"},3));
      add(gardenObservationEvent("undergroundMove","地底異動","土面突然小幅隆起，像是有東西在底下移動。","氣息變得有些不安。","整平土面、留意地底動靜。",{quality:-1},2));
      add(gardenObservationEvent("moleBite","地鼠啃咬","地鼠靠近根部，胡蘿蔔被啃出明顯傷痕。","品質氣息大幅下滑。","趕走地鼠、整理土面。",{quality:-3,condition:"moleEaten"},1));
      return pool;
    }

    if(stage===5){
      add(gardenObservationEvent("matureFragrance","成熟香氣","胡蘿蔔散出淡淡香氣，看起來快完成了。","根部氣息飽滿，狀態不錯。","繼續培養。",{quality:1},4));
      add(gardenObservationEvent("matureColor","色澤飽滿","露出的部分顏色飽滿，品質看起來不錯。","氣息清亮穩定。","再看看。",{quality:1},3));
      add(gardenObservationEvent("matureStable","成熟穩定","成熟狀態很穩，沒有明顯異常。","品質氣息保持平順。","繼續觀察。",{},3));
      if(gardenNutrientsHigh(nutrients))add(gardenObservationEvent("matureNutrientBurn","成熟肥傷","成熟葉片焦邊擴大，土壤肥氣已經太濃。","品質氣息被肥傷拖住。","先不要施肥，等待土壤回穩。",{growth:-1,quality:-1,condition:"fatteningMatureNutrientBurn"},5));
      if(moisture<=2||airTemperature>=4)add(gardenObservationEvent("matureDry","成熟缺水","成熟期葉片開始下垂，土壤顏色偏淺。","氣息偏乾，品質可能下降。","澆水。",{quality:-1,moisture:-1,condition:"matureDry"},5));
      add(gardenObservationEvent("matureBug","成熟蟲咬","成熟葉片上出現蟲咬痕跡。","品質氣息被干擾。","處理蟲害。",{quality:-1,condition:"matureBugBite"},3));
      add(gardenObservationEvent("matureMoleNear","地鼠靠近","土面有奇怪隆起，可能有地鼠靠近。","氣息變得不安。","整平土面、趕走地鼠。",{quality:-1},2));
      add(gardenObservationEvent("matureMoleBite","地鼠啃咬","胡蘿蔔成熟後香氣太明顯，被地鼠啃掉一角。","品質氣息大幅下滑。","趕走地鼠、整理土面。",{quality:-3,condition:"moleEaten"},1));
      return pool;
    }

    add(gardenObservationEvent("harvestTiming","採收時機","現在是很好的採收時機。","氣息飽滿，胡蘿蔔狀態很好。","採收。",{quality:1},4));
    add(gardenObservationEvent("perfectMature","完美成熟","胡蘿蔔狀態極佳，現在採收可能有好結果。","品質氣息非常飽滿。","採收。",{quality:2},2));
    add(gardenObservationEvent("leftTooLong","放太久","胡蘿蔔已經成熟太久，品質可能開始下降。","氣息有些鬆散。","採收。",{quality:-1},2));
    if(gardenNutrientsHigh(nutrients))add(gardenObservationEvent("harvestNutrientBurn","成熟肥傷","葉片焦邊還在擴大，這株已經被過量養分拖住。","品質氣息不太穩。","盡快採收或等待土壤回穩。",{quality:-1,condition:"fatteningMatureNutrientBurn"},3));
    add(gardenObservationEvent("harvestBug","可採收蟲咬","可採收的葉片出現蟲咬痕跡。","品質氣息被干擾。","處理蟲害後採收。",{quality:-1,condition:"matureBugBite"},2));
    add(gardenObservationEvent("harvestMoleBite","地鼠啃咬","胡蘿蔔放在土裡太顯眼，被地鼠啃出傷痕。","品質氣息大幅下滑。","趕走地鼠、整理土面。",{quality:-3,condition:"moleEaten"},1));
    add(gardenObservationEvent("diamondFound","挖到鑽石","土裡閃了一下，竟然發現鑽石。","這株胡蘿蔔氣息不凡。","收下。",{coins:1},1));
    if(isRainy&&moisture>=7)add(gardenObservationEvent("rainWaterlog","積水悶根","雨水讓土壤過濕，根部附近積了太多水。","氣息被濕氣壓住。","排掉積水。",{growth:-2,moisture:1,condition:"fatteningOverwater"},3));
    return pool;
  }
  function gardenSpecialObservationEvent(plant,stage){
    const tier=gardenRollChoiceEventTier(stage);
    if(!tier)return null;
    const qualityHint=Number(plant?.qualityShift)||0;
    if(tier==="gold"&&stage>=5){
      const reward=gardenBuyerDiamondReward(plant,{highPrice:true});
      return normalizeGardenChoiceEvent({
        id:"highPriceBuyer",
        title:"富豪收購",
        text:"富豪看中這根胡蘿蔔，開出高價想要立刻收購。",
        choices:[
          {id:"sell",label:"鑽石出售",result:`你把成熟胡蘿蔔賣給富豪，換到 ${formatCommaNumber(reward)} 鑽石。`,coins:reward,sellPlant:true},
          {id:"keep",label:"自己採收",result:"你決定保留胡蘿蔔，等待正式採收。",quality:1}
        ]
      });
    }
    if(tier==="yellow"&&stage>=5&&qualityHint>=2){
      const reward=gardenBuyerDiamondReward(plant);
      return normalizeGardenChoiceEvent({
        id:"earlyBuyer",
        title:"路人採購",
        text:"有路人看上這根胡蘿蔔，想提前收購。",
        choices:[
          {id:"sell",label:"提前賣出",result:`你把胡蘿蔔提前賣出，換到 ${formatCommaNumber(reward)} 鑽石。`,coins:reward,sellPlant:true},
          {id:"keep",label:"繼續培育",result:"你決定繼續培育，讓品質再提升一點。",quality:1}
        ]
      });
    }
    return null;
  }
  function gardenRollChoiceEventTier(stage){
    if(Math.random()>=GARDEN_CHOICE_EVENT_GATE_RATE)return "";
    const rates=stage>=5?GARDEN_CHOICE_EVENT_RATES_MATURE:GARDEN_CHOICE_EVENT_RATES_BEFORE;
    const roll=Math.random();
    let mark=0;
    for(const tier of ["yellow","red","purple","gold"]){
      mark+=Number(rates[tier])||0;
      if(roll<mark)return tier;
    }
    return "";
  }
  function pickWeightedObservationGroup(groups){
    const usable=groups.filter(group=>group.events?.length&&group.weight>0);
    const total=usable.reduce((sum,group)=>sum+group.weight,0);
    let roll=Math.random()*(total||1);
    for(const group of usable){
      roll-=group.weight;
      if(roll<=0)return group.events;
    }
    return usable[0]?.events||[];
  }
  function gardenCanQueueChoiceEvent(plant,{today=todayKey()}={}){
    if(!plant||plant.status==="dead"||plant.status==="eaten"||plant.pendingChoiceEvent)return false;
    return String(plant.choiceEventDate||"")!==String(today||todayKey());
  }
  function gardenQueueChoiceEvent(plant,event,{today=todayKey(),slot=gardenTimeSlot(),source="event"}={}){
    const validSlot=gardenValidWaterSlot(slot);
    if(!gardenCanQueueChoiceEvent(plant,{today}))return null;
    const choiceEvent=normalizeGardenChoiceEvent({
      ...event,
      source,
      eventKey:`${source}:${today}:${validSlot}`
    });
    if(!choiceEvent)return null;
    plant.choiceEventDate=String(today||todayKey());
    plant.choiceEventSlot=validSlot;
    plant.pendingChoiceEvent=choiceEvent;
    return choiceEvent;
  }
  function gardenQueueAmbientEvent(plant,{today=todayKey(),slot=gardenTimeSlot()}={}){
    return;
  }
  function rollGardenEvent(plant,context={}){
    const stage=gardenStageIndex(plant?.growth||0);
    const slot=gardenValidWaterSlot(context.slot);
    const isRainy=!!context.isRainy;
    const weather=context.weather||gardenWeatherForDate(todayKey());
    const env=gardenEnvironmentForSlot(weather,slot);
    plant.airHumidity=env.airHumidity;
    plant.airTemperature=env.airTemperature;
    const specialEvent=context.allowChoice!==false?gardenSpecialObservationEvent(plant,stage):null;
    if(specialEvent)return specialEvent;
    const recentTitles=recentGardenEventTitles(plant);
    const moistureRiskEvent=gardenMoistureRiskObservationEvent(plant,{slot,isRainy,weather});
    if(moistureRiskEvent)return{title:moistureRiskEvent.title,text:gardenEventTextWithEffect(plant,moistureRiskEvent)};
    const moistureProfile=gardenMoistureRiskProfile(plant?.moisture);
    const events=gardenFinalObservationEvents(plant,{slot,isRainy,weather});
    const filteredEvents=moistureProfile?events.filter(event=>!gardenIsMoistureRiskEvent(event)):events;
    const usableEvents=filteredEvents.length?filteredEvents:events;
    const event=pickGardenWeightedEvent(usableEvents,recentTitles);
    return{title:event.title,text:gardenEventTextWithEffect(plant,event)};
  }
  function gardenPlantNew(){
    meta.garden=normalizeGardenState(meta.garden);
    if(meta.garden.current)return{ok:false,message:"目前已經有一株胡蘿蔔。"};
    if(meta.garden.seeds<=0)return{ok:false,message:"沒有神秘胡蘿蔔種子。"};
    const today=todayKey();
    const plantingNo=Math.max(1,Math.floor(Number(meta.garden.plantingCount)||0)+1);
    meta.garden.plantingCount=plantingNo;
    meta.garden.seeds--;
    meta.garden.current=normalizeGardenPlant({
      plantingNo,
      growth:0,
      pendingGrowth:0,
      pendingGrowthDate:"",
      airHumidity:2,
      airTemperature:2,
      moisture:GARDEN_MOISTURE_INITIAL,
      moistureDate:today,
      fertility:2,
      nutrients:GARDEN_NUTRIENTS_INITIAL,
      nutrientsScale:"100",
      condition:"",
      plantedDate:today,
      lastCareDate:today,
      lastEvent:{title:`第 ${plantingNo} 次種植`,text:"神秘胡蘿蔔種子已播下，今天可以開始照顧。"}
    });
    gardenAddRecord(`第 ${plantingNo} 次種植`,"神秘胡蘿蔔種子已播下，今天可以開始照顧。",{kind:"plantStart"});
    return{ok:true,message:"已播下神秘胡蘿蔔種子。",focusPlantingNo:plantingNo};
  }
  function gardenObserve(action="observe"){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return{ok:false,message:"尚未種植胡蘿蔔。"};
    if(plant.status==="dead"||plant.status==="eaten")return{ok:false,message:"這株已經無法觀察，請清理後重新種植。"};
    if(plant.pendingChoiceEvent)return{ok:false,message:"先處理菜園事件。"};
    const today=todayKey();
    const slot=gardenValidWaterSlot(String(action||"").split(":")[1]||gardenTimeSlot());
    const weather=gardenWeatherForDate(today);
    const isRainObserve=gardenIsRainObservation(weather,slot);
    const observedSlots=gardenObservedSlotsForToday(plant,today);
    if(observedSlots.includes(slot))return{ok:false,message:""};
    if(observedSlots.length>=GARDEN_MAX_OBSERVE_PER_DAY)return{ok:false,message:""};
    observedSlots.push(slot);
    plant.observeSlotsDate=today;
    plant.observeSlots=observedSlots;
    if(isRainObserve){
      const rainSlots=gardenRainObservedSlotsForToday(plant,today);
      if(!rainSlots.includes(slot))rainSlots.push(slot);
      plant.rainObservedSlotsDate=today;
      plant.rainObservedSlots=rainSlots;
      plant.lastCareDate=today;
      plant.missedStreak=0;
      if(plant.status==="dry")plant.status="growing";
      plant.moisture=clampGardenMoisture(gardenMoistureValue(plant.moisture)+1);
      if(gardenApplyExtremeMoistureRisk(plant,today,weather)){
        return{ok:true,message:plant.lastEvent?.text||"水分異常，植株狀態崩壞。"};
      }
    }
    plant.lastEvent=rollGardenEvent(plant,{slot,weather,isRainy:isRainObserve,allowChoice:gardenCanQueueChoiceEvent(plant,{today})});
    if(plant.lastEvent?.choices?.length){
      const queued=gardenQueueChoiceEvent(plant,plant.lastEvent,{today,slot,source:isRainObserve?"rain":"observe"});
      if(queued)return{ok:true,message:"觀察完成，菜園裡出現了需要選擇的小事件。",choiceEvent:queued};
    }
    plant.pendingChoiceEvent=null;
    gardenAddRecord(`觀察事件・${plant.lastEvent.title}`,plant.lastEvent.text);
    return{ok:true,message:`${gardenWaterSlotName(slot)}觀察完成。`};
  }
  function gardenWaterNarration(slot){
    const title=gardenTitleInfo(meta.garden?.harvestCount||0).name;
    const slotName=gardenWaterSlotName(slot);
    const lines={
      "超級菜鳥":{
        text:`${slotName}有把水澆下去，泥土看起來比較濕了。`,
        qualityText:"品質狀況：一切平穩，品質沒有明顯變化。"
      },
      "會澆水了":{
        text:`${slotName}補水完成，土色從偏乾慢慢轉深，水分有吃進土裡。`,
        qualityText:"品質狀況：水分補得剛好，氣息維持穩定。"
      },
      "嫩芽小手":{
        text:`${slotName}沿著菜框邊緣補水，嫩根附近的土壤濕度回穩。`,
        qualityText:"品質狀況：根邊沒有被水悶住，品質氣息平穩。"
      },
      "種菜好手":{
        text:`${slotName}依照土色補了一輪水，表層濕度上升，底層仍保持透氣。`,
        qualityText:"品質狀況：土壤濕度與根部呼吸維持平衡。"
      },
      "田園高手":{
        text:`${slotName}控制水量滲進根邊，濕度補足但沒有壓住土壤空隙。`,
        qualityText:"品質狀況：土息穩定，品質沒有被水分干擾。"
      },
      "萬物園藝師":{
        text:`${slotName}順著土息補水，水分慢慢沉入根域，植株吸收節奏變穩。`,
        qualityText:"品質狀況：根邊氣息被水分托住，品質維持穩定。"
      },
      "菜園大神":{
        text:`${slotName}只補到土壤需要的位置，濕氣像被牽引一樣均勻散開。`,
        qualityText:"品質狀況：土壤靈氣平順流動，品質狀態穩定。"
      }
    };
    return lines[title]||lines["超級菜鳥"];
  }
  function gardenWater(action="water"){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return gardenPlantNew();
    if(plant.status==="dead"||plant.status==="eaten")return{ok:false,message:"這株已經無法繼續照顧，請清理後重新種植。"};
    if((plant.growth||0)>=15)return{ok:false,message:"已經成熟，可以採收了。"};
    if(plant.pendingChoiceEvent)return{ok:false,message:"先處理菜園事件。"};
    const today=todayKey();
    const slot=gardenValidWaterSlot(String(action||"").split(":")[1]||gardenTimeSlot());
    const weather=gardenWeatherForDate(today);
    const isRainObserve=gardenIsRainObservation(weather,slot);
    if(isRainObserve){
      return{ok:false,message:"下雨時不需要澆水，請改用觀察。"};
    }
    const wateredSlots=gardenWateredSlotsForToday(plant,today);
    if(wateredSlots.includes(slot))return{ok:false,message:""};
    if(wateredSlots.length>=GARDEN_MAX_WATER_PER_DAY)return{ok:false,message:""};
    wateredSlots.push(slot);
    plant.wateredDate=today;
    plant.wateredSlotsDate=today;
    plant.wateredSlots=wateredSlots;
    plant.lastCareDate=today;
    plant.missedStreak=0;
    plant.status="growing";
    if(plant.condition==="leafDry"||plant.condition==="matureDry"){
      plant.condition="";
      plant.conditionDate="";
    }
    plant.moisture=clampGardenMoisture(gardenMoistureValue(plant.moisture)+1);
    plant.pendingGrowth=Math.min(3,(plant.pendingGrowth||0)+1);
    plant.pendingGrowthDate=today;
    const narration=gardenWaterNarration(slot);
    plant.lastEvent={title:"澆水完成",text:narration.text};
    gardenAddRecord("澆水完成",narration.text,{kind:"water",qualityText:narration.qualityText});
    if(gardenApplyExtremeMoistureRisk(plant,today,weather)){
      return{ok:true,message:plant.lastEvent?.text||"水分異常，植株狀態崩壞。"};
    }
    return{ok:true,message:`${gardenWaterSlotName(slot)}澆水完成。`};
  }
  function gardenDrainRainwater(action="drain"){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return{ok:false,message:"尚未種植胡蘿蔔。"};
    if(plant.status==="dead"||plant.status==="eaten")return{ok:false,message:"這株已經無法排水，請清理後重新種植。"};
    if((plant.growth||0)>=15)return{ok:false,message:"已經成熟，可以採收了。"};
    if(plant.pendingChoiceEvent)return{ok:false,message:"先處理菜園事件。"};
    const today=todayKey();
    const slot=gardenValidWaterSlot(String(action||"").split(":")[1]||gardenTimeSlot());
    const weather=gardenWeatherForDate(today);
    if(!gardenIsRainObservation(weather,slot)){
      return{ok:false,message:"只有下雨的白天時辰需要排水。"};
    }
    if(Math.max(0,Math.floor(Number(meta.garden.drainShovels)||0))<GARDEN_DRAIN_SHOVEL_COST){
      return{ok:false,message:"排水需要菜園挖溝鏟 x1，先到活動商店購買。"};
    }
    const drainedSlots=gardenDrainedSlotsForToday(plant,today);
    if(drainedSlots.includes(slot))return{ok:false,message:""};
    const before=clampGardenMoisture(plant.moisture);
    if(before<=GARDEN_MOISTURE_INITIAL){
      return{ok:false,message:"目前土壤還不需要排水。"};
    }
    drainedSlots.push(slot);
    plant.drainSlotsDate=today;
    plant.drainSlots=drainedSlots;
    meta.garden.drainShovels=Math.max(0,Math.floor(Number(meta.garden.drainShovels)||0)-GARDEN_DRAIN_SHOVEL_COST);
    plant.lastCareDate=today;
    plant.missedStreak=0;
    const after=Math.max(2,clampGardenMoisture(before-GARDEN_DRAIN_MOISTURE_REDUCE));
    plant.moisture=after;
    if(plant.condition&&/Overwater/.test(plant.condition)&&after<=5){
      plant.condition="";
      plant.conditionDate="";
    }
    const slotName=gardenWaterSlotName(slot);
    const text=`${slotName}趁雨勢挖出排水溝，消耗菜園挖溝鏟 x1，土壤水分從 ${before} 降到 ${after}。`;
    const qualityText="品質狀況：根邊積水被導走，暫時降低悶根風險。";
    plant.lastEvent={title:"排水完成",text};
    gardenAddRecord("排水完成",text,{kind:"drain",qualityText});
    return{ok:true,message:`${slotName}排水完成。`};
  }
  function gardenFertilizeNarration(){
    const title=gardenTitleInfo(meta.garden?.harvestCount||0).name;
    const lines={
      "超級菜鳥":{
        text:"你把肥料撒進土裡，胡蘿蔔像是精神了一點，額外成長 1 點。",
        qualityText:"品質狀況：土壤變得比較有力，品質運勢小幅上升。"
      },
      "會澆水了":{
        text:"你順著濕土補了一點肥，土壤吸收得剛剛好，胡蘿蔔額外成長 1 點。",
        qualityText:"品質狀況：肥料融進土裡，品質氣息小幅變穩。"
      },
      "嫩芽小手":{
        text:"你避開嫩葉把肥料拌進土裡，根邊氣息穩定，胡蘿蔔額外成長 1 點。",
        qualityText:"品質狀況：養分慢慢沉下去，品質運勢小幅上升。"
      },
      "種菜好手":{
        text:"你看準土壤吸收狀態補肥，養分慢慢沉進根邊，胡蘿蔔額外成長 1 點。",
        qualityText:"品質狀況：土壤氣息變得更飽滿，高品質機率小幅上升。"
      },
      "田園高手":{
        text:"你依照土色與葉勢調整施肥，土壤肥力回穩，胡蘿蔔額外成長 1 點。",
        qualityText:"品質狀況：肥力分布更均勻，高品質機率小幅上升。"
      },
      "萬物園藝師":{
        text:"你讓肥力順著土息流動，根部吸收變得平順，胡蘿蔔額外成長 1 點。",
        qualityText:"品質狀況：土壤氣息被梳理得很穩，品質運勢小幅上升。"
      },
      "菜園大神":{
        text:"你幾乎只用一點肥就喚醒土壤靈氣，胡蘿蔔額外成長 1 點。",
        qualityText:"品質狀況：土壤靈氣被穩穩帶起，高品質機率小幅上升。"
      }
    };
    return lines[title]||lines["超級菜鳥"];
  }
  function gardenPestControl(){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return{ok:false,message:"尚未種植胡蘿蔔。"};
    if(plant.status==="dead"||plant.status==="eaten")return{ok:false,message:"這株已經無法除蟲。"};
    if(plant.pendingChoiceEvent)return{ok:false,message:"先處理菜園事件。"};
    if(!/BugBite/.test(String(plant.condition||"")))return{ok:false,message:"目前沒有蟲害需要處理。"};
    const count=Math.max(0,Math.floor(Number(meta.garden.insecticide)||0));
    if(count<=0)return{ok:false,message:"除蟲需要菜園殺蟲劑 x1，先到活動商店購買。"};
    const label=GARDEN_CONDITION_NAMES[plant.condition]||"蟲害";
    meta.garden.insecticide=count-1;
    plant.lastCareDate=todayKey();
    plant.missedStreak=0;
    plant.condition="";
    plant.conditionDate="";
    plant.qualityShift=Math.max(-20,Math.min(20,(Number(plant.qualityShift)||0)+.5));
    const text=`使用菜園殺蟲劑處理${label}，葉片上的蟲害痕跡被控制住了。`;
    plant.lastEvent={title:"除蟲完成",text};
    gardenAddRecord("除蟲完成",text,{kind:"pest",qualityText:"品質狀況：蟲害壓力解除，品質氣息慢慢回穩。"});
    return{ok:true,message:"除蟲完成。"};
  }
  function gardenFertilize(kind="auto"){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return{ok:false,message:"尚未種植胡蘿蔔。"};
    if(plant.status==="dead"||plant.status==="eaten")return{ok:false,message:"這株已經無法施肥。"};
    const quickCount=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0));
    const slowCount=Math.max(0,Math.floor(Number(meta.garden.slowFertilizer)||0));
    const premiumCount=Math.max(0,Math.floor(Number(meta.garden.premiumSlowFertilizer)||0));
    if(quickCount+slowCount+premiumCount<=0)return{ok:false,message:"肥料不足。先去活動商店購買，或把倉庫胡蘿蔔堆肥。"};
    const type=["quick","slow","premium"].includes(kind)?kind:"auto";
    if(type==="quick"&&quickCount<=0)return{ok:false,message:"速效肥料不足。"};
    if(type==="slow"&&slowCount<=0)return{ok:false,message:"緩釋肥料不足。"};
    if(type==="premium"&&premiumCount<=0)return{ok:false,message:"高級緩釋肥料不足。"};
    const today=todayKey();
    plant.lastCareDate=today;
    if((type==="auto"||type==="quick")&&quickCount>0){
      meta.garden.fertilizer=quickCount-1;
      plant.fertilizerUsed++;
      plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)+GARDEN_QUICK_FERTILIZER_NUTRIENTS);
      const status=gardenNutrientStatusForPlant(plant);
      if(status.state==="high"&&gardenApplyNutrientStress(plant,status,today))return{ok:true,message:"速效肥料讓 EC 過高，植株枯死。"};
      if(status.state==="best"||status.state==="ok"){
        const beforeGrowth=Math.max(0,Math.floor(Number(plant.growth)||0));
        plant.growth=Math.min(15,beforeGrowth+1);
        if(plant.growth>beforeGrowth)gardenConsumeNutrientsForGrowth(plant,1);
        if(plant.growth>=15&&!plant.harvestReadyDate)plant.harvestReadyDate=today;
        plant.bonusGrowth=Math.min(2,plant.bonusGrowth+1);
        plant.fertility=clampGardenSoilValue((Number(plant.fertility)||2)+1,2,5);
        plant.qualityShift+=.5;
        if(plant.condition&&/Overwater/.test(plant.condition)){
          plant.condition="";
          plant.conditionDate="";
        }
        const narration=gardenFertilizeNarration();
        plant.lastEvent={title:"施肥完成",text:`速效肥料：${narration.text}`};
        gardenAddRecord("施肥完成",`速效肥料：${narration.text}`,{kind:"fertilize",qualityText:narration.qualityText});
        return{ok:true,message:"已使用速效肥料。"};
      }
      const text=status.state==="low"
        ?`速效肥料補進土裡，EC +${GARDEN_QUICK_FERTILIZER_NUTRIENTS}，但目前仍低於${status.range.name}階段的可接受範圍，成長暫時不推進。`
        :`速效肥料補進土裡，EC +${GARDEN_QUICK_FERTILIZER_NUTRIENTS}，但目前已高於${status.range.name}階段的可接受範圍，成長暫時不推進。`;
      plant.lastEvent={title:"施肥完成",text};
      gardenAddRecord("施肥完成",text,{kind:"fertilize",qualityText:status.qualityText});
      return{ok:true,message:"已使用速效肥料。"};
    }
    if((type==="auto"||type==="slow")&&slowCount>0){
      meta.garden.slowFertilizer=slowCount-1;
      plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)+GARDEN_SLOW_FERTILIZER_NUTRIENTS);
      plant.slowFertilizerDays=Math.min(10,Math.max(0,Math.floor(Number(plant.slowFertilizerDays)||0))+3);
      plant.slowFertilizerPower=Math.max(GARDEN_SLOW_FERTILIZER_DAILY,Math.floor(Number(plant.slowFertilizerPower)||0));
      const status=gardenNutrientStatusForPlant(plant);
      if(status.state==="high"&&gardenApplyNutrientStress(plant,status,today))return{ok:true,message:"緩釋肥料讓 EC 過高，植株枯死。"};
      if(plant.condition&&/Overwater/.test(plant.condition)){
        plant.condition="";
        plant.conditionDate="";
      }
      const extra=status.state==="high"?"目前 EC 偏高，後續先觀察肥傷。":status.state==="low"?"目前 EC 還偏低，後續會慢慢補上。":"目前 EC 落在可接受範圍。";
      const text=`緩釋肥料埋進土裡，現在 EC +${GARDEN_SLOW_FERTILIZER_NUTRIENTS}，接下來 3 天會慢慢釋放養分。${extra}`;
      plant.lastEvent={title:"施肥完成",text};
      gardenAddRecord("施肥完成",text,{kind:"fertilize",qualityText:status.state==="best"||status.state==="ok"?"品質狀況：養分開始緩慢釋放，土壤狀態比較容易維持。":status.qualityText});
      return{ok:true,message:"已使用緩釋肥料。"};
    }
    if(type!=="auto"&&type!=="premium")return{ok:false,message:"肥料種類錯誤。"};
    meta.garden.premiumSlowFertilizer=premiumCount-1;
    plant.nutrients=clampGardenNutrients(gardenNutrientValue(plant.nutrients)+GARDEN_PREMIUM_SLOW_FERTILIZER_NUTRIENTS);
    plant.slowFertilizerDays=Math.min(10,Math.max(0,Math.floor(Number(plant.slowFertilizerDays)||0))+5);
    plant.slowFertilizerPower=Math.max(GARDEN_PREMIUM_SLOW_FERTILIZER_DAILY,Math.floor(Number(plant.slowFertilizerPower)||0));
    const status=gardenNutrientStatusForPlant(plant);
    if(status.state==="high"&&gardenApplyNutrientStress(plant,status,today))return{ok:true,message:"高級緩釋肥料讓 EC 過高，植株枯死。"};
    if(status.state==="best"||status.state==="ok")plant.qualityShift=Math.max(-20,Math.min(20,(Number(plant.qualityShift)||0)+1));
    if(plant.condition&&/Overwater/.test(plant.condition)){
      plant.condition="";
      plant.conditionDate="";
    }
    const extra=status.state==="high"?"目前 EC 偏高，後續先觀察肥傷。":status.state==="low"?"目前 EC 還偏低，後續會慢慢補上。":"目前 EC 落在可接受範圍。";
    const text=`高級緩釋肥料穩穩鋪進土裡，現在 EC +${GARDEN_PREMIUM_SLOW_FERTILIZER_NUTRIENTS}，接下來 5 天會慢慢釋放養分。${extra}`;
    plant.lastEvent={title:"施肥完成",text};
    gardenAddRecord("施肥完成",text,{kind:"fertilize",qualityText:status.state==="best"||status.state==="ok"?"品質狀況：高級肥力穩定散開，品質運勢 +1%。":status.qualityText});
    return{ok:true,message:"已使用高級緩釋肥料。"};
  }
  function gardenHarvest(){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return{ok:false,message:"尚未種植胡蘿蔔。"};
    if(plant.status==="dead"||plant.status==="eaten")return{ok:false,message:"這株已經不能採收，請清理。"};
    if(plant.growth<15)return{ok:false,message:"還沒成熟，不能採收。"};
    const quality=rollGardenHarvestQuality();
    const result=addGardenCarrot(quality);
    const oldHarvestCount=Math.max(0,Math.floor(Number(meta.garden.harvestCount)||0));
    meta.garden.harvestCount++;
    const titleLevelUp=gardenTitleLevelUpInfo(oldHarvestCount,meta.garden.harvestCount);
    const def=gardenQualityDef(quality);
    const locationText=result.location==="depositBox"?"倉庫已滿，已放入保管箱。":"已放入倉庫。";
    gardenAddRecord("採收完成",`採收到 ${def.rank}・${def.name}。${locationText}`,{kind:"harvest"});
    if(titleLevelUp){
      gardenAddRecord("稱號提升",`你累積收成 ${meta.garden.harvestCount} 次，獲得新稱號「${titleLevelUp.name}」。`,{plant:null});
    }
    gardenClosePlantDays(plant);
    meta.garden.current=null;
    return{ok:true,message:`採收到 ${def.rank}・${def.name}。${locationText}`,harvest:{id:`harvest-${Date.now()}`,quality:def.id,rank:def.rank,name:def.name,location:result.location,locationText},titleLevelUp};
  }
  function gardenClearPlant(){
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    if(!plant)return{ok:false,message:"菜園目前是空地。"};
    if(plant.condition){
      const label=GARDEN_CONDITION_NAMES[plant.condition]||"異常狀態";
      if(/BugBite/.test(plant.condition))return{ok:false,message:"蟲害請使用「行動 > 除蟲」處理。"};
      if(/Overwater/.test(plant.condition))plant.moisture=clampGardenMoisture(gardenMoistureValue(plant.moisture)-1);
      plant.condition="";
      plant.conditionDate="";
      if(plant.status==="dry")plant.status="growing";
      plant.lastEvent={title:"整理完成",text:`已處理${label}，菜園狀態恢復穩定。`};
      gardenAddRecord("整理完成",`已處理${label}，菜園狀態恢復穩定。`);
      return{ok:true,message:`已處理${label}。`};
    }
    if(plant.status!=="dead"&&plant.status!=="eaten"){
      return{ok:false,message:"目前沒有需要清理的異常。"};
    }
    gardenAddRecord("清理菜園","舊的植株已清理，菜園恢復成空地。",{plant:null});
    gardenClosePlantDays(plant);
    meta.garden.current=null;
    return{ok:true,message:"已清理菜園。"};
  }
  function gardenDevAdvanceDay(){
    if(!devModeActive)return{ok:false,message:"只有開發模式可以推進菜園日期。"};
    gardenDevDateOverride=addDaysToKey(todayKey(),1);
    applyGardenMissedDays();
    return{ok:true,message:`開發模式：菜園日期前進到 ${gardenDevDateOverride}。`};
  }
  function gardenPublicState(lastMessage=""){
    applyGardenMissedDays();
    meta.garden=normalizeGardenState(meta.garden);
    const plant=meta.garden.current;
    const rates=gardenRates();
    const today=todayKey();
    const weather=gardenWeatherForDate(today);
    const wateredSlotsToday=plant?gardenWateredSlotsForToday(plant,today):[];
    const currentSlot=typeof activeGardenTimeSlot==="function"?activeGardenTimeSlot():gardenTimeSlot();
    const rainObservedSlotsToday=plant?gardenRainObservedSlotsForToday(plant,today):[];
    const observedSlotsToday=plant?gardenObservedSlotsForToday(plant,today):[];
    const drainedSlotsToday=plant?gardenDrainedSlotsForToday(plant,today):[];
    const isRainObserve=gardenIsRainObservation(weather,currentSlot);
    const fertilizerCount=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0));
    const drainShovelCount=Math.max(0,Math.floor(Number(meta.garden.drainShovels)||0));
    gardenQueueAmbientEvent(plant,{today,slot:currentSlot});
    return{
      version:APP_VERSION,
      devMode:!!devModeActive,
      today,
      weather,
      title:gardenTitleInfo(meta.garden.harvestCount),
      garden:meta.garden,
      choiceEvent:plant?.pendingChoiceEvent||null,
      gardenStats:{
        plantingCount:Math.max(0,Math.floor(Number(meta.garden.plantingCount)||0)),
        harvestCount:Math.max(0,Math.floor(Number(meta.garden.harvestCount)||0)),
        totalPlantDays:gardenShownTotalDays(meta.garden,today)
      },
      plantDay:gardenPlantAgeDays(plant,today),
      qualities:GARDEN_CARROT_QUALITIES,
      plantView:{
        imageKey:gardenPlantImageKey(plant),
        stageName:plant?gardenStageName(plant.growth||0,plant.status||"growing",plant.condition||"",plant.eatenReason||""):"無",
        stageIndex:plant?gardenStageIndex(plant.growth):0,
        wateredSlotsToday,
        rainObservedSlotsToday,
        observedSlotsToday,
        drainedSlotsToday,
        isRainObserve,
        canWater:!!plant&&(plant.growth||0)<15&&plant.status!=="dead"&&plant.status!=="eaten"&&!isRainObserve&&!wateredSlotsToday.includes(currentSlot)&&wateredSlotsToday.length<GARDEN_MAX_WATER_PER_DAY,
        canDrain:!!plant&&(plant.growth||0)<15&&plant.status!=="dead"&&plant.status!=="eaten"&&isRainObserve&&drainShovelCount>=GARDEN_DRAIN_SHOVEL_COST&&!drainedSlotsToday.includes(currentSlot)&&clampGardenMoisture(plant.moisture)>GARDEN_MOISTURE_INITIAL,
        canObserve:!!plant&&plant.status!=="dead"&&plant.status!=="eaten"&&!observedSlotsToday.includes(currentSlot)&&observedSlotsToday.length<GARDEN_MAX_OBSERVE_PER_DAY,
        canHarvest:!!plant&&plant.growth>=15&&plant.status!=="dead"&&plant.status!=="eaten"
      },
      rates,
      message:lastMessage
    };
  }
  function postGardenState(message="",extra=null){
    if(typeof renderGardenUi==="function"){
      renderGardenUi({...gardenPublicState(message),...(extra||{})});
    }
  }
  function handleGardenAction(action){
    let result={ok:false,message:"未知菜園操作。"};
    if(action==="plant")result=gardenPlantNew();
    else if(action==="water"||action.startsWith("water:"))result=gardenWater(action);
    else if(action==="drain"||action.startsWith("drain:"))result=gardenDrainRainwater(action);
    else if(action==="observe"||action.startsWith("observe:"))result=gardenObserve(action);
    else if(action==="fertilize"||action.startsWith("fertilize:"))result=gardenFertilize(action.split(":")[1]||"auto");
    else if(action==="pestControl")result=gardenPestControl();
    else if(action==="harvest")result=gardenHarvest();
    else if(action==="clear")result=gardenClearPlant();
    else if(action==="devNextDay")result=gardenDevAdvanceDay();
    else if(action.startsWith("enhance:"))result=enhanceGardenCarrot(action);
    else if(action.startsWith("eventChoice:"))result=gardenResolvePendingChoice(action);
    else if(action.startsWith("choice:"))result=gardenResolveRecordChoice(action);
    else if(action==="clearRecords")result=gardenClearRecords();
    else if(action.startsWith("discardCarrot:"))result=discardGardenCarrot(action);
    else if(action==="moveDeposit"){
      const moved=moveGardenDepositToStorage();
      result={ok:true,message:moved?`已移入 ${moved} 個保管箱素材。`:"倉庫沒有空位或保管箱是空的。"};
    }
    saveMeta();
    renderMeta();
    const extra={};
    if(result.harvest)extra.harvestPopup={...result.harvest,titleLevelUp:result.titleLevelUp||null};
    if(result.choiceEvent)extra.choiceEvent=result.choiceEvent;
    if(result.clearRecords)extra.clearRecords=true;
    if(Object.prototype.hasOwnProperty.call(result,"focusPlantingNo"))extra.focusPlantingNo=result.focusPlantingNo;
    postGardenState(result.message,Object.keys(extra).length?extra:null);
    if(result.message)showQuickToast(result.message);
    beep(result.ok?760:180,.08,.025,result.ok?"triangle":"square");
  }
  const growthAssets={
    seed:"assets/garden/user-carrot-growth-v5/carrot-growth-00-seed.png",
    sprout:"assets/garden/user-carrot-growth-v5/carrot-growth-01-sprout.png",
    smallLeaves:"assets/garden/user-carrot-growth-v5/carrot-growth-02-small-leaves.png",
    formedLeaves:"assets/garden/user-carrot-growth-v5/carrot-growth-03-formed-leaves.png",
    lushLeaves:"assets/garden/user-carrot-growth-v5/carrot-growth-04-lush-leaves.png",
    fattening:"assets/garden/user-carrot-growth-v5/carrot-growth-05-fattening.png",
    mature:"assets/garden/user-carrot-growth-v5/carrot-growth-06-mature.png",
    harvestReady:"assets/garden/user-carrot-growth-v5/carrot-growth-07-harvest-ready.png",
    matureDry:"assets/garden/user-carrot-growth-v5/carrot-growth-08-mature-dry.png",
    withered:"assets/garden/user-carrot-growth-v5/carrot-growth-09-withered.png",
    eaten:"assets/garden/user-carrot-growth-v5/carrot-growth-10-mole-eaten.png",
    leafOverwater:"assets/garden/user-carrot-growth-v5/carrot-growth-11-leaf-overwater.png",
    fatteningOverwater:"assets/garden/user-carrot-growth-v5/carrot-growth-12-fattening-overwater.png",
    empty:"assets/garden/user-carrot-growth-v5/carrot-growth-13-empty.png",
    leafDry:"assets/garden/user-carrot-growth-v5/carrot-growth-14-leaf-withered.png",
    smallLeavesBugBite:"assets/garden/user-carrot-growth-v5/carrot-growth-15-small-leaves-bug-bite.png",
    lushLeavesBugBite:"assets/garden/user-carrot-growth-v5/carrot-growth-16-lush-leaves-bug-bite.png",
    fatteningBugBite:"assets/garden/user-carrot-growth-v5/carrot-growth-17-fattening-bug-bite.png",
    matureBugBite:"assets/garden/user-carrot-growth-v5/carrot-growth-18-mature-bug-bite.png",
    lushLeavesOverwater:"assets/garden/user-carrot-growth-v5/carrot-growth-19-lush-leaves-overwater.png",
    lushLeavesNutrientBurn:"assets/garden/user-carrot-growth-v5/carrot-growth-20-lush-leaves-nutrient-burn.png",
    fatteningMatureNutrientBurn:"assets/garden/user-carrot-growth-v5/carrot-growth-21-fattening-mature-nutrient-burn.png",
    smallLeavesNutrientBurn:"assets/garden/user-carrot-growth-v5/carrot-growth-22-small-leaves-nutrient-burn.png",
    smallLeavesDisease:`assets/garden/user-carrot-growth-v5/carrot-growth-23-small-leaves-disease.png?v=${APP_VERSION}`,
    lushLeavesDisease:`assets/garden/user-carrot-growth-v5/carrot-growth-24-lush-leaves-disease.png?v=${APP_VERSION}`,
    fatteningDisease:`assets/garden/user-carrot-growth-v5/carrot-growth-25-fattening-disease.png?v=${APP_VERSION}`,
    matureDisease:`assets/garden/user-carrot-growth-v5/carrot-growth-25-fattening-disease.png?v=${APP_VERSION}`
  };
  const gardenMeterAssets={
    moisture:[
      `assets/garden/meters/garden-moisture-meter-0.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-moisture-meter-1.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-moisture-meter-2.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-moisture-meter-3.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-moisture-meter-4.png?v=${APP_VERSION}`
    ],
    ec:[
      `assets/garden/meters/garden-ec-meter-0.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-ec-meter-1.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-ec-meter-2.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-ec-meter-3.png?v=${APP_VERSION}`,
      `assets/garden/meters/garden-ec-meter-4.png?v=${APP_VERSION}`
    ]
  };
  const devGrowthPreviewStages=[
    {key:"seed",name:"種子",stageIndex:0},
    {key:"sprout",name:"發芽",stageIndex:1},
    {key:"smallLeaves",name:"長出小葉",stageIndex:2},
    {key:"formedLeaves",name:"小葉成形",stageIndex:3},
    {key:"lushLeaves",name:"葉子茂盛",stageIndex:3},
    {key:"fattening",name:"胡蘿蔔長胖",stageIndex:4},
    {key:"mature",name:"成熟",stageIndex:5},
    {key:"harvestReady",name:"可採收",stageIndex:6},
    {key:"matureDry",name:"長胖或成熟缺水",stageIndex:5},
    {key:"withered",name:"枯死",stageIndex:5},
    {key:"eaten",name:"被地鼠啃掉",stageIndex:6},
    {key:"leafOverwater",name:"小葉澆水過多",stageIndex:2},
    {key:"fatteningOverwater",name:"長胖澆水過多",stageIndex:4},
    {key:"empty",name:"空地",stageIndex:0},
    {key:"leafDry",name:"小葉缺水",stageIndex:3},
    {key:"smallLeavesBugBite",name:"小葉蟲咬",stageIndex:2},
    {key:"lushLeavesBugBite",name:"葉子茂盛蟲咬",stageIndex:3},
    {key:"fatteningBugBite",name:"胡蘿蔔長胖蟲咬",stageIndex:4},
    {key:"matureBugBite",name:"成熟蟲咬",stageIndex:5},
    {key:"lushLeavesOverwater",name:"葉子茂盛澆水過多",stageIndex:3},
    {key:"lushLeavesNutrientBurn",name:"葉子茂盛肥傷",stageIndex:3},
    {key:"fatteningMatureNutrientBurn",name:"長胖成熟肥傷",stageIndex:4},
    {key:"smallLeavesNutrientBurn",name:"發芽小葉肥傷",stageIndex:2},
    {key:"smallLeavesDisease",name:"小葉病害",stageIndex:2},
    {key:"lushLeavesDisease",name:"葉子茂盛病害",stageIndex:3},
    {key:"fatteningDisease",name:"胡蘿蔔長胖病害",stageIndex:4},
    {key:"matureDisease",name:"成熟病害",stageIndex:5}
  ];
  let gardenState=null,qualities=[],activeTab="garden",enhanceBaseIndex=null,enhanceMaterialIndexes=[],devPreviewIndex=null,devTimeSlotIndex=null,selectedRecordPlantingNo=null,gardenAssetsReady=false,gardenUiInitialized=false;
  const enhanceNeeds={common:2,rare:4,uncommon:7,epic:11,legendary:16,mythic:22,immortal:30,eternal:40};
  const enhanceMaxLevel=GARDEN_ENHANCE_MAX_LEVEL;
  const gardenTimeSlots=["morning","noon","afternoon","night"];
  const gardenTimeNames={morning:"早上",noon:"中午",afternoon:"下午",night:"晚上"};
  const gardenPreloadAssets=[
    "assets/garden/早上.png",
    "assets/garden/中午.png",
    "assets/garden/下午.png",
    "assets/garden/晚上.png",
    "assets/garden/plant-button-frame-clean.png?v=1",
    "assets/garden/user-carrot-growth-v5/carrot-growth-13-empty.png",
    "assets/garden/user-carrot-growth-v5/carrot-growth-00-seed.png",
    ...gardenMeterAssets.moisture,
    ...gardenMeterAssets.ec
  ];
  function action(name){handleGardenAction(name);}
  function preloadImage(src){
    return new Promise(resolve=>{
      const img=new Image();
      const done=()=>resolve(src);
      img.onload=done;
      img.onerror=done;
      img.decoding="async";
      img.src=src;
      if(img.complete)resolve(src);
    });
  }
  function markGardenAssetsReady(){
    if(gardenAssetsReady)return;
    gardenAssetsReady=true;
    document.getElementById("gardenScene")?.classList.add("assetsReady");
    document.getElementById("gardenSceneLoading")?.classList.add("hidden");
  }
  function preloadGardenSceneAssets(){
    return Promise.all(gardenPreloadAssets.map(preloadImage)).catch(()=>[]).finally(()=>markGardenAssetsReady());
  }
  function closeGardenScreen(){
    gardenScreen?.classList.add("hidden");
    syncCoinState(true);
    renderMeta();
  }
  function openGardenForge(){
    gardenScreen?.classList.add("hidden");
    shopMode="forge";
    forgeMessage="";
    forgeSourceMode="";
    renderShop();
    shopScreen.classList.remove("hidden");
    syncCoinState(true);
    renderMeta();
  }
  function qualityDef(id){return qualities.find(q=>q.id===id)||qualities[0]||{id:"common",name:"凡品胡蘿蔔",rank:"一般",asset:""};}
  function qualityIndexOf(id){return Math.max(0,qualities.findIndex(q=>q.id===id));}
  function enhanceNeedForQuality(id){return enhanceNeeds[qualityDef(id).id]||enhanceNeeds.common;}
  function carrotStoredEnergy(item){
    const baseEnergy=enhanceNeedForQuality(item.quality)+Math.max(0,Number(item.exp)||0);
    return baseEnergy*Math.max(1,Math.floor(Number(item.level)||0));
  }
  function setTab(tab){
    activeTab=tab;
    document.querySelectorAll("#gardenScreen .tabBtn").forEach(btn=>btn.classList.toggle("active",btn.dataset.tab===tab));
    document.getElementById("tabGarden")?.classList.toggle("hidden",tab!=="garden");
    document.getElementById("tabStorage")?.classList.toggle("hidden",tab!=="storage");
    document.getElementById("tabEnhance")?.classList.toggle("hidden",tab!=="enhance");
  }
  function dayNumber(key){
    if(!key)return null;
    const parts=String(key).split("-").map(Number);
    if(parts.length!==3||parts.some(n=>!Number.isFinite(n)))return null;
    return Math.floor(Date.UTC(parts[0],parts[1]-1,parts[2])/86400000);
  }
  function gardenDayLabel(payload,plant,today){
    if(!plant)return "第 0 天";
    const fromMain=Number(payload?.plantDay);
    if(Number.isFinite(fromMain)&&fromMain>0)return `第 ${Math.floor(fromMain)} 天`;
    const start=dayNumber(plant.plantedDate),now=dayNumber(today);
    if(start==null||now==null)return "第 1 天";
    return `第 ${Math.max(1,now-start+1)} 天`;
  }
  function gardenStatsLabel(payload){
    const stats=payload?.gardenStats||{},garden=payload?.garden||{};
    const plantingCount=Math.max(0,Math.floor(Number(stats.plantingCount??garden.plantingCount)||0));
    const harvestCount=Math.max(0,Math.floor(Number(stats.harvestCount??garden.harvestCount)||0));
    const totalPlantDays=Math.max(0,Math.floor(Number(stats.totalPlantDays)||0));
    return `播種 ${plantingCount} 次　收成 ${harvestCount} 次　共種植 ${totalPlantDays} 天`;
  }
  function qualityMoodText(shift=0){
    const value=Number(shift)||0;
    if(value>=6)return "品質狀況：靈氣很旺，高品質機會明顯上升。";
    if(value>=3)return "品質狀況：狀態很好，高品質機會小幅上升。";
    if(value>=1)return "品質狀況：土壤氣息穩定，略有好兆頭。";
    if(value===0)return "品質狀況：一切平穩，品質沒有明顯變化。";
    if(value<=-6)return "品質狀況：狀況很差，高品質機會明顯下降。";
    if(value<=-3)return "品質狀況：狀態偏弱，高品質機會下降。";
    return "品質狀況：稍微不穩，高品質機會小幅下降。";
  }
  function renderPips(plantView){
    const wrap=document.getElementById("stagePips");
    if(!wrap)return;
    wrap.innerHTML="";
    const idx=plantView?.stageIndex??0;
    const plant=!!gardenState?.garden?.current;
    for(let i=0;i<7;i++){
      const div=document.createElement("div");
      div.className="pip";
      if(plant&&i<idx)div.classList.add("done");
      if(plant&&i===idx)div.classList.add("now");
      wrap.appendChild(div);
    }
  }
  function gardenMoistureMeterIndex(value){
    const moisture=clampGardenMoisture(value);
    if(moisture<=0)return 0;
    if(moisture<=2)return 1;
    if(moisture<=5)return 2;
    if(moisture<=7)return 3;
    return 4;
  }
  function gardenEcMeterIndex(value){
    const ec=clampGardenNutrients(value);
    if(ec<=20)return 4;
    if(ec<=40)return 3;
    if(ec<=60)return 2;
    if(ec<=80)return 1;
    return 0;
  }
  function renderGardenMeters(garden,plant){
    const moistureMeter=document.getElementById("gardenMoistureMeter");
    const ecMeter=document.getElementById("gardenEcMeter");
    if(moistureMeter){
      const enabled=!!garden?.moistureMeter&&!!plant;
      moistureMeter.classList.toggle("hidden",!enabled);
      if(enabled)moistureMeter.src=gardenMeterAssets.moisture[gardenMoistureMeterIndex(plant.moisture)]||gardenMeterAssets.moisture[2];
    }
    if(ecMeter){
      const enabled=!!garden?.ecMeter&&!!plant;
      ecMeter.classList.toggle("hidden",!enabled);
      if(enabled)ecMeter.src=gardenMeterAssets.ec[gardenEcMeterIndex(plant.nutrients)]||gardenMeterAssets.ec[2];
    }
  }
  function renderCropImage(plantView,imageKey){
    const preview=devPreviewIndex==null?null:devGrowthPreviewStages[devPreviewIndex];
    const cropImg=document.getElementById("cropImg");
    if(!cropImg)return false;
    const applyCropClass=key=>{
      cropImg.classList.toggle("seedTopBoost",key==="seed");
      cropImg.classList.toggle("fatteningOverwaterShift",key==="fatteningOverwater");
    };
    if(preview){
      cropImg.src=growthAssets[preview.key]||growthAssets.empty;
      applyCropClass(preview.key);
      document.getElementById("stageLabel").textContent=`成長階段：${preview.name}`;
      document.getElementById("devStageText").textContent=`開發預覽 ${devPreviewIndex+1}/${devGrowthPreviewStages.length}`;
      renderPips({stageIndex:preview.stageIndex});
      return true;
    }
    cropImg.src=growthAssets[imageKey]||growthAssets.empty;
    applyCropClass(imageKey);
    document.getElementById("stageLabel").textContent=`成長階段：${plantView.stageName||"無"}`;
    document.getElementById("devStageText").textContent="開發預覽";
    renderPips(plantView);
    return false;
  }
  function stepDevPreview(dir){
    if(!gardenState?.devMode)return;
    const total=devGrowthPreviewStages.length;
    devPreviewIndex=devPreviewIndex==null?(dir>0?0:total-1):(devPreviewIndex+dir+total)%total;
    const plantView=gardenState?.plantView||{};
    renderCropImage(plantView,plantView.imageKey||"empty");
  }
  function carrotCard(item,index=null,mode="storage"){
    const q=qualityDef(item.quality);
    const items=[...(gardenState?.garden?.storage||[])];
    const base=enhanceBaseIndex==null?null:items[enhanceBaseIndex];
    const locked=mode==="enhance"&&base&&index!==enhanceBaseIndex&&qualityIndexOf(item.quality)>qualityIndexOf(base.quality);
    const selectable=mode==="enhance"?" selectable":"";
    const selectedBase=mode==="enhance"&&index===enhanceBaseIndex?" selectedBase":"";
    const selectedMaterial=mode==="enhance"&&enhanceMaterialIndexes.includes(index)?" selectedMaterial":"";
    const lockedMaterial=locked?" lockedMaterial":"";
    const data=index==null?"":` data-index="${index}"`;
    const discard=index==null||mode!=="storage"?"":`<button class="discardCarrotBtn" type="button" data-delete-index="${index}" aria-label="堆肥 ${q.name}">x</button>`;
    return `<div class="matSlot${selectable}${selectedBase}${selectedMaterial}${lockedMaterial}"${data}><img class="harvestIcon" src="${q.asset}" alt="${q.name}"><b class="quality${q.id}">${q.name}</b><small>${q.rank}<br>${gardenEnhanceRankText(item.level)}</small>${discard}</div>`;
  }
  function renderStorage(){
    const garden=gardenState?.garden||{},items=[...(garden.storage||[])],cap=Math.max(9,Number(garden.storageCap)||9);
    const grid=document.getElementById("storageGrid");
    if(!grid)return;
    const cards=[];
    for(let i=0;i<cap;i++)cards.push(items[i]?carrotCard(items[i],i,"storage"):`<div class="matSlot emptySlot"><div class="box"></div><b>空格</b><small>${i+1} / ${cap}</small></div>`);
    const deposit=(garden.depositBox||[]).length;
    if(deposit)cards.push(`<div class="matSlot"><b>保管箱</b><small>${deposit} 個待領</small><button class="actionBtn" type="button" data-storage-action="moveDeposit" style="font-size:13px;padding:8px">移入</button></div>`);
    grid.innerHTML=cards.join("");
    document.getElementById("storageText").textContent=`${items.length} / ${cap}`;
  }
  function enhanceMaterialPower(item){return carrotStoredEnergy(item);}
  function gardenTimeSlot(date=new Date()){
    const h=date.getHours();
    if(h>=5&&h<11)return "morning";
    if(h>=11&&h<15)return "noon";
    if(h>=15&&h<19)return "afternoon";
    return "night";
  }
  function activeGardenTimeSlot(){return gardenState?.devMode&&devTimeSlotIndex!=null?gardenTimeSlots[devTimeSlotIndex]:gardenTimeSlot();}
  function updateTimeLabel(slot){
    const label=document.getElementById("devTimeLabel");
    if(label)label.textContent=`時辰：${gardenTimeNames[slot]||"早上"}`;
    const btn=document.getElementById("devTimeNextBtn");
    if(btn)btn.textContent=slot==="night"?"下一天":"下一時辰";
  }
  function renderGardenBackground(){
    const scene=document.getElementById("gardenScene");
    if(!scene)return;
    const slot=activeGardenTimeSlot();
    const rainy=!!gardenState?.weather?.isRainy;
    const bgClass=rainy&&slot!=="night"?"rain":slot;
    scene.className=`gardenScene ${bgClass}${rainy?" rainyWeather":""}${gardenAssetsReady?" assetsReady":""}`;
    updateTimeLabel(slot);
  }
  function stepDevTime(){
    if(!gardenState?.devMode)return;
    const current=devTimeSlotIndex==null?gardenTimeSlots.indexOf(gardenTimeSlot()):devTimeSlotIndex;
    if(current>=gardenTimeSlots.length-1){
      devTimeSlotIndex=0;
      action("devNextDay");
      renderGardenBackground();
      return;
    }
    devTimeSlotIndex=Math.max(0,current)+1;
    postGardenState();
  }
  function weekdayDateLabel(dateKey){
    const parts=String(dateKey||"").split("-").map(Number);
    if(parts.length!==3||parts.some(value=>!Number.isFinite(value)))return "未知";
    const date=new Date(parts[0],parts[1]-1,parts[2]);
    const week=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][date.getDay()]||"星期?";
    return `${parts[1]}/${parts[2]} ${week}`;
  }
  function recordTimePeriod(createdAt){
    const date=new Date(Number(createdAt)||Date.now()),hour=date.getHours();
    if(hour<11)return "早上";
    if(hour<15)return "中午";
    if(hour<19)return "下午";
    return "晚上";
  }
  function gardenRecordHeader(record){
    const dateText=weekdayDateLabel(record?.date);
    const slot=GARDEN_WATER_SLOTS.includes(record?.slot)?record.slot:"";
    const slotText=slot?gardenWaterSlotName(slot):recordTimePeriod(record?.createdAt);
    const weatherText=record?.weatherName||gardenWeatherForDate(record?.date).name;
    return `${dateText} ${slotText} ${weatherText}`;
  }
  function dayNumberFromKey(dateKey){
    const parts=String(dateKey||"").split("-").map(Number);
    if(parts.length!==3||parts.some(value=>!Number.isFinite(value)))return null;
    return Math.floor(Date.UTC(parts[0],parts[1]-1,parts[2])/86400000);
  }
  function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
  function syncRecordPlantingNav(records,payload){
    const prevBtn=document.getElementById("recordPrevPlantBtn"),nextBtn=document.getElementById("recordNextPlantBtn"),label=document.getElementById("recordPlantLabel");
    const plantingCount=Math.max(0,Math.floor(Number(payload?.garden?.plantingCount)||0));
    const plantingNos=[...new Set(records.map(record=>Math.max(0,Math.floor(Number(record?.plantingNo)||0))).filter(no=>no>0))].sort((a,b)=>a-b);
    const fallbackNo=plantingNos.length?plantingNos[plantingNos.length-1]:plantingCount;
    if(!selectedRecordPlantingNo||!plantingNos.includes(selectedRecordPlantingNo))selectedRecordPlantingNo=fallbackNo||0;
    const currentIndex=plantingNos.indexOf(selectedRecordPlantingNo);
    if(label)label.textContent=`第 ${selectedRecordPlantingNo||0} 次種植`;
    if(prevBtn)prevBtn.disabled=currentIndex<=0;
    if(nextBtn)nextBtn.disabled=currentIndex<0||currentIndex>=plantingNos.length-1;
    return selectedRecordPlantingNo;
  }
  function selectedRecordPlantDay(records,payload){
    const activeNo=selectedRecordPlantingNo||0;
    const currentNo=Math.max(0,Math.floor(Number(payload?.garden?.current?.plantingNo)||0));
    if(activeNo&&activeNo===currentNo&&Number(payload?.plantDay)>0)return Math.max(1,Math.floor(Number(payload.plantDay)||1));
    const plantRecords=records.filter(record=>Math.max(0,Math.floor(Number(record?.plantingNo)||0))===activeNo);
    const recordedDays=plantRecords.map(record=>Math.max(0,Math.floor(Number(record?.plantDay)||0))).filter(Boolean);
    const dates=[...new Set(plantRecords.map(record=>String(record?.date||"")).filter(Boolean))].sort();
    let dateDays=0;
    if(dates.length){
      const first=dayNumberFromKey(dates[0]),last=dayNumberFromKey(dates[dates.length-1]);
      dateDays=first==null||last==null?1:Math.max(1,last-first+1);
    }
    return Math.max(0,Math.floor(Number(payload?.plantDay)||0),recordedDays.length?Math.max(...recordedDays):0,dateDays);
  }
  function recordPlantDayValue(record,plantRecords,payload){
    if(record?.kind==="plantStart")return 1;
    const stored=Math.max(0,Math.floor(Number(record?.plantDay)||0));
    const activeNo=selectedRecordPlantingNo||0,currentNo=Math.max(0,Math.floor(Number(payload?.garden?.current?.plantingNo)||0));
    if(activeNo&&activeNo===currentNo&&String(record?.date||"")===String(payload?.today||"")&&Number(payload?.plantDay)>0)return Math.max(1,Math.floor(Number(payload.plantDay)||1));
    const dateKeys=[...new Set(plantRecords.map(item=>String(item?.date||"")).filter(Boolean))].sort();
    const firstDateNo=dayNumberFromKey(dateKeys[0]),currentDateNo=dayNumberFromKey(record?.date);
    const dateValue=firstDateNo==null||currentDateNo==null?0:Math.max(1,currentDateNo-firstDateNo+1);
    return Math.max(stored,dateValue);
  }
  function renderGrowthRecords(payload,plant){
    const list=document.getElementById("growthRecordList");
    if(!list)return;
    let records=Array.isArray(payload?.garden?.records)?payload.garden.records:[];
    const hasRealRecords=records.length>0;
    if(!records.length){
      const last=plant?.lastEvent;
      const eventText=`${last?.title||"菜園狀態"}：${last?.text||"今天還沒有新的紀錄。"}`;
      const qualityText=plant?gardenQualityRecordText(plant):"等待新的神秘種子。";
      records=[{id:"fallback",date:payload?.today,slot:typeof activeGardenTimeSlot==="function"?activeGardenTimeSlot():gardenTimeSlot(),weatherName:payload?.weather?.name,title:last?.title||"菜園狀態",text:`${eventText}\n${qualityText}`,choices:[]}];
    }
    records=[...records];
    const activePlantingNo=syncRecordPlantingNav(records,payload);
    records=records.filter(record=>Math.max(0,Math.floor(Number(record?.plantingNo)||0))===activePlantingNo);
    records.sort((a,b)=>{
      const aStart=a?.kind==="plantStart"?1:0,bStart=b?.kind==="plantStart"?1:0;
      if(aStart!==bStart)return aStart-bStart;
      const dayCompare=recordPlantDayValue(b,records,payload)-recordPlantDayValue(a,records,payload);
      if(dayCompare)return dayCompare;
      const dateCompare=String(b?.date||"").localeCompare(String(a?.date||""));
      if(dateCompare)return dateCompare;
      return((Number(b?.createdAt)||0)-(Number(a?.createdAt)||0))||String(b?.id||"").localeCompare(String(a?.id||""));
    });
    const currentRecordDay=selectedRecordPlantDay(records,payload);
    const todayNumber=dayNumberFromKey(payload?.today);
    const dayText=document.getElementById("dayText");
    if(dayText)dayText.textContent=!plant&&!hasRealRecords?"第 0 天":`第 ${currentRecordDay} 天`;
    const pieces=[]; let lastDay=null;
    records.slice(0,40).forEach((record,index)=>{
      const dateKey=String(record?.date||"");
      const plantDay=recordPlantDayValue(record,records,payload);
      const recordDateNumber=dayNumberFromKey(dateKey);
      const isOldDay=(plantDay>0&&currentRecordDay>0&&plantDay<currentRecordDay)||(recordDateNumber!=null&&todayNumber!=null&&recordDateNumber<todayNumber);
      if(index>0&&plantDay&&plantDay!==lastDay)pieces.push(`<div class="recordDayDivider${isOldDay?" oldDay":""}"><span>第${plantDay}天</span></div>`);
      const choices=Array.isArray(record.choices)&&record.choices.length?`<div class="recordChoices">${record.choices.map(choice=>`<button class="recordChoiceBtn" type="button" data-record-id="${escapeHtml(record.id)}" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}</button>`).join("")}</div>`:"";
      const isSeparator=record.kind==="plantStart"||record.kind==="lostNotebook";
      const title=String(record?.title||""),kind=String(record?.kind||"");
      const isWaterRecord=kind==="water"||kind==="drain"||title.startsWith("澆水完成")||title.startsWith("排水完成");
      const isFertilizeRecord=kind==="fertilize"||title.startsWith("施肥完成");
      const recordClass=["recordBox",isSeparator?"separator":"",isWaterRecord?"waterRecord":"",isFertilizeRecord?"fertilizeRecord":"",isOldDay?"oldDay":""].filter(Boolean).join(" ");
      pieces.push(`<div class="${recordClass}"><span class="recordDate">${escapeHtml(gardenRecordHeader(record))}：</span>${escapeHtml(gardenDisplayRecordText(record))}${choices}</div>`);
      lastDay=plantDay;
    });
    list.innerHTML=pieces.join("");
  }
  function showHarvestResult(harvest){
    const overlay=document.getElementById("gardenHarvestResult"),text=document.getElementById("gardenHarvestResultText");
    if(!overlay||!text||!harvest)return;
    const location=harvest.location==="depositBox"?"倉庫已滿，已放入保管箱。":"已放入倉庫。";
    const titleText=harvest.titleLevelUp?.name?`\n稱號提升：${harvest.titleLevelUp.name}！`:"";
    text.textContent=`你採收到 ${harvest.rank||""}・${harvest.name||"胡蘿蔔"}。${harvest.locationText||location}${titleText}`;
    overlay.dataset.harvestId=harvest.id||String(Date.now());
    overlay.classList.remove("hidden");
  }
  function showGardenChoiceEvent(choiceEvent){
    const overlay=document.getElementById("gardenChoiceEvent"),title=document.getElementById("gardenChoiceEventTitle"),text=document.getElementById("gardenChoiceEventText"),actions=document.getElementById("gardenChoiceActions");
    const event=choiceEvent&&Array.isArray(choiceEvent.choices)?choiceEvent:null;
    if(!overlay||!title||!text||!actions||!event)return;
    if(!overlay.classList.contains("hidden")&&overlay.dataset.eventId===String(event.id||""))return;
    overlay.dataset.eventId=String(event.id||"");
    title.textContent=event.title||"菜園事件";
    text.textContent=event.text||"菜園裡發生了一件小事。";
    const effectLabel=choice=>gardenEffectSummary(choice,{
      fertilizerGain:gardenChoiceFertilizerGain(event,choice),
      coinsGain:gardenChoiceCoinGain(event,choice)
    }).replaceAll("，"," / ");
    actions.innerHTML=event.choices.map(choice=>{
      const effect=effectLabel(choice);
      return `<button class="gardenConfirmBtn" type="button" data-garden-event-choice="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}${effect?`<small>${escapeHtml(effect)}</small>`:""}</button>`;
    }).join("");
    overlay.classList.remove("hidden");
  }
  function renderEnhance(){
    const garden=gardenState?.garden||{},items=[...(garden.storage||[])],enhanceItems=items.map((item,index)=>({item,index})).filter(entry=>entry.item&&!entry.item.forged);
    if(enhanceBaseIndex!=null&&(!items[enhanceBaseIndex]||items[enhanceBaseIndex].forged)){enhanceBaseIndex=null;enhanceMaterialIndexes=[];}
    enhanceMaterialIndexes=enhanceMaterialIndexes.filter(index=>items[index]&&!items[index].forged&&index!==enhanceBaseIndex);
    const base=enhanceBaseIndex==null?null:items[enhanceBaseIndex],mats=enhanceMaterialIndexes.map(index=>items[index]).filter(Boolean);
    const baseText=document.getElementById("enhanceBaseText"),matText=document.getElementById("enhanceMatText"),resultText=document.getElementById("enhanceResultText"),enhanceText=document.getElementById("enhanceText"),confirmBtn=document.getElementById("confirmEnhanceBtn"),clearBtn=document.getElementById("clearEnhanceBtn");
    const statusMessage=String(gardenState?.message||"");
    baseText.textContent=base?`${qualityDef(base.quality).name} ${qualityDef(base.quality).rank} ${gardenEnhanceRankText(base.level)}`:"尚未選擇";
    matText.textContent=mats.length?`已選 ${mats.length} 個素材`:"尚未選擇";
    const power=mats.reduce((sum,item)=>sum+enhanceMaterialPower(item),0);
    if(!base){
      resultText.textContent=statusMessage||"請先選擇主體。";
      enhanceText.textContent="先選主體";
    }else if(!mats.length){
      resultText.textContent="再選其他胡蘿蔔作為素材。";
      enhanceText.textContent="再選素材";
    }else{
      const need=enhanceNeedForQuality(base.quality),currentExp=Math.max(0,Number(base.exp)||0),nextExp=Math.min(need*enhanceMaxLevel,currentExp+power),nextLevel=Math.min(enhanceMaxLevel,Math.floor(nextExp/need)),remaining=Math.max(0,need*(nextLevel+1)-nextExp);
      const nextRankText=gardenEnhanceRankText(nextLevel);
      resultText.textContent=nextLevel>=enhanceMaxLevel?`素材能量 ${power}，吸收後會到 ${nextRankText}。達到 S+ 後就能前往鍛造屋。`:`素材能量 ${power}，吸收後會到 ${nextRankText}。距離下一階還差 ${remaining} 點能量。`;
      enhanceText.textContent=`已選 ${mats.length} 個素材`;
    }
    confirmBtn.disabled=!base||!mats.length;
    clearBtn.textContent="清除選取";
    document.getElementById("enhanceGrid").innerHTML=enhanceItems.length?enhanceItems.map(({item,index})=>carrotCard(item,index,"enhance")).join(""):`<div class="matSlot emptySlot"><div class="box"></div><b>沒有可吸收素材</b><small>已鍛造胡蘿蔔不會顯示</small></div>`;
  }
  function renderGardenUi(payload){
    gardenState=payload;
    qualities=payload.qualities||qualities;
    const garden=payload.garden||{},plant=garden.current,plantView=payload.plantView||{},imageKey=plantView.imageKey||"empty";
    const scenePlantBtn=document.getElementById("scenePlantBtn"),scenePlantLabel=document.getElementById("scenePlantLabel"),scenePlantSeedText=document.getElementById("scenePlantSeedText"),waterBtn=document.getElementById("waterBtn"),observeBtn=document.getElementById("observeBtn"),fertBtn=document.getElementById("fertBtn"),gardenEventBtn=document.getElementById("gardenEventBtn");
    if(!scenePlantBtn||!scenePlantLabel||!scenePlantSeedText||!waterBtn||!observeBtn||!fertBtn)return;
    document.getElementById("versionText").textContent=`V.${payload.version||"-"}`;
    document.getElementById("seedCount").textContent=payload.title?.name||"超級菜鳥";
    const activeSlot=activeGardenTimeSlot();
    const weatherName=payload.weather?.name||"晴朗";
    const isRainObserve=!!payload.weather?.isRainy&&activeSlot!=="night";
    const hasGardenEvent=!!normalizeGardenChoiceEvent(payload.choiceEvent);
    document.getElementById("waterStatus").textContent=plant?weatherName:"未種植";
    document.getElementById("devTimeControl").classList.toggle("hidden",!payload.devMode);
    document.getElementById("devClearRecordsBtn")?.classList.toggle("hidden",!payload.devMode);
    if(!payload.devMode)devTimeSlotIndex=null;
    renderGardenBackground();
    renderGardenMeters(garden,plant);
    document.getElementById("devStageControls").classList.toggle("hidden",!payload.devMode);
    if(!payload.devMode)devPreviewIndex=null;
    const usingDevPreview=renderCropImage(plantView,imageKey);
    document.getElementById("stageLabel").classList.toggle("hidden",!payload.devMode);
    if(payload.clearRecords)selectedRecordPlantingNo=null;
    if(Object.prototype.hasOwnProperty.call(payload,"focusPlantingNo"))selectedRecordPlantingNo=Math.max(0,Math.floor(Number(payload.focusPlantingNo)||0));
    document.getElementById("titleSubtitle").textContent=payload.title?.name||"超級菜鳥";
    document.getElementById("growthText").textContent=plant?`${plant.growth||0} / 15`:"0 / 15";
    document.getElementById("dayText").textContent=gardenDayLabel(payload,plant,payload.today);
    document.getElementById("gardenStatsText").textContent=gardenStatsLabel(payload);
    document.getElementById("titleText").textContent=payload.title?.name||"超級菜鳥";
    document.getElementById("qualityText").textContent=plant?`${(plant.qualityShift||0)>=0?"+":""}${plant.qualityShift||0}`:"+0";
    const fertilizerCount=Math.max(0,Math.floor(Number(garden.fertilizer)||0));
    const slowFertilizerCount=Math.max(0,Math.floor(Number(garden.slowFertilizer)||0));
    const premiumSlowFertilizerCount=Math.max(0,Math.floor(Number(garden.premiumSlowFertilizer)||0));
    const totalFertilizerCount=fertilizerCount+slowFertilizerCount+premiumSlowFertilizerCount;
    const drainShovelCount=Math.max(0,Math.floor(Number(garden.drainShovels)||0));
    const insecticideCount=Math.max(0,Math.floor(Number(garden.insecticide)||0));
    document.getElementById("fertText").textContent=`速${fertilizerCount} 緩${slowFertilizerCount} 高${premiumSlowFertilizerCount}`;
    const canSceneHarvest=!!plantView.canHarvest;
    scenePlantLabel.textContent=canSceneHarvest?"採收":"播種";
    scenePlantSeedText.textContent=canSceneHarvest?"點擊採收":`神秘種子 X ${garden.seeds||0}`;
    waterBtn.textContent=isRainObserve?`排水 x ${drainShovelCount}`:"澆水";
    waterBtn.disabled=plant?hasGardenEvent||(isRainObserve?!plantView.canDrain:!plantView.canWater):true;
    observeBtn.textContent="觀察";
    observeBtn.disabled=plant?hasGardenEvent||!plantView.canObserve:true;
    fertBtn.textContent="行動";
    scenePlantBtn.classList.toggle("hidden",!!plant&&!canSceneHarvest);
    gardenEventBtn?.classList.toggle("hidden",!hasGardenEvent);
    if(gardenEventBtn)gardenEventBtn.disabled=!hasGardenEvent;
    fertBtn.disabled=!plant||plant.status==="dead"||plant.status==="eaten"||hasGardenEvent;
    fertBtn.dataset.fertilizerCount=String(totalFertilizerCount);
    fertBtn.dataset.drainShovelCount=String(drainShovelCount);
    fertBtn.dataset.insecticideCount=String(insecticideCount);
    document.getElementById("clearBtn").disabled=!plant;
    renderGrowthRecords(payload,plant);
    if(!usingDevPreview)renderPips(plantView);
    renderStorage();
    renderEnhance();
    if(payload.harvestPopup)showHarvestResult(payload.harvestPopup);
    setTab(activeTab);
  }
  function toggleEnhanceIndex(index){
    const items=[...(gardenState?.garden?.storage||[])];
    if(!items[index])return;
    if(enhanceBaseIndex==null||enhanceBaseIndex===index){
      enhanceBaseIndex=enhanceBaseIndex===index?null:index;
      enhanceMaterialIndexes=[];
    }else{
      const base=items[enhanceBaseIndex];
      if(base&&qualityIndexOf(items[index].quality)>qualityIndexOf(base.quality)){
        const resultText=document.getElementById("enhanceResultText");
        if(resultText)resultText.textContent="不能吸收比主體品質更高的胡蘿蔔。";
        return;
      }
      const pos=enhanceMaterialIndexes.indexOf(index);
      if(pos>=0)enhanceMaterialIndexes.splice(pos,1);
      else enhanceMaterialIndexes.push(index);
    }
    renderEnhance();
  }
  function discardCarrot(index){
    if(!Number.isFinite(index))return;
    if(index===enhanceBaseIndex){enhanceBaseIndex=null;enhanceMaterialIndexes=[];}
    else{
      enhanceMaterialIndexes=enhanceMaterialIndexes.filter(itemIndex=>itemIndex!==index).map(itemIndex=>itemIndex>index?itemIndex-1:itemIndex);
      if(enhanceBaseIndex!=null&&enhanceBaseIndex>index)enhanceBaseIndex--;
    }
    action(`discardCarrot:${index}`);
  }
  function closeGardenActionMenu(){
    document.getElementById("gardenActionMenu")?.classList.add("hidden");
    document.getElementById("gardenActionChoices")?.classList.remove("hidden");
    document.getElementById("gardenFertilizerChoices")?.classList.add("hidden");
  }
  function setGardenActionMenuMode(mode="actions"){
    const title=document.getElementById("gardenActionMenuTitle");
    const text=document.getElementById("gardenActionMenuText");
    const actionChoices=document.getElementById("gardenActionChoices");
    const fertilizerChoices=document.getElementById("gardenFertilizerChoices");
    const isFertilizer=mode==="fertilizer";
    if(title)title.textContent=isFertilizer?"選擇肥料":"菜園行動";
    if(text)text.textContent=isFertilizer?"選擇這次要使用的肥料。":"選擇要處理的菜園工作。";
    actionChoices?.classList.toggle("hidden",isFertilizer);
    fertilizerChoices?.classList.toggle("hidden",!isFertilizer);
  }
  function openGardenActionMenu(){
    const menu=document.getElementById("gardenActionMenu");
    if(!menu||!gardenState)return;
    setGardenActionMenuMode("actions");
    const garden=gardenState.garden||{};
    const plant=garden.current;
    const plantView=gardenState.plantView||{};
    const fertilizerCount=Math.max(0,Math.floor(Number(garden.fertilizer)||0))+Math.max(0,Math.floor(Number(garden.slowFertilizer)||0))+Math.max(0,Math.floor(Number(garden.premiumSlowFertilizer)||0));
    const drainShovelCount=Math.max(0,Math.floor(Number(garden.drainShovels)||0));
    const insecticideCount=Math.max(0,Math.floor(Number(garden.insecticide)||0));
    const hasBug=/BugBite/.test(String(plant?.condition||""));
    const alive=!!plant&&plant.status!=="dead"&&plant.status!=="eaten";
    const fertilizeBtn=document.getElementById("gardenActionFertilizeBtn");
    const drainBtn=document.getElementById("gardenActionDrainBtn");
    const pestBtn=document.getElementById("gardenActionPestBtn");
    if(fertilizeBtn){
      fertilizeBtn.textContent=fertilizerCount>0?`施肥 x ${fertilizerCount}`:"施肥 x 0";
      fertilizeBtn.disabled=!alive||fertilizerCount<=0;
    }
    if(drainBtn){
      drainBtn.textContent=drainShovelCount>0?`挖溝排水 x ${drainShovelCount}`:"挖溝排水 x 0";
      drainBtn.disabled=!alive||!plantView.canDrain;
    }
    if(pestBtn){
      pestBtn.textContent=insecticideCount>0?`除蟲 x ${insecticideCount}`:"除蟲 x 0";
      pestBtn.disabled=!alive||!hasBug||insecticideCount<=0;
    }
    const text=document.getElementById("gardenActionMenuText");
    if(text)text.textContent=hasBug?"葉片出現蟲害，可以使用殺蟲劑處理。":"選擇要處理的菜園工作。";
    menu.classList.remove("hidden");
  }
  function openGardenFertilizerMenu(){
    const menu=document.getElementById("gardenActionMenu");
    if(!menu||!gardenState)return;
    const garden=gardenState.garden||{};
    const plant=garden.current;
    const alive=!!plant&&plant.status!=="dead"&&plant.status!=="eaten";
    const quickCount=Math.max(0,Math.floor(Number(garden.fertilizer)||0));
    const slowCount=Math.max(0,Math.floor(Number(garden.slowFertilizer)||0));
    const premiumCount=Math.max(0,Math.floor(Number(garden.premiumSlowFertilizer)||0));
    const quickBtn=document.getElementById("gardenFertilizerQuickBtn");
    const slowBtn=document.getElementById("gardenFertilizerSlowBtn");
    const premiumBtn=document.getElementById("gardenFertilizerPremiumBtn");
    if(quickBtn){
      quickBtn.textContent=`速效肥料 x ${quickCount}`;
      quickBtn.disabled=!alive||quickCount<=0;
    }
    if(slowBtn){
      slowBtn.textContent=`緩釋肥料 x ${slowCount}`;
      slowBtn.disabled=!alive||slowCount<=0;
    }
    if(premiumBtn){
      premiumBtn.textContent=`高級緩釋肥 x ${premiumCount}`;
      premiumBtn.disabled=!alive||premiumCount<=0;
    }
    setGardenActionMenuMode("fertilizer");
    menu.classList.remove("hidden");
  }
  function initGardenUi(){
    if(gardenUiInitialized)return;
    gardenUiInitialized=true;
    preloadGardenSceneAssets();
    document.getElementById("backBtn")?.addEventListener("click",()=>{playUiClick();closeGardenScreen();});
    document.getElementById("bottomHomeBtn")?.addEventListener("click",()=>{playUiClick();closeGardenScreen();});
    document.getElementById("devTimeNextBtn")?.addEventListener("click",()=>{playUiClick();stepDevTime();});
    document.getElementById("devStagePrevBtn")?.addEventListener("click",()=>{playUiClick();stepDevPreview(-1);});
    document.getElementById("devStageNextBtn")?.addEventListener("click",()=>{playUiClick();stepDevPreview(1);});
    document.getElementById("forgeBtn2")?.addEventListener("click",()=>{playUiClick();openGardenForge();});
    document.getElementById("waterBtn")?.addEventListener("click",()=>{
      if(!gardenState?.garden?.current){action("plant");return;}
      action(`${gardenState?.plantView?.isRainObserve?"drain":"water"}:${activeGardenTimeSlot()}`);
    });
    document.getElementById("observeBtn")?.addEventListener("click",()=>action(`observe:${activeGardenTimeSlot()}`));
    document.getElementById("scenePlantBtn")?.addEventListener("click",()=>action(gardenState?.garden?.current&&gardenState?.plantView?.canHarvest?"harvest":"plant"));
    document.getElementById("gardenEventBtn")?.addEventListener("click",()=>{
      const event=normalizeGardenChoiceEvent(gardenState?.choiceEvent);
      if(event){playUiClick();showGardenChoiceEvent(event);}
    });
    document.getElementById("fertBtn")?.addEventListener("click",()=>{playUiClick();openGardenActionMenu();});
    document.getElementById("gardenActionFertilizeBtn")?.addEventListener("click",()=>{playUiClick();openGardenFertilizerMenu();});
    document.getElementById("gardenActionDrainBtn")?.addEventListener("click",()=>{closeGardenActionMenu();action(`drain:${activeGardenTimeSlot()}`);});
    document.getElementById("gardenActionPestBtn")?.addEventListener("click",()=>{closeGardenActionMenu();action("pestControl");});
    document.getElementById("gardenActionCancelBtn")?.addEventListener("click",()=>{playUiClick();closeGardenActionMenu();});
    document.getElementById("gardenFertilizerQuickBtn")?.addEventListener("click",()=>{closeGardenActionMenu();action("fertilize:quick");});
    document.getElementById("gardenFertilizerSlowBtn")?.addEventListener("click",()=>{closeGardenActionMenu();action("fertilize:slow");});
    document.getElementById("gardenFertilizerPremiumBtn")?.addEventListener("click",()=>{closeGardenActionMenu();action("fertilize:premium");});
    document.getElementById("gardenFertilizerBackBtn")?.addEventListener("click",()=>{playUiClick();openGardenActionMenu();});
    const clearConfirm=document.getElementById("gardenClearConfirm"),harvestResult=document.getElementById("gardenHarvestResult"),choiceEventOverlay=document.getElementById("gardenChoiceEvent"),actionMenu=document.getElementById("gardenActionMenu");
    document.getElementById("clearBtn")?.addEventListener("click",()=>{playUiClick();clearConfirm?.classList.remove("hidden");});
    document.getElementById("cancelClearGardenBtn")?.addEventListener("click",()=>{playUiClick();clearConfirm?.classList.add("hidden");});
    document.getElementById("confirmClearGardenBtn")?.addEventListener("click",()=>{clearConfirm?.classList.add("hidden");action("clear");});
    clearConfirm?.addEventListener("click",event=>{if(event.target===clearConfirm)clearConfirm.classList.add("hidden");});
    document.getElementById("closeHarvestResultBtn")?.addEventListener("click",()=>{playUiClick();harvestResult?.classList.add("hidden");});
    harvestResult?.addEventListener("click",event=>{if(event.target===harvestResult)harvestResult.classList.add("hidden");});
    actionMenu?.addEventListener("click",event=>{if(event.target===actionMenu)closeGardenActionMenu();});
    document.getElementById("gardenChoiceActions")?.addEventListener("click",event=>{
      const btn=event.target.closest("[data-garden-event-choice]");
      if(!btn)return;
      choiceEventOverlay?.classList.add("hidden");
      action(`eventChoice:${btn.dataset.gardenEventChoice}`);
    });
    document.getElementById("clearEnhanceBtn")?.addEventListener("click",()=>{playUiClick();enhanceBaseIndex=null;enhanceMaterialIndexes=[];renderEnhance();});
    document.getElementById("devClearRecordsBtn")?.addEventListener("click",()=>{if(gardenState?.devMode)action("clearRecords");});
    document.getElementById("confirmEnhanceBtn")?.addEventListener("click",()=>{if(enhanceBaseIndex==null||!enhanceMaterialIndexes.length)return;action(`enhance:${enhanceBaseIndex}:${enhanceMaterialIndexes.join(",")}`);enhanceBaseIndex=null;enhanceMaterialIndexes=[];});
    document.getElementById("storageGrid")?.addEventListener("click",event=>{
      const discardBtn=event.target.closest("[data-delete-index]"),moveBtn=event.target.closest("[data-storage-action='moveDeposit']");
      if(discardBtn){event.stopPropagation();discardCarrot(Number(discardBtn.dataset.deleteIndex));return;}
      if(moveBtn){event.stopPropagation();action("moveDeposit");}
    });
    document.getElementById("enhanceGrid")?.addEventListener("click",event=>{
      const discardBtn=event.target.closest("[data-delete-index]");
      if(discardBtn){event.stopPropagation();discardCarrot(Number(discardBtn.dataset.deleteIndex));return;}
      const slot=event.target.closest(".matSlot[data-index]");
      if(slot){playUiClick();toggleEnhanceIndex(Number(slot.dataset.index));}
    });
    document.getElementById("growthRecordList")?.addEventListener("click",event=>{
      const btn=event.target.closest(".recordChoiceBtn");
      if(btn)action(`choice:${btn.dataset.recordId}:${btn.dataset.choiceId}`);
    });
    document.getElementById("recordPrevPlantBtn")?.addEventListener("click",()=>{
      const records=Array.isArray(gardenState?.garden?.records)?gardenState.garden.records:[],plantingNos=[...new Set(records.map(record=>Math.max(0,Math.floor(Number(record?.plantingNo)||0))).filter(no=>no>0))].sort((a,b)=>a-b),currentIndex=plantingNos.indexOf(selectedRecordPlantingNo);
      if(currentIndex>0){playUiClick();selectedRecordPlantingNo=plantingNos[currentIndex-1];renderGrowthRecords(gardenState,gardenState?.garden?.current);}
    });
    document.getElementById("recordNextPlantBtn")?.addEventListener("click",()=>{
      const records=Array.isArray(gardenState?.garden?.records)?gardenState.garden.records:[],plantingNos=[...new Set(records.map(record=>Math.max(0,Math.floor(Number(record?.plantingNo)||0))).filter(no=>no>0))].sort((a,b)=>a-b),currentIndex=plantingNos.indexOf(selectedRecordPlantingNo);
      if(currentIndex>=0&&currentIndex<plantingNos.length-1){playUiClick();selectedRecordPlantingNo=plantingNos[currentIndex+1];renderGrowthRecords(gardenState,gardenState?.garden?.current);}
    });
    document.querySelectorAll("#gardenScreen .tabBtn").forEach(btn=>btn.addEventListener("click",()=>{playUiClick();setTab(btn.dataset.tab);}));
  }
  function resetActivityDaily(){
    const key=todayKey();
    if(meta.activityRunDate!==key){
      meta.activityRunDate=key;
      meta.activityRunsToday=0;
    }
  }
  function activityRunsLeft(){
    resetActivityDaily();
    return Math.max(0,EVENT_DAILY_LIMIT-Math.max(0,Math.floor(Number(meta.activityRunsToday)||0)));
  }
  function activityRunsUsed(){
    resetActivityDaily();
    return Math.max(0,Math.min(EVENT_DAILY_LIMIT,Math.floor(Number(meta.activityRunsToday)||0)));
  }
  function consumeActivityRun(){
    resetActivityDaily();
    if(activityRunsLeft()<=0)return false;
    meta.activityRunsToday=Math.max(0,Math.floor(Number(meta.activityRunsToday)||0))+1;
    meta.activityRunDate=todayKey();
    saveMeta();
    return true;
  }
  function settleActivityReward(success=false){
    if(activityRewarded)return 0;
    activityRewarded=true;
    lastActivityReward={mode:activityStageMode,seeds:0,coins:0,points:0,stones:[]};
    if(isActivityTrialMode()){
      const coins=success?Math.max(1,Math.floor(Math.max(0,kills)*.001)):0;
      if(coins>0)meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))+coins;
      const stones=success?awardActivityTrialBreakStones():[];
      lastActivityReward={mode:ACTIVITY_TRIAL_MODE,seeds:0,coins,points:0,stones};
      saveMeta();
      return coins;
    }
    const earned=success?Math.max(1,Math.min(10,1+Math.floor(Math.max(0,kills)/80))):0;
    const coins=success?Math.max(ACTIVITY_CARROT_COIN_MIN,Math.min(ACTIVITY_CARROT_COIN_MAX,Math.floor(Math.max(0,kills)/1200))):0;
    let points=0;
    if(success){
      const normalKills=Math.max(0,kills-eliteKills-bossKills);
      points=applyPointRewardBonus(Math.floor(normalKills/25)+eliteKills*3+bossKills*10+25+Math.floor(time/60)*3);
      meta.points+=points;
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))+coins;
    }
    if(earned>0){
      meta.garden=normalizeGardenState(meta.garden);
      meta.garden.seeds=Math.max(0,Math.floor(Number(meta.garden.seeds)||0))+earned;
    }
    lastActivityReward={mode:ACTIVITY_CARROT_MODE,seeds:earned,coins,points,stones:[]};
    saveMeta();
    return earned;
  }
  function resetAutoTrainingDailyPurchase(){
    const key=todayKey();
    if(meta.autoTrainingTicketDate!==key){
      meta.autoTrainingTicketDate=key;
      meta.autoTrainingTicketBoughtToday=0;
    }
    if(meta.abilityResetTicketDate!==key){
      meta.abilityResetTicketDate=key;
      meta.abilityResetTicketBoughtToday=0;
    }
  }
  function spendDiamonds(amount){
    syncCoinState();
    const cost=Math.max(0,Math.floor(Number(amount)||0));
    if(walletCoins<cost)return false;
    meta.coins=Math.max(0,walletCoins-cost);
    walletCoins=meta.coins;
    saveMeta();
    syncCoinDisplay();
    return true;
  }
  function shopItemInfo(action){
    if(action==="charm"){
      return {
        title:"購買自動研修護符？",
        message:"自動研修護符為輪迴模式專用。\n進入輪迴時可自動選擇場內技能，並獲得經驗 +20%。\n一般關卡不會使用護符。\n\n價格：💎 6,000",
        confirmLabel:"購買"
      };
    }
    if(action==="ticket"){
      return {
        title:"購買自動研修券？",
        message:"自動研修券為一般關卡專用。\n進入一般關卡時可自動選擇場內技能。\n輪迴模式不會使用研修券。\n\n價格：💎 300",
        confirmLabel:"購買"
      };
    }
    if(action==="abilityReset"){
      return {
        title:"購買能力重置券？",
        message:`能力重置券可在角色資訊中使用。\n使用後會重置所有永久能力，並退還已花費的強化點數。\n每日限購 1 張。\n\n價格：💎 ${formatCommaNumber(abilityResetTicketPrice())}`,
        confirmLabel:"購買"
      };
    }
    if(action==="wholeCarrot"){
      return {
        title:"購買完整的胡蘿蔔？",
        message:`完整的胡蘿蔔是稀有武器。\n攻擊力 +100，購買後會放入裝備欄，不會自動穿上。\n\n價格：💎 ${formatCommaNumber(EQUIPMENT_DEFS.wholeCarrot.price)}`,
        confirmLabel:"購買"
      };
    }
    if(action==="soulRing"){
      return {
        title:"購買獵魂戒指？",
        message:`獵魂戒指是稀有戒指。\n買到後會放入裝備欄，需要穿戴才會生效。\n穿戴後擊殺結算的強化點數 +5%。\n可在鍛造屋強化到 +10，每級再 +1%，最高 +15%。\n\n價格：💎 ${formatCommaNumber(EQUIPMENT_DEFS.soulRing.price)}`,
        confirmLabel:"購買"
      };
    }
    if(action==="rareBreakStone"){
      return {
        title:"兌換稀有突破原石？",
        message:`用活動兌換幣交換稀有突破原石。\n稀有裝備鍛造 +10 後，可用它開啟進階鍛造。\n\n價格：活動幣 ${RARE_BREAK_STONE_PRICE}`,
        confirmLabel:"兌換"
      };
    }
    if(action==="gardenDrainShovel"){
      return {
        title:"購買菜園挖溝鏟？",
        message:`菜園挖溝鏟是雨天排水專用道具。\n下雨的白天時辰，菜園按鈕會從澆水改成排水，使用 1 把鏟子可挖溝降濕。\n\n價格：活動幣 ${GARDEN_DRAIN_SHOVEL_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenMoistureMeter"){
      return {
        title:"購買土壤水分儀？",
        message:`購買後會在菜園圖片左下角顯示水分儀。\n水分儀會依照澆水、排水、每日時辰變化即時更新。\n\n價格：活動幣 ${GARDEN_MOISTURE_METER_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenEcMeter"){
      return {
        title:"購買土壤 EC 儀？",
        message:`購買後會在菜園圖片右下角顯示 EC 儀。\nEC 代表土壤養分，目前容量以 0~100 計算，施肥與下雨後會即時更新。\n\n價格：活動幣 ${GARDEN_EC_METER_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenInsecticide"){
      return {
        title:"購買菜園殺蟲劑？",
        message:`殺蟲劑可以在菜園行動中使用，用來處理毛毛蟲、蟲咬葉片等蟲害狀態。\n使用後會解除蟲害圖片，並寫入成長紀錄。\n\n價格：活動幣 ${GARDEN_INSECTICIDE_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenPruningScissors"){
      return {
        title:"購買園藝剪刀？",
        message:`園藝剪刀用來處理菌害擴散、病葉與腐葉。\n之後遇到菌害事件時，可以用剪刀切除壞葉，避免品質繼續下滑。\n\n價格：活動幣 ${GARDEN_PRUNING_SCISSORS_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenSupportFrame"){
      return {
        title:"購買菜園支撐架？",
        message:`菜園支撐架用來處理颱風、強風與植株倒伏。\n之後遇到風災事件時，可以架起支撐保護胡蘿蔔。\n\n價格：活動幣 ${GARDEN_SUPPORT_FRAME_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenShadeNet"){
      return {
        title:"購買菜園遮陽網？",
        message:`菜園遮陽網用來處理炎熱、酷熱與烈日照射。\n之後遇到烈日事件時，可以降低曬傷與缺水風險。\n\n價格：活動幣 ${GARDEN_SHADE_NET_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenFertilizer"){
      return {
        title:"購買速效肥料？",
        message:`速效肥料就是原本的菜園肥料。\n使用後立刻補足土壤養分，並推進胡蘿蔔成長。\n也可以從倉庫胡蘿蔔堆肥取得。\n\n價格：活動幣 ${GARDEN_FERTILIZER_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenSlowFertilizer"){
      return {
        title:"購買緩釋肥料？",
        message:`緩釋肥料會先補一點養分，接下來 3 天每天慢慢釋放養分。\n適合葉子茂盛、準備長胖前使用。\n\n價格：活動幣 ${GARDEN_SLOW_FERTILIZER_PRICE}`,
        confirmLabel:"購買"
      };
    }
    if(action==="gardenPremiumSlowFertilizer"){
      return {
        title:"購買高級緩釋肥料？",
        message:`高級緩釋肥料會先補一點養分，接下來 5 天每天慢慢釋放養分，並讓品質 +1%。\n適合長胖與成熟期穩定培育。\n\n價格：活動幣 ${GARDEN_PREMIUM_SLOW_FERTILIZER_PRICE}`,
        confirmLabel:"購買"
      };
    }
    return null;
  }
  function requestBuyShopItem(action){
    const info=shopItemInfo(action);
    if(!info){
      buyShopItem(action);
      return;
    }
    shopPurchasePromptOpen=true;
    settingsOverlay.classList.add("visible","dialogOnly");
    settingsOverlay.setAttribute("aria-hidden","false");
    openSettingsDialog({
      title:info.title,
      message:info.message,
      confirmLabel:info.confirmLabel,
      cancelLabel:"取消",
      onConfirm:()=>{
        closeSettingsDialog();
        settingsOverlay.classList.remove("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","true");
        shopPurchasePromptOpen=false;
        buyShopItem(action);
      },
      onCancel:()=>{
        settingsOverlay.classList.remove("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","true");
        shopPurchasePromptOpen=false;
      }
    });
  }
  function buyShopItem(action){
    resetAutoTrainingDailyPurchase();
    if(action==="charm"){
      if(meta.autoTrainingCharm||!spendDiamonds(6000)){beep(180,.08,.025,"square");return;}
      meta.autoTrainingCharm=true;
      meta.autoTrainingCharmUsedMinutes=0;
      saveMeta();
      renderShop();
      beep(760,.12,.035,"triangle");
      return;
    }
    if(action==="ticket"){
      if((meta.autoTrainingTicketBoughtToday||0)>=3||!spendDiamonds(300)){beep(180,.08,.025,"square");return;}
      meta.autoTrainingTickets=Math.max(0,Math.floor(Number(meta.autoTrainingTickets)||0))+1;
      meta.autoTrainingTicketBoughtToday=Math.max(0,Math.floor(Number(meta.autoTrainingTicketBoughtToday)||0))+1;
      meta.autoTrainingTicketDate=todayKey();
      saveMeta();
      renderShop();
      beep(760,.12,.035,"triangle");
      return;
    }
    if(action==="abilityReset"){
      const price=abilityResetTicketPrice();
      if((meta.abilityResetTicketBoughtToday||0)>=1||!spendDiamonds(price)){beep(180,.08,.025,"square");return;}
      meta.abilityResetTickets=Math.max(0,Math.floor(Number(meta.abilityResetTickets)||0))+1;
      meta.abilityResetTicketBoughtToday=Math.max(0,Math.floor(Number(meta.abilityResetTicketBoughtToday)||0))+1;
      meta.abilityResetTicketDate=todayKey();
      saveMeta();
      renderShop();
      beep(760,.12,.035,"triangle");
      return;
    }
    if(action==="wholeCarrot"){
      ensureEquipmentState();
      const item=EQUIPMENT_DEFS.wholeCarrot;
      if(meta.shopBoughtWholeCarrot||meta.equipmentInventory.includes(item.id)||!spendDiamonds(item.price)){beep(180,.08,.025,"square");return;}
      meta.equipmentInventory.push(item.id);
      meta.shopBoughtWholeCarrot=true;
      saveMeta();
      renderShop();
      renderMeta();
      beep(760,.12,.035,"triangle");
    }
    if(action==="soulRing"){
      ensureEquipmentState();
      const item=EQUIPMENT_DEFS.soulRing;
      if(meta.equipmentInventory.includes(item.id)||!spendDiamonds(item.price)){beep(180,.08,.025,"square");return;}
      meta.equipmentInventory.push(item.id);
      saveMeta();
      renderShop();
      renderMeta();
      beep(760,.12,.035,"triangle");
    }
    if(action==="rareBreakStone"){
      const cost=RARE_BREAK_STONE_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      addBreakStone("rare",1);
      saveMeta();
      renderShop();
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenDrainShovel"){
      const cost=GARDEN_DRAIN_SHOVEL_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.drainShovels=Math.max(0,Math.floor(Number(meta.garden.drainShovels)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買菜園挖溝鏟。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenMoistureMeter"){
      const cost=GARDEN_MOISTURE_METER_PRICE;
      meta.garden=normalizeGardenState(meta.garden);
      if(meta.garden.moistureMeter||(meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.moistureMeter=true;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買土壤水分儀。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenEcMeter"){
      const cost=GARDEN_EC_METER_PRICE;
      meta.garden=normalizeGardenState(meta.garden);
      if(meta.garden.ecMeter||(meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.ecMeter=true;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買土壤 EC 儀。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenInsecticide"){
      const cost=GARDEN_INSECTICIDE_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.insecticide=Math.max(0,Math.floor(Number(meta.garden.insecticide)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買菜園殺蟲劑。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenPruningScissors"){
      const cost=GARDEN_PRUNING_SCISSORS_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.pruningScissors=Math.max(0,Math.floor(Number(meta.garden.pruningScissors)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買園藝剪刀。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenSupportFrame"){
      const cost=GARDEN_SUPPORT_FRAME_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.supportFrames=Math.max(0,Math.floor(Number(meta.garden.supportFrames)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買菜園支撐架。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenShadeNet"){
      const cost=GARDEN_SHADE_NET_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.shadeNets=Math.max(0,Math.floor(Number(meta.garden.shadeNets)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買菜園遮陽網。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenFertilizer"){
      const cost=GARDEN_FERTILIZER_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.fertilizer=Math.max(0,Math.floor(Number(meta.garden.fertilizer)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買速效肥料。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenSlowFertilizer"){
      const cost=GARDEN_SLOW_FERTILIZER_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.slowFertilizer=Math.max(0,Math.floor(Number(meta.garden.slowFertilizer)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買緩釋肥料。");
      beep(760,.12,.035,"triangle");
    }
    if(action==="gardenPremiumSlowFertilizer"){
      const cost=GARDEN_PREMIUM_SLOW_FERTILIZER_PRICE;
      if((meta.activityCoins||0)<cost){beep(180,.08,.025,"square");return;}
      meta.garden=normalizeGardenState(meta.garden);
      meta.activityCoins=Math.max(0,Math.floor(Number(meta.activityCoins)||0))-cost;
      meta.garden.premiumSlowFertilizer=Math.max(0,Math.floor(Number(meta.garden.premiumSlowFertilizer)||0))+1;
      saveMeta();
      renderShop();
      if(!gardenScreen?.classList.contains("hidden"))postGardenState("已購買高級緩釋肥料。");
      beep(760,.12,.035,"triangle");
    }
  }
  function forgeGardenCarrot(index){
    meta.garden=normalizeGardenState(meta.garden);
    const safeIndex=Math.floor(Number(index));
    const item=meta.garden.storage?.[safeIndex];
    if(!item){
      forgeMessage="找不到這支菜園胡蘿蔔";
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    const def=gardenQualityDef(item.quality);
    if(Math.max(0,Math.floor(Number(item.level)||0))<GARDEN_ENHANCE_MAX_LEVEL){
      forgeMessage=`${def.name} 還沒達到 S+`;
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    if(item.forged){
      forgeMessage=`${def.name} 已經鍛造過了`;
      beep(180,.08,.025,"square");
      renderShop();
      return;
    }
    item.forged=true;
    const equipHint=equipmentUnlocked(combatPower())?"可到角色資訊裝備欄穿戴。":"達到 2 萬戰力後會出現在角色裝備欄。";
    forgeMessage=`${def.rank}・${def.name} 鍛造完成！攻擊力 +${formatCommaNumber(gardenForgeAttack(item.quality))}，裝備鍛造 +0。${equipHint}`;
    saveMeta();
    renderShop();
    renderMeta();
    beep(940,.18,.045,"triangle");
  }
  function forgeEquipment(id){
    ensureEquipmentState();
    resetForgeDaily();
    const item=equipmentItemById(id);
    const rule=forgeRuleFor(item);
    if(!item||!rule||!equipmentInventoryHas(id)){beep(180,.08,.025,"square");return;}
    const level=equipmentEnhanceLevel(id);
    const breakState=equipmentBreakState(id);
    const canBreak=item.type==="weapon"&&item.quality==="rare"&&level>=10&&!breakState.unlocked;
    if(canBreak){
      if(breakStoneCount(item.quality)<1){
        forgeMessage=`需要${breakStoneName(item.quality)}`;
        beep(180,.08,.025,"square");
        renderShop();
        return;
      }
      spendBreakStone(item.quality,1);
      setEquipmentBreakState(id,{unlocked:true,level:0});
      forgeMessage=`${item.name} 突破成功，開啟進階鍛造！`;
      saveMeta();
      renderShop();
      renderMeta();
      beep(940,.18,.045,"triangle");
      return;
    }
    const advanced=breakState.unlocked;
    const advancedLevel=advanced?breakState.level:0;
    const forgeCost=advanced?equipmentAdvancedForgeCost(item,rule,advancedLevel):equipmentForgeCost(item,rule,level);
    if((advanced?advancedLevel>=10:level>=10)||meta.forgeDailyUsed>=FORGE_DAILY_LIMIT||!spendDiamonds(forgeCost)){beep(180,.08,.025,"square");return;}
    meta.forgeDailyUsed=Math.max(0,Math.floor(Number(meta.forgeDailyUsed)||0))+1;
    if(Math.random()<rule.success){
      if(advanced){
        setEquipmentBreakState(id,{unlocked:true,level:Math.min(10,advancedLevel+1)});
        forgeMessage=`${item.name} 進階鍛造成功！目前 +${level+Math.min(10,advancedLevel+1)}`;
      }else{
        meta.equipmentEnhance[id]=Math.min(10,level+1);
        forgeMessage=`${item.name} 鍛造成功！目前 +${meta.equipmentEnhance[id]}`;
      }
      beep(880,.12,.04,"triangle");
    }else{
      forgeMessage=`${item.name} 鍛造失敗，裝備沒有損壞。`;
      beep(240,.12,.035,"square");
    }
    saveMeta();
    renderShop();
    renderMeta();
  }
  function refreshWalletFromUi(){
    if(devModeActive)coinDebugExpanded=!coinDebugExpanded;
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
    "兔兔正在偷偷多帶一根胡蘿蔔...",
    `確認目前版本 V.${APP_VERSION} 的活動關卡資料...`,
    "胡鬧的胡蘿蔔正在練習不要亂跑...",
    "強化試煉正在挑選今日突破原石...",
    "鍛造屋正在預熱原石合成爐...",
    "檢查 3 顆同階原石能不能合成下一階...",
    "活動商店正在補貨：剪刀、支撐架、遮陽網...",
    "菜園水分儀正在校正紅綠藍刻度...",
    "土壤 EC 儀正在聞今天的養分味道...",
    "速效肥料、緩釋肥料、高級緩釋肥料正在排隊...",
    "兔兔正在把澆水、觀察、行動按鈕擦亮...",
    "菜園正在預載早上、中午、下午、晚上背景...",
    "下雨天排水鏟已放進工具箱...",
    "殺蟲劑正在確認毛毛蟲不在瓶子裡...",
    "園藝剪刀正在等菌害事件出現...",
    "支撐架正在準備對抗強風和颱風...",
    "遮陽網正在摺成兔兔看得懂的形狀...",
    "成長紀錄正在整理今天的天氣與時辰...",
    "活動硬幣袋正在清點掉落範圍...",
    "菜園胡蘿蔔鍛造清單正在檢查 S+ 素材...",
    "兔兔正在提醒自己：可採收後不要再澆水..."
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
  function preloadImageAsset(src){
    return new Promise(resolve=>{
      const img=new Image();
      const done=()=>resolve(src);
      img.onload=done;
      img.onerror=done;
      img.decoding="async";
      img.src=src;
      if(img.complete)resolve(src);
    });
  }
  function preloadGardenAssets(){
    if(preloadGardenAssets.started)return preloadGardenAssets.started;
    preloadGardenAssets.started=Promise.all(GARDEN_PRELOAD_ASSETS.map(preloadImageAsset)).catch(()=>[]);
    return preloadGardenAssets.started;
  }
  function unloadGardenFrame(){
    gardenScreen?.classList.add("hidden");
  }
  function primeGardenFrame(){
    preloadGardenAssets();
  }
  function prepareGardenFrame(){
    preloadGardenAssets();
    primeGardenFrame();
  }
  function startBootOverlay(){
    if(!bootOverlay)return;
    const duration=5;
    const shuffled=[...bootHints].sort(()=>Math.random()-.5);
    const selected=[...(shuffled.slice(0,4).length?shuffled.slice(0,4):bootHints.slice(0,4)),bootFinalHint];
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
      const nextHintAt=duration/selected.length*(hintIndex+1);
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
    ensureEquipmentState();
    const currentPower=combatPower();
    const canUseEquipment=equipmentUnlocked(currentPower);
    if(characterModeTabs){
      characterModeTabs.classList.toggle("hidden",!canUseEquipment);
      if(canUseEquipment&&!meta.equipmentUnlockSeen){
        characterModeTabs.classList.add("unlocking");
        meta.equipmentUnlockSeen=true;
        saveMeta();
        setTimeout(()=>characterModeTabs.classList.remove("unlocking"),900);
      }else{
        characterModeTabs.classList.remove("unlocking");
      }
    }
    if(!canUseEquipment)setCharacterTab("ability");
    metaPointsEl.innerHTML=`<span class="pointDiamond"></span><span>強化點數 ${formatCostShort(meta.points)}</span>`;
    metaRecordEl.innerHTML=`總擊破 ${meta.totalKills||0}｜菁英 ${meta.totalElites||0}｜BOSS ${meta.totalBosses||0}`;
    metaStatsEl.innerHTML="";
    for(const def of metaDefs){
      if(def.unlock&&!def.unlock(meta))continue;
      const cost=metaUpgradeCost(def);
      const tier=Math.floor(meta[def.id]/10)+1;
      const card=document.createElement("div");
      card.className="statCard";
      const equipNote=def.id==="damage"
        ?` <span class="equipmentAttackNote ${equipmentQualityInfo(equippedWeapon()).className}">(+${equipmentBaseDamage()}裝備)</span>`
        :"";
      card.innerHTML=`<b>${def.name} LV${meta[def.id]}</b><small>${def.desc}<br>目前 ${def.value(meta)}${equipNote}・強化階級 ${tier}</small>`;
      const button=document.createElement("button");
      const cap=metaDefCap(def);
      const maxed=cap!==undefined&&meta[def.id]>=cap;
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
    renderEquipmentPanel();
    gardenStage.classList.toggle("active",currentStage===1);
    desertStage.classList.toggle("active",currentStage===2);
    snowStage.classList.toggle("active",currentStage===3);
    forestPathStage.classList.toggle("active",currentStage===4);
    forestSeaStage.classList.toggle("active",currentStage===5);
    cookieStage.classList.toggle("active",currentStage===6);
    toyStage.classList.toggle("active",currentStage===7);
    infiniteStage.classList.toggle("active",currentStage===INFINITE_STAGE);
    bossChallengeStage?.classList.toggle("hidden",!devModeActive);
    bossChallengeStage?.classList.toggle("active",isBossChallengeMode());
    bossChallengePanel?.classList.toggle("hidden",!devModeActive||!bossChallengeMenuOpen);
    desertStage.disabled=stageAvailability(2)!=="open";
    snowStage.disabled=stageAvailability(3)!=="open";
    forestPathStage.disabled=stageAvailability(4)!=="open";
    forestSeaStage.disabled=stageAvailability(5)!=="open";
    cookieStage.disabled=stageAvailability(6)!=="open";
    toyStage.disabled=stageAvailability(7)!=="open";
    gardenStage.innerHTML=stageButtonMarkup("第一關・菜園",1);
    desertStage.innerHTML=stageAvailability(2)==="open"?stageButtonMarkup("第二關・沙漠",2):stageButtonMarkup("第二關・沙漠（未解鎖）",2);
    snowStage.innerHTML=stageAvailability(3)==="open"?stageButtonMarkup("第三關・雪原",3):stageButtonMarkup("第三關・雪原（未解鎖）",3);
    forestPathStage.innerHTML=stageAvailability(4)==="open"?stageButtonMarkup("第四關上・幽影林徑",4):stageButtonMarkup("第四關上・幽影林徑（未解鎖）",4);
    forestSeaStage.innerHTML=stageAvailability(5)==="open"?stageButtonMarkup("第四關下・幽影樹海",5):stageButtonMarkup("第四關下・幽影樹海（未解鎖）",5);
    cookieStage.innerHTML=stageAvailability(6)==="open"?stageButtonMarkup("第五關・奶油餅乾屋",6):stageButtonMarkup("第五關・奶油餅乾屋（未解鎖）",6);
    toyStage.innerHTML=stageAvailability(7)==="open"?stageButtonMarkup("第六關・玩具夢工廠",7):stageButtonMarkup("第六關・玩具夢工廠（未解鎖）",7);
    infiniteStage.innerHTML=stageButtonMarkup("無限輪迴模式",INFINITE_STAGE);
    if(bossChallengeStage)bossChallengeStage.innerHTML=stageButtonMarkup("頭目挑戰模式",BOSS_CHALLENGE_STAGE);
    document.getElementById("start").textContent="開始割草";
  }

  function rewardClaimable(level,accountLevel){
    return false;
  }

  function hasClaimableReward(info=accountLevelInfo()){
    return info.level>=5;
  }

  function renderEquipmentPanel(){
    if(!equipmentPanel)return;
    ensureEquipmentState();
    const inventory=equipmentInventoryItems();
    const visibleSlots=Math.max(3,Math.ceil(inventory.length/3)*3);
    const slots=[];
    for(let i=0;i<visibleSlots;i++){
      const item=inventory[i];
      if(!item){
        slots.push(`<div class="equipmentSlot empty"></div>`);
        continue;
      }
      const quality=equipmentQualityInfo(item);
      const equipped=item.type==="ring"?meta.equippedRingId===item.id:meta.equippedWeaponId===item.id;
      const totalLevel=equipmentForgeTotalLevel(item.id);
      const breakUnlocked=equipmentBreakUnlocked(item.id);
      const statText=equipmentMainStatText(item);
      const typeText=item.source==="garden"?"菜園武器":item.type==="weapon"?"武器":item.type==="ring"?"戒指":"裝備";
      const iconHtml=item.asset?`<img class="equipmentIconImg" src="${item.asset}" alt="" aria-hidden="true">`:`<span class="equipmentIcon">${item.type==="ring"?"💍":"🥕"}</span>`;
      const activeText=equipped?"｜已穿戴":(item.type==="ring"?"｜未穿戴":"");
      const forgeText=item.source==="garden"||totalLevel?`｜${breakUnlocked?"進階鍛造":"鍛造"} +${totalLevel}`:"";
      slots.push(`
        <button type="button" class="equipmentSlot ${quality.className}${equipped?" equipped":""}" data-equip-id="${item.id}">
          ${iconHtml}
          <b>${item.name}</b>
          <small>${quality.name}｜${typeText}<br>${statText}${forgeText}${activeText}</small>
        </button>
      `);
    }
    const weapon=equippedWeapon();
    const quality=equipmentQualityInfo(weapon);
    const weaponLevel=equipmentForgeTotalLevel(weapon.id);
    const weaponBreak=equipmentBreakUnlocked(weapon.id);
    equipmentPanel.innerHTML=`
      <div class="equipmentSummary">
        <b>目前武器</b>
        <span class="${quality.className}">${weapon.name}｜攻擊力 +${equipmentAttack(weapon)}${weapon.source==="garden"||weaponLevel?`｜${weaponBreak?"進階鍛造":"鍛造"} +${weaponLevel}`:""}</span>
      </div>
      <div class="equipmentGrid">${slots.join("")}</div>
      <p class="equipmentHint">同類型武器一次只能穿一把；戒指需穿戴後才會生效，按一下可穿脫。</p>
    `;
  }

  function setCharacterTab(tab){
    const showEquipment=tab==="equipment";
    abilityPanelBtn?.classList.toggle("active",!showEquipment);
    equipmentPanelBtn?.classList.toggle("active",showEquipment);
    metaStatsEl?.classList.toggle("hidden",showEquipment);
    equipmentPanel?.classList.toggle("hidden",!showEquipment);
    if(showEquipment)renderEquipmentPanel();
  }

  function combatPower(){
    const damageLevel=Math.max(0,meta.damage);
    const speedLevel=Math.max(0,Math.min(100,meta.speed));
    const critLevel=Math.max(0,Math.min(100,meta.crit));
    const critDamageLevel=Math.max(0,Math.min(MAX_CRIT_DAMAGE_LEVEL,meta.critDamage));
    const armorPenLevel=Math.max(0,Math.min(100,meta.armorPen));
    const lifeLevel=Math.max(0,meta.life);
    const regenLevel=Math.max(0,meta.regen);

    const baseDamage=baseMetaDamageValue(damageLevel);
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
    if(stage===INFINITE_STAGE)return 2000;
    if(stage===BOSS_CHALLENGE_STAGE)return 0;
    if(stage===EVENT_STAGE)return Math.max(1,combatPower());
    if(stage===11)return 48000;
    if(stage===10)return 39000;
    if(stage===9)return 32000;
    if(stage===8)return 26000;
    if(stage===7)return 22500;
    if(stage===6)return 18000;
    if(stage===5)return 10500;
    if(stage===4)return 7800;
    return stage===3?4800:stage===2?850:120;
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
  function stageDifficultyMonsterMultiplier(stage=currentStage){
    if(isInfiniteMode()||isBossChallengeMode()||isEventMode())return 1;
    if(stage===INFINITE_STAGE||stage===BOSS_CHALLENGE_STAGE||stage===EVENT_STAGE)return 1;
    const info=stageDifficultyInfo(stage);
    if(info.className==="danger")return 1.5;
    if(info.className==="hard")return 1.25;
    if(info.className==="challenge")return 1.1;
    return 1;
  }

  function stageButtonMarkup(label,stage,desc=""){
    const descHtml=desc?`<small class="stageDesc">${desc}</small>`:"";
    const labelHtml=`<span class="stageLabel"><span>${label}</span>${descHtml}</span>`;
    if(stage===BOSS_CHALLENGE_STAGE)return `${labelHtml}<span class="stageBadge challenge">測試</span>`;
    if(stage===EVENT_STAGE)return `${labelHtml}<span class="stageBadge easy">今日 ${activityRunsUsed()}/${EVENT_DAILY_LIMIT}</span>`;
    const info=stageDifficultyInfo(stage);
    return `${labelHtml}<span class="stageBadge ${info.className}">${info.label}</span>`;
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
    return currentStage===INFINITE_STAGE;
  }
  function isBossChallengeMode(){
    return currentStage===BOSS_CHALLENGE_STAGE;
  }
  function isEventMode(){
    return currentStage===EVENT_STAGE;
  }
  function bossChallengeZone(){
    return Math.max(0,bossChallengeSourceStage-1);
  }
  function resetBossChallengeDamageStats(){
    bossChallengeStartTime=time;
  }

  function infiniteZoneAt(value=time){
    if(!isInfiniteMode())return Math.max(0,currentStage-1);
    return Math.max(0,Math.floor(value/600));
  }

  function infiniteZoneName(zone=infiniteZoneAt()){
    if(zone===0)return "菜園";
    if(zone===1)return "沙漠";
    if(zone===2)return "雪原";
    if(zone===3)return "幽影林徑";
    if(zone===4)return "幽影樹海";
    if(zone===5)return "奶油餅乾屋";
    if(zone===6)return "玩具夢工廠";
    if(zone===7)return "熔岩工坊";
    if(zone===8)return "海底遺跡";
    if(zone===9)return "星夜鐘塔";
    if(zone===10)return "虛空核心";
    return "惡魔城";
  }
  function infiniteStageForZone(zone=infiniteZoneAt()){
    return zone>=0&&zone<=10?zone+1:0;
  }
  function infiniteZoneElapsed(){
    return Math.max(0,infiniteDisplayedTime()%600);
  }
  function monsterScaleTime(){
    return isInfiniteMode()?infiniteZoneElapsed():time;
  }

  function effectiveZone(){
    if(isBossChallengeMode())return bossChallengeZone();
    if(isInfiniteMode()){
      if(finalPhase!=="none")return Math.max(0,infiniteBossZone);
      return infiniteZoneAt();
    }
    return Math.max(0,currentStage-1);
  }

  function infiniteGrowth(){
    const zone=isInfiniteMode()?infiniteZoneAt():0;
    if(zone<=10)return {hp:1,damage:1,speed:1,elite:0};
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
    if(type==="voiddevourer")return "虛空吞星者";
    if(type==="clockwitch")return "時鐘魔女";
    if(type==="abyssoctopus")return "深海章魚王";
    if(type==="lavagolem")return "熔爐巨像";
    if(type==="nightmaremaker")return "發條夢魘師";
    if(type==="cookiemonarch")return "奶油餅乾女王";
    if(type==="whale")return "暴雪鯨魚";
    if(type==="reaper")return "惡魔死神";
    if(type==="rottenwood")return "腐木樹衛";
    if(type==="shadowtree")return "幽影樹王";
    if(type==="stoneface")return "遠古石面怪";
    return "霸王食人花";
  }
  function normalStagePointReward(){
    return Math.floor(Math.max(0,kills-eliteKills-bossKills)/25)+eliteKills*3+bossKills*10+Math.floor(time/60)*3;
  }
  function infiniteStagePointReward(){
    return Math.floor(normalStagePointReward()*.3);
  }
  function applyPointRewardBonus(base){
    const safeBase=Math.max(0,Math.floor(Number(base)||0));
    return Math.floor(safeBase*pointRewardMultiplier());
  }
  function pointRewardLine(earned){
    const bonus=soulPointBonusRate();
    return `本局獲得強化點數 ${earned}${bonus>0?`（獵魂 +${formatPercentRate(bonus)}）`:""}`;
  }
  function stageTimerLabel(){
    if(isBossChallengeMode())return `頭目挑戰 ${finalBossDisplayName(bossChallengeType)}`;
    if(isInfiniteMode()){
      if(finalPhase!=="none"){
        const bossType=bossTypeForZone(infiniteBossZone);
        return `${infiniteZoneName(infiniteBossZone)} BOSS ${finalBossDisplayName(bossType)}`;
      }
      return `${infiniteZoneName()} ${formatStageTime(infiniteDisplayedTime())}`;
    }
    return time>=DURATION?"關卡 BOSS":formatStageTime(Math.max(1,time));
  }

  const gardenStagePreviewConfig={
    stageScale:.62,
    baseScale:1,
    baseOffset:0
  };

  function drawGardenStagePreview(ctx,w,h,config=gardenStagePreviewConfig){
    const scale=config.stageScale||.62;
    const baseScale=config.baseScale||1;
    const baseOffset=config.baseOffset||0;
    ctx.clearRect(0,0,w,h);
    const rootX=w/2;
    const rootY=h/2+8;

    ctx.save();
    ctx.translate(rootX,rootY+baseOffset);
    ctx.scale(baseScale,1);
    ctx.fillStyle="#49a956";
    ctx.beginPath();
    ctx.ellipse(0,48,58,15,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#327d42";
    ctx.globalAlpha=.55;
    ctx.beginPath();
    ctx.ellipse(0,51,40,7,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(rootX,rootY);
    ctx.scale(scale,scale);
    const body=new Path2D();
    body.moveTo(-44,-30);
    body.bezierCurveTo(-42,-66,-4,-73,34,-58);
    body.bezierCurveTo(69,-43,63,-3,49,28);
    body.bezierCurveTo(39,58,16,89,-10,84);
    body.bezierCurveTo(-37,79,-48,43,-49,5);
    body.bezierCurveTo(-50,-12,-50,-24,-44,-30);
    ctx.fillStyle="#f47d05";
    ctx.fill(body);
    ctx.fillStyle="rgba(255,176,50,.18)";
    ctx.fill(body);

    ctx.lineCap="round";
    ctx.strokeStyle="rgba(239,173,82,.85)";
    ctx.lineWidth=7;
    ctx.beginPath();
    ctx.moveTo(-30,-7);
    ctx.quadraticCurveTo(-6,-1,15,-4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16,28);
    ctx.quadraticCurveTo(35,31,48,30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-30,57);
    ctx.quadraticCurveTo(-8,64,10,63);
    ctx.stroke();

    const leaf=(points,color)=>{
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.moveTo(points[0][0],points[0][1]);
      for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
      ctx.closePath();
      ctx.fill();
    };
    leaf([[-16,-62],[-36,-91],[-16,-82],[-7,-102],[2,-78],[14,-101],[18,-76],[40,-90],[24,-61]],"#3f8d34");
    leaf([[-6,-57],[-23,-83],[-10,-72],[-2,-85],[1,-62],[11,-83],[13,-59],[30,-79],[20,-54]],"#49bd65");
    ctx.strokeStyle="#51c671";
    ctx.lineWidth=8;
    ctx.beginPath();
    ctx.moveTo(-9,-55);
    ctx.quadraticCurveTo(-6,-77,-22,-85);
    ctx.moveTo(3,-55);
    ctx.quadraticCurveTo(4,-78,2,-90);
    ctx.moveTo(13,-56);
    ctx.quadraticCurveTo(25,-77,36,-84);
    ctx.stroke();

    ctx.fillStyle="#ffffff";
    ctx.beginPath();
    ctx.arc(-19,-25,10,0,Math.PI*2);
    ctx.arc(28,-17,10,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#050505";
    ctx.beginPath();
    ctx.arc(-16,-23,5,0,Math.PI*2);
    ctx.arc(25,-16,5,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#ee9bc0";
    ctx.globalAlpha=.8;
    ctx.beginPath();
    ctx.arc(-37,-16,4,0,Math.PI*2);
    ctx.arc(42,-9,4,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
    ctx.strokeStyle="#050505";
    ctx.lineWidth=6;
    ctx.beginPath();
    ctx.moveTo(-1,-9);
    ctx.quadraticCurveTo(8,2,19,-8);
    ctx.stroke();
    ctx.restore();
  }

  function drawForestStagePreview(ctx,w,h,deep=false){
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const line=(points,c,width=2)=>{
      ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";
      ctx.beginPath();
      points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.stroke();
    };
    if(!deep){
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,"#201141");
      sky.addColorStop(.45,"#51317c");
      sky.addColorStop(.78,"#2b2750");
      sky.addColorStop(1,"#111827");
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

      ctx.fillStyle="#0e0d2b";
      ctx.beginPath();
      ctx.arc(96,26,16,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#654a93";
      ctx.beginPath();
      ctx.arc(102,23,16,0,Math.PI*2);ctx.fill();
      for(let i=0;i<18;i++){
        const x=20+(i*29)%154,y=8+(i*17)%53;
        px(x,y,i%6?1:2,i%6?1:2,i%3?"#d7cbff":"#fff8dc");
      }

      const farTrunk=(x,wid,c,top=16)=>{
        px(x,top,wid,h-top,c);
        px(x+Math.max(1,wid-2),top,1,h-top,"#0f1021");
        line([[x+wid*.5,top+15],[x+wid*.12,top+32],[x+wid*.26,top+49]],"#1d1a34",1.4);
      };
      for(const t of [[25,4,"#211c3b",18],[41,5,"#181936",12],[60,4,"#241d3e",23],[132,5,"#1d1a37",18],[148,4,"#171733",10],[162,5,"#241d3d",22]])farTrunk(...t);

      const trunk=(x,wid,c,hi="#1d2240")=>{
        px(x,0,wid,h,c);
        px(x+wid-4,0,3,h,"#05050d");
        px(x+3,0,2,h,hi);
        line([[x+wid*.55,18],[x+wid*.24,42],[x+wid*.42,68],[x+wid*.22,112]],hi,2);
      };
      trunk(0,22,"#050712","#171d35");
      trunk(168,22,"#050712","#171d35");
      trunk(33,9,"#111326","#292a48");
      trunk(145,10,"#111326","#292a48");
      line([[19,14],[36,4],[51,0]],"#050712",4);
      line([[22,34],[42,22],[57,18]],"#050712",4);
      line([[171,13],[153,2],[139,0]],"#050712",4);
      line([[168,34],[149,21],[132,16]],"#050712",4);
      line([[38,47],[55,35],[68,37]],"#222748",2.5);
      line([[150,48],[133,36],[120,38]],"#222748",2.5);

      ctx.fillStyle="#10291f";
      ctx.beginPath();
      ctx.moveTo(0,95);
      ctx.quadraticCurveTo(32,79,72,91);
      ctx.quadraticCurveTo(101,78,124,91);
      ctx.quadraticCurveTo(154,79,190,95);
      ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();
      ctx.fillStyle="#1d4738";
      ctx.beginPath();
      ctx.moveTo(8,132);
      ctx.quadraticCurveTo(37,104,73,99);
      ctx.quadraticCurveTo(107,103,132,100);
      ctx.quadraticCurveTo(160,105,182,132);
      ctx.lineTo(8,132);ctx.fill();
      ctx.fillStyle="#071411";
      ctx.beginPath();
      ctx.moveTo(0,120);
      ctx.quadraticCurveTo(51,110,95,118);
      ctx.quadraticCurveTo(139,110,190,120);
      ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();

      const path=ctx.createLinearGradient(0,92,0,136);
      path.addColorStop(0,"#34233b");
      path.addColorStop(1,"#17131a");
      ctx.fillStyle=path;
      ctx.beginPath();
      ctx.moveTo(88,136);
      ctx.bezierCurveTo(84,124,88,112,95,104);
      ctx.bezierCurveTo(104,95,110,89,114,82);
      ctx.lineTo(125,85);
      ctx.bezierCurveTo(115,96,108,104,105,115);
      ctx.bezierCurveTo(102,124,105,131,109,136);
      ctx.closePath();ctx.fill();
      line([[92,133],[97,116],[103,101],[114,84]],"#51415a",2);

      for(let i=0;i<78;i++){
        const left=i%2===0;
        const x=left?((i*9)%82):(108+(i*11)%80);
        const y=136-(i%8)*4;
        line([[x,y],[x+(left?1:-1)*(5+i%5),y-12-(i%4)*3]],i%3?"#224b3d":"#446a5c",1.2);
      }
      for(let i=0;i<16;i++){
        const x=6+(i*17)%180,y=70+(i*23)%57;
        px(x,y,1,1,i%2?"#e7fff5":"#c0ffd8");
      }
      return;
    }
    {
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,"#101022");
      sky.addColorStop(.42,"#242742");
      sky.addColorStop(.72,"#6d7285");
      sky.addColorStop(1,"#11131b");
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      px(0,0,w,h,"#0b0b13");
      ctx.fillStyle=sky;ctx.fillRect(3,3,w-6,h-6);

      for(let i=0;i<26;i++){
        const x=8+(i*37)%174,y=6+(i*23)%62;
        px(x,y,i%7?1:2,i%7?1:2,i%3?"#c7c9ea":"#eef2ff");
      }
      ctx.fillStyle="#c7c9e8";
      ctx.beginPath();ctx.arc(105,19,9,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#15142a";
      ctx.beginPath();ctx.arc(111,17,10,0,Math.PI*2);ctx.fill();

      const mist=(y,a,c="#d7d9e8")=>{
        ctx.save();
        ctx.globalAlpha=a;
        ctx.fillStyle=c;
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.bezierCurveTo(35,y-12,55,y+9,88,y-2);
        ctx.bezierCurveTo(122,y-15,146,y+8,190,y-5);
        ctx.lineTo(190,y+16);
        ctx.bezierCurveTo(143,y+25,118,y+7,86,y+19);
        ctx.bezierCurveTo(48,y+29,28,y+10,0,y+22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      mist(45,.17);
      mist(62,.25);
      mist(79,.20,"#b9bdcf");

      const farTree=(x,wid,c,top=0)=>{
        px(x,top,wid,h-top,c);
        px(x+Math.max(1,wid-3),top,2,h-top,"#0b0b14");
        if(wid>7)line([[x+wid*.45,22],[x+wid*.1,43],[x+wid*.32,67]],"#232435",1.5);
      };
      for(const t of [[24,5,"#333747",0],[45,4,"#2b2f3e",0],[72,6,"#2c3040",7],[119,5,"#34384a",0],[143,7,"#252938",0],[167,5,"#2c3040",3]])farTree(...t);

      ctx.fillStyle="#293040";
      ctx.beginPath();
      ctx.moveTo(14,89);
      ctx.quadraticCurveTo(46,52,82,77);
      ctx.quadraticCurveTo(109,49,141,76);
      ctx.quadraticCurveTo(163,59,184,86);
      ctx.lineTo(184,111);ctx.lineTo(14,111);ctx.closePath();ctx.fill();
      ctx.fillStyle="#3b4354";
      ctx.beginPath();
      ctx.moveTo(43,91);
      ctx.quadraticCurveTo(74,65,100,83);
      ctx.quadraticCurveTo(132,67,164,89);
      ctx.lineTo(164,111);ctx.lineTo(43,111);ctx.closePath();ctx.fill();

      const trunk=(x,wid,c,hi="#292637")=>{
        px(x,0,wid,h,c);
        px(x+wid-4,0,3,h,"#05060b");
        px(x+3,0,2,h,hi);
        line([[x+wid*.55,17],[x+wid*.33,43],[x+wid*.52,72],[x+wid*.28,111]],hi,2);
      };
      trunk(2,22,"#05070c","#1b1b29");
      trunk(163,25,"#05070c","#1b1b29");
      trunk(32,10,"#141720","#343144");
      trunk(138,9,"#141720","#343144");
      line([[22,29],[42,17],[55,18]],"#05070c",4);
      line([[160,31],[142,20],[127,18]],"#05070c",4);
      line([[41,53],[61,43],[76,46]],"#252738",3);
      line([[145,57],[126,45],[110,47]],"#252738",3);

      ctx.fillStyle="#111820";
      ctx.beginPath();
      ctx.moveTo(0,103);
      ctx.quadraticCurveTo(41,92,82,102);
      ctx.quadraticCurveTo(121,91,190,101);
      ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();
      ctx.fillStyle="#080b10";
      ctx.beginPath();
      ctx.moveTo(0,114);
      ctx.quadraticCurveTo(52,102,92,112);
      ctx.quadraticCurveTo(139,102,190,113);
      ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();
      ctx.fillStyle="#17151b";
      ctx.beginPath();
      ctx.moveTo(62,136);
      ctx.quadraticCurveTo(78,116,98,104);
      ctx.quadraticCurveTo(119,117,135,136);
      ctx.closePath();ctx.fill();
      line([[71,128],[92,119],[113,124],[128,116]],"#2a252a",3);

      for(let i=0;i<92;i++){
        const x=(i*13)%190;
        const y=134-(i%8)*4;
        line([[x,y],[x+(i%2?-1:1)*(5+i%6),y-12-(i%4)*4]],i%3?"#18231f":"#2f3b38",1.2);
      }
      for(let i=0;i<12;i++){
        const x=11+(i*19)%168,y=70+(i*31)%46;
        px(x,y,1,2,i%2?"#f0f6d2":"#b5d7d1");
      }
      px(175,111,2,2,"#a5abb8");
      px(178,109,5,5,"rgba(180,185,195,.55)");
      px(181,112,2,2,"#a5abb8");
      return;
    }
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,deep?"#0b1020":"#111b2a");
    sky.addColorStop(.58,deep?"#141b22":"#182a28");
    sky.addColorStop(1,deep?"#0e1715":"#102216");
    px(0,0,w,h,sky);

    // pixel frame
    px(0,0,w,h,deep?"#16142a":"#1a1830");
    px(5,5,w-10,h-10,sky);
    ctx.strokeStyle=deep?"#595078":"#6c6789";
    ctx.lineWidth=2;
    ctx.strokeRect(7,7,w-14,h-14);
    ctx.strokeStyle=deep?"#2e2948":"#393954";
    ctx.strokeRect(11,11,w-22,h-22);
    px(3,3,7,3,deep?"#75699c":"#827fa3");
    px(w-10,3,7,3,deep?"#75699c":"#827fa3");
    px(3,h-6,7,3,deep?"#75699c":"#827fa3");
    px(w-10,h-6,7,3,deep?"#75699c":"#827fa3");

    const star=(x,y,s=1)=>{
      px(x,y,2*s,2*s,deep?"#bcb4e7":"#fff4bf");
      if(s>1){px(x-2,y+1,2,1,"#fff6d0");px(x+4,y+1,2,1,"#fff6d0");px(x+1,y-2,1,2,"#fff6d0");px(x+1,y+4,1,2,"#fff6d0");}
    };
    star(122,18,2);
    star(108,34,1);
    star(173,22,1);
    star(166,42,1);

    ctx.save();
    ctx.fillStyle=deep?"#8f7fb6":"#9c92bd";
    ctx.beginPath();
    ctx.arc(151,29,21,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle=deep?"#fbefb8":"#fff3ba";
    ctx.beginPath();
    ctx.arc(143,29,21,Math.PI*.45,Math.PI*1.55);
    ctx.arc(151,29,15,Math.PI*1.55,Math.PI*.45,true);
    ctx.closePath();
    ctx.fill();
    px(135,17,2,2,"#7f789d");
    px(140,33,3,3,"#7f789d");
    px(132,38,2,2,"#7f789d");
    ctx.restore();

    const cloud=(x,y,s,a,color)=>{
      ctx.save();
      ctx.globalAlpha=a;
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.ellipse(x,y,22*s,7*s,0,0,Math.PI*2);
      ctx.ellipse(x+18*s,y+2*s,25*s,8*s,0,0,Math.PI*2);
      ctx.ellipse(x-18*s,y+3*s,17*s,6*s,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    };
    cloud(62,42,1.15,deep?.22:.36,deep?"#35304c":"#657080");
    cloud(117,50,.92,deep?.16:.26,deep?"#312d48":"#7c8890");

    ctx.fillStyle=deep?"#101c18":"#172a20";
    ctx.beginPath();
    ctx.moveTo(5,75);
    ctx.quadraticCurveTo(42,41,78,70);
    ctx.quadraticCurveTo(100,48,128,68);
    ctx.quadraticCurveTo(150,42,185,72);
    ctx.lineTo(185,104);ctx.lineTo(5,104);ctx.closePath();ctx.fill();

    const pine=(x,y,s)=>{
      px(x-3*s,y-18*s,6*s,28*s,deep?"#231b23":"#37261d");
      ctx.fillStyle=deep?"#0c2519":"#143720";
      ctx.beginPath();
      ctx.moveTo(x,y-57*s);ctx.lineTo(x-20*s,y-20*s);ctx.lineTo(x+20*s,y-20*s);ctx.closePath();ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x,y-42*s);ctx.lineTo(x-24*s,y-4*s);ctx.lineTo(x+24*s,y-4*s);ctx.closePath();ctx.fill();
      ctx.fillStyle=deep?"#1b3523":"#2e5a34";
      px(x-7*s,y-35*s,4*s,4*s,ctx.fillStyle);
      px(x+5*s,y-14*s,5*s,3*s,ctx.fillStyle);
    };
    const roundTree=(x,y,s,front=false)=>{
      px(x-4*s,y-18*s,8*s,37*s,front?(deep?"#221722":"#3c261f"):(deep?"#2b2023":"#4c3327"));
      ctx.fillStyle=front?(deep?"#0d1b17":"#153321"):(deep?"#132619":"#244324");
      ctx.beginPath();
      ctx.arc(x-14*s,y-29*s,15*s,0,Math.PI*2);
      ctx.arc(x+13*s,y-31*s,17*s,0,Math.PI*2);
      ctx.arc(x,y-43*s,18*s,0,Math.PI*2);
      ctx.arc(x,y-20*s,20*s,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle=front?(deep?"#203723":"#395a35"):(deep?"#263b26":"#486641");
      for(let i=0;i<12;i++){
        const lx=x+Math.cos(i*1.7)*s*(5+i%4*3);
        const ly=y-42*s+Math.sin(i*2.1)*s*(4+i%5*3);
        px(lx,ly,2*s,2*s,ctx.fillStyle);
      }
    };
    pine(17,103,.95);pine(181,101,.88);
    roundTree(48,102,.8,false);
    roundTree(97,96,1.05,true);
    roundTree(132,99,.9,false);
    roundTree(154,105,.82,true);

    px(6,103,w-12,26,deep?"#0b1711":"#0f2916");
    px(6,101,w-12,4,deep?"#243220":"#355334");
    const grass=(x,y,c)=>{px(x,y,2,14,c);px(x+6,y-6,2,20,c);px(x+13,y+2,2,12,c);};
    grass(17,116,deep?"#2d4a30":"#4d7045");
    grass(81,119,deep?"#2d4a30":"#4d7045");
    grass(102,115,deep?"#2d4a30":"#4d7045");
    px(33,123,16,5,deep?"#55556a":"#67717b");
    px(36,120,9,3,deep?"#777584":"#8b9696");
    px(151,121,25,8,deep?"#4d4e5e":"#5e6670");
    px(163,115,15,8,deep?"#6e7480":"#8a9296");

  }

  function drawInfiniteStagePreview(ctx,w,h){
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const line=(points,c,width=2)=>{
      ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";
      ctx.beginPath();
      points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.stroke();
    };
    const curve=(start,c1,c2,end,color,width=3)=>{
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";
      ctx.beginPath();
      ctx.moveTo(start[0],start[1]);
      ctx.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],end[0],end[1]);
      ctx.stroke();
    };

    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,"#071019");
    bg.addColorStop(.55,"#101822");
    bg.addColorStop(1,"#191521");
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,w,h);

    px(5,6,w-10,h-12,"#071018");
    ctx.strokeStyle="#9b8150";ctx.lineWidth=2;ctx.strokeRect(7,7,w-14,h-14);
    ctx.strokeStyle="#3a5c4f";ctx.lineWidth=2;ctx.strokeRect(12,12,w-24,h-24);
    for(const x of [19,w-27]){
      px(x,9,13,3,"#9b8150");px(x+4,13,5,5,"#9b8150");px(x,118,13,3,"#9b8150");px(x+4,113,5,5,"#9b8150");
    }

    for(let i=0;i<18;i++){
      const x=(i*37)%w,y=14+(i*23)%72;
      px(x,y,2,2,i%3?"#d6d4b4":"#8dd7ff");
    }
    px(31,32,32,78,"#0c1b1c");px(137,25,31,83,"#0c1b1c");
    px(36,37,20,8,"#152a28");px(143,33,18,9,"#152a28");
    line([[32,20],[30,52],[25,68]],"#263c2d",3);
    line([[158,17],[154,45],[160,75]],"#263c2d",3);
    line([[40,16],[47,45],[43,72]],"#3a6040",2);
    line([[146,14],[138,49],[142,88]],"#3a6040",2);
    px(17,101,156,21,"#1c1a20");
    line([[18,105],[49,100],[86,108],[127,101],[170,106]],"#3d3530",4);
    px(23,116,26,6,"#453b33");px(102,114,38,7,"#453b33");px(147,109,14,7,"#6b553f");

    const cx=w/2,cy=64;
    const ring=ctx.createRadialGradient(cx-8,cy-12,9,cx,cy,48);
    ring.addColorStop(0,"#bca88b");
    ring.addColorStop(.55,"#786655");
    ring.addColorStop(1,"#3c332f");
    ctx.fillStyle=ring;
    ctx.beginPath();ctx.arc(cx,cy,45,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#120924";
    ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#251a16";ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(cx,cy,45,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.stroke();

    const cracks=[
      [[75,34],[83,41],[78,52]],[[105,29],[99,40],[109,47]],
      [[60,65],[72,63],[78,75]],[[117,76],[129,68],[137,75]],
      [[88,95],[93,82],[101,91]]
    ];
    cracks.forEach(p=>line(p,"#302420",1.4));
    line([[58,42],[62,31],[70,25]],"#5b7140",3);
    line([[124,33],[131,24],[143,19]],"#5b7140",3);
    line([[116,94],[126,101],[139,99]],"#5b7140",3);

    const spinColors=["#f35be9","#bb49ff","#6b2acb","#2b124f"];
    for(let arm=0;arm<8;arm++){
      const a=arm*Math.PI/4+time*.25;
      ctx.strokeStyle=spinColors[arm%spinColors.length];
      ctx.lineWidth=arm%2?5:4;
      ctx.beginPath();
      for(let t=0;t<1;t+=.08){
        const r=4+t*31;
        const ang=a+t*4.7;
        const x=cx+Math.cos(ang)*r;
        const y=cy+Math.sin(ang)*r;
        if(t===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    ctx.fillStyle="#ff7bea";ctx.beginPath();ctx.arc(cx,cy,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ffd2ff";ctx.beginPath();ctx.arc(cx-2,cy-2,3,0,Math.PI*2);ctx.fill();

    curve([2,50],[45,37],[49,11],[91,21],"#a879ff",6);
    curve([4,59],[45,67],[57,43],[102,37],"#d078ff",4);
    curve([187,31],[151,25],[149,51],[109,43],"#9b62ff",6);
    curve([189,79],[142,75],[142,92],[103,83],"#bb7cff",5);
    curve([19,123],[58,90],[50,75],[86,70],"#7b45d9",3);
    curve([174,110],[137,96],[129,77],[101,70],"#935bff",3);
    for(let i=0;i<14;i++){
      const x=27+(i*29)%138,y=28+(i*17)%82;
      px(x,y,2,5,i%2?"#ffd3a7":"#f6e88f");
    }
  }

  function drawSnowStagePreview(ctx,w,h){
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const line=(points,c,width=2)=>{
      ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";
      ctx.beginPath();
      points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.stroke();
    };
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#0b1a35");
    sky.addColorStop(.48,"#183754");
    sky.addColorStop(1,"#c5e7ef");
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    px(0,0,w,20,"#09162e");
    px(0,20,w,20,"#0e243d");
    px(0,40,w,24,"#1a3c54");

    for(let i=0;i<58;i++){
      const x=5+(i*29)%180,y=5+(i*17)%58;
      px(x,y,i%5?1:2,i%5?1:2,i%4?"#e8f7ff":"#8ce4ff");
    }
    ctx.fillStyle="#dceeff";ctx.beginPath();ctx.arc(101,17,9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#0b1a35";ctx.beginPath();ctx.arc(106,14,10,0,Math.PI*2);ctx.fill();

    const farTree=(x,y,s,c,snow="#cdefff")=>{
      px(x-1*s,y-18*s,2*s,22*s,c);
      for(let i=0;i<4;i++){
        ctx.fillStyle=c;ctx.beginPath();
        ctx.moveTo(x,y-31*s+i*9*s);
        ctx.lineTo(x-9*s,y-8*s+i*8*s);
        ctx.lineTo(x+9*s,y-8*s+i*8*s);
        ctx.closePath();ctx.fill();
        ctx.fillStyle=snow;ctx.beginPath();
        ctx.moveTo(x-1*s,y-29*s+i*9*s);
        ctx.lineTo(x-7*s,y-10*s+i*8*s);
        ctx.lineTo(x+2*s,y-13*s+i*8*s);
        ctx.closePath();ctx.fill();
      }
    };
    for(let i=0;i<21;i++)farTree(7+i*9,77+(i%4)*3,.43,i%2?"#5e8191":"#789bad","#bfe3ef");
    for(let i=0;i<15;i++)farTree(30+i*9,69+(i%3)*3,.34,"#8eb0be","#d4f3fb");

    ctx.fillStyle="#e7f8ff";
    ctx.beginPath();
    ctx.moveTo(0,83);
    ctx.quadraticCurveTo(42,62,82,82);
    ctx.quadraticCurveTo(126,61,190,79);
    ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();
    ctx.fillStyle="#c7e3f0";
    ctx.beginPath();
    ctx.moveTo(52,136);
    ctx.quadraticCurveTo(78,91,96,74);
    ctx.quadraticCurveTo(117,92,139,136);
    ctx.closePath();ctx.fill();
    ctx.fillStyle="#f6fdff";
    ctx.beginPath();
    ctx.moveTo(64,136);
    ctx.quadraticCurveTo(83,99,97,81);
    ctx.quadraticCurveTo(111,101,126,136);
    ctx.closePath();ctx.fill();
    line([[58,102],[79,96],[98,100],[121,94]],"#a7d1e2",3);
    line([[63,119],[84,111],[105,116],[128,107]],"#b7ddee",3);
    line([[11,97],[38,91],[59,96]],"#b5ddea",3);
    line([[129,91],[154,83],[181,88]],"#b5ddea",3);

    const treeX=96,baseY=104;
    px(treeX-4,baseY-42,8,42,"#4a5b62");
    const branch=(y,half,color)=>{
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.moveTo(treeX,y-half*.55);
      ctx.lineTo(treeX-half,y+half*.75);
      ctx.lineTo(treeX+half,y+half*.75);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle="#e9fbff";
      ctx.beginPath();
      ctx.moveTo(treeX-2,y-half*.43);
      ctx.lineTo(treeX-half*.72,y+half*.45);
      ctx.lineTo(treeX+half*.1,y+half*.18);
      ctx.closePath();
      ctx.fill();
    };
    branch(43,11,"#78b8d3");
    branch(54,16,"#5ca3c7");
    branch(67,21,"#438bb4");
    branch(80,25,"#347ba6");
    branch(94,29,"#2a658e");
    px(treeX-2,34,4,8,"#e6fbff");
    px(treeX-15,79,12,4,"#d9f7ff");px(treeX+7,86,17,4,"#d9f7ff");
    px(treeX-14,112,29,5,"#b6d9e5");

    px(18,124,19,5,"#b5d4de");px(20,121,12,3,"#effcff");
    px(150,124,23,5,"#b5d4de");px(155,120,12,4,"#effcff");
  }

  function drawDesertStagePreview(ctx,w,h){
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const line=(points,c,width=2)=>{
      ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";
      ctx.beginPath();
      points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.stroke();
    };

    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#3f217d");
    sky.addColorStop(.52,"#6d3a96");
    sky.addColorStop(1,"#d67231");
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

    const sunX=148,sunY=31;
    for(let i=0;i<16;i++){
      const a=i*Math.PI/8;
      line([[sunX+Math.cos(a)*20,sunY+Math.sin(a)*20],[sunX+Math.cos(a)*96,sunY+Math.sin(a)*96]],"#b77a4a",6);
      line([[sunX+Math.cos(a)*19,sunY+Math.sin(a)*19],[sunX+Math.cos(a)*90,sunY+Math.sin(a)*90]],"#d09355",2);
    }
    ctx.fillStyle="#ef922e";ctx.beginPath();ctx.arc(sunX,sunY,23,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ffd85a";ctx.beginPath();ctx.arc(sunX-2,sunY-3,18,0,Math.PI*2);ctx.fill();
    px(sunX-16,sunY-19,25,4,"#ffed7e");px(sunX-18,sunY+11,29,4,"#fcb74b");

    ctx.fillStyle="#ba6621";
    ctx.beginPath();ctx.moveTo(0,80);ctx.quadraticCurveTo(38,58,72,75);ctx.quadraticCurveTo(101,53,131,73);ctx.quadraticCurveTo(158,57,190,75);ctx.lineTo(190,113);ctx.lineTo(0,113);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e08a2b";
    ctx.beginPath();ctx.moveTo(0,91);ctx.quadraticCurveTo(40,66,78,88);ctx.quadraticCurveTo(112,66,151,84);ctx.quadraticCurveTo(171,91,190,86);ctx.lineTo(190,120);ctx.lineTo(0,120);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f8bb48";
    ctx.beginPath();ctx.moveTo(0,104);ctx.quadraticCurveTo(44,80,86,101);ctx.quadraticCurveTo(120,79,165,97);ctx.quadraticCurveTo(179,102,190,98);ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();
    ctx.fillStyle="#f8d269";
    ctx.beginPath();ctx.moveTo(0,115);ctx.quadraticCurveTo(41,93,83,111);ctx.quadraticCurveTo(124,91,190,112);ctx.lineTo(190,136);ctx.lineTo(0,136);ctx.closePath();ctx.fill();
    line([[20,98],[48,91],[80,94],[110,88],[143,91]],"#d17828",2);
    line([[39,119],[68,111],[101,116],[132,108],[164,113]],"#d48a32",2);
    for(let i=0;i<28;i++)px(10+(i*19)%174,113+(i*11)%20,2+(i%3),1,i%2?"#d08431":"#b96f2c");

    const cactus=(x,y,s,tall=true)=>{
      const trunkH=tall?54:34;
      px(x-5*s,y-trunkH*s,10*s,trunkH*s,"#174b32");
      px(x+2*s,y-trunkH*s,3*s,trunkH*s,"#2a6d43");
      for(let i=0;i<trunkH;i+=8)px(x-2*s,y-(trunkH-i)*s,1*s,3*s,"#8ac07a");
      px(x-17*s,y-(trunkH-23)*s,7*s,26*s,"#174b32");
      px(x-24*s,y-(trunkH-23)*s,7*s,9*s,"#174b32");
      px(x+10*s,y-(trunkH-31)*s,7*s,24*s,"#174b32");
      px(x+17*s,y-(trunkH-31)*s,7*s,9*s,"#174b32");
    };
    cactus(28,111,.72,true);
    cactus(159,112,.66,true);
    cactus(104,101,.38,false);
    cactus(74,105,.28,false);
    px(6,128,9,6,"#3e8d42");px(8,124,3,7,"#2b7440");px(16,125,4,8,"#2b7440");
    px(64,123,10,5,"#d89944");px(67,120,7,3,"#8f6b46");px(73,121,5,3,"#b68748");
    px(168,125,15,6,"#9b6a39");px(171,120,8,5,"#c69454");
  }

  function drawCookieStagePreview(ctx,w,h){
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#df5f98");
    sky.addColorStop(.42,"#f095ba");
    sky.addColorStop(1,"#ffe1d6");
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    px(0,93,w,43,"#f7efe4");
    px(0,115,w,21,"#f0c8c8");
    const cloud=(x,y,s)=>{px(x,y,19*s,9*s,"#fff0f7");px(x+9*s,y-7*s,18*s,13*s,"#fff7fb");px(x+24*s,y-1*s,21*s,10*s,"#fff0f7");px(x+39*s,y+4*s,13*s,6*s,"#ffe2ef");};
    cloud(1,23,.82);cloud(125,19,.72);cloud(147,39,.55);
    px(7,91,13,45,"#7e3f2c");px(11,91,5,45,"#b35e43");
    for(let y=93;y<132;y+=12)px(5,y,17,5,"#f7d8d2");
    px(155,96,30,20,"#f5b3cf");px(161,90,18,8,"#fff1f7");
    px(4,124,26,11,"#f3b7d0");px(9,120,14,7,"#fff0f5");
    px(48,58,93,59,"#b85c36");
    px(48,80,93,37,"#6b3c2d");
    px(53,60,83,49,"#d99a4f");
    for(let x=58;x<132;x+=13)for(let y=65;y<101;y+=12){px(x,y,10,10,"#c8833f");px(x+1,y+1,8,8,"#e0ad62");}
    px(57,43,26,20,"#c88745");px(91,34,37,30,"#c88745");
    px(47,50,38,14,"#fff1f6");px(85,42,50,14,"#fff1f6");px(43,58,46,12,"#fff1f6");px(82,55,57,14,"#fff1f6");
    for(let x=50;x<139;x+=12)px(x,63+(x%24?0:4),8,8,"#ffd4e3");
    px(136,35,18,35,"#7a432e");px(136,33,18,9,"#fff5f7");px(140,28,10,8,"#ee74a5");
    px(67,51,19,22,"#8a4b34");px(70,54,13,15,"#fff5f2");px(73,57,7,11,"#8fd3e6");px(73,62,7,2,"#7a4b3d");
    px(60,83,24,29,"#7b3e2a");px(56,81,32,8,"#fff4f4");px(59,87,26,5,"#fff4f4");px(64,90,15,23,"#8a4c32");px(75,99,3,3,"#ffe096");
    const candy=(x,y,c)=>{px(x,y,9,9,c);px(x-2,y+3,3,3,"#fff0f5");px(x+8,y+3,3,3,"#fff0f5");px(x+3,y+3,3,3,"#f7d1df");};
    candy(18,104,"#e75f99");candy(31,113,"#f28ab6");candy(145,107,"#de5c9d");candy(169,118,"#eb79ab");candy(98,31,"#e76aa2");
    for(let i=0;i<7;i++){const x=104+i*7,y=50+i%2*6;px(x,y,8,8,"#db5d9b");px(x+2,y+2,4,4,"#ffb5ce");}
    px(111,28,12,12,"#f07dad");px(113,25,8,6,"#ffc0d8");
    px(92,43,9,9,"#df6aa0");px(94,45,5,5,"#ffb7d0");px(96,47,4,4,"#b94d83");
    for(let x=42;x<130;x+=21){px(x,119,18,6,"#d29a70");px(x+3,116,12,4,"#fff3e4");}
    for(let i=0;i<20;i++){px((i*31+13)%w,101+(i*17)%28,3,3,["#d56b9b","#c07b55","#fff2e6"][i%3]);}
    px(24,124,19,9,"#6d3b2a");px(29,119,10,7,"#9a5a3a");
    px(151,122,22,7,"#6d3b2a");px(158,116,10,8,"#9a5a3a");
  }

  function drawToyStagePreview(ctx,w,h){
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,"#96cfe0");
    bg.addColorStop(.56,"#bfe5e6");
    bg.addColorStop(1,"#9dd0d8");
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    px(0,108,w,28,"#8ec7d0");
    for(let x=8;x<w;x+=30){px(x,30,12,42,"#88bdd0");px(x+3,36,6,5,"#d9f0f4");px(x+3,48,6,5,"#d9f0f4");}
    px(54,18,14,20,"#8abbd0");px(57,21,8,5,"#d9f0f4");px(58,30,6,8,"#d9f0f4");
    px(116,12,12,46,"#84b8ce");px(130,16,18,5,"#84b8ce");px(146,16,5,38,"#84b8ce");
    const gear=(x,y,r,c)=>{
      ctx.fillStyle=c;
      for(let i=0;i<8;i++){const a=i*Math.PI/4;px(x+Math.cos(a)*r-3,y+Math.sin(a)*r-3,6,6,c);}
      ctx.beginPath();ctx.arc(x,y,r*.82,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#f6bd42";ctx.beginPath();ctx.arc(x,y,r*.34,0,Math.PI*2);ctx.fill();
      px(x-3,y-3,6,6,"#6a557d");
    };
    gear(28,18,13,"#8f61a6");gear(70,9,10,"#7eb4d6");gear(150,20,12,"#7568a6");gear(174,36,8,"#7568a6");
    px(0,75,w,9,"#50697d");px(0,81,w,6,"#344b60");for(let x=8;x<w;x+=16)px(x,78,7,3,"#c9d4de");
    px(28,95,134,12,"#465e73");px(28,105,134,8,"#2e4054");for(let x=37;x<156;x+=18)px(x,99,8,4,"#cfdae3");
    px(10,74,24,22,"#e35d4f");px(12,66,17,11,"#ffd04d");px(35,82,18,15,"#49a968");px(53,73,20,24,"#f2c747");
    px(130,71,30,25,"#724aa7");px(138,78,16,10,"#67d38b");px(160,76,25,20,"#43a85d");px(168,68,14,9,"#ffd65d");
    px(12,113,18,13,"#f3c839");px(16,108,10,6,"#ffdf61");px(49,118,18,13,"#d54841");px(53,114,10,5,"#ff7b66");
    px(82,114,21,13,"#5aac55");px(87,110,11,5,"#77db6c");px(112,116,20,12,"#8452aa");px(117,112,10,5,"#b27ee5");
    px(148,111,17,17,"#ed9c40");px(152,107,9,5,"#ffd35b");
    px(72,91,31,10,"#61a8cf");px(76,88,23,4,"#a3e1f2");px(78,101,18,4,"#27556b");
    px(103,88,18,14,"#f0a33c");px(108,91,8,6,"#ffe071");
    px(3,121,18,8,"#e05f3f");px(171,116,16,12,"#6cc05a");
  }

  function drawAdvancedStagePreview(px,w,h,stage){
    px.imageSmoothingEnabled=false;
    const fill=(x,y,ww,hh,c)=>{px.fillStyle=c;px.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const themes={
      8:{sky:"#31141b",ground:"#5b2617",accent:"#ff7938",light:"#ffd05a"},
      9:{sky:"#072642",ground:"#164f69",accent:"#64d8ff",light:"#bdf7ff"},
      10:{sky:"#191638",ground:"#3b2b4a",accent:"#e7c96b",light:"#fff2a8"},
      11:{sky:"#090015",ground:"#201033",accent:"#9b4dff",light:"#f2a6ff"}
    };
    const t=themes[stage]||themes[8];
    fill(0,0,w,h,t.sky);
    const stripeAlpha=stage===9 ? .035 : .02;
    for(let y=0;y<h;y+=8)fill(0,y,w,8,`rgba(255,255,255,${stripeAlpha})`);
    fill(0,88,w,48,t.ground);
    for(let x=0;x<w;x+=22)fill(x,104+(x%3)*5,13,3,t.accent);
    if(stage===8){
      fill(0,0,w,h,"#23131a");
      fill(0,16,w,72,"#46191b");
      for(let y=18;y<84;y+=12){
        for(let x=(y%24?5:16);x<w;x+=34)fill(x,y,21,4,"#6b2722");
      }
      fill(0,82,w,54,"#241014");
      for(let x=0;x<w;x+=26)fill(x,112,16,5,"#ff8a24");
      for(let x=8;x<w;x+=24)fill(x,126,13,3,"#ffd15a");
      fill(0,118,w,18,"#5c1d16");
      for(let x=-10;x<w;x+=24){fill(x,121,18,5,"#ff5a22");fill(x+8,129,18,4,"#ffc34a");}
      const flame=(x,y,s)=>{
        fill(x+5*s,y+10*s,18*s,22*s,"#ff5a1f");
        fill(x+8*s,y+4*s,12*s,24*s,"#ff9827");
        fill(x+12*s,y,7*s,22*s,"#ffe36b");
        fill(x+2*s,y+18*s,24*s,12*s,"#b32218");
      };
      fill(11,50,47,40,"#372d2a");
      fill(16,42,37,10,"#6b5d54");
      fill(17,52,35,9,"#241b1b");
      flame(19,55,.9);
      fill(6,86,58,8,"#181216");
      fill(69,91,52,9,"#1b1316");fill(75,88,40,5,"#ff7a28");
      fill(82,76,12,15,"#4b3228");fill(97,75,18,15,"#6a4634");
      fill(105,51,55,11,"#423035");fill(111,58,7,25,"#26202a");fill(149,58,7,25,"#26202a");
      fill(112,47,15,4,"#6e4a42");fill(133,47,15,4,"#6e4a42");
      fill(138,67,35,28,"#46312a");fill(143,61,25,8,"#6e4b35");fill(150,72,10,10,"#ffbd4b");
      fill(29,18,8,33,"#1e1720");fill(31,20,4,4,"#6f3940");fill(31,31,4,4,"#6f3940");fill(31,42,4,4,"#6f3940");
      fill(76,12,7,44,"#211721");fill(78,17,3,4,"#6f3940");fill(78,29,3,4,"#6f3940");fill(78,41,3,4,"#6f3940");
      fill(153,12,7,39,"#211721");fill(155,18,3,4,"#6f3940");fill(155,31,3,4,"#6f3940");
      fill(78,103,37,11,"#1c1d22");fill(85,96,23,8,"#59626b");fill(93,88,6,12,"#8f9ba4");fill(74,115,46,5,"#090a0d");
      fill(42,104,20,7,"#4a2e20");fill(45,100,14,4,"#8c5630");
      fill(130,105,31,8,"#4a2e20");fill(134,101,22,4,"#8c5630");
      for(let i=0;i<12;i++)fill((i*17+9)%w,76+(i*11)%46,3,3,i%2?"#ffcf63":"#ff7130");
    }else if(stage===9){
      fill(0,0,w,h,"#06172d");
      const sea=px.createLinearGradient(0,0,0,h);
      sea.addColorStop(0,"#126277");
      sea.addColorStop(.45,"#0b334c");
      sea.addColorStop(1,"#071323");
      px.fillStyle=sea;px.fillRect(0,0,w,h);
      for(let i=0;i<7;i++){
        const x=18+i*25;
        fill(x,0,9,68,"rgba(126,238,255,.08)");
        fill(x+3,0,3,76,"rgba(190,255,255,.08)");
      }
      for(let y=7;y<29;y+=7)for(let x=28;x<w-24;x+=21)fill(x+(y%2)*5,y,11,2,"#2c8a9a");
      fill(0,104,w,32,"#13253a");
      for(let x=0;x<w;x+=22)fill(x,118+(x%3)*3,15,3,"#355061");
      fill(74,50,49,50,"#173448");
      fill(68,46,61,8,"#305d6a");
      fill(72,39,53,8,"#4b7f87");
      fill(80,31,38,8,"#2d6270");
      fill(87,24,24,7,"#5b9198");
      fill(81,57,8,36,"#244a56");fill(108,57,8,36,"#244a56");
      fill(92,61,14,32,"#0a2232");fill(95,65,8,28,"#173449");
      fill(70,96,58,6,"#3b6c72");fill(64,102,70,6,"#183047");
      for(let i=0;i<6;i++)fill(78+i*8,42,5,3,"#8ec3bd");
      fill(42,62,9,45,"#263f4e");fill(38,58,17,6,"#588083");fill(40,108,13,5,"#172838");
      fill(25,71,10,40,"#233a48");fill(21,68,18,6,"#456a70");fill(23,111,14,5,"#142535");
      fill(142,68,10,41,"#263f4e");fill(138,64,18,6,"#588083");fill(140,110,14,5,"#172838");
      fill(6,45,20,85,"#070b18");fill(10,50,11,15,"#203447");fill(12,78,8,17,"#203447");fill(8,106,14,12,"#203447");
      fill(168,43,20,88,"#070b18");fill(171,52,12,16,"#203447");fill(174,80,8,18,"#203447");fill(170,108,14,12,"#203447");
      const bubble=(x,y,s=1)=>{px.strokeStyle="#67def2";px.lineWidth=Math.max(1,s);px.beginPath();px.arc(x,y,3*s,0,Math.PI*2);px.stroke();};
      for(let i=0;i<17;i++)bubble(47+(i%3)*8,24+i*5,.7+(i%2)*.25);
      for(let i=0;i<13;i++)bubble(145+(i%2)*9,18+i*6,.65+(i%3)*.15);
      fill(29,117,8,10,"#42f0e7");fill(33,111,5,16,"#78fff4");fill(39,115,5,12,"#28c4d1");fill(24,121,17,4,"#168394");
      fill(126,109,7,11,"#42f0e7");fill(132,104,5,17,"#78fff4");fill(138,112,5,11,"#28c4d1");fill(124,121,20,4,"#168394");
      fill(70,83,10,4,"#4ecddd");fill(76,78,4,4,"#91fff8");fill(119,91,9,4,"#4ecddd");fill(128,88,4,4,"#91fff8");
      for(let i=0;i<18;i++)fill((i*29+12)%w,42+(i*17)%80,2,2,i%2?"#3fd5e5":"#8ffcff");
    }else if(stage===10){
      const night=px.createLinearGradient(0,0,0,h);
      night.addColorStop(0,"#101f4c");
      night.addColorStop(.55,"#2b2460");
      night.addColorStop(1,"#51306f");
      px.fillStyle=night;px.fillRect(0,0,w,h);
      for(let i=0;i<28;i++){
        const x=(i*37+9)%w,y=(i*19+7)%82;
        fill(x,y,i%5?2:3,i%5?2:3,i%3?"#fff1a8":"#f6c65a");
        if(i%7===0){fill(x-3,y+1,8,1,"#ffe78e");fill(x+1,y-3,1,8,"#ffe78e");}
      }
      fill(0,106,w,30,"#17182f");
      fill(60,35,70,86,"#202338");
      fill(66,28,58,10,"#3c4056");
      fill(73,14,44,15,"#24283e");fill(81,7,28,8,"#3d4057");fill(90,0,10,9,"#1a1e32");
      fill(55,48,80,9,"#4a4050");fill(58,57,74,6,"#151827");
      fill(64,116,62,11,"#111323");
      fill(67,69,56,47,"#282a3d");fill(72,73,46,37,"#151827");
      fill(77,78,36,28,"#2b2e43");
      px.fillStyle="#e7b85b";px.beginPath();px.arc(95,92,18,0,Math.PI*2);px.fill();
      px.fillStyle="#ffe38a";px.beginPath();px.arc(95,92,14,0,Math.PI*2);px.fill();
      px.strokeStyle="#7f5532";px.lineWidth=2;px.beginPath();px.arc(95,92,16,0,Math.PI*2);px.stroke();
      px.strokeStyle="#7f5532";px.lineWidth=1;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;
        px.beginPath();px.moveTo(95+Math.cos(a)*11,92+Math.sin(a)*11);px.lineTo(95+Math.cos(a)*14,92+Math.sin(a)*14);px.stroke();
      }
      px.beginPath();px.moveTo(95,92);px.lineTo(95,80);px.moveTo(95,92);px.lineTo(105,98);px.stroke();
      fill(61,34,10,15,"#25283c");fill(119,34,10,15,"#25283c");
      fill(64,29,4,10,"#ffd36b");fill(122,29,4,10,"#ffd36b");fill(63,39,7,4,"#664227");fill(121,39,7,4,"#664227");
      fill(37,95,10,30,"#25283c");fill(140,95,10,30,"#25283c");
      fill(40,88,4,10,"#ffd36b");fill(143,88,4,10,"#ffd36b");
      fill(48,118,94,7,"#3f3346");
      for(let x=70;x<=115;x+=15){fill(x,113,8,8,"#101424");fill(x+2,116,4,5,"#39405b");}
      fill(56,61,8,6,"#4a4050");fill(126,61,8,6,"#4a4050");
    }else{
      fill(0,0,w,h,"#070014");
      const voidBg=px.createRadialGradient(w/2,48,8,w/2,54,115);
      voidBg.addColorStop(0,"#3d0b63");
      voidBg.addColorStop(.45,"#1b0738");
      voidBg.addColorStop(1,"#06000f");
      px.fillStyle=voidBg;px.fillRect(0,0,w,h);
      px.save();
      px.translate(w/2,53);
      for(let i=0;i<5;i++){
        px.strokeStyle=`rgba(169,76,255,${.12+i*.055})`;
        px.lineWidth=3+i;
        px.beginPath();
        px.arc(0,0,22+i*10,Math.PI*.12+i*.25,Math.PI*1.65+i*.35);
        px.stroke();
      }
      px.restore();
      for(let i=0;i<34;i++){
        const x=(i*41+11)%w,y=(i*29+5)%95;
        fill(x,y,i%6?2:3,i%6?2:3,i%3?"#b16cff":"#fff0ff");
        if(i%11===0){fill(x-4,y+1,10,1,"#c97cff");fill(x+1,y-4,1,10,"#c97cff");}
      }
      px.strokeStyle="#c668ff";px.lineWidth=4;px.beginPath();px.arc(95,48,33,0,Math.PI*2);px.stroke();
      px.strokeStyle="#f2b4ff";px.lineWidth=2;px.beginPath();px.arc(95,48,25,0,Math.PI*2);px.stroke();
      px.strokeStyle="#8c2dff";px.lineWidth=2;px.beginPath();px.arc(95,48,42,0,Math.PI*2);px.stroke();
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        fill(95+Math.cos(a)*37-2,48+Math.sin(a)*37-2,4,4,i%2?"#f0a0ff":"#9f5cff");
      }
      const core=px.createRadialGradient(95,48,2,95,48,22);
      core.addColorStop(0,"#ffffff");
      core.addColorStop(.2,"#ffb6ff");
      core.addColorStop(.6,"#7d1dff");
      core.addColorStop(1,"#080011");
      px.fillStyle=core;px.beginPath();px.arc(95,48,22,0,Math.PI*2);px.fill();
      px.strokeStyle="#f0a0ff";px.lineWidth=2;
      for(let i=0;i<7;i++){
        const a=i*Math.PI*2/7;
        px.beginPath();px.moveTo(95,48);px.lineTo(95+Math.cos(a)*22,48+Math.sin(a)*20);px.stroke();
      }
      fill(0,94,w,42,"#120922");
      fill(28,103,32,19,"#2c2740");fill(62,98,42,23,"#342c4c");fill(108,101,37,19,"#2b263d");fill(146,106,28,15,"#211e31");
      fill(0,118,w,18,"#090611");
      px.strokeStyle="#bb4fff";px.lineWidth=2;
      px.beginPath();px.moveTo(34,112);px.lineTo(56,108);px.lineTo(80,119);px.lineTo(100,105);px.lineTo(129,116);px.stroke();
      px.beginPath();px.moveTo(82,121);px.lineTo(95,105);px.lineTo(112,121);px.stroke();
      const rock=(x,y,s)=>{fill(x,y,10*s,7*s,"#2b2937");fill(x+2*s,y-2*s,7*s,3*s,"#5b536e");fill(x+1*s,y+5*s,10*s,3*s,"#11101a");};
      rock(12,83,1.1);rock(162,78,1.2);rock(38,68,.75);rock(139,61,.7);rock(153,98,.85);
      for(let i=0;i<9;i++)fill(24+i*18,126+(i%2)*3,9,2,"#7b36c8");
    }
  }

  function drawCarrotEventStagePreview(ctx,w,h){
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#8dd8ff");
    sky.addColorStop(.48,"#d7f3bd");
    sky.addColorStop(.49,"#6b3b22");
    sky.addColorStop(1,"#2a160f");
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,w,h);
    for(let i=0;i<3;i++){
      const x=22+i*58,y=18+(i%2)*9;
      px(x,y,24,7,"#f8ffff");px(x+8,y-5,22,10,"#f8ffff");px(x+27,y,16,7,"#e4f8ff");
      px(x,y+7,43,4,"#83b9df");
    }
    px(0,66,w,9,"#4c2918");
    px(0,75,w,61,"#7b4324");
    for(let i=0;i<34;i++){
      const x=(i*29+7)%w,y=76+(i*17)%55;
      px(x,y,7,4,i%3?"#9b5b31":"#57301d");
      if(i%5===0)px(x+2,y-2,5,3,"#b77a45");
    }
    const drawCarrot=(cx,cy,s,boss=false)=>{
      const q=n=>Math.round(n*s);
      px(cx-q(8),cy-q(31),q(7),q(14),"#2f8f3c");
      px(cx-q(1),cy-q(38),q(8),q(21),"#5ed85f");
      px(cx+q(6),cy-q(29),q(12),q(13),"#2f963f");
      if(boss){
        px(cx-q(25),cy-q(6),q(9),q(20),"#f08b31");
        px(cx+q(16),cy-q(6),q(9),q(20),"#f08b31");
      }
      px(cx-q(boss?18:12),cy-q(boss?18:14),q(boss?36:24),q(boss?48:34),"#e87825");
      px(cx-q(boss?15:10),cy-q(boss?14:10),q(boss?30:20),q(7),"#ff9c3e");
      px(cx-q(boss?13:8),cy-q(4),q(boss?26:16),q(7),"#d9641f");
      px(cx-q(boss?10:6),cy+q(7),q(boss?20:12),q(7),"#ff9c3e");
      px(cx-q(boss?7:5),cy+q(18),q(boss?14:10),q(7),"#c34f1e");
      px(cx-q(boss?10:7),cy-q(22),q(7),q(5),"#2b160e");
      px(cx+q(boss?5:4),cy-q(22),q(7),q(5),"#2b160e");
      px(cx-q(7),cy-q(10),q(14),q(4),"#4b2111");
      if(boss){
        px(cx-q(18),cy+q(29),q(10),q(7),"#8b3d1c");
        px(cx+q(8),cy+q(29),q(10),q(7),"#8b3d1c");
        px(cx-q(27),cy-q(29),q(8),q(8),"#ffe66f");
        px(cx+q(20),cy-q(31),q(8),q(8),"#ffe66f");
      }
    };
    drawCarrot(95,82,1.25,true);
    drawCarrot(48,98,.75,false);
    drawCarrot(145,102,.68,false);
    px(10,116,170,6,"#3b2117");
    px(33,122,124,4,"#21120d");
  }

  function drawEventTrialStagePreview(ctx,w,h){
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    const px=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,"#071426");
    bg.addColorStop(.55,"#102c3f");
    bg.addColorStop(1,"#171320");
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    for(let i=0;i<30;i++){
      const x=(i*37+13)%w,y=(i*23+9)%h;
      px(x,y,i%4?2:3,i%4?2:3,i%3?"#52d9ff":"#b7f8ff");
    }
    const wall=(x,y,ww,hh)=>{
      px(x,y,ww,hh,"#263447");
      px(x,y,ww,5,"#60768b");
      px(x,y+hh-6,ww,6,"#0a0d14");
      for(let i=0;i<ww;i+=18)px(x+i+3,y+9+(i%36),10,4,"#41566a");
    };
    wall(0,0,w,24);
    wall(0,112,w,24);
    wall(0,22,20,92);
    wall(170,22,20,92);
    px(24,90,142,22,"#263344");
    px(28,93,134,5,"#596a7f");
    px(42,101,28,5,"#151b28");
    px(98,101,38,5,"#151b28");
    const crystal=(x,y,s,c1,c2)=>{
      ctx.fillStyle=c1;
      ctx.beginPath();
      ctx.moveTo(x,y-18*s);
      ctx.lineTo(x+12*s,y-2*s);
      ctx.lineTo(x+5*s,y+18*s);
      ctx.lineTo(x-7*s,y+18*s);
      ctx.lineTo(x-12*s,y-1*s);
      ctx.closePath();
      ctx.fill();
      px(x-2*s,y-12*s,5*s,25*s,c2);
      px(x+4*s,y-3*s,4*s,9*s,"#dffcff");
    };
    crystal(51,72,.9,"#1db7ff","#7cecff");
    crystal(138,70,.75,"#56dbff","#b6f7ff");
    crystal(93,56,1.15,"#279dff","#89f2ff");
    ctx.save();
    ctx.translate(95,76);
    ctx.fillStyle="#2a1a34";
    ctx.beginPath();
    ctx.arc(0,0,27,0,Math.PI*2);
    ctx.fill();
    px(-22,-9,44,20,"#4b2c5a");
    px(-17,-16,34,10,"#75507c");
    px(-14,-4,8,8,"#fff0a0");
    px(6,-4,8,8,"#fff0a0");
    px(-6,9,12,5,"#190b20");
    ctx.restore();
    for(let i=0;i<5;i++){
      const x=52+i*21;
      px(x,105,9,5,i%2?"#3bd7ff":"#f5d66a");
      px(x+2,102,5,3,"#fff3a0");
    }
  }

  function renderStageArt(stage){
    updateHomeStageBadge(stage);
    if(stage===BOSS_CHALLENGE_STAGE){
      stageArt.className="stageBossChallenge";
      stageArt.innerHTML="";
      const type=bossChallengeType||"plant";
      const canvas=bookPreviewCanvas(type,{size:96});
      canvas.style.width="96px";
      canvas.style.height="96px";
      stageArt.appendChild(canvas);
      stageName.textContent=`頭目挑戰（測試版）・${finalBossDisplayName(type)}`;
      stagePower.innerHTML="此為測試模式用；要更新請詢問用戶。";
      return;
    }
    if(stage===EVENT_STAGE){
      resetActivityDaily();
      stageArt.className="stageEvent stageEventCanvas";
      stageArt.innerHTML='<canvas id="eventStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("eventStageArtCanvas");
      if(canvas){
        const ctx=canvas.getContext("2d");
        if(isActivityTrialMode())drawEventTrialStagePreview(ctx,190,136);
        else drawCarrotEventStagePreview(ctx,190,136);
      }
      stageName.textContent=isActivityTrialMode()?"活動關卡・強化試煉":"活動關卡・胡鬧的胡蘿蔔";
      stagePower.innerHTML=isActivityTrialMode()
        ?`2 萬戰力開放｜今日 ${activityRunsUsed()}/${EVENT_DAILY_LIMIT}<br>寶石怪物試煉，擊敗後依擊殺數結算活動兌換幣`
        :`2 萬戰力開放｜今日 ${activityRunsUsed()}/${EVENT_DAILY_LIMIT}<br>大小胡蘿蔔怪物，擊敗活動 Boss 掉落神秘胡蘿蔔種子`;
      return;
    }
    if(stage===INFINITE_STAGE){
      stageArt.className="stageInfinite stageInfiniteCanvas";
      stageArt.innerHTML='<canvas id="infiniteStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("infiniteStageArtCanvas");
      if(canvas)drawInfiniteStagePreview(canvas.getContext("2d"),190,136);
      stageName.textContent="無限輪迴模式";
      stagePower.innerHTML=`建議戰力 ∞｜每 10 分鐘進入擂台<br>目前最高生存時間：${formatStageTime(meta.bestInfiniteSeconds||0)}<br>敵人擊破總數：${meta.infiniteTotalKills||0}`;
      return;
    }
    if(stage>=8&&stage<=11){
      const stageNames={8:"第七關・熔岩工坊",9:"第八關・海底遺跡",10:"第九關・星夜鐘塔",11:"第十關・虛空核心"};
      stageArt.className="stageAdvanced stageAdvancedCanvas";
      stageArt.innerHTML='<canvas id="advancedStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("advancedStageArtCanvas");
      if(canvas)drawAdvancedStagePreview(canvas.getContext("2d"),190,136,stage);
      stageName.textContent=stageNames[stage]||currentStageLabel();
    }else if(stage===7){
      stageArt.className="stageToy stageToyCanvas";
      stageArt.innerHTML='<canvas id="toyStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("toyStageArtCanvas");
      if(canvas)drawToyStagePreview(canvas.getContext("2d"),190,136);
      stageName.textContent="第六關・玩具夢工廠";
    }else if(stage===6){
      stageArt.className="stageCookie stageCookieCanvas";
      stageArt.innerHTML='<canvas id="cookieStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("cookieStageArtCanvas");
      if(canvas)drawCookieStagePreview(canvas.getContext("2d"),190,136);
      stageName.textContent="第五關・奶油餅乾屋";
    }else if(stage===5){
      stageArt.className="stageForest stageForestCanvas";
      stageArt.innerHTML='<canvas id="forestStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("forestStageArtCanvas");
      if(canvas)drawForestStagePreview(canvas.getContext("2d"),190,136,true);
      stageName.textContent="第四關下・幽影樹海";
    }else if(stage===4){
      stageArt.className="stageForest stageForestCanvas";
      stageArt.innerHTML='<canvas id="forestStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("forestStageArtCanvas");
      if(canvas)drawForestStagePreview(canvas.getContext("2d"),190,136,false);
      stageName.textContent="第四關上・幽影林徑";
    }else if(stage===3){
      stageArt.className="stageSnow stageSnowCanvas";
      stageArt.innerHTML='<canvas id="snowStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("snowStageArtCanvas");
      if(canvas)drawSnowStagePreview(canvas.getContext("2d"),190,136);
      stageName.textContent="第三關・雪原";
    }else if(stage===2){
      stageArt.className="stageDesert stageDesertCanvas";
      stageArt.innerHTML='<canvas id="desertStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("desertStageArtCanvas");
      if(canvas)drawDesertStagePreview(canvas.getContext("2d"),190,136);
      stageName.textContent="第二關・沙漠";
    }else{
      stageArt.className="stageGarden stageGardenCanvas";
      stageArt.innerHTML='<canvas id="gardenStageArtCanvas" width="190" height="136" aria-hidden="true"></canvas>';
      const canvas=document.getElementById("gardenStageArtCanvas");
      if(canvas)drawGardenStagePreview(canvas.getContext("2d"),190,136);
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
    const weapon=equippedWeapon();
    const weaponQuality=equipmentQualityInfo(weapon);
    if(def.id==="damage")return [
      `每級 +${metaDamagePerLevel(meta.damage).toFixed(3).replace(/\.?0+$/,"")} 攻擊`,
      "每10級成長 +0.2%",
      `目前 ${def.value(meta)} <span class="equipmentAttackNote ${weaponQuality.className}">(+${equipmentAttack(weapon)}裝備)</span>`,
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
      `每10級成長 +${META_REGEN_STAGE_STEP.toFixed(3)}`,
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

  function gardenDepositItemMarkup(item){
    const def=gardenQualityDef(item.quality);
    return `
      <div class="gardenDepositItem ${def.className}">
        <img src="${def.asset}" alt="${def.name}">
        <b>${def.name}</b>
        <small>${def.rank}｜${gardenEnhanceRankText(item.level)}</small>
      </div>
    `;
  }

  function renderGardenDepositBox(){
    const panel=document.getElementById("gardenDepositBoxModal");
    if(!panel)return;
    meta.garden=normalizeGardenState(meta.garden);
    const countEl=document.getElementById("gardenDepositCount");
    const storageEl=document.getElementById("gardenStorageCount");
    const list=document.getElementById("gardenDepositList");
    const moveBtn=document.getElementById("gardenDepositMoveBtn");
    const box=meta.garden.depositBox||[];
    if(countEl)countEl.textContent=`${box.length} 件`;
    if(storageEl)storageEl.textContent=`倉庫 ${meta.garden.storage.length}/${meta.garden.storageCap}`;
    if(moveBtn)moveBtn.disabled=!box.length||meta.garden.storage.length>=meta.garden.storageCap;
    if(!list)return;
    if(!box.length){
      list.innerHTML='<div class="gardenDepositEmpty">目前沒有暫存素材。</div>';
      return;
    }
    list.innerHTML=box.slice(0,12).map(gardenDepositItemMarkup).join("");
    if(box.length>12){
      list.insertAdjacentHTML("beforeend",`<div class="gardenDepositMore">還有 ${box.length-12} 件</div>`);
    }
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
    renderGardenDepositBox();
  };

  renderMeta=function(){
    renderAccount();
    ensureEquipmentState();
    document.querySelector(".homeTitle").innerHTML=`兔兔割草大冒險 <span class="homeVersion">V.${APP_VERSION}</span>`;
    document.getElementById("start").textContent="開始割草";
    characterBtn.textContent="角色資訊";
    adventureBookBtn.textContent="冒險筆記";
    shopBtn.textContent="冒險市集";
    metaPointsEl.innerHTML=`<span class="pointDiamond"></span><span>強化點數 ${formatCostShort(meta.points)}</span>`;
    metaRecordEl.innerHTML=`總擊破 ${meta.totalKills||0}｜菁英 ${meta.totalElites||0}｜BOSS ${meta.totalBosses||0}`;
    const currentPower=combatPower();
    powerBox.innerHTML=`<span class="powerLabel">戰力</span><span class="powerValue">${currentPower}</span>`;
    const canUseEquipment=equipmentUnlocked(currentPower);
    if(characterModeTabs){
      characterModeTabs.classList.toggle("hidden",!canUseEquipment);
      if(canUseEquipment&&!meta.equipmentUnlockSeen){
        characterModeTabs.classList.add("unlocking");
        meta.equipmentUnlockSeen=true;
        saveMeta();
        setTimeout(()=>characterModeTabs.classList.remove("unlocking"),900);
      }else{
        characterModeTabs.classList.remove("unlocking");
      }
    }
    if(!canUseEquipment)setCharacterTab("ability");
    if(abilityResetBtn){
      const tickets=Math.max(0,Math.floor(Number(meta.abilityResetTickets)||0));
      abilityResetBtn.classList.toggle("hidden",tickets<=0);
      abilityResetBtn.textContent=`使用能力重置券（持有 ${tickets}）`;
    }
    devResetBtn.classList.toggle("hidden",!devModeActive);
    document.getElementById("devTestBtn").classList.toggle("hidden",!devModeActive);
    renderStageArt(currentStage);
    metaStatsEl.innerHTML="";
    for(const def of metaDefs){
      if(def.unlock&&!def.unlock(meta))continue;
      const cost=metaUpgradeCost(def);
      const card=document.createElement("div");
      card.className="statCard";
      const cap=metaDefCap(def);
      const maxed=cap!==undefined&&meta[def.id]>=cap;
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
    renderEquipmentPanel();
    setupMetaMarquees();
    const bossMode=devModeActive&&bossChallengeMenuOpen;
    const specialModeSelected=currentStage===INFINITE_STAGE&&!bossMode;
    const eventModeSelected=currentStage===EVENT_STAGE&&!bossMode;
    stageSelectModal?.classList.toggle("bossMode",bossMode);
    stageSelectModal?.classList.toggle("specialMode",specialModeSelected);
    stageSelectModal?.classList.toggle("eventMode",eventModeSelected);
    stageModeNormalBtn?.classList.toggle("active",!bossMode&&!specialModeSelected&&!eventModeSelected);
    stageModeBossBtn?.classList.toggle("active",bossMode);
    stageModeSpecialBtn?.classList.toggle("active",specialModeSelected);
    stageModeEventBtn?.classList.toggle("active",eventModeSelected);
    if(stageModeNormalBtn)stageModeNormalBtn.innerHTML="一般<br>關卡";
    stageModeBossBtn?.classList.toggle("locked",!devModeActive);
    if(stageModeBossBtn)stageModeBossBtn.innerHTML=devModeActive?"頭目<br>挑戰":"頭目<br>挑戰 🔒";
    const eventUnlocked=currentPower>=EVENT_UNLOCK_POWER;
    stageModeEventBtn?.classList.toggle("locked",!eventUnlocked);
    if(stageModeEventBtn)stageModeEventBtn.innerHTML=eventUnlocked?"活動<br>關卡":"活動<br>關卡 🔒";
    if(stageModeSpecialBtn)stageModeSpecialBtn.innerHTML="特殊<br>關卡";
    devUnlockStagesBtn?.classList.toggle("hidden",!devModeActive||bossMode||specialModeSelected||eventModeSelected);
    infiniteStage?.classList.toggle("active",specialModeSelected);
    gardenStage.classList.toggle("active",currentStage===1);
    desertStage.classList.toggle("active",currentStage===2);
    snowStage.classList.toggle("active",currentStage===3);
    forestPathStage.classList.toggle("active",currentStage===4);
    forestSeaStage.classList.toggle("active",currentStage===5);
    cookieStage.classList.toggle("active",currentStage===6);
    toyStage.classList.toggle("active",currentStage===7);
    lavaStage.classList.toggle("active",currentStage===8);
    seaStage.classList.toggle("active",currentStage===9);
    clockStage.classList.toggle("active",currentStage===10);
    voidStage.classList.toggle("active",currentStage===11);
    eventStage?.classList.toggle("active",eventModeSelected&&!isActivityTrialMode());
    eventTrialStage?.classList.toggle("active",eventModeSelected&&isActivityTrialMode());
    infiniteStage.classList.toggle("active",currentStage===INFINITE_STAGE);
    bossChallengeStage?.classList.add("hidden");
    bossChallengePanel?.classList.toggle("hidden",!bossMode);
    desertStage.disabled=stageAvailability(2)!=="open";
    snowStage.disabled=stageAvailability(3)!=="open";
    forestPathStage.disabled=stageAvailability(4)!=="open";
    forestSeaStage.disabled=stageAvailability(5)!=="open";
    cookieStage.disabled=stageAvailability(6)!=="open";
    toyStage.disabled=stageAvailability(7)!=="open";
    lavaStage.disabled=stageAvailability(8)!=="open";
    seaStage.disabled=stageAvailability(9)!=="open";
    clockStage.disabled=stageAvailability(10)!=="open";
    voidStage.disabled=stageAvailability(11)!=="open";
    desertStage.classList.toggle("locked",stageAvailability(2)!=="open");
    snowStage.classList.toggle("locked",stageAvailability(3)!=="open");
    forestPathStage.classList.toggle("locked",stageAvailability(4)!=="open");
    forestSeaStage.classList.toggle("locked",stageAvailability(5)!=="open");
    cookieStage.classList.toggle("locked",stageAvailability(6)!=="open");
    toyStage.classList.toggle("locked",stageAvailability(7)!=="open");
    lavaStage.classList.toggle("locked",stageAvailability(8)!=="open");
    seaStage.classList.toggle("locked",stageAvailability(9)!=="open");
    clockStage.classList.toggle("locked",stageAvailability(10)!=="open");
    voidStage.classList.toggle("locked",stageAvailability(11)!=="open");
    gardenStage.innerHTML=stageButtonMarkup("第一關・菜園",1);
    desertStage.innerHTML=stageAvailability(2)==="open"?
      stageButtonMarkup("第二關・沙漠",2):
      stageButtonMarkup("第二關・沙漠（未解鎖）",2);
    snowStage.innerHTML=stageAvailability(3)==="open"?
      stageButtonMarkup("第三關・雪原",3):
      stageButtonMarkup("第三關・雪原（未解鎖）",3);
    forestPathStage.innerHTML=stageAvailability(4)==="open"?
      stageButtonMarkup("第四關上・幽影林徑",4):
      stageButtonMarkup("第四關上・幽影林徑（未解鎖）",4);
    forestSeaStage.innerHTML=stageAvailability(5)==="open"?
      stageButtonMarkup("第四關下・幽影樹海",5):
      stageButtonMarkup("第四關下・幽影樹海（未解鎖）",5);
    cookieStage.innerHTML=stageAvailability(6)==="open"?
      stageButtonMarkup("第五關・奶油餅乾屋",6):
      stageButtonMarkup("第五關・奶油餅乾屋（未解鎖）",6);
    toyStage.innerHTML=stageAvailability(7)==="open"?
      stageButtonMarkup("第六關・玩具夢工廠",7):
      stageButtonMarkup("第六關・玩具夢工廠（未解鎖）",7);
    lavaStage.innerHTML=stageAvailability(8)==="open"?
      stageButtonMarkup("第七關・熔岩工坊",8):
      stageButtonMarkup("第七關・熔岩工坊（未解鎖）",8);
    seaStage.innerHTML=stageAvailability(9)==="open"?
      stageButtonMarkup("第八關・海底遺跡",9):
      stageButtonMarkup("第八關・海底遺跡（未解鎖）",9);
    clockStage.innerHTML=stageAvailability(10)==="open"?
      stageButtonMarkup("第九關・星夜鐘塔",10):
      stageButtonMarkup("第九關・星夜鐘塔（未解鎖）",10);
    voidStage.innerHTML=stageAvailability(11)==="open"?
      stageButtonMarkup("第十關・虛空核心",11):
      stageButtonMarkup("第十關・虛空核心（未解鎖）",11);
    if(eventStage){
      eventStage.classList.toggle("hidden",!eventUnlocked);
      const activityState=activityStageState();
      const eventOpen=activityState==="open";
      eventStage.disabled=!eventOpen;
      eventStage.classList.toggle("locked",!eventOpen);
      eventStage.innerHTML=eventOpen?
        stageButtonMarkup("胡鬧的胡蘿蔔",EVENT_STAGE,`活動幣 ${ACTIVITY_CARROT_COIN_MIN}~${ACTIVITY_CARROT_COIN_MAX}｜強化點數｜最終種子 1~10 顆`):
        activityState==="noRuns"?
          stageButtonMarkup("胡鬧的胡蘿蔔（今日次數用完）",EVENT_STAGE,`每日 ${EVENT_DAILY_LIMIT} 次，明天重置`):
          stageButtonMarkup("胡鬧的胡蘿蔔（未解鎖）",EVENT_STAGE,"2 萬戰力開放");
    }
    if(eventTrialStage){
      eventTrialStage.classList.toggle("hidden",!eventUnlocked);
      const activityState=activityStageState();
      const eventOpen=activityState==="open";
      eventTrialStage.disabled=!eventOpen;
      eventTrialStage.classList.toggle("locked",!eventOpen);
      eventTrialStage.innerHTML=eventOpen?
        stageButtonMarkup("強化試煉",EVENT_STAGE,"活動幣約 20~30｜最終原石 1~5 顆，品質依機率"):
        activityState==="noRuns"?
          stageButtonMarkup("強化試煉（今日次數用完）",EVENT_STAGE,`每日 ${EVENT_DAILY_LIMIT} 次，明天重置`):
          stageButtonMarkup("強化試煉（未解鎖）",EVENT_STAGE,"2 萬戰力開放");
    }
    infiniteStage.textContent="無限輪迴";
    if(bossChallengeStage)bossChallengeStage.innerHTML=stageButtonMarkup("頭目挑戰模式",BOSS_CHALLENGE_STAGE);
    const homeStages=[
      [homeGardenStage,1,"第一關・菜園"],
      [homeDesertStage,2,"第二關・沙漠"],
      [homeSnowStage,3,"第三關・雪原"],
      [homeForestPathStage,4,"第四關上・幽影林徑"],
      [homeForestSeaStage,5,"第四關下・幽影樹海"],
      [homeCookieStage,6,"第五關・奶油餅乾屋"],
      [homeToyStage,7,"第六關・玩具夢工廠"],
      [homeInfiniteStage,INFINITE_STAGE,"無限輪迴模式"]
    ];
    for(const [button,stage,label] of homeStages){
      if(!button)continue;
      const open=stageAvailability(stage)==="open";
      button.classList.toggle("active",currentStage===stage);
      button.classList.toggle("locked",!open);
      button.disabled=!open&&stage!==INFINITE_STAGE;
      button.innerHTML=open?stageButtonMarkup(label,stage):stageButtonMarkup(`${label}（未解鎖）`,stage);
    }
  };

  const player={
    x:0,y:0,r:18,speed:210,hp:100,maxHp:100,regen:0,regenFlat:0,
    regenBoost:1,
    level:1,xp:0,nextXp:18,damage:18,attackSpeed:1,projectiles:1,
    crit:0.05,critStack:0.05,critDamage:1.6,pierce:0,magnet:FIXED_MAGNET_RANGE,area:1,areaDamage:1,xpGain:1,invuln:0,
    armorPen:0,facing:1
  };
  const skills={orbit:0,burst:0,peanut:0,pinky:0,brain:0,luminousSlash:0};
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
    {id:"damage",icon:"🗡️",name:"胡蘿蔔威力",desc:"+18% 攻擊力",basic:true,apply(){player.damage*=1.18;}},
    {id:"crit",icon:"🍀",name:"幸運一擊",desc:"+7% 基礎爆擊率",basic:true,valid(){return player.crit<1;},apply(){const old=player.crit;player.crit=Math.min(1,player.crit+.07);player.critStack=Math.min(1,player.critStack+player.crit-old);}},
    {id:"critd",icon:"💥",name:"爆擊強化",desc:"+30% 場內爆擊傷害",basic:true,apply(){player.critDamage+=.3;}},
    {id:"pierce",icon:"🏹",name:"穿透胡蘿蔔",desc:"+1 穿透敵人數",basic:true,apply(){player.pierce++;}},
    {id:"multi",icon:"🥕",name:"同步發射",desc:"同步發射 +1；點滿後含本體共 6 支蘿蔔，並以散射射出",valid(){return player.projectiles<6;},apply(){player.projectiles++;}},
    {id:"vital",icon:"❤️",name:"血多皮厚",desc:"+20% 最大生命並回復",basic:true,apply(){player.maxHp*=1.2;player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.3);}},
    {id:"area",icon:"⭕",name:"範圍性胡蘿蔔",desc:"+18% 附加技能範圍、+4% 全武器與技能傷害",basic:true,apply(){player.area*=1.18;player.areaDamage*=1.04;}},
    {id:"orbit",icon:"🌀",name:"蘿蔔旋風",desc:"環繞胡蘿蔔傷害敵人；LV5進化高速切割",valid(){return skills.orbit<5;},apply(){skills.orbit++;}},
    {id:"burst",icon:"🌱",name:"菜園爆發",desc:"定時造成範圍傷害；LV5進化巨大衝擊圈",valid(){return skills.burst<5;},apply(){skills.burst++;}},
    {id:"peanut",icon:"🥜",name:"花生跟班",desc:"花生自動丟石頭；LV5進化貫穿滾石",valid(){return skills.peanut<5;},apply(){skills.peanut++;}},
    {id:"pinky",icon:"🍌",name:"PINKY 跟班",desc:"香蕉直線穿透後原路返回；接回強化攻擊與移速",valid(){return skills.pinky<5;},apply(){skills.pinky++;}},
    {id:"luminousSlash",icon:"✦",name:"流光二連斬",desc:"完整胡蘿蔔專屬主動技；啟動20秒，小胡蘿蔔命中時機率追加二連斬",valid(){return hasWholeCarrotEquipped()&&skills.luminousSlash<5;},apply(){skills.luminousSlash++;}},
    {id:"brain",icon:"🧠",name:"超級頭腦",desc:"經驗獲取量累計：LV1 +40%／LV2 +100%／LV3 +180%／LV4 +280%／LV5 +400%",valid(){return skills.brain<5;},apply(){const gain=[.4,.6,.8,1,1.2][skills.brain]||0;player.xpGain+=gain;skills.brain++;}},
    {id:"armorPen",icon:"🛡",name:"破甲胡蘿蔔",desc:"+6% 無視防禦（第二關 / 第三關 / 無限輪迴）",cap:5,valid(){return (currentStage===2||currentStage===3||isInfiniteMode())&&upgradeLevels.armorPen<5;},apply(){player.armorPen+=.06;}}
  ];
  function maxBossChallengeFieldSkills(){
    let applied=0;
    for(const upgrade of upgrades){
      if(upgrade.id==="luminousSlash"&&!hasWholeCarrotEquipped())continue;
      const target=upgrade.id==="multi"?5:(upgrade.cap||5);
      for(let i=0;i<target;i++){
        upgrade.apply();
        if(Object.prototype.hasOwnProperty.call(upgradeLevels,upgrade.id)){
          upgradeLevels[upgrade.id]=(upgradeLevels[upgrade.id]||0)+1;
        }
        applied++;
      }
    }
    const level=Math.min(MAX_PLAYER_LEVEL,applied+1);
    player.level=level;
    player.xp=0;
    player.nextXp=xpRequirement(level,0);
    player.hp=player.maxHp;
    levelQueue=0;
    text(player.x,player.y-52,`測試模式：場內技能全滿 LV${level}`,"#ffe45f",18,"pickup");
  }

  const enemyData={
    coppercoin:{hp:100,speed:160,damage:18,xp:2,r:14,color:"#b87333",defense:18},
    silvercoin:{hp:100,speed:160,damage:18,xp:2,r:15,color:"#c9d3df",defense:18},
    goldcoin:{hp:100,speed:160,damage:18,xp:3,r:16,color:"#ffd95c",defense:18},
    billmonster:{hp:100,speed:160,damage:18,xp:3,r:18,color:"#7bdc91",defense:18},
    diamondcoin:{hp:100,speed:160,damage:18,xp:4,r:20,color:"#67d9ff",defense:18},
    babycarrot:{hp:100,speed:172,damage:18,xp:2,r:14,color:"#f08b31",defense:16},
    carrotbrute:{hp:100,speed:118,damage:22,xp:4,r:22,color:"#d96a22",defense:24},
    carrotboss:{hp:1400,speed:86,damage:42,xp:50,r:54,color:"#f08b31",defense:42},
    chestmimic:{hp:1200,speed:80,damage:40,xp:40,r:50,color:"#9b6b36",defense:40},
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
    whale:{hp:600000,speed:24,damage:68,xp:340,r:72,color:"#568caa",defense:80},
    poisonmush:{hp:360,speed:56,damage:32,xp:8,r:20,color:"#7b4b31",defense:28},
    blackslime:{hp:420,speed:92,damage:36,xp:9,r:20,color:"#17141c",defense:35},
    leafcrow:{hp:330,speed:118,damage:30,xp:8,r:18,color:"#2d241d",defense:22},
    vine:{hp:620,speed:42,damage:44,xp:11,r:23,color:"#355d2e",defense:55},
    barkguard:{hp:880,speed:34,damage:58,xp:14,r:26,color:"#60462f",defense:80},
    ghostfire:{hp:520,speed:110,damage:42,xp:12,r:18,color:"#45d7ff",defense:32},
    poisonvine:{hp:780,speed:48,damage:54,xp:15,r:24,color:"#3f7a32",defense:70},
    nighthawk:{hp:680,speed:125,damage:60,xp:14,r:20,color:"#202034",defense:36},
    oldwood:{hp:1200,speed:30,damage:72,xp:20,r:28,color:"#4d3c2c",defense:110},
    witch:{hp:900,speed:70,damage:66,xp:18,r:23,color:"#352047",defense:50},
    rottenwood:{hp:1801800,speed:26,damage:134,xp:560,r:74,color:"#60462f",defense:206},
    shadowtree:{hp:2784600,speed:24,damage:173,xp:760,r:82,color:"#35273a",defense:266},
    tinygummy:{hp:760,speed:150,damage:58,xp:20,r:15,color:"#ff75a9",defense:28},
    cookieguard:{hp:1050,speed:78,damage:68,xp:22,r:22,color:"#c98a4a",defense:82},
    jamgummy:{hp:1250,speed:62,damage:64,xp:24,r:24,color:"#c6415d",defense:66},
    creampuff:{hp:1650,speed:50,damage:78,xp:28,r:27,color:"#f2d7a5",defense:125},
    gingerchef:{hp:1400,speed:72,damage:86,xp:30,r:24,color:"#a76435",defense:76},
    cookiemonarch:{hp:2888000,speed:26,damage:225,xp:980,r:84,color:"#d99b57",defense:220},
    windupsoldier:{hp:1350,speed:86,damage:82,xp:30,r:22,color:"#c4c7ce",defense:90},
    toyplane:{hp:1000,speed:165,damage:74,xp:28,r:19,color:"#66a8df",defense:48},
    springfist:{hp:1550,speed:78,damage:98,xp:34,r:24,color:"#e16b5b",defense:78},
    blockgolem:{hp:1900,speed:50,damage:92,xp:38,r:28,color:"#e0b34c",defense:150},
    teddybear:{hp:2200,speed:58,damage:110,xp:42,r:29,color:"#9f6948",defense:120},
    nightmaremaker:{hp:2900750,speed:30,damage:300,xp:1250,r:86,color:"#684a7d",defense:280},
    embermite:{hp:2600,speed:105,damage:125,xp:44,r:18,color:"#ff6a32",defense:120},
    slagguard:{hp:3400,speed:55,damage:145,xp:52,r:25,color:"#6b4b3a",defense:180},
    forgeimp:{hp:3000,speed:90,damage:135,xp:48,r:21,color:"#b84c2d",defense:95},
    magmaworm:{hp:3800,speed:62,damage:155,xp:58,r:26,color:"#d15735",defense:150},
    coalroller:{hp:4200,speed:46,damage:170,xp:64,r:28,color:"#3a302c",defense:220},
    lavagolem:{hp:2750000,speed:24,damage:350,xp:1500,r:88,color:"#9a3d25",defense:340},
    bubblejelly:{hp:4300,speed:78,damage:160,xp:64,r:22,color:"#7cd8ff",defense:120},
    reefcrab:{hp:5200,speed:42,damage:185,xp:72,r:27,color:"#4d9ba8",defense:260},
    spearurchin:{hp:4700,speed:58,damage:205,xp:70,r:24,color:"#356b9d",defense:180},
    tideeel:{hp:3900,speed:125,damage:175,xp:66,r:19,color:"#54c7d4",defense:120},
    ruinguard:{hp:6200,speed:38,damage:230,xp:82,r:30,color:"#516f86",defense:310},
    abyssoctopus:{hp:3550000,speed:22,damage:410,xp:1800,r:90,color:"#5a4b9b",defense:390},
    cograt:{hp:6500,speed:70,damage:230,xp:86,r:23,color:"#9b7d4a",defense:240},
    clockguard:{hp:7600,speed:48,damage:260,xp:96,r:28,color:"#70605a",defense:330},
    pendulumshade:{hp:7000,speed:92,damage:250,xp:92,r:22,color:"#403454",defense:230},
    secondhand:{hp:5600,speed:140,damage:240,xp:90,r:18,color:"#c7b86a",defense:180},
    nightclockmage:{hp:8200,speed:54,damage:290,xp:110,r:25,color:"#2f274d",defense:300},
    clockwitch:{hp:4650000,speed:26,damage:500,xp:2100,r:88,color:"#4d2d68",defense:470},
    voidling:{hp:9000,speed:92,damage:290,xp:120,r:22,color:"#2b1742",defense:260},
    darkeye:{hp:8200,speed:64,damage:310,xp:118,r:24,color:"#20142f",defense:330},
    riftcrawler:{hp:9800,speed:54,damage:340,xp:130,r:27,color:"#351a55",defense:400},
    starlessknight:{hp:11500,speed:42,damage:380,xp:150,r:30,color:"#181827",defense:520},
    gravityorb:{hp:10500,speed:38,damage:360,xp:145,r:29,color:"#27194c",defense:450},
    voiddevourer:{hp:6100000,speed:20,damage:640,xp:2600,r:96,color:"#1a0d2b",defense:620},
    skeleton:{hp:160,speed:70,damage:24,xp:14,r:18,color:"#d8d0c0",defense:18},
    wisp:{hp:125,speed:100,damage:22,xp:13,r:16,color:"#4db6ff",defense:8},
    bat:{hp:105,speed:128,damage:18,xp:12,r:15,color:"#4b304e",defense:8},
    eyeball:{hp:190,speed:58,damage:26,xp:16,r:20,color:"#e2d7c8",defense:16},
    imp:{hp:260,speed:78,damage:34,xp:20,r:21,color:"#aa3348",defense:24},
    reaper:{hp:98000,speed:36,damage:42,xp:520,r:68,color:"#331421",defense:60}
  };
  const adventureSkillEntries=[
    {id:"damage",icon:"🗡️",name:"胡蘿蔔威力",type:"攻擊",effect:"+18% 攻擊力",detail:"直接提升主武器基礎傷害。",levels:["+18% 攻擊力","+36% 攻擊力","+54% 攻擊力","+72% 攻擊力","+90% 攻擊力"]},
    {id:"haste",icon:"⏩",name:"攻擊速度",type:"攻速",effect:"+15% 攻擊速度",detail:"提升胡蘿蔔每秒發射頻率。",levels:["+15% 攻擊速度","+30% 攻擊速度","+45% 攻擊速度","+60% 攻擊速度","+75% 攻擊速度"]},
    {id:"crit",icon:"🍀",name:"幸運一擊",type:"爆擊",effect:"+7% 基礎爆擊率",detail:"提高爆擊觸發機率。",levels:["+7% 爆擊率","+14% 爆擊率","+21% 爆擊率","+28% 爆擊率","+35% 爆擊率"]},
    {id:"critd",icon:"💥",name:"爆擊強化",type:"爆傷",effect:"+30% 場內爆擊傷害",detail:"只放大爆擊時的傷害上限。",levels:["+30% 爆擊傷害","+60% 爆擊傷害","+90% 爆擊傷害","+120% 爆擊傷害","+150% 爆擊傷害"]},
    {id:"multi",icon:"🥕",name:"同步發射",type:"主武器",effect:"+1 發同步蘿蔔",detail:"點滿後含本體共 6 支，並以散射發射。",levels:["同步 2 支蘿蔔","同步 3 支蘿蔔","同步 4 支蘿蔔","同步 5 支蘿蔔","同步 6 支蘿蔔"]},
    {id:"giantCarrot",icon:"🥕",name:"巨大胡蘿蔔",type:"進化型態",effect:"同步發射 LV5 解鎖",detail:"每 3 秒投出巨大胡蘿蔔；爆炸傷害 1280% 基礎傷害，燃燒每秒造成爆炸總傷害 18%。",evolution:true,levels:["未解鎖","未解鎖","未解鎖","未解鎖","同步發射 LV5：巨大胡蘿蔔"]},
    {id:"unknownCarrotActive",icon:"✦",name:"完整胡蘿蔔・流光二連斬",type:"主動技能",effect:"完整胡蘿蔔專屬；啟動20秒，冷卻60秒",detail:"裝備完整的胡蘿蔔後，關卡升級池會出現此技能。啟動後小胡蘿蔔命中時，機率追加二連斬並顯示藍色勛章總傷害。",evolution:true,unknownActive:false,levels:["5% 發動二連斬","10% 發動二連斬","15% 發動二連斬","25% 發動二連斬","40% 發動二連斬"]},
    {id:"pierce",icon:"🏹",name:"穿透胡蘿蔔",type:"穿透",effect:"+1 穿透數",detail:"讓主武器連續打穿更多敵人。",levels:["+1 穿透","+2 穿透","+3 穿透","+4 穿透","+5 穿透"]},
    {id:"speed",icon:"👟",name:"兔兔快跑",type:"移動",effect:"+12% 移動速度",detail:"讓兔兔更容易拉扯與閃避。",levels:["+12% 移動速度","+24% 移動速度","+36% 移動速度","+48% 移動速度","+60% 移動速度"]},
    {id:"vital",icon:"❤️",name:"血多皮厚",type:"生存",effect:"+20% 最大生命",detail:"提升最大生命並立即回一段血。",levels:["+20% 最大生命","+40% 最大生命","+60% 最大生命","+80% 最大生命","+100% 最大生命"]},
    {id:"heal",icon:"💚",name:"生命回復",type:"回復",effect:"基礎回復 +20%・每秒回復最大生命 1.2%",detail:"兼顧固定回復與最大生命回復。",levels:["基礎回復 +20%・最大生命 1.2%/秒","基礎回復 +40%・最大生命 2.4%/秒","基礎回復 +60%・最大生命 3.6%/秒","基礎回復 +80%・最大生命 4.8%/秒","基礎回復 +100%・最大生命 6.0%/秒"]},
    {id:"area",icon:"⭕",name:"範圍性胡蘿蔔",type:"範圍",effect:"+18% 附加技能範圍・+4% 全武器與技能傷害",detail:"不影響小胡蘿蔔本體大小，只放大巨大胡蘿蔔與各種附加技能範圍。",levels:["+18% 範圍・+4% 傷害","+36% 範圍・+8% 傷害","+54% 範圍・+12% 傷害","+72% 範圍・+16% 傷害","+90% 範圍・+20% 傷害"]},
    {id:"orbit",icon:"🌀",name:"蘿蔔旋風",type:"技能",effect:"環繞切割；LV5 高速進化",detail:"貼身護體，適合清理近身怪。",levels:["旋轉蘿蔔 1","旋轉蘿蔔 2","旋轉蘿蔔 3","旋轉蘿蔔 4","高速切割圓環"]},
    {id:"burst",icon:"🌱",name:"菜園爆發",type:"技能",effect:"定時爆圈；LV5 巨大衝擊圈",detail:"穩定補充範圍傷害。",levels:["冷卻約 5.38 秒・小範圍爆發","冷卻約 4.96 秒・範圍與傷害提升","冷卻約 4.54 秒・範圍與傷害提升","冷卻約 4.12 秒・範圍與傷害提升","冷卻 2.4 秒・巨大衝擊圈"]},
    {id:"peanut",icon:"🥜",name:"花生跟班",type:"跟班",effect:"自動丟石頭；LV5 貫穿滾石",detail:"提供額外遠程火力。",levels:["冷卻約 1.14 秒・花生丟石頭","冷卻約 0.98 秒・石頭傷害提升","冷卻約 0.82 秒・石頭傷害提升","冷卻約 0.66 秒・石頭傷害提升","冷卻 0.5 秒・貫穿滾石"]},
    {id:"pinky",icon:"🍌",name:"PINKY 跟班",type:"增益",effect:"香蕉返回接住後增傷加速",detail:"固定每 3 秒丟出香蕉，接回後短時間爆發。",levels:["冷卻 3 秒・香蕉往返","冷卻 3 秒・增益效果提升","冷卻 3 秒・增益效果提升","冷卻 3 秒・增益效果提升","冷卻 3 秒・PINKY 增益進化"]},
    {id:"brain",icon:"🧠",name:"超級頭腦",type:"成長",effect:"LV5 累計 +400% 經驗獲取",detail:"累計提高關卡內經驗獲取量。",levels:["+40% 經驗獲取","+100% 經驗獲取","+180% 經驗獲取","+280% 經驗獲取","+400% 經驗獲取"]},
    {id:"armorPen",icon:"🛡",name:"破甲胡蘿蔔",type:"破防",effect:"+6% 無視防禦",detail:"第二關、第三關與輪迴特別實用。",levels:["+6% 無視防禦","+12% 無視防禦","+18% 無視防禦","+24% 無視防禦","+30% 無視防禦"]}
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
    ],
    4:[
      {type:"poisonmush",name:"咖啡毒菇",skill:"低速推進"},
      {type:"blackslime",name:"黑泥巴",skill:"近身高壓"},
      {type:"leafcrow",name:"悽夜鷹",skill:"高速衝刺"},
      {type:"vine",name:"藤蔓怪",skill:"低速高防"},
      {type:"barkguard",name:"腐木守衛",skill:"厚血近戰"},
    ],
    5:[
      {type:"ghostfire",name:"藍鬼火",skill:"高速游移"},
      {type:"poisonvine",name:"毒藤蔓",skill:"高防壓迫"},
      {type:"nighthawk",name:"悽夜鷹",skill:"高速追擊"},
      {type:"oldwood",name:"古木守衛",skill:"重甲慢推"},
      {type:"witch",name:"女巫",skill:"毒藥瓶投擲"},
    ],
    6:[
      {type:"tinygummy",name:"小小軟糖",skill:"高速貼近"},
      {type:"cookieguard",name:"糖霜餅乾兵",skill:"基礎近戰"},
      {type:"jamgummy",name:"果醬軟糖怪",skill:"死亡分裂"},
      {type:"creampuff",name:"奶油泡芙獸",skill:"血厚慢速"},
      {type:"gingerchef",name:"薑餅廚師",skill:"糖霜刀投擲"},
    ],
    7:[
      {type:"windupsoldier",name:"發條小兵",skill:"基礎近戰"},
      {type:"toyplane",name:"玩具飛機",skill:"失控自爆"},
      {type:"springfist",name:"彈簧拳套",skill:"短距突進"},
      {type:"blockgolem",name:"積木方塊怪",skill:"高防慢速"},
      {type:"teddybear",name:"布偶熊",skill:"血厚壓迫"},
    ],
    8:[
      {type:"embermite",name:"熔火小怪",skill:"高速貼近"},
      {type:"slagguard",name:"爐渣守衛",skill:"高防慢推"},
      {type:"forgeimp",name:"工坊小鬼",skill:"中速追擊"},
      {type:"magmaworm",name:"熔岩蠕蟲",skill:"厚血壓迫"},
      {type:"coalroller",name:"煤球滾怪",skill:"重甲近戰"},
    ],
    9:[
      {type:"bubblejelly",name:"泡泡水母",skill:"浮游貼近"},
      {type:"reefcrab",name:"礁岩蟹",skill:"重甲慢推"},
      {type:"spearurchin",name:"槍刺海膽",skill:"高攻近戰"},
      {type:"tideeel",name:"潮汐電鰻",skill:"高速突進"},
      {type:"ruinguard",name:"遺跡守衛",skill:"高防壓場"},
    ],
    10:[
      {type:"cograt",name:"齒輪鼠",skill:"穩定追擊"},
      {type:"clockguard",name:"鐘塔守衛",skill:"高防慢推"},
      {type:"pendulumshade",name:"鐘擺影怪",skill:"中速切入"},
      {type:"secondhand",name:"秒針幽靈",skill:"高速貼近"},
      {type:"nightclockmage",name:"夜鐘法師",skill:"遠距干擾"},
    ],
    11:[
      {type:"voidling",name:"虛空幼體",skill:"暗影追擊"},
      {type:"darkeye",name:"暗眼怪",skill:"索敵干擾"},
      {type:"riftcrawler",name:"裂隙爬行者",skill:"重壓近戰"},
      {type:"starlessknight",name:"無星騎士",skill:"高防慢推"},
      {type:"gravityorb",name:"重力核心",skill:"牽引壓迫"},
    ]
  };
  const bossBestiary=[
    {type:"plant",name:"霸王食人花",stage:1,unlock:()=>!!meta.stage1Cleared,skill:"近身壓場・噴火骨彈",stats:{hp:110000,damage:32,defense:15,speed:52}},
    {type:"stoneface",name:"遠古石面怪",stage:2,unlock:()=>!!meta.stage2Cleared,skill:"落石砸擊・25% 機率暈眩 1 秒",stats:{hp:205000,damage:30,defense:45,speed:30}},
    {type:"whale",name:"暴雪鯨魚",stage:3,unlock:()=>!!meta.stage3Cleared,skill:"急凍光線・零度",stats:{hp:600000,damage:68,defense:80,speed:24}},
    {type:"rottenwood",name:"腐木樹衛",stage:4,unlock:()=>!!meta.stage4Cleared,skill:"樹鞭・枯葉風暴・樹精投擲",stats:{hp:1801800,damage:134,defense:206,speed:26}},
    {type:"shadowtree",name:"幽影樹王",stage:5,unlock:()=>!!meta.stage5Cleared,skill:"粗樹鞭・強化風暴・毒菇迷失",stats:{hp:2784600,damage:173,defense:266,speed:24}},
    {type:"cookiemonarch",name:"奶油餅乾女王",stage:6,unlock:()=>!!meta.stage6Cleared,skill:"餅乾壓模・圓形範圍",stats:{hp:2888000,damage:225,defense:220,speed:26}},
    {type:"nightmaremaker",name:"發條夢魘師",stage:7,unlock:()=>!!meta.stage7Cleared,skill:"發條爆衝・隨機鐵軌重傷",stats:{hp:2900750,damage:300,defense:280,speed:30}},
    {type:"lavagolem",name:"熔爐巨像",stage:8,unlock:()=>!!meta.stage8Cleared,skill:"熔岩裂縫・燃燒地板・鐵鎚震波",stats:{hp:2750000,damage:350,defense:340,speed:24}},
    {type:"abyssoctopus",name:"深海章魚王",stage:9,unlock:()=>!!meta.stage9Cleared,skill:"潮汐拉扯・深海墨霧・水柱預告線",stats:{hp:3550000,damage:410,defense:390,speed:22}},
    {type:"clockwitch",name:"時鐘魔女",stage:10,unlock:()=>!!meta.stage10Cleared,skill:"時間齒輪・倒轉領域・鐘擺斬擊",stats:{hp:4650000,damage:500,defense:470,speed:26}},
    {type:"voiddevourer",name:"虛空吞星者",stage:11,unlock:()=>!!meta.stage11Cleared,skill:"黑洞牽引・暗幕・虛空射線",stats:{hp:6100000,damage:640,defense:620,speed:20}}
  ];
  const EVENT_BOSS_TYPE="carrotboss";
  const EVENT_ENEMY_TYPES=new Set(["babycarrot","carrotbrute","coppercoin","silvercoin","goldcoin","billmonster","diamondcoin",EVENT_BOSS_TYPE,"chestmimic"]);
  function isActivityBossType(type){
    return type===EVENT_BOSS_TYPE||type==="chestmimic";
  }
  function activityBaseStats(){
    const baseHp=BASE_META_LIFE+scaledMetaGain(meta.life,META_LIFE_STEP,META_LIFE_TIER_GROWTH);
    const baseAttack=Math.max(1,Math.floor(baseMetaDamageValue(meta.damage)));
    return {
      hp:Math.max(1,Math.floor(baseHp*.8)),
      damage:Math.max(1,Math.floor(baseAttack*.5)),
      defense:Math.max(0,Math.floor(baseHp*.05))
    };
  }
  function isActivityTrialMode(){
    return activityStageMode===ACTIVITY_TRIAL_MODE;
  }
  function activityEnemyPool(){
    return isActivityTrialMode()?["coppercoin","silvercoin","goldcoin","billmonster","diamondcoin"]:["babycarrot","babycarrot","carrotbrute"];
  }
  function activityMonsterStats(type){
    const base=activityBaseStats();
    const scale={
      coppercoin:{hp:.8,damage:.8,defense:.75,r:14,xp:2},
      silvercoin:{hp:1,damage:1,defense:1,r:15,xp:2},
      goldcoin:{hp:1.15,damage:1.1,defense:1.1,r:16,xp:3},
      billmonster:{hp:1.25,damage:1.15,defense:.9,r:18,xp:3},
      diamondcoin:{hp:1.45,damage:1.25,defense:1.25,r:20,xp:4},
      babycarrot:{hp:.82,damage:.85,defense:.75,r:14,xp:2},
      carrotbrute:{hp:1.55,damage:1.25,defense:1.35,r:22,xp:4},
      carrotboss:{hp:14,damage:2.9,defense:2.35,r:56,xp:50},
      chestmimic:{hp:12,damage:2.8,defense:2.2,r:52,xp:40}
    }[type]||{hp:1,damage:1,defense:1,r:16,xp:2};
    return {
      hp:Math.max(1,Math.round(base.hp*scale.hp)),
      damage:Math.max(1,Math.round(base.damage*scale.damage)),
      defense:Math.max(0,Math.round(base.defense*scale.defense)),
      r:scale.r,
      xp:scale.xp
    };
  }
  function stageAvailability(stage){
    if(stage===BOSS_CHALLENGE_STAGE)return devModeActive?"open":"locked";
    if(stage===INFINITE_STAGE)return "open";
    if(stage===EVENT_STAGE)return activityStageState()==="open"?"open":"locked";
    if(stage>IMPLEMENTED_STAGE_COUNT)return "comingSoon";
    if(stage<=1)return "open";
    if(stage===2)return meta.desertUnlocked?"open":"locked";
    if(stage===3)return meta.snowUnlocked?"open":"locked";
    if(stage===4)return meta.forestPathUnlocked?"open":"locked";
    if(stage===5)return meta.forestSeaUnlocked?"open":"locked";
    if(stage===6)return meta.cookieUnlocked?"open":"locked";
    if(stage===7)return meta.toyUnlocked?"open":"locked";
    if(stage===8)return meta.stage7Cleared?"open":"locked";
    if(stage===9)return meta.stage8Cleared?"open":"locked";
    if(stage===10)return meta.stage9Cleared?"open":"locked";
    if(stage===11)return meta.stage10Cleared?"open":"locked";
    return "locked";
  }
  function activityStageState(){
    if(combatPower()<EVENT_UNLOCK_POWER)return "lockedPower";
    if(activityRunsLeft()<=0)return "noRuns";
    return "open";
  }
  function unlockNormalStagesForDev(){
    if(!devModeActive)return;
    meta.desertUnlocked=true;
    meta.snowUnlocked=true;
    meta.forestPathUnlocked=true;
    meta.forestSeaUnlocked=true;
    meta.cookieUnlocked=true;
    meta.toyUnlocked=true;
    for(let stage=1;stage<=11;stage++)meta[`stage${stage}Cleared`]=true;
    saveMeta();
    renderMeta();
    beep(880,.1,.025,"square");
    countAudioSubtype("ui");
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
  const snowSnapshotTypes=new Set(["penguin","snowman","polarbear","seal","whale","poisonmush","blackslime","leafcrow","vine","barkguard","ghostfire","poisonvine","nighthawk","oldwood","witch","rottenwood","shadowtree","tinygummy","cookieguard","jamgummy","creampuff","gingerchef","cookiemonarch","windupsoldier","toyplane","springfist","blockgolem","teddybear","nightmaremaker","embermite","slagguard","forgeimp","magmaworm","coalroller","lavagolem","bubblejelly","reefcrab","spearurchin","tideeel","ruinguard","abyssoctopus","cograt","clockguard","pendulumshade","secondhand","nightclockmage","clockwitch","voidling","darkeye","riftcrawler","starlessknight","gravityorb","voiddevourer"]);
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
  function renderSkillBookCard(entry){
    const card=document.createElement("div");
    card.className=`bookCard skillBookCard ${entry.evolution?"bookEvolutionCard":""} ${entry.unknownActive?"bookUnknownActiveCard":""}`.trim();
    const preview=document.createElement("div");
    preview.className=`bookPreview ${entry.evolution?"bookEvolutionPreview":""}`.trim();
    const icon=document.createElement("div");
    icon.className=`bookSkillIcon ${entry.unknownActive?"bookUnknownSkillIcon":""}`.trim();
    icon.textContent=entry.icon;
    preview.appendChild(icon);
    const info=document.createElement("div");
    info.className="bookInfo";
    const titleEl=document.createElement("b");
    titleEl.textContent=entry.name;
    const meta=document.createElement("div");
    meta.className="bookSkillMeta";
    meta.textContent=`${entry.type}｜${entry.effect}`;
    const detail=document.createElement("small");
    detail.textContent=entry.detail;
    const levels=document.createElement("div");
    levels.className="bookSkillLevels";
    (entry.levels||[]).forEach((line,index)=>{
      const row=document.createElement("div");
      row.className=index===4?"maxLevel":"";
      row.innerHTML=`<span>LV${index+1}</span><em>${line}</em>`;
      levels.appendChild(row);
    });
    info.appendChild(titleEl);
    info.appendChild(meta);
    info.appendChild(detail);
    info.appendChild(levels);
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
    }else if(type==="poisonmush"){
      rect(-10,-4,20,25,"#d8c7a1");rect(-22,-22,44,20,"#6b432e");rect(-10,-26,20,10,"#b97a46");rect(-5,2,4,4,"#111");rect(4,2,4,4,"#111");
    }else if(type==="blackslime"){
      rect(-22,-8,44,22,"#17141c");rect(-16,-18,32,16,"#24212b");rect(-8,-24,16,8,"#302b38");rect(-7,-7,4,4,"#b8f4ff");rect(4,-7,4,4,"#b8f4ff");
    }else if(type==="leafcrow"){
      rect(-16,-5,32,18,"#2d241d");rect(-8,-16,16,14,"#3f3326");rect(12,-8,16,8,"#5b3d1c");rect(-22,-3,12,10,"#1d1714");rect(2,-11,4,4,"#fff4b8");
    }else if(type==="vine"||type==="poisonvine"){
      rect(-10,-25,20,50,type==="poisonvine"?"#3f7a32":"#355d2e");rect(-22,-10,14,22,"#4d8f3f");rect(8,-16,17,22,"#4d8f3f");rect(-5,-12,4,4,"#ffe6a2");rect(5,-12,4,4,"#ffe6a2");
    }else if(type==="barkguard"||type==="oldwood"||type==="rottenwood"||type==="shadowtree"){
      rect(-18,-30,36,58,type==="shadowtree"?"#35273a":"#60462f");rect(-13,-22,26,15,type==="shadowtree"?"#4c3852":"#7a5b3b");rect(-22,-45,10,16,"#2c5e34");rect(13,-45,12,18,"#2c5e34");rect(-9,-13,5,5,"#111");rect(5,-13,5,5,"#111");rect(-7,8,14,5,"#2b1d16");
    }else if(type==="ghostfire"){
      rect(-15,-20,30,35,"#45d7ff");rect(-9,-28,18,18,"#92f4ff");rect(-5,-7,4,5,"#0e1d26");rect(6,-7,4,5,"#0e1d26");
    }else if(type==="nighthawk"){
      rect(-6,-28,12,48,"#202034");rect(-34,-12,28,16,"#151521");rect(6,-12,34,16,"#151521");rect(-4,-20,4,4,"#d9f6ff");rect(5,-20,4,4,"#d9f6ff");rect(-2,-13,6,5,"#6b4b1e");
    }else if(type==="witch"){
      rect(-14,-20,28,46,"#352047");rect(-18,-30,36,10,"#181020");rect(-8,-45,16,18,"#181020");rect(-10,-16,20,18,"#cfa987");rect(-5,-10,4,4,"#111");rect(5,-10,4,4,"#111");rect(20,-14,7,13,"#b8f4ff");rect(21,-10,5,8,"#6fdd4f");
    }else if(type==="tinygummy"){
      rect(-12,-10,24,24,"#ff75a9");rect(-8,-14,16,8,"#ff9fc2");rect(-5,-4,4,4,"#321623");rect(5,-4,4,4,"#321623");rect(-4,7,8,3,"#ffe5ef");
    }else if(type==="cookieguard"){
      rect(-15,-15,30,30,"#c98a4a");rect(-12,-12,24,24,"#e0b06c");rect(-7,-4,4,4,"#2a1c14");rect(5,-4,4,4,"#2a1c14");rect(-10,8,20,4,"#fff0c9");
    }else if(type==="jamgummy"){
      rect(-17,-13,34,26,"#c6415d");rect(-12,-18,24,12,"#e06b83");rect(-6,-5,4,4,"#1d1018");rect(5,-5,4,4,"#1d1018");rect(-14,10,28,5,"#7f2538");
    }else if(type==="creampuff"){
      rect(-19,-10,38,24,"#f2d7a5");rect(-14,-20,28,16,"#fff2d0");rect(-8,-22,6,6,"#e9bf84");rect(4,-22,6,6,"#e9bf84");rect(-5,-7,4,4,"#2b1d18");rect(5,-7,4,4,"#2b1d18");
    }else if(type==="gingerchef"){
      rect(-13,-18,26,36,"#a76435");rect(-17,-26,34,10,"#fff2d2");rect(-8,-9,4,4,"#251816");rect(5,-9,4,4,"#251816");rect(-20,0,10,5,"#f0d084");rect(10,0,10,5,"#f0d084");
    }else if(type==="cookiemonarch"){
      rect(-28,-22,56,44,"#d99b57");rect(-20,-16,40,32,"#f0c079");rect(-10,-4,5,5,"#2b1a12");rect(8,-4,5,5,"#2b1a12");rect(-12,10,24,5,"#fff2cd");rect(-18,-34,36,12,"#fff5d8");rect(-24,22,10,12,"#c47a3d");rect(14,22,10,12,"#c47a3d");
    }else if(type==="windupsoldier"){
      rect(-13,-20,26,38,"#c4c7ce");rect(-9,-26,18,8,"#8b929e");rect(-6,-10,4,4,"#273142");rect(5,-10,4,4,"#273142");rect(-18,2,8,15,"#9aa1ad");rect(10,2,8,15,"#9aa1ad");
    }else if(type==="toyplane"){
      rect(-24,-4,48,9,"#66a8df");rect(-10,-15,20,31,"#4f8fc4");rect(14,-8,18,6,"#e9d36f");rect(-28,-8,12,6,"#e16b5b");rect(3,-3,4,4,"#142333");
    }else if(type==="springfist"){
      rect(-12,-17,24,34,"#e16b5b");rect(-19,-24,38,12,"#f0a06f");rect(-6,-8,4,4,"#2a1718");rect(5,-8,4,4,"#2a1718");rect(14,-2,14,8,"#d9d6c9");
    }else if(type==="blockgolem"){
      rect(-20,-20,40,40,"#e0b34c");rect(-14,-14,14,14,"#f2cf68");rect(2,-14,14,14,"#c48e36");rect(-14,2,14,14,"#b88434");rect(2,2,14,14,"#f0c65b");rect(-8,-3,4,4,"#1f1a16");rect(6,-3,4,4,"#1f1a16");
    }else if(type==="teddybear"){
      rect(-16,-13,32,33,"#9f6948");rect(-12,-26,24,18,"#b9825b");rect(-20,-27,9,9,"#8d573a");rect(11,-27,9,9,"#8d573a");rect(-6,-17,4,4,"#1d1714");rect(5,-17,4,4,"#1d1714");rect(-4,-9,8,5,"#e0b58f");
    }else if(type==="nightmaremaker"){
      rect(-24,-26,48,48,"#684a7d");rect(-16,-36,32,16,"#8c63a8");rect(-7,-14,5,5,"#dff7ff");rect(7,-14,5,5,"#dff7ff");rect(-28,12,56,8,"#3a2a4a");rect(-18,23,10,13,"#d9b255");rect(8,23,10,13,"#d9b255");
    }else if(type==="embermite"){
      rect(-13,-13,26,26,"#d94d27");rect(-8,-21,16,16,"#ff8a35");rect(-4,-6,4,4,"#1f1210");rect(5,-6,4,4,"#1f1210");rect(-12,10,6,10,"#ffb14d");rect(6,10,6,10,"#ffb14d");
    }else if(type==="slagguard"){
      rect(-18,-20,36,40,"#5b4136");rect(-13,-24,26,9,"#9a6b4c");rect(-8,-10,5,5,"#ffbb55");rect(5,-10,5,5,"#ffbb55");rect(-20,8,40,7,"#2a211e");
    }else if(type==="forgeimp"){
      rect(-13,-17,26,34,"#8f3327");rect(-18,-25,10,12,"#c8552f");rect(8,-25,10,12,"#c8552f");rect(-5,-8,4,4,"#ffe07a");rect(4,-8,4,4,"#ffe07a");rect(13,0,13,5,"#e0a34f");
    }else if(type==="magmaworm"){
      for(let i=0;i<5;i++){rect(-24+i*11,-6+(i%2)*3,13,15,i%2?"#b9472c":"#e05d31");rect(-21+i*11,-9,7,4,"#ff9d49");}
      rect(26,-5,12,13,"#ff7a3a");rect(30,-1,3,3,"#1f1210");
    }else if(type==="coalroller"){
      rect(-22,-18,44,36,"#282522");rect(-17,-13,34,26,"#494038");rect(-10,-6,5,5,"#ff8e42");rect(6,-6,5,5,"#ff8e42");rect(-18,17,36,6,"#1a1715");
    }else if(type==="lavagolem"){
      rect(-28,-34,56,62,"#6b392a");rect(-20,-24,40,20,"#8d4d35");rect(-12,-12,7,7,"#ffb14d");rect(7,-12,7,7,"#ffb14d");rect(-24,6,48,8,"#3b241d");rect(-34,-4,10,28,"#7a422f");rect(24,-4,10,28,"#7a422f");
    }else if(type==="bubblejelly"){
      rect(-16,-18,32,28,"#6fd3ff");rect(-11,-24,22,12,"#a8f2ff");rect(-6,-7,4,4,"#10233a");rect(5,-7,4,4,"#10233a");rect(-13,12,5,14,"#4aa4d8");rect(0,12,5,16,"#4aa4d8");rect(9,12,5,13,"#4aa4d8");
    }else if(type==="reefcrab"){
      rect(-18,-11,36,22,"#4d9ba8");rect(-24,-7,8,14,"#377783");rect(16,-7,8,14,"#377783");rect(-8,-15,5,5,"#101827");rect(5,-15,5,5,"#101827");rect(-14,12,6,8,"#72c6cf");rect(8,12,6,8,"#72c6cf");
    }else if(type==="spearurchin"){
      rect(-16,-16,32,32,"#365f98");rect(-23,-3,46,6,"#89d8ff");rect(-3,-23,6,46,"#89d8ff");rect(-6,-5,4,4,"#101827");rect(5,-5,4,4,"#101827");
    }else if(type==="tideeel"){
      for(let i=0;i<5;i++){rect(-25+i*11,-4+Math.sin(i)*5,13,10,i%2?"#77cfe5":"#4aa5c8");}
      rect(26,-5,13,12,"#91e6f0");rect(30,-1,3,3,"#10233a");
    }else if(type==="ruinguard"){
      rect(-18,-24,36,48,"#5d7782");rect(-13,-18,26,34,"#8aa4aa");rect(-7,-10,5,5,"#0f1820");rect(5,-10,5,5,"#0f1820");rect(-22,10,44,6,"#30464e");
    }else if(type==="abyssoctopus"){
      rect(-27,-25,54,42,"#51408b");rect(-19,-34,38,22,"#7254b5");rect(-10,-13,6,6,"#d9f3ff");rect(7,-13,6,6,"#d9f3ff");for(let i=0;i<5;i++)rect(-26+i*13,14+(i%2)*5,8,22,"#3c3270");
    }else if(type==="cograt"){
      rect(-15,-8,30,18,"#8a7248");rect(-20,-12,10,9,"#b09b65");rect(9,-12,10,9,"#b09b65");rect(8,-2,4,4,"#1b1510");rect(-3,0,5,3,"#d6c07b");rect(12,6,14,4,"#6d5435");
    }else if(type==="clockguard"){
      rect(-17,-22,34,44,"#6b6054");rect(-12,-17,24,34,"#a28f6a");rect(-8,-6,5,5,"#241f20");rect(5,-6,5,5,"#241f20");rect(-15,8,30,5,"#43362e");rect(-4,-29,8,10,"#c4a35a");
    }else if(type==="pendulumshade"){
      rect(-12,-24,24,44,"#30263f");rect(-19,-31,38,10,"#171020");rect(-6,-14,4,4,"#dff7ff");rect(5,-14,4,4,"#dff7ff");rect(12,-2,18,5,"#bfa15a");
    }else if(type==="secondhand"){
      rect(-4,-28,8,56,"#c9a64d");rect(-20,-4,40,8,"#6d5230");rect(-8,-8,16,16,"#efe0a7");rect(-3,-3,6,6,"#1a1510");
    }else if(type==="nightclockmage"){
      rect(-14,-23,28,47,"#2e2348");rect(-18,-33,36,12,"#161020");rect(-8,-43,16,16,"#161020");rect(-9,-17,18,18,"#c8a68c");rect(-5,-11,4,4,"#101018");rect(5,-11,4,4,"#101018");rect(18,-5,10,16,"#ffd560");
    }else if(type==="clockwitch"){
      rect(-25,-30,50,56,"#4a2e61");rect(-30,-42,60,14,"#201025");rect(-11,-23,22,22,"#d2a78f");rect(-6,-15,5,5,"#111");rect(6,-15,5,5,"#111");rect(-28,16,56,9,"#2a173a");rect(20,-8,10,28,"#d6b75e");
    }else if(type==="voidling"){
      rect(-14,-15,28,30,"#25123c");rect(-9,-22,18,14,"#3a1d62");rect(-6,-5,4,4,"#c58bff");rect(5,-5,4,4,"#c58bff");rect(-12,13,6,10,"#130b20");rect(6,13,6,10,"#130b20");
    }else if(type==="darkeye"){
      rect(-17,-17,34,34,"#1d132f");rect(-10,-10,20,20,"#6336a0");rect(-5,-5,10,10,"#0a0610");rect(-22,-2,8,4,"#a36bff");rect(14,3,8,4,"#a36bff");
    }else if(type==="riftcrawler"){
      for(let i=0;i<5;i++){rect(-24+i*10,-8+(i%2)*4,12,16,i%2?"#2c1848":"#41205f");rect(-22+i*10,9,4,6,"#7d52b8");}
      rect(24,-7,14,14,"#6d3aae");rect(28,-2,4,4,"#f0d7ff");
    }else if(type==="starlessknight"){
      rect(-16,-24,32,46,"#211934");rect(-12,-18,24,34,"#4a3a61");rect(-7,-10,5,5,"#b58cff");rect(5,-10,5,5,"#b58cff");rect(-23,-2,8,24,"#151020");rect(15,-2,8,24,"#151020");
    }else if(type==="gravityorb"){
      rect(-18,-18,36,36,"#160b25");rect(-12,-12,24,24,"#5b2f90");rect(-6,-6,12,12,"#d8b2ff");rect(-28,-2,10,4,"#9d6cff");rect(18,2,10,4,"#9d6cff");
    }else if(type==="voiddevourer"){
      rect(-32,-28,64,54,"#180b2b");rect(-23,-36,46,20,"#2f1551");rect(-13,-16,8,8,"#d5a3ff");rect(7,-16,8,8,"#d5a3ff");rect(-26,8,52,8,"#08050d");rect(-36,-2,10,32,"#261044");rect(26,-2,10,32,"#261044");
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
      [1,2,3,4,5,6,7,8,9,10,11].forEach(stage=>{
        const btn=document.createElement("button");
        const state=stageAvailability(stage);
        const unlocked=state==="open";
        btn.type="button";
        btn.textContent=stage===1?"菜園":stage===2?"沙漠":stage===3?"雪原":stage===4?"幽影林徑":stage===5?"幽影樹海":stage===6?"奶油餅乾屋":stage===7?"玩具夢工廠":stage===8?"熔岩工坊":stage===9?"海底遺跡":stage===10?"星夜鐘塔":"虛空核心";
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
        grid.appendChild(renderSkillBookCard(entry));
      }
      adventureBookContent.appendChild(grid);
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
  // Optional external audio files. Root path first, old /ro path as fallback.
  const externalAudioDefs={
    crit:["audio/Blunt-Critical-Hit.wav","audio/ro/Blunt-Critical-Hit.wav"],
    crit2:["audio/Blunt-Critical-Hit-2.wav","audio/ro/Blunt-Critical-Hit-2.wav"],
    crit3:["audio/Blunt-Critical-Hit-3.wav","audio/ro/Blunt-Critical-Hit-3.wav"],
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
    for(const [key,srcDef] of Object.entries(externalAudioDefs)){
      if(externalAudio[key]?.loading||externalAudio[key]?.ok!==undefined)continue;
      const config=externalAudioConfig[key]||{minInterval:60};
      externalAudio[key]={buffer:null,ok:null,lastPlayed:0,minInterval:config.minInterval,loading:true};
      const sources=Array.isArray(srcDef)?srcDef:[srcDef];
      const fetchAudio=(index=0)=>{
        const src=sources[index];
        return fetch(src)
        .then(res=>{
          if(!res.ok)throw new Error(`audio fetch failed: ${src}`);
          return res.arrayBuffer();
        })
        .catch(error=>{
          if(index+1<sources.length)return fetchAudio(index+1);
          throw error;
        });
      };
      fetchAudio()
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
    if(!(debugOverlayEnabled&&debugPanelMode==="perf")&&!devTestRecorder.active)return;
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
  function allowSynthBeep(){
    if(!running||paused||ended)return true;
    const now=performance.now();
    if(now-synthBeepWindowAt>100){
      synthBeepWindowAt=now;
      synthBeepWindowCount=0;
    }
    synthBeepWindowCount++;
    return synthBeepWindowCount<=10;
  }
  function beep(f,d=.06,v=.025,type="square"){if(!ensureAudioReady())return;const finalVolume=Math.max(0,v*synthVolume());if(finalVolume<=0||!allowSynthBeep())return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(finalVolume,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(audio.destination);o.start();o.stop(t+d);countAudioDebug("beep");}
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
    if(now-critSoundLastTime<performanceConfig().critSoundThrottleMs)return;
    const critVolume=Math.max(.25,Math.min(.95,volume*.95));
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
  function compactArray(arr,keep){
    let write=0;
    for(let read=0;read<arr.length;read++){
      const item=arr[read];
      if(keep(item,read)){
        arr[write]=item;
        write++;
      }
    }
    arr.length=write;
    return arr;
  }
  function makeEmptyShot(){
    return {
      active:false,kind:"",x:0,y:0,vx:0,vy:0,r:0,life:0,
      damage:0,pierce:0,angle:0,reservedTargetId:0,reservedDamage:0,
      curveBoss:false,curveAge:0,curveDuration:0,sx:0,sy:0,cx:0,cy:0,tx:0,ty:0,
      debris:0,spin:0,missedLife:0,hit:null
    };
  }
  function resetShot(s){
    s.active=true;
    s.kind="";
    s.x=0;s.y=0;s.vx=0;s.vy=0;s.r=0;s.life=0;
    s.damage=0;s.pierce=0;s.angle=0;
    s.reservedTargetId=0;s.reservedDamage=0;
    s.curveBoss=false;s.curveAge=0;s.curveDuration=0;
    s.sx=0;s.sy=0;s.cx=0;s.cy=0;s.tx=0;s.ty=0;
    s.debris=0;s.spin=0;s.missedLife=0;
    if(s.hit)s.hit.clear();
    return s;
  }
  function acquireShot(){
    for(let i=0;i<shotPool.length;i++){
      const idx=(shotScanCursor+i)%shotPool.length;
      if(!shotPool[idx].active){
        shotScanCursor=(idx+1)%shotPool.length;
        return shotPool[idx];
      }
    }
    const extra=makeEmptyShot();
    shotPool.push(extra);
    shotScanCursor=shotPool.length%Math.max(1,shotPool.length);
    return extra;
  }
  function releasePooledShot(s){
    if(!s)return;
    releaseShotReservation(s);
    if(s.hit)s.hit.clear();
    s.active=false;
  }
  function clearPooledShots(list){
    for(const s of list)releasePooledShot(s);
    list.length=0;
    return list;
  }
  function shotPoolActiveCount(){
    let count=0;
    for(const s of shotPool)if(s.active)count++;
    return count;
  }
  function outsideNineGrid(x,y,padding=0){
    return Math.abs(x-player.x)>W*1.5+padding||Math.abs(y-player.y)>H*1.5+padding;
  }
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
  function cameraPosition(){return{x:Math.round(player.x),y:Math.round(player.y)};}
  function worldToScreen(x,y){
    const camera=cameraPosition();
    return{x:Math.round(x-camera.x+W/2),y:Math.round(y-camera.y+H/2)};
  }
  function screenPointVisible(p,margin=0){
    return p.x>=-margin&&p.x<=W+margin&&p.y>=-margin&&p.y<=H+margin;
  }
  function effectDrawMargin(e){
    const r=Math.max(0,Number(e.r)||0);
    if(e.kind==="leafStorm")return r+120;
    if(e.kind==="luminousSlash")return r+140;
    if(e.kind==="shockwave"||e.kind==="slash")return r+36;
    if(e.kind==="bossRock")return r+48;
    if(e.kind==="pinkyLine")return Math.max(56,r*4);
    if(e.kind==="treantSeed"||e.kind==="poisonMushroom")return 112;
    if(e.kind==="saplingBomb")return 88;
    if(e.kind==="rockFragment")return r+90;
    return Math.max(44,r+44);
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
        try{
          onMidpoint?.();
        }catch(error){
          console.error("[Transition midpoint failed]",error);
          transitionCtx.clearRect(0,0,W,H);
          transitionMask.style.opacity="0";
          transitionMask.style.background="radial-gradient(circle at 50% 50%, transparent 0, transparent 120vmax, #000 120vmax, #000 100%)";
          transitioning=false;
          return;
        }
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
      level:1,xp:0,nextXp:xpRequirement(1,0),damage:baseMetaDamageValue(meta.damage),
      attackSpeed:1+meta.speed*.03,projectiles:1,
      crit:baseCrit,critStack:baseCrit,critDamage:baseMetaCritDamageMultiplier(meta.critDamage),
      pierce:0,magnet:FIXED_MAGNET_RANGE,area:1,areaDamage:1,invuln:0,
      armorPen:Math.min(MAX_META_ARMOR_PEN,meta.armorPen*.007),facing:1
    });
    skills.orbit=skills.burst=skills.peanut=skills.pinky=skills.brain=skills.luminousSlash=0;
    updatePlayer.pet=updatePlayer.burst=updatePlayer.pinky=0;
    for(const id of Object.keys(upgradeLevels))upgradeLevels[id]=0;
    clearPooledShots(shots);
    enemies=[];shots=[];enemyShots=[];gems=[];effects=[];texts=[];areas=[];petShots=[];bananas=[];chests=[];pickups=[];bossObstacles=[];
    announcements=[];activeAnnouncement=null;
    kills=score=eliteKills=bossKills=eligibleKills=instantKills=0;instantKillTimer=0;time=spawnClock=shotClock=0;battleStartDelay=0;nextId=1;levelQueue=0;
    kps=kpsWindowKills=kpsWindowTime=kpsPressure=kpsBonusTimer=kpsSpawnBonus=0;
    hudKpsBonus=hudWaveSeconds=0;
    giantCarrotCooldown=0;
    sharedTargetCache=null;sharedTargetTimer=0;
    chestClock=10;chestTravel=0;lastChestX=player.x;lastChestY=player.y;magnetAll=false;magnetTimer=0;gemPressureRecycleTimer=0;carrotVolley=0;pinkyBoostTimer=0;pinkyDamageBoost=1;pendingCarrotShots=0;luminousSlashActiveTimer=0;luminousSlashCooldownTimer=0;runCoins=0;runCoinsSettled=false;activityRewarded=false;lastActivityReward={mode:activityStageMode,seeds:0,coins:0,points:0,stones:[]};
    encirclementPressure=0;encirclementCharge=0;encirclementSampleClock=0;encirclementPressureRounds=0;
    encirclementReservedHp=0;encirclementSectorBits=0;encirclementSectorCount=0;encirclementPrewarn=false;encirclementDebts=[];
    infiniteClearCount=0;
    poisonTimer=poisonRate=stunTimer=confuseTimer=0;
    potionHealTimer=0;blizzardTimer=0;blizzardPushTimer=0;blizzardPushAngle=0;blizzardPushSpeed=0;
    running=true;paused=false;ended=false;runRewarded=false;escalationStart=null;killSurgeActive=false;
    finalPhase="none";finalTimer=0;bossArena.active=false;bossArena.zone=effectiveZone();bossArena.r=currentStage>=2||isInfiniteMode()?470:430;bossArena.x=player.x;bossArena.y=player.y;
    keys.up=keys.down=keys.left=keys.right=false;
    resetStick();
  }

  function start(){
    initAudio();
    if(isEventMode()&&!consumeActivityRun()){
      beep(180,.08,.025,"square");
      renderMeta();
      return;
    }
    unloadGardenFrame();
    reset();
    if(autoTrainingActive){
      player.xpGain+=.2;
      text(player.x,player.y-46,autoTrainingSource==="charm"?"自動研修・經驗+20%":"自動研修啟動","#8fffd0",18,"pickup");
    }
    if(isBossChallengeMode())maxBossChallengeFieldSkills();
    intro.classList.add("hidden");endScreen.classList.add("hidden");levelScreen.classList.add("hidden");pauseScreen.classList.add("hidden");
    pauseBtn.classList.add("visible");
    positionMonitorTabs();
    updateMonitorButtons();
    if(isBossChallengeMode()){
      time=DURATION;
      resetBossChallengeDamageStats();
      timeline.seen.clear();
      beginFinalBossEntrance();
      announce("頭目挑戰（測試版）","此為測試模式用；要更新請詢問用戶。","#ffe45f",4);
    }
    last=performance.now();loopAccumulator=0;
  }
  function startWithTransition(){
    playSceneTransition(()=>{
      timeline.seen.clear();
      start();
    },{shrinkDuration:1100,holdDuration:1100,expandDuration:800});
  }
  function startWithoutAutoTraining(){
    autoTrainingActive=false;
    autoTrainingSource="";
    autoTrainingSettled=false;
    startWithTransition();
  }
  function startWithAutoTraining(source){
    if((isInfiniteMode()&&source!=="charm")||(!isInfiniteMode()&&source!=="ticket")){
      startWithoutAutoTraining();
      return;
    }
    autoTrainingActive=true;
    autoTrainingSource=source;
    autoTrainingSettled=false;
    if(source==="ticket"){
      meta.autoTrainingTickets=Math.max(0,Math.floor(Number(meta.autoTrainingTickets)||0)-1);
      saveMeta();
      renderMeta();
    }
    startWithTransition();
  }
  function requestAutoTrainingThenStart(){
    if(autoTrainingPromptOpen)return;
    if(isBossChallengeMode()){
      startWithoutAutoTraining();
      return;
    }
    resetAutoTrainingDailyPurchase();
    const infinite=isInfiniteMode();
    const hasCharm=!!meta.autoTrainingCharm;
    const tickets=Math.max(0,Math.floor(Number(meta.autoTrainingTickets)||0));
    const source=infinite?(hasCharm?"charm":""):(tickets>0?"ticket":"");
    if(!source){
      startWithoutAutoTraining();
      return;
    }
    const title=source==="charm"?"啟用自動研修護符？":"使用自動研修券？";
    const message=source==="charm"
      ?"輪迴模式會自動選擇場內技能，並額外\n獲得經驗 +20%。\n自動研修券不適用於輪迴模式。"
      :`一般關卡會自動選擇場內技能。\n目前持有 ${tickets} 張，進入關卡後會扣 1 張。\n自動研修護符不適用於一般關卡。`;
    autoTrainingPromptOpen=true;
    settingsOverlay.classList.add("visible","dialogOnly");
    settingsOverlay.setAttribute("aria-hidden","false");
    openSettingsDialog({
      title,
      message,
      confirmLabel:"使用",
      cancelLabel:"不用",
      onConfirm:()=>{
        closeSettingsDialog();
        settingsOverlay.classList.remove("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","true");
        autoTrainingPromptOpen=false;
        startWithAutoTraining(source);
      },
      onCancel:()=>{
        settingsOverlay.classList.remove("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","true");
        autoTrainingPromptOpen=false;
        startWithoutAutoTraining();
      }
    });
  }

  function finalBossPhaseConfig(type){
    if(type==="stoneface"){
      return {
        hp:[55000,65000,85000],
        defense:[45,58,72]
      };
    }
    if(type==="whale"){
      return {
        hp:[150000,180000,270000],
        defense:[80,105,135]
      };
    }
    if(type==="reaper"){
      return {
        hp:[900900,1310400,1965600],
        defense:[399,554,738]
      };
    }
    if(type==="rottenwood"){
      return {
        hp:[409500,573300,819000],
        defense:[206,266,348]
      };
    }
    if(type==="shadowtree"){
      return {
        hp:[600600,873600,1310400],
        defense:[266,369,492]
      };
    }
    if(type==="cookiemonarch"){
      return {
        hp:[962667,962667,962666],
        defense:[220,220,220]
      };
    }
    if(type==="nightmaremaker"){
      return {
        hp:[966917,966917,966916],
        defense:[280,280,280]
      };
    }
    if(type==="lavagolem"){
      return {
        hp:[825000,825000,1100000],
        defense:[340,390,450]
      };
    }
    if(type==="abyssoctopus"){
      return {
        hp:[1050000,1050000,1450000],
        defense:[390,450,520]
      };
    }
    if(type==="clockwitch"){
      return {
        hp:[1350000,1400000,1900000],
        defense:[470,540,620]
      };
    }
    if(type==="voiddevourer"){
      return {
        hp:[1750000,1850000,2500000],
        defense:[620,700,820]
      };
    }
    return {
      hp:[30000,35000,45000],
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
    const scaleTime=monsterScaleTime(),base=enemyData[type],scale=1+scaleTime/600*.9,growth=infiniteGrowth();
    let hp=base.hp*scale,size=base.r,speed=base.speed*(1+scaleTime/1200),damage=base.damage*scale,xp=base.xp;
    if(isInfiniteMode()){const zone=infiniteZoneAt();hp*=growth.hp;damage*=growth.damage;speed*=growth.speed;xp*=zone>10?1+zone*.18:1;}
    if(kind==="elite"){hp*=7;size*=1.45;speed*=1.08;damage*=1.8;xp*=8;}
    if(kind==="elite"&&type==="teddybear"){hp+=2000;damage+=100;}
    if(kind==="boss"){hp*=35;size*=2.25;speed*=.82;damage*=2.8;xp*=35;}
    let defense=base.defense||0;
    if(isEventMode()&&EVENT_ENEMY_TYPES.has(type)){
      const eventStats=activityMonsterStats(type);
      hp=eventStats.hp;
      damage=eventStats.damage;
      defense=eventStats.defense;
      size=eventStats.r;
      speed=isActivityBossType(type)?80:160;
      xp=eventStats.xp;
      if(kind==="elite"){hp*=1.8;damage*=1.3;defense=Math.round(defense*1.25);size*=1.2;xp*=2;}
      if(kind==="boss"||isActivityBossType(type)){hp=eventStats.hp;damage=eventStats.damage;defense=eventStats.defense;size=eventStats.r;speed=80;xp=eventStats.xp;}
    }
    const zone=effectiveZone();
    if(zone>=1&&defense===0)defense=5;
    if(kind==="elite")defense+=zone>=1?10:0;
    if(kind==="boss")defense+=zone>=1?18:6;
    if(kind==="final"){
      if(isInfiniteMode()){
        const bossZone=Math.max(0,infiniteBossZone);
        const bossHpMult=bossZone>10?infiniteBossHpMultiplier(bossZone):1;
        const bossDamageMult=bossZone>10?1+bossZone*.18:1;
        const bossDefenseBonus=bossZone>10?bossZone*4:0;
        if(type==="voiddevourer"){hp=6100000*bossHpMult;size=96;speed=20;damage=640*bossDamageMult;xp=2600;defense=620+bossDefenseBonus;}
        else if(type==="clockwitch"){hp=4650000*bossHpMult;size=88;speed=26;damage=500*bossDamageMult;xp=2100;defense=470+bossDefenseBonus;}
        else if(type==="abyssoctopus"){hp=3550000*bossHpMult;size=90;speed=22;damage=410*bossDamageMult;xp=1800;defense=390+bossDefenseBonus;}
        else if(type==="lavagolem"){hp=2750000*bossHpMult;size=88;speed=24;damage=350*bossDamageMult;xp=1500;defense=340+bossDefenseBonus;}
        else if(type==="whale"){hp=600000*bossHpMult;size=72;speed=24;damage=68*bossDamageMult;xp=420;defense=80+bossDefenseBonus;}
        else if(type==="reaper"){hp=4176900*bossHpMult;size=76;speed=30;damage=260*bossDamageMult;xp=980;defense=399+bossDefenseBonus;}
        else if(type==="stoneface"){hp=120000*bossHpMult;size=64;speed=30;damage=30*bossDamageMult;xp=340;defense=45+bossDefenseBonus;}
        else{hp=70000*bossHpMult;size=62;speed=52;damage=32*bossDamageMult;xp=280;defense=15+(bossZone>10?bossZone*3:0);}
      }else if(isBossChallengeMode()){
        if(type==="voiddevourer"){hp=6100000;size=96;speed=20;damage=640;xp=2600;defense=620;}
        else if(type==="clockwitch"){hp=4650000;size=88;speed=26;damage=500;xp=2100;defense=470;}
        else if(type==="abyssoctopus"){hp=3550000;size=90;speed=22;damage=410;xp=1800;defense=390;}
        else if(type==="lavagolem"){hp=2750000;size=88;speed=24;damage=350;xp=1500;defense=340;}
        else if(type==="nightmaremaker"){hp=2900750;size=86;speed=30;damage=300;xp=1250;defense=280;}
        else if(type==="cookiemonarch"){hp=2888000;size=84;speed=26;damage=225;xp=980;defense=220;}
        else if(type==="shadowtree"){hp=2784600;size=82;speed=24;damage=173;xp=760;defense=266;}
        else if(type==="rottenwood"){hp=1801800;size=74;speed=26;damage=134;xp=560;defense=206;}
        else if(type==="whale"){hp=600000;size=72;speed=24;damage=68;xp=420;defense=80;}
        else if(type==="stoneface"){hp=205000;size=64;speed=30;damage=30;xp=300;defense=45;}
        else if(type==="reaper"){hp=4176900;size=76;speed=30;damage=260;xp=980;defense=399;}
        else{hp=110000;size=62;speed=52;damage=32;xp=250;defense=15;}
      }else if(currentStage===11){hp=6100000;size=96;speed=20;damage=640;xp=2600;defense=620;}
      else if(currentStage===10){hp=4650000;size=88;speed=26;damage=500;xp=2100;defense=470;}
      else if(currentStage===9){hp=3550000;size=90;speed=22;damage=410;xp=1800;defense=390;}
      else if(currentStage===8){hp=2750000;size=88;speed=24;damage=350;xp=1500;defense=340;}
      else if(currentStage===7){hp=2900750;size=86;speed=30;damage=300;xp=1250;defense=280;}
      else if(currentStage===6){hp=2888000;size=84;speed=26;damage=225;xp=980;defense=220;}
      else if(currentStage===5){hp=2784600;size=82;speed=24;damage=173;xp=760;defense=266;}
      else if(currentStage===4){hp=1801800;size=74;speed=26;damage=134;xp=560;defense=206;}
      else if(currentStage===3){hp=600000;size=72;speed=24;damage=68;xp=420;defense=80;}
      else if(currentStage===2){hp=205000;size=64;speed=30;damage=30;xp=300;defense=45;}
      else{hp=110000;size=62;speed=52;damage=32;xp=250;defense=15;}
    }
    const normalDifficultyMult=!isInfiniteMode()&&!isBossChallengeMode()&&!isEventMode()?stageDifficultyMonsterMultiplier(currentStage):1;
    if(normalDifficultyMult!==1){
      hp*=normalDifficultyMult;
      damage*=normalDifficultyMult;
      defense=Math.round(defense*normalDifficultyMult);
      speed*=normalDifficultyMult;
    }
    if(kind==="normal"&&kpsPressure>0)hp*=1+kpsPressure*.35;
    if(kind==="elite"&&kpsPressure>0)hp*=1+kpsPressure*.18;
    if(killSurgeActive)hp*=KILL_SURGE_HP_MULTIPLIER;
    const enemy={id:nextId++,type,kind,defense,x:player.x+Math.cos(angle)*range,y:player.y+Math.sin(angle)*range,r:size,hp,maxHp:hp,speed,damage,xp,hit:0,attack:rand(0,1),shoot:rand(.8,2.2),slow:0,phase:0,cling:0,bars:kind==="final"?3:1,totalBars:kind==="final"?3:1,kpsSpawned:!!flags.kpsSpawned,spawnAt:time,lastHitAt:time,burnTime:0,burnDps:0,cullTimer:0};
    if(kind==="final"){
      const phaseConfig=isBossChallengeMode()&&type==="reaper"
        ?{hp:[900900,1310400,1965600],defense:[399,554,738]}
        :finalBossPhaseConfig(type);
      const challengeBossZone=isBossChallengeMode()&&bossChallengeSourceStage>=6&&type!=="reaper"?3:0;
      const stageBossDifficultyMult=!isInfiniteMode()&&!isBossChallengeMode()?stageDifficultyMonsterMultiplier(currentStage):1;
      const hpScale=(isInfiniteMode()?(infiniteBossZone>10?infiniteBossHpMultiplier(Math.max(0,infiniteBossZone)):1):(challengeBossZone?infiniteBossHpMultiplier(challengeBossZone):1))*stageBossDifficultyMult;
      const defenseScale=isInfiniteMode()?(infiniteBossZone>10?Math.max(0,infiniteBossZone)*4:0):challengeBossZone*4;
      enemy.finalPhaseHp=phaseConfig.hp.map(value=>Math.round(value*hpScale));
      enemy.finalPhaseDefense=phaseConfig.defense.map(value=>Math.round((value+defenseScale)*stageBossDifficultyMult));
      applyFinalBossPhase(enemy,0);
    }
    enemies.push(enemy);
  }

  function normalStageEnemyPool(stage,elapsed=time){
    if(stage===11)return elapsed<60?["voidling","darkeye"]:elapsed<240?["voidling","darkeye","riftcrawler"]:["voidling","darkeye","riftcrawler","starlessknight","gravityorb"];
    if(stage===10)return elapsed<60?["cograt","secondhand"]:elapsed<240?["cograt","secondhand","pendulumshade"]:["cograt","secondhand","pendulumshade","clockguard","nightclockmage"];
    if(stage===9)return elapsed<60?["bubblejelly","tideeel"]:elapsed<240?["bubblejelly","tideeel","spearurchin"]:["bubblejelly","tideeel","spearurchin","reefcrab","ruinguard"];
    if(stage===8)return elapsed<60?["embermite","forgeimp"]:elapsed<240?["embermite","forgeimp","magmaworm"]:["embermite","forgeimp","magmaworm","slagguard","coalroller"];
    if(stage===7)return elapsed<60?["windupsoldier","toyplane"]:elapsed<240?["windupsoldier","toyplane","springfist"]:["windupsoldier","toyplane","springfist","blockgolem","teddybear"];
    if(stage===6)return elapsed<60?["tinygummy","cookieguard"]:elapsed<240?["tinygummy","cookieguard","jamgummy"]:["tinygummy","cookieguard","jamgummy","creampuff","gingerchef"];
    if(stage===5)return elapsed<60?["ghostfire","nighthawk"]:elapsed<240?["ghostfire","nighthawk","poisonvine"]:["ghostfire","poisonvine","nighthawk","oldwood","witch"];
    if(stage===4)return elapsed<60?["poisonmush","blackslime"]:elapsed<240?["poisonmush","blackslime","leafcrow"]:["poisonmush","blackslime","leafcrow","vine","barkguard"];
    if(stage===3)return elapsed<60?["penguin","seal"]:elapsed<240?["penguin","seal","snowman"]:["penguin","seal","snowman","polarbear"];
    return stage===2
      ?(elapsed<60?["snake","mouse"]:elapsed<240?["snake","mouse","vulture"]:["snake","mouse","vulture","centipede","scorpion"])
      :(elapsed<60?["turtle","mushroom"]:elapsed<240?["turtle","mushroom","bombcloud"]:["turtle","mushroom","bombcloud","plant"]);
  }

  function enemyPoolForCurrentTime(){
    if(isEventMode())return activityEnemyPool();
    if(!isInfiniteMode())return normalStageEnemyPool(currentStage,time);
    const stage=infiniteStageForZone();
    if(stage>=1&&stage<=11)return normalStageEnemyPool(stage,infiniteZoneElapsed());
    return ["skeleton","wisp","bat","eyeball","imp"];
  }

  function bossTypeForZone(zone){
    if(zone===0)return "plant";
    if(zone===1)return "stoneface";
    if(zone===2)return "whale";
    if(zone===3)return "rottenwood";
    if(zone===4)return "shadowtree";
    if(zone===5)return "cookiemonarch";
    if(zone===6)return "nightmaremaker";
    if(zone===7)return "lavagolem";
    if(zone===8)return "abyssoctopus";
    if(zone===9)return "clockwitch";
    if(zone===10)return "voiddevourer";
    return "reaper";
  }

  function normalFinalBossType(){
    if(isBossChallengeMode())return bossChallengeType;
    if(currentStage===11)return "voiddevourer";
    if(currentStage===10)return "clockwitch";
    if(currentStage===9)return "abyssoctopus";
    if(currentStage===8)return "lavagolem";
    if(currentStage===7)return "nightmaremaker";
    if(currentStage===6)return "cookiemonarch";
    if(currentStage===5)return "shadowtree";
    if(currentStage===4)return "rottenwood";
    if(currentStage===3)return "whale";
    if(currentStage===2)return "stoneface";
    return "plant";
  }

  function normalMidBossType(slot=0,sec=0){
    if(currentStage===11)return slot%2?"gravityorb":"starlessknight";
    if(currentStage===10)return slot%2?"nightclockmage":"clockguard";
    if(currentStage===9)return slot%2?"ruinguard":"reefcrab";
    if(currentStage===8)return slot%2?"coalroller":"slagguard";
    if(currentStage===7)return slot%2?"teddybear":"blockgolem";
    if(currentStage===6)return slot%2?"creampuff":"gingerchef";
    if(currentStage===5)return slot%2?"oldwood":"witch";
    if(currentStage===4)return slot%2?"barkguard":"vine";
    if(currentStage===3)return sec===360||slot%2?"polarbear":"snowman";
    if(currentStage===2)return sec===360||slot%2?"scorpion":"vulture";
    return sec===360||slot%2?"plant":"bombcloud";
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
  function spawnSilentWave(count,kind="normal"){
    const types=enemyPoolForCurrentTime();
    const finalCount=Math.ceil(count*(killSurgeActive&&kind==="normal"?KILL_SURGE_WAVE_MULTIPLIER:1));
    for(let i=0;i<finalCount;i++)spawnEnemy(types[Math.floor(Math.random()*types.length)],kind);
  }
  function timedStageMinuteEvent(minute){
    if(minute===1)return {title:"怪潮來襲！",body:"大量魔物開始湧入戰場",normal:12,elite:0,color:"#ffe45f"};
    if(minute===2)return {title:"菁英怪出現！",body:"怪潮之中出現 2 隻菁英怪",normal:14,elite:2,color:"#ff826b"};
    if(minute===3)return {title:"怪物暴走！",body:"魔物攻勢變得更加猛烈",normal:18,elite:0,color:"#ffb35c"};
    if(minute===4)return {title:"危險氣息逼近！",body:"怪潮之中出現 3 隻菁英怪",normal:18,elite:3,color:"#ff826b"};
    if(minute===5)return {title:"首領現身！",body:"小首領加入戰場，請小心應戰",normal:20,elite:0,boss:true,color:"#ff775e"};
    if(minute===6)return {title:"魔物大軍壓境！",body:"怪潮之中出現 4 隻菁英怪",normal:22,elite:4,color:"#ffb35c"};
    if(minute===7)return {title:"狂暴菁英降臨！",body:"5 隻狂暴菁英怪加入戰場",normal:24,elite:5,color:"#ff6978"};
    if(minute===8)return {title:"戰場陷入混亂！",body:"怪潮與 5 隻菁英怪同時進攻",normal:26,elite:5,color:"#ffb35c"};
    if(minute===9)return {title:"災厄即將降臨！",body:"決戰前的最後怪潮開始湧現",normal:28,elite:0,color:"#ff596f"};
    return null;
  }

  function timeline(){
    const sec=Math.floor(time);
    if(isBossChallengeMode())return;
    if(isEventMode()){
      if(sec>0&&sec%30===0&&!timeline.seen.has("event-wave"+sec)){
        timeline.seen.add("event-wave"+sec);
        spawnWave(8+Math.floor(sec/30)*2);
      }
      if(sec>=EVENT_DURATION&&!timeline.seen.has("event-boss")){
        timeline.seen.add("event-boss");
        spawnEnemy(isActivityTrialMode()?"chestmimic":EVENT_BOSS_TYPE,"boss");
        if(isActivityTrialMode())announce("強化試煉寶箱怪出現！","擊敗後結算活動兌換幣","#67d9ff",4);
        else announce("胡鬧的胡蘿蔔出現！","擊敗後會掉落神秘胡蘿蔔種子","#ffd45e",4);
      }
      return;
    }
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
    if(usesTimedMonsterBudget()){
      const minute=Math.floor(sec/60);
      if(minute>=1&&minute<=9&&sec===minute*60&&!timeline.seen.has("timed-minute-"+minute)){
        timeline.seen.add("timed-minute-"+minute);
        const event=timedStageMinuteEvent(minute);
        if(event){
          if(event.normal>0)spawnSilentWave(event.normal,"normal");
          if(event.elite>0)spawnSilentWave(event.elite,"elite");
          if(event.boss)spawnEnemy(normalMidBossType(Math.max(1,minute/5|0),sec),"boss");
          announce(event.title,event.body,event.color,4);
          beep(event.elite>0||event.boss?130:180,.35,.045,event.elite>0?"sawtooth":"triangle");
        }
      }
      if(sec>=DURATION&&!timeline.seen.has("final")){
        timeline.seen.add("final");
        beginFinalBossEntrance();
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
        spawnEnemy(normalMidBossType(0,sec),"boss");
        announce("BOSS 出現！",`${currentStageLabel()}強敵正在逼近`,"#ff775e");
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
        spawnEnemy(normalMidBossType(bossSlot),"boss");
        announce("終盤 BOSS 出現！","高威脅敵人加入戰場","#ff775e");
      }
    }

    if(sec>=DURATION&&!timeline.seen.has("final")){
      timeline.seen.add("final");
      beginFinalBossEntrance();
    }
  }
  timeline.seen=new Set();

  function bossArenaSourceStage(){
    return isBossChallengeMode()?bossChallengeSourceStage:currentStage;
  }

  function isForestBossArena(){
    const stage=bossArenaSourceStage();
    return bossArena.active&&!isInfiniteMode()&&(stage===4||stage===5);
  }

  function setupBossObstacles(){
    bossObstacles=[];
    if(!bossArena.active||isInfiniteMode())return;
    const stage=bossArenaSourceStage();
    if(stage===4||stage===5){
    const lower=stage===5;
    const list=lower
      ?[
        [-235,-120,34,70,1.05],[-100,-245,32,66,.95],[115,-230,34,70,1.05],
        [235,-76,36,72,1.1],[-210,152,34,70,1.0],[92,218,36,72,1.12]
      ]
      :[
        [-220,-135,32,66,.98],[205,-115,34,70,1.05],
        [-192,142,34,70,1.0],[218,154,32,66,.98]
      ];
    bossObstacles=list.map(([ox,oy,w,h,leaf])=>({
      x:bossArena.x+ox,y:bossArena.y+oy,w,h,leaf,
      dark:lower,kind:"tree"
    }));
      return;
    }
    const stageObstacles={
      8:[
        [-210,-130,54,62,"forge"],[205,-115,52,66,"forge"],
        [-170,170,46,58,"anvil"],[175,188,48,58,"anvil"]
      ],
      9:[
        [-225,-112,48,92,"ruin"],[220,-88,46,88,"ruin"],
        [-170,190,54,82,"coral"],[120,220,50,84,"ruin"],[0,-235,62,46,"coral"]
      ],
      10:[
        [-225,-95,52,72,"gear"],[215,-132,54,76,"gear"],
        [-185,178,50,70,"pendulum"],[170,190,50,70,"pendulum"],[0,-225,70,44,"gear"]
      ],
      11:[
        [-220,-135,50,86,"void"],[225,-118,50,86,"void"],
        [-175,170,48,78,"crystal"],[170,190,48,78,"crystal"],[0,-245,72,42,"void"]
      ]
    }[stage];
    if(!stageObstacles)return;
    bossObstacles=stageObstacles.map(([ox,oy,w,h,kind])=>({
      x:bossArena.x+ox,y:bossArena.y+oy,w,h,kind
    }));
  }

  function resolveBossObstacles(entity,radius){
    if(!bossObstacles.length)return;
    for(const o of bossObstacles){
      const left=o.x-o.w/2,right=o.x+o.w/2,top=o.y-o.h/2,bottom=o.y+o.h/2;
      const cx=clamp(entity.x,left,right),cy=clamp(entity.y,top,bottom);
      let dx=entity.x-cx,dy=entity.y-cy;
      let d2=dx*dx+dy*dy;
      if(d2>=radius*radius)continue;
      if(d2<.0001){
        const pushX=Math.min(Math.abs(entity.x-left),Math.abs(entity.x-right));
        const pushY=Math.min(Math.abs(entity.y-top),Math.abs(entity.y-bottom));
        if(pushX<pushY){dx=entity.x<o.x?-1:1;dy=0;}
        else{dx=0;dy=entity.y<o.y?-1:1;}
        d2=1;
      }
      const d=Math.sqrt(d2);
      const push=(radius-d)+.5;
      entity.x+=dx/d*push;
      entity.y+=dy/d*push;
    }
  }

  function drawBossObstacles(layer="trunk"){
    if(!bossObstacles.length)return;
    for(const o of bossObstacles){
      const p=worldToScreen(o.x,o.y);
      if(o.kind&&o.kind!=="tree"){
        if(layer!=="trunk")continue;
        ctx.save();
        ctx.globalAlpha=.32;
        ctx.fillStyle="#05040a";
        ctx.beginPath();
        ctx.ellipse(p.x,p.y+o.h/2+5,o.w*.72,8,0,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha=1;
        if(o.kind==="forge"){
          rect(p.x-o.w/2,p.y-o.h/2,o.w,o.h,"#51352c");
          rect(p.x-o.w/2+5,p.y-o.h/2+5,o.w-10,10,"#bb6a36");
          rect(p.x-o.w/2+8,p.y+o.h/2-18,o.w-16,8,"#ff7d31");
          rect(p.x-o.w/2+12,p.y-o.h/2+20,8,o.h-28,"#2a1b18");
        }else if(o.kind==="anvil"){
          rect(p.x-o.w/2,p.y-o.h/2+14,o.w,24,"#5f6770");
          rect(p.x-o.w/2+8,p.y-o.h/2+6,o.w-16,10,"#828b92");
          rect(p.x-10,p.y+o.h/2-20,20,22,"#3b3f45");
        }else if(o.kind==="ruin"){
          rect(p.x-o.w/2,p.y-o.h/2,o.w,o.h,"#35556a");
          rect(p.x-o.w/2+5,p.y-o.h/2+6,o.w-10,8,"#80b6c8");
          rect(p.x-o.w/2+8,p.y-o.h/2+26,o.w-16,7,"#203947");
          rect(p.x-o.w/2+6,p.y+o.h/2-14,o.w-12,8,"#6aa1b8");
        }else if(o.kind==="coral"){
          rect(p.x-o.w/2+8,p.y-o.h/2+10,o.w-16,o.h-18,"#244d60");
          rect(p.x-o.w/2+2,p.y-o.h/2+20,10,30,"#61d1e8");
          rect(p.x+o.w/2-12,p.y-o.h/2+16,10,38,"#52a6c9");
          rect(p.x-8,p.y-o.h/2,16,16,"#8be8ff");
        }else if(o.kind==="gear"){
          ctx.fillStyle="#6b563c";
          ctx.beginPath();
          ctx.arc(p.x,p.y,o.w*.45,0,Math.PI*2);
          ctx.fill();
          ctx.fillStyle="#2c2330";
          ctx.beginPath();
          ctx.arc(p.x,p.y,o.w*.22,0,Math.PI*2);
          ctx.fill();
          for(let i=0;i<8;i++){
            const a=i*Math.PI/4;
            rect(p.x+Math.cos(a)*o.w*.42-5,p.y+Math.sin(a)*o.w*.42-5,10,10,"#b08a48");
          }
        }else if(o.kind==="pendulum"){
          rect(p.x-8,p.y-o.h/2,16,o.h,"#3b2a44");
          rect(p.x-o.w/2,p.y+o.h/2-20,o.w,18,"#9e7448");
          rect(p.x-o.w/2+6,p.y+o.h/2-15,o.w-12,5,"#ffd66a");
        }else if(o.kind==="void"){
          rect(p.x-o.w/2,p.y-o.h/2,o.w,o.h,"#171028");
          rect(p.x-o.w/2+6,p.y-o.h/2+8,o.w-12,o.h-16,"#311454");
          rect(p.x-4,p.y-o.h/2+8,8,o.h-16,"#9c57ff");
          rect(p.x-o.w/2+10,p.y+o.h/2-14,o.w-20,6,"#05020d");
        }else if(o.kind==="crystal"){
          ctx.fillStyle="#271145";
          ctx.beginPath();
          ctx.moveTo(p.x,p.y-o.h/2);
          ctx.lineTo(p.x+o.w/2,p.y-4);
          ctx.lineTo(p.x+o.w*.18,p.y+o.h/2);
          ctx.lineTo(p.x-o.w*.28,p.y+o.h/2-8);
          ctx.lineTo(p.x-o.w/2,p.y-2);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha=.82;
          rect(p.x-4,p.y-o.h/2+10,8,o.h-24,"#d17cff");
        }
        ctx.restore();
        continue;
      }
      const leafW=52*o.leaf,leafH=42*o.leaf;
      if(layer==="canopy"){
        ctx.save();
        ctx.globalAlpha=.88;
        ctx.fillStyle=o.dark?"#152318":"#214627";
        ctx.beginPath();
        ctx.ellipse(p.x,p.y-o.h/2-19*o.leaf,leafW*.5,leafH*.42,0,0,Math.PI*2);
        ctx.ellipse(p.x-leafW*.24,p.y-o.h/2-7*o.leaf,leafW*.34,leafH*.34,0,0,Math.PI*2);
        ctx.ellipse(p.x+leafW*.25,p.y-o.h/2-6*o.leaf,leafW*.36,leafH*.36,0,0,Math.PI*2);
        ctx.ellipse(p.x,p.y-o.h/2+4*o.leaf,leafW*.42,leafH*.32,0,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha=.35;
        ctx.fillStyle=o.dark?"#2f5630":"#3f7a3c";
        ctx.fillRect(p.x-18*o.leaf,p.y-o.h/2-18*o.leaf,9*o.leaf,5*o.leaf);
        ctx.fillRect(p.x+12*o.leaf,p.y-o.h/2-2*o.leaf,12*o.leaf,5*o.leaf);
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.globalAlpha=.28;
      ctx.fillStyle="#06040a";
      ctx.beginPath();
      ctx.ellipse(p.x,p.y+o.h/2+4,o.w*.78,8,0,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
      rect(p.x-o.w/2,p.y-o.h/2,o.w,o.h,o.dark?"#3d2b24":"#60422a");
      rect(p.x-o.w/2+5,p.y-o.h/2+6,6,o.h-12,o.dark?"#6b4a35":"#8a6240");
      rect(p.x+o.w/2-9,p.y-o.h/2+12,4,o.h-18,o.dark?"#2b1d19":"#3f2c1e");
      ctx.restore();
    }
  }

  function beginFinalBossEntrance(){
    finalPhase="warning";
    finalTimer=4.2;
    if(isInfiniteMode())infiniteDisplayFreezeStart=(Math.floor(time/600)+1)*600;
    bossArena.active=true;
    bossArena.zone=isInfiniteMode()?infiniteBossZone:effectiveZone();
    bossArena.x=player.x;
    bossArena.y=player.y;
    bossObstacles=[];
    setupBossObstacles();
    clearPooledShots(shots);
    enemies=[];gems=[];shots=[];petShots=[];bananas=[];enemyShots=[];areas=[];
    effects=effects.filter(e=>e.kind==="flash");
    announcements=[];activeAnnouncement=null;
    effects.push({kind:"flash",life:.28});
    beep(72,1,.075,"sawtooth");
  }

  function spawnFinalBoss(){
    spawnEnemy(isInfiniteMode()?bossTypeForZone(infiniteBossZone):normalFinalBossType(),"final");
    const boss=enemies[enemies.length-1];
    boss.x=bossArena.x+Math.min(210,bossArena.r*.58);
    boss.y=bossArena.y;
    finalPhase="fight";
    const bossName=boss.type==="nightmaremaker"?"發條夢魘師！":boss.type==="cookiemonarch"?"奶油餅乾女王！":boss.type==="shadowtree"?"幽影樹王！":boss.type==="rottenwood"?"腐木樹衛！":boss.type==="whale"?"暴雪鯨魚！":boss.type==="reaper"?"惡魔死神！":boss.type==="stoneface"?"遠古石面怪！":"霸王食人花！";
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
      sharedTargetTimer=computeTargetTTL();
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
    const bossFight=finalPhase==="fight";
    pendingCarrotShots=Math.max(1,Math.min(6,player.projectiles));
    carrotVolley++;
    if(!bossFight&&player.projectiles>=6&&giantCarrotCooldown<=0){
      const target=getSharedTarget();
      if(target){
        const a=Math.atan2(target.y-player.y,target.x-player.x);
        const shot=resetShot(acquireShot());
        shot.kind="giant";shot.x=player.x;shot.y=player.y;shot.vx=Math.cos(a)*330;shot.vy=Math.sin(a)*330;
        shot.r=18*player.area;shot.life=2.2;shot.damage=player.damage*12.8*player.areaDamage;shot.pierce=0;shot.angle=a;
        shots.push(shot);
        giantCarrotCooldown=3;
      }
    }
    return true;
  }

  function fireCarrotShot(){
    const targetInfo=pickReservedAwareTarget(player.damage*player.areaDamage);
    const target=targetInfo.target;
    const bossFight=finalPhase==="fight";
    const volleyCount=Math.max(1,Math.min(6,player.projectiles));
    const volleyIndex=Math.max(0,Math.min(volleyCount-1,volleyCount-pendingCarrotShots));
    const spreadStep=bossFight?0:(volleyCount<=1?0:0.095);
    const spreadOffset=volleyCount<=1?0:(volleyIndex-(volleyCount-1)/2)*spreadStep;
    let angle;
    if(target)angle=Math.atan2(target.y-player.y,target.x-player.x)+spreadOffset+rand(-.01,.01);
    else angle=(player.facing<0?Math.PI:0)+spreadOffset+rand(-.01,.01);
    const shot=resetShot(acquireShot());
    shot.x=player.x;shot.y=player.y;
    shot.vx=Math.cos(angle)*520;shot.vy=Math.sin(angle)*520;
    shot.r=6;shot.life=1.8;
    shot.damage=player.damage*player.areaDamage;shot.pierce=bossFight?0:player.pierce;shot.angle=angle;
    shot.reservedTargetId=target&&!("opened" in target)?target.id:0;
    shot.reservedDamage=targetInfo.reservedAmount||0;
    if(bossFight&&target&&!("opened" in target)){
      const baseAngle=Math.atan2(target.y-player.y,target.x-player.x);
      const fan=volleyCount<=1?0:1.22;
      const fanStep=volleyCount<=1?0:fan/(volleyCount-1);
      const curveOffset=(volleyIndex-(volleyCount-1)/2)*fanStep;
      const launchAngle=baseAngle+curveOffset;
      const d=Math.max(80,Math.hypot(target.x-player.x,target.y-player.y));
      const controlDist=clamp(d*.58,90,280);
      const duration=clamp(d/570,.38,.92);
      shot.curveBoss=true;
      shot.curveAge=0;
      shot.curveDuration=duration;
      shot.sx=player.x;
      shot.sy=player.y;
      shot.cx=player.x+Math.cos(launchAngle)*controlDist;
      shot.cy=player.y+Math.sin(launchAngle)*controlDist;
      shot.tx=target.x;
      shot.ty=target.y;
      shot.vx=Math.cos(launchAngle)*520;
      shot.vy=Math.sin(launchAngle)*520;
      shot.angle=launchAngle;
      shot.life=duration+.45;
    }
    shots.push(shot);
  }

  function firePet(){
    const target=getSharedTarget();if(!target)return;
    const a=Math.atan2(target.y-player.y,target.x-player.x);
    const evolved=skills.peanut>=5;
    petShots.push({
      kind:evolved?"rolling":"stone",x:player.x-28,y:player.y+22,
      vx:Math.cos(a)*(evolved?300:390),vy:Math.sin(a)*(evolved?300:390),
      r:(evolved?15:6)*player.area,life:evolved?3.4:2,damage:peanutSkillDamage(),
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
      r:8*(level>=5?1.35:1)*player.area,damage:pinkySkillDamage(level),
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
    compactArray(bananas,b=>!b.dead);
  }

  function rollEnemyDamage(e,amount,critical=false,source="normal"){
    if(source!=="chestBomb"){
      amount*=pinkyBoostTimer>0?pinkyDamageBoost:1;
      const variance=rand(.01,.05)*(Math.random()<.5?-1:1);
      amount*=1+variance;
      if(critical)amount*=1+rand(.01,.10);
    }
    if(source!=="chestBomb"){
      const ignored=Math.min(MAX_TOTAL_ARMOR_PEN,player.armorPen);
      const effectiveDefense=(e.defense||0)*(1-ignored);
      amount*=100/(100+effectiveDefense);
    }
    return amount;
  }

  function finishEnemyDamage(e,amount,source="normal"){
    e.lastHitAt=time;
    e.hp-=amount;e.hit=.1;
    if(e.kind==="final"&&e.hp<=0&&e.bars>1){
      e.bars--;
      applyFinalBossPhase(e,e.totalBars-e.bars);
      if(e.type==="whale"&&e.bars===1)e.shoot=5;
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

  function damageEnemy(e,amount,critical=false,source="normal"){
    amount=rollEnemyDamage(e,amount,critical,source);
    const silentDamage=source==="giantBurn";
    if(!silentDamage){
      const textKind=critical?"critical":(e.kind==="boss"||e.kind==="final"?"boss":"normal");
      text(e.x,e.y-e.r,critical?formatCriticalDamage(amount):Math.round(amount),critical?"#ffe45f":"#fff",critical?19:14,textKind);
      if(critical)playCritSample(.5,1+rand(-.04,.04));
    }
    finishEnemyDamage(e,amount,source);
  }

  function luminousSlashLevel(){
    return Math.max(0,Math.min(5,Math.floor(Number(skills.luminousSlash)||0)));
  }
  function luminousSlashChance(){
    return LUMINOUS_SLASH_CHANCES[luminousSlashLevel()]||0;
  }
  function luminousSlashAvailable(){
    return hasWholeCarrotEquipped()&&luminousSlashLevel()>0;
  }
  function luminousSlashActive(){
    return luminousSlashAvailable()&&luminousSlashActiveTimer>0;
  }
  function updateLuminousSlash(dt){
    if(luminousSlashActiveTimer>0)luminousSlashActiveTimer=Math.max(0,luminousSlashActiveTimer-dt);
    if(luminousSlashCooldownTimer>0)luminousSlashCooldownTimer=Math.max(0,luminousSlashCooldownTimer-dt);
  }
  function activateLuminousSlash(){
    if(!luminousSlashAvailable()||luminousSlashCooldownTimer>0)return false;
    luminousSlashActiveTimer=LUMINOUS_SLASH_DURATION;
    luminousSlashCooldownTimer=LUMINOUS_SLASH_DURATION+LUMINOUS_SLASH_COOLDOWN;
    announce("流光二連斬","小胡蘿蔔命中時有機率追加二連斬","#78dcff",2.2);
    text(player.x,player.y-58,"流光二連斬啟動","#7fe8ff",20,"pickup");
    beep(960,.12,.04,"triangle");
    return true;
  }
  function triggerLuminousSlashOnHit(e,baseDamage,source="normal"){
    if(!luminousSlashActive()||Math.random()>=luminousSlashChance())return false;
    const first=rollEnemyDamage(e,baseDamage*player.critDamage,true,source);
    const second=rollEnemyDamage(e,baseDamage*player.critDamage,true,source);
    const total=first+second;
    spawnLuminousSlashEffects(e);
    text(e.x,e.y-e.r-10,`${Math.max(0,Math.round(total))}!`,"#ffe75f",19,"luminousCritical");
    playCritSample(.65,1.08+rand(-.03,.03));
    finishEnemyDamage(e,total,"luminousSlash");
    return true;
  }
  function spawnLuminousSlashEffects(e){
    const cfg=LUMINOUS_SLASH_CONFIG;
    const base={kind:"luminousSlash",x:e.x,y:e.y,r:Math.max(120,e.r+110),maxLife:cfg.singleDuration,life:cfg.singleDuration,drawSec:cfg.drawSec,scale:cfg.imageScale,opacity:cfg.imageOpacity,anchorX:cfg.imageAnchorX,anchorY:cfg.imageAnchorY};
    effects.push({...base,delay:0,angle:(cfg.rightAngleDeg+cfg.baseRotationDeg)*Math.PI/180,fadeIn:cfg.rightFadeIn,fadeOut:cfg.rightFadeOut});
    effects.push({...base,delay:cfg.secondDelay,angle:(cfg.leftAngleDeg+cfg.baseRotationDeg)*Math.PI/180,fadeIn:cfg.leftFadeIn,fadeOut:cfg.leftFadeOut});
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
      const config=performanceConfig();
      if(config.orbitHalfEffects){
        effects.push(
          {kind:"half",x:e.x-e.r*.25,y:e.y,vx:-90,vy:-70,life:.55,r:e.r,color:enemyData[e.type].color,side:-1},
          {kind:"half",x:e.x+e.r*.25,y:e.y,vx:90,vy:-70,life:.55,r:e.r,color:enemyData[e.type].color,side:1}
        );
      }
    }
    if(isEventMode()&&isActivityBossType(e.type)){
      win();
      return;
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
    bossObstacles=[];
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
    const autoPicking=autoTrainingActive||(devModeActive&&devAutoUpgrade);
    levelScreen.classList.toggle("autoTrainingLocked",autoPicking);
    if(autoTrainingGuard){
      autoTrainingGuard.classList.toggle("hidden",!autoPicking);
      autoTrainingGuard.textContent=autoTrainingActive?"自動選擇技能中...":"開發模式自動選技中...";
    }
    const pool=upgrades.filter(u=>{
      if(u.basic&&upgradeLevels[u.id]>=BASIC_UPGRADE_CAP)return false;
      if(u.cap&&upgradeLevels[u.id]>=u.cap)return false;
      return !u.valid||u.valid();
    }),picked=[];
    while(picked.length<4&&pool.length){const i=Math.floor(Math.random()*pool.length);picked.push(pool.splice(i,1)[0]);}
    if(!picked.length){
      levelQueue=0;
      levelScreen.classList.add("hidden");
      levelScreen.classList.remove("autoTrainingLocked");
      if(autoTrainingGuard)autoTrainingGuard.classList.add("hidden");
      paused=false;
      updateMonitorButtons();
      return;
    }
    for(const u of picked){
      const card=document.createElement("div");card.className="choice";
      let current="";
      let nextLevelLabel=u.name;
      let descText=u.desc;
      if(["orbit","burst","peanut","pinky","brain","luminousSlash"].includes(u.id))current=`目前 LV${skills[u.id]}/5`;
      if(["orbit","burst","peanut","pinky","brain","luminousSlash"].includes(u.id))nextLevelLabel=`${u.name} LV${Math.min(5,skills[u.id]+1)}`;
      else if(u.id==="multi"){current=`目前 ${player.projectiles}/6 支`;nextLevelLabel=`同步發射 LV${Math.min(5,upgradeLevels.multi+1)}`;}
      else if(u.cap){current=`目前 LV${upgradeLevels[u.id]}/${u.cap}`;nextLevelLabel=`${u.name} LV${Math.min(u.cap,upgradeLevels[u.id]+1)}`;}
      else if(u.basic){current=`目前 LV${upgradeLevels[u.id]}/${BASIC_UPGRADE_CAP}`;nextLevelLabel=`${u.name} LV${Math.min(BASIC_UPGRADE_CAP,upgradeLevels[u.id]+1)}`;}
      if(u.id==="brain"){
        const nextGain=Math.round(([40,60,80,100,120][skills.brain]||0));
        descText=`+${nextGain}% 經驗獲取`;
      }
      if(u.id==="luminousSlash"){
        const nextLevel=Math.min(5,skills.luminousSlash+1);
        descText=`主動20秒・冷卻60秒・小胡蘿蔔命中 ${Math.round((LUMINOUS_SLASH_CHANCES[nextLevel]||0)*100)}% 發動二連斬`;
      }
      card.innerHTML=`<span class="icon">${u.icon}</span><b>${nextLevelLabel}</b><small>${descText}<br>${current}</small>`;
      card.onclick=()=>{
        if(levelScreen.classList.contains("autoTrainingLocked")&&!card.dataset.autoPick)return;
        u.apply();
        if(Object.hasOwn(upgradeLevels,u.id))upgradeLevels[u.id]++;
        levelQueue--;
        if(!gems.length){magnetAll=false;magnetTimer=0;}
        levelScreen.classList.add("hidden");
        paused=false;
        updateMonitorButtons();
        beep(660,.1,.04);
        levelScreen.classList.remove("autoTrainingLocked");
        if(autoTrainingGuard)autoTrainingGuard.classList.add("hidden");
        if(levelQueue)setTimeout(showLevelUp,80);
      };
      choicesEl.appendChild(card);
    }
    if(autoPicking&&picked.length){
      const cards=[...choicesEl.querySelectorAll(".choice")];
      const pickIndex=chooseAutoSkillCardIndex(picked);
      setTimeout(()=>{
        if(paused&&!levelScreen.classList.contains("hidden")&&cards[pickIndex]){
          cards[pickIndex].dataset.autoPick="1";
          cards[pickIndex].click();
        }
      },autoTrainingActive?520:420);
    }else{
      levelScreen.classList.remove("autoTrainingLocked");
      if(autoTrainingGuard)autoTrainingGuard.classList.add("hidden");
    }
  }
  function autoSkillPriorityLevel(id){
    if(id==="burst")return skills.burst;
    return upgradeLevels[id]||0;
  }
  function chooseAutoSkillCardIndex(picked){
    const priority=[
      {id:"damage",target:5},
      {id:"burst",target:1},
      {id:"pierce",target:5},
      {id:"multi",target:5}
    ];
    for(const rule of priority){
      if(autoSkillPriorityLevel(rule.id)>=rule.target)continue;
      const index=picked.findIndex(u=>u.id===rule.id);
      if(index>=0)return index;
    }
    return Math.floor(Math.random()*picked.length);
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
    compactArray(pickups,p=>!p.dead);
  }

  function updateChests(dt,moved){
    let recycled=false;
    compactArray(chests,chest=>{
      if(outsideNineGrid(chest.x,chest.y,chest.r+28)){
        recycled=true;
        return false;
      }
      return true;
    });
    if(recycled)chestClock=Math.max(chestClock,10);
    let unopened=0;
    for(const chest of chests)if(!chest.opened)unopened++;
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
    compactArray(chests,c=>!c.opened||c.rewardLife>0);
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
    if(confuseTimer>0){dx*=-1;dy*=-1;}
    let moved=0;
    if(stunTimer<=0&&(dx||dy)){
      const l=Math.hypot(dx,dy),strength=Math.min(1,l);
      dx/=l;dy/=l;
      const blizzardMove=blizzardTimer>0?.7:1;
      moved=player.speed*(pinkyBoostTimer>0?(skills.pinky>=5?1.25:1.15):1)*blizzardMove*dt*strength;
      player.x+=dx*moved;player.y+=dy*moved;
      if(dx)player.facing=Math.sign(dx);
    }
    if(blizzardTimer>0){
      blizzardTimer=Math.max(0,blizzardTimer-dt);
      blizzardPushTimer-=dt;
      if(blizzardPushTimer<=0){
        blizzardPushTimer=rand(.55,1.15);
        blizzardPushAngle=Math.random()*Math.PI*2;
        blizzardPushSpeed=rand(12,32);
      }
      player.x+=Math.cos(blizzardPushAngle)*blizzardPushSpeed*dt;
      player.y+=Math.sin(blizzardPushAngle)*blizzardPushSpeed*dt;
    }
    if(bossArena.active){
      const ax=player.x-bossArena.x,ay=player.y-bossArena.y,d=Math.hypot(ax,ay),limit=bossArena.r-player.r-18;
      if(d>limit){player.x=bossArena.x+ax/d*limit;player.y=bossArena.y+ay/d*limit;}
      if(isInfiniteMode()&&infiniteStageForZone(bossArena.zone)===0&&d>bossArena.r-58)hurtPercent(.08);
      resolveBossObstacles(player,player.r);
    }
    updateChests(dt,moved);
    if(player.regen||player.regenFlat){
      const blizzardRegen=blizzardTimer>0?.8:1;
      player.hp=Math.min(player.maxHp,player.hp+((player.regenFlat*player.regenBoost)+player.maxHp*player.regen)*blizzardRegen*dt);
    }
    if(poisonTimer>0){
      poisonTimer=Math.max(0,poisonTimer-dt);
      player.hp-=player.maxHp*poisonRate*dt;
      if(isDevProtectedRun())player.hp=Math.max(1,player.hp);
      else if(player.hp<=0)lose();
    }
    stunTimer=Math.max(0,stunTimer-dt);
    confuseTimer=Math.max(0,confuseTimer-dt);
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
        const waveDamage=burstSkillDamage();
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
      const farBucket=((e.id||enemyIndex)+Math.floor(time*60))%computeOffScreenDiv();
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
      if(bossArena.active)resolveBossObstacles(e,e.r);
      if(dist(e,player)<e.r+player.r){
        hurt(e.damage);
      }
      const sourceStage=isBossChallengeMode()?bossChallengeSourceStage:currentStage;
      const ranged=e.type==="plant"&&sourceStage!==1;
      if(ranged&&e.shoot<=0&&dist(e,player)<650){
        const shotSpeed=e.kind==="normal"?185:e.kind==="elite"?225:250;
        enemyShots.push({kind:"normal",x:e.x,y:e.y,vx:Math.cos(a)*shotSpeed,vy:Math.sin(a)*shotSpeed,r:e.kind==="normal"?7:10,damage:e.damage*.55,life:4,poison:0});
        e.shoot=e.kind==="normal"?rand(2.1,3.2):e.kind==="elite"?rand(1.3,2):rand(.8,1.35);
      }
      if(isEventMode()&&isActivityBossType(e.type)&&e.shoot<=0&&dist(e,player)<720){
        const spread=e.kind==="boss"?5:3;
        const center=Math.atan2(player.y-e.y,player.x-e.x);
        for(let i=0;i<spread;i++){
          const q=center+(i-(spread-1)/2)*.16;
          enemyShots.push({kind:e.type===EVENT_BOSS_TYPE?"seed":"coin",x:e.x,y:e.y,vx:Math.cos(q)*210,vy:Math.sin(q)*210,r:8,damage:e.damage*.45,life:4,poison:0});
        }
        e.shoot=e.kind==="boss"?1.35:2.2;
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
      if(e.kind==="final"&&e.type==="plant"&&sourceStage!==1){
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
        if(e.bars===1&&e.shoot<=0){
          e.shoot=5;
          blizzardTimer=10;
          blizzardPushTimer=0;
          text(player.x,player.y-62,"零度暴風雪！","#d8f6ff",20,"boss");
          beep(118,.38,.045,"triangle");
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
      if(e.kind==="final"&&e.type==="cookiemonarch"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?3.2:e.bars===2?3.8:4.6;
          const pressCount=e.bars===1?1:e.bars===2?3:5;
          const r=e.bars===1?145:e.bars===2?80:54;
          const percent=e.bars===1?.7:e.bars===2?.4:.2;
          const spread=e.bars===1?0:e.bars===2?82:94;
          const baseAngle=rand(0,Math.PI*2);
          for(let i=0;i<pressCount;i++){
            const ring=pressCount===1?0:spread*(i%2?.75:1);
            const angle=baseAngle+i*Math.PI*2/pressCount;
            effects.push({
              kind:"cookiePress",
              x:player.x+Math.cos(angle)*ring+rand(-12,12),
              y:player.y+Math.sin(angle)*ring+rand(-12,12),
              r,
              startR:Math.max(8,r*.12),
              delay:1.3,
              maxDelay:1.3,
              life:1.65,
              percent,
              hit:false
            });
          }
          text(player.x,player.y-58,"餅乾壓模！","#ffd7a3",18,"boss");
          beep(210,.22,.04,"triangle");
        }
      }
      if(e.kind==="final"&&e.type==="nightmaremaker"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?5:e.bars===2?8:10;
          const angle=Math.floor(rand(0,12))*Math.PI*2/12;
          const ca=Math.abs(Math.cos(angle)),sa=Math.abs(Math.sin(angle));
          const halfLen=Math.min(ca<.001?Infinity:W*.5/ca,sa<.001?Infinity:H*.5/sa)+20;
          const trainDuration=clamp((halfLen*2+220)/720,.8,1.7);
          effects.push({
            kind:"toyTrainCross",
            x:player.x,
            y:player.y,
            angle,
            halfLen,
            width:e.bars===1?118:e.bars===2?98:82,
            railTime:1,
            warnTime:.45,
            delay:1.45,
            life:1.45+trainDuration+.5,
            maxLife:1.45+trainDuration+.5,
            trainDuration,
            percent:e.bars===1?.9:e.bars===2?.72:.55,
            hit:false
          });
          text(player.x,player.y-58,"列車俯衝！","#ffb56a",19,"boss");
          beep(92,.32,.05,"sawtooth");
        }
      }
      if(e.kind==="final"&&e.type==="lavagolem"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?2.4:e.bars===2?3.1:3.8;
          const count=e.bars===1?5:e.bars===2?4:3;
          for(let i=0;i<count;i++){
            const a=rand(0,Math.PI*2);
            const rr=rand(20,150);
            effects.push({
              kind:"cookiePress",
              x:player.x+Math.cos(a)*rr,
              y:player.y+Math.sin(a)*rr,
              r:48,
              startR:8,
              delay:1.2,
              maxDelay:1.2,
              life:1.55,
              percent:0,
              damage:e.damage*.62,
              hit:false
            });
          }
          const a=Math.atan2(player.y-e.y,player.x-e.x);
          effects.push({kind:"beamWarning",x:e.x,y:e.y,a,width:82,delay:1.05,life:1.5,damage:e.damage*.85,color:"#6b1d14",line:"#ff3c22",hit:false});
          text(player.x,player.y-58,"熔岩裂縫！","#ff8a38",19,"boss");
          beep(92,.25,.05,"sawtooth");
        }
      }
      if(e.kind==="final"&&e.type==="abyssoctopus"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?3.2:e.bars===2?4.1:4.8;
          const baseA=Math.atan2(player.y-e.y,player.x-e.x);
          const count=e.bars===1?3:e.bars===2?2:1;
          for(let i=0;i<count;i++){
            effects.push({kind:"beamWarning",x:e.x,y:e.y,a:baseA+(i-(count-1)/2)*.22,width:58,delay:1.05,life:1.55,percent:.35,color:"#145d7a",line:"#ff4a58",hit:false});
          }
          player.slowStatus=Math.max(player.slowStatus||0,1.2);
          text(player.x,player.y-58,"深海水柱！","#9eeaff",19,"boss");
          beep(150,.25,.04,"triangle");
        }
      }
      if(e.kind==="final"&&e.type==="clockwitch"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?3.4:e.bars===2?4.3:5.2;
          const angle=(e.bars===1?0:Math.PI/2)+(Math.floor(time)%2?Math.PI:0);
          effects.push({
            kind:"toyTrainCross",
            x:player.x,
            y:player.y,
            angle,
            halfLen:Math.max(W,H)*.7,
            width:e.bars===1?96:e.bars===2?78:64,
            railTime:.75,
            warnTime:.45,
            delay:1.2,
            life:2.5,
            maxLife:2.5,
            trainDuration:1.05,
            percent:e.bars===1?.58:e.bars===2?.45:.32,
            hit:false
          });
          if(e.bars<=2)confuseTimer=Math.max(confuseTimer,2.2);
          text(player.x,player.y-58,"鐘擺斬擊！","#fff2a8",19,"boss");
          beep(230,.2,.035,"square");
        }
      }
      if(e.kind==="final"&&e.type==="voiddevourer"){
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=e.bars===1?5.2:e.bars===2?6.4:7.6;
          effects.push({
            kind:"leafStorm",ownerId:e.id,x:player.x,y:player.y,
            r:e.bars===1?260:e.bars===2?220:185,life:4.2,maxLife:4.2,
            pull:e.bars===1?270:e.bars===2?220:170,dark:true,phase:rand(0,Math.PI*2)
          });
          const baseA=Math.atan2(player.y-e.y,player.x-e.x);
          const count=e.bars===1?4:e.bars===2?3:2;
          for(let i=0;i<count;i++)effects.push({kind:"beamWarning",x:e.x,y:e.y,a:baseA+(i-(count-1)/2)*.26,width:50,delay:1.15,life:1.65,percent:.45,color:"#2a103d",line:"#ff2e8a",hit:false});
          text(player.x,player.y-62,"黑洞牽引！","#d9a6ff",20,"boss");
          beep(72,.38,.055,"sawtooth");
        }
      }
      if(e.kind==="final"&&(e.type==="rottenwood"||e.type==="shadowtree")){
        const shadow=e.type==="shadowtree";
        const forestSkillDamage=1.3;
        e.phase-=dt;
        if(e.phase<=0){
          e.phase=shadow?2.65:3.15;
          const a=Math.atan2(player.y-e.y,player.x-e.x);
          effects.push({
            kind:"beamWarning",x:e.x,y:e.y,a,
            width:shadow?104:76,delay:.95,life:1.45,
            damage:e.damage*(shadow?.9:.72)*forestSkillDamage,
            color:shadow?"#5a315f":"#654221",
            line:"#ff334f",forestWhip:true,confuse:shadow?2.5:0,hit:false
          });
          beep(120,.2,.04,"sawtooth");
        }
        e.shoot-=dt;
        if(e.shoot<=0){
          e.shoot=shadow?8.5:10;
          const stormRange=shadow?205*(1.2+Math.max(0,Math.min(2,e.phaseIndex||0))*.2):160;
          effects.push({
            kind:"leafStorm",ownerId:e.id,x:e.x,y:e.y,
            r:stormRange,life:shadow?5.4:4.4,maxLife:shadow?5.4:4.4,
            pull:shadow?170:110,dark:shadow,phase:rand(0,Math.PI*2)
          });
          text(e.x,e.y-e.r-32,shadow?"幽影枯葉風暴！":"枯葉風暴！",shadow?"#c59cff":"#d2ff93",20,"boss");
        }
        e.throwTimer=(e.throwTimer||0)-dt;
        if(e.throwTimer<=0){
          e.throwTimer=shadow?6.8:7.8;
          const a=Math.atan2(player.y-e.y,player.x-e.x);
          const tx=player.x+Math.cos(a)*rand(-20,40);
          const ty=player.y+Math.sin(a)*rand(-20,40);
          effects.push({
            kind:shadow?"poisonMushroom":"treantSeed",
            x:e.x,y:e.y,targetX:tx,targetY:ty,
            delay:shadow?1.35:1.05,life:shadow?2.2:1.8,
            damage:e.damage*(shadow?.72:.64)*forestSkillDamage,
            ownerId:e.id,landed:false
          });
          beep(shadow?190:150,.18,.035,"triangle");
        }
      }
      const centerDist=dist(e,player);
      const closeDist=centerDist-e.r-player.r;
      if(closeDist<dangerRadius){
        let ang=Math.atan2(e.y-player.y,e.x-player.x);
        if(ang<0)ang+=Math.PI*2;
        const sectorTotal=computeSectorCount();
        const sector=Math.min(sectorTotal-1,Math.floor(ang/(Math.PI*2/sectorTotal)));
        sectorBits|=(1<<sector);
      }
    }
    compactArray(enemies,e=>!e.dead);
    if(computeFrameCount%computeGridStride()===0||enemyGrid.size===0)rebuildEnemyGrid();
    encirclementSectorBits=sectorBits;
    encirclementSectorCount=sectorBits.toString(2).replace(/0/g,"").length;
    const sectorTotal=computeSectorCount();
    const fullEncirclement=encirclementSectorCount>=sectorTotal;
    encirclementPrewarn=encirclementSectorCount>=Math.ceil(sectorTotal*.75);
    const pressureTarget=encirclementSectorCount/sectorTotal;
    const riseLerp=pressureTarget>encirclementPressure?Math.min(1,dt*4.2):0;
    const fallLerp=pressureTarget<encirclementPressure?Math.min(1,dt*2.1):0;
    if(riseLerp)encirclementPressure+=(pressureTarget-encirclementPressure)*riseLerp;
    else if(fallLerp)encirclementPressure+=(pressureTarget-encirclementPressure)*fallLerp;
    if(pressureTarget<=0.01)encirclementPressure=Math.max(0,encirclementPressure-dt*.1);
    if(fullEncirclement){
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
    if(fullEncirclement&&encirclementSampleClock>=currentEncirclementSampleDuration()){
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
    compactArray(enemyShots,s=>s.life>0&&dist(s,player)<1100);
  }

  function shatterRollingStone(shot,enemy){
    shot.life=0;
    burst(enemy.x,enemy.y,"#aa9278",12);
    effects.push({kind:"shockwave",x:enemy.x,y:enemy.y,r:8,max:48,life:.3});
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7+rand(-.2,.2),speed=rand(70,145);
      effects.push({
        kind:"rockFragment",x:enemy.x,y:enemy.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
        z:rand(14,26),vz:rand(150,230),r:rand(4,7),life:2,damage:peanutDebrisDamage()
      });
    }
  }

  function updateShots(dt,list,isPet=false){
    for(const s of list){
      countPerfWork("projectileDraw");
      if(s.curveBoss){
        const ox=s.x,oy=s.y;
        s.curveAge=(s.curveAge||0)+dt;
        const t=clamp(s.curveAge/Math.max(.1,s.curveDuration||1),0,1);
        const u=1-t;
        s.x=u*u*s.sx+2*u*t*s.cx+t*t*s.tx;
        s.y=u*u*s.sy+2*u*t*s.cy+t*t*s.ty;
        s.vx=(s.x-ox)/Math.max(dt,.001);
        s.vy=(s.y-oy)/Math.max(dt,.001);
        s.angle=Math.atan2(s.vy,s.vx);
        if(t>=1)s.life=Math.min(s.life,.08);
      }else{
        s.x+=s.vx*dt;
        s.y+=s.vy*dt;
      }
      s.life-=dt;
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
            releaseShotReservation(s);
            if(!(!isPet&&!s.kind&&triggerLuminousSlashOnHit(boss,s.damage,"normal"))){
              let crit=false;
              if(!isPet){
                crit=Math.random()<player.critStack;
                player.critStack=crit?player.crit:Math.min(1,player.critStack+player.crit);
              }
              const damage=s.damage*(crit?player.critDamage:1);
              damageEnemy(boss,damage,crit,s.kind||"normal");
            }
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
          releaseShotReservation(s);
          if(!(!isPet&&!s.kind&&triggerLuminousSlashOnHit(e,s.damage,"normal"))){
            let crit=false;
            if(!isPet){
              crit=Math.random()<player.critStack;
              player.critStack=crit?player.crit:Math.min(1,player.critStack+player.crit);
            }
            const damage=s.damage*(crit?player.critDamage:1);
            damageEnemy(e,damage,crit,s.kind||"normal");
          }
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
    return compactArray(list,s=>{
      if(s.life>0)return true;
      if(!isPet)releasePooledShot(s);
      return false;
    });
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
      if(!a.started)a.started=true;
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
    compactArray(areas,a=>a.delay>0||a.life>0);
  }

  function updateGems(dt){
    const pressure=perfWorkCurrent.gemUpdate||0;
    const pressureCfg=graphicsGemPressureConfig();
    if(pressure>pressureCfg.low&&gems.length>80){
      const interval=pressure>pressureCfg.high?pressureCfg.fast:pressure>pressureCfg.mid?pressureCfg.medium:pressureCfg.slow;
      gemPressureRecycleTimer+=dt;
      while(gemPressureRecycleTimer>=interval){
        gemPressureRecycleTimer-=interval;
        const batch=pressure>pressureCfg.high?3:pressure>pressureCfg.mid?2:1;
        for(let b=0;b<batch;b++){
          let pick=null;
          for(let tries=0;tries<18;tries++){
            const candidate=gems[Math.floor(Math.random()*gems.length)];
            if(!candidate||candidate.dead)continue;
            const age=time-(candidate.spawnTime??time);
            const dx=candidate.x-player.x,dy=candidate.y-player.y;
            const far=dx*dx+dy*dy>420*420;
            if(age>2.2||far){pick=candidate;break;}
          }
          if(!pick)break;
          pick.dead=true;
          gainXp(pick.value||0);
        }
      }
    }else{
      gemPressureRecycleTimer=0;
    }
    const frameBucket=Math.floor(time*60);
    const farCfg=graphicsGemFarConfig();
    for(let i=0;i<gems.length;i++){
      const g=gems[i];
      if(g.dead)continue;
      const lifeTime=time-(g.spawnTime??time);
      const d=dist(g,player);
      const magnetized=d<player.magnet;
      if(lifeTime>=5){
        g.dead=true;
        gainXp(g.value||0);
        continue;
      }
      const near=d<farCfg.near||magnetized;
      if(!near){
        const bucketBase=(g.id||i)+frameBucket;
        if(d>=farCfg.far){
          if(bucketBase%farCfg.farMod!==0)continue;
        }else if(bucketBase%farCfg.nearMod!==0)continue;
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
    compactArray(gems,g=>!g.dead);
  }

  function update(dt){
    if(!running||paused||ended)return;
    computeFrameCount++;
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
    if(perfDebugTimer>=graphicsPerfSampleSeconds()){
      const sampleCount=Math.max(1,perfDebugAccumulator.samples);
      perfDebugLast={
        frameMs:perfDebugAccumulator.frameMs/sampleCount,
        fps:perfDebugAccumulator.fps/sampleCount,
        peak:perfDebugAccumulator.peak,
        catchUpMax:perfDebugAccumulator.catchUpMax
      };
      perfWorkLast={...perfWorkCurrent};
      perfDebugTimer=0;
      perfDebugAccumulator={frameMs:0,fps:0,samples:0,peak:0,catchUpMax:0};
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
    if(hudSampleTimer>=computeHudInterval()){
      hudSampleTimer=0;
      hudEnemyCount=livingEnemyCount();
      hudKills=kills;
      hudKps=kps;
      hudKpsBonus=usesTimedMonsterBudget()?kpsSpawnBonus:0;
      hudWaveSeconds=usesTimedMonsterBudget()?timedMonsterBudget().waveSeconds:0;
    }
    kpsWindowTime+=dt;
    if(kpsWindowTime>=.5){
      const sample=kpsWindowKills/kpsWindowTime;
      kps=kps*.55+sample*.45;
      kpsWindowKills=0;
      kpsWindowTime=0;
      kpsPressure=clamp((kps-10)/55,0,1);
    }
    kpsBonusTimer-=dt;
    if(kpsBonusTimer<=0){
      kpsBonusTimer=3;
      kpsSpawnBonus=calcKpsSpawnBonus(kps);
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
      const enemyCap=computeEnemyCap();
      let targetEnemyCount=0;
      let variance=.12;
      if(usesTimedMonsterBudget()){
        const budget=timedMonsterBudget();
        targetEnemyCount=Math.min(enemyCap,budget.base+kpsSpawnBonus);
        variance=budget.waveSeconds>0?.08:.12;
      }else if(isEventMode()){
        targetEnemyCount=Math.min(enemyCap,Math.round(34+time/5));
        variance=.08;
      }else if(kps>=10){
        targetEnemyCount=Math.min(enemyCap,Math.round(kps*10));
        variance=targetEnemyCount>=enemyCap?.3:.2;
      }else{
        const baseTarget=time<240?60:72;
        targetEnemyCount=Math.min(enemyCap,Math.round(baseTarget*Math.min(1.35,intensity)));
      }
      const minTarget=Math.round(targetEnemyCount*(1-variance));
      const maxTarget=Math.min(enemyCap,Math.round(targetEnemyCount*(1+variance)));
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
    updateLuminousSlash(dt);updatePlayer(dt);updateEnemies(dt);shots=updateShots(dt,shots);petShots=updateShots(dt,petShots,true);updateBananas(dt);updateSkills(dt);updateEnemyShots(dt);updateGems(dt);if(!preBattleActive)updatePickups(dt);
    for(const e of effects){
      if(e.kind==="particle"||e.kind==="chip"||e.kind==="half"||e.kind==="pinkyLine"||e.kind==="heart"){
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;
        if(e.kind==="chip"||e.kind==="half")e.vy+=260*dt;
      }
      if(e.kind==="luminousSlash"){
        if(e.delay>0)e.delay-=dt;
        else e.life-=dt;
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
          if(along>-80&&along<950&&side<e.width*.5+player.r){
            if(e.damage)hurt(e.damage);
            else hurtPercent(e.percent);
            if(e.confuse){
              confuseTimer=Math.max(confuseTimer,e.confuse);
              text(player.x,player.y-55,"迷失方向！","#d9a7ff",18,"pickup");
            }
          }
          beep(58,.28,.055,"sawtooth");
        }
      }
      if(e.kind==="cookiePress"){
        e.life-=dt;
        e.delay-=dt;
        if(e.delay<=0&&!e.hit){
          e.hit=true;
          if(dist(e,player)<e.r+player.r){
            if(e.damage){
              hurt(e.damage);
              text(player.x,player.y-55,`熔岩裂縫 -${Math.round(e.damage)}`,"#ff9b4a",18,"boss");
            }else{
              const percent=e.percent??.2;
              hurtPercent(percent,false,true,true);
              text(player.x,player.y-55,`餅乾壓模 -${Math.round(percent*100)}%`,"#ffd7a3",18,"boss");
            }
          }
          burst(e.x,e.y,"#e6ad64",18);
          beep(145,.22,.05,"triangle");
        }
      }
      if(e.kind==="toyTrainCross"){
        e.life-=dt;
        e.delay-=dt;
        if(e.delay<=0)e.activeTime=(e.activeTime||0)+dt;
        if(e.delay<=0&&!e.hit){
          const angle=e.angle||0;
          const cos=Math.cos(angle),sin=Math.sin(angle);
          const dx=player.x-e.x;
          const dy=player.y-e.y;
          const along=dx*cos+dy*sin;
          const perp=Math.abs(-dx*sin+dy*cos);
          const trainT=clamp((e.activeTime||0)/(e.trainDuration||1.2),0,1);
          const halfLen=e.halfLen||Math.max(W,H)*.6;
          const front=-halfLen-120+trainT*(halfLen*2+240);
          if(perp<e.width*.5+player.r&&along>front-190&&along<front+40){
            e.hit=true;
            hurtPercent(e.percent,false,true,true);
            poisonTimer=Math.max(poisonTimer,10);
            poisonRate=Math.max(poisonRate,0);
            text(player.x,player.y-58,"重傷 10s","#ff6a75",20,"boss");
            burst(e.x,e.y,"#ff934f",20);
            beep(62,.35,.06,"sawtooth");
          }
        }
      }
      if(e.kind==="leafStorm"){
        e.life-=dt;
        const owner=enemies.find(enemy=>enemy.id===e.ownerId&&!enemy.dead);
        if(owner){e.x=owner.x;e.y=owner.y;}
        const d=Math.max(1,dist(e,player));
        if(d<e.r+player.r){
          const pull=(1-d/(e.r+player.r))*e.pull;
          player.x+=(e.x-player.x)/d*pull*dt;
          player.y+=(e.y-player.y)/d*pull*dt;
          resolveBossObstacles(player,player.r);
        }
      }
      if(e.kind==="treantSeed"||e.kind==="poisonMushroom"){
        e.delay-=dt;
        const travelT=clamp(1-e.delay/(e.kind==="poisonMushroom"?1.35:1.05),0,1);
        e.x=e.x+(e.targetX-e.x)*Math.min(1,dt*5);
        e.y=e.y+(e.targetY-e.y)*Math.min(1,dt*5);
        e.z=Math.sin(travelT*Math.PI)*70;
        if(e.delay<=0&&!e.landed){
          e.landed=true;
          e.x=e.targetX;e.y=e.targetY;e.z=0;
          if(e.kind==="poisonMushroom"){
            e.boomDelay=.85;
          }else{
            effects.push({kind:"saplingBomb",x:e.x,y:e.y,r:14,life:5.2,damage:e.damage,speed:175});
            e.life=.2;
            burst(e.x,e.y,"#6f4d2d",10);
          }
        }
        if(e.landed&&e.kind==="poisonMushroom"){
          e.boomDelay-=dt;
          if(e.boomDelay<=0&&!e.exploded){
            e.exploded=true;
            const r=82;
            effects.push({kind:"shockwave",x:e.x,y:e.y,r:14,max:r,life:.42});
            if(dist(e,player)<r+player.r){
              hurt(e.damage);
              if(Math.random()<.7){
                confuseTimer=Math.max(confuseTimer,5);
                text(player.x,player.y-55,"迷失方向 5 秒！","#d9a7ff",18,"pickup");
              }
            }
            burst(e.x,e.y,"#9b61c7",16);
            e.life=.05;
          }
        }
        e.life-=dt;
      }
      if(e.kind==="saplingBomb"){
        e.life-=dt;
        const d=Math.max(1,dist(e,player));
        e.x+=(player.x-e.x)/d*e.speed*dt;
        e.y+=(player.y-e.y)/d*e.speed*dt;
        resolveBossObstacles(e,e.r);
        if(d<e.r+player.r+4&&!e.exploded){
          e.exploded=true;
          effects.push({kind:"shockwave",x:e.x,y:e.y,r:8,max:68,life:.35});
          hurt(e.damage);
          burst(e.x,e.y,"#96c86a",14);
          e.life=.05;
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
    compactArray(effects,e=>e.life===undefined||e.life>0);
    for(const t of texts){
      if(t.kind==="critical"||t.kind==="luminousCritical"){
        t.x+=(t.vx||0)*dt;
        t.y+=(t.vy||0)*dt;
        t.vy=(t.vy||0)+(t.gravity||0)*dt;
      }else{
        t.y-=30*dt;
      }
      t.life-=dt;
    }
    compactArray(texts,t=>t.life>0);
    if(instantKillTimer>0){
      instantKillTimer-=dt;
      if(instantKillTimer<=0)instantKills=0;
    }
  }

  function burst(x,y,color,n){
    const count=graphicsBurstCount(n);
    for(let i=0;i<count;i++)effects.push({kind:"particle",x,y,vx:rand(-140,140),vy:rand(-140,140),life:rand(.25,.65),color,r:rand(2,6)});
  }
  function text(x,y,value,color="#fff",size=14,kind="normal"){
    if(kind==="normal"||kind==="critical"||kind==="boss"){
      let sameKindCount=0;
      for(const t of texts)if(t.kind===kind)sameKindCount++;
      if(sameKindCount>=graphicsTextLimit(kind))return;
    }
    const item={x,y,value:String(value),color,size,kind,life:1};
    if(kind==="critical"){
      const profile=graphicsCriticalProfile();
      item.life=profile.life;
      item.maxLife=item.life;
      item.vx=rand(profile.vxMin,profile.vxMax);
      item.vy=rand(profile.vyMin,profile.vyMax);
      item.gravity=profile.gravity;
      item.minScale=profile.minScale;
      item.noFade=profile.noFade;
    }else if(kind==="luminousCritical"){
      const profile=graphicsCriticalProfile();
      item.life=profile.life;
      item.maxLife=item.life;
      item.vx=0;
      item.vy=-46;
      item.gravity=0;
    }
    texts.push(item);
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
    const progress=clamp(1-t.life/(t.maxLife||1),0,1);
    const minScale=t.minScale??.72;
    const scale=1-(1-minScale)*progress;
    ctx.scale(scale,scale);
    ctx.globalAlpha=t.noFade?1:clamp(t.life*2,0,1);
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
  function drawLuminousCriticalText(t,p){
    ctx.save();
    ctx.translate(p.x,p.y-6);
    ctx.globalAlpha=clamp(t.life/(t.maxLife||1),0,1);
    ctx.font=`bold ${t.size}px sans-serif`;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    const textWidth=ctx.measureText(t.value).width;
    const spikes=12,outerX=Math.max(28,textWidth*.5+16),outerY=25,innerX=Math.max(19,outerX*.74),innerY=17;
    const grad=ctx.createLinearGradient(0,-outerY,0,outerY);
    grad.addColorStop(0,"#153f9a");
    grad.addColorStop(.55,"#1f78d8");
    grad.addColorStop(1,"#0b2a66");
    ctx.fillStyle=grad;
    ctx.strokeStyle="#79e7ff";
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
    ctx.strokeStyle="#071b4d";
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
    const stageForGround=isInfiniteMode()?infiniteStageForZone(zone):(isBossChallengeMode()?bossChallengeSourceStage:currentStage);
    const forestStage=stageForGround===4||stageForGround===5;
    const cookieStageGround=stageForGround===6;
    const toyStageGround=stageForGround===7;
    const advancedGroundColors={
      8:"#2b1511",
      9:"#09293a",
      10:"#252036",
      11:"#10051f"
    };
    rect(0,0,W,H,advancedGroundColors[stageForGround]||(
      cookieStageGround?"#d9b37a":toyStageGround?"#8aaec0":forestStage?(stageForGround===5?"#162019":"#263b25"):zone>=3?"#2a0f1b":zone===2?"#cfefff":zone===1?"#d7b66f":"#79bd58"
    ));
    const grid=64,camera=cameraPosition();
    const left=camera.x-W/2-grid,top=camera.y-H/2-grid;
    const rawFirstX=Math.floor(left/grid),rawFirstY=Math.floor(top/grid);
    const cols=Math.ceil(W/grid)+3,rows=Math.ceil(H/grid)+3;
    if(!groundCache.canvas){
      groundCache.canvas=document.createElement("canvas");
      groundCache.ctx=groundCache.canvas.getContext("2d");
    }
    let firstX=rawFirstX,firstY=rawFirstY;
    const stride=graphicsGroundStride();
    if(stride>1&&groundCache.canvas&&groundCache.zone===zone&&groundCache.stage===stageForGround&&groundCache.cols===cols&&groundCache.rows===rows){
      firstX=Math.abs(rawFirstX-groundCache.firstX)>=stride?rawFirstX:groundCache.firstX;
      firstY=Math.abs(rawFirstY-groundCache.firstY)>=stride?rawFirstY:groundCache.firstY;
    }
    if(
      groundCache.zone!==zone||
      groundCache.stage!==stageForGround||
      groundCache.firstX!==firstX||
      groundCache.firstY!==firstY||
      groundCache.cols!==cols||
      groundCache.rows!==rows
    ){
      groundCache.zone=zone;
      groundCache.stage=stageForGround;
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
    const stageForGround=isInfiniteMode()?infiniteStageForZone(zone):(isBossChallengeMode()?bossChallengeSourceStage:currentStage);
    const forestStage=stageForGround===4||stageForGround===5;
    if(stageForGround===6){
      targetCtx.fillStyle=hash%2?"#d7b079":"#cfa66e";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#b88954";
      targetCtx.fillRect(x,y,grid,2);
      targetCtx.fillRect(x,y,2,grid);
      if(hash===1){
        targetCtx.fillStyle="#c18b58";targetCtx.fillRect(x+8,y+44,34,4);
        targetCtx.fillStyle="#e0bc81";targetCtx.fillRect(x+14,y+39,21,3);
      }
      if(hash===3){
        targetCtx.fillStyle="#e9dfc9";targetCtx.fillRect(x+42,y+18,8,5);
        targetCtx.fillStyle="#cf7f8f";targetCtx.fillRect(x+47,y+18,3,3);
      }
      if(hash===5){
        targetCtx.fillStyle="#b17643";targetCtx.fillRect(x+18,y+22,18,4);
        targetCtx.fillStyle="#f1d9a5";targetCtx.fillRect(x+21,y+19,11,3);
      }
    }else if(stageForGround===7){
      targetCtx.fillStyle=hash%2?"#87aebd":"#7fa5b4";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#6e8e9c";
      targetCtx.fillRect(x,y,grid,2);
      targetCtx.fillRect(x,y,2,grid);
      if(hash===1){
        targetCtx.fillStyle="#6b687f";targetCtx.fillRect(x+8,y+46,36,5);
        targetCtx.fillStyle="#b7bfca";for(let i=0;i<3;i++)targetCtx.fillRect(x+13+i*11,y+47,5,3);
      }
      if(hash===3){
        targetCtx.fillStyle="#b98253";targetCtx.fillRect(x+38,y+16,10,10);
        targetCtx.fillStyle="#e2be71";targetCtx.fillRect(x+41,y+13,4,4);
      }
      if(hash===5){
        targetCtx.fillStyle="#5e7f8f";targetCtx.fillRect(x+18,y+29,21,4);
        targetCtx.fillStyle="#a6c0cc";targetCtx.fillRect(x+25,y+25,5,5);
      }
    }else if(stageForGround===8){
      targetCtx.fillStyle=hash%2?"#2a1510":"#341914";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#1b0d0b";
      targetCtx.fillRect(x,y,grid,3);
      targetCtx.fillRect(x,y,3,grid);
      targetCtx.fillStyle="rgba(255,120,45,.16)";
      if(hash===1||hash===5){
        targetCtx.fillRect(x+8,y+44,42,3);
        targetCtx.fillStyle="#b74325";targetCtx.fillRect(x+18,y+41,18,2);
      }
      if(hash===2){
        targetCtx.fillStyle="#5b2820";targetCtx.fillRect(x+39,y+12,10,7);
        targetCtx.fillStyle="#f0a33d";targetCtx.fillRect(x+43,y+15,3,2);
      }
      if(hash===4){
        targetCtx.fillStyle="#6e2519";targetCtx.fillRect(x+14,y+22,33,3);
        targetCtx.fillStyle="#ff7b32";targetCtx.fillRect(x+27,y+20,8,2);
      }
    }else if(stageForGround===9){
      targetCtx.fillStyle=hash%2?"#0b3043":"#0e3a4c";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#174f64";
      targetCtx.fillRect(x,y,grid,2);
      targetCtx.fillRect(x,y,2,grid);
      if(hash===1){
        targetCtx.fillStyle="#1b5c69";targetCtx.fillRect(x+9,y+45,34,4);
        targetCtx.fillStyle="#65d8e9";targetCtx.fillRect(x+17,y+42,8,2);
      }
      if(hash===3){
        targetCtx.fillStyle="#245766";targetCtx.fillRect(x+41,y+18,10,12);
        targetCtx.fillStyle="#79f0ff";targetCtx.fillRect(x+45,y+14,3,3);
      }
      if(hash===6){
        targetCtx.fillStyle="#0f2434";targetCtx.fillRect(x+17,y+28,25,3);
        targetCtx.fillStyle="#3b8ea4";targetCtx.fillRect(x+26,y+25,6,2);
      }
    }else if(stageForGround===10){
      targetCtx.fillStyle=hash%2?"#28233a":"#211d31";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#171525";
      targetCtx.fillRect(x,y,grid,3);
      targetCtx.fillRect(x,y,3,grid);
      targetCtx.fillStyle="#4d415b";
      targetCtx.fillRect(x+2,y+31,grid-4,2);
      if(hash===0||hash===4){
        targetCtx.fillStyle="#7f6942";targetCtx.fillRect(x+12,y+46,33,3);
        targetCtx.fillStyle="#d8bd69";targetCtx.fillRect(x+21,y+44,14,2);
      }
      if(hash===2){
        targetCtx.fillStyle="#3a304d";targetCtx.fillRect(x+42,y+13,8,9);
        targetCtx.fillStyle="#e6d88b";targetCtx.fillRect(x+45,y+11,3,3);
      }
    }else if(stageForGround===11){
      targetCtx.fillStyle=hash%2?"#110623":"#16082c";
      targetCtx.fillRect(x,y,grid,grid);
      targetCtx.fillStyle="#07030e";
      targetCtx.fillRect(x,y,grid,3);
      targetCtx.fillRect(x,y,3,grid);
      if(hash===1||hash===5){
        targetCtx.fillStyle="#3d1565";targetCtx.fillRect(x+10,y+42,40,3);
        targetCtx.fillStyle="#b95cff";targetCtx.fillRect(x+24,y+40,10,2);
      }
      if(hash===3){
        targetCtx.fillStyle="#25113e";targetCtx.fillRect(x+38,y+16,13,8);
        targetCtx.fillStyle="#ed9cff";targetCtx.fillRect(x+44,y+14,3,3);
      }
      if(hash===6){
        targetCtx.fillStyle="#2c0f4f";targetCtx.fillRect(x+16,y+27,28,3);
        targetCtx.fillStyle="#742be0";targetCtx.fillRect(x+29,y+25,6,2);
      }
    }else if(forestStage){
      targetCtx.fillStyle=stageForGround===5?(hash%2?"#18251d":"#111a15"):(hash%2?"#2c462b":"#243821");
      targetCtx.fillRect(x,y,grid,grid);
      if(hash===1){
        targetCtx.fillStyle="#49301f";targetCtx.fillRect(x+11,y+28,9,30);
        targetCtx.fillStyle="#274d2c";targetCtx.fillRect(x+2,y+10,28,22);
        targetCtx.fillStyle="#396d3a";targetCtx.fillRect(x+12,y+5,22,20);
      }
      if(hash===2){
        targetCtx.fillStyle="#4e3a26";targetCtx.fillRect(x+41,y+38,16,5);
        targetCtx.fillRect(x+45,y+29,5,15);
      }
      if(hash===3){
        targetCtx.fillStyle=stageForGround===5?"#5a3f2f":"#72553b";
        targetCtx.fillRect(x+20,y+45,9,7);
        targetCtx.fillStyle=stageForGround===5?"#3f3427":"#5f4a2d";
        targetCtx.fillRect(x+26,y+41,8,5);
      }
      if(hash===5){
        targetCtx.fillStyle=stageForGround===5?"#335029":"#49723a";
        targetCtx.fillRect(x+35,y+16,18,7);
        targetCtx.fillRect(x+42,y+10,6,17);
      }
      if(hash===6){
        targetCtx.fillStyle=stageForGround===5?"#274025":"#456f39";
        targetCtx.fillRect(x+8,y+50,30,4);
        targetCtx.fillStyle=stageForGround===5?"#39281e":"#5a3e28";
        targetCtx.fillRect(x+22,y+44,5,10);
      }
    }else if(zone>=3){
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
    const arenaStage=isInfiniteMode()?infiniteStageForZone(bossArena.zone):currentStage;
    const forestStage=arenaStage===4||arenaStage===5;
    const cookieArena=arenaStage===6;
    const toyArena=arenaStage===7;
    ctx.save();
    ctx.globalAlpha=.12;
    ctx.fillStyle=toyArena?"#8ed2ff":cookieArena?"#ffd28a":forestStage?"#4f8d42":arenaStage===0?"#b62031":zone===2?"#dff8ff":"#f7d58a";ctx.beginPath();ctx.arc(center.x,center.y,bossArena.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    const blocks=44;
    for(let i=0;i<blocks;i++){
      const a=i*Math.PI*2/blocks;
      const x=center.x+Math.cos(a)*bossArena.r,y=center.y+Math.sin(a)*bossArena.r;
      ctx.save();ctx.translate(x,y);ctx.rotate(a);
      if(cookieArena){
        rect(-13,-12,26,18,i%2?"#d4894b":"#f0b76a");
        rect(-10,-20,20,9,"#fff0d8");
        rect(-11,8,22,5,"#6b3a25");
      }else if(toyArena){
        rect(-13,-14,26,24,i%2?"#5aa5cb":"#e06768");
        rect(-9,-22,18,8,i%2?"#ffe15b":"#8ddf75");
        rect(-12,8,24,5,"#28445c");
      }else if(forestStage){
        rect(-12,-18,24,30,i%2?"#4d3322":"#63422b");
        rect(-20,-28,40,18,i%2?"#2e6336":"#3d7a42");
        rect(-9,8,18,5,"#20160f");
      }else if(arenaStage===0){
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
    ctx.strokeStyle=toyArena?"#78d7ff":cookieArena?"#ffd07b":forestStage?"#86d06f":arenaStage===0?"#ff2e3e":zone===2?"#72ddff":"#ff5a55";ctx.lineWidth=4;ctx.globalAlpha=.62;
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
    const p=worldToScreen(s.x,s.y),margin=s.kind==="giant"?130:54;
    if(!screenPointVisible(p,margin))return;
    const config=performanceConfig(),giant=s.kind==="giant";
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(s.angle||Math.atan2(s.vy,s.vx));
    if(config.projectileGlow){
      ctx.globalAlpha=giant?.22:.16;
      ctx.fillStyle=giant?"#ffb55d":"#ff9f45";
      ctx.beginPath();ctx.ellipse(giant?-7:-4,0,giant?24:14,giant?8:5,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=giant?.18:.13;
      rect(giant?-36:-24,-2,giant?30:18,4,"#ffd36a");
      ctx.globalAlpha=1;
    }
    if(giant){
      ctx.scale(2.6,2.6);
      rect(-10,-5,16,10,"#ff8a32");rect(5,-4,8,8,"#d94b25");rect(-15,-8,7,5,"#55aa4f");rect(-15,3,7,5,"#78c55c");rect(-2,-3,5,3,"#ffd069");
    }else{
      rect(-9,-4,14,8,"#f2792f");rect(5,-3,7,6,"#de5127");rect(-13,-6,6,4,"#54a94d");rect(-13,2,6,4,"#76c45b");
    }
    ctx.restore();
  }

  function drawBossChallengeWhaleSprite(){
    rect(-42,-15,62,27,"#24496f");
    rect(-49,-8,13,13,"#356e9a");
    rect(13,-13,22,20,"#1b3b5f");
    rect(31,-26,15,24,"#24496f");
    rect(29,2,17,22,"#1b3b5f");
    rect(-37,8,43,10,"#aee7f2");
    rect(-37,10,8,12,"#e2fbff");
    rect(-28,10,8,13,"#cdf4fb");
    rect(-19,10,8,11,"#aee7f2");
    rect(-25,-29,15,16,"#8fd8ee");
    rect(-13,-34,19,21,"#6fc8e6");
    rect(5,-25,13,13,"#8fd8ee");
    rect(20,-29,9,9,"#bff6ff");
    rect(28,-34,7,11,"#8fd8ee");
    rect(-33,-4,8,5,"#07111d");
    rect(-30,-3,4,3,"#dffbff");
    rect(-35,-6,25,3,"#142c47");
    rect(-3,0,12,8,"#8fcde0");
    rect(7,10,12,17,"#6aa8c6");
    rect(-10,-3,18,3,"#6b2a77");
    rect(6,-9,14,3,"#6b2a77");
    rect(22,1,12,3,"#6b2a77");
    rect(-44,-2,9,3,"#10233f");
  }

  function drawMoneyEnemySprite(type){
    if(type==="babycarrot"||type==="carrotbrute"){
      const big=type==="carrotbrute";
      const body=big?["#a84819","#e07022","#ff9a35"]:["#c9571f","#f0832b","#ffb04a"];
      rect(-8,-27,7,13,"#2f8f3c");
      rect(-1,-33,7,18,"#55cf58");
      rect(6,-26,9,11,"#2d8138");
      rect(big?-17:-12,big?-16:-13,big?34:24,big?42:32,body[1]);
      rect(big?-14:-10,big?-12:-10,big?28:20,6,body[2]);
      rect(big?-12:-8,big?-2:-2,big?24:16,6,body[0]);
      rect(big?-9:-6,big?9:7,big?18:12,6,body[2]);
      rect(big?-8:-5,big?19:14,big?16:10,6,body[0]);
      rect(big?-9:-6,big?-20:-16,5,4,"#1c1009");
      rect(big?4:3,big?-20:-16,5,4,"#1c1009");
      rect(big?-6:-5,big?-7:-6,big?12:10,3,"#4b2111");
      if(big){
        rect(-25,-5,8,18,body[1]);rect(17,-5,8,18,body[1]);
        rect(-15,27,8,6,"#7e3518");rect(7,27,8,6,"#7e3518");
      }
      return;
    }
    if(type==="carrotboss"){
      rect(-12,-30,10,14,"#36a844");
      rect(-2,-36,9,20,"#5ed85f");
      rect(6,-29,12,12,"#2f963f");
      rect(-18,-18,36,45,"#e87825");
      rect(-15,-14,30,8,"#ff9c3e");
      rect(-13,-5,26,8,"#d9641f");
      rect(-10,4,20,8,"#ff9c3e");
      rect(-7,13,14,8,"#d85e1d");
      rect(-10,-22,7,5,"#2b160e");
      rect(5,-22,7,5,"#2b160e");
      rect(-7,-10,14,4,"#4b2111");
      rect(-24,-6,8,18,"#f08b31");
      rect(16,-6,8,18,"#f08b31");
      rect(-16,25,9,7,"#8b3d1c");
      rect(7,25,9,7,"#8b3d1c");
      return;
    }
    if(type==="chestmimic"){
      rect(-28,-16,56,34,"#7a4d24");
      rect(-30,-20,60,12,"#b77a35");
      rect(-24,-7,48,20,"#d49a47");
      rect(-20,-2,8,6,"#17110a");rect(12,-2,8,6,"#17110a");
      rect(-9,6,18,5,"#5c3217");rect(-3,-22,6,44,"#ffe05f");
      rect(-34,15,68,7,"#3b2212");
      return;
    }
    if(type==="billmonster"){
      rect(-22,-13,44,26,"#78d98d");
      rect(-17,-8,34,16,"#d8ffd8");
      rect(-9,-5,4,5,"#19331f");rect(6,-5,4,5,"#19331f");
      rect(-6,4,12,3,"#276b37");
      rect(-24,13,7,9,"#78d98d");rect(17,13,7,9,"#78d98d");
      return;
    }
    const palette={
      coppercoin:["#7a3b20","#c87839","#ffd08a"],
      silvercoin:["#687487","#c9d3df","#f6fbff"],
      goldcoin:["#a46b12","#ffd95c","#fff2a6"],
      diamondcoin:["#1d5c92","#67d9ff","#dcfbff"]
    }[type]||["#7a3b20","#ffd95c","#fff2a6"];
    rect(-15,-15,30,30,palette[0]);
    rect(-12,-12,24,24,palette[1]);
    rect(-7,-7,14,14,palette[2]);
    rect(-5,-18,4,4,"#171624");rect(4,-18,4,4,"#171624");
    rect(-9,17,6,5,palette[0]);rect(3,17,6,5,palette[0]);
  }

  function drawEnemy(e){
    const p=worldToScreen(e.x,e.y),s=e.r/18;
    if(!screenPointVisible(p,Math.max(96*s,e.r*4,88)))return;
    const challengeWhale=isBossChallengeMode()&&e.kind==="final"&&e.type==="whale";
    const snapshot=challengeWhale?null:getEnemySnapshot(e.type);
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
      if(challengeWhale){
        drawBossChallengeWhaleSprite();
      }else if(EVENT_ENEMY_TYPES.has(e.type)){
        drawMoneyEnemySprite(e.type);
      }else if(e.type==="turtle"){
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
    }else if(e.type==="poisonmush"){
      rect(-12,-4,24,28,"#d8c7a1");rect(-24,-20,48,20,"#6b432e");rect(-10,-25,20,10,"#b97a46");rect(-6,2,4,4,"#111");rect(5,2,4,4,"#111");
    }else if(e.type==="blackslime"){
      rect(-22,-8,44,22,"#17141c");rect(-16,-18,32,16,"#24212b");rect(-8,-24,16,8,"#302b38");rect(-7,-7,4,4,"#b8f4ff");rect(4,-7,4,4,"#b8f4ff");
    }else if(e.type==="leafcrow"){
      rect(-16,-5,32,18,"#2d241d");rect(-8,-16,16,14,"#3f3326");rect(12,-8,16,8,"#5b3d1c");rect(-22,-3,12,10,"#1d1714");rect(2,-11,4,4,"#fff4b8");
    }else if(e.type==="vine"||e.type==="poisonvine"){
      rect(-10,-25,20,50,e.type==="poisonvine"?"#3f7a32":"#355d2e");rect(-22,-10,14,22,"#4d8f3f");rect(8,-16,17,22,"#4d8f3f");rect(-5,-12,4,4,"#ffe6a2");rect(5,-12,4,4,"#ffe6a2");
    }else if(e.type==="barkguard"||e.type==="oldwood"||e.type==="rottenwood"||e.type==="shadowtree"){
      rect(-18,-30,36,58,e.type==="shadowtree"?"#35273a":"#60462f");rect(-13,-22,26,15,e.type==="shadowtree"?"#4c3852":"#7a5b3b");rect(-22,-45,10,16,"#2c5e34");rect(13,-45,12,18,"#2c5e34");rect(-9,-13,5,5,"#111");rect(5,-13,5,5,"#111");rect(-7,8,14,5,"#2b1d16");
    }else if(e.type==="ghostfire"){
      rect(-15,-20,30,35,"#45d7ff");rect(-9,-28,18,18,"#92f4ff");rect(-5,-7,4,5,"#0e1d26");rect(6,-7,4,5,"#0e1d26");
    }else if(e.type==="nighthawk"){
      rect(-6,-28,12,48,"#202034");rect(-34,-12,28,16,"#151521");rect(6,-12,34,16,"#151521");rect(-4,-20,4,4,"#d9f6ff");rect(5,-20,4,4,"#d9f6ff");rect(-2,-13,6,5,"#6b4b1e");
    }else if(e.type==="witch"){
      rect(-14,-20,28,46,"#352047");rect(-18,-30,36,10,"#181020");rect(-8,-45,16,18,"#181020");rect(-10,-16,20,18,"#cfa987");rect(-5,-10,4,4,"#111");rect(5,-10,4,4,"#111");rect(20,-14,7,13,"#b8f4ff");rect(21,-10,5,8,"#6fdd4f");
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
    if(!screenPointVisible(p,72))return;
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
    if(!screenPointVisible(p,92))return;
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

  function drawPixelDiamond(cx,cy,scale=1){
    const s=scale;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.scale(s,s);
    ctx.imageSmoothingEnabled=false;

    ctx.fillStyle="#0b2c73";
    ctx.beginPath();
    ctx.moveTo(-20,-7);
    ctx.lineTo(-12,-17);
    ctx.lineTo(12,-17);
    ctx.lineTo(20,-7);
    ctx.lineTo(0,18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#46c6f2";
    ctx.beginPath();
    ctx.moveTo(-15,-6);
    ctx.lineTo(-8,-14);
    ctx.lineTo(0,-6);
    ctx.lineTo(-4,9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#8feeff";
    ctx.beginPath();
    ctx.moveTo(-8,-14);
    ctx.lineTo(0,-16);
    ctx.lineTo(8,-14);
    ctx.lineTo(0,-6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#27a7df";
    ctx.beginPath();
    ctx.moveTo(0,-6);
    ctx.lineTo(8,-14);
    ctx.lineTo(15,-6);
    ctx.lineTo(5,9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#137ec4";
    ctx.beginPath();
    ctx.moveTo(-18,-6);
    ctx.lineTo(-15,-10);
    ctx.lineTo(-4,9);
    ctx.lineTo(0,18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#0d5aa5";
    ctx.beginPath();
    ctx.moveTo(18,-6);
    ctx.lineTo(15,-10);
    ctx.lineTo(5,9);
    ctx.lineTo(0,18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#1bb8e8";
    ctx.beginPath();
    ctx.moveTo(-4,9);
    ctx.lineTo(0,-6);
    ctx.lineTo(5,9);
    ctx.lineTo(0,18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle="#09346f";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(-20,-7);
    ctx.lineTo(-12,-17);
    ctx.lineTo(12,-17);
    ctx.lineTo(20,-7);
    ctx.lineTo(0,18);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18,-6);ctx.lineTo(18,-6);
    ctx.moveTo(-8,-14);ctx.lineTo(-4,9);
    ctx.moveTo(8,-14);ctx.lineTo(5,9);
    ctx.moveTo(0,-6);ctx.lineTo(0,18);
    ctx.stroke();

    rect(-11,-13,5,3,"#d8fbff");
    rect(5,-14,4,3,"#c9f8ff");
    rect(9,-5,3,8,"#6fe1ff");
    rect(-2,-3,3,14,"rgba(255,255,255,.35)");
    ctx.restore();
  }

  function drawPixelBomb(cx,cy,scale=1){
    const s=scale;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.scale(s,s);

    ctx.fillStyle="#07090c";
    ctx.beginPath();
    ctx.arc(0,3,15,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#151b20";
    ctx.beginPath();
    ctx.arc(-3,1,13,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#2d353b";
    ctx.beginPath();
    ctx.arc(-6,-4,5,0,Math.PI*2);
    ctx.fill();

    rect(-6,-16,12,9,"#0b0d10");
    rect(-4,-18,8,4,"#333a40");
    rect(-4,-15,8,3,"#1f252a");

    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.strokeStyle="#3c2a17";
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.moveTo(3,-17);
    ctx.quadraticCurveTo(12,-28,27,-21);
    ctx.stroke();

    ctx.strokeStyle="#9b7242";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(4,-18);
    ctx.quadraticCurveTo(13,-27,27,-21);
    ctx.stroke();

    const flicker=Math.sin(time*18)*1.5;
    ctx.fillStyle="#ff6b23";
    ctx.beginPath();
    ctx.moveTo(29,-25-flicker);
    ctx.lineTo(38,-18);
    ctx.lineTo(30,-12);
    ctx.lineTo(23,-18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle="#ffe86a";
    ctx.beginPath();
    ctx.moveTo(30,-23-flicker*.6);
    ctx.lineTo(35,-18);
    ctx.lineTo(30,-15);
    ctx.lineTo(27,-18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawPickup(pickup){
    const p=worldToScreen(pickup.x,pickup.y),bob=Math.sin(time*5+pickup.phase)*5;
    if(!screenPointVisible(p,96))return;
    ctx.globalAlpha=.22+.12*Math.sin(time*7+pickup.phase);
    ctx.fillStyle=pickup.type==="coin"?"#65dfff":pickup.type==="heal"?"#77ff89":pickup.type==="potion"?"#ff8fc3":"#ff8b55";
    ctx.beginPath();ctx.arc(p.x,p.y+bob,29,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    if(pickup.type==="coin"){
      drawPixelDiamond(p.x,p.y+bob,1);
    }else if(pickup.type==="bomb"){
      drawPixelBomb(p.x,p.y+bob,.95);
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
      if(e.kind==="cookiePress"){
        const p=worldToScreen(e.x,e.y);
        const active=e.delay<=0;
        const growT=active?1:clamp(1-e.delay/(e.maxDelay||1.3),0,1);
        const eased=1-Math.pow(1-growT,3);
        const rr=(e.startR||8)+(e.r-(e.startR||8))*eased;
        ctx.save();
        ctx.globalAlpha=active?clamp(e.life*2,0,1):.28+.18*Math.sin(time*18);
        ctx.fillStyle=active?"#d17a3c":"#d72f3f";
        ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=active?.88:.75;
        ctx.strokeStyle=active?"#fff0c4":"#ff4f68";
        ctx.lineWidth=active?10:5;
        ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=active?.75:.55;
        ctx.strokeStyle="#8a4c25";
        ctx.lineWidth=6;
        ctx.beginPath();ctx.arc(p.x,p.y,rr*.68,0,Math.PI*2);ctx.stroke();
        ctx.restore();
        continue;
      }
      if(e.kind==="toyTrainCross"){
        const p=worldToScreen(e.x,e.y);
        const active=e.delay<=0;
        const railTime=e.railTime||1;
        const born=(e.maxLife||1)-e.life;
        const railAlpha=clamp(born/railTime,0,1)*clamp(e.life*2,0,1);
        const warning=born>=railTime&&!active;
        const halfLen=e.halfLen||Math.max(W,H)*.6;
        const width=e.width||90;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(e.angle||0);
        ctx.globalAlpha=railAlpha*(active?.88:.62);
        ctx.fillStyle=active?"#211b20":"#33262c";
        ctx.fillRect(-halfLen,-width*.34,halfLen*2,width*.68);
        ctx.globalAlpha=railAlpha*(warning?.85:active?.92:.72);
        ctx.strokeStyle=warning?"#ff4058":active?"#8c7a58":"#7f6f55";
        ctx.lineWidth=warning?7:5;
        ctx.beginPath();
        ctx.moveTo(-halfLen,-width*.22);ctx.lineTo(halfLen,-width*.22);
        ctx.moveTo(-halfLen,width*.22);ctx.lineTo(halfLen,width*.22);
        ctx.stroke();
        ctx.globalAlpha=railAlpha*(warning?.78:active?.72:.45);
        ctx.fillStyle=warning?"#ff9ca8":"#d9ac5c";
        for(let x=-halfLen+12;x<halfLen;x+=42)rect(x,-3,18,6,ctx.fillStyle);
        if(active){
          const t=e.activeTime||0;
          const trainT=clamp(t/(e.trainDuration||1.2),0,1);
          const head=-halfLen-120+trainT*(halfLen*2+240);
          const drawTrainCar=(x,y,w,h)=>{
            rect(x-w/2,y-h/2,w,h,"#202532");
            rect(x-w/2+4,y-h/2+4,w-8,h-8,"#44536b");
            rect(x-w/2+8,y-h/2+7,12,h-14,"#ffe46a");
            rect(x+w/2-10,y-h/2+6,6,h-12,"#d75b48");
            rect(x-w/2+5,y+h/2-5,w-10,3,"#111217");
          };
          ctx.globalAlpha=clamp(e.life*2,0,1);
          for(let i=0;i<4;i++)drawTrainCar(head-i*54,0,46,34);
        }
        ctx.restore();
        continue;
      }
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
      if(e.forestWhip){
        ctx.globalAlpha=active?clamp(e.life*2,0,1):.65;
        for(let i=0;i<8;i++){
          const x=-45+i*112;
          rect(x,-e.width*.18,86,Math.max(10,e.width*.36),active?(i%2?"#7a512b":"#4d321f"):"#ff334f");
          if(active){
            rect(x+18,-e.width*.34,9,Math.max(8,e.width*.28),"#2d1c12");
            rect(x+52,e.width*.14,12,Math.max(8,e.width*.25),"#2d1c12");
          }
        }
      }
      ctx.globalAlpha=1;
      rect(-80,-2,1030,4,active?"#fff0bd":e.line);
      ctx.restore();
    }
  }

  function drawEnemyShot(shot){
    const p=worldToScreen(shot.x,shot.y);
    if(!screenPointVisible(p,(shot.r||0)+42))return;
    if(shot.kind==="seed"){
      ctx.globalAlpha=.24;ctx.fillStyle="#8cff75";ctx.beginPath();ctx.arc(p.x,p.y,shot.r+6,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle="#8b4a22";ctx.beginPath();ctx.ellipse(p.x,p.y,shot.r*.75,shot.r,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#d9954b";ctx.beginPath();ctx.ellipse(p.x-shot.r*.16,p.y-shot.r*.22,Math.max(2,shot.r*.28),Math.max(2,shot.r*.38),0,0,Math.PI*2);ctx.fill();
      return;
    }
    if(shot.kind==="coin"){
      ctx.globalAlpha=.22;ctx.fillStyle="#ffd65a";ctx.beginPath();ctx.arc(p.x,p.y,shot.r+6,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle="#b67819";ctx.beginPath();ctx.arc(p.x,p.y,shot.r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#ffe98f";ctx.beginPath();ctx.arc(p.x,p.y,Math.max(2,shot.r-3),0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#8f5a12";ctx.fillRect(Math.round(p.x-1),Math.round(p.y-shot.r+3),2,Math.round(shot.r*2-6));
      return;
    }
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
    const glow=type==="coin"?"#65dfff":type==="heal"?"#77ff89":type==="potion"?"#ff8fc3":"#ff8b55";
    ctx.globalAlpha=.34+.16*Math.sin(time*8);
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(iconX,iconY,27,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
    if(type==="coin"){
      drawPixelDiamond(iconX,iconY,1);
    }else if(type==="bomb"){
      drawPixelBomb(iconX,iconY,.9);
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

  function drawTreasureLocator(type,iconX,iconY,seconds,arrowX=null,arrowY=null,angle=0){
    ctx.save();
    const color=type==="coin"?"#6fe6ff":type==="heal"?"#77ff89":type==="potion"?"#ff8fc3":"#ff8b55";
    if(arrowX!==null){
      ctx.translate(arrowX,arrowY);
      ctx.rotate(angle);
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.moveTo(23,0);
      ctx.lineTo(-5,-13);
      ctx.lineTo(-5,13);
      ctx.closePath();
      ctx.fill();
      ctx.setTransform(1,0,0,1,0,0);
    }
    ctx.globalAlpha=.28+.14*Math.sin(time*8);
    ctx.strokeStyle=color;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.arc(iconX,iconY,20,0,Math.PI*2);
    ctx.stroke();
    ctx.globalAlpha=1;
    ctx.strokeStyle="#111";
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.moveTo(iconX-25,iconY);
    ctx.lineTo(iconX-13,iconY);
    ctx.moveTo(iconX+13,iconY);
    ctx.lineTo(iconX+25,iconY);
    ctx.moveTo(iconX,iconY-25);
    ctx.lineTo(iconX,iconY-13);
    ctx.moveTo(iconX,iconY+13);
    ctx.lineTo(iconX,iconY+25);
    ctx.stroke();
    ctx.strokeStyle=color;
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(iconX-25,iconY);
    ctx.lineTo(iconX-13,iconY);
    ctx.moveTo(iconX+13,iconY);
    ctx.lineTo(iconX+25,iconY);
    ctx.moveTo(iconX,iconY-25);
    ctx.lineTo(iconX,iconY-13);
    ctx.moveTo(iconX,iconY+13);
    ctx.lineTo(iconX,iconY+25);
    ctx.stroke();
    ctx.font="bold 13px monospace";
    ctx.textAlign="center";
    ctx.lineWidth=4;
    ctx.strokeStyle="#111";
    ctx.strokeText(`${seconds}s`,iconX,iconY+37);
    ctx.fillStyle="#fff";
    ctx.fillText(`${seconds}s`,iconX,iconY+37);
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
        const iconY=Math.max(margin,Math.min(H-margin,p.y));
        drawTreasureLocator(pickup.type,iconX,iconY,seconds);
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
      drawTreasureLocator(pickup.type,iconX,iconY,seconds,x,y,angle);
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
    if(!screenPointVisible(p,(b.r||0)+48))return;
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
    if(confuseTimer>0)rows.push([`迷失 ${confuseTimer.toFixed(1)}s`,"#d9a7ff"]);
    if(luminousSlashActiveTimer>0)rows.push([`流光二連斬 ${luminousSlashActiveTimer.toFixed(1)}s`,"#7fe8ff"]);
    if(hudWaveSeconds>0)rows.push([`怪潮 ${hudWaveSeconds.toFixed(1)}s`,"#ffb35c"]);
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

  function luminousSlashButtonLayout(){
    const r=31;
    return {x:W-r-18,y:Math.max(250,Math.min(H-210,H*.58)),r};
  }
  function drawLuminousSlashButton(){
    if(!luminousSlashAvailable())return;
    const {x,y,r}=luminousSlashButtonLayout();
    const active=luminousSlashActiveTimer>0;
    const cooling=!active&&luminousSlashCooldownTimer>0;
    ctx.save();
    ctx.translate(x,y);
    ctx.globalAlpha=.96;
    ctx.fillStyle=active?"#103b66":"#1b1737";
    ctx.strokeStyle=active?"#7ff4ff":cooling?"#8b8b98":"#5fe6ff";
    ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.lineWidth=2;
    ctx.strokeStyle=active?"#d7fbff":"#21375e";
    ctx.beginPath();ctx.arc(0,0,r-8,0,Math.PI*2);ctx.stroke();
    ctx.font="bold 17px 'Microsoft JhengHei',sans-serif";
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.lineWidth=4;ctx.strokeStyle="#081025";ctx.fillStyle="#ffe75f";
    ctx.strokeText("二連",0,-5);ctx.fillText("二連",0,-5);
    ctx.font="bold 11px monospace";
    ctx.fillStyle=active?"#aef9ff":"#c9f7ff";
    ctx.fillText(`${Math.round(luminousSlashChance()*100)}%`,0,15);
    if(cooling){
      const cooldownLeft=Math.min(LUMINOUS_SLASH_COOLDOWN,luminousSlashCooldownTimer);
      const ratio=clamp(cooldownLeft/LUMINOUS_SLASH_COOLDOWN,0,1);
      ctx.fillStyle="rgba(80,80,90,.72)";
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0,r+1,-Math.PI/2,-Math.PI/2+Math.PI*2*ratio,false);
      ctx.closePath();ctx.fill();
      ctx.font="bold 12px monospace";
      ctx.fillStyle="#ffffff";
      ctx.strokeStyle="#111";
      ctx.lineWidth=3;
      const label=`${cooldownLeft.toFixed(1)}s`;
      ctx.strokeText(label,0,0);ctx.fillText(label,0,0);
    }else if(active){
      ctx.font="bold 12px monospace";
      ctx.fillStyle="#ffffff";
      ctx.strokeStyle="#063053";
      ctx.lineWidth=3;
      const label=`${luminousSlashActiveTimer.toFixed(1)}s`;
      ctx.strokeText(label,0,30);ctx.fillText(label,0,30);
    }
    ctx.restore();
  }

  function handleLuminousSlashPointer(e){
    if(!running||paused||ended||!luminousSlashAvailable())return false;
    const rect=canvas.getBoundingClientRect();
    const px=(e.clientX-rect.left)*W/Math.max(1,rect.width);
    const py=(e.clientY-rect.top)*H/Math.max(1,rect.height);
    const {x,y,r}=luminousSlashButtonLayout();
    if(Math.hypot(px-x,py-y)>r+10)return false;
    e.preventDefault();
    if(activateLuminousSlash())playUiClick();
    else beep(180,.08,.025,"square");
    return true;
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
  function formatEnemyHudCount(count){
    return hudKpsBonus>0?`${count}(+${hudKpsBonus})`:`${count}`;
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
      const diamondText=`💎 ${formatCommaNumber(runCoins)}`;
      drawAutoTrainingHudText(W-24-ctx.measureText(diamondText).width,100,"right");
      ctx.fillText(diamondText,W-14,100);
      ctx.fillStyle="#fff";
      ctx.fillText(`擊倒 ${hudKills}`,W-14,124);
      ctx.fillStyle=kpsPressure>0?"#ffe15b":"#d8f2ff";
      ctx.fillText(`KPS ${Math.round(hudKps)}  怪物 ${formatEnemyHudCount(enemyCount)}`,W-14,148);
      ctx.fillStyle="#fff";
      ctx.fillText(`🥕×${player.projectiles} 穿透${player.pierce} 爆擊${formatHudPercent(player.critStack*100)}`,W-14,172);
      ctx.fillText(`旋風${skills.orbit} 菜園${skills.burst} 花生${skills.peanut} PINKY${skills.pinky} 二連${skills.luminousSlash}`,W-14,196);
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
    ctx.font="bold 15px monospace";ctx.fillStyle="#ffe16c";
    const compactDiamondText=`💎 ${formatCommaNumber(runCoins)}`;
    ctx.fillText(compactDiamondText,14,88);
    drawAutoTrainingHudText(24+ctx.measureText(compactDiamondText).width,88,"left");
    ctx.fillStyle="#fff";ctx.fillText(`擊倒 ${hudKills}  KPS ${Math.round(hudKps)}  怪物 ${formatEnemyHudCount(enemyCount)}`,14,108);
    const stageTimeLabel=stageTimerLabel();
    ctx.textAlign="center";ctx.font="bold 25px monospace";ctx.lineWidth=1;ctx.strokeStyle="#000";ctx.fillStyle=isInfiniteMode()?"#d8f6ff":time>=480?"#ff6270":"#fff4b2";
    ctx.strokeText(stageTimeLabel,VW/2,22);
    ctx.fillText(stageTimeLabel,VW/2,22);
    ctx.textAlign="right";ctx.font="bold 13px monospace";ctx.fillStyle="#fff";
    ctx.fillText(`🥕×${player.projectiles} 穿透${player.pierce} 爆擊${formatHudPercent(player.critStack*100)}`,VW-14,21);
    ctx.fillText(`旋風${skills.orbit} 菜園${skills.burst} 花生${skills.peanut} 二連${skills.luminousSlash}`,VW-14,43);
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
    ctx.font="bold 16px monospace";ctx.fillStyle="#ffe16c";
    const desktopDiamondText=`💎 ${formatCommaNumber(runCoins)}`;
    ctx.fillText(desktopDiamondText,18,92);
    drawAutoTrainingHudText(28+ctx.measureText(desktopDiamondText).width,92,"left");
    ctx.fillStyle="#fff";ctx.fillText(`擊倒 ${hudKills}  KPS ${Math.round(hudKps)}  怪物 ${formatEnemyHudCount(enemyCount)}`,18,116);
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
    ctx.fillText(`旋風${skills.orbit} 菜園${skills.burst} 花生${skills.peanut} PINKY${skills.pinky} 二連${skills.luminousSlash}`,W-350,47);
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
    const activePooledShots=shotPoolActiveCount();
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
        ["追趕Update",`${perfDebugLast.catchUpMax} 次`,debugColor(perfDebugLast.catchUpMax,1,2)],
        ["Shot池",`${activePooledShots}/${shotPool.length}`,debugColor(shotPool.length,SHOT_POOL_INITIAL_SIZE+1,SHOT_POOL_INITIAL_SIZE*2)],
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

  function drawBlizzardOverlay(){
    if(blizzardTimer<=0)return;
    const strength=clamp(blizzardTimer/1.2,0,1);
    ctx.save();
    ctx.globalAlpha=.18*strength;
    rect(0,0,W,H,"#cfefff");
    ctx.globalAlpha=.28*strength;
    ctx.strokeStyle="#f5fbff";
    ctx.lineWidth=3;
    for(let i=0;i<76;i++){
      const drift=time*(120+(i%5)*24);
      const x=((i*137+drift*.55+Math.sin(time*1.7+i)*28)%(W+140))-70;
      const y=((i*79+drift)%(H+120))-60;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x-18-(i%3)*5,y+18+(i%4)*4);
      ctx.stroke();
    }
    ctx.globalAlpha=.52*strength;
    ctx.font="bold 15px 'Courier New','Microsoft JhengHei',monospace";
    ctx.textAlign="right";
    ctx.lineWidth=4;
    ctx.strokeStyle="#102031";
    ctx.fillStyle="#d8f6ff";
    ctx.strokeText(`零度 ${blizzardTimer.toFixed(1)}s`,W-16,H>W?210:78);
    ctx.fillText(`零度 ${blizzardTimer.toFixed(1)}s`,W-16,H>W?210:78);
    ctx.restore();
    ctx.textAlign="left";
  }

  function draw(){
    countPerfWork("enemyDraw",enemies.length);
    countPerfWork("projectileDraw",shots.length+petShots.length+enemyShots.length+bananas.length);
    countPerfWork("effectDraw",effects.length);
    countPerfWork("textDraw",texts.length);
    drawGround();drawBossArena();drawBossObstacles("trunk");drawGroundEffects();drawBeamWarnings();for(const g of gems)drawGem(g);for(const chest of chests)drawChest(chest);for(const pickup of pickups)drawPickup(pickup);drawSkills();
    for(const e of enemies)drawEnemy(e);
    for(const s of shots)drawCarrot(s);
    for(const s of petShots){
      const p=worldToScreen(s.x,s.y);
      if(!screenPointVisible(p,(s.r||0)+52))continue;
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
    const effectConfig=performanceConfig();
    for(const e of effects){
      if(e.kind==="flash"||e.kind==="crater")continue;
      if(e.kind==="luminousSlash"&&e.delay>0)continue;
      const p=worldToScreen(e.x,e.y);
      if(!screenPointVisible(p,effectDrawMargin(e)))continue;
      if(e.kind==="particle"||e.kind==="chip"){
        if(effectConfig.particleGlow&&e.kind==="particle"){
          ctx.globalAlpha=clamp(e.life*1.8,0,.32);
          rect(p.x-e.r,p.y-e.r,e.r*3,e.r*3,e.color);
          ctx.globalAlpha=1;
        }
        rect(p.x,p.y,e.r,e.r,e.color);
      }
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
      else if(e.kind==="treantSeed"||e.kind==="poisonMushroom"){
        const z=e.z||0;
        ctx.globalAlpha=.26;ctx.fillStyle="#05030a";ctx.beginPath();ctx.ellipse(p.x,p.y+7,18,6,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
        if(e.kind==="poisonMushroom"){
          rect(p.x-13,p.y-z-4,26,16,"#4c2c61");
          rect(p.x-20,p.y-z-17,40,16,"#8c5cc4");
          rect(p.x-9,p.y-z-21,18,8,"#caa6ff");
          rect(p.x-4,p.y-z-13,5,4,"#fff0ff");
          if(e.landed&&!e.exploded){
            ctx.globalAlpha=.28+.18*Math.sin(time*16);
            ctx.fillStyle="#a669ff";ctx.beginPath();ctx.arc(p.x,p.y,82,0,Math.PI*2);ctx.fill();
            ctx.globalAlpha=1;
          }
        }else{
          rect(p.x-9,p.y-z-13,18,21,"#7a5732");
          rect(p.x-13,p.y-z-20,26,12,"#3d7a38");
          rect(p.x-3,p.y-z-25,6,9,"#6fbf5b");
        }
      }
      else if(e.kind==="saplingBomb"){
        ctx.globalAlpha=.24;ctx.fillStyle="#05030a";ctx.beginPath();ctx.ellipse(p.x,p.y+12,16,6,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
        rect(p.x-9,p.y-18,18,31,"#7c5632");
        rect(p.x-15,p.y-27,30,15,"#4f8a3c");
        rect(p.x-4,p.y-12,3,4,"#fff2a8");
        rect(p.x+5,p.y-12,3,4,"#fff2a8");
        ctx.globalAlpha=.18+.12*Math.sin(time*18);
        ctx.fillStyle="#ffe15b";ctx.beginPath();ctx.arc(p.x,p.y,28,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }
      else if(e.kind==="rockFragment"){
        const shadowScale=clamp(1-e.z/90,.25,1);
        ctx.globalAlpha=.28;ctx.fillStyle="#2f2925";ctx.beginPath();ctx.ellipse(p.x,p.y,e.r*shadowScale,e.r*.45*shadowScale,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;rect(p.x-e.r,p.y-e.z-e.r,e.r*2,e.r*2,"#756252");rect(p.x-e.r*.4,p.y-e.z-e.r*.6,e.r*.7,e.r*.55,"#b49a7c");
      }else if(e.kind==="luminousSlash"){
        const age=(e.maxLife||0)-e.life;
        const fadeIn=Math.max(.001,e.fadeIn||.05);
        const fadeOut=Math.max(.001,e.fadeOut||.15);
        const reveal=clamp(age/(e.drawSec||e.maxLife||1),0,1);
        const fadeInAlpha=clamp(age/fadeIn,0,1);
        const fadeOutAlpha=clamp(e.life/fadeOut,0,1);
        const alpha=(e.opacity??.94)*Math.min(fadeInAlpha,fadeOutAlpha);
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(e.angle||0);
        ctx.globalAlpha=alpha;
        const imgReady=luminousSlashImg.complete&&luminousSlashImg.naturalWidth>0;
        if(imgReady){
          const w=luminousSlashImg.naturalWidth*(e.scale||.11);
          const h=luminousSlashImg.naturalHeight*(e.scale||.11);
          const left=-(e.anchorX??.37)*w;
          const top=-(e.anchorY??.64)*h;
          ctx.beginPath();
          ctx.rect(left,top,w*reveal,h);
          ctx.clip();
          ctx.drawImage(luminousSlashImg,left,top,w,h);
        }else{
          const len=160*reveal,thick=18;
          ctx.strokeStyle="#bff6ff";ctx.lineWidth=thick;ctx.lineCap="round";
          ctx.beginPath();ctx.moveTo(-len*.38,len*.38);ctx.lineTo(len*.62,-len*.62);ctx.stroke();
          ctx.strokeStyle="#49b7ff";ctx.lineWidth=thick*.45;
          ctx.beginPath();ctx.moveTo(-len*.38,len*.38);ctx.lineTo(len*.62,-len*.62);ctx.stroke();
        }
        ctx.restore();
      }else if(e.kind==="shockwave"){
        if(effectConfig.impactGlow){
          ctx.globalAlpha=clamp(e.life*1.5,0,.28);ctx.strokeStyle="#fff2a0";ctx.lineWidth=16;ctx.beginPath();ctx.arc(p.x,p.y,e.r,0,Math.PI*2);ctx.stroke();
        }
        ctx.globalAlpha=clamp(e.life*2,0,1);ctx.strokeStyle="#ffd36a";ctx.lineWidth=9;ctx.beginPath();ctx.arc(p.x,p.y,e.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      }else if(e.kind==="leafStorm"){
        const ratio=clamp(e.life/e.maxLife,0,1);
        ctx.save();
        ctx.globalAlpha=.12+.16*ratio;
        ctx.fillStyle=e.dark?"#5e3b7a":"#5d7d35";
        ctx.beginPath();ctx.arc(p.x,p.y,e.r,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=.55*ratio;
        ctx.strokeStyle=e.dark?"#8b63be":"#a6d15f";
        ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(p.x,p.y,e.r*.72,0,Math.PI*2);ctx.stroke();
        for(let i=0;i<18;i++){
          const a=e.phase+time*(e.dark?3.6:3)+i*Math.PI*2/18;
          const rr=e.r*(.25+(i%6)*.09);
          const x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr;
          ctx.save();
          ctx.translate(x,y);
          ctx.rotate(a+Math.PI/2);
          ctx.globalAlpha=(.45+(i%3)*.12)*ratio;
          if(i%5===0){
            rect(-2,-11,4,22,e.dark?"#4a2d4e":"#5a3a22");
            rect(-7,-2,14,4,e.dark?"#2c1d33":"#3d2818");
          }else{
            rect(-5,-8,10,16,i%3===0?(e.dark?"#b9a3ff":"#dde78c"):i%3===1?"#d8f0d3":"#202318");
          }
          ctx.restore();
        }
        ctx.restore();
      }else if(e.kind==="slash"){
        if(effectConfig.impactGlow){
          ctx.globalAlpha=clamp(e.life*3.2,0,.28);ctx.strokeStyle="#ffd36a";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(p.x-e.r,p.y+e.r);ctx.lineTo(p.x+e.r,p.y-e.r);ctx.stroke();
        }
        ctx.globalAlpha=clamp(e.life*5,0,1);ctx.strokeStyle="#fffbe1";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x-e.r,p.y+e.r);ctx.lineTo(p.x+e.r,p.y-e.r);ctx.stroke();ctx.globalAlpha=1;
      }else if(e.kind==="half"){
        ctx.globalAlpha=clamp(e.life*2,0,1);rect(p.x+(e.side<0?-e.r:0),p.y-e.r/2,e.r,e.r,e.color);ctx.globalAlpha=1;
      }
    }
    drawPet();drawBunny();drawBossObstacles("canopy");
    drawBlizzardOverlay();
    for(const t of texts){
      const p=worldToScreen(t.x,t.y);
      if(!screenPointVisible(p,Math.max(80,(t.size||18)*4)))continue;
      if(t.kind==="critical"){
        drawCriticalText(t,p);
      }else if(t.kind==="luminousCritical"){
        drawLuminousCriticalText(t,p);
      }else{
        ctx.globalAlpha=clamp(t.life*2,0,1);ctx.font=`bold ${t.size}px sans-serif`;ctx.textAlign="center";
        if(t.kind==="pickup"){ctx.lineWidth=Math.max(4,Math.round(t.size*.18));ctx.strokeStyle="#111";ctx.strokeText(t.value,p.x,p.y);}
        ctx.fillStyle=t.color;ctx.fillText(t.value,p.x,p.y);
      }
    }
    ctx.globalAlpha=1;ctx.textAlign="left";ctx.textBaseline="alphabetic";
    drawHUD();
    drawLuminousSlashButton();
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
    if(isBossChallengeMode())return 0;
    if(isEventMode()){
      const earned=settleActivityReward(success);
      settleRunCoins();
      meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
      saveMeta();
      return earned;
    }
    const normalKills=Math.max(0,kills-eliteKills-bossKills);
    const baseEarned=Math.floor(normalKills/25)+eliteKills*3+bossKills*10+(success?25:0)+Math.floor(time/60)*3;
    settleRunCoins();
    settleAutoTrainingAfterRun();
    if(isInfiniteMode()){
      const earned=applyPointRewardBonus(Math.floor(baseEarned*.3));
      meta.points+=earned;
      meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
      meta.infiniteTotalKills=(meta.infiniteTotalKills||0)+kills;
      saveMeta();
      return earned;
    }
    const earned=applyPointRewardBonus(baseEarned);
    meta.points+=earned;
    meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
    meta.totalKills+=kills;
    meta.totalElites+=eliteKills;
    meta.totalBosses+=bossKills;
    saveMeta();
    return earned;
  }
  function settleAutoTrainingAfterRun(){
    if(autoTrainingSettled)return;
    autoTrainingSettled=true;
    if(autoTrainingSource!=="charm"||!isInfiniteMode()||!meta.autoTrainingCharm)return;
    const usedMinutes=Math.floor(time/60);
    if(usedMinutes<1)return;
    meta.autoTrainingCharmUsedMinutes=Math.max(0,Math.min(480,Math.floor(Number(meta.autoTrainingCharmUsedMinutes)||0)+usedMinutes));
    if(meta.autoTrainingCharmUsedMinutes>=480){
      meta.autoTrainingCharm=false;
      meta.autoTrainingCharmUsedMinutes=0;
    }
  }

  function rewardTotalLines(){
    return `目前共 💎 ${formatCommaNumber(meta.coins||0)} 鑽石<br>目前共 ${formatCommaNumber(meta.points||0)} 點`;
  }

  function recordDeathRunStats(){
    settleRunCoins();
    if(isEventMode()){
      saveMeta();
      return;
    }
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
    if(isBossChallengeMode()){
      renderMeta();
      endScreen.classList.remove("hidden");
      document.getElementById("endTitle").textContent="頭目挑戰完成";
      document.getElementById("endSub").textContent=`兔兔擊敗了 ${finalBossDisplayName(bossChallengeType)}`;
      const clearTime=Math.max(0,time-bossChallengeStartTime);
      document.getElementById("endText").innerHTML=`此為測試模式用；要更新請詢問用戶。<br>擊敗時間 ${formatStageTime(clearTime)}<br>等級 ${player.level}<br>擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>本局不結算強化點數與通關解鎖`;
      beep(660,.4,.05);
      return;
    }
    if(isEventMode()){
      renderMeta();
      endScreen.classList.remove("hidden");
      if(lastActivityReward.mode===ACTIVITY_TRIAL_MODE){
        document.getElementById("endTitle").textContent="強化試煉完成！";
        document.getElementById("endSub").textContent="兔兔帶回了活動兌換幣與突破原石";
        document.getElementById("endText").innerHTML=`擊倒 ${kills}・活動 Boss ${bossKills}<br>本局獲得活動兌換幣 ${formatCommaNumber(lastActivityReward.coins)}<br>本局獲得突破原石 ${formatBreakStoneDrops(lastActivityReward.stones)}<br>目前活動兌換幣 ${formatCommaNumber(meta.activityCoins||0)}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`;
      }else{
        document.getElementById("endTitle").textContent="胡鬧的胡蘿蔔擊退！";
        document.getElementById("endSub").textContent="兔兔撿回了神秘胡蘿蔔種子";
        document.getElementById("endText").innerHTML=`擊倒 ${kills}・活動 Boss ${bossKills}<br>本局獲得活動兌換幣 ${formatCommaNumber(lastActivityReward.coins)}<br>本局獲得強化點數 ${formatCommaNumber(lastActivityReward.points)}<br>本局獲得神秘胡蘿蔔種子 ${formatCommaNumber(lastActivityReward.seeds)} 顆<br>目前共有神秘胡蘿蔔種子 ${formatCommaNumber(meta.garden?.seeds||0)} 顆<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`;
      }
      beep(660,.4,.05);
      return;
    }
    if(currentStage===1)meta.stage1Cleared=true;
    if(currentStage===2)meta.stage2Cleared=true;
    if(currentStage===3)meta.stage3Cleared=true;
    if(currentStage===4)meta.stage4Cleared=true;
    if(currentStage===5)meta.stage5Cleared=true;
    if(currentStage===6)meta.stage6Cleared=true;
    if(currentStage===7)meta.stage7Cleared=true;
    if(currentStage===8)meta.stage8Cleared=true;
    if(currentStage===9)meta.stage9Cleared=true;
    if(currentStage===10)meta.stage10Cleared=true;
    if(currentStage===11)meta.stage11Cleared=true;
    if(currentStage===1&&!meta.desertUnlocked)meta.desertUnlocked=true;
    if(currentStage===2&&!meta.snowUnlocked)meta.snowUnlocked=true;
    if(currentStage===3&&!meta.forestPathUnlocked)meta.forestPathUnlocked=true;
    if(currentStage===4&&!meta.forestSeaUnlocked)meta.forestSeaUnlocked=true;
    if(currentStage===5&&!meta.cookieUnlocked)meta.cookieUnlocked=true;
    if(currentStage===6&&!meta.toyUnlocked)meta.toyUnlocked=true;
    saveMeta();
    renderMeta();
    endScreen.classList.remove("hidden");
    const clearTitles={
      1:"菜園守護成功！",2:"沙漠遺跡征服成功！",3:"雪原深處征服成功！",4:"幽影林徑征服成功！",
      5:"幽影樹海征服成功！",6:"奶油餅乾屋征服成功！",7:"玩具夢工廠停止運轉！",8:"熔岩工坊冷卻成功！",
      9:"海底遺跡探索成功！",10:"星夜鐘塔停止轉動！",11:"虛空核心封印成功！"
    };
    document.getElementById("endTitle").textContent=clearTitles[currentStage]||`${currentStageLabel()}征服成功！`;
    document.getElementById("endSub").textContent=`兔兔擊敗了${finalBossDisplayName(normalFinalBossType())}`;
    document.getElementById("endText").innerHTML=`等級 ${player.level}<br>擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>${pointRewardLine(earned)}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`;
    beep(660,.4,.05);
  }

  function lose(){
    if(ended)return;
    ended=true;running=false;
    pauseBtn.classList.remove("visible");pauseScreen.classList.add("hidden");
    updateMonitorButtons();
    const earned=awardRun(false);
    if(!isBossChallengeMode())recordDeathRunStats();
    renderMeta();
    endScreen.classList.remove("hidden");
    document.getElementById("endTitle").textContent=isBossChallengeMode()?"頭目挑戰失敗":"兔兔倒下了";
    document.getElementById("endSub").textContent=isBossChallengeMode()?`挑戰 ${finalBossDisplayName(bossChallengeType)} 失敗`:`生存 ${Math.floor(time/60)} 分 ${Math.floor(time%60)} 秒`;
    document.getElementById("endText").innerHTML=isBossChallengeMode()
      ?`此為測試模式用；要更新請詢問用戶。<br>本局不結算強化點數、鑽石與死亡紀錄`
      :isEventMode()
      ?(isActivityTrialMode()
        ?`未完成強化試煉，不會獲得活動兌換幣。<br>擊倒 ${kills}・活動 Boss ${bossKills}<br>目前活動兌換幣 ${formatCommaNumber(meta.activityCoins||0)}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`
        :`未擊敗活動 Boss，不會掉落種子。<br>擊倒 ${kills}・活動 Boss ${bossKills}<br>目前共有神秘胡蘿蔔種子 ${formatCommaNumber(meta.garden?.seeds||0)} 顆<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`)
      :`擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>${pointRewardLine(earned)}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>死亡總擊破 ${meta.totalDeathKills}・死亡次數 ${meta.totalDeaths}<br>${rewardTotalLines()}`;
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
      if(!isBossChallengeMode()){
        if(isEventMode()){
          earned=settleActivityReward(false);
          settleRunCoins();
          meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
          saveMeta();
        }else{
          settleRunCoins();
          settleAutoTrainingAfterRun();
          earned=applyPointRewardBonus(isInfiniteMode()?infiniteStagePointReward():Math.floor(time/60)*3);
          meta.points+=earned;
          meta.totalPlaySeconds=(meta.totalPlaySeconds||0)+Math.floor(time);
          saveMeta();
        }
      }
    }
    renderMeta();
    endScreen.classList.remove("hidden");
    document.getElementById("endTitle").textContent="已離開關卡";
    document.getElementById("endSub").textContent=`生存 ${Math.floor(time/60)} 分 ${Math.floor(time%60)} 秒`;
    document.getElementById("endText").innerHTML=isBossChallengeMode()
      ?`此為測試模式用；要更新請詢問用戶。<br>中途離開不結算強化點數與通關解鎖`
      :isEventMode()
      ?(isActivityTrialMode()
        ?`中途離開不會獲得活動兌換幣。<br>擊倒 ${kills}・活動 Boss ${bossKills}<br>目前活動兌換幣 ${formatCommaNumber(meta.activityCoins||0)}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`
        :`中途離開不會掉落種子。<br>擊倒 ${kills}・活動 Boss ${bossKills}<br>目前共有神秘胡蘿蔔種子 ${formatCommaNumber(meta.garden?.seeds||0)} 顆<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`)
      :isInfiniteMode()
      ?`擊倒 ${kills}・菁英 ${eliteKills}・BOSS ${bossKills}<br>${pointRewardLine(earned)}（已扣除 70%）<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`
      :`中途離開不計完整擊殺點數<br>生存點數 ${earned}${soulPointBonusRate()>0?`（獵魂 +${formatPercentRate(soulPointBonusRate())}）`:""}<br>本局獲得鑽石 💎 ${formatCommaNumber(runCoins)}<br>${rewardTotalLines()}`;
    beep(220,.22,.035,"square");
  }

  function loop(now){
    const rawDt=Math.min(.05,(now-last)/1000||0);
    last=now;
    loopAccumulator+=rawDt;
    const targetInterval=1/currentMaxFps();
    let didUpdate=false;
    let updateSteps=0;
    while(loopAccumulator>=targetInterval){
      update(targetInterval);
      loopAccumulator-=targetInterval;
      didUpdate=true;
      updateSteps++;
    }
    if(updateSteps>perfDebugAccumulator.catchUpMax)perfDebugAccumulator.catchUpMax=updateSteps;
    if(didUpdate){
      draw();
    }
    requestAnimationFrame(loop);
  }
  function setKey(k,v){keys[k]=v;}
  const touch=document.getElementById("touch"),touchKnob=document.getElementById("touchKnob"),touchHint=document.getElementById("touchHint");
  const pauseBtn=document.getElementById("pauseBtn"),resumeBtn=document.getElementById("resumeBtn"),leaveStageBtn=document.getElementById("leaveStageBtn"),muteBtn=document.getElementById("muteBtn"),reloadAudioBtn=document.getElementById("reloadAudioBtn");
  const devTestBtn=document.getElementById("devTestBtn");
  const monitorTabs=document.getElementById("monitorTabs"),perfMonitorBtn=document.getElementById("perfMonitorBtn"),audioMonitorBtn=document.getElementById("audioMonitorBtn");
  const leaveConfirm=document.getElementById("leaveConfirm"),cancelLeaveBtn=document.getElementById("cancelLeaveBtn"),confirmLeaveBtn=document.getElementById("confirmLeaveBtn");
  const characterBtn=document.getElementById("characterBtn"),adventureBookBtn=document.getElementById("adventureBookBtn"),shopBtn=document.getElementById("shopBtn"),closeCharacter=document.getElementById("closeCharacter"),closeAdventureBook=document.getElementById("closeAdventureBook"),closeShop=document.getElementById("closeShop");
  const chooseStageBtn=document.getElementById("chooseStageBtn"),closeStage=document.getElementById("closeStage"),closeRewards=document.getElementById("closeRewards");
  const gardenStage=document.getElementById("gardenStageModal"),desertStage=document.getElementById("desertStageModal"),snowStage=document.getElementById("snowStageModal"),forestPathStage=document.getElementById("forestPathStageModal"),forestSeaStage=document.getElementById("forestSeaStageModal"),cookieStage=document.getElementById("cookieStageModal"),toyStage=document.getElementById("toyStageModal"),lavaStage=document.getElementById("lavaStageModal"),seaStage=document.getElementById("seaStageModal"),clockStage=document.getElementById("clockStageModal"),voidStage=document.getElementById("voidStageModal"),eventStage=document.getElementById("eventStageModal"),eventTrialStage=document.getElementById("eventTrialStageModal"),infiniteStage=document.getElementById("infiniteStageModal"),bossChallengeStage=document.getElementById("bossChallengeStageModal"),bossChallengePanel=document.getElementById("bossChallengePanel");
  const stageSelectModal=document.getElementById("stageSelectModal"),stageModeNormalBtn=document.getElementById("stageModeNormalBtn"),stageModeBossBtn=document.getElementById("stageModeBossBtn"),stageModeEventBtn=document.getElementById("stageModeEventBtn"),stageModeSpecialBtn=document.getElementById("stageModeSpecialBtn"),devUnlockStagesBtn=document.getElementById("devUnlockStagesBtn");
  const homeGardenStage=document.getElementById("gardenStage"),homeDesertStage=document.getElementById("desertStage"),homeSnowStage=document.getElementById("snowStage"),homeForestPathStage=document.getElementById("forestPathStage"),homeForestSeaStage=document.getElementById("forestSeaStage"),homeCookieStage=document.getElementById("cookieStage"),homeToyStage=document.getElementById("toyStage"),homeInfiniteStage=document.getElementById("infiniteStage");
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
    const baseDamageValue=baseMetaDamageValue(meta.damage);
    const baseMoveSpeed=210;
    const baseAttackSpeed=1+meta.speed*.03;
    const baseCritChance=metaCritChance(meta.crit);
    const baseArmorPen=Math.min(MAX_META_ARMOR_PEN,meta.armorPen*.007);
    const lifeBonusPct=Math.max(0,Math.round((player.maxHp/baseMaxHp-1)*100));
    const damageBonusPct=Math.max(0,Math.round((player.damage/baseDamageValue-1)*100));
    const speedBonusPct=Math.max(0,Math.round((player.speed/baseMoveSpeed-1)*100));
    const attackSpeedBonusPct=Math.max(0,Math.round((player.attackSpeed/baseAttackSpeed-1)*100));
    const critBonusPct=Math.max(0,Math.round((player.crit-baseCritChance)*100));
    const armorPenBonusPct=Math.max(0,Math.round((Math.min(MAX_TOTAL_ARMOR_PEN,player.armorPen)-baseArmorPen)*100));
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
      ["生命回復",player.regen>0?`${boostedFlatRegen.toFixed(2)} + ${hpRegenPerSecond.toFixed(2)}<span class="pauseValueMain">= ${totalRegenPerSecond.toFixed(2)} HP/秒</span>`:`${boostedFlatRegen.toFixed(2)} HP/秒`],
      ["爆擊率",critBonusPct>0?`${Math.round(baseCritChance*100)}% + 場內${critBonusPct}%<span class="pauseValueMain">= ${Math.round(player.crit*100)}%</span>`:`${Math.round(player.crit*100)}%`],
      ["爆擊傷害",bonusCritDamagePercent>0?`${baseCritDamagePercent}% + 場內${bonusCritDamagePercent}%<span class="pauseValueMain">= ${Math.round(player.critDamage*100)}%</span>`:`${Math.round(player.critDamage*100)}%`],
      ["無視防禦",withBonus(`${Math.round(Math.min(MAX_TOTAL_ARMOR_PEN,player.armorPen)*100)}%`,armorPenBonusPct)],
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
      ["流光二連斬",skills.luminousSlash?`LV ${skills.luminousSlash}・${Math.round(luminousSlashChance()*100)}%`:"未習得"],
      ["超級頭腦",`LV ${skills.brain}・${Math.round((Math.max(1,player.xpGain)-1)*100)}%`],
      ["香蕉增益",pinkyBoostTimer>0?`${pinkyBoostTimer.toFixed(1)} 秒`:"未啟動"]
      ,["中毒",poisonTimer>0?`${poisonTimer.toFixed(1)} 秒・${(poisonRate*100).toFixed(2)}%/秒`:"無"]
      ,["暈眩",stunTimer>0?`${stunTimer.toFixed(1)} 秒`:"無"]
      ,["迷失",confuseTimer>0?`${confuseTimer.toFixed(1)} 秒・方向反轉`:"無"]
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
    pauseScreen.classList.add("hidden");paused=false;last=performance.now();loopAccumulator=0;
    pauseBtn.classList.add("visible");
    updateMonitorButtons();
  }
  function askLeaveStage(){
    reloadConfirmActive=false;
    const leaveConfirmText=leaveConfirm.querySelector(".leaveConfirmText");
    if(leaveConfirmText){
      leaveConfirmText.innerHTML=isInfiniteMode()
        ?"您確定要中途離開輪迴嗎？<br>將帶走完整鑽石，擊殺點數會扣除 70%。"
        :"您確定要中途離開關卡嗎？<br>將帶走完整鑽石，但不會帶走完整擊殺點數。";
    }
    cancelLeaveBtn.textContent="否";
    confirmLeaveBtn.textContent="是";
    leaveConfirm.classList.add("visible");
    leaveStageBtn.classList.add("hidden");
    beep(260,.08,.02);
  }
  function clearReloadConfirm(){
    reloadConfirmActive=false;
    cancelLeaveBtn.textContent="否";
    confirmLeaveBtn.textContent="是";
  }
  function askReloadPage(){
    if(!shouldProtectPageLeave()){
      allowPageUnloadOnce=true;
      location.reload();
      return;
    }
    reloadConfirmActive=true;
    reloadConfirmWasPaused=paused;
    paused=true;
    resetStick();
    renderPauseStats();
    const leaveConfirmText=leaveConfirm.querySelector(".leaveConfirmText");
    if(leaveConfirmText){
      leaveConfirmText.innerHTML="目前正在關卡中。<br>重新整理會中斷本局進度，確定要重新整理嗎？";
    }
    cancelLeaveBtn.textContent="繼續遊戲";
    confirmLeaveBtn.textContent="重新整理";
    pauseScreen.classList.remove("hidden");
    pauseBtn.classList.remove("visible");
    leaveStageBtn.classList.add("hidden");
    leaveConfirm.classList.add("visible");
    updateMonitorButtons();
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
    if(handleLuminousSlashPointer(e))return;
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
  addEventListener("keydown",e=>{
    if(e.code==="F5"||((e.ctrlKey||e.metaKey)&&e.code==="KeyR")){
      if(shouldProtectPageLeave()){
        e.preventDefault();
        askReloadPage();
      }
      return;
    }
    if(keyMap[e.code]){e.preventDefault();setKey(keyMap[e.code],true);}
  });
  addEventListener("keyup",e=>{if(keyMap[e.code]){e.preventDefault();setKey(keyMap[e.code],false);}});
  addEventListener("blur",()=>{Object.keys(keys).forEach(k=>keys[k]=false);resetStick();});
  addEventListener("focus",()=>{ensureAudioReady();});
  function shouldProtectPageLeave(){
    return running&&!ended;
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
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
  addEventListener("beforeunload",e=>{
    if(shouldProtectPageLeave()&&!allowPageUnloadOnce){
      e.preventDefault();
      e.returnValue="目前正在關卡中，離開或重新整理會中斷本局進度。確定要離開嗎？";
    }
    saveMeta();
  });
  addEventListener("resize",positionMonitorTabs);
  pauseBtn.addEventListener("click",()=>{if(!running||ended||paused||!levelScreen.classList.contains("hidden"))return;playUiClick();pauseGame();});
  resumeBtn.addEventListener("click",()=>{if(!running||ended||!paused)return;playUiClick();resumeGame();});
  leaveStageBtn.addEventListener("click",()=>{playUiClick();askLeaveStage();});
  cancelLeaveBtn.addEventListener("click",()=>{
    if(reloadConfirmActive){
      leaveConfirm.classList.remove("visible");
      clearReloadConfirm();
      if(reloadConfirmWasPaused){
        leaveStageBtn.classList.remove("hidden");
        pauseScreen.classList.remove("hidden");
        paused=true;
      }else{
        paused=false;
        last=performance.now();loopAccumulator=0;
        pauseScreen.classList.add("hidden");
        pauseBtn.classList.add("visible");
      }
      updateMonitorButtons();
      beep(480,.06,.02);
      return;
    }
    leaveConfirm.classList.remove("visible");
    leaveStageBtn.classList.remove("hidden");
    beep(480,.06,.02);
  });
  confirmLeaveBtn.addEventListener("click",()=>{
    playUiClick();
    if(reloadConfirmActive){
      allowPageUnloadOnce=true;
      clearReloadConfirm();
      saveMeta();
      location.reload();
      return;
    }
    leaveStage();
  });
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
  forestPathStage.addEventListener("click",()=>{if(meta.forestPathUnlocked){playUiClick();currentStage=4;renderMeta();}});
  forestSeaStage.addEventListener("click",()=>{if(meta.forestSeaUnlocked){playUiClick();currentStage=5;renderMeta();}});
  cookieStage.addEventListener("click",()=>{if(meta.cookieUnlocked){playUiClick();currentStage=6;renderMeta();}});
  toyStage.addEventListener("click",()=>{if(meta.toyUnlocked){playUiClick();currentStage=7;renderMeta();}});
  lavaStage.addEventListener("click",()=>{if(stageAvailability(8)==="open"){playUiClick();currentStage=8;renderMeta();}});
  seaStage.addEventListener("click",()=>{if(stageAvailability(9)==="open"){playUiClick();currentStage=9;renderMeta();}});
  clockStage.addEventListener("click",()=>{if(stageAvailability(10)==="open"){playUiClick();currentStage=10;renderMeta();}});
  voidStage.addEventListener("click",()=>{if(stageAvailability(11)==="open"){playUiClick();currentStage=11;renderMeta();}});
  eventStage?.addEventListener("click",()=>{
    if(stageAvailability(EVENT_STAGE)==="open"){
      playUiClick();
      bossChallengeMenuOpen=false;
      activityStageMode=ACTIVITY_CARROT_MODE;
      currentStage=EVENT_STAGE;
      renderMeta();
    }else{
      beep(180,.08,.025,"square");
    }
  });
  eventTrialStage?.addEventListener("click",()=>{
    if(stageAvailability(EVENT_STAGE)==="open"){
      playUiClick();
      bossChallengeMenuOpen=false;
      activityStageMode=ACTIVITY_TRIAL_MODE;
      currentStage=EVENT_STAGE;
      renderMeta();
    }else{
      beep(180,.08,.025,"square");
    }
  });
  infiniteStage.addEventListener("click",()=>{playUiClick();currentStage=INFINITE_STAGE;renderMeta();});
  stageModeNormalBtn?.addEventListener("click",()=>{
    playUiClick();
    bossChallengeMenuOpen=false;
    if(currentStage===INFINITE_STAGE||currentStage===BOSS_CHALLENGE_STAGE||currentStage===EVENT_STAGE)currentStage=1;
    renderMeta();
  });
  stageModeBossBtn?.addEventListener("click",()=>{
    if(!devModeActive){beep(180,.08,.025,"square");return;}
    playUiClick();
    bossChallengeMenuOpen=true;
    renderMeta();
  });
  stageModeEventBtn?.addEventListener("click",()=>{
    if(combatPower()<EVENT_UNLOCK_POWER){beep(180,.08,.025,"square");return;}
    playUiClick();
    bossChallengeMenuOpen=false;
    activityStageMode=ACTIVITY_CARROT_MODE;
    currentStage=EVENT_STAGE;
    renderMeta();
  });
  stageModeSpecialBtn?.addEventListener("click",()=>{
    playUiClick();
    bossChallengeMenuOpen=false;
    currentStage=INFINITE_STAGE;
    renderMeta();
  });
  bossChallengeStage?.addEventListener("click",()=>{
    if(!devModeActive)return;
    playUiClick();
    bossChallengeMenuOpen=!bossChallengeMenuOpen;
    renderMeta();
  });
  bossChallengePanel?.addEventListener("click",e=>{
    const button=e.target.closest("button[data-boss-type]");
    if(!button||!devModeActive)return;
    playUiClick();
    // 頭目挑戰模式為測試用；要更新請詢問用戶。此模式需可整段移除，不影響一般關卡。
    bossChallengeType=button.dataset.bossType||"plant";
    bossChallengeSourceStage=Number(button.dataset.bossStage)||1;
    currentStage=BOSS_CHALLENGE_STAGE;
    bossChallengeMenuOpen=true;
    renderMeta();
  });
  devUnlockStagesBtn?.addEventListener("click",()=>{
    playUiClick();
    unlockNormalStagesForDev();
  });
  homeGardenStage?.addEventListener("click",()=>{playUiClick();currentStage=1;renderMeta();});
  homeDesertStage?.addEventListener("click",()=>{if(meta.desertUnlocked){playUiClick();currentStage=2;renderMeta();}});
  homeSnowStage?.addEventListener("click",()=>{if(meta.snowUnlocked){playUiClick();currentStage=3;renderMeta();}});
  homeForestPathStage?.addEventListener("click",()=>{if(meta.forestPathUnlocked){playUiClick();currentStage=4;renderMeta();}});
  homeForestSeaStage?.addEventListener("click",()=>{if(meta.forestSeaUnlocked){playUiClick();currentStage=5;renderMeta();}});
  homeCookieStage?.addEventListener("click",()=>{if(meta.cookieUnlocked){playUiClick();currentStage=6;renderMeta();}});
  homeToyStage?.addEventListener("click",()=>{if(meta.toyUnlocked){playUiClick();currentStage=7;renderMeta();}});
  homeInfiniteStage?.addEventListener("click",()=>{playUiClick();currentStage=INFINITE_STAGE;renderMeta();});
  homeStageBadge?.addEventListener("click",()=>{
    playUiClick();
    if(devModeActive){
      try{
        sessionStorage.setItem("bunnyGardenPreviewDevUntil",String(Date.now()+1000*60*30));
      }catch(_error){}
    }
    preloadGardenSceneAssets();
    gardenScreen?.classList.remove("hidden");
    setTimeout(()=>postGardenState(),80);
  });
  characterBtn.addEventListener("click",()=>{
    playUiClick();
    setCharacterTab("ability");
    renderMeta();
    characterScreen.classList.remove("hidden");
    requestAnimationFrame(()=>requestAnimationFrame(setupMetaMarquees));
  });
  abilityPanelBtn?.addEventListener("click",()=>{
    playUiClick();
    setCharacterTab("ability");
  });
  equipmentPanelBtn?.addEventListener("click",()=>{
    playUiClick();
    setCharacterTab("equipment");
  });
  equipmentPanel?.addEventListener("click",e=>{
    const button=e.target.closest("button[data-equip-id]");
    if(!button)return;
    const id=button.dataset.equipId;
    ensureEquipmentState();
    if(!equipmentInventoryHas(id))return;
    const item=equipmentItemById(id);
    if(!item)return;
    if(item.type==="ring"){
      meta.equippedRingId=meta.equippedRingId===id?"":id;
      saveMeta();
      renderMeta();
      setCharacterTab("equipment");
      beep(meta.equippedRingId===id?720:360,.08,.025,"triangle");
      return;
    }
    if(item.type!=="weapon"){
      beep(260,.08,.025,"square");
      return;
    }
    meta.equippedWeaponId=id;
    saveMeta();
    renderMeta();
    setCharacterTab("equipment");
    beep(720,.08,.025,"triangle");
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
    shopMode="shop";
    forgeMessage="";
    forgeSourceMode="";
    renderShop();
    shopScreen.classList.remove("hidden");
    playUiClick();
  });
  function openForgeFromGardenIfRequested(){
    let requested=false;
    try{
      requested=sessionStorage.getItem("bunnyOpenForgeFromGarden")==="1";
      if(requested)sessionStorage.removeItem("bunnyOpenForgeFromGarden");
    }catch(_error){}
    if(!requested)return;
    shopMode="forge";
    forgeMessage="";
    forgeSourceMode="";
    renderShop();
    shopScreen.classList.remove("hidden");
  }
  shopModeShopBtn?.addEventListener("click",()=>{
    shopMode="shop";
    forgeMessage="";
    forgeSourceMode="";
    playUiClick();
    renderShop();
  });
  shopModeForgeBtn?.addEventListener("click",()=>{
    shopMode="forge";
    forgeMessage="";
    forgeSourceMode="";
    playUiClick();
    renderShop();
  });
  shopModeEventBtn?.addEventListener("click",()=>{
    shopMode="event";
    forgeMessage="";
    forgeSourceMode="";
    playUiClick();
    renderShop();
  });
  shopGrid?.addEventListener("click",e=>{
    const devButton=e.target.closest("button[data-dev-shop-action]");
    if(devButton){
      if(!devModeActive)return;
      playUiClick();
      const action=devButton.dataset.devShopAction;
      if(action==="activityCoinAdd")adjustActivityCoinsForDev(100);
      else if(action==="activityCoinSub")adjustActivityCoinsForDev(-100);
      else if(action==="equipmentInit")resetEquipmentForDev();
      else if(action==="dailyReset")resetDailyLimitsForDev();
      return;
    }
    const forgeSourceButton=e.target.closest("button[data-forge-source]");
    if(forgeSourceButton){
      playUiClick();
      forgeSourceMode=forgeSourceButton.dataset.forgeSource||"";
      forgeMessage="";
      renderShop();
      return;
    }
    const forgeBackButton=e.target.closest("button[data-forge-source-back]");
    if(forgeBackButton){
      playUiClick();
      forgeSourceMode="";
      forgeMessage="";
      renderShop();
      return;
    }
    const forgeButton=e.target.closest("button[data-forge-id]");
    if(forgeButton){
      if(forgeButton.disabled)return;
      playUiClick();
      forgeEquipment(forgeButton.dataset.forgeId);
      return;
    }
    const dismantleButton=e.target.closest("button[data-dismantle-id]");
    if(dismantleButton){
      if(dismantleButton.disabled)return;
      playUiClick();
      dismantleEquipment(dismantleButton.dataset.dismantleId);
      return;
    }
    const mergeStoneButton=e.target.closest("button[data-break-stone-merge]");
    if(mergeStoneButton){
      if(mergeStoneButton.disabled)return;
      playUiClick();
      mergeBreakStone(mergeStoneButton.dataset.breakStoneMerge);
      return;
    }
    const gardenForgeButton=e.target.closest("button[data-garden-forge-index]");
    if(gardenForgeButton){
      if(gardenForgeButton.disabled)return;
      playUiClick();
      forgeGardenCarrot(gardenForgeButton.dataset.gardenForgeIndex);
      return;
    }
    const button=e.target.closest("button[data-shop-action]");
    if(!button||button.disabled)return;
    playUiClick();
    requestBuyShopItem(button.dataset.shopAction);
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
  settingsOverlay.addEventListener("click",e=>{
    if(e.target!==settingsOverlay)return;
    if(autoTrainingPromptOpen||shopPurchasePromptOpen)cancelSettingsDialog();
    else closeSettingsOverlay();
  });
  settingsDialog.addEventListener("click",e=>{
    if(e.target!==settingsDialog)return;
    if(autoTrainingPromptOpen||shopPurchasePromptOpen)cancelSettingsDialog();
    else closeSettingsDialog();
  });
  settingsDialogConfirm.addEventListener("click",()=>{playUiClick();confirmSettingsDialog();});
  settingsDialogCancel.addEventListener("click",()=>{playUiClick();cancelSettingsDialog();});
  volumeSettings?.addEventListener("click",e=>{
    const button=e.target.closest("button[data-volume-delta]");
    if(!button)return;
    const row=button.closest(".volumeRow");
    if(!row)return;
    adjustVolume(row.dataset.volumeKey,Number(button.dataset.volumeDelta)||0);
  });
  graphicsSettings?.addEventListener("click",e=>{
    const button=e.target.closest("button[data-performance-profile]");
    if(!button)return;
    setPerformanceProfile(button.dataset.performanceProfile);
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
      if(autoTrainingPromptOpen||shopPurchasePromptOpen)cancelSettingsDialog();
      else closeSettingsDialog();
    }
  });
  accountExportBtn.addEventListener("click",()=>{playUiClick();exportAccountCode();});
  accountImportBtn.addEventListener("click",()=>{playUiClick();importAccountCode();});
  developerEntryBtn.addEventListener("click",()=>{playUiClick();handleDeveloperEntry();});
  document.getElementById("gardenDepositMoveBtn")?.addEventListener("click",()=>{
    playUiClick();
    const moved=moveGardenDepositToStorage();
    saveMeta();
    renderMeta();
    showQuickToast(moved?`已整理 ${moved} 件胡蘿蔔素材回倉庫。`:"倉庫沒有空位，保管箱暫時保留。");
  });
  coinDevAddBtn?.addEventListener("click",e=>{
    e.stopPropagation();
    if(!devModeActive)return;
    syncCoinState();
    meta.coins=Math.max(0,Math.floor(Number(meta.coins)||0)+1000);
    walletCoins=meta.coins;
    saveMeta();
    syncCoinDisplay();
    beep(780,.08,.02,"square");
    countAudioSubtype("ui");
  });
  coinDevSubBtn?.addEventListener("click",e=>{
    e.stopPropagation();
    if(!devModeActive)return;
    syncCoinState();
    meta.coins=Math.max(0,Math.floor(Number(meta.coins)||0)-1000);
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
  abilityResetBtn?.addEventListener("click",()=>{
    const tickets=Math.max(0,Math.floor(Number(meta.abilityResetTickets)||0));
    if(tickets<=0)return;
    const refundPreview=metaDefs.reduce((sum,def)=>sum+metaSpentCost(def,meta[def.id]||0),0);
    settingsOverlay.classList.add("visible","dialogOnly");
    settingsOverlay.setAttribute("aria-hidden","false");
    openSettingsDialog({
      title:"使用能力重置券？",
      message:`將重置所有永久能力，並退還 ${formatCostShort(refundPreview)} 強化點數。\n目前持有 ${tickets} 張能力重置券。`,
      confirmLabel:"使用",
      cancelLabel:"取消",
      onConfirm:()=>{
        closeSettingsDialog();
        settingsOverlay.classList.remove("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","true");
        if(Math.max(0,Math.floor(Number(meta.abilityResetTickets)||0))<=0)return;
        meta.abilityResetTickets=Math.max(0,Math.floor(Number(meta.abilityResetTickets)||0)-1);
        const refund=resetPermanentAbilities();
        saveMeta();
        renderMeta();
        beep(700,.13,.035,"triangle");
        settingsOverlay.classList.add("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","false");
        openSettingsDialog({
          title:"能力已重置",
          message:`已退還 ${formatCostShort(refund)} 強化點數。`,
          confirmLabel:"確定",
          cancelLabel:"關閉",
          onConfirm:()=>{
            closeSettingsDialog();
            settingsOverlay.classList.remove("visible","dialogOnly");
            settingsOverlay.setAttribute("aria-hidden","true");
          },
          onCancel:()=>{
            settingsOverlay.classList.remove("visible","dialogOnly");
            settingsOverlay.setAttribute("aria-hidden","true");
          }
        });
      },
      onCancel:()=>{
        settingsOverlay.classList.remove("visible","dialogOnly");
        settingsOverlay.setAttribute("aria-hidden","true");
      }
    });
  });
  devResetBtn.addEventListener("click",()=>{
    if(!devModeActive)return;
    resetPermanentAbilities();
    saveMeta();
    renderMeta();
    beep(180,.12,.04,"square");
  });
  document.getElementById("start").onclick=()=>{
    if(transitioning)return;
    playUiClick();
    requestAutoTrainingThenStart();
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
      prepareGardenFrame();
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
  initGardenUi();
  prepareGardenFrame();
  updateMuteButton();renderMeta();openForgeFromGardenIfRequested();startBootOverlay();draw();requestAnimationFrame(loop);
})();

