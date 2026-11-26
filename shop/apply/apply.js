/* Org test application (chat 2, 25 NOV, STAGED). Checks the form in the browser, then sends it to chat 8's Worker route /api/org-apply (honeypot 'website' must stay empty).
   The receiver is LIVE (chat 8, lowsig-crew 03c02bef, 25 NOV). Do not send test forms: every send stores a real entry. */
(function () {
  var f = document.getElementById('apply'), msg = document.getElementById('msg');
  function say(t, cls) { msg.textContent = t; msg.className = 'msg ' + (cls || ''); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = +f.members.value;
    if (!f.checkValidity()) { say('Please fill in every field marked, and tick the agreement.', 'bad'); f.reportValidity(); return; }
    if (n < 15 || n > 60) { say('Test orgs have 15 to 60 members on the RSI org page.', 'bad'); return; }
    var data = {}; new FormData(f).forEach(function (v, k) { if (k === 'gear') { (data.gear = data.gear || []).push(v); } else data[k] = v; });
    fetch(f.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.ok && j.ok) { say('Application received. We check your org and reply on Discord.', 'ok'); f.reset(); } else if (j && j.error) { say(j.error, 'bad'); } else throw 0; }); })
      .catch(function () { say('Could not send. Check your internet connection and try again.', 'bad'); });
  });
})();
