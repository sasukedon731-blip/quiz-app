// app/api/stripe/webhook/route.ts
import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { setUserBillingMerge } from "@/app/lib/billingServer"

export const runtime = "nodejs"

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function parseDurationDays(v: any): 30 | 180 | 365 {
  const n = Number(v)
  return n === 180 ? 180 : n === 365 ? 365 : 30
}

function parsePlan(v: any): "3" | "5" | "all" | null {
  return v === "3" || v === "5" || v === "all" ? v : null
}

function parseMethod(v: any): "convenience" | "card" {
  return v === "convenience" ? "convenience" : "card"
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
  })

  const sig = (await headers()).get("stripe-signature")
  if (!sig)
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    )

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err?.message)
    return NextResponse.json({ error: "Bad signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      // Checkout completed (customer finished hosted flow).
      // For async methods (konbini), payment might still be unpaid here.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const uid = (session.metadata?.uid || session.client_reference_id) as
          | string
          | undefined
        if (!uid) break

        const plan = parsePlan(session.metadata?.plan)
        const method = parseMethod(session.metadata?.method)
        const durationDays = parseDurationDays(session.metadata?.durationDays)

        const paid = session.payment_status === "paid"

        // ✅ planが取れない場合は、ここで currentPlan を勝手に上書きしない（安全）
        await setUserBillingMerge(uid, {
          accountType: "personal",
          method,
          status: paid ? "active" : "pending",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          ...(plan ? { currentPlan: plan } : {}),
          currentPeriodEnd: paid ? addDays(new Date(), durationDays) : null,
        })

        break
      }

      // Payment succeeded (card immediately, konbini after customer pays at store)
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent
        const uid = pi.metadata?.uid as string | undefined
        if (!uid) break

        const plan = parsePlan(pi.metadata?.plan)
        const method = parseMethod(pi.metadata?.method)
        const durationDays = parseDurationDays(pi.metadata?.durationDays)

        await setUserBillingMerge(uid, {
          accountType: "personal",
          method,
          status: "active",
          stripePaymentIntentId: pi.id,
          ...(plan ? { currentPlan: plan } : {}),
          currentPeriodEnd: addDays(new Date(), durationDays),
        })

        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        const uid = pi.metadata?.uid as string | undefined
        if (uid) {
          await setUserBillingMerge(uid, {
            status: "past_due",
            stripePaymentIntentId: pi.id,
          })
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (e: any) {
    console.error("Webhook handler error:", e)
    return NextResponse.json(
      { error: e?.message ?? "Webhook error" },
      { status: 500 }
    )
  }
}