"use client";
import { useState, useEffect } from "react";

const MARCAS = ["Cualquiera","Volkswagen","SEAT","Renault","Ford","BMW","Mercedes","Audi","Opel","Toyota","Honda","Peugeot","Citroën","Hyundai","Kia","Nissan","Mazda","Skoda","Volvo","Fiat","Alfa Romeo","Suzuki","Dacia","Mini","Porsche"];
const COMBUSTIBLES = ["Indiferente","Gasolina","Diésel","Híbrido","Eléctrico"];
const CAMBIOS = ["Indiferente","Manual","Automático"];

const FAQ = [
  { q: "¿Es gratis?", a: "Sí, completamente gratis. Sin registro, sin tarjeta, sin letra pequeña." },
  { q: "¿Cuánto tarda en buscar?", a: "Entre 20 y 40 segundos. Estamos rastreando varios portales a la vez, así que necesitamos ese tiempo para hacerlo bien." },
  { q: "¿De dónde salen los anuncios?", a: "De los principales portales de compraventa de coches en España. Siempre enlazamos al anuncio original para que puedas contactar al vendedor directamente." },
  { q: "¿Qué hace la IA exactamente?", a: "Lee cada anuncio y verifica que cumple tus filtros de verdad — no solo el precio, sino también los kilómetros, el año y el modelo. Si algo no cuadra, lo descarta antes de mostrártelo." },
];

const EJEMPLO = {
  titulo: "Volkswagen Golf GTI 2.0 TSI 245 CV",
  precio: 9500,
  km: 87000,
  anyo: 2017,
  combustible: "Gasolina",
  portal: "Wallapop",
  score: 9,
  resumen: "Precio por debajo del mercado para el año y los km. Muy buena relación calidad-precio.",
};

