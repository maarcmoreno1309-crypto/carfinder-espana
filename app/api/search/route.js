import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callApifyWallapop(query, precioMin, precioMax) {
  const url = `https://api.apify.com/v2/acts/jupri~wallapop-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=55`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search: query,
        category: "cars",
        minPrice: precioMin || undefined,
        maxPrice: precioMax || undefined,
        maxItems: 15,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function callApifyCochesNet(query, precioMax) {
  const url = `https://api.apify.com/v2/acts/apify~web-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=55`;
  try {
    const searchUrl = `https://www.coches.net/segunda-mano/?q=${encodeURIComponent(query)}${precioMax ? `&price_to=${precioMax}` : ""}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: searchUrl }],
        maxPagesPerCrawl: 1,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function analyzeWithClaude(anuncio, filtros) {
  const prompt = `Eres un experto en coches de segunda mano en España. Analiza este anuncio y determina si cumple los filtros del comprador.

FILTROS DEL COMPRADOR:
- Marca: ${filtros.marca !== "Cualquiera" ? filtros.marca : "cualquiera"}
- Modelo: ${filtros.modelo || "cualquiera"}
- Precio máximo: ${filtros.precioMax ? filtros.precioMax + "€" : "sin límite"}
- Precio mínimo: ${filtros.precioMin ? filtros.precioMin + "€" : "sin límite"}
- Km máximos: ${filtros.kmMax ? filtros.kmMax + " km" : "sin límite"}
- Año mínimo: ${filtros.anyoMin || "sin límite"}
- CV mínimos: ${filtros.cvMin || "sin límite"}
- Combustible: ${filtros.combustible}
- Cambio: ${filtros.cambio}

ANUNCIO:
Título: ${anuncio.titulo || anuncio.title || ""}
Descripción: ${(anuncio.descripcion || anuncio.description || "").substring(0, 500)}
Precio: ${anuncio.precio || anuncio.price || ""}
Km: ${anuncio.km || anuncio.kilometers || ""}
Año: ${anuncio.anyo || anuncio.year || ""}

Responde SOLO con JSON sin markdown:
{
  "cumple": true/false,
  "score": número del 1 al 10,
  "resumen": "frase corta de por qué es buena o mala oferta",
  "alertas": [],
  "precio": número o null,
  "km": número o null,
  "anyo": número o null,
  "cv": número o null,
  "combustible": "string o null"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].text.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const filtros = await request.json();
    const query = [filtros.marca !== "Cualquiera" ? filtros.marca : "", filtros.modelo].filter(Boolean).join(" ").trim();
    if (!query) return Response.json({ error: "Introduce marca o modelo" }, { status: 400 });

    const wallapopRaw = await callApifyWallapop(
      query,
      filtros.precioMin ? Number(filtros.precioMin) : undefined,
      filtros.precioMax ? Number(filtros.precioMax) : undefined
    );

    const anuncios = wallapopRaw.map(a => ({
      titulo: a.title || a.name || a.titulo || "",
      descripcion: a.description || a.descripcion || "",
      precio: a.price || a.precio,
      km: a.km || a.kilometers || a.mileage,
      anyo: a.year || a.anyo,
      cv: a.power || a.cv,
      combustible: a.fuelType || a.fuel || a.combustible,
      cambio: a.gearbox || a.transmission || a.cambio,
      imagen: a.images?.[0] || a.image || a.thumbnail || a.imagen,
      url: a.url || a.link || a.itemUrl,
      portal: "Wallapop",
    })).filter(a => a.titulo && a.url);

    if (anuncios.length === 0) return Response.json({ results: [] });

    const aAnalizar = anuncios.slice(0, 15);
    const analizados = await Promise.all(
      aAnalizar.map(async (anuncio) => {
        const analisis = await analyzeWithClaude(anuncio, filtros);
        if (!analisis || !analisis.cumple) return null;
        return {
          ...anuncio,
          score: analisis.score || 5,
          resumen: analisis.resumen || "",
          alertas: analisis.alertas || [],
          precio: analisis.precio || anuncio.precio,
          km: analisis.km || anuncio.km,
          anyo: analisis.anyo || anuncio.anyo,
          cv: analisis.cv || anuncio.cv,
          combustible: analisis.combustible || anuncio.combustible,
        };
      })
    );

    const results = analizados.filter(Boolean).sort((a, b) => b.score - a.score);
    return Response.json({ results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
