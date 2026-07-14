export async function POST(request) {
  try {
    const { userId, email } = await request.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        "mode": "subscription",
        "customer_email": email,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "success_url": `${appUrl}/dashboard?success=true`,
        "cancel_url": `${appUrl}/precios?cancel=true`,
        "metadata[userId]": userId,
      }).toString(),
    });

    const session = await response.json();
    
    if (session.error) {
      return Response.json({ error: session.error.message }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
