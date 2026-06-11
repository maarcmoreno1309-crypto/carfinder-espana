import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);

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

async function fetchAndSaveWallapop(query) {
  const data = await callApify("rastriq~wallapop-cars-scraper", {
    keywords: query,
    maxItems: 50,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
      apifyProxyCountry: "ES"
    }
  });

  const anuncios = data.map(a => ({
    titulo: a.title || a.name || "",
    descripcion: a.description || "",
    precio: a.price || null,
    km: a.mileage || a.km || null,
    anyo: a.year || null,
    cv: a.enginePower || a.power || null,
    combustible: a.fuelType || a.fuel || null,
    cambio: a.transmission || a.gearbox || null,
    imagen: a.images?.[0] || a.image || a.thumbnail || null,
    url: a.url || a.itemUrl || null,
    portal: "Wallapop",
    marca: query.split(" ")[0] || null,
    modelo: query,
  })).filter(a => a.titulo && a.url);

  if (anuncios.length > 0) {
    await supabase.from("anuncios").upsert(anuncios, { onConflict: "url", ignoreDuplicates: false });
  }

  return anuncios;
}

async function searchFromDatabase(filtros) {
  let query = supabase.from("anuncios").select("*");

  if (filtros.modelo) {
    query = query.ilike("titulo", `%${filtros.modelo}%`);
  }
  if (filtros.marca && filtros.marca !== "Cualquiera") {
    query = query.ilike("titulo", `%${filtros.marca}%`);
  }
  if (filtros.precioMax) query = query.lte("precio", Number(filtros.precioMax));
  if (filtros.precioMin) query = query.gte("precio", Number(filtros.precioMin));
  if (filtros.kmMax) query = query.lte("km", Number(filtros.kmMax));
  if (filtros.anyoMin) query = query.gte("anyo", Number(filtros.anyoMin));

  query = query.order("precio", { ascending: true }).limit(50);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

async function analyzeWithClaude(anuncio, filtros) {
  const prompt = `Eres un experto en coches de segunda mano en España. Analiza este anuncio.

FILTROS:
- Marca/Modelo: ${[filtros.marca !== "Cualquiera" ? filtros.marca : "", filtros.modelo].filter(Boolean).join(" ")}
- Precio máximo: ${filtros.precioMax ? filtros.precioMax + "€" : "sin límite"}
- Km máximos: ${filtros.kmMax ? filtros.kmMax + " km" : "sin límite"}
- Año mínimo: ${filtros.anyoMin || "sin límite"}
- CV mínimos: ${filtros.cvMin || "sin límite"}

ANUNCIO:
Título: ${anuncio.titulo}
Precio: ${anuncio.precio || "no indicado"}€
Km: ${anuncio.km || "no indicado"}
Año: ${anuncio.anyo || "no indicado"}
Portal: ${anuncio.portal}

Responde SOLO con JSON:
{
  "cumple": true/false,
  "score": número 1-10,
  "resumen": "frase corta de máximo 15 palabras",
  "alertas": []
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
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

    // 1. Buscar en base de datos primero
    let anuncios = await searchFromDatabase(filtros);

    // 2. Si hay pocos resultados, buscar en Wallapop y guardar
    if (anuncios.length < 1) {
      await fetchAndSaveWallapop(query);
      anuncios = await searchFromDatabase(filtros);
    }

    if (anuncios.length === 0) return Response.json({ results: [] });

    // 3. Analizar con Claude uno a uno
    const results = [];
    for (const anuncio of anuncios.slice(0, 15)) {
      await new Promise(r => setTimeout(r, 200));
      const analisis = await analyzeWithClaude(anuncio, filtros);
      if (analisis && analisis.cumple) {
        results.push({
          ...anuncio,
          score: analisis.score || 5,
          resumen: analisis.resumen || "",
          alertas: analisis.alertas || [],
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return Response.json({ results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
