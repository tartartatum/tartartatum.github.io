(()=>{
  'use strict';
  // CmdGlas tablet check. Each check gives PASS / FAIL / INFO and one line of what to do.
  // Read-only: one test value is written to this site's saved data and removed at once; nothing the tablet saved is changed.
  // The report never holds a password, a sign-in token, an e-mail address or saved tablet data.
  const SB_URL='https://rvbxbrgvsdjdtsjdusfh.supabase.co', SB_KEY='sb_publishable_cpBcAlBpirODF0a8ZtYVlw_1AqlQWMM';
  const AUTH_KEY='sb-rvbxbrgvsdjdtsjdusfh-auth-token';
  const $=id=>document.getElementById(id), list=$('list'), runBtn=$('run'), copyBtn=$('copy'), state=$('state');
  let report='';
  const cell=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
  const kb=n=>n<1024?n+' bytes':n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB';
  async function get(url,opt={},ms=10000){
    const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);
    try{const r=await fetch(url,{...opt,signal:c.signal});return r;}finally{clearTimeout(t);}
  }
  function browserName(){
    const u=navigator.userAgent,m=u.match(/(Edg|OPR|Firefox|Chrome|Version)\/(\d+)/g)||[];
    const pick=k=>(m.find(x=>x.startsWith(k+'/'))||'').split('/')[1];
    if(pick('Edg'))return 'Edge '+pick('Edg'); if(pick('OPR'))return 'Opera '+pick('OPR'); if(pick('Firefox'))return 'Firefox '+pick('Firefox');
    if(pick('Chrome'))return 'Chrome '+pick('Chrome'); if(/Safari/.test(u)&&pick('Version'))return 'Safari '+pick('Version'); return 'Unknown browser';
  }
  const platform=()=>/iPad|Macintosh.*Mobile|Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1?'iPad':/iPhone/.test(navigator.userAgent)?'iPhone':/Android/.test(navigator.userAgent)?'Android':/Windows/.test(navigator.userAgent)?'Windows':/Mac/.test(navigator.userAgent)?'Mac':'other';

  async function run(){
    const checks=[]; const add=(part,result,detail,fix='')=>checks.push({part,result,detail,fix});

    // 1. Browser
    const need=['fetch','Promise','localStorage','URLSearchParams','IntersectionObserver'].filter(k=>!(k in window));
    if(need.length)add('Browser','FAIL',browserName()+' on '+platform()+' is missing: '+need.join(', ')+'.','Update the browser, or open cmdglas.com in current Chrome, Edge, Firefox or Safari.');
    else add('Browser','PASS',browserName()+' on '+platform()+'.');

    // 2. Internet
    if(navigator.onLine===false)add('Internet','FAIL','The browser reports no connection.','Connect to the internet, then press RUN CHECKS again.');

    // 3. Saved data (the tablet keeps your settings, notes and lists here)
    let ls=null; try{ls=window.localStorage;const k='cg_check_probe';ls.setItem(k,'1');const ok=ls.getItem(k)==='1';ls.removeItem(k);if(!ok)throw Error('read back failed');}
    catch(e){ls=null;add('Saved data','FAIL','This browser does not let cmdglas.com save data ('+(e&&e.name||'blocked')+'). Your tablet settings and lists are lost when the page closes.','Do not use a private window. Allow site data for cmdglas.com in the browser settings.');}
    if(ls){
      let bytes=0,keys=0; for(let i=0;i<ls.length;i++){const k=ls.key(i)||'';bytes+=(k.length+(ls.getItem(k)||'').length)*2;keys++;}
      if(bytes>4.5*1048576)add('Saved data','FAIL',`${keys} saved items, ${kb(bytes)}. Browsers stop saving at about 5 MB.`,'Send this report to CmdGlas support before deleting anything.');
      else add('Saved data','PASS',`Saving works. ${keys} saved item${keys===1?'':'s'}, ${kb(bytes)} of about 5 MB.`);
    }
    try{if(navigator.storage&&navigator.storage.persisted){const p=await navigator.storage.persisted();add('Saved data kept','INFO',p?'The browser keeps this site\'s data.':'The browser may delete this site\'s saved data when the device is low on space.');}}catch{}

    // 4. Tablet version and clock (same site)
    let live=null,serverDate=null;
    try{const r=await get('/version.json?_='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);live=await r.json();serverDate=Date.parse(r.headers.get('date')||'');
      add('Tablet version','PASS',`Build ${live.build} (version ${live.version}) is live on cmdglas.com.`,`The tablet shows BUILD ${live.build} in its bottom corner. If yours shows a lower number, press Ctrl + F5 on the tablet (iPad: close the tab and open cmdglas.com again).`);}
    catch(e){add('Tablet version','FAIL','cmdglas.com did not answer ('+(e.name==='AbortError'?'no answer in 10 s':e.message)+').','Check the internet connection, then press RUN CHECKS again.');}
    if(serverDate){const off=Math.round((Date.now()-serverDate)/1000);
      if(Math.abs(off)>120)add('Device clock','FAIL',`This device's clock is ${Math.abs(off)>5400?Math.round(Math.abs(off)/3600)+' hours':Math.round(Math.abs(off)/60)+' minutes'} ${off>0?'ahead':'behind'}. Sign-in can fail with a wrong clock.`,'Set the date and time to automatic in the device settings.');
      else add('Device clock','PASS','Correct (within 2 minutes).');}

    // 5. Old stored copies of the site (service workers / caches)
    try{let sw=0,cs=0;if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations)sw=(await navigator.serviceWorker.getRegistrations()).length;if(window.caches&&caches.keys)cs=(await caches.keys()).length;
      if(sw||cs)add('Stored copies','INFO',`${sw} background helper${sw===1?'':'s'} and ${cs} stored cop${cs===1?'y':'ies'} of site files found.`,'If the tablet shows an old build, press Ctrl + F5 on the tablet.');
      else add('Stored copies','PASS','No old stored copy of the site.');}catch{}

    // 6. Tablet game data vs. newest game version
    let tabletData=null;
    try{const r=await get('/index.html',{cache:'force-cache'},20000);const t=await r.text();const v=[...new Set(t.match(/\b4\.\d+\.\d+-LIVE\.\d+/g)||[])];
      const num=s=>s.match(/\d+/g).slice(0,3).map(Number);v.sort((a,b)=>{const x=num(a),y=num(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];});tabletData=v.pop()||null;}catch{}
    try{const r=await get('https://api.star-citizen.wiki/api/v2/game-versions',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();
      const cur=(d.data||[]).find(x=>x.is_default)||(d.data||[])[0];
      add('Game data service','PASS','star-citizen.wiki answers (ships, items, missions).');
      if(cur&&tabletData)add('Tablet game data',cur.code===tabletData?'PASS':'INFO',cur.code===tabletData?`Matches the current game version ${cur.code}.`:`Tablet data: ${tabletData}. Current game version: ${cur.code}.`,cur.code===tabletData?'':'Blueprint and item tables are updated with each tablet build. Mission lists are read live.');}
    catch(e){add('Game data service','FAIL','star-citizen.wiki does not answer ('+(e.name==='AbortError'?'no answer in 10 s':e.message)+'). Ship, item and mission lists cannot load.','Wait a few minutes and try again. If a work or school network blocks it, use another network.');}

    // 7. Trade data service
    try{const r=await get('https://api.uexcorp.space/2.0/star_systems',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);add('Trade data service','PASS','UEX answers (prices, terminals, distances).');}
    catch(e){add('Trade data service','FAIL','UEX does not answer ('+(e.name==='AbortError'?'no answer in 10 s':e.message)+'). Trade prices and routes cannot load.','Wait a few minutes and try again. If a work or school network blocks it, use another network.');}

    // 8. Sign-in and news service
    try{const r=await get(SB_URL+'/rest/v1/site_news?select=created_at&order=created_at.desc&limit=1',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY},cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);
      add('Sign-in service','PASS','Answers (sign-in, org, news).');}
    catch(e){add('Sign-in service','FAIL','Does not answer ('+(e.name==='AbortError'?'no answer in 10 s':e.message)+'). Sign-in, org pages and news cannot load.','Check the internet connection. Content blockers can block it: allow supabase.co for cmdglas.com.');}
    if(ls){let a=null;try{a=JSON.parse(ls.getItem(AUTH_KEY)||'null');}catch{}
      if(!a)add('Signed in','INFO','Not signed in on this browser. The tablet works without signing in; org features need it.');
      else{const exp=Number(a.expires_at||0)*1000;
        if(exp&&exp<Date.now()&&!a.refresh_token)add('Signed in','FAIL','The saved sign-in has ended.','Sign in again on the tablet.');
        else add('Signed in','PASS','A sign-in is saved on this browser'+(exp?` (renews by itself; current one ${exp>Date.now()?'valid':'ended, renews at next use'}).`:'.'));}}

    // 9. Screen
    const z=Math.round((window.devicePixelRatio||1)*100);
    add('Screen','INFO',`Page area ${innerWidth} x ${innerHeight}, pixel scale ${z}%.`,innerWidth<700?'The tablet is made for a wide screen; turn a phone or iPad sideways.':'');

    return{at:new Date().toISOString(),page:location.host||'local',checks};
  }
  function text(rep){
    const lines=[`CmdGlas tablet check - report ${rep.at} (${rep.page})`,''];
    for(const c of rep.checks)lines.push(`${c.result.padEnd(4)}  ${c.part}: ${c.detail}${c.fix?'  WHAT TO DO: '+c.fix:''}`);
    return lines.join('\n');
  }
  async function go(){
    runBtn.disabled=true;state.textContent='Checking...';list.replaceChildren();
    try{
      const rep=await run();report=text(rep);
      for(const c of rep.checks){const row=cell('tr','');row.append(cell('td',c.result,'r-'+c.result.toLowerCase()),cell('td',c.part),cell('td',c.detail),cell('td',c.fix||''));list.append(row);}
      const fails=rep.checks.filter(c=>c.result==='FAIL').length;
      state.textContent=fails?fails+' problem'+(fails>1?'s':'')+' found. Do the line in WHAT TO DO, then press RUN CHECKS again.':'No problems found.';copyBtn.disabled=false;
    }catch(e){state.textContent='Could not run the checks: '+e.message;}
    finally{runBtn.disabled=false;}
  }
  runBtn.addEventListener('click',go);
  copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(report);state.textContent='Report copied. Paste it into your message to CmdGlas support.';}
    catch{const t=document.createElement('textarea');t.value=report;document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy');}catch{}t.remove();state.textContent=ok?'Report copied. Paste it into your message to CmdGlas support.':'Copy failed. Select the table and copy it by hand.';}});
  window.cgTabletCheck={run,text};
  go();
})();
