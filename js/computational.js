import * as THREE from 'three';
const host=document.querySelector('#tree-scene'),hero=document.querySelector('#tree-hero');
const status=document.querySelector('#scene-status'),motion=document.querySelector('#tree-motion');
const stories={
 roots:{number:'01 / THE ROOTS',title:'A place to begin.',text:'Statistics gave me a way to ask careful questions. Computer science gave me a way to build with them. Both still shape how I work.',label:'My background ↗',href:'#about'},
 branches:{number:'02 / THE QUESTIONS',title:'Following the next question.',text:'There’s still a lot I’d like to understand.',label:'My research ↗',href:'#research'},
 seat:{number:'03 / UNDER THE TREE',title:'A little chat room.',text:'My friends call me 大树, a tree that grows and listens. I’m always happy to chat and exchange ideas!',label:'Say hello ↗',href:'mailto:clairez3@andrew.cmu.edu'}
};
const panel=document.querySelector('#tree-story');
let active=null;
function closeStory(){panel.hidden=true;document.querySelectorAll('.tree-spot').forEach(b=>b.setAttribute('aria-expanded','false'));if(active)active.focus();active=null;}
document.querySelectorAll('.tree-spot').forEach(b=>b.addEventListener('click',()=>{if(active===b){closeStory();return;}active=b;const s=stories[b.dataset.story];document.querySelectorAll('.tree-spot').forEach(n=>n.setAttribute('aria-expanded',String(n===b)));document.querySelector('#story-index').textContent=s.number;document.querySelector('#story-title').textContent=s.title;document.querySelector('#story-text').textContent=s.text;const l=document.querySelector('#story-link');l.textContent=s.label;l.href=s.href;panel.hidden=false;}));
document.querySelector('#close-story').addEventListener('click',closeStory);
hero.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)closeStory();});

// Authored generative geometry: bundled paths with a common trunk and branching endpoints.
// The scene does not depend on optional contact or decorative UI elements.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,visible=true,time=0,last=0,raf=0,growing=!reduced.matches,structure=false;
let growth=reduced.matches?1:0,growthElapsed=0,pulse=-10,w=1,h=1,compact=false,drag=null,exploring=false;
const view={yaw:0,pitch:0,zoom:1};