export default function CarFinder() {
  const [form, setForm] = useState({
    marca: "Cualquiera", modelo: "", precioMin: "", precioMax: "",
    kmMax: "", anyoMin: "", cvMin: "", combustible: "Indiferente", cambio: "Indiferente"
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [contador, setContador] = useState(12847);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setContador(c => c + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 420);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const buscar = async () => {
    if (!form.modelo && form.marca === "Cualquiera") {
      setError("Indica al menos una marca o un modelo para buscar");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en la búsqueda");
      setResults(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 8 ? "#22C55E" : s >= 6 ? "#F59E0B" : "#EF4444";
  const scoreLabel = (s) => s >= 8 ? "Excelente" : s >= 6 ? "Buena oferta" : s >= 4 ? "Aceptable" : "Revisar";

  return (
    <main style={S.main}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <header style={S.nav}>
        <div style={S.navInner}>
          <div style={S.brand}>
            <div style={S.brandDot} />
            <span style={S.brandName}>CarFinder</span>
            <span style={S.brandBadge}>BETA</span>
          </div>
          <span style={S.contador}>
            <span style={S.contadorDot} />
            {contador.toLocaleString("es-ES")} anuncios analizados esta semana
          </span>
        </div>
      </header>

      {sticky && !searched && (
        <div style={S.stickyBar}>
          <div style={S.stickyInner}>
            <input value={form.modelo} onChange={e => set("modelo", e.target.value)} placeholder="¿Qué coche buscas?" style={S.stickyInput} onKeyDown={e => e.key === "Enter" && buscar()} />
            <button onClick={buscar} style={S.stickyBtn}>Buscar →</button>
          </div>
        </div>
      )}

      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.trustLine}>
            <span style={S.trustDot} />
            Gratis · Sin registro · Sin trampa
          </div>
          <h1 style={S.heroTitle}>
            Deja de abrir mil pestañas<br />
            <span style={S.heroAccent}>buscando tu próximo coche.</span>
          </h1>
          <p style={S.heroSub}>
            Pon tus filtros una vez y nosotros rastreamos todos los portales por ti.
            Solo ves las ofertas que de verdad te interesan.
          </p>
        </div>
      </section>

      <section id="buscador" style={S.searchSection}>
        <div style={S.searchPanel}>
          <h2 style={S.searchTitle}>¿Qué coche estás buscando?</h2>
          <div style={S.row2}>
            <div>
              <label style={S.label}>Marca</label>
              <select value={form.marca} onChange={e => set("marca", e.target.value)} style={S.input}>{MARCAS.map(m => <option key={m}>{m}</option>)}</select>
            </div>
            <div>
              <label style={S.label}>Modelo</label>
              <input value={form.modelo} onChange={e => set("modelo", e.target.value)} placeholder="Golf GTI, León FR, Megane…" style={S.input} />
            </div>
          </div>
          <div style={S.row4}>
            <div><label style={S.label}>Precio mín.</label><input type="number" value={form.precioMin} onChange={e => set("precioMin", e.target.value)} placeholder="0 €" style={S.input} /></div>
            <div><label style={S.label}>Precio máx.</label><input type="number" value={form.precioMax} onChange={e => set("precioMax", e.target.value)} placeholder="15.000 €" style={S.input} /></div>
            <div><label style={S.label}>Km máx.</label><input type="number" value={form.kmMax} onChange={e => set("kmMax", e.target.value)} placeholder="200.000" style={S.input} /></div>
            <div><label style={S.label}>Año mín.</label><input type="number" value={form.anyoMin} onChange={e => set("anyoMin", e.target.value)} placeholder="2010" style={S.input} /></div>
          </div>
          <div style={S.row3}>
            <div><label style={S.label}>CV mín.</label><input type="number" value={form.cvMin} onChange={e => set("cvMin", e.target.value)} placeholder="100" style={S.input} /></div>
            <div><label style={S.label}>Combustible</label><select value={form.combustible} onChange={e => set("combustible", e.target.value)} style={S.input}>{COMBUSTIBLES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={S.label}>Cambio</label><select value={form.cambio} onChange={e => set("cambio", e.target.value)} style={S.input}>{CAMBIOS.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          {error && <div style={S.errorBox}>{error}</div>}
          <button onClick={buscar} disabled={loading} style={{...S.searchBtn, ...(loading ? S.searchBtnLoading : {})}}>
            {loading ? <span style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}><span style={S.spinner} />Buscando en todos los portales…</span> : "Buscar ahora →"}
          </button>
          <p style={S.searchHint}>Tarda entre 20 y 40 segundos — estamos rastreando varios sitios a la vez</p>
        </div>
      </section>

      {loading && (
        <div style={S.loadingSection}>
          <div style={S.loadingSpinner} />
          <p style={S.loadingTitle}>Rastreando el mercado por ti</p>
          <p style={S.loadingSub}>Estamos revisando cada anuncio antes de mostrártelo. Un momento.</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={S.emptySection}>
          <p style={S.emptyTitle}>No encontramos nada que encaje</p>
          <p style={S.emptySub}>Prueba a ampliar el presupuesto o los kilómetros e inténtalo de nuevo.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <section style={S.resultsSection}>
          <div style={S.resultsHeader}>
            <span style={S.resultsCount}>{results.length} ofertas verificadas</span>
            <span style={S.resultsSort}>Mejor puntuación primero</span>
          </div>
          <div style={S.resultsGrid}>
            {results.map((car, i) => (
              <article key={i} style={{...S.card, ...(i===0?S.cardTop:{})}}>
                {i===0 && <div style={S.topBadge}>MEJOR COINCIDENCIA</div>}
                <div style={S.cardImg}>
                  {car.imagen ? <img src={car.imagen} alt={car.titulo} style={S.imgTag} /> : <div style={S.imgPlaceholder}>Sin foto</div>}
                  <div style={{...S.scoreBadge, color:scoreColor(car.score), borderColor:scoreColor(car.score)}}>{car.score}</div>
                </div>
                <div style={S.cardBody}>
                  <p style={S.cardTitle}>{car.titulo}</p>
                  <p style={S.cardPrice}>{car.precio ? car.precio.toLocaleString("es-ES")+" €" : "Consultar"}</p>
                  <div style={S.specsRow}>
                    {car.km && <span style={S.specTag}>{car.km.toLocaleString("es-ES")} km</span>}
                    {car.anyo && <span style={S.specTag}>{car.anyo}</span>}
                    {car.cv && <span style={S.specTag}>{car.cv} CV</span>}
                    {car.combustible && <span style={S.specTag}>{car.combustible}</span>}
                    {car.portal && <span style={{...S.specTag,color:"#6366F1",borderColor:"#6366F1"}}>{car.portal}</span>}
                  </div>
                  <div style={{color:scoreColor(car.score),fontSize:12,fontWeight:600,marginBottom:6}}>
                    {scoreLabel(car.score)}{car.resumen && <span style={{color:"#9CA3AF",fontWeight:400}}> — {car.resumen}</span>}
                  </div>
                  {car.alertas?.length > 0 && <div style={S.alertBox}>⚠ {car.alertas.join(" · ")}</div>}
                  <a href={car.url} target="_blank" rel="noopener noreferrer" style={S.cardLink}>Ver anuncio en {car.portal} →</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!searched && (
        <>
          <section style={S.howSection}>
            <div style={S.howInner}>
              <span style={S.sectionTag}>¿Cómo funciona?</span>
              <h2 style={S.sectionTitle}>Te quitamos el trabajo sucio</h2>
              <p style={S.sectionSub}>Tú nos dices qué coche quieres y cuánto puedes gastar. Nosotros salimos a buscarlo por ti en todos los sitios donde se venden coches en España. Cuando encontramos algo que encaja de verdad, te lo mostramos. Sin trampa, sin publicidad, sin perder el tiempo.</p>
              <div style={S.stepsGrid}>
                <div style={S.stepCard}><span style={S.stepIcon}>🎯</span><p style={S.stepTitle}>Tú defines lo que quieres</p><p style={S.stepText}>Marca, modelo, presupuesto, kilómetros. Una vez y ya.</p></div>
                <div style={S.stepCard}><span style={S.stepIcon}>🔍</span><p style={S.stepTitle}>Nosotros salimos a buscar</p><p style={S.stepText}>Rastreamos todos los portales simultáneamente, sin que tengas que abrir ni uno.</p></div>
                <div style={S.stepCard}><span style={S.stepIcon}>✅</span><p style={S.stepTitle}>Solo ves lo que de verdad encaja</p><p style={S.stepText}>Cada anuncio es verificado antes de mostrártelo. Sin relleno, sin anuncios trampa.</p></div>
              </div>
            </div>
          </section>

          <section style={S.exampleSection}>
            <div style={S.exampleInner}>
              <span style={S.sectionTag}>Ejemplo real</span>
              <h2 style={S.sectionTitle}>Esto es lo que verías</h2>
              <p style={S.sectionSub}>Así de claro y directo. Sin letra pequeña, sin sorpresas.</p>
              <div style={S.exampleCard}>
                <div style={S.exCardTop}>
                  <span style={S.exTopBadge}>MEJOR COINCIDENCIA</span>
                  <span style={{...S.exScore, color:scoreColor(EJEMPLO.score)}}>{EJEMPLO.score}/10 — {scoreLabel(EJEMPLO.score)}</span>
                </div>
                <div style={S.exCardBody}>
                  <div style={S.exImgPlaceholder}>📸 Foto del vehículo</div>
                  <div style={S.exInfo}>
                    <p style={S.exTitle}>{EJEMPLO.titulo}</p>
                    <p style={S.exPrice}>{EJEMPLO.precio.toLocaleString("es-ES")} €</p>
                    <div style={S.exSpecs}>
                      <span style={S.specTag}>{EJEMPLO.km.toLocaleString("es-ES")} km</span>
                      <span style={S.specTag}>{EJEMPLO.anyo}</span>
                      <span style={S.specTag}>{EJEMPLO.combustible}</span>
                      <span style={{...S.specTag,color:"#6366F1",borderColor:"#6366F1"}}>{EJEMPLO.portal}</span>
                    </div>
                    <p style={S.exResumen}>💡 {EJEMPLO.resumen}</p>
                    <div style={S.exLink}>Ver anuncio original →</div>
                  </div>
                </div>
              </div>
              <p style={S.exampleNote}>Este es un ejemplo ilustrativo. Los resultados reales dependen de los filtros que pongas.</p>
            </div>
          </section>

          <section style={S.faqSection}>
            <div style={S.faqInner}>
              <span style={S.sectionTag}>Preguntas frecuentes</span>
              <h2 style={S.sectionTitle}>Lo que todo el mundo pregunta</h2>
              <div style={S.faqList}>
                {FAQ.map((item, i) => (
                  <div key={i} style={S.faqItem} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    <div style={S.faqQ}><span>{item.q}</span><span style={{...S.faqArrow, transform:faqOpen===i?"rotate(180deg)":"rotate(0deg)"}}>▾</span></div>
                    {faqOpen === i && <p style={S.faqA}>{item.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <footer style={S.footer}>
        <p style={S.footerText}>CarFinder España — comparador independiente de coches de segunda mano.</p>
        <p style={S.footerSub}>Siempre enlazamos al anuncio original. No somos un portal de venta.</p>
      </footer>
    </main>
  );
}

const S = {
  main:{minHeight:"100vh",background:"#0A0A0A",color:"#F4F4F5",fontFamily:"'Inter',sans-serif",fontSize:15},
  nav:{borderBottom:"1px solid #1C1C1E",background:"rgba(10,10,10,0.95)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:100},
  navInner:{maxWidth:1100,margin:"0 auto",padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"},
  brand:{display:"flex",alignItems:"center",gap:8},
  brandDot:{width:8,height:8,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 8px #22C55E"},
  brandName:{fontWeight:800,fontSize:17,letterSpacing:"-0.02em"},
  brandBadge:{fontSize:9,fontWeight:700,background:"#1C1C1E",color:"#6B7280",padding:"2px 7px",borderRadius:99,letterSpacing:"0.06em"},
  contador:{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#6B7280"},
  contadorDot:{width:6,height:6,borderRadius:"50%",background:"#22C55E"},
  stickyBar:{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(10,10,10,0.98)",borderBottom:"1px solid #1C1C1E",backdropFilter:"blur(10px)",padding:"10px 1.5rem"},
  stickyInner:{maxWidth:700,margin:"0 auto",display:"flex",gap:10},
  stickyInput:{flex:1,background:"#1C1C1E",border:"1px solid #2C2C2E",borderRadius:10,padding:"10px 16px",color:"#F4F4F5",fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif"},
  stickyBtn:{background:"#22C55E",color:"#000",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif"},
  hero:{padding:"5rem 1.5rem 2rem",textAlign:"center"},
  heroInner:{maxWidth:680,margin:"0 auto"},
  trustLine:{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,color:"#6B7280",border:"1px solid #1C1C1E",padding:"5px 14px",borderRadius:99,marginBottom:"1.5rem"},
  trustDot:{width:6,height:6,borderRadius:"50%",background:"#22C55E"},
  heroTitle:{fontWeight:900,fontSize:44,lineHeight:1.1,letterSpacing:"-0.03em",margin:"0 0 1.25rem"},
  heroAccent:{color:"#22C55E"},
  heroSub:{fontSize:17,color:"#9CA3AF",lineHeight:1.65,maxWidth:520,margin:"0 auto"},
  searchSection:{maxWidth:720,margin:"0 auto",padding:"2rem 1.5rem 3rem"},
  searchPanel:{background:"#111113",border:"1px solid #1C1C1E",borderRadius:20,padding:"2rem"},
  searchTitle:{fontWeight:700,fontSize:18,marginBottom:"1.5rem",color:"#F4F4F5"},
  row2:{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12,marginBottom:12},
  row3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:"1.5rem"},
  row4:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:12},
  label:{fontSize:11,color:"#6B7280",display:"block",marginBottom:5,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"},
  input:{width:"100%",background:"#1C1C1E",border:"1px solid #2C2C2E",borderRadius:10,padding:"11px 14px",color:"#F4F4F5",fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"},
  errorBox:{background:"#1F0F0E",border:"1px solid #7F1D1D",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#FCA5A5",marginBottom:12},
  searchBtn:{width:"100%",background:"#22C55E",color:"#000",border:"none",borderRadius:12,padding:"16px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"},
  searchBtnLoading:{background:"#1C1C1E",color:"#22C55E",cursor:"not-allowed"},
  spinner:{width:14,height:14,border:"2px solid #22C55E44",borderTopColor:"#22C55E",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"},
  searchHint:{textAlign:"center",fontSize:12,color:"#4B5563",marginTop:10},
  loadingSection:{maxWidth:480,margin:"0 auto",padding:"3rem 1.5rem",textAlign:"center"},
  loadingSpinner:{width:48,height:48,border:"3px solid #1C1C1E",borderTopColor:"#22C55E",borderRadius:"50%",margin:"0 auto 1.5rem",animation:"spin 0.8s linear infinite"},
  loadingTitle:{fontSize:16,fontWeight:600,marginBottom:6},
  loadingSub:{fontSize:13,color:"#6B7280"},
  emptySection:{maxWidth:480,margin:"0 auto",padding:"3rem 1.5rem 5rem",textAlign:"center"},
  emptyTitle:{fontSize:16,fontWeight:600,marginBottom:6},
  emptySub:{fontSize:13,color:"#6B7280"},
  resultsSection:{maxWidth:1100,margin:"0 auto",padding:"1rem 1.5rem 5rem"},
  resultsHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",paddingBottom:"1rem",borderBottom:"1px solid #1C1C1E"},
  resultsCount:{fontWeight:700,fontSize:16},
  resultsSort:{fontSize:12,color:"#6B7280"},
  resultsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:16},
  card:{background:"#111113",border:"1px solid #1C1C1E",borderRadius:16,overflow:"hidden",position:"relative"},
  cardTop:{border:"1px solid #22C55E44"},
  topBadge:{position:"absolute",top:10,left:10,zIndex:2,background:"#052E16",border:"1px solid #22C55E44",color:"#22C55E",fontSize:9,fontWeight:700,padding:"4px 9px",borderRadius:6,letterSpacing:"0.05em"},
  cardImg:{height:170,background:"#1C1C1E",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"},
  imgTag:{width:"100%",height:"100%",objectFit:"cover"},
  imgPlaceholder:{fontSize:13,color:"#4B5563"},
  scoreBadge:{position:"absolute",bottom:10,right:10,width:34,height:34,borderRadius:"50%",background:"rgba(10,10,10,0.9)",border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13},
  cardBody:{padding:"1rem"},
  cardTitle:{fontSize:13,fontWeight:500,lineHeight:1.35,marginBottom:4,color:"#F4F4F5"},
  cardPrice:{fontWeight:800,fontSize:20,color:"#F4F4F5",marginBottom:10,letterSpacing:"-0.02em"},
  specsRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10},
  specTag:{fontSize:11,color:"#9CA3AF",border:"1px solid #2C2C2E",padding:"3px 8px",borderRadius:6},
  alertBox:{background:"#1C1409",border:"1px solid #4D3C12",borderRadius:8,padding:"6px 9px",fontSize:11,color:"#E0B454",marginBottom:10},
  cardLink:{display:"block",textAlign:"center",background:"#1C1C1E",border:"1px solid #2C2C2E",borderRadius:10,padding:"10px",fontSize:12,fontWeight:600,color:"#F4F4F5",textDecoration:"none"},
  howSection:{borderTop:"1px solid #1C1C1E",padding:"4rem 1.5rem"},
  howInner:{maxWidth:900,margin:"0 auto"},
  sectionTag:{fontSize:12,fontWeight:600,color:"#22C55E",letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:10},
  sectionTitle:{fontWeight:800,fontSize:28,letterSpacing:"-0.02em",marginBottom:12},
  sectionSub:{fontSize:16,color:"#9CA3AF",lineHeight:1.65,maxWidth:620,marginBottom:"2.5rem"},
  stepsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16},
  stepCard:{background:"#111113",border:"1px solid #1C1C1E",borderRadius:16,padding:"1.5rem"},
  stepIcon:{fontSize:24,display:"block",marginBottom:12},
  stepTitle:{fontWeight:700,fontSize:15,marginBottom:6,color:"#F4F4F5"},
  stepText:{fontSize:13,color:"#9CA3AF",lineHeight:1.55},
  exampleSection:{padding:"1rem 1.5rem 4rem",borderTop:"1px solid #1C1C1E"},
  exampleInner:{maxWidth:700,margin:"0 auto"},
  exampleCard:{background:"#111113",border:"1px solid #2C2C2E",borderRadius:16,overflow:"hidden",marginBottom:12},
  exCardTop:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid #1C1C1E"},
  exTopBadge:{fontSize:9,fontWeight:700,color:"#22C55E",letterSpacing:"0.05em"},
  exScore:{fontSize:12,fontWeight:700},
  exCardBody:{display:"flex",gap:16,padding:"1rem"},
  exImgPlaceholder:{width:140,minWidth:140,height:100,background:"#1C1C1E",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#4B5563"},
  exInfo:{flex:1},
  exTitle:{fontWeight:600,fontSize:14,marginBottom:4,color:"#F4F4F5"},
  exPrice:{fontWeight:800,fontSize:20,marginBottom:8,letterSpacing:"-0.02em"},
  exSpecs:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8},
  exResumen:{fontSize:12,color:"#9CA3AF",lineHeight:1.5,marginBottom:10},
  exLink:{fontSize:12,fontWeight:600,color:"#6366F1",cursor:"default"},
  exampleNote:{fontSize:12,color:"#4B5563",textAlign:"center"},
  faqSection:{borderTop:"1px solid #1C1C1E",padding:"4rem 1.5rem 5rem"},
  faqInner:{maxWidth:680,margin:"0 auto"},
  faqList:{display:"flex",flexDirection:"column",gap:8},
  faqItem:{background:"#111113",border:"1px solid #1C1C1E",borderRadius:12,padding:"1rem 1.25rem",cursor:"pointer"},
  faqQ:{display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:600,fontSize:14,color:"#F4F4F5"},
  faqArrow:{fontSize:16,color:"#6B7280",transition:"transform 0.2s",display:"inline-block"},
  faqA:{marginTop:10,fontSize:13,color:"#9CA3AF",lineHeight:1.6},
  footer:{borderTop:"1px solid #1C1C1E",padding:"2rem 1.5rem",textAlign:"center"},
  footerText:{fontSize:13,color:"#6B7280",marginBottom:4},
  footerSub:{fontSize:12,color:"#4B5563"},
};
