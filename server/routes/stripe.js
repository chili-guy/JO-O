import { Router } from "express";
import Stripe from "stripe";
import { getStoryById, addStoryAccess } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const appUrl = process.env.VITE_APP_URL || process.env.PUBLIC_APP_URL || "http://localhost:8080";

const router = Router();

/**
 * POST /api/stripe/create-checkout-session
 * Cria sessão Stripe Checkout para compra avulsa do conto.
 * Body: { storyId }
 * Requer: Authorization Bearer <token>
 */
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  if (!stripeSecret) {
    return res.status(503).json({ error: "Pagamentos não configurados. Configure STRIPE_SECRET_KEY." });
  }
  const { storyId } = req.body || {};
  if (!storyId) {
    return res.status(400).json({ error: "storyId é obrigatório" });
  }
  const story = getStoryById(storyId);
  if (!story) {
    return res.status(404).json({ error: "Conto não encontrado" });
  }
  const amountCents = Math.round((story.price ?? 8.9) * 100);
  if (amountCents < 50) {
    return res.status(400).json({ error: "Valor inválido" });
  }
  try {
    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: story.title,
              description: story.excerpt?.slice(0, 150) || "Acesso vitalício a este relato.",
              images: story.imageUrl ? [story.imageUrl] : undefined,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.userId,
        storyId,
      },
      success_url: `${appUrl}/conto/${storyId}?compra=ok`,
      cancel_url: `${appUrl}/conto/${storyId}?compra=cancelada`,
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe create-checkout-session:", err);
    return res.status(500).json({ error: err.message || "Erro ao criar sessão de pagamento" });
  }
});

/**
 * Handler do webhook Stripe (raw body). Registrar em index.js ANTES de express.json().
 * Evento checkout.session.completed -> concede acesso ao conto (user_stories).
 */
export async function stripeWebhookHandler(req, res) {
  if (!stripeSecret || !stripeWebhookSecret) {
    return res.status(503).send("Webhook não configurado");
  }
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).send("Falta stripe-signature");
  }
  let event;
  try {
    const stripe = new Stripe(stripeSecret);
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const storyId = session.metadata?.storyId;
    if (userId && storyId) {
      addStoryAccess(userId, storyId);
      console.log(`Acesso concedido: user=${userId} story=${storyId}`);
    }
  }
  res.json({ received: true });
}

export default router;
