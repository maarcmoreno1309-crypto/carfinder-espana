"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lospwfebkykzfxwhuqzl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvc3B3ZmVia3lremZ4d2h1cXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTIyODksImV4cCI6MjA5NjU2ODI4OX0.WjcVbGKhhlhei1oRkcf3uI-EKpUKl6bdiRqWjvaOam4";
const supabase = typeof window !== "undefined" ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function Precios() {
  const [anual, setAnual] = useState(false);
  const [pagando, setPagando] = useState(false);

  const handlePago = async () => {
    if (!supabase || pagando) return;
    setPagando(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, email: session.user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setPagando(false);
    } catch(e) {
      setPagando(false);
    }
  };

  return (
    <main style={S.main}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <nav style={S.nav}>
        <a href="/" style={S.logo}><span style={S.acc}>Car</span>Finder</a>
        <a href="/login" style={S.navBtn}>Entrar</a>
      </nav>
      <section style={S.hero}>
        <p style={S.eye}>PLANES</p>
        <h1 style={S.title}>Simple y sin sorpresas</h1>
        <p style={S.sub}>Empieza gratis. Paga solo si quieres alertas.</p>
        <div style={S.toggle}>
          <span style={{...S.tOpt, color:!anual?"#F5F5F5":"#555"}} onClick={() => setAnual(false)}>Mensual</span>
          <div style={S.tTrack} onClick={() => setAnual(!anual)}>
            <div style={{...S.tThumb, transform:anual?"translateX(20px)":"translateX(2px)"}}/>
          </div>
          <span style={{...S.tOpt, color:anual?"#F5F5F5":"#555"}} onClick={() => setAnual(true)}>
            Anual <span style={S.save}>-20%</span>
          </span>
        </div>
      </section>
      <section style={S.plans}>
        <div style={S.card}>
          <p style={S.planLabel}>GRATUITO</p>
          <div style={S.priceRow}>
            <span style={S.price}>0€</span>
            <span style={S.period}>/mes</span>
          </div>
          <p style={S.planSub}>Para buscar sin límites</p>
          <hr style={S.hr}/>
          <ul style={S.features}>
            <li style={S.feat}>✅ Búsquedas ilimitadas</li>
            <li style={S.feat}>✅ Resultados ilimitados</li>
            <li style={S.feat}>✅ Verificación IA de cada anuncio</li>
            <li style={{...S.feat, color:"#444"}}>❌ Alertas por email</li>
          </ul>
          <a href="/" style={{...S.btn, ...S.btnFree}}>Empezar gratis</a>
        </div>
        <div style={{...S.card, ...S.cardPro}}>
          <div style={S.badge}>MÁS POPULAR</div>
          <p style={S.planLabel}>PREMIUM</p>
          <div style={S.priceRow}>
            <span style={{...S.price, color:"#22C55E"}}>{anual ? "2,39€" : "2,99€"}</span>
            <span style={S.period}>/mes</span>
          </div>
          <p style={S.planSub}>{anual ? "Facturado anualmente · 28,70€/año" : "Facturado mensualmente"}</p>
          <hr style={S.hr}/>
          <ul style={S.features}>
            <li style={S.feat}>✅ Búsquedas ilimitadas</li>
            <li style={S.feat}>✅ Resultados ilimitados</li>
            <li style={S.feat}>✅ Verificación IA de cada anuncio</li>
            <li style={{...S.feat, color:"#22C55E", fontWeight:500}}>✅ Alertas por email (hasta 3)</li>
          </ul>
          <button onClick={handlePago} disabled={pagando} style={{...S.btn, border:"none", cursor: pagando ? "not-allowed" : "pointer", opacity: pagando ? 0.7 : 1}}>
            {pagando ? "Procesando…" : `Empezar por ${anual ? "2,39€" : "2,99€"}/mes →`}
          </button>
          <p style={S.cancel}>Cancela cuando quieras · Sin permanencia</p>
        </div>
      </section>
      <section style={S.faq}>
        <h2 style={S.faqTitle}>Preguntas frecuentes</h2>
        {[
          { q:"¿Puedo cancelar cuando quiera?", a:"Sí, sin permanencia. Cancelas y no se vuelve a cobrar." },
          { q:"¿Cómo funcionan las alertas?", a:"Defines tu búsqueda y te avisamos por email cuando aparece un anuncio que encaja." },
          { q:"¿Qué métodos de pago aceptáis?", a:"Tarjeta de crédito o débito a través de Stripe." },
        ].map((f,i) => (
          <div key={i} style={S.faqItem}>
            <p style={S.faqQ}>{f.q}</p>
            <p style={S.faqA}>{f.a}</p>
          </div>
        ))}
      </section>
      <footer style={S.footer}>
        <a href="/" style={S.footerLogo}><span style={S.acc}>Car</span>Finder</a>
        <span style={S.footerMeta}>Sin publicidad · Sin trampa</span>
      </footer>
    </main>
  );
}

