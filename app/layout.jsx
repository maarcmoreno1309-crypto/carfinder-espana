export const metadata = {
  title: "AutoScan — Encuentra tu coche sin buscar en mil webs",
  description: "Pon tus filtros una vez y rastreamos todos los portales de coches de segunda mano por ti. Solo ves las ofertas que de verdad te interesan. Gratis y sin registro.",
  metadataBase: new URL("https://autoscan.es"),
  openGraph: {
    title: "AutoScan — Encuentra tu coche sin buscar en mil webs",
    description: "Pon tus filtros una vez y rastreamos todos los portales por ti. Solo ves las ofertas que de verdad te interesan.",
    url: "https://autoscan.es",
    siteName: "AutoScan",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoScan — Encuentra tu coche sin buscar en mil webs",
    description: "Pon tus filtros una vez y rastreamos todos los portales por ti.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body style={{ margin: 0, padding: 0, overflowX: "hidden" }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; overflow-x: hidden; }
          input, select, button { font-size: 16px; }

          @media (max-width: 640px) {
            .nav-count { display: none !important; }
            h1 { font-size: 32px !important; }
            .row2, .row3, .row4 { grid-template-columns: 1fr !important; }
            .results-grid { grid-template-columns: 1fr !important; }
            .steps-grid { grid-template-columns: 1fr !important; }
            .plans-grid { grid-template-columns: 1fr !important; }
            .dash-grid { grid-template-columns: 1fr !important; }
            .ex-card-body { flex-direction: column !important; }
            .faq-grid { grid-template-columns: 1fr !important; }
            .hero-stats { flex-wrap: wrap !important; gap: 12px !important; }
            section { padding-left: 1rem !important; padding-right: 1rem !important; }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
