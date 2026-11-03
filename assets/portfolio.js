/* Stackly — Artist Portfolio · interactions (vanilla JS, no dependencies) */
(function(){
'use strict';
/* remember previous page (used by the 404 'Go back' button) */
try{var _c=sessionStorage.getItem('stk_cur');if(_c&&_c!==location.href)sessionStorage.setItem('stk_prev',_c);sessionStorage.setItem('stk_cur',location.href);}catch(e){}
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
function lerp(a,b,t){return a+(b-a)*t}

/* ---------- preloader: curtains ---------- */
var pre=$('#pre');
function releasePre(){ if(!pre||pre.classList.contains('go'))return; pre.classList.add('go'); document.body.classList.add('ready'); setTimeout(function(){pre.classList.add('gone'); start();},1100); }
if(pre){
  var bar=$('.bar i',pre), pct=$('.pct',pre), n=0, done=false;
  var t=setInterval(function(){ n=Math.min(done?100:92,n+(done?9:Math.random()*7+2)); bar.style.width=n+'%'; pct.textContent=Math.floor(n)+'%'; if(n>=100){clearInterval(t); setTimeout(releasePre,200);} },70);
  var fin=function(){done=true}; if(document.readyState==='complete') fin(); else addEventListener('load',fin);
  setTimeout(fin,3500);
}else start();

var started=false;
function start(){ if(started)return; started=true;
  splitText(); reveals(); counters(); tilt(); magnetic(); marquee(); hscroll(); proc(); preview(); quotes(); heroFx(); canvasFlow();
}

/* ---------- scroll progress + nav hide ---------- */
var progEl=document.createElement('div'); progEl.id='prog'; document.body.appendChild(progEl);
var nav=$('.nav'), lastY=0;
function onScroll(){
  var h=document.documentElement, m=h.scrollHeight-h.clientHeight, y=h.scrollTop;
  progEl.style.width=(m>0?y/m*100:0)+'%';
  if(nav){ nav.classList.toggle('hide', y>lastY && y>400 && !menuOpen); lastY=y; }
}
addEventListener('scroll',onScroll,{passive:true});

/* ---------- mobile menu ---------- */
var menuOpen=false, burger=$('.burger'), menu=$('.menu');
if(burger&&menu){
  burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-controls','siteMenu'); menu.id='siteMenu'; menu.setAttribute('role','dialog'); menu.setAttribute('aria-label','Site menu');
  var setMenu=function(o,ret){ menuOpen=o; burger.classList.toggle('open',o); menu.classList.toggle('open',o); burger.setAttribute('aria-expanded',o?'true':'false'); burger.setAttribute('aria-label',o?'Close menu':'Open menu'); document.body.style.overflow=o?'hidden':''; if(nav&&o)nav.classList.remove('hide'); if(!o&&ret)burger.focus(); };
  setMenu(false);
  burger.addEventListener('click',function(){ setMenu(!menuOpen); });
  $$('a',menu).forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  addEventListener('keydown',function(e){ if(e.key==='Escape'&&menuOpen)setMenu(false,true); });
  matchMedia('(min-width:921px)').addEventListener('change',function(m){ if(m.matches&&menuOpen)setMenu(false); });
}

/* ---------- custom cursor ---------- */
if(fine&&!reduce){
  var cur=document.createElement('div'),dot=document.createElement('div');cur.className='cur';dot.className='cur-dot';document.body.append(cur,dot);document.body.classList.add('has-cur');
  var mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cur.classList.add('on');dot.classList.add('on');dot.style.transform='translate('+mx+'px,'+my+'px)';});
  document.addEventListener('mouseleave',function(){cur.classList.remove('on');dot.classList.remove('on');});
  (function loop(){cx=lerp(cx,mx,.16);cy=lerp(cy,my,.16);cur.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop);})();
  document.addEventListener('mouseover',function(e){
    var big=e.target.closest&&e.target.closest('[data-cur]');
    if(big){cur.classList.add('big');cur.setAttribute('data-label',big.getAttribute('data-cur'));}
    else{cur.classList.remove('big');}
  });
}

