import { useState, useRef, useCallback, useEffect } from "react";

// ── PALETA AGROSUPER ───────────────────────────────────────────────────────
const G = {
  bg:        "#06111F",
  surface:   "#0B1E35",
  card:      "#0F2644",
  border:    "#1A3D6B",
  accent:    "#E8631A",
  accentDim: "#6B2D0B",
  blue:      "#1460A8",
  blueDark:  "#0C3D72",
  blueLight: "#3B82C4",
  green:     "#22C55E",
  red:       "#EF4444",
  yellow:    "#EAB308",
  text:      "#F0F6FF",
  textMuted: "#6B8EAD",
  textSub:   "#9DBAD6",
};

// ── CIUDADES UNIDAD COMERCIAL ──────────────────────────────────────────────
const SUCURSALES = [
  "Arica","Iquique","Calama","Antofagasta","Copiapó","Coquimbo",
  "Viña del Mar","San Antonio","Hijuelas","Miraflores","Huechuraba",
  "Lo Espejo","Rancagua","Chillán","Los Ángeles","Concepción",
  "Temuco","Valdivia","Osorno","Puerto Montt","Punta Arenas",
];

// ── CONSTANTES TEST ────────────────────────────────────────────────────────
const TOTAL_ROUNDS        = 8;
const MIN_WAIT_MS         = 2000;
const MAX_WAIT_MS         = 7000;
const LAPSE_THRESHOLD     = 500;
const FALSE_START_PENALTY = 999;

