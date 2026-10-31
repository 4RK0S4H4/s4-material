/* Liquid glass for the S4 Orion review lab: real refraction, not just blur.

   Model: every glass shape is a slab of glass with a flat bottom lying on the content and a top that is flat in the
   middle and curves down to the edge over a "bezel" (a convex squircle profile, h(t) = (1 - (1 - t)^4)^(1/4)). Looking
   straight down, a ray hits the curved top, bends by Snell's law (index of refraction n) and lands on the content a
   little further in. In the flat middle nothing bends; near the rim the content is pulled in from deeper inside, which
   is what makes edges look thick and liquid. On top of that: a light blur, saturation, the tint that keeps text
   legible, a specular rim lit from the top left (and, weaker, the bottom right), and a soft shadow.

   Two engines, same math:
   - WebGL2 (every modern browser, iPhone included). Samples a texture of what is behind the glass, so the backdrop
     must be a canvas the page draws (LiquidGlass.stage({ scene })). One shared GL context renders every stage and
     copies the result into each stage's own 2D canvas. Glass shapes are any [data-lg] elements in the stage; shapes
     melt into each other (smooth union) and [data-lg="lens"] shapes float above as magnifying lenses.
   - SVG (Chromium only): backdrop-filter: url(#filter) with a displacement map generated from the same math. Works
     over any DOM, but no melting, and Safari/Firefox parse it and render nothing, so it is only offered in Chromium.
   No dependencies. */
