"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = typeof window !== "undefined" ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
) : null;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAlerta, setShowNewAlerta] = useState(false);
  const [newAlerta, setNewAlerta] = useState({ modelo:"", precio_max:"", km_max:"", anyo_min:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      setUser(session.user);
      const { data } = await supabase.from("alertas_usuario").select("*").eq("user_id", session.user.id).eq("activa", true);
      setAlertas(data || []);
      setLoading(false);
    };
    getUser();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const crearAlerta = async () => {
    if (!newAlerta.modelo) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("alertas_usuario").insert({
      user_id: session.user.id,
      modelo: newAlerta.modelo,
      precio_max: newAlerta.precio_max ? Number(newAlerta.precio_max) : null,
      km_max: newAlerta.km_max ? Number(newAlerta.km_max) : null,
      anyo_min: newAlerta.anyo_min ? Number(newAlerta.anyo_min) : null,
      activa: true,
    });
    const { data } = await supabase.from("alertas_usuario").select("*").eq("user_id", session.user.id).eq("activa", true);
    setAlertas(data || []);
    setShowNewAlerta(false);
    setNewAlerta({ modelo:"", precio_max:"", km_max:"", anyo_min:"" });
    setSaving(false);
  };

  const borrarAlerta = async (id) => {
    await supabase.from("alertas_usuario").update({ activa: false }).eq("id", id);
    setAlertas(alertas.filter(a => a.id !== id));
  };

  if (loading) return (
    <main style={S.main}>
      <div style={S.loadWrap}>
        <div style={S.spinner} />
        <p style={{color:"#555", fontSize:14}}>Cargando tu panel…</p>
      </div>
    </main>
  );

  const esPremium = user?.user_metadata?.plan === "premium";
  const emailCorto = user?.email?.split("@")[0];

  return (
    <main style={S.main}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={S.nav}>
        <a href="/" style={S.logo}><span style={S.acc}>Car</span>Finder</a>
        <div style={S.navRight}>
          <a href="/" style={S.navLink}>Buscador</a>
          <button onClick={cerrarSesion} style={S.navBtn}>Salir</button>
        </div>
      </nav>

      <div style={S.wrap}>

        {/* HERO BIENVENIDA */}
        <div style={S.heroWrap}>
          <div style={S.heroLeft}>
            <div style={S.avatar}>{emailCorto?.[0]?.toUpperCase()}</div>
            <div>
              <p style={S.hola}>Hola, <strong>{emailCorto}</strong> 👋</p>
              <div style={S.planBadge}>
                <span style={{...S.planDot, background: esPremium ? "#22C55E" : "#555"}} />
                {esPremium ? "Plan Premium" : "Plan Gratuito"}
              </div>
            </div>
          </div>
          {!esPremium && (
            <a href="/precios" style={S.upgradBtn}>
              ⚡ Mejorar a Premium — 2,99€/mes
            </a>
          )}
        </div>

        <div style={S.grid}>

          {/* ALERTAS */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div>
                <p style={S.cardTitle}>🔔 Mis alertas</p>
                <p style={S.cardSub}>Te avisamos por email cuando aparezca un chollo</p>
              </div>
              {alertas.length < (esPremium ? 3 : 0) && (
                <button onClick={() => setShowNewAlerta(true)} style={S.addBtn}>+ Nueva</button>
              )}
            </div>

            {!esPremium ? (
              <div style={S.lockedBox}>
                <p style={S.lockedIcon}>🔒</p>
                <p style={S.lockedTitle}>Función Premium</p>
                <p style={S.lockedSub}>Las alertas por email están disponibles en el plan Premium.</p>
                <a href="/precios" style={S.lockedBtn}>Ver planes →</a>
              </div>
            ) : alertas.length === 0 ? (
              <div style={S.emptyBox}>
                <p style={S.emptyIcon}>🔔</p>
                <p style={S.emptyTitle}>Sin alertas activas</p>
                <p style={S.emptySub}>Crea una alerta y te avisamos cuando aparezca el coche que buscas.</p>
                <button onClick={() => setShowNewAlerta(true)} style={S.emptyBtn}>Crear primera alerta →</button>
              </div>
            ) : (
              <div style={S.alertasList}>
                {alertas.map(a => (
                  <div key={a.id} style={S.alertaItem}>
                    <div>
                      <p style={S.alertaTitle}>{a.modelo}</p>
                      <p style={S.alertaMeta}>
                        {a.precio_max && `Máx. ${a.precio_max.toLocaleString("es-ES")}€`}
                        {a.km_max && ` · Máx. ${a.km_max.toLocaleString("es-ES")} km`}
                        {a.anyo_min && ` · Desde ${a.anyo_min}`}
                      </p>
                    </div>
                    <button onClick={() => borrarAlerta(a.id)} style={S.deleteBtn}>Borrar</button>
                  </div>
                ))}
              </div>
            )}

            {/* FORMULARIO NUEVA ALERTA */}
            {showNewAlerta && (
              <div style={S.newAlertaForm}>
                <p style={S.formTitle}>Nueva alerta</p>
                <label style={S.label}>Modelo *</label>
                <input value={newAlerta.modelo} onChange={e => setNewAlerta({...newAlerta, modelo:e.target.value})} placeholder="Golf GTI, León FR…" style={S.input} />
                <div style={S.row3}>
                  <div>
                    <label style={S.label}>Precio máx.</label>
                    <input type="number" value={newAlerta.precio_max} onChange={e => setNewAlerta({...newAlerta, precio_max:e.target.value})} placeholder="10000" style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Km máx.</label>
                    <input type="number" value={newAlerta.km_max} onChange={e => setNewAlerta({...newAlerta, km_max:e.target.value})} placeholder="150000" style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Año mín.</label>
                    <input type="number" value={newAlerta.anyo_min} onChange={e => setNewAlerta({...newAlerta, anyo_min:e.target.value})} placeholder="2015" style={S.input} />
                  </div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button onClick={crearAlerta} disabled={saving} style={S.saveBtn}>{saving ? "Guardando…" : "Guardar alerta"}</button>
                  <button onClick={() => setShowNewAlerta(false)} style={S.cancelBtn}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* MI PLAN */}
          <div style={S.card}>
            <p style={S.cardTitle}>⭐ Mi plan</p>
            <p style={S.cardSub}>Estado actual de tu suscripción</p>

            <div style={S.planCard}>
              <div style={S.planHeader}>
                <span style={S.planName}>{esPremium ? "Premium" : "Gratuito"}</span>
                <span style={{...S.planStatus, background: esPremium ? "#052E16", color:"#22C55E", border:"1px solid #22C55E44"}}>Activo</span>
              </div>
              <ul style={S.planFeatures}>
                {esPremium ? [
                  "✅ Resultados ilimitados",
                  "✅ Alertas por email (hasta 3)",
                  "✅ Búsquedas guardadas",
                  "✅ Historial 30 días",
                ] : [
                  "✅ Búsquedas ilimitadas",
                  "✅ Hasta 5 resultados",
                  "❌ Alertas por email",
                  "❌ Resultados ilimitados",
                ].map((f, i) => <li key={i} style={S.planFeature}>{f}</li>)}
              </ul>
              {!esPremium && (
                <a href="/precios" style={S.planUpgrade}>Ver plan Premium →</a>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

const A = "#22C55E";
const S = {
  main:{minHeight:"100vh", background:"#050505", color:"#F5F5F5", fontFamily:"'Inter',sans-serif"},
  loadWrap:{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", gap:16},
  spinner:{width:32, height:32, border:"2px solid #1A1A1A", borderTopColor:A, borderRadius:"50%", animation:"spin 0.8s linear infinite"},

  nav:{borderBottom:"1px solid #1A1A1A", padding:"0 1.5rem", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"rgba(5,5,5,0.95)", backdropFilter:"blur(10px)", zIndex:100},
  logo:{fontWeight:800, fontSize:18, textDecoration:"none", color:"#F5F5F5"},
  acc:{color:A},
  navRight:{display:"flex", alignItems:"center", gap:12},
  navLink:{fontSize:13, color:"#888", textDecoration:"none"},
  navBtn:{background:"transparent", border:"1px solid #1A1A1A", color:"#888", fontSize:13, padding:"7px 14px", borderRadius:8, cursor:"pointer", fontFamily:"'Inter',sans-serif"},

  wrap:{maxWidth:900, margin:"0 auto", padding:"2.5rem 1.5rem 5rem"},

  heroWrap:{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:16},
  heroLeft:{display:"flex", alignItems:"center", gap:14},
  avatar:{width:46, height:46, borderRadius:"50%", background:"#1A1A1A", border:`2px solid ${A}44`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:18, color:A},
  hola:{fontSize:18, fontWeight:600, marginBottom:4},
  planBadge:{display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"#888"},
  planDot:{width:6, height:6, borderRadius:"50%", display:"inline-block"},
  upgradBtn:{background:A, color:"#000", textDecoration:"none", fontSize:13, fontWeight:700, padding:"10px 18px", borderRadius:10},

  grid:{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16},
  card:{background:"#0D0D0D", border:"1px solid #1A1A1A", borderRadius:16, padding:"1.5rem"},
  cardHeader:{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.25rem"},
  cardTitle:{fontWeight:700, fontSize:15, marginBottom:4},
  cardSub:{fontSize:12, color:"#555"},
  addBtn:{background:"transparent", border:`1px solid ${A}44`, color:A, fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap"},

  lockedBox:{textAlign:"center", padding:"2rem 1rem"},
  lockedIcon:{fontSize:32, marginBottom:10},
  lockedTitle:{fontWeight:700, fontSize:15, marginBottom:6},
  lockedSub:{fontSize:13, color:"#555", marginBottom:16, lineHeight:1.5},
  lockedBtn:{display:"inline-block", background:A, color:"#000", textDecoration:"none", fontSize:13, fontWeight:700, padding:"10px 18px", borderRadius:10},

  emptyBox:{textAlign:"center", padding:"2rem 1rem"},
  emptyIcon:{fontSize:32, marginBottom:10},
  emptyTitle:{fontWeight:700, fontSize:15, marginBottom:6},
  emptySub:{fontSize:13, color:"#555", marginBottom:16, lineHeight:1.5},
  emptyBtn:{background:"transparent", border:`1px solid ${A}`, color:A, fontSize:13, fontWeight:600, padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"'Inter',sans-serif"},

  alertasList:{display:"flex", flexDirection:"column", gap:8},
  alertaItem:{display:"flex", alignItems:"center", justifyContent:"space-between", background:"#111", border:"1px solid #1A1A1A", borderRadius:10, padding:"12px 14px"},
  alertaTitle:{fontWeight:600, fontSize:14, marginBottom:2},
  alertaMeta:{fontSize:11, color:"#555"},
  deleteBtn:{background:"transparent", border:"1px solid #2A2A2A", color:"#555", fontSize:11, padding:"5px 10px", borderRadius:6, cursor:"pointer", fontFamily:"'Inter',sans-serif"},

  newAlertaForm:{marginTop:"1.25rem", background:"#111", border:"1px solid #1A1A1A", borderRadius:12, padding:"1.25rem"},
  formTitle:{fontWeight:600, fontSize:14, marginBottom:"1rem"},
  label:{fontSize:10, color:"#555", display:"block", marginBottom:5, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em"},
  input:{width:"100%", background:"#1A1A1A", border:"1px solid #222", borderRadius:8, padding:"10px 12px", color:"#F5F5F5", fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box", marginBottom:10},
  row3:{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10},
  saveBtn:{background:A, color:"#000", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif"},
  cancelBtn:{background:"transparent", border:"1px solid #1A1A1A", color:"#888", borderRadius:8, padding:"10px 16px", fontSize:13, cursor:"pointer", fontFamily:"'Inter',sans-serif"},

  planCard:{background:"#111", border:"1px solid #1A1A1A", borderRadius:12, padding:"1.25rem"},
  planHeader:{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem"},
  planName:{fontWeight:700, fontSize:16},
  planStatus:{fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99},
  planFeatures:{listStyle:"none", padding:0, margin:"0 0 1rem", display:"flex", flexDirection:"column", gap:8},
  planFeature:{fontSize:13, color:"#AAA"},
  planUpgrade:{display:"block", textAlign:"center", background:A, color:"#000", textDecoration:"none", fontSize:13, fontWeight:700, padding:"12px", borderRadius:10},
};
