export async function POST(request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    // Cuando se completa un pago de suscripción
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId) {
        // Actualizar el plan del usuario a premium en Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

        await fetch(`${supabaseUrl}/rest/v1/perfiles?id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({ plan: "premium" }),
        });
      }
    }

    return Response.json({ received: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