// ── ESTILOS GLOBALES ───────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${G.bg};color:${G.text};font-family:'Barlow',sans-serif}
  .screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}

  /* ── HEADER BANNER ── */
  .as-header{
    width:100%;max-width:440px;
    background:linear-gradient(135deg,${G.blue} 0%,#0B3A78 100%);
    border-radius:14px 14px 0 0;
    padding:14px 18px 10px;
    display:flex;align-items:center;gap:14px;
    border:1px solid ${G.border};border-bottom:none;
    position:relative;overflow:hidden;
  }
  .as-header::after{
    content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
    background:linear-gradient(90deg,${G.accent} 0%,#F0A060 60%,transparent 100%);
  }
  /* Ilustración decorativa — siluetas simplificadas de los 3 personajes */
  .as-figures{
    position:absolute;right:12px;top:0;bottom:0;
    display:flex;align-items:flex-end;gap:4px;opacity:.18;pointer-events:none;
  }
  .fig{width:22px;border-radius:11px 11px 0 0;background:#fff}
  .fig-l{height:44px}.fig-c{height:52px}.fig-r{height:46px}

  .as-logo-oval{
    background:linear-gradient(135deg,#fff 60%,#E8EFF8);
    border-radius:26px;padding:6px 16px 9px;
    display:flex;flex-direction:column;align-items:center;
    box-shadow:0 2px 8px rgba(0,0,0,.3);flex-shrink:0;position:relative;
  }
  .as-logo-oval-text{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:15px;letter-spacing:2px;color:${G.blue};line-height:1}
  .as-swoosh{position:absolute;bottom:5px;left:12px;right:12px;height:3px;background:linear-gradient(90deg,${G.accent},transparent);border-radius:2px}

  .as-header-info{flex:1;min-width:0}
  .as-campaign{
    display:inline-flex;align-items:center;
    background:rgba(232,99,26,.15);border:1px solid rgba(232,99,26,.35);
    border-radius:4px;padding:2px 8px;
    font-family:'Barlow Condensed',sans-serif;font-weight:700;
    font-size:11px;letter-spacing:.5px;color:${G.accent};margin-bottom:3px;
  }
  .as-title-main{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:15px;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .as-sub{font-size:10px;color:rgba(255,255,255,.5);letter-spacing:1px;text-transform:uppercase;margin-top:2px}

  /* ── CARD ── */
  .card{background:${G.card};border:1px solid ${G.border};border-radius:0 0 16px 16px;padding:28px 28px 28px;width:100%;max-width:440px}
  .card-standalone{border-radius:16px}
  .card-accent-bar{height:3px;background:linear-gradient(90deg,${G.blue},${G.accent});border-radius:0 0 16px 16px;margin:24px -28px -28px}

  .title{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:30px;line-height:1.1;margin-bottom:8px}
  .subtitle{color:${G.textSub};font-size:14px;margin-bottom:22px;line-height:1.5}

  .input-group{margin-bottom:14px}
  .input-label{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${G.textMuted};margin-bottom:6px;display:block}
  .input-field{width:100%;background:${G.surface};border:1px solid ${G.border};border-radius:10px;padding:13px 15px;color:${G.text};font-family:'Barlow',sans-serif;font-size:15px;transition:border-color .2s;outline:none}
  .input-field:focus{border-color:${G.blue};box-shadow:0 0 0 2px rgba(20,96,168,.2)}
  .input-field::placeholder{color:${G.textMuted}}
  .select-field{width:100%;background:${G.surface};border:1px solid ${G.border};border-radius:10px;padding:13px 15px;color:${G.text};font-family:'Barlow',sans-serif;font-size:15px;outline:none;cursor:pointer;appearance:none}
  .select-field:focus{border-color:${G.blue}}

  .btn{width:100%;padding:15px;border:none;border-radius:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:17px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .15s}
  .btn-primary{background:linear-gradient(135deg,${G.blue},${G.blueLight});color:#fff}
  .btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 4px 16px rgba(20,96,168,.4)}
  .btn-accent{background:linear-gradient(135deg,${G.accent},#F08040);color:#fff}
  .btn-accent:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 4px 16px rgba(232,99,26,.4)}
  .btn-ghost{background:transparent;color:${G.textSub};border:1px solid ${G.border};margin-top:10px}
  .btn-ghost:hover{border-color:${G.textSub}}

  .error-msg{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;font-size:13px;color:${G.red};margin-bottom:14px}
  .step-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(20,96,168,.15);border:1px solid rgba(20,96,168,.4);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${G.blueLight};margin-bottom:18px}

  .instr-item{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px}
  .instr-num{min-width:26px;height:26px;background:rgba(232,99,26,.12);border:1px solid rgba(232,99,26,.4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;color:${G.accent};flex-shrink:0}
  .instr-text{font-size:13px;color:${G.textSub};line-height:1.5;padding-top:4px}
  .divider{border:none;border-top:1px solid ${G.border};margin:18px 0}
  .warn-box{background:rgba(20,96,168,.08);border:1px solid rgba(20,96,168,.25);border-radius:10px;padding:12px 14px;font-size:13px;color:${G.blueLight};line-height:1.5;margin-bottom:18px}

  /* ── TEST ── */
  .test-wrapper{width:100%;max-width:440px;display:flex;flex-direction:column;align-items:center;gap:0}
  .test-top{width:100%;background:${G.card};border:1px solid ${G.border};border-radius:14px 14px 0 0;padding:14px 18px 10px}
  .progress-bar-bg{background:${G.surface};border-radius:4px;height:4px;margin-top:6px}
  .progress-bar-fill{height:4px;border-radius:4px;background:linear-gradient(90deg,${G.blue},${G.accent});transition:width .3s}
  .round-label{font-size:11px;color:${G.textMuted};letter-spacing:1px;text-transform:uppercase}
  .round-num{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;color:${G.text}}

  .pvt-arena{width:100%;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border:2px solid ${G.border};border-top:none;border-bottom:none;transition:background .08s;user-select:none;-webkit-tap-highlight-color:transparent}
  .pvt-arena.waiting{background:${G.card}}
  .pvt-arena.active{background:#16A34A;border-color:#22C55E;animation:pulse-go .4s ease}
  .pvt-arena.false-start{background:#7F1D1D;border-color:${G.red}}
  .pvt-arena.result{background:#0F2A1A;border-color:#22C55E}
  @keyframes pulse-go{0%{transform:scale(1)}50%{transform:scale(1.02)}100%{transform:scale(1)}}

  .arena-icon{font-size:60px;margin-bottom:10px}
  .arena-main-text{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:34px;text-align:center}
  .arena-sub-text{font-size:13px;color:${G.textSub};text-align:center;margin-top:6px}
  .arena-ms{font-family:'Barlow Condensed',sans-serif;font-size:68px;font-weight:900;color:${G.green};line-height:1}
  .arena-ms-label{font-size:16px;color:${G.textSub};letter-spacing:2px}

  .mini-stats{display:grid;grid-template-columns:1fr 1fr 1fr;width:100%;border:1px solid ${G.border};border-top:none;border-radius:0 0 14px 14px;overflow:hidden}
  .mini-stat{background:${G.card};padding:10px;text-align:center;border-right:1px solid ${G.border}}
  .mini-stat:last-child{border-right:none}
  .mini-stat-val{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:${G.text}}
  .mini-stat-lbl{font-size:10px;color:${G.textMuted};letter-spacing:1px;text-transform:uppercase;margin-top:2px}

  /* ── RESULTADOS ── */
  .score-circle{width:130px;height:130px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 20px;border:4px solid}
  .score-num{font-family:'Barlow Condensed',sans-serif;font-size:50px;font-weight:900;line-height:1}
  .score-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:2px}

  .result-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid ${G.border}}
  .result-row:last-child{border:none}
  .result-key{font-size:13px;color:${G.textSub}}
  .result-val{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700}

  .status-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}
  .pill-ok{background:rgba(34,197,94,.10);color:${G.green};border:1px solid rgba(34,197,94,.3)}
  .pill-warn{background:rgba(234,179,8,.10);color:${G.yellow};border:1px solid rgba(234,179,8,.3)}
  .pill-alert{background:rgba(239,68,68,.10);color:${G.red};border:1px solid rgba(239,68,68,.3)}

  .recom-box{border-radius:10px;padding:13px;font-size:13px;line-height:1.6;margin-top:14px}
  .recom-ok{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2);color:#86EFAC}
  .recom-warn{background:rgba(234,179,8,.06);border:1px solid rgba(234,179,8,.2);color:#FDE047}
  .recom-alert{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);color:#FCA5A5}

  .hist-dots{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
  .hist-dot{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
`;

// ── UTILIDADES ─────────────────────────────────────────────────────────────
function formatRut(raw){
  const c=raw.replace(/[^0-9kK]/g,"").toUpperCase();
  if(c.length<2)return c;
  return c.slice(0,-1).replace(/\B(?=(\d{3})+(?!\d))/g,".")+"-"+c.slice(-1);
}
function validateRut(rut){
  const c=rut.replace(/[.\-]/g,"").toUpperCase();
  if(c.length<2)return false;
  const dv=c.slice(-1),num=parseInt(c.slice(0,-1),10);
  if(isNaN(num))return false;
  let s=0,m=2;
  for(let i=String(num).length-1;i>=0;i--){s+=parseInt(String(num)[i])*m;m=m<7?m+1:2}
  const e=11-(s%11),d=e===11?"0":e===10?"K":String(e);
  return dv===d;
}
function calcFatigue(times){
  const v=times.filter(t=>t!==FALSE_START_PENALTY);
  if(!v.length)return{score:100,level:"ALERTA"};
  const mean=v.reduce((a,b)=>a+b,0)/v.length;
  const lapses=v.filter(t=>t>=LAPSE_THRESHOLD).length;
  const fs=times.filter(t=>t===FALSE_START_PENALTY).length;
  const total=Math.min(100,Math.round(Math.max(0,(mean-200)/3)+lapses*15+fs*10));
  return{score:total,mean:Math.round(mean),lapses,falseStarts:fs,level:total<30?"APTO":total<60?"PRECAUCIÓN":"ALERTA"};
}

// ── HEADER BANNER AGROSUPER ────────────────────────────────────────────────
// Para usar la imagen real: reemplaza el prop `imgSrc` con la URL de tu imagen
// subida a GitHub (ej: "https://tu-usuario.github.io/test-fatiga/banner.png")
function AgroHeader({ imgSrc = null }) {
  return (
    <div className="as-header" style={{ maxWidth: 440, width: "100%" }}>
      {/* Siluetas decorativas (se ocultan si hay imagen real) */}
      {!imgSrc && (
        <div className="as-figures">
          <div className="fig fig-l" />
          <div className="fig fig-c" />
          <div className="fig fig-r" />
        </div>
      )}

      {/* Si se provee imagen real, se muestra en miniatura */}
      {imgSrc ? (
        <img src={imgSrc} alt="Agrosuper" style={{height:52,width:"auto",borderRadius:8,flexShrink:0,objectFit:"contain"}} />
      ) : (
        <div className="as-logo-oval">
          <span className="as-logo-oval-text">AGROSUPER</span>
          <div className="as-swoosh" />
        </div>
      )}

      <div className="as-header-info">
        <div className="as-campaign">#MisiónRiesgoCero</div>
        <div className="as-title-main">Monitor de Fatiga Operacional</div>
        <div className="as-sub">Unidad Comercial</div>
      </div>
    </div>
  );
}

// ── PANTALLA 1: REGISTRO ───────────────────────────────────────────────────
function ScreenRegistro({ onNext }) {
  const [rut,setRut]=useState(""),
        [nombre,setNombre]=useState(""),
        [sucursal,setSucursal]=useState(""),
        [turno,setTurno]=useState(""),
        [error,setError]=useState("");

  const handleRut=e=>{const f=formatRut(e.target.value);if(f.length<=12)setRut(f)};
  const submit=()=>{
    if(!nombre.trim())return setError("Ingresa tu nombre completo.");
    if(!validateRut(rut))return setError("RUT inválido. Ejemplo correcto: 12.345.678-9");
    if(!sucursal)return setError("Selecciona tu sucursal.");
    if(!turno)return setError("Selecciona el turno actual.");
    setError("");onNext({rut,nombre:nombre.trim(),sucursal,turno});
  };

  return(
    <div className="screen">
      <style>{css}</style>
      <AgroHeader imgSrc="/test-fatiga-agrosuper/banner.png" />
      <div className="card">
        <div className="step-badge">📋 Paso 1 de 3 — Identificación</div>
        <div className="title">Registro del<br/>Operador</div>
        <div className="subtitle">Completa tus datos para iniciar la evaluación.</div>
        {error&&<div className="error-msg">⚠ {error}</div>}
        <div className="input-group">
          <label className="input-label">Nombre Completo</label>
          <input className="input-field" placeholder="Ej: Juan Pérez González" value={nombre} onChange={e=>setNombre(e.target.value)}/>
        </div>
        <div className="input-group">
          <label className="input-label">RUT</label>
          <input className="input-field" placeholder="12.345.678-9" value={rut} onChange={handleRut} inputMode="numeric"/>
        </div>
        <div className="input-group">
          <label className="input-label">Sucursal</label>
          <select className="select-field" value={sucursal} onChange={e=>setSucursal(e.target.value)}>
            <option value="">— Seleccionar ciudad —</option>
            {SUCURSALES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-group" style={{marginBottom:22}}>
          <label className="input-label">Turno Actual</label>
          <select className="select-field" value={turno} onChange={e=>setTurno(e.target.value)}>
            <option value="">— Seleccionar —</option>
            <option value="Mañana (06:00–14:00)">Mañana (06:00–14:00)</option>
            <option value="Tarde (14:00–22:00)">Tarde (14:00–22:00)</option>
            <option value="Noche (22:00–06:00)">Noche (22:00–06:00)</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={submit}>Continuar →</button>
        <div className="card-accent-bar"/>
      </div>
    </div>
  );
}

// ── PANTALLA 2: INSTRUCCIONES ──────────────────────────────────────────────
function ScreenInstrucciones({ operador, onStart }) {
  const instrs=[
    "Verás un rectángulo gris en pantalla. Mantén el dedo listo sobre la pantalla o el mouse.",
    `Cuando cambie a <strong style="color:${G.green}">color verde</strong>, presiona lo más rápido posible.`,
    `Se medirá tu tiempo de reacción en milisegundos. El test se repite <strong>${TOTAL_ROUNDS} veces</strong>.`,
    `<strong style="color:${G.red}">No presiones antes</strong> de que cambie el color o se registrará como salida falsa.`,
  ];
  return(
    <div className="screen">
      <style>{css}</style>
      <AgroHeader/>
      <div className="card">
        <div className="step-badge">📖 Paso 2 de 3 — Instrucciones</div>
        <div className="title">Test de<br/>Vigilancia PVT</div>
        <div className="subtitle">Hola <strong style={{color:G.accent}}>{operador.nombre.split(" ")[0]}</strong>, lee con atención antes de comenzar.</div>
        {instrs.map((t,i)=>(
          <div className="instr-item" key={i}>
            <div className="instr-num">{i+1}</div>
            <div className="instr-text" dangerouslySetInnerHTML={{__html:t}}/>
          </div>
        ))}
        <hr className="divider"/>
        <div className="warn-box">
          🛡️ <strong>#MisiónRiesgoCero:</strong> Esta evaluación forma parte del compromiso de Agrosuper con la seguridad de su gente. Los resultados son confidenciales y se utilizan exclusivamente para proteger tu bienestar y el de tu equipo.
        </div>
        <button className="btn btn-accent" onClick={onStart}>Iniciar Evaluación →</button>
        <div className="card-accent-bar"/>
      </div>
    </div>
  );
}

// ── PANTALLA 3: TEST PVT ───────────────────────────────────────────────────
function ScreenTest({ onFinish }) {
  const [phase,setPhase]=useState("waiting"),
        [round,setRound]=useState(1),
        [lastMs,setLastMs]=useState(null),
        [times,setTimes]=useState([]),
        [countdown,setCountdown]=useState(null);
  const startTime=useRef(null),timer=useRef(null),countRef=useRef(null);

  const schedule=useCallback(()=>{
    setPhase("waiting");setLastMs(null);
    const wait=MIN_WAIT_MS+Math.random()*(MAX_WAIT_MS-MIN_WAIT_MS);
    let rem=Math.ceil(wait/1000);setCountdown(rem);
    countRef.current=setInterval(()=>{rem--;setCountdown(rem>0?rem:null);if(rem<=0)clearInterval(countRef.current)},1000);
    timer.current=setTimeout(()=>{setPhase("active");startTime.current=performance.now()},wait);
  },[]);

  useEffect(()=>{schedule();return()=>{clearTimeout(timer.current);clearInterval(countRef.current)}},[round]);

  const press=()=>{
    if(phase==="waiting"){
      clearTimeout(timer.current);clearInterval(countRef.current);
      setPhase("false-start");
      const nt=[...times,FALSE_START_PENALTY];setTimes(nt);
      setTimeout(()=>adv(nt),1400);
    }else if(phase==="active"){
      const rt=Math.round(performance.now()-startTime.current);
      setLastMs(rt);setPhase("result");
      const nt=[...times,rt];setTimes(nt);
      setTimeout(()=>adv(nt),1400);
    }
  };
  const adv=t=>round>=TOTAL_ROUNDS?onFinish(t):setRound(r=>r+1);
  const vt=times.filter(t=>t!==FALSE_START_PENALTY);
  const avg=vt.length?Math.round(vt.reduce((a,b)=>a+b,0)/vt.length):null;

  return(
    <div className="screen">
      <style>{css}</style>
      <div className="test-wrapper">
        <div className="test-top">
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span className="round-label">Ronda</span>
            <span className="round-label">{avg?`Promedio: ${avg}ms`:"—"}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span className="round-num">{round} / {TOTAL_ROUNDS}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width:`${((round-1)/TOTAL_ROUNDS)*100}%`}}/>
          </div>
        </div>

        <div className={`pvt-arena ${phase==="active"?"active":phase==="false-start"?"false-start":phase==="result"?"result":"waiting"}`} onClick={press}>
          {phase==="waiting"&&<><div className="arena-icon">👁</div><div className="arena-main-text" style={{color:G.textSub}}>ESPERA...</div>{countdown&&<div className="arena-sub-text">~{countdown}s</div>}<div className="arena-sub-text" style={{marginTop:16,fontSize:12,color:G.textMuted}}>No presiones todavía</div></>}
          {phase==="active"&&<><div className="arena-icon">🟢</div><div className="arena-main-text" style={{color:"#fff"}}>¡AHORA!</div><div className="arena-sub-text">Presiona ya</div></>}
          {phase==="false-start"&&<><div className="arena-icon">🚫</div><div className="arena-main-text" style={{color:G.red}}>SALIDA FALSA</div><div className="arena-sub-text">Espera el color verde</div></>}
          {phase==="result"&&<><div className="arena-ms">{lastMs}</div><div className="arena-ms-label">MILISEGUNDOS</div><div className="arena-sub-text" style={{marginTop:10}}>{lastMs<250?"⚡ Excelente":lastMs<350?"✅ Bueno":lastMs<500?"⚠ Lento":"🔴 Lapso detectado"}</div></>}
        </div>

        <div className="mini-stats">
          <div className="mini-stat"><div className="mini-stat-val">{vt.length}</div><div className="mini-stat-lbl">Válidas</div></div>
          <div className="mini-stat"><div className="mini-stat-val" style={{color:G.yellow}}>{times.filter(t=>t>=LAPSE_THRESHOLD&&t!==FALSE_START_PENALTY).length}</div><div className="mini-stat-lbl">Lapsos</div></div>
          <div className="mini-stat"><div className="mini-stat-val" style={{color:G.red}}>{times.filter(t=>t===FALSE_START_PENALTY).length}</div><div className="mini-stat-lbl">F. Salidas</div></div>
        </div>
      </div>
    </div>
  );
}

// ── PANTALLA 4: RESULTADOS ─────────────────────────────────────────────────
function ScreenResultados({ operador, times, onReset }) {
  const {score,mean,lapses,falseStarts,level}=calcFatigue(times);
  const cc=level==="APTO"?G.green:level==="PRECAUCIÓN"?G.yellow:G.red;
  const rc=level==="APTO"?"recom-ok":level==="PRECAUCIÓN"?"recom-warn":"recom-alert";
  const pc=level==="APTO"?"pill-ok":level==="PRECAUCIÓN"?"pill-warn":"pill-alert";
  const reco=level==="APTO"
    ?"✅ Operador con tiempos de reacción normales. Apto para operar equipos en este turno."
    :level==="PRECAUCIÓN"
    ?"⚠️ Indicadores moderados de fatiga. Se recomienda supervisión activa y reevaluar en 2 horas."
    :"🚨 Niveles significativos de fatiga. Retirar al operador de la conducción y notificar al Supervisor de Turno de inmediato.";
  const dotColor=t=>t===FALSE_START_PENALTY?G.red:t>=500?G.red:t>=350?G.yellow:G.green;
  const ts=new Date().toLocaleString("es-CL",{dateStyle:"short",timeStyle:"short"});

  return(
    <div className="screen" style={{paddingTop:36,paddingBottom:36}}>
      <style>{css}</style>
      <AgroHeader/>
      <div className="card">
        <div className="step-badge">📊 Resultado — {ts}</div>
        <div style={{textAlign:"center",marginBottom:4}}>
          <div style={{fontSize:13,color:G.textMuted,marginBottom:3}}>{operador.nombre} · {operador.rut}</div>
          <div style={{fontSize:12,color:G.textMuted}}>Sucursal {operador.sucursal} · {operador.turno}</div>
        </div>

        <div className="score-circle" style={{borderColor:cc,background:`${cc}18`,marginTop:18}}>
          <div className="score-num" style={{color:cc}}>{score}</div>
          <div className="score-label" style={{color:cc}}>Índice Fatiga</div>
        </div>

        <div style={{textAlign:"center",marginBottom:18}}>
          <span className={`status-pill ${pc}`}>
            {level==="APTO"?"✅":level==="PRECAUCIÓN"?"⚠️":"🚨"} {level}
          </span>
        </div>

        {[
          ["Tiempo promedio",`${mean} ms`,G.text],
          ["Mejor tiempo",`${Math.min(...times.filter(t=>t!==FALSE_START_PENALTY))} ms`,G.green],
          ["Lapsos (>500ms)",lapses,lapses>0?G.yellow:G.textMuted],
          ["Salidas falsas",falseStarts,falseStarts>0?G.red:G.textMuted],
        ].map(([k,v,c])=>(
          <div className="result-row" key={k}>
            <span className="result-key">{k}</span>
            <span className="result-val" style={{color:c}}>{v}</span>
          </div>
        ))}

        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:G.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>Historial de rondas</div>
          <div className="hist-dots">
            {times.map((t,i)=>(
              <div key={i} className="hist-dot" style={{background:`${dotColor(t)}22`,border:`1px solid ${dotColor(t)}55`,color:dotColor(t)}}>
                {t===FALSE_START_PENALTY?"FS":t>999?"999":t}
              </div>
            ))}
          </div>
        </div>

        <div className={`recom-box ${rc}`}>{reco}</div>

        <button className="btn btn-primary" style={{marginTop:18}} onClick={onReset}>Nueva Evaluación</button>
        <button className="btn btn-ghost" onClick={()=>{
          const d={...operador,score,mean,lapses,falseStarts,level,times,timestamp:ts};
          alert("📋 Datos listos para SharePoint / Power BI:\n\n"+JSON.stringify(d,null,2));
        }}>Ver datos JSON (API)</button>
        <div className="card-accent-bar"/>
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App(){
  const [step,setStep]=useState("registro"),
        [operador,setOperador]=useState(null),
        [times,setTimes]=useState([]);
  if(step==="registro")   return <ScreenRegistro onNext={d=>{setOperador(d);setStep("instrucciones")}}/>;
  if(step==="instrucciones") return <ScreenInstrucciones operador={operador} onStart={()=>setStep("test")}/>;
  if(step==="test")       return <ScreenTest onFinish={t=>{setTimes(t);setStep("resultado")}}/>;
  if(step==="resultado")  return <ScreenResultados operador={operador} times={times} onReset={()=>{setOperador(null);setTimes([]);setStep("registro")}}/>;
}