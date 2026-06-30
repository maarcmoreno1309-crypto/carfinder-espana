"use client";
import { useState } from "react";

const MARCAS = ["Cualquiera","Volkswagen","SEAT","Renault","Ford","BMW","Mercedes","Audi","Opel","Toyota","Honda","Peugeot","Citroën","Hyundai","Kia","Nissan","Mazda","Skoda","Volvo","Fiat","Alfa Romeo","Suzuki","Dacia","Mini","Porsche"];
const COMBUSTIBLES = ["Indiferente","Gasolina","Diésel","Híbrido","Eléctrico"];
const CAMBIOS = ["Indiferente","Manual","Automático"];

const PORTALES = [
  { nombre: "Wallapop", color: "#1AAC6B" },
  { nombre: "Coches.net", color: "#E6A817" },
  { nombre: "Milanuncios", color: "#3D8BE8" },
];

const PASOS = [
  { num: "01", titulo: "Define tus filtros", texto: "Marca, modelo, presupuesto, kilómetros, año. Una vez." },
  { num: "02", titulo: "El radar rastrea", texto: "Wallapop, Coches.net y Milanuncios escaneados en paralelo." },
  { num: "03", titulo: "La IA verifica cada uno", texto: "Solo pasan los anuncios que cumplen de verdad. Con nota." },
];

