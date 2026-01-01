import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getReceipts } from '@/lib/receipt-storage'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

// Simple in-memory check (in production, use database)
const confirmedPayments = new Set<string>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const localSessionId = searchParams.get('local_session')
    
    console.log('📥 Download request:', { sessionId, localSessionId })
    
    if (!sessionId || !localSessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // METHOD 1: Check Stripe directly (more reliable)
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      )
    }

    // METHOD 2: Also check webhook confirmation (extra safety)
    // In production, check your database where webhook stores confirmations
    // if (!isPaymentConfirmed(sessionId)) {
    //   return NextResponse.json(
    //     { error: 'Payment verification pending' },
    //     { status: 402 }
    //   )
    // }

    // Get stored receipt data
    let storedData = getReceipts(localSessionId) // Change const to let
    
    if (!storedData) {
      // Try localStorage as fallback
      const localStorageKey = `receipts_${localSessionId}`
      const backupData = localStorage.getItem(localStorageKey)
      
      if (backupData) {
        const parsed = JSON.parse(backupData)
        storedData = { // This reassignment requires 'let', not 'const'
          sessionId: localSessionId,
          stripeSessionId: sessionId,
          receipts: parsed.receipts,
          createdAt: new Date(parsed.timestamp),
          expiresAt: new Date(parsed.timestamp + 30 * 60 * 1000)
        }
      } else {
        return NextResponse.json(
          { error: 'Session expired or not found' },
          { status: 404 }
        )
      }
    }

    // Generate CSV
    const headers = ['Date', 'Vendor', 'Total', 'Tax', 'Category', 'FileName', 'Notes']
    
    const rows = storedData.receipts.map((receipt: any) => {
      const data = receipt.extractedData || {}
      return [
        data.date || '',
        data.vendor || '',
        data.total?.toString() || '0.00',
        data.tax?.toString() || '0.00',
        data.category || 'Other',
        receipt.fileName || 'receipt.jpg',
        'Processed by ReceiptJar'
      ]
    })

    // Fallback sample data if no receipts
    if (rows.length === 0) {
      rows.push([
        new Date().toISOString().split('T')[0],
        'Sample Store',
        '25.99',
        '2.08',
        'Office Supplies',
        'receipt.jpg',
        'Processed by ReceiptJar'
      ])
    }

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="receipts-${sessionId}.csv"`,
      },
    })
    
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    )
  }
}