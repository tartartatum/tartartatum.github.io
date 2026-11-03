/* Org duties and confidential reporting. Server authority; no local permission grants. */
(function(root){
 'use strict';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(x);
 function create(adapter){
  let authority=null,contextKey='',inflight=null,refreshError='',dialog=null,view='report',rows=[],hasMore=false,busy=false,notice='',draft={category:'report',subject:'',body:''},submission=null;
  let selectedParty='',lastIdentity='';
  const context=()=>adapter.context();
  const identity=()=>{const c=context();return String(c.userId||'')+'|'+String(c.orgId||'');};
  const current=()=>authority&&contextKey===identity()?authority:null;
  const canParty=p=>!!(current()&&current().battle_parties.some(x=>x.party_id===p&&x.can_command===true));
  function fail(message){throw Error(message);}
  async function rpc(name,args){const c=context();if(!c.sb||!c.userId)fail('Sign in to use organization tools.');const key=identity();let q=c.sb.rpc(name,args);if(q.abortSignal)q=q.abortSignal(AbortSignal.timeout(15000));const r=await q;if(key!==identity())fail('Account or organization changed. Refresh before continuing.');if(r?.error)fail(r.error.message||'Database request refused.');if(!r||r.data==null)fail('The database did not confirm a result.');return r.data;}
  function captureDraft(){if(view!=='report'||!dialog)return;for(const k of ['category','subject','body']){const e=dialog.querySelector('[name="'+k+'"]');if(e)draft[k]=e.value;}}
  function status(){const e=dialog?.querySelector('[data-gov-notice]');if(e){e.textContent=notice||refreshError;e.dataset.error=refreshError?'true':'false';}document.querySelectorAll('[data-gov-open]').forEach(e=>{const a=current();e.textContent='Duties & reports'+(a?.is_admin&&a.admin_alerts?' · '+a.admin_alerts+' admin alerts':'');});}
  async function refresh(){
   if(inflight)return inflight;const c=context();const key=identity();if(lastIdentity!==key){if(lastIdentity&&dialog){dialog.close();dialog.innerHTML='';}lastIdentity=key;authority=null;contextKey='';selectedParty='';rows=[];draft={category:'report',subject:'',body:''};submission=null;view='report';}if(!c.userId){if(dialog?.open)dialog.close();return false;}
   inflight=(async()=>{try{
    const a=await rpc('cg_governance_context',{p_org:c.orgId||null});
    if(a.api_version!==1||a.user_id!==c.userId||a.org_id!==(c.orgId||null)||!Array.isArray(a.battle_parties)||['is_captain','is_leader','can_read_reports','is_admin'].some(k=>typeof a[k]!=='boolean'))fail('Organization permissions were not confirmed.');
    const wasView=view,savedInputs=dialog?.open?Array.from(dialog.querySelectorAll('[name]')).map(e=>({article:e.closest('[data-report]')?.dataset.report||'',name:e.name,value:e.value})):[];
    const changed=JSON.stringify(authority)!==JSON.stringify(a)||contextKey!==key;authority=a;contextKey=key;refreshError='';
    if(selectedParty&&!canParty(selectedParty))selectedParty='';
    if(changed){if(adapter.onChange)adapter.onChange();if(dialog?.open){captureDraft();draw();if(view===wasView)for(const x of savedInputs){const owner=x.article?Array.from(dialog.querySelectorAll('[data-report]')).find(e=>e.dataset.report===x.article):dialog;const input=owner?.querySelector('[name="'+x.name+'"]');if(input)input.value=x.value;}}}
    status();return true;
   }catch(e){authority=null;selectedParty='';refreshError='Organization service unavailable: '+e.message;if(adapter.onChange)adapter.onChange();if(dialog?.open){captureDraft();draw();}status();return false;}finally{inflight=null;}})();return inflight;
  }
  function installStyle(){if(document.getElementById('cg-governance-style'))return;const s=document.createElement('style');s.id='cg-governance-style';s.textContent=`
  .cg-gov-dialog{font:inherit;color:inherit;background:var(--bg,#101c29);border:1px solid var(--line,#518296);border-radius:12px;width:min(56rem,calc(100vw - 2rem));max-height:calc(100vh - 2rem);padding:1rem;box-sizing:border-box;overflow:auto}.cg-gov-dialog::backdrop{background:#000a}.cg-gov-dialog *{box-sizing:border-box}.cg-gov-dialog header,.cg-gov-nav,.cg-gov-actions{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}.cg-gov-dialog header strong{flex:1}.cg-gov-dialog button,.cg-gov-dialog select,.cg-gov-dialog input,.cg-gov-dialog textarea{font:inherit;color:inherit;background:var(--panel,#182b3d);border:1px solid var(--line,#518296);border-radius:5px;padding:.55em .7em;max-width:100%;min-width:0}.cg-gov-dialog button{cursor:pointer;white-space:normal}.cg-gov-dialog button:disabled{opacity:.5;cursor:wait}.cg-gov-dialog [aria-current=true]{outline:2px solid var(--cyan,#7adcec)}.cg-gov-dialog label{display:flex;flex-direction:column;gap:.35rem;margin:.7rem 0;min-width:0}.cg-gov-dialog input,.cg-gov-dialog select,.cg-gov-dialog textarea{width:100%}.cg-gov-dialog textarea{min-height:6em;resize:vertical}.cg-gov-dialog p{line-height:1.5;overflow-wrap:anywhere}.cg-gov-dialog article{border:1px solid var(--line,#518296);border-radius:8px;padding:.8rem;margin:.8rem 0;overflow-wrap:anywhere}.cg-gov-dialog h2,.cg-gov-dialog h3{font-size:1.1em;margin:.8rem 0}.cg-gov-dialog [data-gov-notice]{white-space:pre-wrap;overflow-wrap:anywhere;min-height:1.5em;margin:.75rem 0}.cg-gov-dialog [data-error=true]{color:#ffb5ad}.cg-gov-report-body{white-space:pre-wrap;overflow-wrap:anywhere}.cg-gov-dialog small{display:block;overflow-wrap:anywhere}.cg-gov-summary{display:flex;gap:.7rem;flex-wrap:wrap;align-items:center;margin:.8rem 0}.cg-gov-summary button{font:inherit;color:inherit;background:transparent;border:1px solid currentColor;border-radius:5px;padding:.55em .7em}.cg-gov-summary span{overflow-wrap:anywhere}
  `;document.head.append(s);}
  function ensureDialog(){if(dialog)return;installStyle();dialog=document.createElement('dialog');dialog.className='cg-gov-dialog';dialog.setAttribute('aria-label','Organization duties and reports');document.body.append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();if(!busy){captureDraft();dialog.close();}});dialog.addEventListener('click',event=>{const b=event.target.closest('[data-gov]');if(!b||busy)return;event.preventDefault();act(b).catch(e=>{notice='Not saved: '+e.message;status();});});}
  function callName(id){return context().members?.find(m=>m.user_id===id)?.callsign||'Assigned member';}
  function options(selected,empty='No assignment'){return '<option value="">'+esc(empty)+'</option>'+(context().members||[]).filter(m=>m.status==='approved').map(m=>'<option value="'+esc(m.user_id)+'"'+(m.user_id===selected?' selected':'')+'>'+esc(m.callsign||'Member')+'</option>').join('');}
  function reportForm(){return '<h2>Send an anonymous report</h2><p>Your organization’s leader and inbox manager cannot see your account identity. App admins can identify your account when reviewing a report flagged for threats or harassment. Details you write may identify you.</p><label>Type<select name="category">'+['report','complaint','issue','other'].map(k=>'<option'+(draft.category===k?' selected':'')+'>'+k+'</option>').join('')+'</select></label><label>Subject<input name="subject" maxlength="160" value="'+esc(draft.subject)+'" required></label><label>Report<textarea name="body" maxlength="6000" required>'+esc(draft.body)+'</textarea></label><button data-gov="submit">Send anonymous report</button><p><small>Unsent text stays in this window’s memory and is lost on reload. A saved receipt confirms delivery to the organization inbox.</small></p>';}
  function dutiesForm(){const a=current(),d=a.duties||{};let h='<h2>Chain of command</h2><p>Battle Captain has organization battle-planning, squad-transfer and linked-party command access. Organization leadership and duty assignments remain with the leader.</p>';
   for(const [key,label]of[['battle_captain','Battle Captain'],['report_manager','Report inbox manager']])h+='<article><h3>'+label+'</h3><p>'+esc(d[key]?callName(d[key]):'Not assigned')+'</p>'+(a.is_leader?'<label>Assign approved member<select name="'+key+'">'+options(d[key])+'</select></label><button data-gov="assign" data-duty="'+key+'">Save '+label.toLowerCase()+'</button>':'')+'</article>';
   if(a.is_captain||a.is_leader)h+='<button data-gov="org-command">Open organization command</button>';
   h+='<h3>Battle parties</h3><p>The leader can link a party made entirely of approved organization members. Delegated command stops if a member from outside the organization joins.</p>';
   h+=(a.battle_parties.length?a.battle_parties.map(p=>'<article><strong>'+esc(p.party_id)+'</strong><div class="cg-gov-actions">'+(p.can_command?'<button data-gov="party-command" data-party="'+esc(p.party_id)+'">Open party command</button>':'<span>Delegated command unavailable</span>')+(a.is_leader?'<button data-gov="unlink-party" data-party="'+esc(p.party_id)+'">Unlink</button>':'')+'</div></article>').join(''):'<p>No battle parties linked.</p>');
   if(a.is_leader)h+='<label>Party code<input name="party-code" maxlength="32" autocomplete="off"></label><button data-gov="link-party">Link battle party</button>';return h;
  }
  function reportsHTML(admin){const a=current();if(!rows.length)return '<p>No '+(admin?'escalations':'reports')+' in this inbox.</p>';
   return rows.map(r=>{const rid=admin?r.report_id:r.id;let h='<article data-report="'+esc(rid)+'"><h3>'+esc(r.subject)+'</h3><small>'+esc(admin?r.org_id+' · '+r.kind:r.category)+' · '+esc(new Date(admin?r.flagged_at:r.created_at).toLocaleString('en-US',{timeZone:'America/Los_Angeles',hour12:false}))+'</small><p class="cg-gov-report-body">'+esc(r.body)+'</p>';
    if(admin)h+='<p>Flag reason: '+esc(r.reason)+'</p><p>Account ID (app admin only): '+esc(r.account_id)+'</p><p>Status: '+esc(r.state)+'</p><p>'+esc(r.action_taken)+'</p><label>Admin action<select name="admin-action"><option value="review">Mark under review</option><option value="dismiss">Dismiss escalation</option><option value="restrict-reporting">Restrict account from submitting reports</option><option value="restore-reporting">Restore reporting access</option></select></label><label>Review reason<textarea name="admin-note" maxlength="2000"></textarea></label><button data-gov="admin-review">Apply admin action</button>';
    else{h+='<label>Status<select name="status">'+['new','reviewing','resolved'].map(s=>'<option'+(r.status===s?' selected':'')+'>'+s+'</option>').join('')+'</select></label><label>Review notes<textarea name="resolution" maxlength="2000">'+esc(r.resolution)+'</textarea></label><button data-gov="review">Save review</button>';
     if(a.is_leader)h+='<details><summary>Flag threat or harassment for app admin</summary><label>Reason type<select name="flag-kind"><option value="threat">Threat</option><option value="harassment">Harassment</option></select></label><label>Explain the concern<textarea name="flag-reason" maxlength="2000"></textarea></label><button data-gov="escalate">Send to app-admin inbox</button></details>';}
    return h+'</article>';}).join('')+(hasMore?'<button data-gov="more">Load older items</button>':'');
  }
  function draw(){if(!dialog)return;const a=current();let h='<header><strong>Organization duties & reports</strong><button data-gov="close" aria-label="Close organization tools">Close</button></header><div class="cg-gov-nav">';
   const tabs=a?[...(a.org_id?[['report','Send report'],['duties','Chain of command']]:[]),...(a.org_id&&a.can_read_reports?[['inbox','Report inbox']]:[]),...(a.is_admin?[['admin','Admin alerts ('+a.admin_alerts+')']]:[])]:[];
   if(!tabs.some(t=>t[0]===view)&&tabs.length)view=tabs[0][0];
   h+=tabs.map(([k,l])=>'<button data-gov="view" data-view="'+k+'" aria-current="'+(view===k)+'">'+esc(l)+'</button>').join('')+'<button data-gov="refresh">Refresh</button></div><div data-gov-notice role="status" aria-live="polite"></div><main>';
   h+=!a?'<p>Permissions have not been loaded. Use Refresh to check the organization service.</p>':view==='report'?reportForm():view==='duties'?dutiesForm():reportsHTML(view==='admin');
   dialog.innerHTML=h+'</main>';dialog.querySelectorAll('button').forEach(e=>e.disabled=busy);status();
  }
  async function loadRows(more=false){const a=current();if(!a)fail('Refresh permissions first.');const isAdmin=view==='admin';if(isAdmin?!a.is_admin:!a.can_read_reports)fail('Inbox access denied.');const last=more?rows.at(-1):null;
   const args={p_before:last?(isAdmin?last.flagged_at:last.created_at):null,p_before_id:last?(isAdmin?last.report_id:last.id):null};if(!isAdmin)args.p_org=a.org_id;
   const result=await rpc(isAdmin?'cg_admin_report_queue':'cg_list_org_reports',args);if(!Array.isArray(result))fail('Inbox response was not confirmed.');
   if(!isAdmin&&result.some(r=>r.org_id!==a.org_id||['account_id','user_id','author_id'].some(k=>k in r)))fail('Unexpected inbox identity or organization fields.');
   rows=more?rows.concat(result.filter(r=>!rows.some(x=>(x.id||x.report_id)===(r.id||r.report_id)))):result;hasMore=result.length===50;
  }
  async function act(button){const action=button.dataset.gov,a=current(),article=button.closest('[data-report]'),row=article?rows.find(r=>(r.id||r.report_id)===article.dataset.report):null;
   const value=n=>(article||dialog).querySelector('[name="'+n+'"]')?.value||'';
   captureDraft();if(action==='close'){dialog.close();return;}if(action==='view'){view=button.dataset.view;rows=[];hasMore=false;notice='';if(['inbox','admin'].includes(view)){notice='Loading inbox…';draw();await loadRows();notice='';}draw();return;}
   if(action==='org-command'){dialog.close();adapter.openCommand('ocmd');return;}
   if(action==='party-command'){const p=button.dataset.party;if(!canParty(p))fail('Party authority is no longer available.');selectedParty=p;dialog.close();adapter.openCommand('pcmd');return;}
   let failed=false;busy=true;dialog.querySelectorAll('button').forEach(e=>e.disabled=true);notice='Working…';status();
   try{
    if(action==='refresh'){await refresh();if(current()&&['inbox','admin'].includes(view))await loadRows();notice=current()?'Refreshed.':'';}
    else if(action==='more'){await loadRows(true);notice='Older items loaded.';}
    else if(action==='assign'){
     if(!a?.is_leader)fail('Organization leader required.');const duty=button.dataset.duty,target=value(duty)||null;
     const r=await rpc('cg_assign_org_duty',{p_org:a.org_id,p_duty:duty,p_user:target,p_revision:a.duties?.revision||0});
     const saved=Array.isArray(r)?r[0]:r;if(saved?.org_id!==a.org_id||saved[duty]!==target||!(saved.revision>(a.duties?.revision||0)))fail('Assignment was not confirmed.');await refresh();notice='Assignment saved.';
    }else if(action==='link-party'||action==='unlink-party'){
     if(!a?.is_leader)fail('Organization leader required.');const p=action==='link-party'?value('party-code').trim():button.dataset.party;if(!p)fail('Enter a party code.');
     const r=await rpc('cg_link_battle_party',{p_org:a.org_id,p_party:p,p_link:action==='link-party'});if(r.org_id!==a.org_id||r.party_id!==p||r.linked!==(action==='link-party'))fail('Party link was not confirmed.');await refresh();notice='Battle-party link saved.';
    }else if(action==='submit'){
     if(!a?.org_id)fail('Approved organization membership required.');if(!draft.subject.trim()||!draft.body.trim())fail('Enter a subject and report.');
     const content=JSON.stringify([a.org_id,draft]);if(!submission||submission.content!==content)submission={content,key:crypto.randomUUID()};
     const r=await rpc('cg_submit_org_report',{p_org:a.org_id,p_category:draft.category,p_subject:draft.subject,p_body:draft.body,p_key:submission.key});
     if(!r.saved||r.org_id!==a.org_id||!uuid(r.id))fail('Report delivery was not confirmed; your draft is retained.');draft={category:'report',subject:'',body:''};submission=null;notice='Report saved. Receipt: '+r.id;
    }else if(action==='review'){
     if(!row||!a?.can_read_reports)fail('Report unavailable.');const wanted=value('status');const resolution=value('resolution');const r=await rpc('cg_update_org_report',{p_id:row.id,p_status:wanted,p_resolution:resolution,p_revision:row.revision});const saved=Array.isArray(r)?r[0]:r;
     if(saved?.id!==row.id||saved.status!==wanted||saved.resolution!==resolution||saved.revision!==row.revision+1)fail('Review was not confirmed.');await loadRows();notice='Review saved.';
    }else if(action==='escalate'){
     if(!row||!a?.is_leader)fail('Organization leader required.');const reason=value('flag-reason').trim();if(!reason)fail('Explain the threat or harassment concern.');const kind=value('flag-kind');const r=await rpc('cg_escalate_org_report',{p_id:row.id,p_kind:kind,p_reason:reason});const saved=Array.isArray(r)?r[0]:r;
     if(saved?.report_id!==row.id||saved.org_id!==a.org_id||saved.kind!==kind||saved.reason!==reason||saved.state!=='new')fail('Admin notification was not confirmed.');notice='Flag delivered to the app-admin inbox for review.';
    }else if(action==='admin-review'){
     if(!row||!a?.is_admin)fail('App-admin access required.');const note=value('admin-note').trim(),selected=value('admin-action');if(!note)fail('Enter the review reason.');
     const r=await rpc('cg_admin_review_report',{p_id:row.report_id,p_action:selected,p_note:note,p_revision:row.revision});const saved=Array.isArray(r)?r[0]:r;
     if(saved?.report_id!==row.report_id||saved.revision!==row.revision+1||!saved.action_taken.startsWith(selected+': '))fail('Admin action was not confirmed.');await refresh();await loadRows();notice='Admin action recorded.';
    }else fail('Unknown action.');
   }catch(e){failed=true;notice='Not saved: '+e.message;}
   finally{busy=false;if(failed){dialog.querySelectorAll('button').forEach(e=>e.disabled=false);status();}else draw();}
  }
  async function open(which){ensureDialog();captureDraft();view=which||view;rows=[];notice='Loading permissions…';draw();if(!dialog.open)dialog.showModal();await refresh();if(current()&&['inbox','admin'].includes(view)){try{await loadRows();notice='';}catch(e){notice=e.message;}}else notice='';draw();}
  installStyle();
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-gov-open]');if(b){e.preventDefault();open(b.dataset.govOpen||undefined);}});
  return {refresh,open,isCaptain:()=>current()?.is_captain===true,isLeader:()=>current()?.is_leader===true,canParty,selectedParty:()=>canParty(selectedParty)?selectedParty:'',summaryHTML:()=>{const a=current(),d=a?.duties;return '<section class="cg-gov-summary"><button data-gov-open="">Duties & reports'+(a?.is_admin&&a.admin_alerts?' · '+a.admin_alerts+' admin alerts':'')+'</button><span>Battle Captain: '+esc(d?.battle_captain?callName(d.battle_captain):a?'Not assigned':'Checking permissions…')+'</span></section>';}};
 }
 root.CGOrgGovernance={create};
})(typeof window!=='undefined'?window:globalThis);
