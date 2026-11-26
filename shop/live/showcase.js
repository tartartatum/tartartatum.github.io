/* scale each display window to the card width (the pages are drawn at their real size) */
(function () { function fit() { document.querySelectorAll('.tele-top .tt-win').forEach(function (w) { var W = +w.dataset.w, H = +w.dataset.h, f = w.querySelector('iframe'), k = w.clientWidth / W;
  w.style.height = Math.round(H * k) + 'px'; f.style.width = W + 'px'; f.style.height = H + 'px'; f.style.transform = 'scale(' + k + ')'; }); }
  addEventListener('resize', fit); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit); else fit(); setTimeout(fit, 500); })();
