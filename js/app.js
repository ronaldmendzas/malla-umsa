'use strict';
const approved=new Set();
let hover=null,selected=null,STATES=null,lastPct=-1;
const isTouch=window.matchMedia('(hover: none), (pointer: coarse)').matches;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NODE_EL={};
const content=document.getElementById('graphContent');
const PANEL=document.getElementById('panel');
const PANEL_BODY=document.getElementById('pBody');
const EDGES_SVG=document.getElementById('edges');
const EDGE_LAYER=document.getElementById('edgeLayer');

function vencidoMet(n){return CORE[n].every(function(s){return approved.has(s);});}
function preMet(node){return node.pre.every(function(p){return p[0]==='V'?vencidoMet(+p.slice(1)):approved.has(p);});}
function slotFilled(k){
  if(k===1)return TEC.some(function(t){return t.slot===1&&approved.has(t.sigla);});
  if(k===2)return TEC.some(function(t){return t.slot===2&&approved.has(t.sigla);});
  return ELE.filter(function(e){return approved.has(e.sigla);}).length>=(k-2);
}
function computeStates(){
  const st={};
  for(const n of ALL){
    if(n.type==='slot')st[n.sigla]=slotFilled(n.slot)?'done':(preMet(n)?'open':'locked');
    else st[n.sigla]=approved.has(n.sigla)?'done':(preMet(n)?'open':'locked');
  }
  return st;
}
function semLabel(n){
  if(n.type==='malla'||n.type==='slot')return SEM_NAMES[n.sem-1]+' semestre';
  if(n.type==='tec')return 'Electiva '+(n.slot===1?'I (5º sem)':'II (6º sem)')+' · '+n.group;
  return 'Electiva de mención (7º–8º sem)';
}
function dependentsOf(node){
  const out=[];
  for(const y of MALLA){
    if(y.pre.indexOf(node.sigla)>=0)out.push({node:y,via:null});
    for(const p of y.pre){
      if(p[0]==='V'&&CORE[+p.slice(1)].indexOf(node.sigla)>=0)out.push({node:y,via:+p.slice(1)});
    }
  }
  return out;
}
function animateNumber(el,to,suffix){
  suffix=suffix||'';
  if(reduceMotion){el.textContent=to+suffix;return;}
  const from=parseInt(el.textContent,10)||0;
  if(from===to){el.textContent=to+suffix;return;}
  const t0=performance.now(),dur=450;
  requestAnimationFrame(function frame(t){
    const p=Math.min(1,(t-t0)/dur);
    const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(from+(to-from)*e)+suffix;
    if(p<1)requestAnimationFrame(frame);
  });
}
function ripple(el,e){
  if(reduceMotion)return;
  const b=el.getBoundingClientRect();
  const hasXY=e&&typeof e.clientX==='number'&&e.clientX!==0;
  const cx=hasXY?e.clientX:b.left+b.width/2;
  const cy=hasXY?e.clientY:b.top+b.height/2;
  const s=Math.max(b.width,b.height)*1.15;
  const r=document.createElement('span');
  r.className='ripple';
  r.style.width=r.style.height=s+'px';
  r.style.left=(cx-b.left-s/2)+'px';
  r.style.top=(cy-b.top-s/2)+'px';
  el.appendChild(r);
  setTimeout(function(){r.remove();},560);
}
function stamp(sigla){
  const el=NODE_EL[sigla];
  if(!el||reduceMotion)return;
  el.classList.remove('stamp');
  void el.offsetWidth;
  el.classList.add('stamp');
  setTimeout(function(){el.classList.remove('stamp');},330);
}
function makeRise(el,delay){
  el.classList.add('rise');
  el.style.setProperty('--d',delay.toFixed(3)+'s');
  el.addEventListener('animationend',function(){
    el.classList.remove('rise');
    el.style.removeProperty('--d');
  },{once:true});
}
function nodeEl(n){
  const d=document.createElement('div');
  d.className='node'+(n.type==='slot'?' readonly':'');
  d.dataset.sigla=n.sigla;
  if(n.type!=='slot')d.tabIndex=0;
  const right=n.type==='slot'
    ?'<span class="autotag-s">AUTO</span>'
    :'<span class="ic"><svg class="i-check"><use href="#i-check"/></svg><svg class="i-circ"><use href="#i-circ"/></svg><svg class="i-lock"><use href="#i-lock"/></svg></span>';
  d.innerHTML='<div class="top"><span class="sig">'+(n.type==='slot'?'ELECTIVA':n.sigla)+'</span>'+right+'</div><div class="nm">'+n.name+'</div>';
  NODE_EL[n.sigla]=d;
  return d;
}
(function build(){
  const cols=document.getElementById('columns');
  for(let s=1;s<=9;s++){
    const col=document.createElement('div');
    col.className='column';
    const head=document.createElement('div');
    head.className='col-head';head.dataset.col=s;
    head.innerHTML='<span>'+SEM_NAMES[s-1]+' sem.</span><span class="prog">0/0</span>';
    makeRise(head,(s-1)*0.07);
    col.appendChild(head);
    let idx=0;
    const nodes=MALLA.filter(function(n){return n.sem===s;}).concat(SLOTS.filter(function(n){return n.sem===s;}));
    nodes.forEach(function(n){
      const el=nodeEl(n);
      makeRise(el,(s-1)*0.07+idx*0.03+0.05);
      col.appendChild(el);
      idx++;
    });
    cols.appendChild(col);
  }
  const tg=document.getElementById('tecGroups');
  const groups=[];
  for(const t of TEC){
    let g=groups.find(function(x){return x.name===t.group;});
    if(!g){g={name:t.group,nodes:[]};groups.push(g);}
    g.nodes.push(t);
  }
  let ti=0;
  for(const g of groups){
    const d=document.createElement('div');
    d.className='tec-g';
    d.innerHTML='<h3>'+g.name+'</h3>';
    const wrap=document.createElement('div');
    g.nodes.forEach(function(n){
      const el=nodeEl(n);
      makeRise(el,0.55+ti*0.05);
      wrap.appendChild(el);
      ti++;
    });
    d.appendChild(wrap);
    tg.appendChild(d);
  }
  const eg=document.getElementById('eleGrid');
  ELE.forEach(function(n,i){
    const el=nodeEl(n);
    makeRise(el,0.65+i*0.022);
    eg.appendChild(el);
  });
  const blocks=document.querySelectorAll('.block');
  makeRise(blocks[0],0.5);
  if(blocks[1])makeRise(blocks[1],0.62);
})();
function chipShort(sig,ok){
  const n=BY[sig];
  return '<span class="chip '+(ok?'ok':'no')+'" title="'+n.name+'">'+sig+'<svg><use href="#'+(ok?'i-check':'i-x')+'"/></svg></span>';
}
function chipFull(sig,ok){
  const n=BY[sig];
  return '<span class="chip '+(ok?'ok':'no')+'">'+n.sigla+' · '+n.name+'<svg><use href="#'+(ok?'i-check':'i-x')+'"/></svg></span>';
}
function renderPanel(n){
  if(!n){
    PANEL_BODY.innerHTML='<h3>Ficha de materia</h3><p class="ph">'+(isTouch?'Toca una materia del grafo para ver aquí su sigla, nombre, pre-requisitos y qué desbloquea.':'Pasa el cursor o haz click en una materia del grafo para ver aquí su sigla, nombre, pre-requisitos y qué desbloquea.')+'</p>';
    return;
  }
  const s=STATES[n.sigla];
  const stTxt=s==='done'?'Aprobada':s==='open'?'Habilitada':'Bloqueada';
  const stIc=s==='done'?'i-check':s==='open'?'i-circ':'i-lock';
  let h='<span class="p-sig">'+(n.type==='slot'?'Electiva de malla':n.sigla)+'</span><h3>'+n.name+'</h3>';
  h+='<div class="p-meta"><span class="st st-'+s+'"><svg><use href="#'+stIc+'"/></svg>'+stTxt+'</span>'+(n.type==='slot'?'<span class="autotag">AUTOMÁTICA</span>':'')+'</div>';
  h+='<p class="p-row"><b>Semestre:</b> '+semLabel(n)+'</p>';
  if(n.pre.length===0){
    h+='<p class="p-row"><b>Pre-requisitos:</b> ninguno — disponible desde el inicio.</p>';
  }else{
    h+='<div class="k">Requiere</div><div class="chips">';
    for(const p of n.pre){
      if(p[0]==='V'){
        const k=+p.slice(1);const c=CORE[k];
        const okc=c.filter(function(x){return approved.has(x);}).length;
        h+='</div><div class="req-t '+(okc===c.length?'ok':'no')+'">'+VEN_LABEL[k]+' — '+okc+'/'+c.length+'</div><div class="chips">'+c.map(function(x){return chipShort(x,approved.has(x));}).join('');
      }else h+=chipFull(p,approved.has(p));
    }
    h+='</div>';
  }
  if(n.type==='slot'&&n.slot<=2){
    const cands=TEC.filter(function(t){return t.slot===n.slot;});
    h+='<div class="k">Se completa al aprobar cualquiera de</div><div class="chips">'+cands.map(function(t){return chipFull(t.sigla,approved.has(t.sigla));}).join('')+'</div>';
  }
  if(n.type==='slot'&&n.slot>2){
    const c=ELE.filter(function(e){return approved.has(e.sigla);}).length;
    h+='<div class="k">Se completa con electivas de mención</div><p class="note">Se necesitan '+(n.slot-2)+' electiva(s) del bloque inferior (acumulativas: 1 completa la III, 2 la IV, 3 la V y 4 la VI). Aprobadas: '+c+'.</p>';
  }
  if(n.type==='tec')h+='<p class="note">Al aprobarla se completa automáticamente la <b>Electiva '+(n.slot===1?'I':'II')+'</b> de la malla (Técnico Superior en '+n.group+').</p>';
  if(n.type==='ele')h+='<p class="note">Cuenta para completar automáticamente las Electivas III–VI de la malla (acumulativas).</p>';
  const deps=dependentsOf(n);
  if(n.type==='tec')deps.push({node:SLOTS[n.slot-1],via:'auto'});
  if(deps.length){
    h+='<div class="k">Desbloquea</div><div class="chips">'+deps.map(function(d){
      const extra=d.via==='auto'?'':' <span style="font-weight:400;opacity:.7">('+VEN_LABEL[d.via]+')</span>';
      return '<span class="chip dep" title="'+d.node.name+'"><svg><use href="#i-arr"/></svg>'+d.node.name+extra+'</span>';
    }).join('')+'</div>';
  }else if(n.type==='malla'){
    h+='<div class="k">Desbloquea</div><p class="note">No desbloquea otras materias de la malla directamente.</p>';
  }
  if(n.type!=='slot'){
    const isDone=approved.has(n.sigla);
    h+='<button type="button" class="'+(isDone?'key key-light approve':'key key-dark approve')+'" data-act="toggle"><svg><use href="#'+(isDone?'i-x':'i-check')+'"/></svg>'+(isDone?'Quitar aprobación':'Marcar como aprobada')+'</button>';
  }
  PANEL_BODY.innerHTML=h;
}
function nodeRect(el){
  const r=el.getBoundingClientRect();
  const b=content.getBoundingClientRect();
  return {x:r.left-b.left,y:r.top-b.top,w:r.width,h:r.height};
}
function edgePath(a,b){
  const ra=nodeRect(a),rb=nodeRect(b);
  const ac={x:ra.x+ra.w/2,y:ra.y+ra.h/2},bc={x:rb.x+rb.w/2,y:rb.y+rb.h/2};
  const dx=bc.x-ac.x,dy=bc.y-ac.y;
  const horiz=Math.abs(dx)>Math.abs(dy)*1.2;
  let x1,y1,x2,y2;
  if(horiz){
    if(dx>0){x1=ra.x+ra.w;x2=rb.x;}else{x1=ra.x;x2=rb.x+rb.w;}
    y1=ac.y;y2=bc.y;
  }else{
    if(dy>0){y1=ra.y+ra.h;y2=rb.y;}else{y1=ra.y;y2=rb.y+rb.h;}
    x1=ac.x;x2=bc.x;
  }
  const off=horiz?Math.min(60,Math.abs(x2-x1)*.5):Math.min(46,Math.abs(y2-y1)*.5);
  let c1,c2;
  if(horiz){const s=Math.sign(x2-x1)||1;c1=[x1+s*off,y1];c2=[x2-s*off,y2];}
  else{const s=Math.sign(y2-y1)||1;c1=[x1,y1+s*off];c2=[x2,y2-s*off];}
  return 'M '+x1+' '+y1+' C '+c1[0]+' '+c1[1]+', '+c2[0]+' '+c2[1]+', '+x2+' '+y2;
}
function edgesFor(node){
  const out=[];
  if(node.type==='malla'||node.type==='slot'){
    for(const p of node.pre){
      if(p[0]==='V'){
        const n=+p.slice(1);
        for(const s of CORE[n])out.push({from:s,to:node.sigla,type:'ven'});
      }else out.push({from:p,to:node.sigla,type:'pre'});
    }
  }
  if(node.type==='malla'){
    for(const y of MALLA){
      if(y.pre.indexOf(node.sigla)>=0)out.push({from:node.sigla,to:y.sigla,type:'pre'});
      for(const p of y.pre){
        if(p[0]==='V'&&CORE[+p.slice(1)].indexOf(node.sigla)>=0)out.push({from:node.sigla,to:y.sigla,type:'ven'});
      }
    }
  }
  if(node.type==='tec')out.push({from:node.sigla,to:'E'+node.slot,type:'auto'});
  if(node.type==='slot'&&node.slot<=2){
    for(const t of TEC)if(t.slot===node.slot)out.push({from:t.sigla,to:node.sigla,type:'auto'});
  }
  return out;
}
function drawEdges(act){
  EDGES_SVG.setAttribute('width',Math.max(1,Math.ceil(content.scrollWidth)));
  EDGES_SVG.setAttribute('height',Math.max(1,Math.ceil(content.scrollHeight)));
  EDGE_LAYER.innerHTML='';
  if(!act)return;
  for(const e of edgesFor(act)){
    const a=NODE_EL[e.from],b=NODE_EL[e.to];
    if(!a||!b)continue;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',edgePath(a,b));
    p.setAttribute('class','edge '+e.type);
    p.setAttribute('marker-end','url(#m-'+e.type+')');
    EDGE_LAYER.appendChild(p);
  }
}
function updateStates(){
  STATES=computeStates();
  for(const n of ALL){
    const el=NODE_EL[n.sigla];
    el.classList.remove('done','open','locked');
    el.classList.add(STATES[n.sigla]);
  }
  let cD=0,cO=0,cL=0;
  for(const n of ALL){
    const s=STATES[n.sigla];
    if(s==='done')cD++;else if(s==='open')cO++;else cL++;
  }
  animateNumber(document.getElementById('cDone'),cD);
  animateNumber(document.getElementById('cOpen'),cO);
  animateNumber(document.getElementById('cLock'),cL);
  const mallaDone=MALLA.filter(function(n){return approved.has(n.sigla);}).length+SLOTS.filter(function(s){return slotFilled(s.slot);}).length;
  const pct=Math.round(mallaDone/MALLA_TOTAL*100);
  animateNumber(document.getElementById('pPct'),pct,'%');
  if(pct!==lastPct){
    const pp=document.getElementById('pPct');
    pp.classList.remove('pop');
    void pp.offsetWidth;
    pp.classList.add('pop');
    lastPct=pct;
  }
  document.getElementById('pTxt').textContent=mallaDone+' de '+MALLA_TOTAL+' materias de la malla';
  document.getElementById('pFill').style.width=pct+'%';
  document.querySelectorAll('.col-head').forEach(function(hd){
    const s=+hd.dataset.col;
    const nodes=MALLA.filter(function(n){return n.sem===s;}).concat(SLOTS.filter(function(n){return n.sem===s;}));
    const d=nodes.filter(function(n){return STATES[n.sigla]==='done';}).length;
    hd.querySelector('.prog').textContent=d+'/'+nodes.length;
  });
}
function updateFocus(){
  const act=hover||selected;
  content.classList.toggle('focus-mode',!!act);
  const rel={};
  if(act){
    rel[act.sigla]=1;
    for(const e of edgesFor(act)){rel[e.from]=1;rel[e.to]=1;}
  }
  for(const n of ALL){
    const el=NODE_EL[n.sigla];
    el.classList.toggle('related',!!rel[n.sigla]);
    el.classList.toggle('focused',act===n);
  }
  document.body.classList.toggle('has-focus',!!selected);
  drawEdges(act);
  renderPanel(act);
}
function toggle(n){
  if(n.type==='slot')return;
  if(approved.has(n.sigla))approved.delete(n.sigla);
  else approved.add(n.sigla);
  stamp(n.sigla);
}
content.addEventListener('click',function(e){
  const el=e.target.closest('.node');
  if(el){
    const n=BY[el.dataset.sigla];
    selected=n;
    ripple(el,e);
    if(!isTouch)toggle(n);
    if(!isTouch)updateStates();
    updateFocus();
  }else{
    selected=null;
    updateFocus();
  }
});
if(!isTouch){
  content.addEventListener('mouseover',function(e){
    const el=e.target.closest('.node');
    const n=el?BY[el.dataset.sigla]:null;
    if(n!==hover){hover=n;updateFocus();}
  });
  content.addEventListener('mouseleave',function(){
    if(hover){hover=null;updateFocus();}
  });
}
content.addEventListener('keydown',function(e){
  if(e.key==='Enter'||e.key===' '){
    const el=e.target.closest('.node');
    if(el){
      e.preventDefault();
      const n=BY[el.dataset.sigla];
      selected=n;
      toggle(n);
      updateStates();
      updateFocus();
    }
  }
});
PANEL.addEventListener('click',function(e){
  if(e.target.closest('#closePanel'))return;
  const b=e.target.closest('[data-act="toggle"]');
  if(b&&selected){
    ripple(b,e);
    toggle(selected);
    updateStates();
    updateFocus();
  }
});
document.getElementById('closePanel').addEventListener('click',function(){
  selected=null;hover=null;
  updateFocus();
});
document.getElementById('resetBtn').addEventListener('click',function(e){
  ripple(this,e);
  approved.clear();
  selected=null;hover=null;
  updateStates();
  updateFocus();
});
if(!isTouch&&!reduceMotion){
  document.querySelectorAll('.stat, .progress').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform='perspective(700px) rotateX('+(-y*5).toFixed(2)+'deg) rotateY('+(x*7).toFixed(2)+'deg) translateY(-2px)';
    });
    card.addEventListener('mouseleave',function(){card.style.transform='';});
  });
}
let rafPending=false;
function scheduleRedraw(){
  if(rafPending)return;
  rafPending=true;
  requestAnimationFrame(function(){rafPending=false;drawEdges(hover||selected);});
}
window.addEventListener('resize',scheduleRedraw);
window.addEventListener('load',scheduleRedraw);
if(window.ResizeObserver)new ResizeObserver(scheduleRedraw).observe(content);
updateStates();
updateFocus();
