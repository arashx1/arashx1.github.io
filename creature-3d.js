import * as THREE from './three.module.js';

// Solid geometry, physical lighting, surface texture and real depth occlusion.
const host = document.querySelector('#hero-stage');
const oldEngine = host.querySelector('#engine');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
} catch {
  host.classList.add('webgl-unavailable');
}
if (renderer) {
  host.classList.add('solid-stage');
  oldEngine.hidden = true;
  const canvas = renderer.domElement;
  canvas.className = 'solid-creature';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Solid moss-covered 3D serpent. Drag or use arrow keys to rotate. Scroll to travel around it.');
  host.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#484b42', .045);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  camera.position.set(0, .2, 8.7);
  scene.add(new THREE.HemisphereLight('#f1f0d6', '#20271d', 2.4));
  const key = new THREE.DirectionalLight('#fff9df', 3.8);
  key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#a0b78e', 2.5);
  rim.position.set(4, 1, -3); scene.add(rim);

  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 256;
  const ink = textureCanvas.getContext('2d');
  const image = ink.createImageData(256, 256);
  let seed = 17;
  function random() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (let i = 0; i < image.data.length; i += 4) {
    const n = random(), moss = n > .78;
    image.data[i] = moss ? 100 + n * 28 : 31 + n * 25;
    image.data[i + 1] = moss ? 113 + n * 28 : 41 + n * 32;
    image.data[i + 2] = moss ? 55 + n * 18 : 28 + n * 22;
    image.data[i + 3] = 255;
  }
  ink.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 3);
  const skin = new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture, bumpScale: .065, roughness: .96, metalness: 0 });
  const group = new THREE.Group(); scene.add(group);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.3,-1.7,.4), new THREE.Vector3(-1.5,-1.4,1.1),
    new THREE.Vector3(1.4,-.8,.5), new THREE.Vector3(1.9,.9,-.5),
    new THREE.Vector3(.2,1.75,-.9), new THREE.Vector3(-1.6,.9,-.25),
    new THREE.Vector3(-1.5,-.35,1.2), new THREE.Vector3(.2,-.65,1.7),
    new THREE.Vector3(2.3,.35,.3), new THREE.Vector3(3.2,1.7,-1.2)
  ]);
  function makeBranch(curve, radius, segments) {
    const geometry = new THREE.TubeGeometry(curve, segments, radius, 20, false);
    group.add(new THREE.Mesh(geometry, skin));
    const grid = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({color:'#bbceaa',transparent:true,opacity:.065}));
    group.add(grid);
    return geometry;
  }
  const body = makeBranch(path, .32, 180);
  makeBranch(new THREE.CatmullRomCurve3([new THREE.Vector3(.1,-.6,1.6),new THREE.Vector3(.5,.2,1.5),new THREE.Vector3(.7,1.7,.8),new THREE.Vector3(1.4,3,-.2)]),.17,70);
  makeBranch(new THREE.CatmullRomCurve3([new THREE.Vector3(-1.5,.5,.2),new THREE.Vector3(-2.1,1.4,.6),new THREE.Vector3(-2,2.8,.2)]),.13,55);

  const clumps = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({color:'#819758',roughness:1}), 2600);
  const frames = path.computeFrenetFrames(180, false);
  const dummy = new THREE.Object3D();
  for (let i=0;i<2600;i++) {
    const t=random(), a=random()*Math.PI*2, index=Math.min(179,Math.floor(t*180));
    const center=path.getPointAt(t);
    const normal=frames.normals[index].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[index],Math.sin(a));
    dummy.position.copy(center).addScaledVector(normal,.32+random()*.028);
    dummy.rotation.set(random()*3,random()*3,random()*3);
    const size=.012+random()*.025;dummy.scale.set(size,size*.7,size);
    dummy.updateMatrix();clumps.setMatrixAt(i,dummy.matrix);
    clumps.setColorAt(i,new THREE.Color().setHSL(.19+random()*.06,.22+random()*.2,.16+random()*.2));
  }
  group.add(clumps);
  group.rotation.set(.1,-.35,-.18);
  let targetX=.1,targetY=-.35,dragging=false,px=0,py=0,visible=true,previous=0;
  canvas.style.touchAction='pan-y';
  canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetY+=(e.clientX-px)*.007;targetX+=(e.clientY-py)*.004;px=e.clientX;py=e.clientY;});
  canvas.addEventListener('pointerup',()=>dragging=false);
  canvas.addEventListener('pointercancel',()=>dragging=false);
  canvas.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();if(e.key==='ArrowLeft')targetY-=.15;if(e.key==='ArrowRight')targetY+=.15;if(e.key==='ArrowUp')targetX-=.15;if(e.key==='ArrowDown')targetX+=.15;});
  new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);
  new ResizeObserver(()=>{const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();camera.position.z=r.width<450?10.5:8.7;}).observe(host);
  const toggle=document.createElement('button');toggle.id='dragon-toggle';toggle.textContent='3D form: on';toggle.setAttribute('aria-pressed','true');document.querySelector('.contact footer').append(toggle);
  let enabled=true;
  toggle.addEventListener('click',()=>{enabled=!enabled;canvas.hidden=!enabled;toggle.textContent=enabled?'3D form: on':'3D form: off';toggle.setAttribute('aria-pressed',String(enabled));});
  document.querySelector('#hero-morph').textContent='Drag to explore · Scroll to orbit ↗';
  window.addFrameTask(time=>{
    if(!visible||!enabled)return;
    const calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduced-motion');
    const dt=Math.min(50,time-previous||32)/32;previous=time;
    group.rotation.y+=(targetY+ (calm?0:scrollY*.00055+Math.sin(time*.00012)*.12)-group.rotation.y)*.055*dt;
    group.rotation.x+=(targetX-group.rotation.x)*.055*dt;
    group.position.y=calm?0:Math.sin(time*.00035)*.055;
    renderer.render(scene,camera);
  });
}
