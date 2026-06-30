import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);

const MARCAS_POPULARES = [
  "Volkswagen Golf", "SEAT Leon", "Renault Megane", "Ford Focus",
  "BMW Serie 1", "BMW Serie 3", "Audi A3", "Audi A4",
  "Mercedes Clase A", "Mercedes Clase C", "Opel Astra", "Toyota Corolla",
  "Honda Civic", "Peugeot 308", "Citroen C4", "Hyundai i30",
  "Kia Ceed", "Nissan Qashqai", "Mazda 3", "Skoda Octavia"
];

async function callApifyWallapop(query) {
  const url = `https://api.apify.com/v2/acts/rastriq~wallapop-cars-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=55`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords: query,
        maxItems: 100,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
          apifyProxyCountry: "ES"
        }
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normalizar(data, query) {
  return data.map(a => ({
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
    updated_at: new Date().toISOString(),
  })).filter(a => a.titulo && a.url);
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalGuardados = 0;
  const errores = [];

  for (const marca of MARCAS_POPULARES) {
    try {
      const data = await callApifyWallapop(marca);
      const anuncios = normalizar(data, marca);

      if (anuncios.length > 0) {
        const { error } = await supabase
          .from("anuncios")
          .upsert(anuncios, { onConflict: "url", ignoreDuplicates: false });

        if (error) {
          errores.push({ marca, error: error.message });
        } else {
          totalGuardados += anuncios.length;
        }
      }
    } catch (e) {
      errores.push({ marca, error: e.message });
    }
  }

  return Response.json({
    success: true,
    totalGuardados,
    errores,
    timestamp: new Date().toISOString(),
  });
}
