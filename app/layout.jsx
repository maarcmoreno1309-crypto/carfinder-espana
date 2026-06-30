export const metadata = {
  title: "CarFinder España",
  description: "Busca coches en todos los portales a la vez",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          * { box-sizing: border-box; }
          body { margin: 0; }
        `}</style>
        {children}
      </body>
    </html>
  );
}
