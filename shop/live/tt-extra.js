/* 25 NOV RAZ: "let users click the images to make them grow a bit and be readable": tap a picture = large view, tap again = close */
(function(){var lb=document.getElementById("ttlb"),im=lb.querySelector("img");function big(i){var ss=(i.getAttribute("srcset")||"").split(",").map(function(x){return x.trim().split(" ")[0]}).filter(Boolean);return ss.length?ss[ss.length-1]:i.currentSrc||i.src;}
document.addEventListener("click",function(e){var i=e.target.closest&&e.target.closest("img");if(i&&(i.closest("#ttlb")||i.closest("a,button")||i.getBoundingClientRect().width<140))i=null; /* 26 NOV RAZ: "not all images pop out and are clickable to large images with a way to close": every content picture */if(i){im.src=big(i);im.alt=i.alt;lb.classList.add("on");e.preventDefault();return;}if(e.target.closest&&e.target.closest("#ttlb"))lb.classList.remove("on");});
document.addEventListener("keydown",function(e){if(e.key==="Escape")lb.classList.remove("on");});})();
/* 25 NOV RAZ: "when i click on the picture users should be able to see a full 4k image" + "user has to be able to interact and click the buttons ... encourage them to click around"
   + "this is as much a shop as a demonstrator in itself": the XENEON EDGE deck is live to tap right in the card; every display has a FULL SCREEN button (drawn at real size, scaled up, sharp). */
(function(){var ov=document.createElement("div");ov.id="ttdemo";ov.innerHTML='<button class="ttclose" type="button">CLOSE &times;</button><div class="box"><iframe title="Large view"></iframe></div>';document.body.appendChild(ov);
var box=ov.querySelector(".box"),fr=ov.querySelector("iframe"),W=0,H=0;
function fit(){if(!W)return;var k=Math.min(innerWidth*.96/W,innerHeight*.88/H);box.style.width=W*k+"px";box.style.height=H*k+"px";fr.style.width=W+"px";fr.style.height=H+"px";fr.style.transform="scale("+k+")";}
function shut(){ov.classList.remove("on");fr.src="about:blank";}
document.querySelectorAll(".tele-top .tt-win").forEach(function(w){var b=document.createElement("button");b.type="button";b.className="tt-fullbtn";b.textContent="FULL SCREEN";w.parentNode.insertBefore(b,w.nextSibling);
 if(w.closest(".tt-edge")){w.classList.add("tt-live");var h=document.createElement("p");h.className="tt-try";h.innerHTML="<b>TRY IT:</b> tap GEAR, DOORS, LIGHTS, LAMP, ESP, G-SAFE, COUPLED or SHIP POWER and watch the keys change. Tap IFCS, ENGINEERING, SHIP... to switch pages.";w.parentNode.insertBefore(h,w);}
 b.addEventListener("click",function(){var f=w.querySelector("iframe");W=+w.dataset.w;H=+w.dataset.h;fr.src=f.getAttribute("src");ov.classList.toggle("live",w.classList.contains("tt-live"));ov.classList.add("on");fit();});});
ov.addEventListener("click",function(e){if(e.target===ov||e.target.closest(".ttclose"))shut();});
addEventListener("resize",fit);document.addEventListener("keydown",function(e){if(e.key==="Escape")shut();});})();
/* 26 NOV RAZ: "the kneeboard slider has huge black gaps below the images": every slider takes the height of the picture on show (no gap under shorter pictures). */
(function(){document.querySelectorAll(".roll .roll-track").forEach(function(tr){var t=0;
function fit(){var L=tr.getBoundingClientRect().left,s=null,d=1e9;tr.querySelectorAll(".roll-slide").forEach(function(x){var q=Math.abs(x.getBoundingClientRect().left-L);if(q<d){d=q;s=x;}});if(!s)return;var h=s.getBoundingClientRect().height;if(h>40)tr.style.height=h+"px";}
tr.style.transition="height .25s";tr.style.alignItems="flex-start";tr.addEventListener("scroll",function(){clearTimeout(t);t=setTimeout(fit,90);});addEventListener("resize",fit);
tr.querySelectorAll("img").forEach(function(i){if(!i.complete)i.addEventListener("load",fit);});setTimeout(fit,300);});})();
