"use client";
import { useState } from "react";

const MARCAS = ["Cualquiera","Volkswagen","SEAT","Renault","Ford","BMW","Mercedes","Audi","Opel","Toyota","Honda","Peugeot","Citroën","Hyundai","Kia","Nissan","Mazda","Skoda","Volvo","Fiat","Alfa Romeo","Suzuki","Dacia","Mini","Porsche"];
const COMBUSTIBLES = ["Indiferente","Gasolina","Diésel","Híbrido","Eléctrico"];
const CAMBIOS = ["Indiferente","Manual","Automático"];

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
      setError("Introduce al menos una marca o modelo");
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

  const scoreColor = (s) => {
    if (s >= 8) return "#22c55e";
    if (s >= 6) return "#f59e0b";
    return "#ef4444";
  };

  const scoreLabel = (s) => {
    if (s >= 8) return "Excelente";
    if (s >= 6) return "Buena oferta";
    if (s >= 4) return "Aceptable";
    return "Evitar";
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "1.5rem 2rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: 32, height: 32, background: "#e63946", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔍</div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>CarFinder España</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>Wallapop · Coches.net · Milanuncios · y más</div>
        </div>
      </header>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "2rem", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 6, letterSpacing: "-0.03em" }}>Busca en todos los portales <span style={{ color: "#e63946" }}>a la vez</span></h1>
          <p style={{ color: "#666", fontSize: 14, marginBottom: "1.75rem" }}>Ponemos tus filtros una vez — la IA revisa cada anuncio y te muestra solo los que <strong style={{ color: "#aaa" }}>realmente cumplen</strong>.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Marca</label>
              <select value={form.marca} onChange={e => set("marca", e.target.value)} style={inputStyle}>
                {MARCAS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Modelo</label>
              <input value={form.modelo} onChange={e => set("modelo", e.target.value)} placeholder="Ej: Golf GTI, León FR, Megane..." style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={labelStyle}>Precio mín. (€)</label><input type="number" value={form.precioMin} onChange={e => set("precioMin", e.target.value)} placeholder="0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Precio máx. (€)</label><input type="number" value={form.precioMax} onChange={e => set("precioMax", e.target.value)} placeholder="15000" style={inputStyle} /></div>
            <div><label style={labelStyle}>Km máximos</label><input type="number" value={form.kmMax} onChange={e => set("kmMax", e.target.value)} placeholder="200000" style={inputStyle} /></div>
            <div><label style={labelStyle}>Año mínimo</label><input type="number" value={form.anyoMin} onChange={e => set("anyoMin", e.target.value)} placeholder="2010" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
            <div><label style={labelStyle}>CV mínimos</label><input type="number" value={form.cvMin} onChange={e => set("cvMin", e.target.value)} placeholder="100" style={inputStyle} /></div>
            <div><label style={labelStyle}>Combustible</label><select value={form.combustible} onChange={e => set("combustible", e.target.value)} style={inputStyle}>{COMBUSTIBLES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={labelStyle}>Cambio</label><select value={form.cambio} onChange={e => set("cambio", e.target.value)} style={inputStyle}>{CAMBIOS.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          {error && <div style={{ background: "#2a0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>{error}</div>}
          <button onClick={buscar} disabled={loading} style={{ width: "100%", background: loading ? "#333" : "#e63946", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne', sans-serif", letterSpacing: "0.01em" }}>
            {loading ? "🔍 Rastreando todos los portales..." : "Buscar en todos los portales →"}
          </button>
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#555" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
            <div style={{ fontSize: 15, marginBottom: 8 }}>Rastreando Wallapop, Coches.net y Milanuncios...</div>
            <div style={{ fontSize: 13 }}>La IA está analizando cada anuncio. Puede tardar 20-30 segundos.</div>
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#555", background: "#111", borderRadius: 16, border: "1px solid #1f1f1f" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚗</div>
            <div style={{ fontSize: 15 }}>No se encontraron anuncios que cumplan todos los filtros.</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Prueba a ampliar el presupuesto o los kilómetros.</div>
          </div>
        )}
        {!loading && results.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18 }}>{results.length} anuncio{results.length !== 1 ? "s" : ""} verificados ✅</div>
              <div style={{ fontSize: 12, color: "#555" }}>Ordenados por puntuación IA</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {results.map((car, i) => (
                <div key={i} style={{ background: "#111", border: `1px solid ${i === 0 ? "#e63946" : "#1f1f1f"}`, borderRadius: 14, overflow: "hidden", position: "relative" }}>
                  {i === 0 && <div style={{ position: "absolute", top: 10, left: 10, background: "#e63946", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, zIndex: 1 }}>TOP PICK</div>}
                  <div style={{ height: 180, background: "#1a1a1a", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {car.imagen ? <img src={car.imagen} alt={car.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 40, color: "#333" }}>🚗</div>}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, marginBottom: 4 }}>{car.titulo}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#e63946", marginBottom: 8 }}>{car.precio ? car.precio.toLocaleString("es-ES") + " €" : "Precio no indicado"}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {car.km && <Pill>{car.km.toLocaleString("es-ES")} km</Pill>}
                      {car.anyo && <Pill>{car.anyo}</Pill>}
                      {car.cv && <Pill>{car.cv} CV</Pill>}
                      {car.combustible && <Pill>{car.combustible}</Pill>}
                      {car.portal && <Pill accent>{car.portal}</Pill>}
                    </div>
                    <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 10px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, color: "#666" }}>Puntuación IA</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor(car.score) }}>{car.score}/10</span>
                        <span style={{ fontSize: 11, color: scoreColor(car.score), fontWeight: 500 }}>{scoreLabel(car.score)}</span>
                      </div>
                    </div>
                    {car.resumen && <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 12 }}>{car.resumen}</div>}
                    {car.alertas && car.alertas.length > 0 && <div style={{ background: "#1a0a00", border: "1px solid #7c2d12", borderRadius: 6, padding: "6px 8px", fontSize: 11, color: "#fb923c", marginBottom: 10 }}>⚠️ {car.alertas.join(" · ")}</div>}
                    <a href={car.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "9px", fontSize: 13, color: "#fff", textDecoration: "none", fontWeight: 500 }}>Ver anuncio en {car.portal} →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const labelStyle = { fontSize: 11, color: "#555", display: "block", marginBottom: 5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = { width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const Pill = ({ children, accent }) => (
  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 99, background: accent ? "#2a0a0e" : "#1a1a1a", color: accent ? "#f87171" : "#666", border: `1px solid ${accent ? "#7f1d1d" : "#2a2a2a"}` }}>
    {children}
  </span>
);
