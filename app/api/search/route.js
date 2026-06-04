import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ACTORS = {
  wallapop: "rastriq~wallapop-cars-scraper",
  cochesnet: "kaidev~coches-net-scraper",
};

async function callApify(actorId, input) {
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=60`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
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
Combustible: ${anuncio.combustible || anuncio.fuelType || ""}
Cambio: ${anuncio.cambio || anuncio.gearbox || ""}
CV: ${anuncio.cv || anuncio.power || ""}

Responde SOLO con JSON sin markdown:
{
  "cumple": true/false,
  "score": número del 1 al 10,
  "resumen": "frase corta de por qué es buena o mala oferta",
  "alertas": ["alerta1 si hay algo sospechoso"],
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

    const [wallapopRaw, cochesRaw] = await Promise.all([
      callApify(ACTORS.wallapop, {
        search: query,
        minPrice: filtros.precioMin ? Number(filtros.precioMin) : undefined,
        maxPrice: filtros.precioMax ? Number(filtros.precioMax) : undefined,
        maxResults: 20,
      }),
      callApify(ACTORS.cochesnet, {
        search: query,
        maxPrice: filtros.precioMax ? Number(filtros.precioMax) : undefined,
        maxResults: 20,
      }),
    ]);

    const anuncios = [
      ...wallapopRaw.map(a => ({
        titulo: a.title || a.titulo || "",
        descripcion: a.description || a.descripcion || "",
        precio: a.price || a.precio,
        km: a.km || a.kilometers,
        anyo: a.year || a.anyo,
        cv: a.power || a.cv,
        combustible: a.fuelType || a.combustible,
        cambio: a.gearbox || a.cambio,
        imagen: a.images?.[0] || a.image || a.imagen,
        url: a.url || a.link,
        portal: "Wallapop",
      })),
      ...cochesRaw.map(a => ({
        titulo: a.title || a.titulo || "",
        descripcion: a.description || a.descripcion || "",
        precio: a.price || a.precio,
        km: a.km || a.mileage,
        anyo: a.year || a.anyo,
        cv: a.power || a.cv,
        combustible: a.fuelType || a.combustible,
        cambio: a.gearbox || a.cambio,
        imagen: a.images?.[0] || a.image,
        url: a.url || a.link,
        portal: "Coches.net",
      })),
    ].filter(a => a.titulo && a.url);

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
