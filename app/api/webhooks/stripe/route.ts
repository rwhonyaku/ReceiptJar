import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

// Initialize Stripe with latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

// In-memory store for confirmed payments (use Redis/DB in production)
const confirmedPayments = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    // CORRECT: Await headers() first, then call .get()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      )
    }

    console.log(`✅ Webhook received: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('💰 Payment confirmed for session:', session.id)
        console.log('📦 Metadata:', session.metadata)
        
        // Store that this payment is confirmed
        confirmedPayments.add(session.id)
        
        // Here you could:
        // 1. Save to database
        // 2. Send confirmation email
        // 3. Trigger receipt processing
        // 4. Start 30-minute deletion timer
        
        if (session.metadata?.localSessionId) {
          console.log(`🔗 Local session: ${session.metadata.localSessionId}`)
          // In production: Save session.metadata.localSessionId to database
          // along with the Stripe session ID
        }
        
        break
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('⏰ Session expired:', session.id)
        // Clean up any pending data
        break
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💳 Payment succeeded:', paymentIntent.id)
        break
      }
      
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log('↩️ Charge refunded:', charge.id)
        // Remove access to downloads if refunded
        break
      }
      
      default:
        console.log(`⚡ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('💥 Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper to check if payment is confirmed
export function isPaymentConfirmed(sessionId: string): boolean {
  return confirmedPayments.has(sessionId)
}