/* Spring presets for the review demos: each spring is turned into a CSS linear() easing plus a duration.
   S4Springs.use('D') picks a preset; S4Springs.get('spatial') returns { d, e }; S4Springs.anim(el, keyframes, name, opts).
   Spatial springs move things; effects springs fade and recolor and never overshoot. Reduced motion makes spatial instant. */
window.S4Springs = (function () {
  function spring(k, z) {
    var w = Math.sqrt(k), x = function (t) {
      if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
      var wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
    };
    var end = 0; for (var t = 0; t < 3; t += 0.001) if (Math.abs(x(t) - 1) > 0.002) end = t; end = Math.max(end, 0.05);
    var pts = []; for (var i = 0; i <= 40; i++) { var v = x(end * i / 40); pts.push(i === 0 ? '0' : i === 40 ? '1' : v.toFixed(3) + ' ' + (i * 2.5).toFixed(1) + '%'); }
    return { d: Math.round(end * 1000), e: 'linear(' + pts.join(',') + ')' };
  }
  var PRESETS = {
    A: { name: 'Fluid', sp: [[1400, 1], [800, 1], [420, 1]], fx: [[2600, 1], [1500, 1], [900, 1]] },
    B: { name: 'Crisp', sp: [[2200, 1], [1300, 1], [700, 1]], fx: [[3800, 1], [2200, 1], [1300, 1]] },
    C: { name: 'Liquid Settle', sp: [[1300, .86], [720, .88], [380, .9]], fx: [[2600, 1], [1500, 1], [900, 1]] },
    D: { name: 'M3 Expressive', sp: [[800, .6], [380, .8], [200, .8]], fx: [[3800, 1], [1600, 1], [800, 1]] }
  };
  var NAMES = ['fast-spatial', 'spatial', 'slow-spatial', 'fast-effects', 'effects', 'slow-effects'];
  /* "-calm" spatial springs: same stiffness, critically damped. For moves that must land exactly on a target and never
     pass it, such as a container shrinking back into its source. */
  var CALM = ['fast-spatial-calm', 'spatial-calm', 'slow-spatial-calm'];
  var S = {}, current = 'D', slow = 1, reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function use(key, slowMo) {
    current = key || current; if (slowMo) slow = slowMo;
    var p = PRESETS[current];
    p.sp.concat(p.fx).forEach(function (kz, i) { var s = spring(kz[0], kz[1]); S[NAMES[i]] = { d: reduce.matches && i < 3 ? 1 : s.d * slow, e: s.e }; });
    p.sp.forEach(function (kz, i) { var s = spring(kz[0], 1); S[CALM[i]] = { d: reduce.matches ? 1 : s.d * slow, e: s.e }; });
  }
  function anim(el, kf, name, o) {
    var opts = { duration: S[name].d, easing: S[name].e, fill: 'both' }; for (var k in o) opts[k] = o[k];
    return el.animate(kf, opts);
  }
  use('D');
  if (reduce.addEventListener) reduce.addEventListener('change', function () { use(); });
  return { use: use, get: function (n) { return S[n]; }, anim: anim, presets: PRESETS, current: function () { return current; } };
})();
