export const dynamic = "force-dynamic";
export const maxDuration = 300;
const RESEND_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

async function supa(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) return [];
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function enviarEmail(destinatario, alerta, anuncios) {
  const filas = anuncios.map(a => `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #eee;">
        <div style="font-weight:600;font-size:15px;color:#111;">${a.titulo}</div>
        <div style="font-size:22px;font-weight:800;color:#22C55E;margin:6px 0;">${a.precio ? a.precio.toLocaleString("es-ES") + " €" : "Consultar"}</div>
        <div style="font-size:13px;color:#666;">
          ${a.km ? a.km.toLocaleString("es-ES") + " km · " : ""}${a.anyo || ""} · ${a.portal || ""}
        </div>
        <a href="${a.url}" style="display:inline-block;margin-top:10px;background:#111;color:#fff;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:13px;">Ver anuncio →</a>
      </td>
    </tr>
  `).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
      <div style="padding:24px 0;text-align:center;">
        <span style="font-size:22px;font-weight:800;color:#111;">Car<span style="color:#22C55E;">Finder</span></span>
      </div>
      <div style="background:#f8f8f8;border-radius:16px;padding:24px;">
        <h1 style="font-size:20px;color:#111;margin:0 0 8px;">🔔 Nuevos coches para ti</h1>
        <p style="font-size:14px;color:#666;margin:0 0 20px;">Hemos encontrado ${anuncios.length} ${anuncios.length === 1 ? "anuncio nuevo que encaja" : "anuncios nuevos que encajan"} con tu alerta "<strong>${alerta.modelo}</strong>".</p>
        <table style="width:100%;background:#fff;border-radius:12px;border-collapse:collapse;overflow:hidden;">
          ${filas}
        </table>
      </div>
      <p style="font-size:12px;color:#999;text-align:center;padding:20px;">Recibes este email porque tienes una alerta activa en CarFinder.</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CarFinder <onboarding@resend.dev>",
      to: destinatario,
      subject: `🚗 ${anuncios.length} ${anuncios.length === 1 ? "coche nuevo" : "coches nuevos"} para tu búsqueda "${alerta.modelo}"`,
      html,
    }),
  });
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let emailsEnviados = 0;
  const resumen = [];

  // 1. Traer todas las alertas activas de usuarios premium
  const alertas = await supa("alertas_usuario?activa=eq.true&select=*");

  for (const alerta of alertas) {
    // 2. Verificar que el usuario es premium
    const perfiles = await supa(`perfiles?id=eq.${alerta.user_id}&select=email,plan`);
    const perfil = perfiles[0];
    if (!perfil || perfil.plan !== "premium") continue;

    // 3. Buscar anuncios que encajen (matching flexible por palabras)
    const palabras = alerta.modelo.trim().split(/\s+/).filter(p => p.length > 1);
    let query = `anuncios?select=*`;
    for (const palabra of palabras) {
      query += `&titulo=ilike.*${encodeURIComponent(palabra)}*`;
    }
    if (alerta.precio_min) query += `&precio=gte.${alerta.precio_min}`;
    if (alerta.precio_max) query += `&precio=lte.${alerta.precio_max}`;
    if (alerta.km_max) query += `&km=lte.${alerta.km_max}`;
    if (alerta.anyo_min) query += `&anyo=gte.${alerta.anyo_min}`;
    query += "&order=created_at.desc&limit=10";

    const anuncios = await supa(query);
    if (anuncios.length === 0) continue;

    // 4. Filtrar los que ya se enviaron
    const yaEnviados = await supa(`alertas_enviadas?alerta_id=eq.${alerta.id}&select=anuncio_url`);
    const urlsEnviadas = new Set(yaEnviados.map(e => e.anuncio_url));
    const nuevos = anuncios.filter(a => a.url && !urlsEnviadas.has(a.url));

    if (nuevos.length === 0) continue;

    // 5. Enviar email
    await enviarEmail(perfil.email, alerta, nuevos);
    emailsEnviados++;
    resumen.push({ email: perfil.email, alerta: alerta.modelo, anuncios: nuevos.length });

    // 6. Marcar como enviados
    for (const a of nuevos) {
      await supa("alertas_enviadas", {
        method: "POST",
        headers: { "Prefer": "resolution=ignore-duplicates" },
        body: JSON.stringify({ alerta_id: alerta.id, anuncio_url: a.url, user_id: alerta.user_id }),
      });
    }
  }

  return Response.json({ success: true, emailsEnviados, resumen, timestamp: new Date().toISOString() });
}