/* ---------- split headline into masked words ---------- */
function splitText(){
  $$('.split').forEach(function(el){
    var i=0;
    (function walk(node,parent){
      [].slice.call(node.childNodes).forEach(function(c){
        if(c.nodeType===3){
          var frag=document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function(p){
            if(!p)return; if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(' '));return;}
            var w=document.createElement('span');w.className='w';var inn=document.createElement('i');inn.textContent=p;inn.style.setProperty('--i',i++);w.appendChild(inn);frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if(c.nodeType===1 && !c.classList.contains('w')) walk(c,c);
      });
    })(el,el);
  });
}

/* ---------- reveal on scroll ---------- */
function reveals(){
  var els=$$('[data-r],.split,.tl>div');
  if(!('IntersectionObserver' in window)||reduce){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(el,i){
    if(el.hasAttribute('data-stag')){}
    io.observe(el);
  });
  $$('[data-stag]').forEach(function(p){$$(':scope>[data-r]',p).forEach(function(c,i){c.style.setProperty('--d',(i*.09)+'s');});});
  setTimeout(function(){els.forEach(function(el){if(el.getBoundingClientRect().top<innerHeight*1.1)el.classList.add('in');});},2800);
}

/* ---------- count-up ---------- */
function counters(){
  var els=$$('[data-to]'); if(!els.length)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return; io.unobserve(e.target);
    var el=e.target,to=parseFloat(el.dataset.to),suf=el.dataset.suf||'',dec=(el.dataset.to.split('.')[1]||'').length,t0=performance.now(),d=1800;
    (function f(t){var p=Math.min(1,(t-t0)/d),v=to*(1-Math.pow(1-p,4));el.innerHTML=v.toFixed(dec)+(suf?'<sup>'+suf+'</sup>':'');if(p<1)requestAnimationFrame(f);})(t0);
  });},{threshold:.5});
  els.forEach(function(e){io.observe(e)});
}

/* ---------- 3D tilt cards ---------- */
function tilt(){
  if(!fine||reduce)return;
  $$('[data-tilt]').forEach(function(el){
    el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transition='transform .1s';el.style.transform='perspective(900px) rotateY('+x*10+'deg) rotateX('+(-y*10)+'deg) translateZ(0)';});
    el.addEventListener('mouseleave',function(){el.style.transition='transform .6s cubic-bezier(.2,.8,.2,1)';el.style.transform='';});
  });
}
/* ---------- magnetic buttons ---------- */
function magnetic(){
  if(!fine||reduce)return;
  $$('.btn.solid,.nav .btn,[data-mag]').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.25+'px,'+(e.clientY-r.top-r.height/2)*.35+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });
}

/* ---------- marquee: speeds up with scroll velocity ---------- */
function marquee(){
  var rows=$$('.marq'); if(!rows.length||reduce)return;
  var data=rows.map(function(m,i){var t=$('.marq-t',m);t.innerHTML+=t.innerHTML;return {t:t,x:0,dir:m.dataset.dir==='r'?1:-1};});
  var last=scrollY,vel=0;
  (function loop(){var y=scrollY;vel=lerp(vel,Math.abs(y-last),.1);last=y;
    data.forEach(function(d){var half=d.t.scrollWidth/2;d.x+=d.dir*(1.1+vel*.35);if(d.x<=-half)d.x+=half;if(d.x>0)d.x-=half;d.t.style.transform='translate3d('+d.x+'px,0,0)';});
    requestAnimationFrame(loop);})();
}

/* ---------- sticky horizontal gallery ---------- */
function hscroll(){
  var sec=$('.hs'); if(!sec)return;
  var pin=$('.hs-pin',sec),track=$('.hs-track',sec),bar=$('.hs-bar i',sec),cnt=$('.hs-count b',sec),items=$$('.piece',track);
  function size(){ if(innerWidth<=820){sec.style.height='';track.style.transform='';return;}
    var dist=track.scrollWidth-innerWidth+80; sec.style.height=(dist+innerHeight)+'px'; sec._d=dist; }
  size(); addEventListener('resize',size);
  var cur=0,tgt=0;
  function upd(){ if(innerWidth<=820)return;
    var r=sec.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/(sec.offsetHeight-innerHeight||1))); tgt=p*(sec._d||0); }
  addEventListener('scroll',upd,{passive:true}); upd();
  (function loop(){ if(innerWidth>820){cur=lerp(cur,tgt,reduce?1:.1);track.style.transform='translate3d('+(-cur)+'px,0,0)';var p=sec._d?cur/sec._d:0;if(bar)bar.style.transform='scaleX('+p+')';if(cnt)cnt.textContent=String(Math.min(items.length,Math.round(p*(items.length-1))+1)).padStart(2,'0');}
    requestAnimationFrame(loop);})();
}

