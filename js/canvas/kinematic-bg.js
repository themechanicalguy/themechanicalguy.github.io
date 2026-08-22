/* Hero crank-slider blueprint. Classic script so it runs even if ES modules fail. */
(function () {
  var canvas = document.getElementById('rain');
  if (!canvas) return;

  var root = document.documentElement;
  var hero = document.getElementById('hero') || canvas.parentElement;
  var ctx = canvas.getContext('2d');
  if (!ctx || !hero) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = null;
  var theta = 0;
  var M = {};
  var CY, AM;

  function setPalette() {
    if (root.getAttribute('data-theme') === 'light') {
      CY = 'rgba(70,78,96,';
      AM = 'rgba(181,80,42,';
    } else {
      CY = 'rgba(90,200,255,';
      AM = 'rgba(255,180,84,';
    }
  }

  function sizeCanvas() {
    var rect = hero.getBoundingClientRect();
    var w = Math.max(Math.floor(rect.width), hero.clientWidth, 1);
    var h = Math.max(Math.floor(rect.height), hero.clientHeight, Math.floor(window.innerHeight * 0.7), 1);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
  }

  function initScene() {
    var w = canvas.width, h = canvas.height;
    var base = Math.min(w, h);
    var module = base * 0.0125;

    var crankTeeth = 26, timingTeeth = 17;
    var Rc = module * crankTeeth / 2;
    var Rt = module * timingTeeth / 2;
    var centerDist = Rc + Rt;

    var cx = w * 0.66;
    var cy = h * 0.58;

    var meshAng = Math.PI * 0.82;
    var tx = cx + Math.cos(meshAng) * centerDist;
    var ty = cy + Math.sin(meshAng) * centerDist;

    M = {
      cx: cx, cy: cy,
      crank: { teeth: crankTeeth, R: Rc },
      timing: { x: tx, y: ty, teeth: timingTeeth, R: Rt, ratio: crankTeeth / timingTeeth },
      r: Rc * 0.52,
      rod: Rc * 1.75,
      cylW: base * 0.055,
      pistonH: base * 0.05
    };
  }

  function drawGear(R, teeth, rot, alpha) {
    var toothH = R * 0.12;
    var inner = R * 0.62;
    var step = (Math.PI * 2) / teeth;
    ctx.save();
    ctx.rotate(rot);
    ctx.strokeStyle = CY + alpha + ')';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a0 = i * step;
      var a1 = a0 + step * 0.5;
      var rOut = R + toothH;
      ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R);
      ctx.lineTo(Math.cos(a0 + step * 0.20) * rOut, Math.sin(a0 + step * 0.20) * rOut);
      ctx.lineTo(Math.cos(a1 - step * 0.20) * rOut, Math.sin(a1 - step * 0.20) * rOut);
      ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R);
      ctx.lineTo(Math.cos(a0 + step) * R, Math.sin(a0 + step) * R);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, inner, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    for (var s = 0; s < 4; s++) {
      var sa = s * (Math.PI / 2);
      ctx.moveTo(Math.cos(sa) * R * 0.16, Math.sin(sa) * R * 0.16);
      ctx.lineTo(Math.cos(sa) * inner, Math.sin(sa) * inner);
    }
    ctx.stroke();
    ctx.restore();
  }

  function joint(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + '0.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = color + '0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function dimension(ax, ay, bx, by, alpha) {
    ctx.strokeStyle = CY + alpha + ')';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    var ang = Math.atan2(by - ay, bx - ax) + Math.PI / 2, tk = 5;
    [[ax, ay], [bx, by]].forEach(function (p) {
      ctx.beginPath();
      ctx.moveTo(p[0] - Math.cos(ang) * tk, p[1] - Math.sin(ang) * tk);
      ctx.lineTo(p[0] + Math.cos(ang) * tk, p[1] + Math.sin(ang) * tk);
      ctx.stroke();
    });
  }

  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPalette();

    var cx = M.cx, cy = M.cy, r = M.r, L = M.rod;

    ctx.setLineDash([5, 5]);
    dimension(cx, cy, M.timing.x, M.timing.y, 0.12);
    ctx.setLineDash([]);

    ctx.save(); ctx.translate(cx, cy);
    drawGear(M.crank.R, M.crank.teeth, theta, 0.22);
    ctx.restore();

    var timingRot = -theta * M.timing.ratio + Math.PI / M.timing.teeth;
    ctx.save(); ctx.translate(M.timing.x, M.timing.y);
    drawGear(M.timing.R, M.timing.teeth, timingRot, 0.18);
    ctx.restore();

    var px = cx + Math.cos(theta) * r;
    var py = cy + Math.sin(theta) * r;
    var underRoot = L * L - Math.pow(cx - px, 2);
    var hgt = underRoot > 0 ? Math.sqrt(underRoot) : 0;
    var pistonY = py - hgt;
    var pistonY2 = cy - r - L;

    ctx.strokeStyle = CY + '0.20)';
    ctx.lineWidth = 1.2;
    var top = Math.min(pistonY, pistonY2) - M.pistonH * 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - M.cylW, cy - r * 0.3);
    ctx.lineTo(cx - M.cylW, top);
    ctx.moveTo(cx + M.cylW, cy - r * 0.3);
    ctx.lineTo(cx + M.cylW, top);
    ctx.moveTo(cx - M.cylW, top);
    ctx.lineTo(cx + M.cylW, top);
    ctx.stroke();

    ctx.strokeStyle = AM + '0.85)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - M.cylW * 0.86, pistonY - M.pistonH / 2, M.cylW * 1.72, M.pistonH);
    ctx.strokeStyle = AM + '0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - M.cylW * 0.86, pistonY - M.pistonH * 0.15);
    ctx.lineTo(cx + M.cylW * 0.86, pistonY - M.pistonH * 0.15);
    ctx.moveTo(cx - M.cylW * 0.86, pistonY + M.pistonH * 0.15);
    ctx.lineTo(cx + M.cylW * 0.86, pistonY + M.pistonH * 0.15);
    ctx.stroke();

    ctx.strokeStyle = AM + '0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, pistonY); ctx.stroke();

    ctx.strokeStyle = CY + '0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

    joint(cx, cy, 3, CY);
    joint(px, py, 2.6, AM);
    joint(cx, pistonY, 2.6, AM);
    joint(M.timing.x, M.timing.y, 3, CY);
  }

  function tick() {
    theta += 0.012;
    paint();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    sizeCanvas();
    initScene();
    paint();
    if (!reduced && !raf) raf = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    sizeCanvas();
    initScene();
    if (reduced) paint();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    requestAnimationFrame(start);
  }
})();
