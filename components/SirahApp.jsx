"use client";
import{useState,useMemo,useEffect,useRef,useCallback}from"react";
import{COMP}from"../data/companions";
import{E}from"../data/events";
import{QR,FC,GATE_Q,shuf,mkQ}from"../data/quizzes";
import{KIDCH}from"../data/kids";
import{THEMES}from"../data/themes";

const LIGHT={bg:"#faf5ed",sf:"#f0e8d8",cd:"#fff8f0",bd:"#d4c4a0",tx:"#2c1810",ts:"#6b5a48",gd:"#b8860b",gdd:"#8a6a20"};
const DARK={bg:"#17130e",sf:"#1f1a14",cd:"#262019",bd:"#332c23",tx:"#e8dcc8",ts:"#9a8b78",gd:"#c9a84c",gdd:"#8a7038"};
const CC={life:"#6a9a7e",battle:"#b85a4a",treaty:"#5a8aaa",miracle:"#9a7aaa",migration:"#c49a5a"};
const CL={life:"Vie & Da'wah",battle:"Bataille",treaty:"Traité",miracle:"Miracle",migration:"Migration"};
const CI={life:"☪",battle:"⚔️",treaty:"📜",miracle:"✨",migration:"🐫"};
const PER=[{id:"pre",name:"Pré-prophétique",icon:"🌙"},{id:"makkah",name:"Mecquoise",icon:"🕋"},{id:"medina",name:"Médinoise (début)",icon:"🕌"},{id:"medina2",name:"Médinoise (conquêtes)",icon:"⚔️"}];

function norm(s){return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[''ʿʾ\-]/g,"").replace(/\s+/g," ").trim();}