/* ---------- process line ---------- */
function proc(){ var p=$('.proc'); if(!p)return; new IntersectionObserver(function(e,o){if(e[0].isIntersecting){p.classList.add('go');o.disconnect();}},{threshold:.3}).observe(p); }

/* ---------- discipline list: floating preview ---------- */
function preview(){
  var list=$('.dl'),pv=$('.dl-prev'); if(!list||!pv||!fine)return;
  var x=0,y=0,tx=0,ty=0,on=false;
  list.addEventListener('mousemove',function(e){tx=e.clientX+190;ty=e.clientY;});
  $$('a',list).forEach(function(a){
    a.addEventListener('mouseenter',function(){pv.classList.add('on');var k=a.dataset.pv;$$('.pv',pv).forEach(function(p){p.classList.toggle('on',p.dataset.k===k);});});
    a.addEventListener('mouseleave',function(){pv.classList.remove('on');});
  });
  (function loop(){x=lerp(x,tx,.14);ty=ty||0;y=lerp(y,ty,.14);pv.style.left=x+'px';pv.style.top=y+'px';pv.style.transform='translate(-50%,-50%) rotate('+((tx-x)*.06)+'deg) scale('+(pv.classList.contains('on')?1:.8)+')';requestAnimationFrame(loop);})();
}

/* ---------- quotes slider ---------- */
function quotes(){
  var qs=$$('.q'); if(!qs.length)return; var i=0,tm;
  function go(n){qs[i].classList.remove('on');i=(n+qs.length)%qs.length;qs[i].classList.add('on');}
  qs[0].classList.add('on');
  var p=$('[data-q=prev]'),n=$('[data-q=next]');
  function auto(){clearInterval(tm);tm=setInterval(function(){go(i+1)},6500);}
  if(p)p.addEventListener('click',function(){go(i-1);auto();}); if(n)n.addEventListener('click',function(){go(i+1);auto();}); auto();
}

/* ---------- hero parallax on mouse ---------- */
function heroFx(){
  var h=$('.hero'); if(!h||!fine||reduce)return;
  var fs=$$('.hf',h),bl=$$('.blob',h);
  h.addEventListener('mousemove',function(e){var r=h.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    fs.forEach(function(f,i){var d=(i+1)*14;f.style.transform='translate('+(-x*d)+'px,'+(-y*d)+'px)';});
    bl.forEach(function(b,i){var d=(i+1)*22;b.style.translate=(x*d)+'px '+(y*d)+'px';});});
}

/* ---------- hero canvas: ink flow-field that follows the cursor ---------- */
function canvasFlow(){
  var cv=$('.hero canvas'); if(!cv||reduce)return;
  var ctx=cv.getContext('2d'),W,H,dpr=Math.min(2,devicePixelRatio||1),P=[],mx=-999,my=-999,cols=['#c8ff3d','#8f6bff','#ff5c7a','#4fd3ff'];
  function rs(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    var N=Math.round(Math.min(160,W/9));P=[];for(var i=0;i<N;i++)P.push({x:Math.random()*W,y:Math.random()*H,c:cols[i%4],l:0});}
  rs();addEventListener('resize',rs);
  var hero=cv.parentElement.parentElement;
  hero.addEventListener('mousemove',function(e){var r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});
  var t=0,vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
  (function loop(){requestAnimationFrame(loop);if(!vis)return;t+=.003;
    ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
    P.forEach(function(p){
      var a=Math.sin(p.x*.004+t*3)*Math.cos(p.y*.005-t*2)*Math.PI*2;
      var dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy);
      var vx=Math.cos(a)*1.4,vy=Math.sin(a)*1.4; if(d<170){vx+=dx/d*(170-d)*.05;vy+=dy/d*(170-d)*.05;}
      var ox=p.x,oy=p.y;p.x+=vx;p.y+=vy;p.l++;
      ctx.strokeStyle=p.c;ctx.globalAlpha=.7;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(p.x,p.y);ctx.stroke();
      if(p.x<0||p.x>W||p.y<0||p.y>H||p.l>400){p.x=Math.random()*W;p.y=Math.random()*H;p.l=0;}
    });ctx.globalAlpha=1;
  })();
}

