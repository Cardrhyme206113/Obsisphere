/* Obsisphere portfolio demo service worker.
 * Serves the real V2 frontend from a bundled ZIP and mocks only the server/API side.
 */
importScripts('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');

const BUNDLE_VERSION = 'v2-demo-20260817-1';
const FILE_CACHE = `obsisphere-panel-demo-files-${BUNDLE_VERSION}`;
const BUNDLE_PARTS = [0,1,2,3,4,5,6,7,8,9].map(i => new URL(`panel-runtime.b64.${i}`, self.registration.scope).href);
let bundlePromise = null;

const encoder = new TextEncoder();
const nowIso = () => new Date().toISOString();
const json = (value, status=200, extra={}) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }
});
const text = (value, status=200, type='text/plain; charset=utf-8') => new Response(value, {status, headers:{'Content-Type':type,'Cache-Control':'no-store'}});
const tinySvg = (label='MC') => new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#1d2638"/><rect x="8" y="8" width="48" height="48" rx="8" fill="#5f5af5" opacity=".22"/><text x="32" y="39" text-anchor="middle" font-family="Arial" font-weight="700" font-size="18" fill="#e7eaf2">${String(label).slice(0,2)}</text></svg>`, {headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store'}});

const demo = {
  chatId: 3,
  auditId: 8,
  players: [
    {uuid:'11111111-1111-4111-8111-111111111111',name:'Cardrhyme',displayName:'Cardrhyme',online:true,world:'world',x:-53,y:81,z:-39,health:19.5,maxHealth:20,foodLevel:18,playtimeTicks:2278400,currentAction:'Exploring spawn',currentActionDetails:'Moving through the plains near spawn.',gamemode:'SURVIVAL'},
    {uuid:'22222222-2222-4222-8222-222222222222',name:'LunaBuilder',displayName:'LunaBuilder',online:true,world:'world',x:128,y:68,z:74,health:20,maxHealth:20,foodLevel:20,playtimeTicks:1440000,currentAction:'Building',currentActionDetails:'Placing blocks around the market district.',gamemode:'CREATIVE'},
    {uuid:'33333333-3333-4333-8333-333333333333',name:'RedstoneFox',displayName:'RedstoneFox',online:true,world:'world_nether',x:31,y:71,z:-18,health:16,maxHealth:20,foodLevel:15,playtimeTicks:865000,currentAction:'Mining',currentActionDetails:'Mining netherrack and quartz.',gamemode:'SURVIVAL'},
    {uuid:'44444444-4444-4444-8444-444444444444',name:'Nova',displayName:'Nova',online:false,playtimeTicks:902000,lastPlayedAt:Date.now()-86400000*2,logoutWorld:'world',logoutX:212,logoutY:64,logoutZ:-91},
    {uuid:'55555555-5555-4555-8555-555555555555',name:'PixelPilot',displayName:'PixelPilot',online:false,playtimeTicks:446000,lastPlayedAt:Date.now()-86400000*7,logoutWorld:'world_the_end',logoutX:14,logoutY:62,logoutZ:44}
  ],
  plugins: [
    {name:'Obsisphere',file:'Obsisphere.jar',version:'2.0-dev',apiVersion:'1.21',status:'ENABLED',canToggle:false,compatibilityStatus:'compatible',compatibilityMessage:'Current panel build.'},
    {name:'LuckPerms',file:'LuckPerms-Bukkit.jar',version:'5.4.158',apiVersion:'1.13',status:'ENABLED',canToggle:true,compatibilityStatus:'compatible',compatibilityMessage:'Compatible with this server version.'},
    {name:'ViaVersion',file:'ViaVersion.jar',version:'5.4.2',apiVersion:'1.13',status:'ENABLED',canToggle:true,compatibilityStatus:'compatible',compatibilityMessage:'Compatible with this server version.'},
    {name:'WorldEdit',file:'worldedit-bukkit.jar',version:'7.3.8',apiVersion:'1.13',status:'ENABLED',canToggle:true,compatibilityStatus:'compatible',compatibilityMessage:'Compatible with this server version.'},
    {name:'Chunky',file:'Chunky-Bukkit.jar',version:'1.4.40',apiVersion:'1.16',status:'DISABLED',canToggle:true,compatibilityStatus:'unknown',compatibilityMessage:'Compatibility has not been confirmed yet.'}
  ],
  worlds: {
    active:[
      {name:'world',dim:'Overworld',size:'4.8 GB'},
      {name:'world_nether',dim:'Nether',size:'1.1 GB'},
      {name:'world_the_end',dim:'The End',size:'384 MB'}
    ],
    backups:[
      {name:'world-2026-08-17-0300',date:'Aug 17, 2026 03:00',size:'4.5 GB'},
      {name:'world-2026-08-16-0300',date:'Aug 16, 2026 03:00',size:'4.4 GB'}
    ]
  },
  users:[
    {id:1,username:'Cardrhyme',master:true,editableByCurrentUser:false,roles:[],permissions:['*'],effectivePermissions:['*'],online:true,sessionStartedAt:Date.now()-412000,lastPanelPage:'dashboard',lastPanelSeenAt:Date.now(),mustChangePassword:false,mustSetup2fa:false},
    {id:2,username:'LunaAdmin',master:false,editableByCurrentUser:true,roles:[{id:1,name:'Moderator'}],permissions:['dashboard.server_ip'],effectivePermissions:['page.dashboard','page.players','players.view','players.kick','page.chat','chat.view','chat.send'],online:true,sessionStartedAt:Date.now()-183000,lastPanelPage:'players',lastPanelSeenAt:Date.now(),mustChangePassword:false,mustSetup2fa:false},
    {id:3,username:'Builder',master:false,editableByCurrentUser:true,roles:[{id:2,name:'Builder'}],permissions:[],effectivePermissions:['page.dashboard','page.worlds','worlds.view.active'],online:false,lastPanelSeenAt:Date.now()-86400000,mustChangePassword:false,mustSetup2fa:false}
  ],
  roles:[
    {id:1,name:'Moderator',permissions:['page.dashboard','page.players','players.view','players.kick','players.tempban','page.chat','chat.view','chat.send','page.logs','logs.view'],manageableByCurrentUser:true},
    {id:2,name:'Builder',permissions:['page.dashboard','page.worlds','worlds.view.active','page.map','map.tiles','map.players.locations'],manageableByCurrentUser:true}
  ],
  chat:[
    {id:1,type:'system',legacyText:'§7[Server] Welcome to the Obsisphere portfolio demo.',timestamp:Date.now()-90000},
    {id:2,type:'player',playerName:'LunaBuilder',playerUuid:'22222222-2222-4222-8222-222222222222',legacyText:'§bLunaBuilder§f: spawn market is almost done!',timestamp:Date.now()-48000},
    {id:3,type:'player',playerName:'Cardrhyme',playerUuid:'11111111-1111-4111-8111-111111111111',legacyText:'§dCardrhyme§f: nice, checking it from the panel 👀',timestamp:Date.now()-18000}
  ],
  audits:[
    {id:8,time:'08:22:41',user:'LunaAdmin',method:'POST',path:'/api/players',body:'{"action":"kick","name":"ExamplePlayer","reason":"AFK test"}'},
    {id:7,time:'08:20:18',user:'Cardrhyme',method:'PUT',path:'/api/roles',body:'{"id":1,"name":"Moderator","permissions":["players.kick","logs.view"]}'},
    {id:6,time:'08:18:04',user:'Cardrhyme',method:'POST',path:'/api/worlds/backup',body:'{"name":"world"}'},
    {id:5,time:'08:14:39',user:'LunaAdmin',method:'POST',path:'/api/chat',body:'{"message":"Maintenance in 10 minutes"}'},
    {id:4,time:'08:10:03',user:'Cardrhyme',method:'POST',path:'/api/plugins/toggle',body:'{"file":"Chunky-Bukkit.jar","desiredState":"disabled"}'}
  ],
  activity:[
    {id:30,time:'08:24:12',player:'Cardrhyme',action:'Moved',details:'from world [-54, 81, -40] to world [-54, 81, -41] (0.2 blocks)',count:1},
    {id:29,time:'08:24:10',player:'Cardrhyme',action:'Broke block',details:'GRASS_BLOCK at world [-51, 80, -39] using empty hand',count:1},
    {id:28,time:'08:24:08',player:'Cardrhyme',action:'Left click block',details:'LEFT_CLICK_BLOCK on GRASS_BLOCK at world [-51, 80, -39]',count:1},
    {id:27,time:'08:23:51',player:'LunaBuilder',action:'Placed block',details:'OAK_PLANKS at world [131, 69, 78]',count:4}
  ]
};

