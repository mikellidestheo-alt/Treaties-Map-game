import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LAND, WATER, REGIONS, VIEWS, BOUNDS } from '../data/geo.js';

const X_SCALE = 0.08; // world units per degree of longitude
const Y_SCALE = 0.1; // world units per degree of latitude

/** lon/lat -> world x/z (north is -z, the map lies on the XZ plane). */
export const toWorld = (lon, lat) => new THREE.Vector3(lon * X_SCALE, 0, -lat * Y_SCALE);

const COLORS = {
  ocean: 0x0a1c33,
  land: 0x2f4660,
  neutral: 0x5d7894,
  water: 0x0a1c33,
  grid: 0x24456b,
};

const DEPTH = { land: 0.025, neutral: 0.07, solved: 0.16 };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function shapeFrom(pts) {
  const s = new THREE.Shape();
  pts.forEach(([lon, lat], i) => {
    const x = lon * X_SCALE;
    const y = lat * Y_SCALE;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  });
  s.closePath();
  return s;
}

/**
 * Owns the three.js scene: low-poly extruded map, camera presets, picking, and the
 * animation state of every quiz region.
 */
export class MapScene {
  constructor(canvas, container, { onPick, onHover } = {}) {
    this.canvas = canvas;
    this.container = container;
    this.onPick = onPick ?? (() => {});
    this.onHover = onHover ?? (() => {});
    this.pickEnabled = true;
    this.regions = {}; // id -> record
    this.effects = [];
    this.labels = new Map(); // id -> element
    this.labelLayer = document.getElementById('labels');
    this.hoverId = null;
    this.tween = null;
    this.lastT = performance.now();
    this.elapsed = 0;
    this.viewFactor = 1;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(COLORS.ocean);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

    this._buildLights();
    this._buildOcean();
    this._buildLand();
    this._buildRegions();
    this._buildControls();
    this._bindPointer();

    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    new ResizeObserver(this._resize).observe(container);
    this._resize();
    this.setView('world', false);
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  // ------------------------------------------------------------------ building
  _buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xdfeaff, 0x1a2a40, 1.35));
    const sun = new THREE.DirectionalLight(0xffffff, 1.7);
    sun.position.set(-6, 14, 8);
    this.scene.add(sun);
    const rim = new THREE.DirectionalLight(0x88aaff, 0.5);
    rim.position.set(8, 6, -10);
    this.scene.add(rim);
  }

  _buildOcean() {
    const w = (BOUNDS.lonMax - BOUNDS.lonMin) * X_SCALE;
    const h = (BOUNDS.latMax - BOUNDS.latMin) * Y_SCALE;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 60, h + 60),
      new THREE.MeshStandardMaterial({ color: COLORS.ocean, roughness: 1 }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(((BOUNDS.lonMin + BOUNDS.lonMax) / 2) * X_SCALE, -0.01, -((BOUNDS.latMin + BOUNDS.latMax) / 2) * Y_SCALE);
    this.scene.add(plane);
    this.ocean = plane;

    // graticule every 10 degrees
    const pts = [];
    for (let lon = -30; lon <= 200; lon += 10) {
      const a = toWorld(lon, BOUNDS.latMin - 5);
      const b = toWorld(lon, BOUNDS.latMax + 5);
      pts.push(a.x, 0.002, a.z, b.x, 0.002, b.z);
    }
    for (let lat = -50; lat <= 80; lat += 10) {
      const a = toWorld(-30, lat);
      const b = toWorld(200, lat);
      pts.push(a.x, 0.002, a.z, b.x, 0.002, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: COLORS.grid, transparent: true, opacity: 0.5 })));
  }

  _buildLand() {
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.land, roughness: 0.9 });
    const group = new THREE.Group();
    for (const l of LAND) {
      const geo = new THREE.ExtrudeGeometry(shapeFrom(l.pts), { depth: DEPTH.land, bevelEnabled: false });
      const m = new THREE.Mesh(geo, mat);
      group.add(m);
    }
    const wmat = new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: 0.8 });
    for (const l of WATER) {
      const geo = new THREE.ExtrudeGeometry(shapeFrom(l.pts), { depth: 0.005, bevelEnabled: false });
      const m = new THREE.Mesh(geo, wmat);
      m.position.z = DEPTH.land + 0.002;
      group.add(m);
    }
    group.rotation.x = -Math.PI / 2;
    this.scene.add(group);
  }

  _buildRegions() {
    this.pickMeshes = [];
    for (const [id, def] of Object.entries(REGIONS)) {
      const group = new THREE.Group();
      group.rotation.x = -Math.PI / 2;
      const material = new THREE.MeshStandardMaterial({
        color: COLORS.neutral,
        roughness: 0.55,
        emissive: 0x000000,
        emissiveIntensity: 1,
      });
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
      const meshes = [];
      const verts = [];
      let sx = 0, sy = 0, n = 0;
      for (const poly of def.polys) {
        const geo = new THREE.ExtrudeGeometry(shapeFrom(poly), { depth: 1, bevelEnabled: false });
        const mesh = new THREE.Mesh(geo, material);
        mesh.userData.regionId = id;
        group.add(mesh);
        meshes.push(mesh);
        const line = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(poly.map(([lo, la]) => new THREE.Vector3(lo * X_SCALE, la * Y_SCALE, 1.002))),
          lineMat,
        );
        group.add(line);
        for (const [lo, la] of poly) {
          verts.push(new THREE.Vector2(lo * X_SCALE, -la * Y_SCALE));
          sx += lo; sy += la; n++;
        }
      }
      group.scale.z = DEPTH.neutral;
      this.scene.add(group);
      const rec = {
        id, def, group, material, lineMat, meshes, verts,
        centroid: toWorld(sx / n, sy / n),
        color: new THREE.Color(COLORS.neutral),
        targetColor: new THREE.Color(COLORS.neutral),
        depth: DEPTH.neutral,
        targetDepth: DEPTH.neutral,
        bump: 0,
        flash: 0,
        flashColor: new THREE.Color(0xff3b3b),
        hover: false,
        hint: false,
        state: 'neutral',
        visible: !def.hidden,
        solved: false,
      };
      group.visible = rec.visible;
      this.regions[id] = rec;
      if (rec.visible) this.pickMeshes.push(...meshes);
    }
  }

  _buildControls() {
    const c = new OrbitControls(this.camera, this.canvas);
    c.enableDamping = true;
    c.dampingFactor = 0.09;
    c.screenSpacePanning = false; // pan along the map plane
    c.minDistance = 1.6;
    c.maxDistance = 30;
    c.minPolarAngle = 0;
    c.maxPolarAngle = THREE.MathUtils.degToRad(62);
    c.minAzimuthAngle = THREE.MathUtils.degToRad(-55);
    c.maxAzimuthAngle = THREE.MathUtils.degToRad(55);
    c.zoomSpeed = 0.9;
    c.rotateSpeed = 0.7;
    c.panSpeed = 1.0;
    // mouse: left drag pans the map, right drag tilts/rotates, wheel zooms
    c.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    // touch: one finger drags the map, two fingers pinch-zoom and twist/tilt
    c.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
    this.controls = c;
    const centre = toWorld(
      (BOUNDS.lonMin + BOUNDS.lonMax) / 2,
      (BOUNDS.latMin + BOUNDS.latMax) / 2,
    );
    this.minBound = toWorld(BOUNDS.lonMin, BOUNDS.latMax); // top-left
    this.maxBound = toWorld(BOUNDS.lonMax, BOUNDS.latMin); // bottom-right
    this.controls.target.copy(centre);
  }

  // ------------------------------------------------------------------ pointer
  _bindPointer() {
    const el = this.canvas;
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    let down = null;
    el.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
      this.tween = null; // user takes over the camera
    });
    el.addEventListener('pointerup', (e) => {
      if (!down || e.pointerId !== down.id) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dt = performance.now() - down.t;
      down = null;
      if (moved < 8 && dt < 600 && this.pickEnabled) {
        const id = this._pick(e.clientX, e.clientY, e.pointerType === 'touch' ? 1.6 : 1);
        this.onPick(id, { x: e.clientX, y: e.clientY });
      }
    });
    el.addEventListener('pointercancel', () => (down = null));
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || e.buttons) return;
      const id = this._pick(e.clientX, e.clientY, 1);
      this._setHover(id, e.clientX, e.clientY);
    });
    el.addEventListener('pointerleave', () => this._setHover(null));
  }

  _setHover(id, x, y) {
    if (this.hoverId && this.hoverId !== id && this.regions[this.hoverId]) this.regions[this.hoverId].hover = false;
    this.hoverId = id;
    if (id) this.regions[id].hover = true;
    this.canvas.style.cursor = id ? 'pointer' : 'grab';
    this.onHover(id, { x, y });
  }

  /** Raycast to a region; fall back to the nearest small region within a finger-sized radius. */
  _pick(cx, cy, assist = 1) {
    const r = this.canvas.getBoundingClientRect();
    this.ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.scene.updateMatrixWorld();
    const hit = this.raycaster.intersectObjects(this.pickMeshes, false)[0];
    if (hit) return hit.object.userData.regionId;
    // tap assist: intersect the ocean plane and look for nearby region vertices
    const p = this.raycaster.intersectObject(this.ocean, false)[0];
    if (!p) return null;
    const dist = this.camera.position.distanceTo(p.point);
    const radius = dist * 0.028 * assist;
    let best = null;
    let bestD = radius;
    for (const rec of Object.values(this.regions)) {
      if (!rec.visible) continue;
      for (const v of rec.verts) {
        const d = Math.hypot(v.x - p.point.x, v.y - p.point.z);
        if (d < bestD) { bestD = d; best = rec.id; }
      }
    }
    return best;
  }

  // ------------------------------------------------------------------ public API
  /** Fly to a preset camera view. */
  setView(name, animate = true) {
    const v = VIEWS[name] ?? VIEWS.world;
    const c = toWorld(v.target[0], v.target[1]);
    const target = { target: c, dist: v.dist * this.viewFactor, tilt: THREE.MathUtils.degToRad(v.tilt), az: 0 };
    this.currentView = name;
    if (!animate) {
      this._applyCam(target);
      return;
    }
    const cur = this._currentCam();
    this.tween = { from: cur, to: target, t: 0, dur: 1.15 };
  }

  focusRegion(id, dist = 5) {
    const rec = this.regions[id];
    if (!rec) return;
    const cur = this._currentCam();
    this.tween = {
      from: cur,
      to: { target: rec.centroid.clone(), dist: Math.max(dist * this.viewFactor, 1.8), tilt: THREE.MathUtils.degToRad(28), az: 0 },
      t: 0,
      dur: 1.0,
    };
  }

  _currentCam() {
    const off = this.camera.position.clone().sub(this.controls.target);
    const dist = off.length();
    return {
      target: this.controls.target.clone(),
      dist,
      tilt: Math.acos(THREE.MathUtils.clamp(off.y / dist, -1, 1)),
      az: Math.atan2(off.x, off.z),
    };
  }

  _applyCam({ target, dist, tilt, az }) {
    this.controls.target.copy(target);
    this.camera.position.set(
      target.x + dist * Math.sin(tilt) * Math.sin(az),
      target.y + dist * Math.cos(tilt),
      target.z + dist * Math.sin(tilt) * Math.cos(az),
    );
    this.camera.lookAt(target);
  }

  setPickEnabled(v) { this.pickEnabled = v; }

  /** Colour/depth style for a region. depth is world height of the extrusion. */
  setStyle(id, { color, depth, solved } = {}) {
    const r = this.regions[id];
    if (!r) return;
    if (color !== undefined) r.targetColor.set(color);
    if (depth !== undefined) r.targetDepth = depth;
    if (solved !== undefined) r.solved = solved;
  }

  resetStyle(id) {
    const r = this.regions[id];
    if (!r) return;
    r.targetColor.set(COLORS.neutral);
    r.targetDepth = DEPTH.neutral;
    r.solved = false;
  }

  markSolved(id, color) {
    this.setStyle(id, { color, depth: DEPTH.solved, solved: true });
  }

  setVisible(id, visible) {
    const r = this.regions[id];
    if (!r || r.visible === visible) return;
    r.visible = visible;
    r.group.visible = visible;
    this.pickMeshes = Object.values(this.regions).filter((x) => x.visible).flatMap((x) => x.meshes);
  }

  setHint(id, on) {
    const r = this.regions[id];
    if (r) r.hint = on;
  }

  flashWrong(id) {
    const r = this.regions[id];
    if (r) r.flash = 1;
  }

  bump(id) {
    const r = this.regions[id];
    if (r) r.bump = 1;
  }

  /** Expanding ring and particle burst over a region. */
  celebrate(id, color = '#ffffff') {
    const r = this.regions[id];
    if (!r) return;
    this.bump(id);
    const col = new THREE.Color(color);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.095, 0.1, 64),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(r.centroid).setY(0.25);
    this.scene.add(ring);
    this.effects.push({ type: 'ring', obj: ring, t: 0, dur: 1.1 });

    const N = 36;
    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      pos.set([r.centroid.x, 0.25, r.centroid.z], i * 3);
      const a = Math.random() * Math.PI * 2;
      const s = 0.5 + Math.random() * 1.4;
      vel.push(new THREE.Vector3(Math.cos(a) * s, 1.4 + Math.random() * 1.8, Math.sin(a) * s));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: col.clone().lerp(new THREE.Color(0xffffff), 0.4), size: 0.08, transparent: true, depthWrite: false }),
    );
    this.scene.add(pts);
    this.effects.push({ type: 'burst', obj: pts, vel, t: 0, dur: 1.3 });
  }

  /** Name labels floating over regions. */
  showLabel(id, text, accent) {
    if (this.labels.has(id)) {
      this.labels.get(id).el.textContent = text;
      return;
    }
    const el = document.createElement('div');
    el.className = 'map-label';
    el.textContent = text;
    if (accent) el.style.borderColor = accent;
    this.labelLayer.appendChild(el);
    this.labels.set(id, { el, rec: this.regions[id] });
  }

  clearLabels(onlyIds) {
    for (const [id, l] of this.labels) {
      if (!onlyIds || onlyIds.includes(id)) {
        l.el.remove();
        this.labels.delete(id);
      }
    }
  }

  regionScreenPos(id) {
    const rec = this.regions[id];
    if (!rec) return null;
    const v = rec.centroid.clone().setY(rec.depth).project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }

  // ------------------------------------------------------------------ loop
  _resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // portrait screens need the camera further back to keep the same ground coverage
    const f = THREE.MathUtils.clamp(1.45 / this.camera.aspect, 1, 2.3);
    if (this.currentView && Math.abs(f - this.viewFactor) > 0.02) {
      const ratio = f / this.viewFactor;
      this.viewFactor = f;
      const off = this.camera.position.clone().sub(this.controls.target).multiplyScalar(ratio);
      this.camera.position.copy(this.controls.target).add(off);
    } else {
      this.viewFactor = f;
    }
  }

  _clampTarget() {
    const t = this.controls.target;
    const cx = THREE.MathUtils.clamp(t.x, this.minBound.x, this.maxBound.x);
    const cz = THREE.MathUtils.clamp(t.z, this.minBound.z, this.maxBound.z);
    if (cx !== t.x || cz !== t.z) {
      const dx = cx - t.x;
      const dz = cz - t.z;
      t.x = cx; t.z = cz;
      this.camera.position.x += dx;
      this.camera.position.z += dz;
    }
  }

  _loop() {
    requestAnimationFrame(this._loop);
    const now = performance.now();
    const dt = Math.min((now - this.lastT) / 1000, 0.1);
    this.lastT = now;
    const time = (this.elapsed += dt);

    if (this.tween) {
      const tw = this.tween;
      tw.t += dt / tw.dur;
      const k = easeInOut(Math.min(tw.t, 1));
      const a = tw.from, b = tw.to;
      this._applyCam({
        target: a.target.clone().lerp(b.target, k),
        dist: a.dist + (b.dist - a.dist) * k,
        tilt: a.tilt + (b.tilt - a.tilt) * k,
        az: a.az + (b.az - a.az) * k,
      });
      if (tw.t >= 1) this.tween = null;
    } else {
      this.controls.update();
      this._clampTarget();
    }

    const k = 1 - Math.exp(-dt * 9);
    for (const r of Object.values(this.regions)) {
      if (!r.visible) continue;
      r.color.lerp(r.targetColor, k);
      r.depth += (r.targetDepth - r.depth) * k;
      r.bump = Math.max(0, r.bump - dt * 1.4);
      r.flash = Math.max(0, r.flash - dt * 1.7);
      const lift = Math.sin(r.bump * Math.PI) * 0.22;
      r.group.scale.z = Math.max(r.depth + lift + (r.hover ? 0.03 : 0), 0.001);
      r.material.color.copy(r.color);
      let em = r.hover ? 0.22 : 0;
      r.material.emissive.setRGB(em, em, em);
      if (r.hint) {
        const p = 0.25 + 0.25 * Math.sin(time * 5);
        r.material.emissive.setRGB(p * 0.95, p * 0.8, p * 0.2);
      }
      if (r.flash > 0) {
        r.material.emissive.copy(r.flashColor).multiplyScalar(r.flash * 0.9);
      }
      r.lineMat.opacity = r.hover ? 0.95 : r.solved ? 0.8 : 0.45;
    }

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.t += dt / e.dur;
      const p = Math.min(e.t, 1);
      if (e.type === 'ring') {
        e.obj.scale.setScalar(1 + p * 6);
        e.obj.material.opacity = 0.95 * (1 - p);
      } else {
        const a = e.obj.geometry.attributes.position;
        for (let j = 0; j < e.vel.length; j++) {
          e.vel[j].y -= 4.5 * dt;
          a.setXYZ(j, a.getX(j) + e.vel[j].x * dt, Math.max(a.getY(j) + e.vel[j].y * dt, 0.05), a.getZ(j) + e.vel[j].z * dt);
        }
        a.needsUpdate = true;
        e.obj.material.opacity = 1 - p;
      }
      if (p >= 1) {
        this.scene.remove(e.obj);
        e.obj.geometry.dispose();
        e.obj.material.dispose();
        this.effects.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
    this._updateLabels();
  }

  _updateLabels() {
    if (!this.labels.size) return;
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector3();
    for (const { el, rec } of this.labels.values()) {
      if (!rec.visible) { el.style.display = 'none'; continue; }
      v.copy(rec.centroid).setY(0.25).project(this.camera);
      const onScreen = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      el.style.display = onScreen ? '' : 'none';
      el.style.transform = `translate(-50%, -120%) translate(${((v.x + 1) / 2) * r.width}px, ${((1 - v.y) / 2) * r.height}px)`;
    }
  }
}