/* ---------- FAQ accordion ---------- */
$$('.faq-q').forEach(function(q){q.addEventListener('click',function(){var it=q.parentElement,o=it.classList.contains('open');$$('.faq-i',it.parentElement).forEach(function(x){x.classList.remove('open')});if(!o)it.classList.add('open');});});

/* ---------- filters (works + blog) ---------- */
$$('.flt').forEach(function(f){
  var tgt=$$(f.dataset.target||'.tile');
  $$('button',f).forEach(function(b){b.addEventListener('click',function(){
    $$('button',f).forEach(function(x){x.classList.remove('on')});b.classList.add('on');var k=b.dataset.f;
    tgt.forEach(function(t){var show=k==='all'||(t.dataset.cat||'').split(' ').indexOf(k)>-1;
      if(show){t.classList.remove('off');t.style.opacity=0;t.style.transform='translateY(20px)';requestAnimationFrame(function(){requestAnimationFrame(function(){t.style.opacity=1;t.style.transform='none';});});}
      else t.classList.add('off');});
  });});
});

/* ---------- lightbox ---------- */
(function(){
  var lb=$('.lb'); if(!lb)return; var img=$('.lb-img',lb),h=$('h3',lb),p=$('.lb-info p',lb),tg=$('.lb-info .tag',lb);
  $$('.tile').forEach(function(t){t.addEventListener('click',function(){
    img.innerHTML=$('svg,img',t).outerHTML;h.textContent=$('h3',t).textContent;p.textContent=t.dataset.desc||'';tg.textContent=t.dataset.med||'';lb.classList.add('open');document.body.style.overflow='hidden';
  });});
  function close(){lb.classList.remove('open');document.body.style.overflow='';}
  $('.lb-x',lb).addEventListener('click',close);lb.addEventListener('click',function(e){if(e.target===lb)close();});addEventListener('keydown',function(e){if(e.key==='Escape')close();});
})();