const permissionCatalog = [
  {name:'Dashboard',permissions:[
    {key:'page.dashboard',label:'Open Dashboard'}, {key:'dashboard.memory',label:'View memory',parent:'page.dashboard'}, {key:'dashboard.tps',label:'View TPS',parent:'page.dashboard'}]},
  {name:'Players',permissions:[
    {key:'page.players',label:'Open Players'}, {key:'players.view',label:'View players',parent:'page.players'}, {key:'players.kick',label:'Kick players',parent:'players.view'}, {key:'players.ban',label:'Ban players',parent:'players.view'}]},
  {name:'Files',permissions:[
    {key:'page.files',label:'Open Files'}, {key:'files.view',label:'Browse files',parent:'page.files'}, {key:'files.save',label:'Edit files',parent:'files.view'}]},
  {name:'Security',permissions:[
    {key:'page.audit',label:'Open Audit'}, {key:'audit.view',label:'View audit log',parent:'page.audit'}]}
];

const fileTree = {
  '/':[
    {name:'plugins',type:'folder',size:0},{name:'world',type:'folder',size:0},{name:'backups',type:'folder',size:0},{name:'config',type:'folder',size:0},{name:'server.properties',type:'file',size:1452},{name:'paper-global.yml',type:'file',size:4280}
  ],
  '/plugins':[
    {name:'Obsisphere',type:'folder',size:0},{name:'LuckPerms',type:'folder',size:0},{name:'Obsisphere.jar',type:'file',size:1843200},{name:'LuckPerms-Bukkit.jar',type:'file',size:1468000},{name:'ViaVersion.jar',type:'file',size:5260000}
  ],
  '/config':[{name:'paper-world-defaults.yml',type:'file',size:6600},{name:'bukkit.yml',type:'file',size:2300}],
  '/backups':[{name:'world-2026-08-17-0300.zip',type:'file',size:4820000000}],
  '/world':[{name:'level.dat',type:'file',size:982},{name:'region',type:'folder',size:0},{name:'playerdata',type:'folder',size:0}]
};