function Fmt({t,P}){if(!t)return null;
const segs=[];let rest=t;const rx=/(«[^»]*»|"[^"]*"|[A-ZÀÉÈÊÎÔÛ][A-ZÀÉÈÊÎÔÛ'\- ]{4,}(?=\s*[—:—\n]))/g;
let m,last=0;while((m=rx.exec(rest))!==null){
if(m.index>last)segs.push({t:"p",v:rest.slice(last,m.index)});
const v=m[0];if(v.startsWith("«")||v.startsWith('"'))segs.push({t:"q",v});else segs.push({t:"h",v});
last=m.index+v.length;}
if(last<rest.length)segs.push({t:"p",v:rest.slice(last)});
return segs.map((s,i)=>s.t==="q"?<span key={i} style={{fontStyle:"italic",color:P.gd,wordBreak:"keep-all"}}>{s.v.replace(/«\s/,"« ").replace(/\s»/," »").replace(/"\s/,'" ').replace(/\s"/,' "')}</span> :s.t==="h"?<span key={i} style={{fontWeight:700,color:P.tx}}>{s.v}</span> :<span key={i}>{s.v}</span>);
}

export default function App(){
const P=LIGHT;
const[tab,setTab]=useState("parcours");
const[storyBook,setStoryBook]=useState(false);
const[storyI,setStoryI]=useState(0);
const kidChapters=KIDCH;
const t={parcours:"Parcours",arbre:"Arbre",quiz:"Quiz",profil:"Profil",search:"Rechercher...",next:"Suiv.",prev:"Préc.",share:"Partager",sources:"Sources",lesson:"Leçon & Réflexion",characters:"Personnages clés",related:"Événements liés",resume:"Reprendre",start:"Commencer →",flashcards:"Flashcards",finalQuiz:"Quiz Final",badges:"Badges",favs:"Favoris",all:"Tous",battles:"⚔️ Batailles",readMin:"min"};
const[i,setI]=useState(0);
const[flt,setFlt]=useState("all");
const[vis,setVis]=useState(true);
const[dir,setDir]=useState(1);
const[readSet,setReadSet]=useState(new Set());
const[favSet,setFavSet]=useState(new Set());
const[unlocked,setUnlocked]=useState(new Set(["pre"]));
const[streak,setStreak]=useState(0);
const[storageLoaded,setStorageLoaded]=useState(false);
const[exp,setExp]=useState(null);
// Quiz states
const[finalQuiz,setFinalQuiz]=useState(false);
const[fq,setFq]=useState(()=>mkQ(QR));
const[fqi,setFqi]=useState(0);
const[fqa,setFqa]=useState(null);
const[fqSc,setFqSc]=useState(0);
const[fqDone,setFqDone]=useState(false);
// Gate quiz
const[gateFor,setGateFor]=useState(null);
const[gateQs,setGateQs]=useState([]);
const[gateI,setGateI]=useState(0);
const[gateA,setGateA]=useState(null);
const[gateSc,setGateSc]=useState(0);
const[gateDone,setGateDone]=useState(false);
// Flashcards
const[fcOpen,setFcOpen]=useState(false);
const[fcCards,setFcCards]=useState(()=>shuf(FC.map((q,j)=>({id:j,q:q.q,a:q.a,fix:q.fix||"",seen:false,ok:false}))));
const[fcI,setFcI]=useState(0);
const[fcFlip,setFcFlip]=useState(false);
const[fcStats,setFcStats]=useState({ok:0,nok:0});
// Overlays
const[searchOpen,setSearchOpen]=useState(false);
const[searchQ,setSearchQ]=useState("");
const[compId,setCompId]=useState(null);
const[favOpen,setFavOpen]=useState(false);
// Welcome + tutorial
const[welcomeDone,setWelcomeDone]=useState(()=>{try{return localStorage.getItem("nur-welcome")==="1";}catch{return false;}});
const[tutoStep,setTutoStep]=useState(0);
const[tutoActive,setTutoActive]=useState(false);
const dismissWelcome=()=>{setWelcomeDone(true);setTutoActive(true);setTutoStep(0);try{localStorage.setItem("nur-welcome","1");}catch{}};
// Swipe hint
const[swipeHint,setSwipeHint]=useState(()=>{try{return !localStorage.getItem("nur-swiped");}catch{return true;}});
const dismissSwipe=useCallback(()=>{setSwipeHint(false);try{localStorage.setItem("nur-swiped","1");}catch{}},[]);

const ref=useRef(null);
const touchRef=useRef({sx:0,sy:0});
const stRef=useRef(null);

const[activeTheme,setActiveTheme]=useState(null);

const evts=useMemo(()=>{if(activeTheme){const th=THEMES.find(t2=>t2.id===activeTheme);if(th)return E.filter(e=>th.ids.includes(e.id));}if(flt==="all")return E;if(flt==="battles")return E.filter(e=>e.c==="battle");return E.filter(e=>e.per===flt);},[flt,activeTheme]);
const ev=evts[i]||evts[0];const cc=CC[ev?.c];
const pct=evts.length>1?i/(evts.length-1):0;
// Resume
const[lastRead,setLastRead]=useState(()=>{try{return parseInt(localStorage.getItem("nur-last")||"0");}catch{return 0;}});
useEffect(()=>{if(ev?.id){setLastRead(ev.id);try{localStorage.setItem("nur-last",String(ev.id));}catch{}}},[ev?.id]);
const resumeIdx=useMemo(()=>{if(lastRead&&tab==="parcours")return evts.findIndex(e=>e.id===lastRead);return -1;},[lastRead,evts,tab]);
// Map
const[mapOpen,setMapOpen]=useState(false);
const xp=readSet.size*10;
const level=xp<50?"Débutant":xp<150?"Apprenti":xp<300?"Étudiant":xp<500?"Connaisseur":"Savant";

// Badges
const BADGES=[
{id:"first",icon:"🏅",n:"Première lecture",d:"Lire son premier événement",check:()=>readSet.size>=1},
{id:"pre",icon:"🌙",n:"Pré-prophétique",d:"Terminer la période pré-prophétique",check:()=>E.filter(e=>e.per==="pre").every(e=>readSet.has(e.id))},
{id:"makkah",icon:"🕋",n:"Mecquoise",d:"Terminer la période mecquoise",check:()=>E.filter(e=>e.per==="makkah").every(e=>readSet.has(e.id))},
{id:"medina",icon:"🕌",n:"Médinoise (début)",d:"Terminer la première partie médinoise",check:()=>E.filter(e=>e.per==="medina").every(e=>readSet.has(e.id))},
{id:"medina2",icon:"⚔️",n:"Conquêtes",d:"Terminer toute la Sîrah",check:()=>E.filter(e=>e.per==="medina2").every(e=>readSet.has(e.id))},
{id:"battles",icon:"⚔️",n:"Stratège",d:"Lire toutes les batailles",check:()=>E.filter(e=>e.c==="battle").every(e=>readSet.has(e.id))},
{id:"s3",icon:"🔥",n:"3 jours",d:"Streak de 3 jours",check:()=>streak>=3},
{id:"s7",icon:"🔥",n:"7 jours",d:"Streak de 7 jours",check:()=>streak>=7},
{id:"fav5",icon:"❤️",n:"Collectionneur",d:"5 favoris",check:()=>favSet.size>=5},
];
const earnedBadges=BADGES.filter(b=>b.check());

// Persistence
const saveProgress=useCallback(async(rs,fs,ul,st)=>{const data={read:[...rs],fav:[...fs],unlocked:[...ul],streak:st};
try{await window.storage.set("nur-progress",JSON.stringify(data));}catch{try{localStorage.setItem("nur-progress",JSON.stringify(data));}catch{}}},[]);
useEffect(()=>{(async()=>{try{const r=await window.storage.get("nur-progress");if(r&&r.value){const d=JSON.parse(r.value);if(d.read)setReadSet(new Set(d.read));if(d.fav)setFavSet(new Set(d.fav));if(d.unlocked)setUnlocked(new Set(d.unlocked));if(d.streak)setStreak(d.streak);}}catch{}setStorageLoaded(true);})();},[]);
useEffect(()=>{if(storageLoaded)saveProgress(readSet,favSet,unlocked,streak);},[readSet,favSet,unlocked,streak,storageLoaded]);
const bumpStreak=useCallback(()=>{setStreak(prev=>{try{const d=JSON.parse(localStorage.getItem("seerah-streak")||"{}");const today=new Date().toDateString();if(d.last===today)return prev;const y=new Date();y.setDate(y.getDate()-1);const c=d.last===y.toDateString()?(d.count||0)+1:1;localStorage.setItem("seerah-streak",JSON.stringify({last:today,count:c}));return c;}catch{return prev;}});},[]);
const markRead=useCallback(eid=>{setReadSet(p=>{const n=new Set(p);n.add(eid);return n;});bumpStreak();},[bumpStreak]);
const toggleFav=useCallback(eid=>{setFavSet(p=>{const n=new Set(p);if(n.has(eid))n.delete(eid);else n.add(eid);return n;});},[]);
const isLocked=per=>!unlocked.has(per);

// Navigation
const go=useCallback(n=>{const x=Math.max(0,Math.min(evts.length-1,n));setDir(x>i?1:-1);setVis(false);setTimeout(()=>{setI(x);setExp(null);setVis(true);markRead(evts[x]?.id);if(ref.current)ref.current.scrollTop=0;},200);},[evts,i,markRead]);
useEffect(()=>{setI(0);setExp(null);},[flt]);
useEffect(()=>{if(ev)markRead(ev.id);},[ev?.id]);


// Keyboard
useEffect(()=>{const h=e=>{if(e.key==="k"&&(e.metaKey||e.ctrlKey)){e.preventDefault();setSearchOpen(p=>!p);}if(tab!=="parcours"||finalQuiz)return;if(e.key==="ArrowRight"){e.preventDefault();go(i+1);}if(e.key==="ArrowLeft"){e.preventDefault();go(i-1);}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[i,go,tab,finalQuiz]);

// Swipe
const onTS=useCallback(e=>{touchRef.current={sx:e.touches[0].clientX,sy:e.touches[0].clientY};},[]);
const onTE=useCallback(e=>{if(tab!=="parcours"||finalQuiz)return;const t=e.changedTouches[0];const dx=t.clientX-touchRef.current.sx;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(t.clientY-touchRef.current.sy)){dismissSwipe();if(dx<0)go(i+1);else go(i-1);}},[tab,i,go,finalQuiz,dismissSwipe]);

// Gate quiz
const startGate=pid=>{const qs=GATE_Q[pid];if(!qs)return;setGateFor(pid);setGateQs(mkQ(qs));setGateI(0);setGateA(null);setGateSc(0);setGateDone(false);};
const ansGate=ai=>{setGateA(ai);if(ai===gateQs[gateI].a)setGateSc(s=>s+1);};
const nextGateQ=()=>{if(gateI<gateQs.length-1){setGateI(g=>g+1);setGateA(null);}else setGateDone(true);};
// Confetti
const[confetti,setConfetti]=useState(false);
const triggerConfetti=useCallback(()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2500);},[]);
const finishGate=()=>{if(gateSc>=3&&gateFor){setUnlocked(p=>{const n=new Set(p);n.add(gateFor);return n;});triggerConfetti();}setGateFor(null);};
const gateMsg=()=>{if(gateSc===5)return{icon:"🌟",msg:"Ma shâ'a Allah ! Parfait !",ok:true};if(gateSc>=3)return{icon:"✅",msg:`${gateSc}/5, Bien joué ! Continue.`,ok:true};if(gateSc>=2)return{icon:"📖",msg:`${gateSc}/5, Pas loin ! Revois le parcours.`,ok:false};return{icon:"🔒",msg:`${gateSc}/5, Relis attentivement et réessaie.`,ok:false};};

// Final quiz
const ansFQ=ai=>{setFqa(ai);if(ai===fq[fqi].a)setFqSc(s=>s+1);};
const nextFQ=()=>{if(fqi<fq.length-1){setFqi(g=>g+1);setFqa(null);}else setFqDone(true);};
const rstFQ=()=>{setFq(mkQ(QR));setFqi(0);setFqa(null);setFqSc(0);setFqDone(false);};
const fqMsg=()=>{const p=Math.round(fqSc/fq.length*100);if(p>=90)return{icon:"🏆",t:"Ma shâ'a Allah !",s:"Score exceptionnel."};if(p>=70)return{icon:"🌟",t:"Excellent !",s:"Quelques détails à revoir."};if(p>=50)return{icon:"👏",t:"Bien !",s:"Continue à étudier."};return{icon:"📖",t:"Continue !",s:"Repasse sur le parcours."};};

// Flashcards
const fcCard=fcCards[fcI];
const fcAnswer=(ok)=>{const nc=[...fcCards];nc[fcI]={...nc[fcI],seen:true,ok};setFcCards(nc);setFcStats(s=>ok?{...s,ok:s.ok+1}:{...s,nok:s.nok+1});setFcFlip(false);setTimeout(()=>{const unseen=nc.findIndex((c,j)=>j!==fcI&&!c.seen);if(fcI<nc.length-1)setFcI(fcI+1);else if(unseen>=0)setFcI(unseen);else setFcI(nc.length);},300);};
const fcRetryFailed=()=>{const f=fcCards.filter(c=>c.seen&&!c.ok).map(c=>({...c,seen:false,ok:false}));if(!f.length)return;setFcCards(shuf(f));setFcI(0);setFcFlip(false);setFcStats({ok:0,nok:0});};
const fcReset=()=>{setFcCards(shuf(FC.map((q,j)=>({id:j,q:q.q,a:q.a,fix:q.fix||"",seen:false,ok:false}))));setFcI(0);setFcFlip(false);setFcStats({ok:0,nok:0});};

// Search
const searchResults=useMemo(()=>{if(!searchQ||searchQ.length<2)return{events:[],companions:[]};const q=norm(searchQ);
return{events:E.filter(e=>norm(e.t).includes(q)||e.ar.includes(searchQ)||norm(e.loc).includes(q)||norm(e.d).includes(q)||(e.ppl&&e.ppl.some(p=>norm(p).includes(q)))).slice(0,8),
companions:COMP.filter(c=>norm(c.n).includes(q)||c.ar.includes(searchQ)||(c.tl&&norm(c.tl).includes(q))||norm(c.bio).includes(q)).slice(0,6)};},[searchQ]);
const findComp=name=>{if(!name)return null;const q=name.toLowerCase().trim().replace(/\(.*\)/,"").trim();const qw=q.split(/\s+/);const qf=qw[0];const qt=qw.slice(0,2).join(" ");return COMP.find(c=>{const cn=c.n.toLowerCase().replace(/\(.*\)/,"").trim();if(q===cn)return true;const cw=cn.split(/\s+/);if(qt.length>4&&qt===cw.slice(0,2).join(" "))return true;if(qw.length===1&&qf.length>4&&qf===cw[0])return true;return false;});};
const comp=compId?COMP.find(c=>c.id===compId):null;

// Collapsible section
const Sec=({id:sid,icon,title,accent,children})=>(
<div style={{marginBottom:6,borderRadius:10,overflow:"hidden",border:`1px solid ${accent}22`}}>
<button onClick={()=>setExp(exp===sid?null:sid)} style={{width:"100%",textAlign:"left",padding:"12px 14px",border:"none",cursor:"pointer",fontFamily:"inherit",background:`${accent}08`,color:P.tx,fontSize:"0.85rem",fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{color:accent}}>{icon} {title}</span><span style={{fontSize:"0.6rem",transform:exp===sid?"rotate(180deg)":"",transition:"transform 0.25s",color:accent}}>▾</span></button>
<div style={{maxHeight:exp===sid?2000:0,overflow:"hidden",transition:"max-height 0.4s cubic-bezier(0.4,0,0.2,1)"}}>
<div style={{padding:"10px 14px",fontSize:"0.85rem",lineHeight:1.8,color:P.ts,borderTop:`1px solid ${accent}15`}}>{children}</div></div></div>);

// Tutorial
const TUTO=[
{icon:"👋",title:"Bismillah !",desc:"Bienvenue dans Nûr As-Sîrah, la vie du Prophète ﷺ racontée comme jamais. On te fait le tour en 30 secondes.",pos:"center",tab:null},
{icon:"👆",title:"Swipe pour naviguer",desc:"Glisse à gauche ou à droite pour passer d'un chapitre à l'autre. 64 événements de la naissance au décès du Prophète ﷺ.",pos:"center",tab:"parcours"},
{icon:"📖",title:"Chaque chapitre est riche",desc:"Descends pour découvrir : les personnages clés (clique pour ouvrir leur bio), les versets coraniques, les perles de sagesse à copier/partager, et les chaînes de conséquences.",pos:"top",tab:"parcours"},
{icon:"🔒",title:"3 Quiz de passage",desc:"Un quiz de 5 questions à la fin de chaque période. 3/5 pour débloquer la suite. Corrections détaillées à chaque réponse.",pos:"center",tab:"parcours"},
{icon:"🔵",title:"Ta progression",desc:"Le petit cercle en bas à droite montre ton % de lecture. Clique dessus pour ouvrir la carte du parcours, comme un plateau de jeu !",pos:"center",tab:"parcours"},
{icon:"📚",title:"Parcours thématiques",desc:"Relis la Sîrah sous un angle différent : le courage, les femmes, la miséricorde, les miracles... 8 parcours pour approfondir.",pos:"top",tab:"quiz"},
{icon:"🃏",title:"Quiz & Flashcards",desc:"49 questions au quiz final + 40 flashcards (Qui suis-je, Dans quel contexte, Vrai ou Faux). Deux formats complémentaires.",pos:"top",tab:"quiz"},
{icon:"🌳",title:"L'Arbre Généalogique",desc:"Parents, oncles, épouses, enfants, petits-enfants, toute la famille. Clique sur un nom : sa bio s'ouvre en bas avec sa timeline dans la Sîrah.",pos:"top",tab:"arbre"},
{icon:"📖",title:"Histoires pour enfants",desc:"19 chapitres pour lire la Sîrah le soir à tes enfants. Un chapitre par soir, avec un cliffhanger à la fin pour donner envie de revenir demain !",pos:"top",tab:"profil"},
{icon:"🚀",title:"C'est parti !",desc:"Bonne lecture. Que cette Sîrah soit une lumière pour toi et ta famille. بسم الله الرحمن الرحيم",pos:"center",tab:"parcours"},
];
const nextTuto=()=>{if(tutoStep<TUTO.length-1){const next=TUTO[tutoStep+1];if(next.tab)setTab(next.tab);setTutoStep(s=>s+1);}else{setTutoActive(false);setTab("parcours");}};
const skipTuto=()=>{setTutoActive(false);setTab("parcours");};

// ═══ RENDER ═══
return(
<div style={{width:"100%",height:"100dvh",display:"flex",flexDirection:"column",background:P.bg,fontFamily:"Georgia,'Times New Roman',serif",color:P.tx,overflow:"hidden",position:"fixed",inset:0}} onTouchStart={onTS} onTouchEnd={onTE}>

{/* ═══ WELCOME ═══ */}
{!welcomeDone&&<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
<div style={{maxWidth:400,width:"100%",background:P.sf,border:`1px solid ${P.gd}40`,borderRadius:20,padding:"24px 22px",textAlign:"center",maxHeight:"90vh",overflow:"auto"}}>
<div style={{fontSize:"2rem",marginBottom:6}}>🕌</div>
<div style={{fontSize:"0.5rem",letterSpacing:4,color:P.gd}}>السيرة النبوية</div>
<h1 style={{fontSize:"1.3rem",fontWeight:700,letterSpacing:2,marginBottom:10}}>Nûr As-Sîrah</h1>
<p style={{fontSize:"0.85rem",lineHeight:1.7,color:P.ts,marginBottom:12}}>La vie du Prophète Muhammad ﷺ, racontée de manière immersive, éducative, et accessible à tous.</p>
<div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:12}}>
{[["📜","64 événements"],["👥","36 biographies"],["🃏","Quiz & Flashcards"],["📚","8 parcours thématiques"],["📖","19 histoires enfants"],["🌳","Arbre généalogique"]].map(([ic,lb],j)=>
<span key={j} style={{padding:"4px 8px",borderRadius:8,background:P.cd,border:`1px solid ${P.bd}`,fontSize:"0.65rem",color:P.ts}}>{ic} {lb}</span>)}
</div>
<div style={{padding:"10px 14px",borderRadius:10,background:`${P.gd}08`,border:`1px solid ${P.gd}15`,marginBottom:14,textAlign:"left"}}>
<p style={{fontSize:"0.75rem",lineHeight:1.6,color:P.ts,margin:0}}>⚠️ Ceci est un <strong style={{color:P.tx}}>résumé</strong> de la Sîrah. Pour approfondir : <em>Ar-Rahîq Al-Makhtûm</em> ou <em>Ibn Hishâm</em>.</p>
</div>
<button onClick={dismissWelcome} style={{padding:"12px 28px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${P.gd},${P.gdd})`,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.9rem"}}>Commencer →</button>
</div>
</div>}

{/* ═══ TUTORIAL ═══ */}
{tutoActive&&(()=>{const step=TUTO[tutoStep];const total=TUTO.length;
const isTop=step.pos==="top";const isBot=step.pos==="bottom";
return <div style={{position:"fixed",inset:0,zIndex:1001,background:"rgba(0,0,0,0.6)",display:"flex",flexDirection:"column",justifyContent:isTop?"flex-start":isBot?"flex-end":"center",alignItems:"center",padding:isTop?"80px 16px 16px":isBot?"16px 16px 80px":"16px"}}>
<div style={{maxWidth:370,width:"100%",background:P.sf,border:`1.5px solid ${P.gd}40`,borderRadius:16,padding:"18px 16px",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.3)",position:"relative"}}>
{/* Arrow pointing to UI */}
{isTop&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:`8px solid ${P.sf}`}}/>}
{isBot&&<div style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:`8px solid ${P.sf}`}}/>}
{/* Step counter */}
<div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:10}}>
{TUTO.map((_,j)=><div key={j} style={{width:j===tutoStep?18:6,height:4,borderRadius:2,background:j<=tutoStep?P.gd:P.bd,transition:"all 0.3s"}}/>)}
</div>
<div style={{fontSize:"1.8rem",marginBottom:6}}>{step.icon}</div>
<h3 style={{fontSize:"1.05rem",fontWeight:700,marginBottom:6}}>{step.title}</h3>
<p style={{fontSize:"0.85rem",color:P.ts,lineHeight:1.7,marginBottom:14}}>{step.desc}</p>
<div style={{display:"flex",justifyContent:"center",gap:8}}>
{tutoStep>0&&<button onClick={()=>{const prev=TUTO[tutoStep-1];if(prev.tab)setTab(prev.tab);setTutoStep(s=>s-1);}} style={{padding:"10px 18px",borderRadius:10,border:`1px solid ${P.bd}`,background:"transparent",color:P.ts,cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem"}}>←</button>}
<button onClick={nextTuto} style={{padding:"10px 22px",borderRadius:10,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.88rem"}}>{tutoStep<total-1?`Suivant (${tutoStep+1}/${total})`:"C'est parti ! 🚀"}</button>
</div>
<button onClick={skipTuto} style={{marginTop:8,fontSize:"0.7rem",color:P.ts,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Passer le tutorial</button>
</div>
</div>;})()}

{/* ═══ SEARCH OVERLAY ═══ */}
{searchOpen&&<div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={()=>setSearchOpen(false)}>
<div style={{width:"92%",maxWidth:500,margin:"60px auto 0",background:P.sf,border:`1px solid ${P.bd}`,borderRadius:16,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
<div style={{padding:"14px 16px",borderBottom:`1px solid ${P.bd}`,display:"flex",alignItems:"center",gap:8}}>
<span>🔍</span>
<input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher un événement, compagnon..." autoFocus style={{flex:1,background:"transparent",border:"none",outline:"none",color:P.tx,fontSize:"0.95rem",fontFamily:"inherit"}}/>
</div>
<div style={{maxHeight:400,overflowY:"auto"}}>
{searchQ.length>=2?<>
{searchResults.events.map(e=><button key={e.id} onClick={()=>{setSearchOpen(false);setSearchQ("");setTab("parcours");const idx=evts.findIndex(x=>x.id===e.id);if(idx>=0)go(idx);}} style={{width:"100%",textAlign:"left",padding:"10px 16px",border:"none",borderBottom:`1px solid ${P.bd}40`,background:"transparent",cursor:"pointer",fontFamily:"inherit",color:P.tx,display:"flex",alignItems:"center",gap:8}}>
<span style={{color:CC[e.c]}}>{CI[e.c]}</span><span style={{fontSize:"0.55rem",color:P.gd,minWidth:28}}>{e.y}</span><span style={{fontSize:"0.85rem"}}>{e.t}</span></button>)}
{searchResults.companions.map(c=><button key={c.id} onClick={()=>{setSearchOpen(false);setSearchQ("");setCompId(c.id);}} style={{width:"100%",textAlign:"left",padding:"10px 16px",border:"none",borderBottom:`1px solid ${P.bd}40`,background:"transparent",cursor:"pointer",fontFamily:"inherit",color:P.tx,display:"flex",alignItems:"center",gap:8}}>
<span>👤</span><span style={{fontSize:"0.85rem"}}>{c.n}</span></button>)}
{searchResults.events.length===0&&searchResults.companions.length===0&&<div style={{padding:20,textAlign:"center",color:P.ts}}>Aucun résultat</div>}
</>:<div style={{padding:20,textAlign:"center",color:P.ts}}>Tape au moins 2 caractères...</div>}
</div>
</div>
</div>}

{/* ═══ COMPANION BIO, BOTTOM SHEET ═══ */}
{comp&&<div style={{position:"fixed",inset:0,zIndex:950,background:"rgba(0,0,0,0.5)"}} onClick={()=>setCompId(null)}>
<div style={{position:"absolute",bottom:0,left:0,right:0,maxHeight:"85vh",background:P.sf,borderRadius:"20px 20px 0 0",overflow:"hidden",animation:"sheetUp 0.3s ease-out",paddingBottom:"env(safe-area-inset-bottom,0px)"}} onClick={e=>e.stopPropagation()}>
{/* Handle bar */}
<div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}><div style={{width:36,height:4,borderRadius:2,background:P.bd}}/></div>
<div style={{overflowY:"auto",maxHeight:"calc(85vh - 30px)",padding:"0 20px 24px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
<div>
<div style={{fontSize:"0.5rem",color:P.gd,letterSpacing:2,marginBottom:4}}>COMPAGNON</div>
<h2 style={{fontSize:"1.25rem",fontWeight:700,marginBottom:2}}>{comp.n}</h2>
<div style={{fontSize:"1rem",color:P.gd,direction:"rtl",marginBottom:3}}>{comp.ar}</div>
</div>
<button onClick={()=>setCompId(null)} style={{background:"none",border:"none",color:P.ts,cursor:"pointer",fontSize:"1.2rem",padding:8}}>✕</button>
</div>
{comp.tl&&<div style={{fontSize:"0.8rem",color:P.ts,marginBottom:12,fontStyle:"italic"}}>{comp.tl}</div>}
<div style={{height:1,background:P.bd,marginBottom:12}}/>
<p style={{fontSize:"0.88rem",lineHeight:1.85,color:P.ts,marginBottom:14}}><Fmt t={comp.bio} P={P}/></p>
{/* Cross-linked timeline */}
{comp.ev.length>0&&<div style={{marginBottom:8}}>
<div style={{fontSize:"0.55rem",color:P.gd,letterSpacing:1,marginBottom:8}}>📍 TIMELINE DANS LA SÎRAH</div>
<div style={{borderLeft:`2px solid ${P.gd}30`,paddingLeft:12,display:"flex",flexDirection:"column",gap:6}}>
{comp.ev.sort((a,b)=>{const ea=E.find(x=>x.id===a);const eb=E.find(x=>x.id===b);return (ea?.y||0)-(eb?.y||0);}).map(eid=>{const ev2=E.find(x=>x.id===eid);if(!ev2)return null;
return <button key={eid} onClick={()=>{setCompId(null);setTab("parcours");const idx=evts.findIndex(x=>x.id===eid);if(idx>=0)go(idx);}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,border:`1px solid ${P.bd}`,background:P.cd,cursor:"pointer",fontFamily:"inherit",textAlign:"left",color:P.tx}}>
<div style={{width:8,height:8,borderRadius:"50%",background:CC[ev2.c],flexShrink:0}}/>
<div><div style={{fontSize:"0.55rem",color:P.gd}}>{ev2.y} EC</div><div style={{fontSize:"0.8rem"}}>{ev2.t}</div></div>
</button>;})}
</div>
</div>}
</div>
</div>
<style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
</div>}

{/* ═══ MAIN CONTENT ═══ */}
<div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

{/* ═══ TAB: PARCOURS ═══ */}
{tab==="parcours"&&!finalQuiz&&<>
{/* Header */}
<div style={{flexShrink:0}}>
{/* Top bar */}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:P.sf,borderBottom:`1px solid ${P.bd}`}}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<span style={{fontSize:"1rem"}}>🕌</span>
<span style={{fontSize:"0.85rem",fontWeight:700,letterSpacing:1,color:P.tx}}>Nûr As-Sîrah</span>
</div>
<div style={{display:"flex",alignItems:"center",gap:5}}>
<button onClick={()=>setSearchOpen(true)} style={{padding:"6px 8px",borderRadius:8,border:`1px solid ${P.bd}`,background:"transparent",cursor:"pointer",fontSize:"0.9rem"}}>🔍</button>
<button onClick={()=>setMapOpen(true)} style={{padding:"6px 8px",borderRadius:8,border:`1px solid ${P.bd}`,background:"transparent",cursor:"pointer",fontSize:"0.9rem"}}>🗺️</button>
<button onClick={()=>setFavOpen(p=>!p)} style={{padding:"6px 8px",borderRadius:8,border:`1px solid ${P.bd}`,background:"transparent",cursor:"pointer",fontSize:"0.9rem",position:"relative"}}>{favSet.size>0?"❤️":"🤍"}{favSet.size>0&&<span style={{position:"absolute",top:-3,right:-3,width:14,height:14,borderRadius:"50%",background:"#e74c3c",color:"#fff",fontSize:"0.45rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{favSet.size}</span>}</button>
</div>
</div>
{/* Filter pills, hidden when theme active */}
{!activeTheme&&<div onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} style={{display:"flex",gap:6,padding:"6px 12px",background:P.sf,borderBottom:`1px solid ${P.bd}`,overflowX:"auto"}}>
{[["all",t.all],["pre","Pré-prophétique"],["makkah","Mecquoise"],["medina","Méd. (début)"],["medina2","Méd. (conquêtes)"],["battles",t.battles]].map(([k,v])=>(
<button key={k} onClick={()=>{setFlt(k);setActiveTheme(null);setI(0);}} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${flt===k&&!activeTheme?P.gd:P.bd}`,background:flt===k&&!activeTheme?`${P.gd}18`:"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:"0.72rem",color:flt===k&&!activeTheme?P.gd:P.ts,fontWeight:flt===k&&!activeTheme?700:400,whiteSpace:"nowrap"}}>{v}</button>))}
</div>}
</div>
{/* Theme banner */}
{activeTheme&&(()=>{const th=THEMES.find(t2=>t2.id===activeTheme);return th?<div style={{padding:"10px 12px",background:`${P.gd}12`,borderBottom:`1px solid ${P.gd}30`,flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<span style={{fontSize:"1rem"}}>{th.icon}</span>
<div>
<div style={{fontSize:"0.8rem",fontWeight:700,color:P.gd}}>{th.name}</div>
<div style={{fontSize:"0.6rem",color:P.ts}}>{th.ids.length} chapitres sélectionnés</div>
</div>
</div>
</div>
<button onClick={()=>{setActiveTheme(null);setFlt("all");setI(0);}} style={{width:"100%",padding:"8px",borderRadius:8,border:`1px solid ${P.gd}40`,background:P.sf,cursor:"pointer",fontFamily:"inherit",fontSize:"0.78rem",color:P.gd,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
← Revenir au parcours complet (64 événements)
</button>
</div>:null;})()}
{/* Progress bar, always visible */}
<div style={{height:3,background:P.bd,flexShrink:0}}><div style={{height:"100%",background:`linear-gradient(to right,${CC.life},${P.gd})`,width:`${pct*100}%`,transition:"width 0.3s"}}/></div>

{/* Content */}
<div ref={ref} style={{flex:1,overflowY:"auto",position:"relative"}}>
{/* Resume banner */}
{i===0&&resumeIdx>0&&<button onClick={()=>go(resumeIdx)} style={{width:"100%",padding:"10px 16px",border:"none",borderBottom:`1px solid ${P.bd}`,background:`${P.gd}08`,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,color:P.tx,fontSize:"0.82rem"}}>
<span>📖</span><span style={{color:P.ts}}>Reprendre :</span><strong style={{color:P.gd}}>{evts[resumeIdx]?.t}</strong><span style={{marginLeft:"auto",color:P.gd}}>→</span>
</button>}
{/* Swipe hint */}
{swipeHint&&!isLocked(ev.per)&&<div onClick={dismissSwipe} style={{position:"fixed",bottom:110,left:"50%",transform:"translateX(-50%)",zIndex:20,background:`${P.gd}ee`,color:P.bg,padding:"10px 20px",borderRadius:24,fontSize:"0.8rem",fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
👆 Swipe pour naviguer
</div>}

{!activeTheme&&isLocked(ev.per)?
/* GATE SCREEN */
<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",textAlign:"center",padding:24}}>
{!gateFor||gateFor!==ev.per?
<div style={{maxWidth:400,textAlign:"left"}}>
<div style={{textAlign:"center",marginBottom:12}}>
<div style={{fontSize:"2.5rem",marginBottom:8}}>🔒</div>
<h2 style={{fontSize:"1.15rem",marginBottom:4}}>Période verrouillée</h2>
</div>
<div style={{padding:"12px 14px",borderRadius:12,background:P.cd,border:`1px solid ${P.bd}`,marginBottom:14}}>
<div style={{fontSize:"0.52rem",letterSpacing:2,color:P.gd,fontWeight:700,marginBottom:8}}>📜 CE QUE TU AS LU</div>
{ev.per==="makkah"&&<div style={{display:"flex",flexDirection:"column",gap:5,fontSize:"0.78rem",color:P.ts}}>
<span>🌍 L'Arabie pré-islamique & la Ka'bah</span><span>👶 Naissance, orphelinat & enfance</span><span>✨ L'ouverture de la poitrine</span><span>💍 Le mariage avec Khadija</span><span>🕯️ Les retraites à Hirâ'</span>
</div>}
{ev.per==="medina"&&<div style={{display:"flex",flexDirection:"column",gap:5,fontSize:"0.78rem",color:P.ts}}>
<span>📖 La Révélation & les premiers croyants</span><span>💪 Conversions de Hamza & 'Umar</span><span>😢 L'Année de la Tristesse</span><span>🌙 Le Mi'râj, les 5 prières</span><span>🐫 La Hijra vers Médine</span>
</div>}
{ev.per==="medina2"&&<div style={{display:"flex",flexDirection:"column",gap:5,fontSize:"0.78rem",color:P.ts}}>
<span>🔊 L'Adhân & le jeûne de Ramadan</span><span>⚔️ Badr, Uhud & le Khandaq</span><span>📜 Les Banû Qaynuqâ', Nadîr, Qurayza</span><span>💍 Le mariage de Fâtimah & 'Ali</span><span>🕊️ Le Traité de Hudaybiyya</span><span>🩸 Bi'r Ma'ûna & l'Ifk</span>
</div>}
</div>
<p style={{color:P.ts,fontSize:"0.85rem",textAlign:"center",marginBottom:14}}>3/5 pour débloquer la suite.</p>
<button onClick={()=>startGate(ev.per)} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.95rem"}}>Commencer le Quiz →</button>
</div> :!gateDone?
<div style={{maxWidth:440,width:"100%",textAlign:"left"}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
<span style={{fontSize:"0.65rem",color:P.ts,letterSpacing:2}}>QUIZ DE PASSAGE</span>
<span style={{fontSize:"0.65rem",color:P.gd,fontWeight:700}}>{gateSc} ✓</span>
</div>
<div style={{display:"flex",gap:4,marginBottom:16}}>{gateQs.map((_,gi)=><div key={gi} style={{flex:1,height:4,borderRadius:2,background:gi<gateI?CC.life:gi===gateI?P.gd:P.bd}}/>)}</div>
<h3 style={{fontSize:"1.05rem",fontWeight:600,lineHeight:1.5,marginBottom:16}}>{gateQs[gateI]?.q}</h3>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{gateQs[gateI]?.o.map((a,ai)=>{const ans=gateA!==null;const ok=ai===gateQs[gateI].a;const sel=gateA===ai;
return <button key={ai} onClick={()=>!ans&&ansGate(ai)} style={{padding:"14px 16px",borderRadius:12,border:`1.5px solid ${ans&&ok?CC.life:sel&&!ok?CC.battle:P.bd}`,background:ans&&ok?`${CC.life}20`:sel&&!ok?`${CC.battle}20`:P.cd,cursor:ans?"default":"pointer",fontFamily:"inherit",fontSize:"0.9rem",color:P.tx,textAlign:"left",opacity:ans&&!sel&&!ok?0.3:1}}>
<span style={{marginRight:10,fontWeight:700,color:ans&&ok?CC.life:sel&&!ok?CC.battle:P.ts}}>{String.fromCharCode(65+ai)}</span>{a}</button>;})}
</div>
{gateA!==null&&<div style={{marginTop:14,padding:"12px 16px",borderRadius:10,background:gateA===gateQs[gateI].a?`${CC.life}10`:`${CC.battle}08`,borderLeft:`3px solid ${gateA===gateQs[gateI].a?CC.life:CC.battle}`,fontSize:"0.85rem",lineHeight:1.7,color:P.ts}}>
{gateA===gateQs[gateI].a?"✅ ":"❌ "}{gateQs[gateI].fix}
</div>}
{gateA!==null&&<button ref={el=>{if(el)setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"center"}),100);}} onClick={nextGateQ} style={{marginTop:14,padding:"14px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.95rem",width:"100%"}}>{gateI<gateQs.length-1?"Question suivante →":"Voir le résultat →"}</button>}
</div> :<div style={{maxWidth:400,textAlign:"center"}}>
<div style={{fontSize:"2.5rem",marginBottom:8}}>{gateMsg().icon}</div>
<h2 style={{fontSize:"1.3rem",fontWeight:700,marginBottom:4}}>{gateSc} / {gateQs.length}</h2>
<p style={{color:P.ts,lineHeight:1.7,marginBottom:18}}>{gateMsg().msg}</p>
{gateMsg().ok?<button onClick={finishGate} style={{padding:"14px 24px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.95rem"}}>🔓 Continuer →</button> :<div style={{display:"flex",gap:8,justifyContent:"center"}}><button onClick={()=>startGate(gateFor)} style={{padding:"12px 20px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>↻ Réessayer</button><button onClick={()=>{setGateFor(null);setFlt(gateFor==="medina2"?"medina":gateFor==="medina"?"makkah":"pre");}} style={{padding:"12px 20px",borderRadius:12,border:`1px solid ${P.bd}`,background:"transparent",color:P.ts,cursor:"pointer",fontFamily:"inherit"}}>← Revoir</button></div>}
</div>}
</div> :
/* EVENT CARD */
<div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 80px",opacity:vis?1:0,transform:vis?"translateX(0)":`translateX(${dir*30}px)`,transition:"opacity 0.2s, transform 0.25s"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
<span style={{padding:"3px 10px",borderRadius:16,background:`${cc}20`,color:cc,fontSize:"0.65rem",letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{CI[ev.c]} {CL[ev.c]}</span>
</div>
<div style={{display:"flex",gap:6}}>
<button onClick={()=>toggleFav(ev.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem",opacity:favSet.has(ev.id)?1:0.3}}>{favSet.has(ev.id)?"❤️":"🤍"}</button>
</div>
</div>
<div style={{fontSize:"0.8rem",color:P.gd,letterSpacing:1,marginBottom:4,fontWeight:600}}>{ev.y} EC, {ev.h}</div>
<h1 style={{fontSize:"1.5rem",fontWeight:700,lineHeight:1.3,margin:"0 0 3px"}}>{ev.t}</h1>
<div style={{fontSize:"1.05rem",color:P.gd,direction:"rtl",marginBottom:4,opacity:0.8}}>{ev.ar}</div>
<div style={{fontSize:"0.78rem",color:P.ts,marginBottom:16}}>📍 {ev.loc}</div>
<div style={{height:2,borderRadius:1,background:`linear-gradient(to right, ${cc}, ${cc}30, transparent)`,marginBottom:18}}/>
<div style={{fontSize:"0.95rem",lineHeight:2,color:`${P.tx}dd`,whiteSpace:"pre-line",marginBottom:20}}><Fmt t={ev.d} P={P}/></div>
{ev.ay&&<div style={{padding:"16px 20px",margin:"16px 0 20px",background:`${P.gd}08`,border:`1px solid ${P.gd}18`,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:"0.5rem",letterSpacing:3,color:P.gd,marginBottom:4,fontWeight:600}}>CORAN</div>
{ev.ayRef&&<div style={{fontSize:"0.65rem",color:P.ts,marginBottom:8}}>{ev.ayRef}</div>}
<div style={{fontSize:"1.15rem",color:`${P.tx}ee`,direction:"rtl",lineHeight:2.4}}>{ev.ay}</div>
{ev.ayFr&&<div style={{fontSize:"0.85rem",color:P.ts,fontStyle:"italic",lineHeight:1.7,marginTop:10}}>{ev.ayFr}</div>}
</div>}
{/* Perle de sagesse, screenshotable */}
{ev.gem&&<div style={{margin:"16px 0",padding:"20px",borderRadius:14,background:`linear-gradient(135deg,${P.gd}12,${P.gd}04)`,border:`1.5px solid ${P.gd}30`,textAlign:"center",position:"relative"}}>
<div style={{fontSize:"0.45rem",letterSpacing:3,color:P.gd,marginBottom:8,fontWeight:700}}>✦ PERLE DE SAGESSE ✦</div>
{ev.gem.ar&&<div style={{fontSize:"1.1rem",color:`${P.tx}cc`,direction:"rtl",lineHeight:2,marginBottom:8}}>{ev.gem.ar}</div>}
<div style={{fontSize:"0.95rem",fontStyle:"italic",color:P.gd,lineHeight:1.8,fontWeight:500,marginBottom:8}}>« {ev.gem.fr} »</div>
<div style={{fontSize:"0.65rem",color:P.ts}}>— {ev.gem.src}</div>
<div style={{marginTop:10,display:"flex",justifyContent:"center",gap:8}}>
<button onClick={()=>{const txt=`✦ ${ev.gem.fr} ✦\n\n— ${ev.gem.src}\n\n🕌 Nûr As-Sîrah`;navigator.clipboard.writeText(txt).then(()=>alert("Citation copiée !")).catch(()=>{});}} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${P.gd}40`,background:"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:"0.65rem",color:P.gd}}>📋 Copier</button>
<button onClick={()=>{const txt=`✦ ${ev.gem.fr} ✦\n\n— ${ev.gem.src}\n\n🕌 Nûr As-Sîrah`;if(navigator.share)navigator.share({text:txt}).catch(()=>{});}} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${P.gd}40`,background:"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:"0.65rem",color:P.gd}}>📤 Partager</button>
</div>
<div style={{fontSize:"0.4rem",color:P.ts,marginTop:6}}>🕌 Nûr As-Sîrah</div>
</div>}
{/* Citation marquante (legacy) */}
{ev.quote&&!ev.gem&&<div style={{margin:"16px 0",padding:"16px 20px",borderRadius:12,background:`linear-gradient(135deg,${P.gd}08,${P.gd}03)`,borderLeft:`3px solid ${P.gd}`,textAlign:"center"}}>
<div style={{fontSize:"0.95rem",fontStyle:"italic",color:P.gd,lineHeight:1.8,fontWeight:500}}>{ev.quote}</div>
</div>}
{/* Le savais-tu ? */}
{ev.fun&&<div style={{margin:"12px 0",padding:"12px 16px",borderRadius:12,background:`${CC.treaty}08`,border:`1px solid ${CC.treaty}20`,display:"flex",gap:10,alignItems:"flex-start"}}>
<span style={{fontSize:"1.1rem",flexShrink:0}}>💡</span>
<div><div style={{fontSize:"0.65rem",color:CC.treaty,fontWeight:700,letterSpacing:1,marginBottom:3}}>LE SAVAIS-TU ?</div>
<div style={{fontSize:"0.82rem",color:P.ts,lineHeight:1.65}}>{ev.fun}</div></div>
</div>}
{ev.lsn&&<Sec id="lsn" icon="💡" title={t.lesson} accent={CC.life}><div style={{whiteSpace:"pre-line"}}>{ev.lsn}</div></Sec>}
{ev.ppl&&ev.ppl.length>0&&<Sec id="ppl" icon="👥" title={`${t.characters} (${ev.ppl.length})`} accent={CC.treaty}>
{ev.ppl.map((p,j)=>{const c2=findComp(p);return <div key={j} style={{padding:"5px 0",borderBottom:j<ev.ppl.length-1?`1px solid ${P.bd}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:"0.88rem"}}>{p}</span>
{c2&&<button onClick={()=>setCompId(c2.id)} style={{fontSize:"0.65rem",padding:"3px 10px",borderRadius:6,border:`1px solid ${P.gd}40`,background:`${P.gd}10`,color:P.gd,cursor:"pointer",fontFamily:"inherit"}}>Bio →</button>}
</div>;})}
</Sec>}
<Sec id="src" icon="📖" title={t.sources} accent={CC.migration}><div style={{whiteSpace:"pre-line",fontStyle:"italic"}}>{ev.src}</div></Sec>
{ev.rel&&ev.rel.length>0&&<div style={{marginTop:10,padding:"10px 12px",borderRadius:10,background:P.cd,border:`1px solid ${P.bd}`}}>
<div style={{fontSize:"0.58rem",color:P.ts,letterSpacing:1,marginBottom:5}}>{t.related}</div>
<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
{ev.rel.map(rid=>{const re=E.find(x=>x.id===rid);if(!re)return null;
return <button key={rid} onClick={()=>{const idx=evts.findIndex(x=>x.id===rid);if(idx>=0)go(idx);}} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${CC[re.c]}40`,background:`${CC[re.c]}10`,color:CC[re.c],fontSize:"0.7rem",cursor:"pointer",fontFamily:"inherit"}}>{CI[re.c]} {re.t.substring(0,25)} ({re.y})</button>;})}
</div>
</div>}
{/* Cause → Conséquence chain */}
{ev.cons&&<div style={{marginTop:10,padding:"12px 14px",borderRadius:10,background:`${CC.migration}06`,border:`1px solid ${CC.migration}20`}}>
<div style={{fontSize:"0.55rem",color:CC.migration,letterSpacing:1,marginBottom:6,fontWeight:700}}>🔗 CHAÎNE DE CONSÉQUENCES</div>
<div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center",fontSize:"0.78rem",color:P.ts,lineHeight:1.8}}>
{ev.cons.split(" → ").map((step,si,arr)=><span key={si} style={{display:"inline-flex",alignItems:"center",gap:4}}>
<span>{step.replace(/\(\d+\)/g,m=>{const eid=parseInt(m.slice(1,-1));const re=E.find(x=>x.id===eid);return re?re.t.substring(0,20)+"...":m;})}</span>
{si<arr.length-1&&<span style={{color:P.gd,fontWeight:700}}>→</span>}
</span>)}
</div>
</div>}
<button onClick={()=>{const txt=`🕌 ${ev.t} (${ev.y})\n\n${ev.d.substring(0,180).replace(/\n/g," ")}...\n\n📖 Nûr As-Sîrah`;if(navigator.share)navigator.share({title:`Nûr As-Sîrah, ${ev.t}`,text:txt}).catch(()=>{});else{navigator.clipboard.writeText(txt);alert("Copié !");}}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",marginTop:14,padding:"12px",borderRadius:12,border:`1px solid ${P.gd}30`,background:`${P.gd}06`,cursor:"pointer",fontFamily:"inherit",fontSize:"0.82rem",color:P.gd,fontWeight:600}}>📤 {t.share}</button>
{i===evts.length-1&&ev.id===45&&<div style={{marginTop:24,padding:20,borderRadius:14,border:`2px solid ${P.gd}40`,background:`${P.gd}08`,textAlign:"center"}}>
<div style={{fontSize:"2rem",marginBottom:8}}>🏆</div>
<h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:8}}>Parcours terminé !</h3>
<button onClick={()=>{setFinalQuiz(true);rstFQ();setTab("parcours");}} style={{padding:"12px 28px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.95rem"}}>Quiz Final (40 questions) →</button>
</div>}
</div>}
</div>
{/* Bottom nav */}
{(activeTheme||!isLocked(ev.per))&&<div style={{borderTop:`1px solid ${P.bd}`,background:P.sf,flexShrink:0}}>
<div style={{display:"flex",alignItems:"stretch",height:48}}>
<button onClick={()=>go(i-1)} disabled={i<=0} style={{flex:1,border:"none",background:"transparent",cursor:"pointer",fontSize:"1.1rem",color:i>0?P.tx:`${P.ts}30`,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
←{i>0&&<span style={{fontSize:"0.7rem",color:P.ts}}>{t.prev}</span>}
</button>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:60}}>
<span style={{fontSize:"0.75rem",color:P.gd,fontWeight:700}}>{i+1}/{evts.length}</span>
</div>
<button onClick={()=>go(i+1)} disabled={i>=evts.length-1} style={{flex:1,border:"none",background:i<evts.length-1?`${P.gd}12`:"transparent",cursor:"pointer",fontSize:"1.1rem",color:i<evts.length-1?P.gd:`${P.ts}30`,fontFamily:"inherit",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
{i<evts.length-1&&<span style={{fontSize:"0.7rem"}}>{t.next}</span>}→
</button>
</div>
</div>}
</>}

{/* ═══ TAB: PARCOURS + FINAL QUIZ ═══ */}
{tab==="parcours"&&finalQuiz&&<div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center"}}>
<div style={{maxWidth:480,width:"100%",padding:"24px 20px"}}>
{!fqDone?<>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
<span style={{fontSize:"0.65rem",color:P.ts,letterSpacing:2}}>QUIZ FINAL</span>
<button onClick={()=>{setFinalQuiz(false);rstFQ();}} style={{fontSize:"0.65rem",color:P.ts,background:"none",border:"none",cursor:"pointer"}}>✕</button>
</div>
<div style={{display:"flex",gap:2,marginBottom:16}}>{fq.map((_,fi)=><div key={fi} style={{flex:1,height:3,borderRadius:2,background:fi<fqi?CC.life:fi===fqi?P.gd:P.bd}}/>)}</div>
<div style={{fontSize:"0.6rem",color:P.gd,marginBottom:8}}>Question {fqi+1}/{fq.length} · {fqSc} ✓</div>
<h2 style={{fontSize:"1.05rem",fontWeight:600,lineHeight:1.5,marginBottom:16}}>{fq[fqi].q}</h2>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{fq[fqi].o.map((a,ai)=>{const ans=fqa!==null;const ok=ai===fq[fqi].a;const sel=fqa===ai;
return <button key={ai} onClick={()=>!ans&&ansFQ(ai)} style={{padding:"14px 16px",borderRadius:12,border:`1.5px solid ${ans&&ok?CC.life:sel&&!ok?CC.battle:P.bd}`,background:ans&&ok?`${CC.life}20`:sel&&!ok?`${CC.battle}20`:P.cd,cursor:ans?"default":"pointer",fontFamily:"inherit",fontSize:"0.9rem",color:P.tx,textAlign:"left",opacity:ans&&!sel&&!ok?0.3:1}}>
<span style={{marginRight:10,fontWeight:700}}>{String.fromCharCode(65+ai)}</span>{a}</button>;})}
</div>
{fqa!==null&&<div style={{marginTop:12,padding:"12px 16px",borderRadius:10,background:fqa===fq[fqi].a?`${CC.life}10`:`${CC.battle}08`,borderLeft:`3px solid ${fqa===fq[fqi].a?CC.life:CC.battle}`,fontSize:"0.85rem",lineHeight:1.7,color:P.ts}}>
{fqa===fq[fqi].a?"✅ ":"❌ "}{fq[fqi].fix||`Réponse : ${fq[fqi].o[fq[fqi].a]}`}
</div>}
{fqa!==null&&<button ref={el=>{if(el)setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"center"}),100);}} onClick={nextFQ} style={{marginTop:12,padding:"14px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.95rem",width:"100%"}}>{fqi<fq.length-1?"Question suivante →":"Voir le résultat →"}</button>}
</>:<div style={{textAlign:"center"}}>
<div style={{fontSize:"3rem",marginBottom:10}}>{fqMsg().icon}</div>
<h2 style={{fontSize:"1.5rem",fontWeight:700}}>{fqSc}/{fq.length}</h2>
<p style={{color:P.gd,marginBottom:4}}>{Math.round(fqSc/fq.length*100)}%</p>
<h3 style={{marginBottom:4}}>{fqMsg().t}</h3>
<p style={{color:P.ts,marginBottom:18}}>{fqMsg().s}</p>
<div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
<button onClick={()=>{const txt=`🏆 ${fqSc}/${fq.length} au Quiz Sîrah !\n📖 Nûr As-Sîrah`;if(navigator.share)navigator.share({text:txt}).catch(()=>{});else{navigator.clipboard.writeText(txt);alert("Copié !");}}} style={{padding:"12px 20px",borderRadius:12,border:"none",background:CC.life,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📤 {t.share}</button>
<button onClick={rstFQ} style={{padding:"12px 20px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>↻ Rejouer</button>
<button onClick={()=>{setFinalQuiz(false);rstFQ();}} style={{padding:"12px 20px",borderRadius:12,border:`1px solid ${P.bd}`,background:"transparent",color:P.tx,cursor:"pointer",fontFamily:"inherit"}}>← Retour</button>
</div>
</div>}
</div>
</div>}

{/* ═══ TAB: ARBRE ═══ */}
{tab==="arbre"&&(()=>{
const N=({n,sub,enemy,comp:hasComp})=>{
const c=hasComp?COMP.find(x=>norm(x.n).includes(norm(n.replace(" ﷺ","")))):null;
return <div onClick={()=>{if(c)setCompId(c.id);}} style={{display:"inline-flex",flexDirection:"column",alignItems:"center",padding:"7px 10px",borderRadius:10,background:enemy?`${CC.battle}08`:P.cd,border:enemy?`1.5px solid ${CC.battle}40`:`1px solid ${P.bd}`,cursor:c?"pointer":"default",minWidth:80,maxWidth:130,transition:"transform 0.15s"}} onMouseEnter={e=>{if(c)e.currentTarget.style.transform="scale(1.05)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
<div style={{fontSize:"0.78rem",fontWeight:600,color:enemy?CC.battle:P.tx,textAlign:"center",lineHeight:1.3}}>{n}</div>
<div style={{fontSize:"0.55rem",color:enemy?CC.battle:P.ts,textAlign:"center",lineHeight:1.4,marginTop:2}}>{sub}</div>
{c&&<div style={{fontSize:"0.45rem",color:P.gd,marginTop:3}}>bio →</div>}
</div>;};
const Sct=({label,children})=><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginBottom:4}}>
{label&&<div style={{fontSize:"0.52rem",letterSpacing:2,color:P.gd,textTransform:"uppercase",fontWeight:700}}>{label}</div>}
<div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>{children}</div></div>;
const Vl=()=><div style={{width:1.5,height:12,background:P.bd,margin:"2px auto"}}/>;
return <div style={{flex:1,overflow:"auto",padding:"16px 12px"}}>
<h2 style={{fontSize:"1rem",fontWeight:700,color:P.gd,textAlign:"center",marginBottom:14}}>🌳 Arbre Généalogique</h2>
<div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
<Sct label="Grand-père"><N n="'Abdul-Muttalib" sub="Gardien de Zamzam & Ka'bah" comp/></Sct><Vl/>
<Sct label="Oncles du Prophète ﷺ"><N n="Abu Tâlib" sub="Protecteur" comp/><N n="Hamza" sub="Lion d'Allah" comp/><N n="Al-'Abbâs" sub="Oncle" comp/><N n="Abu Lahab" sub="Ennemi" enemy comp/></Sct>
<div style={{height:8}}/>
<Sct label="Parents"><div style={{display:"flex",alignItems:"center",gap:4}}><N n="'Abdullah" sub="Père (décédé)" comp/><span style={{color:P.gd}}>∞</span><N n="Amina" sub="Mère (décédée)" comp/></div></Sct><Vl/>
<div style={{padding:"14px 18px",borderRadius:14,background:`${P.gd}12`,border:`2px solid ${P.gd}40`,textAlign:"center",marginBottom:4,maxWidth:300,width:"100%",boxShadow:`0 4px 20px ${P.gd}15`}}>
<div style={{fontSize:"0.5rem",letterSpacing:4,color:P.gd}}>صلى الله عليه وسلم</div>
<div style={{fontSize:"1.4rem",fontWeight:800,color:P.gd}}>Muhammad ﷺ</div>
<div style={{fontSize:"0.65rem",color:P.ts,marginTop:3}}>Le Messager d'Allah · 570–632</div>
</div><Vl/>
<Sct label="Épouses (Mères des Croyants)">
<div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center",width:"100%"}}>
<div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}><N n="Khadija" sub="1ère · Mère de ses enfants" comp/><N n="Sawda" sub="2ème" comp/><N n="'Â'ishah" sub="3ème · Savante" comp/><N n="Hafsa" sub="4ème" comp/></div>
<div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}><N n="Zaynab bint Khuzayma" sub="5ème" comp/><N n="Umm Salama" sub="6ème · Sage" comp/><N n="Zaynab bint Jahsh" sub="7ème" comp/></div>
<div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}><N n="Juwayriya" sub="8ème" comp/><N n="Umm Habîba" sub="9ème" comp/><N n="Safiyya" sub="10ème" comp/><N n="Maymûna" sub="11ème" comp/></div>
</div>
</Sct><Vl/>
<Sct label="Enfants">
<div style={{display:"flex",flexDirection:"column",gap:6,width:"100%"}}>
<div style={{padding:"8px 12px",borderRadius:10,background:P.cd,border:`1px solid ${P.bd}`}}>
<div style={{fontSize:"0.52rem",color:P.gd,textAlign:"center",fontWeight:600,marginBottom:5}}>De Khadija</div>
<div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}><N n="Al-Qâsim" sub="Fils (décédé)"/><N n="Zaynab" sub="Fille aînée"/><N n="Ruqayya" sub="Épousa 'Uthmân"/><N n="Umm Kulthûm" sub="Fille"/><N n="Fâtimah" sub="Épousa 'Ali" comp/><N n="'Abdullah" sub="Fils (décédé)"/></div>
</div>
<div style={{padding:"8px 12px",borderRadius:10,background:P.cd,border:`1px solid ${P.bd}`}}>
<div style={{fontSize:"0.52rem",color:P.gd,textAlign:"center",fontWeight:600,marginBottom:5}}>De Mâriya</div>
<div style={{display:"flex",justifyContent:"center"}}><N n="Ibrâhîm" sub="Fils (décédé ~18 mois)"/></div>
</div>
</div>
</Sct><Vl/>
<Sct label="Gendres & Cousins">
<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><N n="'Ali" sub="Cousin · 4ème Calife" comp/><span style={{fontSize:"0.5rem",color:P.gd}}>∞ Fâtimah</span></div>
<N n="Ja'far" sub="Cousin · Martyr Mu'tah" comp/><N n="'Uthmân" sub="3ème Calife" comp/>
</Sct><Vl/>
<Sct label="Petits-enfants ('Ali & Fâtimah)">
<N n="Al-Hasan" sub="5ème Calife" comp/><N n="Al-Husayn" sub="Karbalâ'" comp/><N n="Zaynab bint 'Ali" sub="Héroïne"/><N n="Umm Kulthûm bint 'Ali" sub=""/>
</Sct>
</div>
</div>;})()}

{/* ═══ TAB: QUIZ ═══ */}
{tab==="quiz"&&<div style={{flex:1,overflow:"auto",padding:"20px 16px"}}>
<h2 style={{fontSize:"1.1rem",fontWeight:700,textAlign:"center",marginBottom:16}}>🃏 Quiz, Révision & Parcours</h2>

{/* Thematic journeys, FIRST */}
<h3 style={{fontSize:"0.75rem",color:P.gd,letterSpacing:2,marginBottom:10}}>📚 PARCOURS THÉMATIQUES</h3>
<p style={{fontSize:"0.78rem",color:P.ts,marginBottom:12,lineHeight:1.5}}>Relis la Sîrah sous un angle différent, chaque parcours sélectionne les chapitres liés à un thème.</p>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
{THEMES.map(th=><button key={th.id} onClick={()=>{setActiveTheme(th.id);setI(0);setTab("parcours");setFlt("all");}} style={{padding:"12px 10px",borderRadius:12,border:`1px solid ${P.bd}`,background:P.cd,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"transform 0.15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
<div style={{fontSize:"1.2rem",marginBottom:4}}>{th.icon}</div>
<div style={{fontSize:"0.78rem",fontWeight:700,color:P.tx,lineHeight:1.3,marginBottom:2}}>{th.name}</div>
<div style={{fontSize:"0.6rem",color:P.ts,lineHeight:1.4}}>{th.ids.length} chapitres</div>
</button>)}
</div>

{/* Quiz & Flashcards */}
<h3 style={{fontSize:"0.75rem",color:P.ts,letterSpacing:2,marginBottom:10}}>🧠 TESTE TES CONNAISSANCES</h3>
<div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
{/* Final quiz */}
<button onClick={()=>{setFinalQuiz(true);rstFQ();setTab("parcours");}} style={{width:"100%",padding:"16px",borderRadius:14,border:`2px solid ${P.gd}40`,background:`linear-gradient(135deg,${P.gd}10,${P.gd}03)`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:"1.5rem"}}>🏆</span><div><div style={{fontSize:"0.9rem",fontWeight:700,color:P.gd}}>Quiz Final, 49 questions</div><div style={{fontSize:"0.72rem",color:P.ts}}>Teste toute la Sîrah avec corrections détaillées</div></div></div>
</button>
{/* Flashcards */}
<button onClick={()=>{fcReset();setFcOpen(true);}} style={{width:"100%",padding:"16px",borderRadius:14,border:`1px solid ${P.bd}`,background:P.cd,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:"1.5rem"}}>🃏</span><div><div style={{fontSize:"0.9rem",fontWeight:700,color:P.tx}}>Flashcards, 40 cartes</div><div style={{fontSize:"0.72rem",color:P.ts}}>Qui suis-je, Dans quel contexte, Vrai ou Faux...</div></div></div>
</button>
</div>

{/* Progression */}
<h3 style={{fontSize:"0.75rem",color:P.ts,letterSpacing:2,marginBottom:10}}>PROGRESSION PAR PÉRIODE</h3>
{PER.map(p=>{const total=E.filter(e=>e.per===p.id).length;const done=E.filter(e=>e.per===p.id).filter(e=>readSet.has(e.id)).length;const pct2=total?Math.round(done/total*100):0;
return <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:P.cd,border:`1px solid ${P.bd}`,marginBottom:6}}>
<span style={{fontSize:"1.2rem"}}>{unlocked.has(p.id)?pct2===100?"✅":"📖":"🔒"}</span>
<div style={{flex:1}}><div style={{fontSize:"0.85rem",fontWeight:600}}>{p.icon} {p.name}</div>
<div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
<div style={{flex:1,height:4,background:P.bd,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:pct2===100?CC.life:P.gd,borderRadius:2,width:`${pct2}%`}}/></div>
<span style={{fontSize:"0.6rem",color:P.ts,minWidth:35}}>{done}/{total}</span>
</div>
</div>
</div>;})}
</div>}

{/* ═══ TAB: PROFIL ═══ */}
{tab==="profil"&&<div style={{flex:1,overflow:"auto",padding:"20px 16px"}}>
<div style={{textAlign:"center",marginBottom:20}}>
<div style={{fontSize:"2.5rem",marginBottom:6}}>🕌</div>
<h2 style={{fontSize:"1.2rem",fontWeight:700}}>{level}</h2>
<div style={{fontSize:"0.75rem",color:P.ts}}>{readSet.size}/{E.length} événements lus · {xp} XP</div>
{streak>0&&<div style={{fontSize:"0.85rem",color:"#e67e22",fontWeight:700,marginTop:4}}>🔥 {streak} jour{streak>1?"s":""} de suite</div>}
<div style={{width:200,height:6,background:P.bd,borderRadius:3,margin:"10px auto",overflow:"hidden"}}>
<div style={{height:"100%",background:P.gd,borderRadius:3,width:`${Math.min(100,(readSet.size/E.length)*100)}%`,transition:"width 0.5s"}}/></div>
</div>
{/* Storybook, prominent */}
<button onClick={()=>{setStoryBook(true);setStoryI(0);}} style={{width:"100%",padding:"16px",borderRadius:14,border:"2px solid #e65100",background:"linear-gradient(135deg,#fff3e0,#ffe0b2)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:20}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{fontSize:"2rem",background:"#e6510015",borderRadius:12,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center"}}>📖</div>
<div>
<div style={{fontSize:"0.95rem",fontWeight:700,color:"#bf360c"}}>Raconter la Sîrah aux enfants</div>
<div style={{fontSize:"0.72rem",color:"#8d6e63",lineHeight:1.4,marginTop:2}}>{kidChapters.length} histoires adaptées pour les petits, idéal pour lire le soir en famille</div>
</div>
</div>
</button>
{/* Badges */}
<h3 style={{fontSize:"0.75rem",color:P.ts,letterSpacing:2,marginBottom:10}}>🏅 BADGES ({earnedBadges.length}/{BADGES.length})</h3>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
{BADGES.map(b=><div key={b.id} style={{padding:"12px",borderRadius:12,background:b.check()?`${P.gd}10`:P.cd,border:`1px solid ${b.check()?P.gd+"40":P.bd}`,textAlign:"center",opacity:b.check()?1:0.4}}>
<div style={{fontSize:"1.5rem",marginBottom:4}}>{b.icon}</div>
<div style={{fontSize:"0.75rem",fontWeight:600,color:b.check()?P.gd:P.ts}}>{b.n}</div>
<div style={{fontSize:"0.6rem",color:P.ts}}>{b.d}</div>
</div>)}
</div>
{/* Favs */}
{favSet.size>0&&<><h3 style={{fontSize:"0.75rem",color:P.ts,letterSpacing:2,marginBottom:10}}>❤️ FAVORIS</h3>
<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:20}}>
{E.filter(e=>favSet.has(e.id)).map(e=><button key={e.id} onClick={()=>{setTab("parcours");setFinalQuiz(false);const idx=evts.findIndex(x=>x.id===e.id);if(idx>=0)go(idx);}} style={{padding:"10px 12px",borderRadius:10,background:P.cd,border:`1px solid ${P.bd}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",gap:8,alignItems:"center",color:P.tx}}>
<span style={{color:CC[e.c]}}>{CI[e.c]}</span><div><div style={{fontSize:"0.55rem",color:P.gd}}>{e.y}</div><div style={{fontSize:"0.82rem"}}>{e.t}</div></div>
</button>)}
</div></>}
{/* Settings */}
<h3 style={{fontSize:"0.75rem",color:P.ts,letterSpacing:2,marginBottom:10}}>⚙️ RÉGLAGES</h3>
<button onClick={()=>{setTutoActive(true);setTutoStep(0);setTab("parcours");}} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${P.bd}`,background:"transparent",cursor:"pointer",fontFamily:"inherit",color:P.ts,fontSize:"0.85rem"}}>❓ Revoir le tutorial</button>
</div>}

</div>

{/* ═══ STORYBOOK FOR KIDS ═══ */}
{storyBook&&(()=>{const ke=kidChapters[storyI];if(!ke)return null;
const goStory=(n)=>{setStoryI(n);setTimeout(()=>{if(stRef.current)stRef.current.scrollTop=0;},50);};
const stTS=e=>{touchRef.current={sx:e.touches[0].clientX,sy:e.touches[0].clientY};};
const stTE=e=>{const dx=e.changedTouches[0].clientX-touchRef.current.sx;if(Math.abs(dx)>60){if(dx<0&&storyI<kidChapters.length-1)goStory(storyI+1);if(dx>0&&storyI>0)goStory(storyI-1);}};
return <div style={{position:"fixed",inset:0,zIndex:900,background:"#fdf6e3",display:"flex",flexDirection:"column",fontFamily:"Georgia,serif"}} onTouchStart={stTS} onTouchEnd={stTE}>
{/* Header */}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid #e8d5b0",background:"#f5ecd4",flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<span style={{fontSize:"1.2rem"}}>📖</span>
<div><div style={{fontSize:"0.82rem",fontWeight:700,color:"#5d4037"}}>La vie du Prophète ﷺ</div>
<div style={{fontSize:"0.6rem",color:"#8d6e63"}}>Histoire {storyI+1} sur {kidChapters.length}</div></div>
</div>
<button onClick={()=>setStoryBook(false)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #d7ccc8",background:"#efebe9",cursor:"pointer",fontFamily:"inherit",fontSize:"0.78rem",color:"#5d4037"}}>← Retour</button>
</div>
{/* Progress dots */}
<div style={{display:"flex",gap:3,padding:"8px 16px",background:"#f5ecd4",flexShrink:0,justifyContent:"center"}}>
{kidChapters.map((_,j)=><div key={j} style={{width:j===storyI?16:6,height:5,borderRadius:3,background:j<=storyI?"#e65100":"#e8d5b0",transition:"all 0.3s",cursor:"pointer"}} onClick={()=>goStory(j)}/>)}
</div>
{/* Story content */}
<div ref={stRef} style={{flex:1,overflowY:"auto",padding:"20px 20px 100px"}}>
<div style={{maxWidth:540,margin:"0 auto"}}>
<div style={{textAlign:"center",marginBottom:20}}>
<div style={{fontSize:"1.8rem",marginBottom:6}}>{ke.icon||"📖"}</div>
<div style={{fontSize:"0.55rem",color:"#8d6e63",letterSpacing:2,marginBottom:6}}>CHAPITRE {storyI+1}</div>
<h1 style={{fontSize:"1.3rem",fontWeight:700,color:"#3e2723",lineHeight:1.4}}>{ke.t}</h1>
</div>
<div style={{fontSize:"1.12rem",lineHeight:2.4,color:"#4e342e",whiteSpace:"pre-line"}}>{ke.s}</div>
{/* Adhân, styled instruction in chapter 12 */}
{storyI===11&&<div style={{margin:"20px 0",padding:"20px",borderRadius:14,background:"linear-gradient(135deg,#e6510008,#e6510015)",border:"2px solid #e6510030",textAlign:"center"}}>
<div style={{fontSize:"2rem",marginBottom:8}}>🔊</div>
<div style={{fontSize:"0.95rem",color:"#bf360c",fontWeight:700,marginBottom:6}}>C'est le moment d'écouter l'adhân !</div>
<div style={{fontSize:"0.85rem",color:"#5d4037",lineHeight:1.8,marginBottom:10}}>Mets pause sur l'histoire.<br/>Ouvre YouTube ou ton appli préférée<br/>et cherche « adhân Mishary Rashid ».<br/><br/>Écoute avec ton enfant et dis-lui :<br/>« Écoute bien… c'est ça l'adhân.<br/>C'est comme ça qu'on appelle les musulmans<br/>pour la prière, depuis Bilâl. »</div>
<div style={{fontSize:"0.65rem",color:"#8d6e63",fontStyle:"italic"}}>Puis reprends l'histoire quand vous êtes prêts 🌙</div>
</div>}
{ke.cliff&&<div style={{marginTop:24,padding:"16px 18px",borderRadius:12,background:"#e6510008",border:"1px dashed #e6510040",textAlign:"center"}}>
<div style={{fontSize:"1rem",color:"#bf360c",fontStyle:"italic",lineHeight:1.8}}>{ke.cliff}</div>
</div>}
<div style={{marginTop:ke.cliff?12:24,textAlign:"center",padding:"12px",fontSize:"0.85rem",color:"#8d6e63",fontStyle:"italic"}}>Dors bien. Qu'Allah veille sur toi. Bonne nuit 🌙</div>
</div>
</div>
{/* Bottom nav */}
<div style={{display:"flex",borderTop:"1px solid #e8d5b0",background:"#f5ecd4",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
<button onClick={()=>{if(storyI>0)goStory(storyI-1);}} disabled={storyI<=0} style={{flex:1,padding:"14px",border:"none",background:"transparent",cursor:"pointer",fontSize:"1rem",color:storyI>0?"#5d4037":"#d7ccc8",fontFamily:"inherit"}}>
← Précédente
</button>
<div style={{display:"flex",alignItems:"center",justifyContent:"center",minWidth:50}}>
<span style={{fontSize:"0.8rem",color:"#e65100",fontWeight:700}}>{storyI+1}/{kidChapters.length}</span>
</div>
<button onClick={()=>{if(storyI<kidChapters.length-1)goStory(storyI+1);}} disabled={storyI>=kidChapters.length-1} style={{flex:1,padding:"14px",border:"none",background:storyI<kidChapters.length-1?"#e6510012":"transparent",cursor:"pointer",fontSize:"1rem",color:storyI<kidChapters.length-1?"#e65100":"#d7ccc8",fontFamily:"inherit",fontWeight:700}}>
Suivante →
</button>
</div>
</div>;})()}

{/* ═══ FLASHCARDS OVERLAY ═══ */}
{fcOpen&&<div style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setFcOpen(false)}>
<div style={{width:"92%",maxWidth:420,background:P.sf,borderRadius:16,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
<div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${P.bd}`}}>
<div><div style={{fontSize:"0.6rem",color:P.gd,fontWeight:700}}>🃏 FLASHCARDS</div><div style={{fontSize:"0.5rem",color:P.ts}}>✅ {fcStats.ok} · ❌ {fcStats.nok}</div></div>
<button onClick={()=>setFcOpen(false)} style={{background:"none",border:"none",color:P.ts,cursor:"pointer",fontSize:"1rem"}}>✕</button>
</div>
<div style={{height:3,background:P.bd}}><div style={{height:"100%",background:P.gd,width:`${(fcI/fcCards.length)*100}%`,transition:"width 0.3s"}}/></div>
{fcI<fcCards.length?<div style={{padding:"28px 24px",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
{!fcFlip?<><div style={{fontSize:"0.55rem",color:P.ts,letterSpacing:2,marginBottom:12}}>QUESTION {fcI+1}/{fcCards.length}</div>
<h3 style={{fontSize:"1.1rem",fontWeight:600,lineHeight:1.5,marginBottom:20}}>{fcCard?.q}</h3>
<button onClick={()=>setFcFlip(true)} style={{padding:"12px 28px",borderRadius:12,border:`1px solid ${P.gd}`,background:`${P.gd}10`,color:P.gd,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:"0.9rem"}}>Voir la réponse</button>
</>:<><div style={{fontSize:"0.55rem",color:CC.life,letterSpacing:2,marginBottom:8}}>RÉPONSE</div>
<h3 style={{fontSize:"1.15rem",fontWeight:700,color:P.gd,marginBottom:8}}>{fcCard?.a}</h3>
{fcCard?.fix&&<p style={{fontSize:"0.8rem",color:P.ts,lineHeight:1.6,marginBottom:16,maxWidth:340}}>{fcCard.fix}</p>}
<div style={{display:"flex",gap:12}}>
<button onClick={()=>fcAnswer(true)} style={{padding:"12px 28px",borderRadius:12,border:"none",background:CC.life,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✅ Je savais</button>
<button onClick={()=>fcAnswer(false)} style={{padding:"12px 28px",borderRadius:12,border:"none",background:CC.battle,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>❌ Non</button>
</div></>}
</div> :<div style={{padding:"24px",textAlign:"center"}}>
<div style={{fontSize:"2.5rem",marginBottom:8}}>{fcStats.nok===0?"🏆":"📊"}</div>
<h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:8}}>Bilan</h3>
<div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12}}>
<div><span style={{fontSize:"1.4rem",fontWeight:700,color:CC.life}}>{fcStats.ok}</span><div style={{fontSize:"0.55rem",color:P.ts}}>✅</div></div>
<div><span style={{fontSize:"1.4rem",fontWeight:700,color:CC.battle}}>{fcStats.nok}</span><div style={{fontSize:"0.55rem",color:P.ts}}>❌</div></div>
</div>
<div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
{fcStats.nok>0&&<button onClick={fcRetryFailed} style={{padding:"10px 16px",borderRadius:12,border:"none",background:CC.battle,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>🔄 Revoir ratées</button>}
<button onClick={fcReset} style={{padding:"10px 16px",borderRadius:12,border:"none",background:P.gd,color:P.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>↻ Tout refaire</button>
<button onClick={()=>setFcOpen(false)} style={{padding:"10px 16px",borderRadius:12,border:`1px solid ${P.bd}`,background:"transparent",color:P.tx,cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
</div>
</div>}
</div>
</div>}

{/* ═══ BOARD GAME MAP ═══ */}
{mapOpen&&<div style={{position:"fixed",inset:0,zIndex:800,background:P.bg,display:"flex",flexDirection:"column"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:`1px solid ${P.bd}`,background:P.sf,flexShrink:0}}>
<div><div style={{fontSize:"0.85rem",fontWeight:700,color:P.gd}}>🗺️ Parcours de la Sîrah</div><div style={{fontSize:"0.6rem",color:P.ts}}>{readSet.size}/{E.length} événements lus</div></div>
<button onClick={()=>setMapOpen(false)} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${P.bd}`,background:"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",color:P.ts}}>✕ Fermer</button>
</div>
<div style={{flex:1,overflowY:"auto",padding:"20px 0"}}>
{PER.map((p,pi)=>{const pEvts=E.filter(e=>e.per===p.id);const locked=isLocked(p.id);
return <div key={p.id} style={{marginBottom:8}}>
{/* Period header */}
<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 20px",marginBottom:8}}>
<span style={{fontSize:"1.2rem"}}>{locked?"🔒":p.icon}</span>
<div style={{flex:1}}><div style={{fontSize:"0.8rem",fontWeight:700,color:locked?P.ts:P.gd}}>{p.name}</div>
<div style={{fontSize:"0.55rem",color:P.ts}}>{pEvts.filter(e=>readSet.has(e.id)).length}/{pEvts.length} lus</div></div>
<div style={{width:60,height:4,background:P.bd,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:locked?P.bd:CC.life,borderRadius:2,width:`${pEvts.length?pEvts.filter(e=>readSet.has(e.id)).length/pEvts.length*100:0}%`}}/></div>
</div>
{/* Zigzag path */}
<div style={{position:"relative",padding:"0 20px"}}>
{pEvts.map((e,j)=>{const rd=readSet.has(e.id);const active=evts[i]?.id===e.id;const isLeft=j%2===0;
return <div key={e.id} style={{display:"flex",alignItems:"center",marginBottom:2,justifyContent:isLeft?"flex-start":"flex-end",opacity:locked?0.3:1}}>
{/* Connector line */}
{j>0&&<div style={{position:"absolute",left:isLeft?"38px":"auto",right:isLeft?"auto":"38px",marginTop:-14,width:1.5,height:14,background:rd?`${CC[e.c]}60`:P.bd}}/>}
<button onClick={()=>{if(!locked){setMapOpen(false);setTab("parcours");const idx=evts.findIndex(x=>x.id===e.id);if(idx>=0)go(idx);}}} disabled={locked}
style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderRadius:12,border:active?`2px solid ${P.gd}`:`1px solid ${rd?CC[e.c]+"40":P.bd}`,
background:active?`${P.gd}12`:rd?`${CC[e.c]}08`:P.cd,cursor:locked?"default":"pointer",fontFamily:"inherit",maxWidth:"85%",textAlign:"left",
boxShadow:active?`0 2px 12px ${P.gd}20`:"none",transition:"all 0.15s"}}>
{/* Node circle */}
<div style={{width:28,height:28,borderRadius:"50%",background:rd?CC[e.c]:`${P.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",color:rd?"#fff":P.ts,flexShrink:0,boxShadow:active?`0 0 8px ${P.gd}40`:"none"}}>
{rd?"✓":CI[e.c]}
</div>
<div style={{minWidth:0}}>
<div style={{fontSize:"0.55rem",color:rd?CC[e.c]:P.ts}}>{e.y} EC</div>
<div style={{fontSize:"0.78rem",fontWeight:active?700:500,color:active?P.gd:P.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.t}</div>
</div>
</button>
</div>;})}
</div>
</div>;})}
</div>
</div>}

{/* ═══ FAVS DROPDOWN ═══ */}
{favOpen&&<div style={{position:"fixed",top:50,right:8,zIndex:200,width:280,maxHeight:"70vh",background:P.sf,border:`1px solid ${P.bd}`,borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,0.2)",overflow:"hidden"}}>
<div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:`1px solid ${P.bd}`}}>
<span style={{fontSize:"0.65rem",color:P.gd,fontWeight:700}}>❤️ FAVORIS ({favSet.size})</span>
<button onClick={()=>setFavOpen(false)} style={{background:"none",border:"none",color:P.ts,cursor:"pointer"}}>✕</button>
</div>
<div style={{overflowY:"auto",maxHeight:"calc(70vh - 40px)"}}>
{favSet.size===0?<div style={{padding:20,textAlign:"center",color:P.ts,fontSize:"0.85rem"}}>Clique ❤️ sur un événement pour le sauvegarder.</div> :E.filter(e=>favSet.has(e.id)).map(e=><button key={e.id} onClick={()=>{setFavOpen(false);setTab("parcours");setFinalQuiz(false);const idx=evts.findIndex(x=>x.id===e.id);if(idx>=0)go(idx);}} style={{width:"100%",textAlign:"left",padding:"10px 14px",border:"none",borderBottom:`1px solid ${P.bd}40`,background:"transparent",cursor:"pointer",fontFamily:"inherit",color:P.tx,display:"flex",gap:8,alignItems:"center"}}>
<span style={{color:CC[e.c]}}>{CI[e.c]}</span><div><div style={{fontSize:"0.5rem",color:P.gd}}>{e.y}</div><div style={{fontSize:"0.82rem"}}>{e.t}</div></div>
</button>)}
</div>
</div>}

{/* ═══ MINI PROGRESS CIRCLE ═══ */}
{tab==="parcours"&&!finalQuiz&&!isLocked(ev?.per)&&<div style={{position:"fixed",bottom:110,right:12,zIndex:100,width:38,height:38,borderRadius:"50%",background:P.sf,border:`2px solid ${P.gd}40`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.15)",cursor:"pointer"}} onClick={()=>setMapOpen(true)}>
<svg width="30" height="30" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" stroke={P.bd} strokeWidth="3"/><circle cx="18" cy="18" r="15.5" fill="none" stroke={P.gd} strokeWidth="3" strokeDasharray={`${Math.round(readSet.size/E.length*97.4)} 97.4`} strokeLinecap="round" transform="rotate(-90 18 18)"/><text x="18" y="20" textAnchor="middle" fill={P.gd} fontSize="9" fontWeight="700">{Math.round(readSet.size/E.length*100)}%</text></svg>
</div>}

{/* ═══ CONFETTI ═══ */}
{confetti&&<div style={{position:"fixed",inset:0,zIndex:9999,pointerEvents:"none",overflow:"hidden"}}>
{Array.from({length:40}).map((_,j)=><div key={j} style={{
position:"absolute",left:`${Math.random()*100}%`,top:-10,
width:j%3===0?8:6,height:j%3===0?8:6,borderRadius:j%2===0?"50%":"2px",
background:["#b8860b","#c9a84c","#6a9a7e","#5a8aaa","#b85a4a","#9a7aaa","#e67e22","#fff"][j%8],
animation:`confettiFall ${1.5+Math.random()*2}s ease-in ${Math.random()*0.5}s forwards`,
transform:`rotate(${Math.random()*360}deg)`}}/>)}
<style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(${360+Math.random()*720}deg);opacity:0}}`}</style>
</div>}

{/* ═══ BOTTOM TAB BAR ═══ */}
<div style={{display:"flex",borderTop:`1px solid ${P.bd}`,background:P.sf,flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
{[["parcours","📖",t.parcours],["arbre","🌳",t.arbre],["quiz","🃏",t.quiz],["profil","👤",t.profil]].map(([k,ic,lb])=>(
<button key={k} onClick={()=>{setTab(k);setFinalQuiz(false);}} style={{flex:1,border:"none",background:"transparent",cursor:"pointer",padding:"8px 0 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"inherit"}}>
<span style={{fontSize:"1.2rem",filter:tab===k?"none":"grayscale(0.5)",opacity:tab===k?1:0.5}}>{ic}</span>
<span style={{fontSize:"0.6rem",fontWeight:tab===k?700:400,color:tab===k?P.gd:P.ts}}>{lb}</span>
</button>))}
</div>

</div>);
}