/* ---------- forms: validation (shared) ---------- */
function stkRule(i){
  var v=(i.value||'').trim(),r=i.getAttribute('data-rule')||'';
  if(i.type==='checkbox')return (i.required&&!i.checked)?'Please tick this box to continue.':'';
  if(i.required&&v==='')return i.type==='email'?'Enter your email address.':((i.type==='password'||i.closest('.pw-wrap'))?'Enter your password.':'This field is required.');
  if(v==='')return '';
  if(i.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return 'Enter a valid email address.';
  if(i.type==='tel'&&!/^[0-9+\-\s()]{7,16}$/.test(v))return 'Enter a valid phone number.';
  if(r==='name'){if(/\d/.test(v))return 'Names can’t contain numbers.';if(!/^[\p{L}][\p{L}\s.'’-]*$/u.test(v))return 'Use letters only.';}
  if(r==='card'&&!/^\d{16}$/.test(v.replace(/\s/g,'')))return 'Enter a 16-digit card number.';
  if(r==='expiry'&&!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(v))return 'Use the format MM / YY.';
  if(r==='account'&&!/^\d{9,18}$/.test(v.replace(/\s/g,'')))return 'Enter a 9–18 digit account number.';
  if(r==='ifsc'&&!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(v))return 'Enter a valid IFSC code, e.g. HDFC0001234.';
  if(i.minLength>0&&v.length<i.minLength)return 'Use at least '+i.minLength+' characters.';
  return '';
}
function stkErr(i,msg){
  var f=i.form,nl=f&&f.classList.contains('nl');
  var host=nl?f:(i.closest('.f-field')||(i.type==='checkbox'?(i.closest('label')||i.parentElement):i.parentElement));
  var er=host._er;
  if(msg){
    host.classList.add('has-err'); if(!nl)i.classList.add('is-invalid'); i.setAttribute('aria-invalid','true');
    if(!er){er=document.createElement('div');er.className='f-err';er.setAttribute('role','alert');
      if(nl||i.type==='checkbox')host.insertAdjacentElement('afterend',er);else host.appendChild(er);host._er=er;}
    er.textContent=msg;
  }else{
    host.classList.remove('has-err'); i.classList.remove('is-invalid'); i.removeAttribute('aria-invalid');
    if(er){er.remove();host._er=null;}
  }
}
/* returns the first invalid field (and shows every error), or null when the form is valid */
function stkValidate(f){
  var first=null;
  $$('input:not([type=hidden]):not([type=file]),select,textarea',f).forEach(function(i){
    var m=stkRule(i);stkErr(i,m);if(m&&!first)first=i;
  });
  if(first)first.focus();
  return first;
}
function stkBind(f){
  f.noValidate=true;
  $$('input,select,textarea',f).forEach(function(i){
    var ev=(i.type==='checkbox'||i.tagName==='SELECT')?'change':'input';
    i.addEventListener(ev,function(){var host=f.classList.contains('nl')?f:(i.closest('.f-field')||i.parentElement);if(host.classList.contains('has-err')||host._er)stkErr(i,stkRule(i));});
  });
}
$$('form').forEach(stkBind);
/* names: block digits while typing */
$$('input[data-rule="name"]').forEach(function(i){
  var t;i.addEventListener('input',function(){
    if(/\d/.test(i.value)){var p=i.selectionStart||0,b=i.value.length;i.value=i.value.replace(/\d+/g,'');try{i.setSelectionRange(p-(b-i.value.length),p-(b-i.value.length));}catch(e){}
      stkErr(i,'Numbers aren’t allowed in names.');clearTimeout(t);t=setTimeout(function(){stkErr(i,stkRule(i));},1800);}
  });
});
/* password fields: show / hide eye toggle */
var EYE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
var EYEOFF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
$$('input[type=password]').forEach(function(i){
  if(i.parentElement.classList.contains('pw-wrap'))return;
  var w=document.createElement('div');w.className='pw-wrap';i.parentNode.insertBefore(w,i);w.appendChild(i);
  var b=document.createElement('button');b.type='button';b.className='pw-eye';b.setAttribute('aria-label','Show password');b.setAttribute('aria-pressed','false');b.innerHTML=EYE;w.appendChild(b);
  b.addEventListener('click',function(){var show=i.type==='password';i.type=show?'text':'password';b.innerHTML=show?EYEOFF:EYE;b.setAttribute('aria-label',show?'Hide password':'Show password');b.setAttribute('aria-pressed',show?'true':'false');i.focus();});
});

/* ---------- forms: validate, then go to the 404 page ---------- */
$$('form[data-demo]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(stkValidate(f))return;
    var b=$('button[type=submit]',f); if(b){b.disabled=true;b.textContent=f.classList.contains('nl')?'Subscribing…':'Sending…';}
    setTimeout(function(){location.href='404.html';},700);
  });
});
$$('.sw').forEach(function(s){s.addEventListener('click',function(){s.classList.toggle('on')});});
$$('.cl').forEach(function(ul,k){var key='stk_chk_'+location.pathname.split('/').pop()+k,saved=null;try{saved=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
  $$('li',ul).forEach(function(li,i){if(saved&&saved[i]!=null)li.classList.toggle('done',!!saved[i]);li.addEventListener('click',function(){li.classList.toggle('done');try{localStorage.setItem(key,JSON.stringify($$('li',ul).map(function(x){return x.classList.contains('done')?1:0})))}catch(e){}});});});
$$('.drop').forEach(function(d){d.addEventListener('click',function(){var i=document.createElement('input');i.type='file';i.onchange=function(){if(i.files[0])$('b',d).textContent=i.files[0].name;};i.click();});});

/* ---------- dashboards ---------- */
(function(){
  var side=$('.side'); if(!side)return; var sc=$('.scrim'),mb=$('.dmenu button');
  function set(o){side.classList.toggle('open',o);if(sc)sc.classList.toggle('show',o);if(mb)mb.setAttribute('aria-expanded',o?'true':'false');document.body.style.overflow=o&&matchMedia('(max-width:980px)').matches?'hidden':'';}
  addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  if(mb)mb.addEventListener('click',function(){set(!side.classList.contains('open'))}); if(sc)sc.addEventListener('click',function(){set(false)});
  var em='',nm='',role='';try{em=sessionStorage.getItem('stackly_email')||'';nm=sessionStorage.getItem('stackly_name')||'';}catch(e){}
  if(!nm&&em)nm=em.split('@')[0].replace(/[._+\-]+/g,' ').replace(/[0-9]+/g,'').trim().split(/\s+/).filter(Boolean).map(function(w){return w[0].toUpperCase()+w.slice(1)}).join(' ');
  function fill(s,v){$$(s).forEach(function(n){n.textContent=v})}
  if(nm){var pt=nm.split(' ');fill('[data-first]',pt[0]);fill('[data-user-name]',nm);fill('[data-user-initials]',(pt[0][0]||'')+((pt[1]||'')[0]||''));} if(em)fill('[data-user-email]',em);
  $$('[data-logout]').forEach(function(a){a.addEventListener('click',function(){try{sessionStorage.removeItem('stackly_role')}catch(e){}})});
  $$('.dc').forEach(function(c,i){c.style.opacity=0;c.style.transform='translateY(18px)';setTimeout(function(){c.style.transition='opacity .6s,transform .7s cubic-bezier(.2,.8,.2,1)';c.style.opacity=1;c.style.transform='';},200+i*90);});
  $$('.bars .b').forEach(function(b,i){var h=b.style.height;b.style.height='0';b.style.transition='height 1s cubic-bezier(.2,.8,.2,1) '+(i*.07)+'s,filter .3s';setTimeout(function(){b.style.height=h},250);});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var s=e.target;$$('.trk span',s).forEach(function(x){x.style.width=x.dataset.w});io.unobserve(s);}})},{threshold:.2});
  $$('.dsec').forEach(function(s){io.observe(s)});
})();