function getBody(req){ return req.clone().text().then(t=>{try{return JSON.parse(t||'{}')}catch{return {}}}).catch(()=>({})); }
function timeString(){ return new Date().toLocaleTimeString('en-GB',{hour12:false}); }
function addAudit(user,method,path,body={}){ demo.audits.unshift({id:++demo.auditId,time:timeString(),user,method,path,body:JSON.stringify(body)}); }

async function mockApi(request, apiPath, url) {
  const method = request.method.toUpperCase();
  const q = url.searchParams;
  if (apiPath === 'session') {
    if (method === 'DELETE') return json({ok:true});
    return json({csrfToken:'portfolio-demo-csrf',buildSecurityMode:'AUTH_REQUIRED',developmentAuthBypass:false,lanOnlyMode:false,failedAuthMaskLastDigits:true,failedAuthPersonalInfoVisible:false,user:{id:1,username:'Cardrhyme',master:true},permissions:['*']});
  }
  if (apiPath === 'background') return json({enabled:true,mode:'equirectangular',scope:'all',rotationSpeed:5,blur:6,darkness:48,vignette:45,surfaceOpacity:70,image:'assets/panel-background.jpg',revision:1},{},{ETag:'"demo-bg-1"'});
  if (apiPath === 'background/settings' || apiPath === 'background/upload') return json({enabled:true,mode:'equirectangular',scope:'all',rotationSpeed:5,blur:6,darkness:48,vignette:45,surfaceOpacity:70,image:'assets/panel-background.jpg',revision:2});
  if (apiPath === 'stats') {
    const t=Date.now()/1000, wobble=n=>Math.round((Math.sin(t/n)+1)*50)/10;
    return json({usedMemory:6.1*1024**3,maxMemory:12*1024**3,cpu:Math.round(21+wobble(5)),onlinePlayers:3,maxPlayers:80,tps:(19.96+Math.sin(t/7)*.03).toFixed(2),mspt:(7.4+Math.sin(t/4)*1.1).toFixed(1),chunks:1348,entities:2860,uptime:'2d 14h 33m',historyIntervalMs:500});
  }
  if (apiPath === 'server') {
    if (method !== 'GET') { const b=await getBody(request); addAudit('Cardrhyme',method,'/api/server',b); return json({ok:true}); }
    return json({ip:'play.obsisphere.local',port:25565,version:'1.21.4',software:'Paper 1.21.4',motd:'§dObsisphere V2 Demo\n§7Real panel frontend · placeholder server data'});
  }
  if (apiPath === 'players') {
    if (method !== 'GET') { const b=await getBody(request); addAudit('Cardrhyme',method,'/api/players',b); return json({ok:true}); }
    return json({online:demo.players.filter(p=>p.online),offline:demo.players.filter(p=>!p.online)});
  }
  if (apiPath === 'users') {
    if (method === 'GET') return json({users:demo.users,roles:demo.roles,catalog:permissionCatalog,currentUserId:1,currentUserMaster:true,grantablePermissions:['*']});
    const b=await getBody(request); addAudit('Cardrhyme',method,'/api/users',b); return json({ok:true,csrfToken:'portfolio-demo-csrf',userId:b.id||4,username:b.username||'DemoUser',temporaryPassword:'Demo-Only-7X!'});
  }
  if (apiPath === 'roles') {
    if (method === 'GET') return json(demo.roles);
    const b=await getBody(request); addAudit('Cardrhyme',method,'/api/roles',b); return json({ok:true,csrfToken:'portfolio-demo-csrf',roleId:b.id||3});
  }
  if (apiPath === 'files') {
    if (method === 'GET') {
      const path=q.get('path')||'/';
      if (q.get('content') === 'true') return text('# Obsisphere portfolio demo file\nserver-port=25565\nmotd=Obsisphere V2 Demo\n');
      return json(fileTree[path]||[]);
    }
    const b=await getBody(request); addAudit('Cardrhyme',method,'/api/files',b); return json({ok:true});
  }
  if (apiPath.startsWith('files/')) { const b=await getBody(request); addAudit('Cardrhyme',method,'/api/'+apiPath,b); return json({ok:true}); }
  if (apiPath === 'plugins') {
    if (method === 'GET') return json(demo.plugins);
    addAudit('Cardrhyme',method,'/api/plugins',{}); return json({ok:true});
  }
  if (apiPath === 'plugins/search') return json([{id:6245,name:'CoreProtect',tag:'Fast, efficient block logging',downloads:9200000,rating:4.8,iconUrl:''},{id:28140,name:'Chunky',tag:'Pre-generate chunks quickly',downloads:3100000,rating:4.7,iconUrl:''}]);
  if (apiPath === 'plugins/versions') return json([{id:1,name:'Latest',releaseDate:Date.now()/1000,downloads:120000}]);
  if (apiPath === 'plugins/toggle' || apiPath === 'plugins/install') { const b=await getBody(request); addAudit('Cardrhyme',method,'/api/'+apiPath,b); return json({ok:true,status:'ENABLED'}); }
  if (apiPath === 'worlds') return json(demo.worlds);
  if (apiPath.startsWith('worlds/')) { const b=await getBody(request); addAudit('Cardrhyme',method,'/api/'+apiPath,b); return json({ok:true}); }
  if (apiPath === 'world-settings') {
    if (method !== 'GET') {const b=await getBody(request);addAudit('Cardrhyme',method,'/api/world-settings',b);return json({ok:true});}
    return json([{name:'world',environment:'NORMAL',difficulty:'HARD',time:6200,weather:'CLEAR',players:2,entities:1880,chunks:920,size:'4.8 GB',gameRules:{keepInventory:false,doDaylightCycle:true,randomTickSpeed:3}},{name:'world_nether',environment:'NETHER',difficulty:'HARD',time:0,weather:'CLEAR',players:1,entities:610,chunks:286,size:'1.1 GB',gameRules:{keepInventory:false,doDaylightCycle:true,randomTickSpeed:3}}]);
  }
  if (apiPath === 'backup-policies') return json([{id:1,name:'Daily survival backup',worldName:'world',time:'03:00',keepLatest:7,retentionDays:14,enabled:true,lastRunAt:Date.now()-18000000,nextRunAt:Date.now()+68400000}]);
  if (apiPath === 'schedules') {
    if (method === 'GET') return json([{id:'demo-1',name:'Morning announcement',time:'09:00',tasks:[{command:'say Good morning!',delay:0},{command:'save-all',delay:10}]}]);
    return json({ok:true});
  }
  if (apiPath === 'schedules/time') return json({time:timeString()});
  if (apiPath === 'whitelist') return json({enabled:true,players:[{uuid:demo.players[0].uuid,name:'Cardrhyme'},{uuid:demo.players[1].uuid,name:'LunaBuilder'}]});
  if (apiPath === 'ops') return json([{uuid:demo.players[0].uuid,name:'Cardrhyme',level:4,bypassesPlayerLimit:true}]);
  if (apiPath === 'bans') return json([{target:'TroubleMaker',source:'Cardrhyme',reason:'Griefing',created:'2026-08-10 18:22',expires:'Never'}]);
  if (apiPath === 'failed-auths') return json({logs:[{id:1,time:'2026-08-17 07:42:18',ip:'192.168.xxx.42',username:'admin',reason:'Invalid password',attempts:4,banned:false}],currentPage:0,totalPages:1});
  if (apiPath === 'console') {
    if (method === 'GET') return json({lines:[{id:1,text:'[08:20:01 INFO]: Done (4.812s)! For help, type "help"'},{id:2,text:'[08:20:14 INFO]: Cardrhyme joined the game'},{id:3,text:'[08:21:02 INFO]: [Obsisphere] Web panel demo data ready'}],latestId:3});
    const b=await getBody(request);addAudit('Cardrhyme',method,'/api/console',b);return json({ok:true});
  }
  if (apiPath === 'chat') {
    if (method === 'GET') return json({entries:demo.chat.filter(x=>x.id>Number(q.get('since')||0)),latestId:demo.chatId});
    const b=await getBody(request); const e={id:++demo.chatId,type:'admin',legacyText:`§d[Panel] Cardrhyme§f: ${b.message||''}`,timestamp:Date.now()}; demo.chat.push(e); addAudit('Cardrhyme',method,'/api/chat',b); return json({ok:true,id:e.id});
  }
  if (apiPath === 'chat/head' || apiPath === 'map/skin' || apiPath.startsWith('textures/')) return tinySvg(q.get('name')||apiPath.split('/').pop()?.slice(0,2)||'MC');
  if (apiPath === 'logs') return json({logs:demo.activity,currentPage:0,totalPages:1});
  if (apiPath === 'audit') return json({logs:demo.audits,currentPage:0,totalPages:1});
  if (apiPath === 'xray') return json([{name:'RedstoneFox',score:34,classification:'Normal',ratio:1.2,buriedOres:4,ores:8,openMineBlocks:620,tunnelRatio:41,directionChanges:18,directOreApproaches:0,suspiciousDetours:0,stone:651,exposedOres:4}]);
  if (apiPath === 'player-stats') {
    if (q.get('action') === 'metadata') return json({custom:['play_time','walk_one_cm','fly_one_cm','jump','mob_kills','player_kills','deaths'],materials:['stone','grass_block','dirt','diamond_ore','oak_log','oak_planks','diamond_pickaxe'],entities:['zombie','skeleton','creeper','player']});
    if (q.get('uuid')) return json({stats:{'minecraft:custom':{'minecraft:play_time':2278400,'minecraft:walk_one_cm':51820000,'minecraft:fly_one_cm':9240000,'minecraft:jump':12840,'minecraft:mob_kills':1482,'minecraft:player_kills':34,'minecraft:deaths':18},'minecraft:mined':{'minecraft:stone':98214,'minecraft:grass_block':840,'minecraft:dirt':4280,'minecraft:diamond_ore':483},'minecraft:used':{'minecraft:diamond_pickaxe':8450},'minecraft:crafted':{'minecraft:oak_planks':1640},'minecraft:killed':{'minecraft:zombie':612,'minecraft:skeleton':311,'minecraft:creeper':94,'minecraft:player':34}}});
    return json(demo.players.map(p=>({uuid:p.uuid,name:p.name})));
  }
  if (apiPath === 'inventory/players') return json(demo.players.map(p=>({uuid:p.uuid,name:p.name,online:p.online})));
  if (apiPath === 'inventory/items') return json({categories:['Building Blocks','Combat','Tools','Food'],items:[{id:'minecraft:stone',name:'Stone',category:'Building Blocks'},{id:'minecraft:oak_planks',name:'Oak Planks',category:'Building Blocks'},{id:'minecraft:diamond_sword',name:'Diamond Sword',category:'Combat'},{id:'minecraft:diamond_pickaxe',name:'Diamond Pickaxe',category:'Tools'},{id:'minecraft:golden_carrot',name:'Golden Carrot',category:'Food'}]});
  if (apiPath === 'inventory/contents') return json({uuid:q.get('uuid'),name:'Cardrhyme',online:true,inventory:[{slot:0,type:'DIAMOND_SWORD',amount:1},{slot:1,type:'DIAMOND_PICKAXE',amount:1},{slot:2,type:'GOLDEN_CARROT',amount:32},{slot:8,type:'ENDER_PEARL',amount:16},{slot:9,type:'OAK_PLANKS',amount:64},{slot:10,type:'STONE',amount:64}],armor:{helmet:{type:'DIAMOND_HELMET',amount:1},chestplate:{type:'ELYTRA',amount:1},leggings:{type:'DIAMOND_LEGGINGS',amount:1},boots:{type:'DIAMOND_BOOTS',amount:1}},offhand:{type:'TOTEM_OF_UNDYING',amount:1}});
  if (apiPath.startsWith('inventory/')) { const b=await getBody(request); addAudit('Cardrhyme',method,'/api/'+apiPath,b); return json({ok:true}); }
  if (apiPath === 'map/bootstrap') return json({worlds:['world','world_nether','world_the_end'],defaultWorld:'world',minY:-64,maxY:320,changeSequence:1,worldTimes:{world:6200,world_nether:18000,world_the_end:12000},worldWeather:{world:'clear',world_nether:'clear',world_the_end:'clear'},renderer:{defaultZoom:18,defaultCameraDistance:60},assets:{assetVersion:'demo-1',textureManifestUrl:'assets/minecraft/generated/texture_manifest.json',textureAtlasMetaUrl:'assets/minecraft/generated/atlas.json',textureAtlasUrl:'assets/minecraft/generated/atlas.png',blockstatesBaseUrl:'assets/minecraft/blockstates/',modelsBaseUrl:'assets/minecraft/models/'}});
  if (apiPath === 'map/meta') return json({worldTimes:{world:6200,world_nether:18000,world_the_end:12000},worldWeather:{world:'clear',world_nether:'clear',world_the_end:'clear'},changeSequence:1});
  if (apiPath === 'map/players') return json({players:demo.players.filter(p=>p.online).map(p=>({uuid:p.uuid,name:p.name,world:p.world,x:p.x,y:p.y,z:p.z,health:p.health,maxHealth:p.maxHealth,hunger:p.foodLevel,gamemode:p.gamemode||'SURVIVAL',heldItem:'Diamond Pickaxe',offhandItem:'Totem of Undying',currentAction:p.currentAction,recentActions:[{action:p.currentAction,details:p.currentActionDetails,time:'just now'}]}))});
  if (apiPath === 'map/entities') return json({entities:[]});
  if (apiPath === 'map/revisions') return json({chunks:[]});
  if (apiPath === 'map/chunk') return json({world:q.get('world')||'world',chunkX:Number(q.get('x')||0),chunkZ:Number(q.get('z')||0),revision:1,sections:[],blockEntities:[]});
  if (apiPath.startsWith('map/')) return json({});
  if (apiPath === 'account') return json({ok:true,csrfToken:'portfolio-demo-csrf',username:'Cardrhyme'});
  return json({ok:true});
}

