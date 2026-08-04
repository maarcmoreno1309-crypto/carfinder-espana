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

async function callApify(actorId, input) {
  const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=120`;
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

function dedupe(anuncios) {
  const vistos = new Set();
  return anuncios.filter(a => {
    if (!a.url || vistos.has(a.url)) return false;
    vistos.add(a.url);
    return true;
  });
}

async function scrapeWallapop(query) {
  const data = await callApify("rastriq~wallapop-cars-scraper", {
    keywords: query,
    maxItems: 50,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
      apifyProxyCountry: "ES"
    }
  });
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
  }));
}

async function scrapeCochesNet(marca, modelo) {
  const data = await callApify("rastriq~cochesnet-spain", {
    make: marca,
    model: modelo,
    maxItems: 50,
    maxPages: 3,
  });
  return data.map(a => ({
    titulo: a.title || a.name || `${marca} ${modelo}`,
    descripcion: a.description || "",
    precio: a.price || null,
    km: a.mileage || a.km || null,
    anyo: a.year || null,
    cv: a.enginePower || a.power || null,
    combustible: a.fuelType || a.fuel || null,
    cambio: a.transmission || a.gearbox || null,
    imagen: a.images?.[0] || a.image || a.thumbnail || null,
    url: a.url || a.link || null,
    portal: "Coches.net",
    marca: marca,
    modelo: `${marca} ${modelo}`,
    updated_at: new Date().toISOString(),
  }));
}

async function guardar(anuncios) {
  const limpios = dedupe(anuncios).filter(a => a.titulo && a.url);
  if (limpios.length === 0) return 0;
  const { error } = await supabase
    .from("anuncios")
    .upsert(limpios, { onConflict: "url", ignoreDuplicates: false });
  return error ? 0 : limpios.length;
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalGuardados = 0;
  const errores = [];

  for (const marca of MARCAS_POPULARES) {
    // Wallapop
    try {
      const wallapop = await scrapeWallapop(marca);
      totalGuardados += await guardar(wallapop);
    } catch (e) {
      errores.push({ portal: "Wallapop", marca, error: e.message });
    }

    // Coches.net (separar marca y modelo)
    try {
      const partes = marca.split(" ");
      const marcaSola = partes[0];
      const modeloSolo = partes.slice(1).join(" ");
      const coches = await scrapeCochesNet(marcaSola, modeloSolo);
      totalGuardados += await guardar(coches);
    } catch (e) {
      errores.push({ portal: "Coches.net", marca, error: e.message });
    }
  }

  return Response.json({
    success: true,
    totalGuardados,
    errores,
    timestamp: new Date().toISOString(),
  });
}
