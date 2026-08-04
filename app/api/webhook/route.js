export async function POST(request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    const actualizarPlan = async (userId, plan) => {
      if (!userId) return;
      await fetch(`${supabaseUrl}/rest/v1/perfiles?id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ plan }),
      });
    };

    const actualizarPorCustomer = async (customerId, plan) => {
      if (!customerId) return;
      await fetch(`${supabaseUrl}/rest/v1/perfiles?stripe_customer=eq.${customerId}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ plan }),
      });
    };

    switch (event.type) {
      // Pago completado → activar premium y guardar customer id
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer;
        if (userId) {
          await fetch(`${supabaseUrl}/rest/v1/perfiles?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({ plan: "premium", stripe_customer: customerId }),
          });
        }
        break;
      }

      // Suscripción cancelada → volver a free
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await actualizarPorCustomer(sub.customer, "free");
        break;
      }

      // Fallo de pago → volver a free
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await actualizarPorCustomer(invoice.customer, "free");
        break;
      }
    }

    return Response.json({ received: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