function mimeFor(name){
  const ext=(name.split('.').pop()||'').toLowerCase();
  return ({html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',svg:'image/svg+xml',webp:'image/webp'})[ext]||'application/octet-stream';
}

async function ensureBundle(){
  if(bundlePromise) return bundlePromise;
  bundlePromise=(async()=>{
    const cache=await caches.open(FILE_CACHE);
    const marker=new URL('runtime/.bundle-ready',self.registration.scope).href;
    if(await cache.match(marker)) return cache;
    const parts=await Promise.all(BUNDLE_PARTS.map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`Demo bundle part failed: ${r.status}`);return r.text()}));
    const b64=parts.join('');
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const zip=await JSZip.loadAsync(bytes.buffer);
    const puts=[];
    zip.forEach((name,entry)=>{
      if(entry.dir) return;
      puts.push(entry.async('uint8array').then(bytes=>{
        const target=new URL('runtime/'+name.replace(/^\.\//,''),self.registration.scope).href;
        return cache.put(target,new Response(bytes,{headers:{'Content-Type':mimeFor(name),'Cache-Control':'public, max-age=31536000, immutable'}}));
      }));
    });
    await Promise.all(puts);
    await cache.put(marker,text(BUNDLE_VERSION));
    return cache;
  })();
  return bundlePromise;
}

self.addEventListener('install',event=>event.waitUntil((async()=>{await ensureBundle();await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()) if(key.startsWith('obsisphere-panel-demo-files-')&&key!==FILE_CACHE) await caches.delete(key);await self.clients.claim()})()));

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  const scopePath=new URL(self.registration.scope).pathname;
  if(!url.pathname.startsWith(scopePath)) return;
  event.respondWith((async()=>{
    const rel=url.pathname.slice(scopePath.length);
    if(rel.startsWith('runtime/api/')) return mockApi(event.request,rel.slice('runtime/api/'.length),url);
    if(rel.startsWith('runtime/assets/minecraft/textures/') && !(await (await ensureBundle()).match(event.request,{ignoreSearch:true}))) return tinySvg('MC');
    if(rel.startsWith('runtime/')){
      const cache=await ensureBundle();
      const hit=await cache.match(event.request,{ignoreSearch:true});
      if(hit) return hit;
      return text('Demo runtime file not found',404);
    }
    return fetch(event.request);
  })());
});
