export const metadata = {
  title: "CarFinder España",
  description: "Busca coches en todos los portales a la vez",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