const A = "#22C55E";
const S = {
  main:{minHeight:"100vh",background:"#050505",color:"#F5F5F5",fontFamily:"'Inter',sans-serif"},
  nav:{borderBottom:"1px solid #1A1A1A",padding:"0 1rem",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{fontWeight:800,fontSize:18,textDecoration:"none",color:"#F5F5F5"},
  acc:{color:A},
  navBtn:{fontSize:13,color:"#F5F5F5",textDecoration:"none",border:"1px solid #1A1A1A",padding:"7px 14px",borderRadius:8},
  hero:{textAlign:"center",padding:"4rem 1rem 2rem"},
  eye:{fontSize:11,letterSpacing:"0.15em",color:"#444",marginBottom:12},
  title:{fontWeight:800,fontSize:"clamp(28px,6vw,40px)",letterSpacing:"-0.02em",margin:"0 0 12px"},
  sub:{fontSize:15,color:"#666",marginBottom:"1.5rem"},
  toggle:{display:"inline-flex",alignItems:"center",gap:10},
  tOpt:{fontSize:14,cursor:"pointer",fontWeight:500},
  tTrack:{width:44,height:24,background:"#1A1A1A",borderRadius:99,position:"relative",cursor:"pointer",border:"1px solid #2A2A2A"},
  tThumb:{width:18,height:18,background:A,borderRadius:"50%",position:"absolute",top:2,transition:"transform 0.2s"},
  save:{fontSize:10,background:"#22C55E22",color:A,padding:"2px 6px",borderRadius:99,fontWeight:600},
  plans:{maxWidth:700,margin:"0 auto",padding:"2rem 1rem 4rem",display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:16},
  card:{background:"#0D0D0D",border:"1px solid #1A1A1A",borderRadius:20,padding:"1.75rem",position:"relative"},
  cardPro:{border:"1px solid #22C55E44"},
  badge:{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:A,color:"#000",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:99,letterSpacing:"0.06em",whiteSpace:"nowrap"},
  planLabel:{fontSize:11,fontWeight:700,color:"#555",letterSpacing:"0.1em",marginBottom:12},
  priceRow:{display:"flex",alignItems:"baseline",gap:4,marginBottom:6},
  price:{fontWeight:800,fontSize:38,letterSpacing:"-0.02em"},
  period:{fontSize:14,color:"#555"},
  planSub:{fontSize:12,color:"#444",marginBottom:"1.25rem"},
  hr:{border:"none",borderTop:"1px solid #1A1A1A",marginBottom:"1.25rem"},
  features:{listStyle:"none",padding:0,margin:"0 0 1.5rem",display:"flex",flexDirection:"column",gap:10},
  feat:{fontSize:13,color:"#AAA"},
  btn:{display:"block",textAlign:"center",background:A,color:"#000",textDecoration:"none",borderRadius:10,padding:"14px",fontSize:13,fontWeight:700,fontFamily:"'Inter',sans-serif",width:"100%",boxSizing:"border-box"},
  btnFree:{background:"transparent",border:"1px solid #1A1A1A",color:"#F5F5F5"},
  cancel:{textAlign:"center",fontSize:11,color:"#444",marginTop:10},
  faq:{maxWidth:600,margin:"0 auto",padding:"0 1rem 4rem",display:"flex",flexDirection:"column",gap:12},
  faqTitle:{fontWeight:700,fontSize:22,letterSpacing:"-0.02em",marginBottom:"1.5rem",textAlign:"center"},
  faqItem:{background:"#0D0D0D",border:"1px solid #1A1A1A",borderRadius:14,padding:"1.25rem"},
  faqQ:{fontWeight:600,fontSize:14,marginBottom:8},
  faqA:{fontSize:13,color:"#666",lineHeight:1.6},
  footer:{borderTop:"1px solid #1A1A1A",padding:"1.5rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8},
  footerLogo:{fontWeight:800,fontSize:18,textDecoration:"none",color:"#F5F5F5"},
  footerMeta:{fontSize:12,color:"#333"},
};
