import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { storeReceipts } from '@/lib/receipt-storage' // ← ADD THIS IMPORT

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, receiptCount, localSessionId, receiptData } = await request.json()
    
    // Validate inputs
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    if (!localSessionId) {
      return NextResponse.json(
        { error: 'Local session ID is required' },
        { status: 400 }
      )
    }

    console.log('📦 Checkout request:', { 
      priceId, 
      receiptCount, 
      localSessionId,
      receiptDataCount: receiptData?.length || 0 
    })

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&local_session=${localSessionId}&count=${receiptCount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tool`,
      metadata: {
        receiptCount: receiptCount.toString(),
        localSessionId,
        processedAt: new Date().toISOString()
      }
    })

    // ✅ STORE RECEIPTS HERE
    if (receiptData && receiptData.length > 0) {
      storeReceipts(localSessionId, session.id, receiptData)
      console.log(`💾 Stored ${receiptData.length} receipts for session: ${localSessionId}`)
    } else {
      console.log('⚠️ No receipt data received to store')
    }

    console.log('✅ Checkout session created:', session.id)

    return NextResponse.json({ 
      url: session.url
    })
  } catch (error: any) {
    console.error('💥 Stripe error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout',
        details: error.message 
      },
      { status: 500 }
    )
  }
}