export default function CarFinder() {
  const [form, setForm] = useState({
    marca: "Cualquiera", modelo: "", precioMin: "", precioMax: "",
    kmMax: "", anyoMin: "", cvMin: "", combustible: "Indiferente", cambio: "Indiferente"
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const buscar = async () => {
    if (!form.modelo && form.marca === "Cualquiera") {
      setError("Indica al menos una marca o un modelo");
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

  const scrollToBuscador = () => {
    document.getElementById("buscador")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scoreColor = (s) => {
    if (s >= 8) return "#3DDC84";
    if (s >= 6) return "#E6A817";
    return "#E85D4A";
  };

  const scoreLabel = (s) => {
    if (s >= 8) return "Excelente";
    if (s >= 6) return "Buena oferta";
    if (s >= 4) return "Aceptable";
    return "Revisar";
  };

  return (
    <main style={S.main}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <header style={S.nav}>
        <div style={S.navInner}>
          <div style={S.brand}>
            <div style={S.brandMark}>
              <span style={S.brandMarkDot} />
            </div>
            <div>
              <div style={S.brandName}>CARFINDER</div>
              <div style={S.brandTag}>RADAR DE MERCADO · ESPAÑA</div>
            </div>
          </div>
          <button onClick={scrollToBuscador} style={S.navCta}>Buscar ahora</button>
        </div>
      </header>

      {/* HERO */}
      <section style={S.hero}>
        <div style={S.heroGrid} />
        <div style={S.heroInner}>
          <div style={S.heroEyebrow}>
            <span style={S.pulseDot} />
            RASTREANDO 3 PORTALES EN TIEMPO REAL
          </div>
          <h1 style={S.heroTitle}>
            Un solo radar.<br />
            <span style={S.heroAccent}>Todo el mercado.</span>
          </h1>
          <p style={S.heroSub}>
            Dejas de abrir Wallapop, Coches.net y Milanuncios uno a uno.
            Pones tus filtros aquí y una IA verifica cada anuncio antes de mostrártelo.
          </p>
          <div style={S.heroStats}>
            <div style={S.heroStat}>
              <span style={S.heroStatNum}>3</span>
              <span style={S.heroStatLabel}>Portales</span>
            </div>
            <div style={S.heroStatDivider} />
            <div style={S.heroStat}>
              <span style={S.heroStatNum}>100%</span>
              <span style={S.heroStatLabel}>Verificado por IA</span>
            </div>
            <div style={S.heroStatDivider} />
            <div style={S.heroStat}>
              <span style={S.heroStatNum}>0€</span>
              <span style={S.heroStatLabel}>Para buscar</span>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCADOR */}
      <section id="buscador" style={S.searchSection}>
        <div style={S.searchPanel}>
          <div style={S.panelHeader}>
            <span style={S.panelHeaderLabel}>PARÁMETROS DE BÚSQUEDA</span>
          </div>

          <div style={S.row2}>
            <div>
              <label style={S.label}>Marca</label>
              <select value={form.marca} onChange={e => set("marca", e.target.value)} style={S.input}>
                {MARCAS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Modelo</label>
              <input value={form.modelo} onChange={e => set("modelo", e.target.value)} placeholder="Golf GTI, León FR, Megane…" style={S.input} />
            </div>
          </div>

          <div style={S.row4}>
            <div>
              <label style={S.label}>Precio mín.</label>
              <input type="number" value={form.precioMin} onChange={e => set("precioMin", e.target.value)} placeholder="0 €" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Precio máx.</label>
              <input type="number" value={form.precioMax} onChange={e => set("precioMax", e.target.value)} placeholder="15.000 €" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Km máx.</label>
              <input type="number" value={form.kmMax} onChange={e => set("kmMax", e.target.value)} placeholder="200.000" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Año mín.</label>
              <input type="number" value={form.anyoMin} onChange={e => set("anyoMin", e.target.value)} placeholder="2010" style={S.input} />
            </div>
          </div>

          <div style={S.row3}>
            <div>
              <label style={S.label}>CV mín.</label>
              <input type="number" value={form.cvMin} onChange={e => set("cvMin", e.target.value)} placeholder="100" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Combustible</label>
              <select value={form.combustible} onChange={e => set("combustible", e.target.value)} style={S.input}>
                {COMBUSTIBLES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Cambio</label>
              <select value={form.cambio} onChange={e => set("cambio", e.target.value)} style={S.input}>
                {CAMBIOS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {error && <div style={S.errorBox}>{error}</div>}

          <button onClick={buscar} disabled={loading} style={{...S.searchBtn, ...(loading ? S.searchBtnLoading : {})}}>
            {loading ? (
              <span style={S.btnLoadingContent}>
                <span style={S.radarSpin} />
                RASTREANDO MERCADO…
              </span>
            ) : "ACTIVAR RADAR →"}
          </button>
        </div>

        {/* PORTALES MINI */}
        <div style={S.portalesRow}>
          <span style={S.portalesLabel}>FUENTES:</span>
          {PORTALES.map(p => (
            <span key={p.nombre} style={S.portalChip}>
              <span style={{...S.portalDot, background: p.color}} />
              {p.nombre}
            </span>
          ))}
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div style={S.loadingSection}>
          <div style={S.radarBig}>
            <div style={S.radarRing1} />
            <div style={S.radarRing2} />
            <div style={S.radarSweep} />
          </div>
          <p style={S.loadingText}>Comparando anuncios en Wallapop, Coches.net y Milanuncios</p>
          <p style={S.loadingSub}>La IA está validando cada coincidencia · 20-40 segundos</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && searched && results.length === 0 && (
        <div style={S.emptySection}>
          <div style={S.emptyMark}>—</div>
          <p style={S.emptyTitle}>Sin coincidencias verificadas</p>
          <p style={S.emptySub}>Amplía el presupuesto o el kilometraje e inténtalo de nuevo.</p>
        </div>
      )}

      {/* RESULTADOS */}
      {!loading && results.length > 0 && (
        <section style={S.resultsSection}>
          <div style={S.resultsHeader}>
            <span style={S.resultsCount}>{results.length} VERIFICADOS</span>
            <span style={S.resultsSort}>Orden: mejor puntuación primero</span>
          </div>

          <div style={S.resultsGrid}>
            {results.map((car, i) => (
              <article key={i} style={{...S.card, ...(i === 0 ? S.cardTop : {})}}>
                {i === 0 && <div style={S.topBadge}>MEJOR COINCIDENCIA</div>}

                <div style={S.cardImg}>
                  {car.imagen ? (
                    <img src={car.imagen} alt={car.titulo} style={S.imgTag} />
                  ) : (
                    <div style={S.imgPlaceholder}>SIN FOTO</div>
                  )}
                  <div style={{...S.scoreBadge, color: scoreColor(car.score), borderColor: scoreColor(car.score)}}>
                    {car.score}
                  </div>
                </div>

                <div style={S.cardBody}>
                  <p style={S.cardTitle}>{car.titulo}</p>
                  <p style={S.cardPrice}>{car.precio ? car.precio.toLocaleString("es-ES") + " €" : "Consultar"}</p>

                  <div style={S.specsRow}>
                    {car.km && <span style={S.specTag}>{car.km.toLocaleString("es-ES")} km</span>}
                    {car.anyo && <span style={S.specTag}>{car.anyo}</span>}
                    {car.cv && <span style={S.specTag}>{car.cv} CV</span>}
                  </div>

                  <div style={{...S.verdictBar, color: scoreColor(car.score)}}>
                    <span style={S.verdictLabel}>{scoreLabel(car.score)}</span>
                    {car.resumen && <span style={S.verdictText}>{car.resumen}</span>}
                  </div>

                  {car.alertas && car.alertas.length > 0 && (
                    <div style={S.alertBox}>⚠ {car.alertas.join(" · ")}</div>
                  )}

                  <a href={car.url} target="_blank" rel="noopener noreferrer" style={S.cardLink}>
                    VER EN {car.portal?.toUpperCase()} →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CÓMO FUNCIONA */}
      {!searched && (
        <>
          <section style={S.howSection}>
            <span style={S.sectionEyebrow}>EL PROCESO</span>
            <h2 style={S.sectionTitle}>Tres movimientos, un resultado fiable</h2>
            <div style={S.stepsGrid}>
              {PASOS.map(p => (
                <div key={p.num} style={S.stepCard}>
                  <span style={S.stepNum}>{p.num}</span>
                  <p style={S.stepTitle}>{p.titulo}</p>
                  <p style={S.stepText}>{p.texto}</p>
                </div>
              ))}
            </div>
          </section>

          {/* PORTALES GRANDE */}
          <section style={S.portalesSection}>
            <span style={S.sectionEyebrow}>COBERTURA</span>
            <h2 style={S.sectionTitle}>Donde está el mercado, está el radar</h2>
            <div style={S.portalesBigGrid}>
              {PORTALES.map(p => (
                <div key={p.nombre} style={S.portalBigCard}>
                  <span style={{...S.portalBigDot, background: p.color}} />
                  <span style={S.portalBigName}>{p.nombre}</span>
                  <span style={S.portalBigStatus}>ACTIVO</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <footer style={S.footer}>
        <span style={S.footerText}>CarFinder España — comparador independiente. Enlazamos siempre al anuncio original.</span>
      </footer>
    </main>
  );
}

const S = {
  main: { minHeight: "100vh", background: "#0B0D0C", color: "#EDEEEC", fontFamily: "'Space Grotesk', sans-serif" },

  nav: { borderBottom: "1px solid #1C211E", position: "sticky", top: 0, background: "rgba(11,13,12,0.92)", backdropFilter: "blur(8px)", zIndex: 10 },
  navInner: { maxWidth: 1040, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: { width: 30, height: 30, borderRadius: 7, background: "#14201A", border: "1px solid #2A3D32", display: "flex", alignItems: "center", justifyContent: "center" },
  brandMarkDot: { width: 8, height: 8, borderRadius: "50%", background: "#3DDC84", display: "block", boxShadow: "0 0 6px #3DDC84" },
  brandName: { fontFamily: "'Archivo Expanded', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" },
  brandTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5A6359", letterSpacing: "0.08em", marginTop: 1 },
  navCta: { background: "transparent", border: "1px solid #2A3D32", color: "#3DDC84", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em", padding: "8px 16px", borderRadius: 6, cursor: "pointer" },

  hero: { position: "relative", padding: "4.5rem 1.5rem 3.5rem", overflow: "hidden", borderBottom: "1px solid #1C211E" },
  heroGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(#161A17 1px, transparent 1px), linear-gradient(90deg, #161A17 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse at top, black, transparent 70%)", opacity: 0.6 },
  heroInner: { position: "relative", maxWidth: 720, margin: "0 auto", textAlign: "center" },
  heroEyebrow: { display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.08em", color: "#3DDC84", border: "1px solid #1E3D2A", background: "#0F1B14", padding: "6px 14px", borderRadius: 99, marginBottom: "1.75rem" },
  pulseDot: { width: 6, height: 6, borderRadius: "50%", background: "#3DDC84", display: "inline-block", boxShadow: "0 0 8px #3DDC84" },
  heroTitle: { fontFamily: "'Archivo Expanded', sans-serif", fontWeight: 800, fontSize: 46, lineHeight: 1.08, letterSpacing: "-0.01em", margin: "0 0 1.25rem" },
  heroAccent: { color: "#3DDC84" },
  heroSub: { fontSize: 16, color: "#9CA39B", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 2.25rem" },
  heroStats: { display: "flex", alignItems: "center", justifyContent: "center", gap: 24 },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  heroStatNum: { fontFamily: "'Archivo Expanded', sans-serif", fontWeight: 700, fontSize: 22, color: "#EDEEEC" },
  heroStatLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5A6359", letterSpacing: "0.05em" },
  heroStatDivider: { width: 1, height: 28, background: "#1C211E" },

  searchSection: { maxWidth: 720, margin: "-2rem auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 },
  searchPanel: { background: "#11140F12", backgroundColor: "#0F120E", border: "1px solid #1C211E", borderRadius: 16, padding: "1.75rem" },
  panelHeader: { marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: "1px solid #1C211E" },
  panelHeaderLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5A6359", letterSpacing: "0.08em" },

  row2: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "1.5rem" },
  row4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5A6359", display: "block", marginBottom: 6, letterSpacing: "0.04em" },
  input: { width: "100%", background: "#161A17", border: "1px solid #232924", borderRadius: 8, padding: "10px 12px", color: "#EDEEEC", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", outline: "none", boxSizing: "border-box" },

  errorBox: { background: "#1F0F0E", border: "1px solid #5C2620", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#F0998C", marginBottom: 12 },

  searchBtn: { width: "100%", background: "#3DDC84", color: "#06140C", border: "none", borderRadius: 10, padding: "15px", fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", cursor: "pointer" },
  searchBtnLoading: { background: "#1C2E22", color: "#3DDC84", cursor: "not-allowed" },
  btnLoadingContent: { display: "inline-flex", alignItems: "center", gap: 10 },
  radarSpin: { width: 12, height: 12, border: "2px solid #3DDC8455", borderTopColor: "#3DDC84", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },

  portalesRow: { display: "flex", alignItems: "center", gap: 10, marginTop: "1.25rem", justifyContent: "center", flexWrap: "wrap" },
  portalesLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5A6359", letterSpacing: "0.06em" },
  portalChip: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA39B", border: "1px solid #1C211E", padding: "5px 12px", borderRadius: 99 },
  portalDot: { width: 6, height: 6, borderRadius: "50%", display: "inline-block" },

  loadingSection: { maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem", textAlign: "center" },
  radarBig: { width: 100, height: 100, margin: "0 auto 1.75rem", position: "relative", borderRadius: "50%", border: "1px solid #1C3D28" },
  radarRing1: { position: "absolute", inset: 18, borderRadius: "50%", border: "1px solid #1C3D28" },
  radarRing2: { position: "absolute", inset: 36, borderRadius: "50%", border: "1px solid #1C3D28" },
  radarSweep: { position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, #3DDC8400, #3DDC8466)", animation: "spin 1.6s linear infinite" },
  loadingText: { fontSize: 15, color: "#EDEEEC", marginBottom: 6 },
  loadingSub: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5A6359" },

  emptySection: { maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem 5rem", textAlign: "center" },
  emptyMark: { fontSize: 32, color: "#2A3D32", marginBottom: 12, fontFamily: "'Archivo Expanded', sans-serif" },
  emptyTitle: { fontSize: 15, color: "#EDEEEC", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#5A6359" },

  resultsSection: { maxWidth: 1040, margin: "0 auto", padding: "1rem 1.5rem 5rem" },
  resultsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: "1px solid #1C211E" },
  resultsCount: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3DDC84", letterSpacing: "0.06em" },
  resultsSort: { fontSize: 12, color: "#5A6359" },
  resultsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 },

  card: { background: "#0F120E", border: "1px solid #1C211E", borderRadius: 14, overflow: "hidden", position: "relative" },
  cardTop: { border: "1px solid #2A5C3D" },
  topBadge: { position: "absolute", top: 10, left: 10, zIndex: 2, background: "#0F1B14", border: "1px solid #2A5C3D", color: "#3DDC84", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.05em", padding: "4px 9px", borderRadius: 6 },

  cardImg: { height: 160, background: "#161A17", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  imgTag: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3A413B", letterSpacing: "0.08em" },
  scoreBadge: { position: "absolute", bottom: 10, right: 10, width: 34, height: 34, borderRadius: "50%", background: "#0B0D0CDD", border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Expanded', sans-serif", fontWeight: 700, fontSize: 13 },

  cardBody: { padding: "1rem" },
  cardTitle: { fontSize: 13, fontWeight: 500, lineHeight: 1.35, marginBottom: 4, color: "#EDEEEC" },
  cardPrice: { fontFamily: "'Archivo Expanded', sans-serif", fontWeight: 700, fontSize: 19, color: "#EDEEEC", marginBottom: 10 },

  specsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  specTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA39B", border: "1px solid #1C211E", padding: "3px 8px", borderRadius: 5 },

  verdictBar: { display: "flex", alignItems: "baseline", gap: 6, fontSize: 12, marginBottom: 8, flexWrap: "wrap" },
  verdictLabel: { fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
  verdictText: { color: "#9CA39B", fontSize: 12 },

  alertBox: { background: "#1F1709", border: "1px solid #4D3C12", borderRadius: 6, padding: "6px 9px", fontSize: 11, color: "#E0B454", marginBottom: 10 },

  cardLink: { display: "block", textAlign: "center", background: "#161A17", border: "1px solid #232924", borderRadius: 8, padding: "10px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em", color: "#EDEEEC", textDecoration: "none" },

  howSection: { maxWidth: 1040, margin: "0 auto", padding: "4rem 1.5rem 3rem", borderTop: "1px solid #1C211E" },
  sectionEyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3DDC84", letterSpacing: "0.08em", display: "block", marginBottom: 10 },
  sectionTitle: { fontFamily: "'Archivo Expanded', sans-serif", fontWeight: 700, fontSize: 26, marginBottom: "2.25rem", maxWidth: 480 },

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 },
  stepCard: { border: "1px solid #1C211E", borderRadius: 14, padding: "1.5rem" },
  stepNum: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3DDC84", display: "block", marginBottom: 14 },
  stepTitle: { fontSize: 15, fontWeight: 500, marginBottom: 8, color: "#EDEEEC" },
  stepText: { fontSize: 13, color: "#9CA39B", lineHeight: 1.55 },

  portalesSection: { maxWidth: 1040, margin: "0 auto", padding: "1rem 1.5rem 4rem" },
  portalesBigGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 },
  portalBigCard: { display: "flex", alignItems: "center", gap: 12, border: "1px solid #1C211E", borderRadius: 12, padding: "1.1rem 1.25rem" },
  portalBigDot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block" },
  portalBigName: { fontSize: 14, fontWeight: 500, flex: 1, color: "#EDEEEC" },
  portalBigStatus: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3DDC84", letterSpacing: "0.05em" },

  footer: { borderTop: "1px solid #1C211E", padding: "2rem 1.5rem", textAlign: "center" },
  footerText: { fontSize: 12, color: "#5A6359" },
};

