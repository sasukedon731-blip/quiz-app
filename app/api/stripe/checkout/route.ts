// app/api/stripe/checkout/route.ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { adminAuth } from "@/app/lib/firebaseAdmin"
import { setUserBillingMerge } from "@/app/lib/billingServer"

export const runtime = "nodejs"

type Body = {
  idToken: string
  plan: "3" | "5" | "all"
  method: "convenience" | "card"
  durationDays: 30 | 180 | 365
}

const PRICE_TABLE: Record<Body["plan"], Record<30 | 180 | 365, number>> = {
  "3": { 30: 2980, 180: Math.round(2980 * 6 * 0.9), 365: Math.round(2980 * 12 * 0.8) },
  "5": { 30: 4980, 180: Math.round(4980 * 6 * 0.9), 365: Math.round(4980 * 12 * 0.8) },
  all: { 30: 7980, 180: Math.round(7980 * 6 * 0.9), 365: Math.round(7980 * 12 * 0.8) },
}


export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    if (!body?.idToken || !body?.plan || !body?.method) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 })
    }

    // ✅ Verify Firebase user
    const decoded = await adminAuth().verifyIdToken(body.idToken)
    const uid = decoded.uid

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    })

    const amount = PRICE_TABLE[body.plan][body.durationDays]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // ✅ Create Checkout Session (one-time payment)
    // Konbini (convenience store) is async: customer pays later, webhook flips pending -> active.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name:
                body.plan === "3"
                  ? `3教材プラン（${body.durationDays}日）`
                  : body.plan === "5"
                  ? `5教材プラン（${body.durationDays}日）`
                  : `ALLプラン（${body.durationDays}日）`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      // ✅ If you enable dynamic payment methods, Stripe can show konbini automatically when eligible.
      // For MVP, we force the method the user selected.
      payment_method_types: body.method === "convenience" ? ["konbini"] : ["card"],
      success_url: `${appUrl}/plans?checkout=success`,
      cancel_url: `${appUrl}/plans?checkout=cancel`,
      client_reference_id: uid,
      metadata: {
        uid,
        plan: body.plan,
        method: body.method,
      },
      payment_intent_data: {
        metadata: {
          uid,
          plan: body.plan,
          method: body.method,
          durationDays: String(body.durationDays),
        },
      },
    })

    // ✅ Set billing to pending immediately (card may become paid quickly, webhook will flip to active)
    await setUserBillingMerge(uid, {
      accountType: "personal",
      method: body.method,
      status: "pending",
      currentPlan: body.plan,
      currentPeriodEnd: null,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 })
  }
}
