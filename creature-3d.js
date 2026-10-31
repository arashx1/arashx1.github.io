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
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Loading detailed 3D dragon sculpture.');
  const backdrop=document.createElement('div');backdrop.className='dragon-backdrop';backdrop.setAttribute('aria-hidden','true');backdrop.append(canvas);document.body.prepend(backdrop);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  camera.position.set(0, .2, 8.7);
  scene.add(new THREE.HemisphereLight('#eee6ff', '#10091d', 1.6));
  const key = new THREE.DirectionalLight('#eee2ff', 3.1);
  key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#a56aff', 4.5);
  rim.position.set(4, 1, -3); scene.add(rim);

  // Scanned dragon sculpture: Stanford / McGuire, distributed by Khronos.
  const group = new THREE.Group(); scene.add(group);
  const skin = new THREE.MeshStandardMaterial({color:'#8060b4',emissive:'#24103e',emissiveIntensity:.22,roughness:.53,metalness:.16});
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
  let pointerX=0,pointerY=0,previous=0;
  window.addEventListener('pointermove',event=>{
    pointerX=event.clientX/innerWidth-.5;pointerY=event.clientY/innerHeight-.5;
  },{passive:true});
  function resizeBackdrop() {
    renderer.setSize(innerWidth,innerHeight);
    camera.aspect=innerWidth/Math.max(1,innerHeight);
    camera.position.z=innerWidth<700?7.6:6.2;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resizeBackdrop,{passive:true});resizeBackdrop();
  const toggle=document.createElement('button');toggle.id='dragon-toggle';toggle.textContent='Dragon motion: on';toggle.setAttribute('aria-pressed','true');document.querySelector('.contact footer').append(toggle);
  const credit=document.createElement('a');credit.href='./DRAGON-LICENSE.txt';credit.textContent='Dragon scan: Stanford / McGuire';credit.className='dragon-credit';document.querySelector('.contact footer').append(credit);
  let enabled=true;
  toggle.addEventListener('click',()=>{enabled=!enabled;canvas.hidden=!enabled;toggle.textContent=enabled?'Dragon motion: on':'Dragon motion: off';toggle.setAttribute('aria-pressed',String(enabled));});

  window.addFrameTask(time=>{
    if(!enabled)return;
    const calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduced-motion');
    const dt=Math.min(50,time-previous||32)/32;previous=time;
    const progress=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const phase=progress*Math.PI*3;
    const targetY=-.22+(calm?0:Math.sin(phase)*.45+pointerX*.22+Math.sin(time*.00016)*.08);
    const targetX=.06+(calm?0:pointerY*.08+Math.sin(phase)*.05);
    group.rotation.y+=(targetY-group.rotation.y)*.04*dt;
    group.rotation.x+=(targetX-group.rotation.x)*.04*dt;
    group.rotation.z=calm?-.1:Math.sin(phase*.6)*.09-.1;
    const targetPosition=innerWidth<700?.8:1.65;
    group.position.x+=(targetPosition+(calm?0:Math.sin(phase)*.65+pointerX*.15)-group.position.x)*.035*dt;
    group.position.y=calm?-.1:Math.sin(time*.0004)*.1+Math.sin(phase)*.3-.1;
    renderer.render(scene,camera);
  });
}
