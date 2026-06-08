import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callApify(actorId, input) {
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=55`;
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

async function getWallapop(query, precioMin, precioMax, kmMax, anyoMin) {
  const data = await callApify("rastriq~wallapop-cars-scraper", {
    keywords: query,
    minPrice: precioMin,
    maxPrice: precioMax,
    maxMileage: kmMax,
    minYear: anyoMin,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
      apifyProxyCountry: "ES"
    }
  });
  return data.map(a => ({
    titulo: a.title || a.name || "",
    descripcion: a.description || "",
    precio: a.price,
    km: a.mileage || a.km,
    anyo: a.year,
    cv: a.enginePower || a.power,
    combustible: a.fuelType || a.fuel,
    cambio: a.transmission || a.gearbox,
    imagen: a.images?.[0] || a.image || a.thumbnail,
    url: a.url || a.itemUrl,
    portal: "Wallapop",
  })).filter(a => a.titulo && a.url);
}

async function getCochesNet(query, precioMax, kmMax, anyoMin) {
  const searchUrl = `https://www.coches.net/segunda-mano/?q=${encodeURIComponent(query)}${precioMax ? `&preciomax=${precioMax}` : ""}${kmMax ? `&kmsmax=${kmMax}` : ""}${anyoMin ? `&anodesde=${anyoMin}` : ""}`;
  const data = await callApify("apify~web-scraper", {
    startUrls: [{ url: searchUrl }],
    pageFunction: `async function pageFunction(context) {
      const { $ } = context;
      const results = [];
      $(".mt-CardAd").each((i, el) => {
        const title = $(el).find(".mt-CardAd-title").text().trim();
        const price = $(el).find(".mt-CardAd-price").text().replace(/[^0-9]/g,"");
        const km = $(el).find(".mt-CardAd-atribute--km").text().replace(/[^0-9]/g,"");
        const year = $(el).find(".mt-CardAd-atribute--year").text().trim();
        const url = $(el).find("a").attr("href");
        const img = $(el).find("img").attr("src");
        if(title && url) results.push({ title, price: parseInt(price)||null, km: parseInt(km)||null, year: parseInt(year)||null, url: url.startsWith("http") ? url : "https://www.coches.net"+url, image: img });
      });
      return results;
    }`,
    maxPagesPerCrawl: 1,
  });
  return data.map(a => ({
    titulo: a.title || "",
    descripcion: "",
    precio: a.price,
    km: a.km,
    anyo: a.year,
    cv: null,
    combustible: null,
    cambio: null,
    imagen: a.image,
    url: a.url,
    portal: "Coches.net",
  })).filter(a => a.titulo && a.url);
}

async function getMilanuncios(query, precioMax, kmMax, anyoMin) {
  const searchUrl = `https://www.milanuncios.com/coches-de-segunda-mano/?titulo=${encodeURIComponent(query)}${precioMax ? `&preciomax=${precioMax}` : ""}`;
  const data = await callApify("apify~web-scraper", {
    startUrls: [{ url: searchUrl }],
    pageFunction: `async function pageFunction(context) {
      const { $ } = context;
      const results = [];
      $(".ma-AdCard").each((i, el) => {
        const title = $(el).find(".ma-AdCard-title").text().trim();
        const price = $(el).find(".ma-AdCard-price").text().replace(/[^0-9]/g,"");
        const url = $(el).find("a").attr("href");
        const img = $(el).find("img").attr("src");
        if(title && url) results.push({ title, price: parseInt(price)||null, url: url.startsWith("http") ? url : "https://www.milanuncios.com"+url, image: img });
      });
      return results;
    }`,
    maxPagesPerCrawl: 1,
  });
  return data.map(a => ({
    titulo: a.title || "",
    descripcion: "",
    precio: a.price,
    km: null,
    anyo: null,
    cv: null,
    combustible: null,
    cambio: null,
    imagen: a.image,
    url: a.url,
    portal: "Milanuncios",
  })).filter(a => a.titulo && a.url);
}

async function analyzeWithClaude(anuncio, filtros) {
  const prompt = `Eres un experto en coches de segunda mano en España. Analiza este anuncio y determina si cumple los filtros del comprador.

FILTROS:
- Marca/Modelo: ${[filtros.marca !== "Cualquiera" ? filtros.marca : "", filtros.modelo].filter(Boolean).join(" ")}
- Precio máximo: ${filtros.precioMax ? filtros.precioMax + "€" : "sin límite"}
- Precio mínimo: ${filtros.precioMin ? filtros.precioMin + "€" : "sin límite"}
- Km máximos: ${filtros.kmMax ? filtros.kmMax + " km" : "sin límite"}
- Año mínimo: ${filtros.anyoMin || "sin límite"}
- CV mínimos: ${filtros.cvMin || "sin límite"}
- Combustible: ${filtros.combustible}
- Cambio: ${filtros.cambio}

ANUNCIO:
Título: ${anuncio.titulo}
Precio: ${anuncio.precio || "no indicado"}
Km: ${anuncio.km || "no indicado"}
Año: ${anuncio.anyo || "no indicado"}
Portal: ${anuncio.portal}

Responde SOLO con JSON:
{
  "cumple": true/false,
  "score": número 1-10,
  "resumen": "frase corta",
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
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].text.trim().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const filtros = await request.json();
    const query = [filtros.marca !== "Cualquiera" ? filtros.marca : "", filtros.modelo].filter(Boolean).join(" ").trim();
    if (!query) return Response.json({ error: "Introduce marca o modelo" }, { status: 400 });

    const pMin = filtros.precioMin ? Number(filtros.precioMin) : undefined;
    const pMax = filtros.precioMax ? Number(filtros.precioMax) : undefined;
    const km = filtros.kmMax ? Number(filtros.kmMax) : undefined;
    const anyo = filtros.anyoMin ? Number(filtros.anyoMin) : undefined;

    // Buscar en todos los portales en paralelo
    const [wallapop, cochesnet, milanuncios] = await Promise.all([
      getWallapop(query, pMin, pMax, km, anyo),
      getCochesNet(query, pMax, km, anyo),
      getMilanuncios(query, pMax, km, anyo),
    ]);

    const todos = [...wallapop, ...cochesnet, ...milanuncios].slice(0, 20);
    if (todos.length === 0) return Response.json({ results: [] });

    // Analizar uno a uno para evitar error 429
    const results = [];
    for (const anuncio of todos) {
      await new Promise(r => setTimeout(r, 200));
      const analisis = await analyzeWithClaude(anuncio, filtros);
      if (analisis && analisis.cumple) {
        results.push({
          ...anuncio,
          score: analisis.score || 5,
          resumen: analisis.resumen || "",
          alertas: analisis.alertas || [],
          precio: analisis.precio || anuncio.precio,
          km: analisis.km || anuncio.km,
          anyo: analisis.anyo || anuncio.anyo,
          cv: analisis.cv || anuncio.cv,
          combustible: analisis.combustible || anuncio.combustible,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return Response.json({ results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
