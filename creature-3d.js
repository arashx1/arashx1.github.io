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
  scene.add(new THREE.HemisphereLight('#e1e6c9', '#131513', 1.5));
  const key = new THREE.DirectionalLight('#eeecd8', 3.3);
  key.position.set(-1, 3, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#9a78c4', 3.0);
  rim.position.set(4, 1, -3); scene.add(rim);

  // Scanned dragon sculpture: Stanford / McGuire, distributed by Khronos.
  const group = new THREE.Group(); scene.add(group);
  const skin = new THREE.MeshStandardMaterial({color:'#aaa997',roughness:.94,metalness:.02});
  // Object-space detail stays attached to the sculpture as it moves.
  skin.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 mossPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmossPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 mossPosition;
      float mossHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float mossNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(mossHash(i),mossHash(i+vec3(1,0,0)),f.x),mix(mossHash(i+vec3(0,1,0)),mossHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(mossHash(i+vec3(0,0,1)),mossHash(i+vec3(1,0,1)),f.x),mix(mossHash(i+vec3(0,1,1)),mossHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float mossPatch=mossNoise(mossPosition*2.8)*.65+mossNoise(mossPosition*8.)*.35;
      float grain=mossNoise(mossPosition*95.);
      float bark=pow(.5+.5*sin(mossPosition.y*53.+mossNoise(mossPosition*5.)*12.),5.);
      vec3 barkColor=mix(vec3(.12,.09,.15),vec3(.30,.25,.34),bark);
      vec3 mossColor=mix(vec3(.10,.15,.045),vec3(.36,.43,.14),grain);
      diffuseColor.rgb*=mix(barkColor,mossColor,smoothstep(.43,.62,mossPatch));
      diffuseColor.rgb*=.65+grain*.6;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float relief=mossNoise(mossPosition*80.)*.009;
      vec3 surfaceX=dFdx(vViewPosition),surfaceY=dFdy(vViewPosition);
      vec3 crossX=cross(surfaceY,normal),crossY=cross(normal,surfaceX);
      float determinant=dot(surfaceX,crossX);
      normal=normalize(abs(determinant)*normal-sign(determinant)*(dFdx(relief)*crossX+dFdy(relief)*crossY));
    `);
  };
  const coils=new THREE.Group();scene.add(coils);
  const path=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6,2.7,-1.8),new THREE.Vector3(-3,2.9,-1.5),new THREE.Vector3(1,2.5,-1.8),
    new THREE.Vector3(4,1.1,-1.2),new THREE.Vector3(3.6,-1.6,-1.5),new THREE.Vector3(.2,-2.4,-1.4),
    new THREE.Vector3(-4,-2.0,-1.9),new THREE.Vector3(-4.6,.2,-2.1),new THREE.Vector3(-2,1.5,-2.5),new THREE.Vector3(1.4,.5,-2.1)
  ]);
  const coilGeometry=new THREE.TubeGeometry(path,220,.34,18,false);
  const coilPosition=coilGeometry.attributes.position;
  for(let i=0;i<coilPosition.count;i++){
    const t=Math.floor(i/19)/220,center=path.getPointAt(t);
    const point=new THREE.Vector3().fromBufferAttribute(coilPosition,i);
    const ripple=1+Math.sin(t*220*Math.PI)*.035+Math.sin(i*2.39)*.022;
    point.sub(center).multiplyScalar(ripple*(1-t*.3)).add(center);coilPosition.setXYZ(i,point.x,point.y,point.z);
  }
  coilGeometry.computeVertexNormals();coils.add(new THREE.Mesh(coilGeometry,skin));
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
    canvas.setAttribute('aria-label','Moss-textured dragon coiling behind the page.');
  }
  loadDragon().catch(error=>{console.error(error);canvas.hidden=true;host.classList.add('webgl-unavailable');});
  group.rotation.set(.04,.72,0);
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
    const targetY=.72+(calm?0:Math.sin(phase)*.12+pointerX*.12+Math.sin(time*.00016)*.08);
    const targetX=.06+(calm?0:pointerY*.08+Math.sin(phase)*.05);
    group.rotation.y+=(targetY-group.rotation.y)*.04*dt;
    group.rotation.x+=(targetX-group.rotation.x)*.04*dt;
    group.rotation.z=calm?-.1:Math.sin(phase*.6)*.09-.1;
    const targetPosition=innerWidth<700?.8:1.65;
    group.position.x+=(targetPosition+(calm?0:Math.sin(phase)*.65+pointerX*.15)-group.position.x)*.035*dt;
    group.position.y=calm?-.1:Math.sin(time*.0004)*.1+Math.sin(phase)*.3-.1;
    coils.rotation.z=calm?0:Math.sin(phase*.5)*.09+Math.sin(time*.00012)*.025;
    coils.position.y=calm?0:Math.sin(phase)*.25;
    coils.position.x=calm?0:pointerX*.12;
    renderer.render(scene,camera);
  });
}

