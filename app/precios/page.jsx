"use client";
import { useState } from "react";

export default function Precios() {
  const [anual, setAnual] = useState(false);

  return (
    <main style={S.main}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <nav style={S.nav}>
        <a href="/" style={S.logo}><span style={S.logoAccent}>Car</span>Finder</a>
        <a href="/login" style={S.navBtn}>Entrar</a>
      </nav>

      <section style={S.hero}>
        <p style={S.eyebrow}>PLANES</p>
        <h1 style={S.title}>Simple y sin sorpresas</h1>
        <p style={S.sub}>Empieza gratis. Paga solo si quieres más.</p>

        <div style={S.toggle}>
          <span style={{...S.toggleOpt, color: !anual ? "#F5F5F5" : "#555"}} onClick={() => setAnual(false)}>Mensual</span>
          <div style={S.toggleTrack} onClick={() => setAnual(!anual)}>
            <div style={{...S.toggleThumb, transform: anual ? "translateX(20px)" : "translateX(2px)"}} />
          </div>
          <span style={{...S.toggleOpt, color: anual ? "#F5F5F5" : "#555"}} onClick={() => setAnual(true)}>
            Anual <span style={S.saveBadge}>-20%</span>
          </span>
        </div>
      </section>

      <section style={S.plans}>
        {/* PLAN GRATUITO */}
        <div style={S.card}>
          <p style={S.planName}>Gratuito</p>
          <div style={S.priceRow}>
            <span style={S.price}>0€</span>
            <span style={S.period}>/mes</span>
          </div>
          <p style={S.planSub}>Para empezar a buscar sin compromiso</p>
          <div style={S.divider} />
          <ul style={S.features}>
            {[
              "✅ Búsquedas ilimitadas",
              "✅ Hasta 5 resultados por búsqueda",
              "✅ Verificación IA de cada anuncio",
              "❌ Alertas por email",
              "❌ Resultados ilimitados",
              "❌ Búsquedas guardadas",
              "❌ Historial de resultados",
            ].map((f, i) => <li key={i} style={S.feature}>{f}</li>)}
          </ul>
          <a href="/" style={{...S.btn, ...S.btnSecondary}}>Empezar gratis</a>
        </div>

        {/* PLAN PREMIUM */}
        <div style={{...S.card, ...S.cardPremium}}>
          <div style={S.popularBadge}>MÁS POPULAR</div>
          <p style={S.planName}>Premium</p>
          <div style={S.priceRow}>
            <span style={{...S.price, color:"#FF6B00"}}>{anual ? "2,39€" : "2,99€"}</span>
            <span style={S.period}>/mes</span>
          </div>
          <p style={S.planSub}>{anual ? "Facturado anualmente (28,70€/año)" : "Facturado mensualmente"}</p>
          <div style={S.divider} />
          <ul style={S.features}>
            {[
              "✅ Búsquedas ilimitadas",
              "✅ Resultados ilimitados",
              "✅ Verificación IA de cada anuncio",
              "✅ Alertas por email (hasta 3)",
              "✅ Búsquedas guardadas",
              "✅ Historial 30 días",
              "✅ Resultados prioritarios",
            ].map((f, i) => <li key={i} style={S.feature}>{f}</li>)}
          </ul>
          <a href="/login" style={S.btn}>Empezar por 2,99€/mes →</a>
          <p style={S.cancelNote}>Cancela cuando quieras · Sin permanencia</p>
        </div>
      </section>

      <section style={S.faq}>
        <h2 style={S.faqTitle}>Preguntas frecuentes</h2>
        <div style={S.faqGrid}>
          {[
            { q:"¿Puedo cancelar cuando quiera?", a:"Sí, sin permanencia ni penalizaciones. Cancelas y no se vuelve a cobrar." },
            { q:"¿Cómo funcionan las alertas?", a:"Defines tus filtros y te avisamos por email cuando aparece un anuncio que encaja. Sin que tengas que abrir la web." },
            { q:"¿Qué métodos de pago aceptáis?", a:"Tarjeta de crédito o débito a través de Stripe, la plataforma de pagos más segura del mundo." },
            { q:"¿Hay período de prueba?", a:"El plan gratuito ya es una prueba sin límite de tiempo. Pasa a premium solo si quieres las alertas y más resultados." },
          ].map((f, i) => (
            <div key={i} style={S.faqItem}>
              <p style={S.faqQ}>{f.q}</p>
              <p style={S.faqA}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={S.footer}>
        <a href="/" style={S.footerLogo}><span style={S.logoAccent}>Car</span>Finder</a>
        <span style={S.footerMeta}>Comparador independiente · Sin publicidad · Sin trampa</span>
      </footer>
    </main>
  );
}

const A = "#FF6B00";
const S = {
  main: { minHeight:"100vh", background:"#050505", color:"#F5F5F5", fontFamily:"'Inter', sans-serif" },
  nav: { borderBottom:"1px solid #1A1A1A", padding:"0 1.5rem", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo: { fontWeight:800, fontSize:18, textDecoration:"none", color:"#F5F5F5" },
  logoAccent: { color:A },
  navBtn: { fontSize:13, fontWeight:500, color:"#F5F5F5", textDecoration:"none", border:"1px solid #1A1A1A", padding:"7px 16px", borderRadius:8 },

  hero: { textAlign:"center", padding:"5rem 1.5rem 3rem" },
  eyebrow: { fontSize:11, letterSpacing:"0.15em", color:"#444", marginBottom:12 },
  title: { fontWeight:800, fontSize:40, letterSpacing:"-0.02em", margin:"0 0 12px" },
  sub: { fontSize:16, color:"#666", marginBottom:"2rem" },
  toggle: { display:"inline-flex", alignItems:"center", gap:10 },
  toggleOpt: { fontSize:14, cursor:"pointer", fontWeight:500 },
  toggleTrack: { width:44, height:24, background:"#1A1A1A", borderRadius:99, position:"relative", cursor:"pointer", border:"1px solid #2A2A2A" },
  toggleThumb: { width:18, height:18, background:A, borderRadius:"50%", position:"absolute", top:2, transition:"transform 0.2s" },
  saveBadge: { fontSize:10, background:`${A}22`, color:A, padding:"2px 6px", borderRadius:99, fontWeight:600 },

  plans: { maxWidth:800, margin:"0 auto", padding:"2rem 1.5rem 5rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  card: { background:"#0D0D0D", border:"1px solid #1A1A1A", borderRadius:20, padding:"2rem", position:"relative" },
  cardPremium: { border:`1px solid ${A}44` },
  popularBadge: { position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:A, color:"#000", fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:99, letterSpacing:"0.06em" },
  planName: { fontSize:13, fontWeight:600, color:"#666", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 },
  priceRow: { display:"flex", alignItems:"baseline", gap:4, marginBottom:6 },
  price: { fontWeight:800, fontSize:40, letterSpacing:"-0.02em" },
  period: { fontSize:14, color:"#555" },
  planSub: { fontSize:12, color:"#444", marginBottom:"1.25rem" },
  divider: { borderTop:"1px solid #1A1A1A", marginBottom:"1.25rem" },
  features: { listStyle:"none", padding:0, margin:"0 0 1.5rem", display:"flex", flexDirection:"column", gap:8 },
  feature: { fontSize:13, color:"#AAA", lineHeight:1.4 },
  btn: { display:"block", textAlign:"center", background:A, color:"#000", border:"none", borderRadius:10, padding:"14px", fontSize:13, fontWeight:700, cursor:"pointer", textDecoration:"none", fontFamily:"'Inter', sans-serif" },
  btnSecondary: { background:"transparent", border:"1px solid #1A1A1A", color:"#F5F5F5" },
  cancelNote: { textAlign:"center", fontSize:11, color:"#444", marginTop:10 },

  faq: { maxWidth:800, margin:"0 auto", padding:"2rem 1.5rem 5rem" },
  faqTitle: { fontWeight:700, fontSize:24, letterSpacing:"-0.02em", marginBottom:"2rem", textAlign:"center" },
  faqGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  faqItem: { background:"#0D0D0D", border:"1px solid #1A1A1A", borderRadius:14, padding:"1.25rem" },
  faqQ: { fontWeight:600, fontSize:14, marginBottom:8, color:"#F5F5F5" },
  faqA: { fontSize:13, color:"#666", lineHeight:1.6 },

  footer: { borderTop:"1px solid #1A1A1A", padding:"2rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between" },
  footerLogo: { fontWeight:800, fontSize:18, textDecoration:"none", color:"#F5F5F5" },
  footerMeta: { fontSize:12, color:"#333" },
};
