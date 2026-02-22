// app/api/stripe/checkout/route.ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { adminAuth } from "@/app/lib/firebaseAdmin"
import { setUserBillingMerge } from "@/app/lib/billingServer"

export const runtime = "nodejs"

type IndustryId =
  | "construction"
  | "manufacturing"
  | "care"
  | "driver"
  | "undecided"

type Body = {
  idToken: string
  plan: "3" | "5" | "all"
  method: "convenience" | "card"
  durationDays: 30 | 180 | 365
  industry?: IndustryId | null
}

// ✅ 30日=500円（3教材プラン）に合わせた価格テーブル
// - 半年：10%OFF
// - 年：20%OFF
const PRICE_TABLE: Record<Body["plan"], Record<30 | 180 | 365, number>> = {
  "3": {
    30: 500,
    180: Math.round(500 * 6 * 0.9),
    365: Math.round(500 * 12 * 0.8),
  },
  "5": {
    30: 4980,
    180: Math.round(4980 * 6 * 0.9),
    365: Math.round(4980 * 12 * 0.8),
  },
  all: {
    30: 7980,
    180: Math.round(7980 * 6 * 0.9),
    365: Math.round(7980 * 12 * 0.8),
  },
}

function isValidDuration(v: any): v is 30 | 180 | 365 {
  return v === 30 || v === 180 || v === 365
}

function isIndustryId(v: any): v is IndustryId {
  return (
    v === "construction" ||
    v === "manufacturing" ||
    v === "care" ||
    v === "driver" ||
    v === "undecided"
  )
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body

    if (!body?.idToken || !body?.plan || !body?.method) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 })
    }
    if (body.plan !== "3" && body.plan !== "5" && body.plan !== "all") {
      return NextResponse.json({ error: "Bad plan" }, { status: 400 })
    }
    if (body.method !== "convenience" && body.method !== "card") {
      return NextResponse.json({ error: "Bad method" }, { status: 400 })
    }
    if (!isValidDuration(body.durationDays)) {
      return NextResponse.json({ error: "Bad durationDays" }, { status: 400 })
    }

    // industry は任意（未選択OK）
    const industry = isIndustryId(body.industry) ? body.industry : undefined

    // ✅ Verify Firebase user
    const decoded = await adminAuth().verifyIdToken(body.idToken)
    const uid = decoded.uid

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    })

    const amount = PRICE_TABLE[body.plan][body.durationDays]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const planName =
      body.plan === "3"
        ? "3教材プラン"
        : body.plan === "5"
        ? "5教材プラン"
        : "ALLプラン"

    // ✅ Create Checkout Session (one-time payment)
    // Konbini is async: webhook flips pending -> active.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `${planName}（${body.durationDays}日）`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_method_types:
        body.method === "convenience" ? ["konbini"] : ["card"],
      success_url: `${appUrl}/plans?checkout=success`,
      cancel_url: `${appUrl}/plans?checkout=cancel`,
      client_reference_id: uid,

      // ✅ ここに industry を入れて webhook で確実に拾う
      metadata: {
        uid,
        plan: body.plan,
        method: body.method,
        durationDays: String(body.durationDays),
        ...(industry ? { industry } : {}),
      },

      payment_intent_data: {
        metadata: {
          uid,
          plan: body.plan,
          method: body.method,
          durationDays: String(body.durationDays),
          ...(industry ? { industry } : {}),
        },
      },
    })

    // ✅ Set billing to pending immediately
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
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    )
  }
}