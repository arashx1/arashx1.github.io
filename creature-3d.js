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
  canvas.setAttribute('aria-label', 'Loading detailed 3D dragon sculpture.');
  host.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#484b42', .022);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  camera.position.set(0, .2, 8.7);
  scene.add(new THREE.HemisphereLight('#f1f0d6', '#11160d', 1.3));
  const key = new THREE.DirectionalLight('#fff9df', 3.2);
  key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#a0b78e', 2.5);
  rim.position.set(4, 1, -3); scene.add(rim);

  // Scanned dragon sculpture: Stanford / McGuire, distributed by Khronos.
  const group = new THREE.Group(); scene.add(group);
  const skin = new THREE.MeshStandardMaterial({color:'#757b60',roughness:.67,metalness:.12});
  async function loadDragon() {
    const response = await fetch('./dragon.glb');
    if (!response.ok) throw new Error('Dragon asset unavailable');
    const buffer = await response.arrayBuffer();
    const view = new DataView(buffer);
    const jsonLength = view.getUint32(12,true);
    const data = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,jsonLength)));
    const binaryOffset = 28 + jsonLength;
    const primitive = data.meshes.find(mesh=>mesh.name==='Dragon').primitives[0];
    function attribute(index) {
      const accessor=data.accessors[index], chunk=data.bufferViews[accessor.bufferView];
      const count=accessor.count*({SCALAR:1,VEC2:2,VEC3:3}[accessor.type]);
      const Type=accessor.componentType===5126?Float32Array:Uint32Array;
      return new Type(buffer,binaryOffset+(chunk.byteOffset||0)+(accessor.byteOffset||0),count);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(attribute(primitive.attributes.POSITION),3));
    geometry.setAttribute('normal',new THREE.BufferAttribute(attribute(primitive.attributes.NORMAL),3));
    geometry.setIndex(new THREE.BufferAttribute(attribute(primitive.indices),1));
    geometry.rotateX(Math.PI/2);geometry.center();geometry.computeBoundingBox();
    const size=geometry.boundingBox.getSize(new THREE.Vector3());
    geometry.scale(4.6/size.x,4.6/size.x,4.6/size.x);
    const dragon=new THREE.Mesh(geometry,skin);group.add(dragon);
    canvas.setAttribute('aria-label','Detailed sculpted 3D dragon. Drag or use arrow keys to rotate. Scroll to orbit.');
  }
  loadDragon().catch(error=>{console.error(error);canvas.hidden=true;host.classList.add('webgl-unavailable');});
  group.rotation.set(.04,-.32,0);
  let targetX=.04,targetY=-.32,dragging=false,px=0,py=0,visible=true,previous=0;
  canvas.style.touchAction='pan-y';
  canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetY+=(e.clientX-px)*.007;targetX+=(e.clientY-py)*.004;px=e.clientX;py=e.clientY;});
  canvas.addEventListener('pointerup',()=>dragging=false);
  canvas.addEventListener('pointercancel',()=>dragging=false);
  canvas.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();if(e.key==='ArrowLeft')targetY-=.15;if(e.key==='ArrowRight')targetY+=.15;if(e.key==='ArrowUp')targetX-=.15;if(e.key==='ArrowDown')targetX+=.15;});
  new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);
  new ResizeObserver(()=>{const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();camera.position.z=r.width<450?10.5:8.7;}).observe(host);
  const toggle=document.createElement('button');toggle.id='dragon-toggle';toggle.textContent='3D form: on';toggle.setAttribute('aria-pressed','true');document.querySelector('.contact footer').append(toggle);
  const credit=document.createElement('a');credit.href='./DRAGON-LICENSE.txt';credit.textContent='Dragon scan: Stanford / McGuire';credit.className='dragon-credit';document.querySelector('.contact footer').append(credit);
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