/* ---------- auth redirects ---------- */
var lf=$('[data-login-form]');
if(lf)lf.addEventListener('submit',function(e){e.preventDefault();var sel=$('#dashSelect'),em=$('input[type=email]',lf).value.trim(),b=$('button[type=submit]',lf);if(stkValidate(lf))return;b.textContent='Logging in…';b.disabled=true;
  try{sessionStorage.setItem('stackly_role',sel.value);sessionStorage.setItem('stackly_email',em);sessionStorage.removeItem('stackly_name');}catch(x){}
  $('.auth-in').style.cssText='opacity:0;transform:translateY(-14px);transition:.4s';setTimeout(function(){location.href=sel.value==='manager'?'dashboard-manager.html':'dashboard-client.html';},400);});
var sf=$('[data-signup-form]');
if(sf)sf.addEventListener('submit',function(e){e.preventDefault();if(stkValidate(sf))return;var pw=$('#pw'),cp=$('#pw2'),m=$('#pwMsg');if(pw.value!==cp.value){m.style.display='block';cp.focus();return;}m.style.display='none';var ins=$$('input[data-nm]',sf),name=ins.map(function(i){return i.value.trim()}).join(' ').trim(),role=$('#signupRole').value,em=$('input[type=email]',sf).value.trim(),b=$('button[type=submit]',sf);
  b.textContent='Creating account…';b.disabled=true;try{sessionStorage.setItem('stackly_role',role);sessionStorage.setItem('stackly_email',em);sessionStorage.setItem('stackly_name',name);}catch(x){}
  $('.auth-in').style.cssText='opacity:0;transform:translateY(-14px);transition:.4s';setTimeout(function(){location.href=role==='manager'?'dashboard-manager.html':'dashboard-client.html';},400);});

var gb=$('[data-back]');if(gb)gb.addEventListener('click',function(e){e.preventDefault();history.length>1?history.back():location.href='index.html';});
})();
