export const metadata = {
  title: "CarFinder España",
  description: "Busca coches en todos los portales a la vez. Sin abrir mil pestañas.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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
        `}</style>
        {children}
      </body>
    </html>
  );
}
