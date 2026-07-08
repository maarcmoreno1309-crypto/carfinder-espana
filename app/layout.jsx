export const metadata = {
  title: "CarFinder España",
  description: "Busca coches en todos los portales a la vez. Sin abrir mil pestañas.",
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

          /* MÓVIL — pantalla estrecha vertical */
          @media (max-width: 640px) {
            /* Navbar */
            .nav-count { display: none !important; }

            /* Hero */
            h1 { font-size: 32px !important; }

            /* Buscador */
            .row2, .row3, .row4 {
              grid-template-columns: 1fr !important;
            }

            /* Resultados */
            .results-grid {
              grid-template-columns: 1fr !important;
            }

            /* Steps */
            .steps-grid {
              grid-template-columns: 1fr !important;
            }

            /* Plans */
            .plans-grid {
              grid-template-columns: 1fr !important;
            }

            /* Dashboard grid */
            .dash-grid {
              grid-template-columns: 1fr !important;
            }

            /* Example card */
            .ex-card-body {
              flex-direction: column !important;
            }

            /* FAQ grid */
            .faq-grid {
              grid-template-columns: 1fr !important;
            }

            /* Hero stats */
            .hero-stats {
              flex-wrap: wrap !important;
              gap: 12px !important;
            }

            /* Padding general */
            section { padding-left: 1rem !important; padding-right: 1rem !important; }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
