import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { parseReceiptText } from '@/lib/ocr'

// Mock for now - replace with real AWS
export async function POST(request: NextRequest) {
  try {
    const { sessionId, receipts } = await request.json()
    
    // Process each receipt with better OCR (AWS Textract)
    const processedReceipts = await Promise.all(
      receipts.map(async (receipt: any) => {
        // In real version: Call AWS Textract here
        // For now, use improved mock
        const mockData = {
          date: new Date().toISOString().split('T')[0],
          vendor: receipt.filename.split('.')[0] || 'Unknown',
          total: Math.random() * 100 + 10,
          tax: Math.random() * 10,
          category: 'Other'
        }
        return mockData
      })
    )
    
    // Generate CSV
    const headers = ['Date', 'Vendor', 'Total', 'Tax', 'Category']
    const rows = processedReceipts.map(r => [
      r.date,
      `"${r.vendor.replace(/"/g, '""')}"`,
      r.total.toFixed(2),
      r.tax.toFixed(2),
      r.category
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    // Create ZIP (in real version: add original images)
    const zip = new JSZip()
    zip.file('receipts.csv', csv)
    
    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    
    // In real version: upload to S3, return download URL
    // For now, mock
    return NextResponse.json({
      success: true,
      downloadUrl: `/api/download/${sessionId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    })
    
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process receipts' },
      { status: 500 }
    )
  }
}