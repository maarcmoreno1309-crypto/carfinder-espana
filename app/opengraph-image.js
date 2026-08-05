import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CarFinder — Encuentra tu coche sin buscar en mil webs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#050505",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grid de fondo tipo radar */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Halo verde superior */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: 400,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.25), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Contenido */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 80px",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Logo arriba */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#22C55E",
                display: "flex",
              }}
            />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "#F5F5F5" }}>
              <span style={{ color: "#22C55E" }}>Car</span>
              <span>Finder</span>
            </div>
            <div
              style={{
                marginLeft: 8,
                fontSize: 15,
                color: "#666",
                border: "1px solid #333",
                borderRadius: 20,
                padding: "4px 14px",
                display: "flex",
              }}
            >
              ESPAÑA
            </div>
          </div>

          {/* Titular central */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 76,
                fontWeight: 800,
                color: "#F5F5F5",
                lineHeight: 1.05,
                letterSpacing: "-2px",
              }}
            >
              <span>Deja de abrir mil pestañas</span>
              <span>
                buscando tu <span style={{ color: "#22C55E" }}>próximo coche.</span>
              </span>
            </div>
            <div style={{ display: "flex", fontSize: 30, color: "#999", lineHeight: 1.4 }}>
              Pon tus filtros una vez. Rastreamos todos los portales por ti.
            </div>
          </div>

          {/* Barra inferior de features */}
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, color: "#F5F5F5" }}>
              <span style={{ color: "#22C55E", display: "flex" }}>✓</span> Gratis
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, color: "#F5F5F5" }}>
              <span style={{ color: "#22C55E", display: "flex" }}>✓</span> Sin registro
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, color: "#F5F5F5" }}>
              <span style={{ color: "#22C55E", display: "flex" }}>✓</span> Verificado con IA
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
