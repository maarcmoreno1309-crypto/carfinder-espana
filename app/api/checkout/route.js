import Stripe from "stripe";

export async function POST(request) {
  try {
    console.log("STRIPE_SECRET_KEY existe:", !!process.env.STRIPE_SECRET_KEY);
    console.log("STRIPE_PRICE_ID:", process.env.STRIPE_PRICE_ID);
    console.log("APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId, email } = await request.json();

    console.log("userId:", userId, "email:", email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/precios?cancel=true`,
      metadata: { userId },
    });

    return Response.json({ url: session.url });
  } catch (e) {
    console.error("ERROR STRIPE:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