window.LiquidGlass = (function () {
  'use strict';
  var MAX = 8;
  var PRESETS = {
    subtle: { bezel: 10, thick: 10, ior: 1.5, blur: 9, ca: 0, spec: 0.55, sat: 1.5, merge: 18, mag: 1.08 },
    liquid: { bezel: 20, thick: 24, ior: 1.5, blur: 2.5, ca: 0.18, spec: 0.9, sat: 1.6, merge: 22, mag: 1.18 },
    extra:  { bezel: 28, thick: 44, ior: 1.6, blur: 0.8, ca: 0.4, spec: 1, sat: 1.7, merge: 28, mag: 1.3 }
  };

  /* ---------------- shared math (also used for the SVG maps) ---------------- */
  function sdRR(px, py, bx, by, r) {
    var qx = Math.abs(px) - bx + r, qy = Math.abs(py) - by + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  }
  function slopeAt(t) { var a = 1 - t, b = 1 - a * a * a * a; return a * a * a * Math.pow(Math.max(b, 1e-4), -0.75); }
  function shift(depth, bezel, thick, ior) {   /* px the content is pulled inward at this depth from the edge */
    if (depth >= bezel || bezel <= 0) return 0;
    var t = Math.max(depth / bezel, 0), th = Math.atan(slopeAt(t) * thick / bezel);
    return thick * Math.tan(th - Math.asin(Math.sin(th) / ior));
  }

  /* ---------------- WebGL2 renderer ---------------- */
  var VS = '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D uScene;uniform vec2 uSize;uniform float uScale;uniform vec4 uSceneRect;uniform float uTexScale;',
    'uniform int uCount;uniform vec4 uRect[' + MAX + '];uniform vec4 uShape[' + MAX + '];',
    'uniform float uMerge,uBezel,uThick,uIor,uBlur,uCA,uSpec,uSat,uContrast,uBright,uTintA,uAdaptive,uMinCR,uShadow,uMag,uDark;',
    'uniform vec3 uTint,uText;',
    'out vec4 o;',
    'float sdRR(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}',
    'float smin(float a,float b,float k){if(k<=0.)return min(a,b);float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}',
    /* returns (distance, half of the smaller side of the nearest shape, nearest index) */
    'vec3 field(vec2 p,float layer){float d=1e5,best=1e5,half_=1.,idx=0.;',
    ' for(int i=0;i<' + MAX + ';i++){if(i>=uCount)break;if(abs(uShape[i].y-layer)>.5)continue;',
    '  float s=sdRR(p-uRect[i].xy,uRect[i].zw,uShape[i].x);if(s<best){best=s;half_=min(uRect[i].z,uRect[i].w);idx=float(i);}',
    '  d=smin(d,s,layer>.5?0.:uMerge);}',
    ' return vec3(d,half_,idx);}',
    'float slope(float t){float a=1.-t;float b=1.-a*a*a*a;return a*a*a*pow(max(b,1e-4),-.75);}',
    'float shift(float depth,float bez,float thick){if(depth>=bez||bez<=0.)return 0.;float t=max(depth/bez,0.);',
    ' float th=atan(slope(t)*thick/bez);return thick*tan(th-asin(sin(th)/uIor));}',
    'vec3 tap(vec2 q,float lod){return textureLod(uScene,(q-uSceneRect.xy)/uSceneRect.zw,lod).rgb;}',
    'vec3 blurAt(vec2 q){if(uBlur<.4)return tap(q,0.);',
    ' float lod=max(log2(uBlur*.3*uTexScale),0.);vec3 acc=vec3(0.);',
    ' for(int i=0;i<12;i++){float a=float(i)*2.39996;float r=sqrt((float(i)+.5)/12.)*uBlur;acc+=tap(q+vec2(cos(a),sin(a))*r,lod);}',
    ' return acc/12.;}',
    'float lin(float c){return c<=.04045?c/12.92:pow((c+.055)/1.055,2.4);}',
    'float lum(vec3 c){return .2126*lin(c.r)+.7152*lin(c.g)+.0722*lin(c.b);}',
    'float cr(vec3 a,vec3 b){float x=lum(a)+.05,y=lum(b)+.05;return max(x,y)/min(x,y);}',
    /* smallest tint that keeps the text at the target contrast over this color (binary search) */
    'float need(vec3 c){if(cr(uText,c)>=uMinCR)return 0.;float lo=0.,hi=1.;for(int i=0;i<9;i++){float m=(lo+hi)*.5;if(cr(uText,mix(c,uTint,m))>=uMinCR)hi=m;else lo=m;}return hi;}',
    'vec3 grade(vec3 c){c=mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,uSat);return clamp(((c-.5)*uContrast+.5)*uBright,0.,1.);}',
    'void main(){',
    ' vec2 p=vec2(gl_FragCoord.x,uSize.y*uScale-gl_FragCoord.y)/uScale;',
    ' float layer=1.;vec3 f=field(p,1.);',
    ' if(f.x>.5/uScale){layer=0.;f=field(p,0.);}',
    ' float cov=clamp(.5-f.x*uScale,0.,1.);',
    ' float sd=field(p-vec2(0.,4.),0.).x;float sh=uShadow*exp(-max(sd,0.)/9.)*(sd>-30.?1.:0.);',
    ' if(cov<=0.){o=vec4(0.,0.,0.,sh);return;}',
    ' vec2 e=vec2(.6,0.);',
    ' vec2 g=vec2(field(p+e.xy,layer).x-field(p-e.xy,layer).x,field(p+e.yx,layer).x-field(p-e.yx,layer).x);',
    ' vec2 n=length(g)>1e-6?normalize(g):vec2(0.);',
    ' float depth=max(-f.x,0.);float bez=min(uBezel*(layer>.5?1.3:1.),f.y);',
    ' float m=shift(depth,bez,uThick*(layer>.5?1.2:1.));',
    ' vec2 q=p-n*m;',
    ' if(layer>.5){vec2 c=uRect[int(f.z)].xy;q=c+(q-c)/uMag;}',
    ' vec3 col;',
    ' if(uCA>0.&&m>.05){col=vec3(blurAt(p-n*m*(1.+uCA)).r,blurAt(q).g,blurAt(p-n*m*(1.-uCA)).b);',
    '  if(layer>.5){vec2 c=uRect[int(f.z)].xy;col=vec3(blurAt(c+(p-n*m*(1.+uCA)-c)/uMag).r,blurAt(q).g,blurAt(c+(p-n*m*(1.-uCA)-c)/uMag).b);}}',
    ' else col=blurAt(q);',
    ' col=grade(col);',
    ' float ta=uTintA*(layer>.5?.6:1.);',
    ' if(uAdaptive>.5){vec3 soft=grade(tap(q,max(log2(18.*uTexScale),0.)));ta=max(ta,max(need(col),need(soft)));}',
    ' col=mix(col,uTint,ta);',
    ' vec2 L=normalize(vec2(-.55,-.85));float k=dot(n,L);',
    ' float lit=pow(max(k,0.),1.5)+.55*pow(max(-k,0.),1.5);',
    ' float rim=exp(-depth*uScale/1.6)+.45*exp(-depth/2.2);',
    ' float band=1.-smoothstep(0.,bez,depth);',
    ' float s=uSpec*((rim*(.18+.82*lit))*(uDark>.5?.55:.85)+band*band*lit*(uDark>.5?.07:.16));',
    ' col=1.-(1.-col)*(1.-clamp(s,0.,1.));',
    ' if(uDark<.5)col*=1.-.06*band*band*pow(max(-dot(n,vec2(0.,-1.)),0.),2.);',
    ' o=vec4(col*cov,cov)+vec4(0.,0.,0.,sh*(1.-cov));',
    '}'].join('\n');

  var gl = null, glCanvas = null, prog = null, U = {}, failed = false;
  function initGL() {
    if (gl || failed) return !!gl;
    glCanvas = document.createElement('canvas');
    glCanvas.width = glCanvas.height = 1;
    gl = glCanvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { failed = true; return false; }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    try {
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) { console.error('LiquidGlass:', e.message); gl = null; failed = true; return false; }
    gl.useProgram(prog);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uScene', 'uSize', 'uScale', 'uSceneRect', 'uTexScale', 'uCount', 'uRect', 'uShape', 'uMerge', 'uBezel', 'uThick', 'uIor', 'uBlur', 'uCA', 'uSpec', 'uSat',
     'uContrast', 'uBright', 'uTintA', 'uAdaptive', 'uMinCR', 'uShadow', 'uMag', 'uDark', 'uTint', 'uText'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1i(U.uScene, 0);
    glCanvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); texCache.clear(); stages.forEach(function (s) { s.key = ''; }); });
    glCanvas.addEventListener('webglcontextrestored', function () { gl = null; initGL(); });
    return true;
  }

  /* ---------------- stages ---------------- */
  var stages = [];
  function parseColor(c) {   /* any CSS color -> [r,g,b] 0..1 */
    var x = document.createElement('i'); x.style.color = c; x.style.display = 'none'; document.body.appendChild(x);
    var v = getComputedStyle(x).color.match(/[\d.]+/g).slice(0, 3).map(function (n) { return +n / 255; }); x.remove(); return v;
  }
  function radiusOf(el, w, h) {
    var r = getComputedStyle(el).borderTopLeftRadius, v = parseFloat(r) || 0;
    if (r.indexOf('%') > 0) v = v / 100 * Math.min(w, h);
    return Math.min(v * (w / (el.offsetWidth || w)), w / 2, h / 2);
  }

  /* opts: { root, scene (element showing the backdrop, used for its position), source (canvas with the same pixels,
     uploaded as the texture; defaults to scene; several stages may share one), params, mode: 'webgl'|'svg'|'off' } */
  var texCache = new Map();
  function bindSource(src) {
    var t = texCache.get(src); if (!t) { t = { tex: gl.createTexture(), v: -1 }; texCache.set(src, t); }
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (t.v !== (src._lgv || 0)) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      t.v = src._lgv || 0;
    }
  }
  function Stage(opts) {
    this.root = opts.root; this.scene = opts.scene; this.source = opts.source || opts.scene; this.params = Object.assign({}, PRESETS.liquid, opts.params || {});
    this.mode = opts.mode || 'webgl';
    this.out = document.createElement('canvas'); this.out.className = 'lg-out'; this.out.setAttribute('aria-hidden', 'true');
    this.root.insertBefore(this.out, this.scene.closest('.lg-scroll') ? this.scene.closest('.lg-scroll').nextSibling : this.scene.nextSibling);
    this.ctx = this.out.getContext('2d');
    this.visible = true; this.key = ''; this.colors = null;
    var self = this;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { self.visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(this.root);
    stages.push(this);
    this.setMode(this.mode);
    loop();
  }
  Stage.prototype.set = function (p) { Object.assign(this.params, p); this.key = ''; if (this.mode === 'svg') svgRefresh(this); };
  Stage.prototype.sceneChanged = function () { this.source._lgv = (this.source._lgv || 0) + 1; this.key = ''; this.colors = null; if (this.mode === 'svg') svgRefresh(this); };
  Stage.prototype.setMode = function (m) {
    if (m === 'webgl' && !initGL()) m = 'off';
    if (m === 'svg' && !LiquidGlass.svgSupported) m = 'off';
    this.mode = m; this.root.dataset.lgMode = m; this.out.hidden = m !== 'webgl'; this.key = '';
    if (m === 'svg') svgRefresh(this); else svgClear(this);
  };
  Stage.prototype.shapes = function () {
    var rr = this.root.getBoundingClientRect(), out = [];
    this.root.querySelectorAll('[data-lg]').forEach(function (el) {
      if (out.length >= MAX || el.closest('[hidden]')) return;
      var r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
      out.push({ x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2, hw: r.width / 2, hh: r.height / 2,
        r: radiusOf(el, r.width, r.height), layer: el.dataset.lg === 'lens' ? 1 : 0 });
    });
    return { rr: rr, list: out };
  };
  Stage.prototype.render = function () {
    if (this.mode !== 'webgl' || !this.visible || !gl) return;
    var s = this.shapes(), rr = s.rr, sr = this.scene.getBoundingClientRect();
    var scale = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(rr.width * scale), H = Math.round(rr.height * scale);
    if (!W || !H) return;
    var P = this.params, key = [W, H, sr.left - rr.left, sr.top - rr.top, this.source._lgv || 0, JSON.stringify(P), JSON.stringify(s.list)].join('|');
    if (key === this.key) return; this.key = key;
    if (this.out.width !== W || this.out.height !== H) { this.out.width = W; this.out.height = H; }
    if (glCanvas.width < W || glCanvas.height < H) { glCanvas.width = Math.max(glCanvas.width, W); glCanvas.height = Math.max(glCanvas.height, H); }
    bindSource(this.source);
    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.uSize, rr.width, rr.height); gl.uniform1f(U.uScale, W / rr.width);
    gl.uniform4f(U.uSceneRect, sr.left - rr.left, sr.top - rr.top, sr.width, sr.height);
    gl.uniform1f(U.uTexScale, this.source.width / sr.width);
    var rect = new Float32Array(MAX * 4), shp = new Float32Array(MAX * 4);
    s.list.forEach(function (o, i) { rect.set([o.x, o.y, o.hw, o.hh], i * 4); shp.set([o.r, o.layer, 0, 0], i * 4); });
    gl.uniform1i(U.uCount, s.list.length); gl.uniform4fv(U.uRect, rect); gl.uniform4fv(U.uShape, shp);
    var dark = document.documentElement.dataset.theme === 'dark';
    gl.uniform1f(U.uMerge, P.merge); gl.uniform1f(U.uBezel, P.bezel); gl.uniform1f(U.uThick, P.thick); gl.uniform1f(U.uIor, P.ior);
    gl.uniform1f(U.uBlur, P.blur); gl.uniform1f(U.uCA, P.ca); gl.uniform1f(U.uSpec, P.spec); gl.uniform1f(U.uSat, P.sat);
    gl.uniform1f(U.uContrast, P.contrast == null ? 1 : P.contrast); gl.uniform1f(U.uBright, P.bright == null ? 1 : P.bright);
    gl.uniform1f(U.uTintA, P.tint == null ? 0.2 : P.tint); gl.uniform1f(U.uAdaptive, P.adaptive ? 1 : 0); gl.uniform1f(U.uMinCR, P.minCR || 4.5);
    gl.uniform1f(U.uShadow, P.shadow == null ? (dark ? 0.32 : 0.14) : P.shadow); gl.uniform1f(U.uMag, P.mag || 1.15); gl.uniform1f(U.uDark, dark ? 1 : 0);
    if (!this.colors) { var css = getComputedStyle(this.root); this.colors = { tint: parseColor(css.getPropertyValue('--lg-tint').trim() || 'white'), text: parseColor(css.getPropertyValue('--lg-text').trim() || 'black') }; }
    gl.uniform3fv(U.uTint, P.tintColor || this.colors.tint); gl.uniform3fv(U.uText, P.textColor || this.colors.text);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.ctx.clearRect(0, 0, W, H);
    this.ctx.drawImage(glCanvas, 0, glCanvas.height - H, W, H, 0, 0, W, H);
  };
  Stage.prototype.invalidate = function () { this.key = ''; };

  var running = false;
  function loop() {
    if (running) return; running = true;
    (function frame() {
      for (var i = 0; i < stages.length; i++) { try { stages[i].render(); } catch (e) { console.error(e); } }
      requestAnimationFrame(frame);
    })();
  }

  /* ---------------- SVG engine (Chromium) ---------------- */
  var svgRoot = null, uid = 0;
  function svgHost() {
    if (svgRoot) return svgRoot;
    svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgRoot.setAttribute('aria-hidden', 'true'); svgRoot.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    document.body.appendChild(svgRoot); return svgRoot;
  }
  /* displacement map (R = x, G = y, 128 = none) and a specular image for one rounded rectangle */
  function maps(w, h, r, P, dark) {
    var W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h)), bez = Math.min(P.bezel, Math.min(w, h) / 2);
    var maxD = Math.max(shift(0, bez, P.thick, P.ior), 1);
    var c1 = document.createElement('canvas'), c2 = document.createElement('canvas'); c1.width = c2.width = W; c1.height = c2.height = H;
    var d1 = c1.getContext('2d').createImageData(W, H), d2 = c2.getContext('2d').createImageData(W, H);
    var lx = -0.55, ly = -0.85, ll = Math.hypot(lx, ly); lx /= ll; ly /= ll;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var px = x + 0.5 - w / 2, py = y + 0.5 - h / 2, d = sdRR(px, py, w / 2, h / 2, r), i = (y * W + x) * 4;
      var gx = sdRR(px + 0.5, py, w / 2, h / 2, r) - sdRR(px - 0.5, py, w / 2, h / 2, r), gy = sdRR(px, py + 0.5, w / 2, h / 2, r) - sdRR(px, py - 0.5, w / 2, h / 2, r);
      var gl_ = Math.hypot(gx, gy) || 1; gx /= gl_; gy /= gl_;
      var depth = Math.max(-d, 0), m = d > 0 ? 0 : shift(depth, bez, P.thick, P.ior);
      d1.data[i] = 128 + (-gx * m / maxD) * 127; d1.data[i + 1] = 128 + (-gy * m / maxD) * 127; d1.data[i + 2] = 128; d1.data[i + 3] = 255;
      var k = gx * lx + gy * ly, lit = Math.pow(Math.max(k, 0), 1.5) + 0.55 * Math.pow(Math.max(-k, 0), 1.5);
      var rim = Math.exp(-depth / 0.8) + 0.45 * Math.exp(-depth / 2.2), band = 1 - Math.min(depth / bez, 1); band = band * band * (3 - 2 * band);
      var s = P.spec * (rim * (0.18 + 0.82 * lit) * (dark ? 0.55 : 0.85) + band * band * lit * (dark ? 0.07 : 0.16));
      d2.data[i] = d2.data[i + 1] = d2.data[i + 2] = 255; d2.data[i + 3] = d > 0.5 ? 0 : Math.min(255, s * 255);
    }
    c1.getContext('2d').putImageData(d1, 0, 0); c2.getContext('2d').putImageData(d2, 0, 0);
    return { disp: c1.toDataURL(), spec: c2.toDataURL(), scale: maxD * 2 };
  }
  function svgApply(el, P, dark) {
    var r = el.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
    var rad = radiusOf(el, w, h), sig = [w, h, rad, JSON.stringify(P), dark].join('|');
    if (el._lgSig === sig) return; el._lgSig = sig;
    var m = maps(w, h, rad, P, dark), id = el._lgId || (el._lgId = 'lg' + (++uid)), ns = 'http://www.w3.org/2000/svg';
    var f = document.getElementById(id); if (f) f.remove();
    f = document.createElementNS(ns, 'filter');
    f.id = id; f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', w); f.setAttribute('height', h);
    f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse'); f.setAttribute('color-interpolation-filters', 'sRGB');
    var c = P.contrast == null ? 1 : P.contrast, b = P.bright == null ? 1 : P.bright;
    f.innerHTML = '<feGaussianBlur in="SourceGraphic" stdDeviation="' + (P.blur / 2) + '" result="b"/>' +
      '<feImage href="' + m.disp + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none" result="map"/>' +
      '<feDisplacementMap in="b" in2="map" scale="' + m.scale + '" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="d" type="saturate" values="' + P.sat + '" result="s"/>' +
      '<feComponentTransfer in="s"><feFuncR type="linear" slope="' + c * b + '" intercept="' + (0.5 - 0.5 * c) * b + '"/><feFuncG type="linear" slope="' + c * b + '" intercept="' + (0.5 - 0.5 * c) * b + '"/><feFuncB type="linear" slope="' + c * b + '" intercept="' + (0.5 - 0.5 * c) * b + '"/></feComponentTransfer>';
    svgHost().appendChild(f);
    el.style.setProperty('--lg-spec', 'url(' + m.spec + ')');
    el.style.backdropFilter = 'url(#' + id + ')';
    el.style.setProperty('--lg-tint-a', (P.tint == null ? 0.2 : P.tint) * 100 + '%');
  }
  function svgRefresh(stage) {
    var dark = document.documentElement.dataset.theme === 'dark';
    stage.root.querySelectorAll('[data-lg]').forEach(function (el) { el._lgSig = ''; svgApply(el, stage.params, dark); });
    if (!stage._ro) {
      stage._ro = new ResizeObserver(function (es) { if (stage.mode !== 'svg') return; es.forEach(function (e) { svgApply(e.target, stage.params, document.documentElement.dataset.theme === 'dark'); }); });
      stage.root.querySelectorAll('[data-lg]').forEach(function (el) { stage._ro.observe(el); });
    }
  }
  function svgClear(stage) {
    stage.root.querySelectorAll('[data-lg]').forEach(function (el) {
      el.style.backdropFilter = ''; el.style.removeProperty('--lg-spec'); el.style.removeProperty('--lg-tint-a'); el._lgSig = '';
      if (el._lgId) { var f = document.getElementById(el._lgId); if (f) f.remove(); }
    });
  }

  var ua = navigator.userAgent;
  return {
    PRESETS: PRESETS,
    stage: function (o) { return new Stage(o); },
    webglSupported: function () { return initGL(); },
    svgSupported: /Chrome\/\d/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua) && !!(window.CSS && CSS.supports('backdrop-filter', 'url(#a)')),
    shift: shift,
    invalidateAll: function () { stages.forEach(function (s) { s.key = ''; s.colors = null; if (s.mode === 'svg') svgRefresh(s); }); },
    touch: function (src) { src._lgv = (src._lgv || 0) + 1; }
  };
})();