try{
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setClearColor('#f5f7fa',0);host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,150),world=new THREE.Group();scene.add(world);
 const V=(x,y,z)=>new THREE.Vector3(x,y,z);let seed=49173;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const U={uTime:{value:0},uGrowth:{value:1},uPulse:{value:-10},uStructure:{value:0},uPointer:{value:V(100,100,100)}};
 const vertex=`attribute float aT;attribute float aSeed;uniform float uTime;uniform float uGrowth;uniform vec3 uPointer;varying float vT;varying float vSeed;varying float vNear;void main(){vT=aT;vSeed=aSeed;vec3 p=position;float influence=exp(-length(p-uPointer)*.85)*smoothstep(.15,.75,aT);p.x+=sin(uTime*.7+aT*8.+aSeed*5.)*.045*aT; p.z+=cos(uTime*.6+aT*7.+aSeed*4.)*.06*aT;vec3 away=p-uPointer;p+=normalize(away+vec3(.001))*influence*.65;vNear=influence;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
 const frag=`uniform float uTime;uniform float uGrowth;uniform float uPulse;uniform float uStructure;varying float vT;varying float vSeed;varying float vNear;void main(){if(vT>uGrowth)discard;vec3 blue=vec3(.11,.28,.61);vec3 mint=vec3(.12,.55,.60);vec3 violet=vec3(.46,.38,.74);vec3 c=mix(blue,mix(mint,violet,smoothstep(.25,.85,vSeed)),smoothstep(.4,1.,vT));float signal=pow(max(0.,1.-abs(vT-uPulse)*18.),2.);float moving=pow(.5+.5*sin(vT*35.-uTime*2.+vSeed*14.),18.);c=mix(c,vec3(.08,.30,.97),signal*.85+vNear*.4);float a=(.34+moving*.15+signal*.6+vNear*.3)*mix(1.,.6,uStructure);gl_FragColor=vec4(c,a);}`;
 const pos=[],ts=[],seeds=[],pointPos=[],pointT=[],pointSeed=[],tips=[];let pathCount=0;
 for(let arm=0;arm<18;arm++){
  const angle=arm*2.399963,rad=3.15+rand()*2.3,top=7.9+rand()*2.6;const ax=Math.cos(angle),az=Math.sin(angle);
  for(let branch=0;branch<6;branch++){
   const ang=angle+(branch-2.5)*.14,reach=rad*(.70+branch*.085),tip=V(Math.cos(ang)*reach,top+(rand()-.5)*1.1,Math.sin(ang)*reach*.83);tips.push(tip);
   for(let fiber=0;fiber<4;fiber++){
    const twist=fiber*1.57+branch*.22+angle,spread=.028+fiber*.022,dx=Math.cos(twist)*spread,dz=Math.sin(twist)*spread;
    const roots=angle+branch*.08;const curve=new THREE.CatmullRomCurve3([
     V(Math.cos(roots)*(1.8+branch*.15),-.04,Math.sin(roots)*(1.8+branch*.15)),
     V(Math.cos(angle)*.35+dx,.9,Math.sin(angle)*.35+dz),
     V(Math.sin(angle+.4)*.24+dx,2.7,Math.cos(angle+.4)*.24+dz),
     V(ax*.55+dx,4.25+arm%3*.12,az*.55+dz),
     V(ax*rad*.40+dx,5.8+(top-8)*.28,az*rad*.40+dz),
     V(Math.cos(ang)*reach*.79+dx,top-.9,Math.sin(ang)*reach*.70+dz),
     tip.clone().add(V(dx*1.7,Math.sin(twist)*.09,dz*1.7))
    ]);
    const id=rand();pathCount++;
    for(let j=0;j<90;j++){let t=j/90,n=(j+1)/90;const a=curve.getPoint(t),b=curve.getPoint(n);pos.push(a.x,a.y,a.z,b.x,b.y,b.z);ts.push(t,n);seeds.push(id,id);if(j%2===0){pointPos.push(a.x,a.y,a.z);pointT.push(t);pointSeed.push(id);}}
   }
  }
 }
 function geo(p,t,s){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aT',new THREE.Float32BufferAttribute(t,1));g.setAttribute('aSeed',new THREE.Float32BufferAttribute(s,1));return g;}
 const lines=new THREE.LineSegments(geo(pos,ts,seeds),new THREE.ShaderMaterial({uniforms:U,vertexShader:vertex,fragmentShader:frag,transparent:true,depthWrite:false}));world.add(lines);
 const pointVert=vertex.replace('gl_Position=','gl_PointSize=(1.2+1.8*pow(.5+.5*sin(aT*35.-uTime*2.+aSeed*14.),18.))*min(1.8,900./length((modelViewMatrix*vec4(p,1.)).xyz)/35.);gl_Position=');
 const points=new THREE.Points(geo(pointPos,pointT,pointSeed),new THREE.ShaderMaterial({uniforms:U,vertexShader:pointVert,fragmentShader:`uniform float uTime;uniform float uGrowth;uniform float uPulse;uniform float uStructure;varying float vT;varying float vSeed;varying float vNear;void main(){if(vT>uGrowth||uStructure>.5)discard;float d=length(gl_PointCoord-.5);if(d>.5)discard;float moving=pow(.5+.5*sin(vT*35.-uTime*2.+vSeed*14.),25.);float s=pow(max(0.,1.-abs(vT-uPulse)*14.),2.);float a=(moving*.80+s+vNear)*smoothstep(.5,.12,d);gl_FragColor=vec4(mix(vec3(.15,.37,.85),vec3(.12,.68,.69),vSeed),a);}`,transparent:true,depthWrite:false}));world.add(points);
 // Local terminal graphs make the branching hierarchy legible at different scales.
 const nodes=[],edges=[],nodeT=[],nodeSeed=[];
 tips.forEach((tip,index)=>{
  const nearby=[tip.clone()];
  for(let j=0;j<14;j++){
   const az=j*2.399963+index*.4,vertical=1-2*(j+.5)/14,rr=Math.sqrt(1-vertical*vertical),r=.18+rand()*.24;
   nearby.push(tip.clone().add(V(Math.cos(az)*rr*r,vertical*r*.95,Math.sin(az)*rr*r)));
  }
  nearby.forEach((p,j)=>{nodes.push(p.x,p.y,p.z);nodeT.push(.9+j/150);nodeSeed.push((index%18)/18);if(j){let distances=nearby.slice(0,j).map((q,k)=>({q,d:q.distanceTo(p)})).sort((a,b)=>a.d-b.d);for(const {q} of distances.slice(0,2))edges.push(p.x,p.y,p.z,q.x,q.y,q.z);}});
 });
 const terminalGroup=new THREE.Group();world.add(terminalGroup);
 const nodeMaterial=new THREE.ShaderMaterial({uniforms:U,vertexShader:vertex.replace('gl_Position=','gl_PointSize=2.5;gl_Position='),fragmentShader:`uniform float uGrowth;varying float vT;varying float vSeed;varying float vNear;void main(){if(vT>uGrowth)discard;float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(mix(vec3(.1,.43,.60),vec3(.43,.36,.73),vSeed),(.65+vNear*.3)*smoothstep(.5,.2,d));}`,transparent:true,depthWrite:false});
 const tipPoints=new THREE.Points(geo(nodes,nodeT,nodeSeed),nodeMaterial);world.add(tipPoints);
 const terminalEdges=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(edges,3)),new THREE.LineBasicMaterial({color:'#7394bf',transparent:true,opacity:.28}));terminalGroup.add(terminalEdges);
 // Faint contour field and circular calibration marks establish a three-dimensional base.
 const field=new THREE.Group();world.add(field);
 for(let i=0;i<24;i++){
  const r=.9+i*.205,p=[];for(let j=0;j<=240;j++){const a=j/240*Math.PI*2,warp=.13*Math.sin(a*4+i*.22)+.05*Math.sin(a*7);p.push(V(Math.cos(a)*(r+warp),-.16+Math.sin(a*3+i*.2)*.018,Math.sin(a)*(r+warp)));}
  field.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineBasicMaterial({color:'#7194bb',transparent:true,opacity:.045+i/24*.06})));}
 const tickPos=[];for(let i=0;i<120;i++){const a=i/120*Math.PI*2,r=6.15,l=i%10===0?.19:.065;tickPos.push(Math.cos(a)*r,-.14,Math.sin(a)*r,Math.cos(a)*(r+l),-.14,Math.sin(a)*(r+l));}
 field.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(tickPos,3)),new THREE.LineBasicMaterial({color:'#9db2cc',transparent:true,opacity:.45})));
 const disk=new THREE.Mesh(new THREE.PlaneGeometry(17,17),new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float d=length(vUv-.5);float a=exp(-d*d*35.)*.11;gl_FragColor=vec4(.28,.43,.68,a);}',transparent:true,depthWrite:false}));disk.rotation.x=-Math.PI/2;disk.position.y=-.20;world.add(disk);
 // A few isolated terminal links reveal the graph without turning it into a wireframe cage.
 const links=[];tips.forEach((p,i)=>{if(i%6!==5){const q=tips[i+1];links.push(p.x,p.y,p.z,q.x,q.y,q.z);}});
 const linksMesh=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(links,3)),new THREE.LineBasicMaterial({color:'#6d8ad0',transparent:true,opacity:.14}));world.add(linksMesh);
 function cameraUpdate(){const target=V(0,4.7,0),offset=V(10,5.5,23);const sph=new THREE.Spherical().setFromVector3(offset);sph.theta+=view.yaw;sph.phi=THREE.MathUtils.clamp(sph.phi+view.pitch,.55,1.6);sph.radius=19.8*view.zoom*Math.max(1,1.05/camera.aspect);camera.position.copy(target).add(offset.setFromSpherical(sph));camera.lookAt(target);camera.updateMatrixWorld();}

 function draw(){U.uTime.value=time;U.uGrowth.value=growth;U.uPulse.value=pulse;terminalGroup.visible=growth>.98;linksMesh.visible=growth>.98;cameraUpdate();renderer.render(scene,camera);host.dataset.growth=growth.toFixed(3);host.dataset.yaw=view.yaw.toFixed(3);host.dataset.zoom=view.zoom.toFixed(2);host.dataset.time=time.toFixed(2);host.dataset.mode=structure?'structure':'signals';host.dataset.pulse=pulse.toFixed(2);host.dataset.influence=String(U.uPointer.value.x<99);}
 function growthState(){host.dataset.phase=growing?'growing':'interactive';status.textContent=growing?'The tree is growing.':'The tree is ready. Move your pointer to influence the branches.';}
 function loop(stamp){raf=0;if(!visible||document.hidden||(paused&&pulse<0))return;const dt=Math.min((stamp-last)/1000,.05);last=stamp;if(!paused)time+=dt;if(pulse>=0){pulse+=dt*.38;if(pulse>1.2)pulse=-10;}if(growing&&!paused){growthElapsed=Math.min(1,growthElapsed+dt/4.5);growth=growthElapsed*growthElapsed*(3-2*growthElapsed);if(growthElapsed===1){growing=false;growth=1;growthState();}}draw();raf=requestAnimationFrame(loop);}
 function wake(){if(!raf&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(loop);}}
 function setPaused(p){paused=p;motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Play tree animation':'Pause tree animation');motion.textContent=paused?'▷':'Ⅱ';motion.title=paused?'Play tree animation':'Pause tree animation';if(paused){pulse=-10;cancelAnimationFrame(raf);raf=0;draw();}else wake();}
 motion.addEventListener('click',()=>setPaused(!paused));reduced.addEventListener('change',()=>{if(reduced.matches){growth=1;growing=false;growthState();}setPaused(reduced.matches);});
 document.querySelector('#say-hello')?.addEventListener('click',()=>{pulse=0;draw();wake();});
 function explore(){exploring=true;hero.classList.add('is-exploring');}
 function reset(){exploring=false;view.yaw=view.pitch=0;view.zoom=1;hero.classList.remove('is-exploring');draw();}
 document.querySelector('.wordmark').addEventListener('click',reset);
 const canvas=renderer.domElement,ray=new THREE.Raycaster(),plane=new THREE.Plane(),hit=V(0,0,0),mouse=new THREE.Vector2();host.removeAttribute('aria-hidden');canvas.tabIndex=document.body.classList.contains('is-reading')?-1:0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive branching system. Drag to orbit, hover to influence, click to send a signal. Arrow keys rotate. Home resets.');
 canvas.addEventListener('pointerdown',e=>{if(growing||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:view.yaw,pitch:view.pitch,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(growing)return;const rect=canvas.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(mouse,camera);plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(V(0,0,0)),V(0,5,0));if(ray.ray.intersectPlane(plane,hit))U.uPointer.value.copy(hit);if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5){drag.moved=true;explore();canvas.classList.add('is-dragging');view.yaw=drag.yaw-dx*.006;view.pitch=THREE.MathUtils.clamp(drag.pitch-dy*.004,-.45,.45);}}draw();});
 canvas.addEventListener('pointerleave',()=>{U.uPointer.value.set(100,100,100);draw();});
 function end(e){if(!drag||drag.id!==e.pointerId)return;if(!drag.moved&&e.type==='pointerup'){pulse=0;wake();}drag=null;canvas.classList.remove('is-dragging');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',()=>{drag=null;canvas.classList.remove('is-dragging');});
 canvas.addEventListener('keydown',e=>{if(growing)return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home','Enter'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){reset();return;}if(e.key==='Enter'){pulse=0;wake();return;}explore();if(e.key==='ArrowLeft')view.yaw-=.12;if(e.key==='ArrowRight')view.yaw+=.12;if(e.key==='ArrowUp')view.pitch=Math.max(-.45,view.pitch-.08);if(e.key==='ArrowDown')view.pitch=Math.min(.45,view.pitch+.08);if(['+','='].includes(e.key))view.zoom=Math.max(.65,view.zoom-.1);if(e.key==='-')view.zoom=Math.min(1.4,view.zoom+.1);draw();});
 function resize(){w=host.clientWidth;h=host.clientHeight;compact=w<801;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=38;camera.updateProjectionMatrix();draw();}
 new ResizeObserver(resize).observe(host);new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{threshold:.02}).observe(host);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
 resize();growthState();setPaused(paused);hero.classList.add('tree-ready');document.querySelector('#tree-loading').hidden=true;host.dataset.state='ready';growthState();canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setPaused(true);status.textContent='Reload to restore the interactive system.';});
}catch(error){
 console.error(error);
 host.dataset.state='error';host.dataset.error=error instanceof Error?error.message:String(error);
 const loading=document.querySelector('#tree-loading');loading.hidden=false;loading.textContent='The tree could not load. ';
 const retry=document.createElement('button');retry.type='button';retry.className='scene-retry';retry.textContent='Try again';retry.addEventListener('click',()=>location.reload());loading.appendChild(retry);
 status.textContent='The tree could not load. Try again to reload the scene. Portfolio links remain available.';
}

