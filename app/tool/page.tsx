'use client'

import { useState, useEffect } from 'react'
import UploadZone from '@/components/UploadZone'
import ReceiptTable from '@/components/ReceiptTable'
import PricingSelector from '@/components/PricingSelector'
import { Receipt, CATEGORIES } from '@/lib/types'
import { extractTextFromImage, parseReceiptText } from '@/lib/ocr'
import { AlertCircle, CheckCircle, Shield, Info } from 'lucide-react'
import { storeReceipts } from '@/lib/receipt-storage'

const PRICING_TIERS = [
  {
    id: 'small',
    price: 3,
    receiptLimit: 25,
    label: 'Small cleanup',
    description: 'For a handful of recent receipts',
    popular: false,
  },
  {
    id: 'monthly',
    price: 5,
    receiptLimit: 75,
    label: 'Monthly mess',
    description: 'Perfect for end-of-month sorting',
    popular: true,
  },
  {
    id: 'quarterly',
    price: 8,
    receiptLimit: 150,
    label: 'Quarterly cleanup',
    description: 'For business quarter reviews',
    popular: false,
  },
  {
    id: 'yearly',
    price: 12,
    receiptLimit: 300,
    label: 'Year-end tax batch',
    description: 'Get ready for tax season',
    popular: false,
  },
  {
    id: 'unlimited',
    price: 19,
    receiptLimit: 500,
    label: 'Max cleanup',
    description: 'Maximum batch size (500 receipts)',
    popular: false,
    bestValue: true,
  },
]

export default function ToolPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTier, setSelectedTier] = useState('unlimited')

  // Auto-select appropriate tier based on receipt count
  useEffect(() => {
    const readyCount = receipts.filter(r => r.status === 'extracted').length
    if (readyCount === 0) return

    // Find the cheapest tier that fits
    const fittingTier = PRICING_TIERS.find(tier => readyCount <= tier.receiptLimit)
    if (fittingTier && fittingTier.id !== selectedTier) {
      setSelectedTier(fittingTier.id)
    }
  }, [receipts])

  const handleFilesAdded = async (files: File[]) => {
    const newReceipts: Receipt[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }))

    setReceipts(prev => [...prev, ...newReceipts])
    setIsProcessing(true)

    // Process each new receipt
    for (const receipt of newReceipts) {
      try {
        setReceipts(prev => prev.map(r => 
          r.id === receipt.id ? { ...r, status: 'processing' } : r
        ))

        const text = await extractTextFromImage(receipt.file)
        const extractedData = parseReceiptText(text)

        setReceipts(prev => prev.map(r => 
          r.id === receipt.id ? { ...r, status: 'extracted', extractedData } : r
        ))
      } catch (error) {
        setReceipts(prev => prev.map(r => 
          r.id === receipt.id ? { ...r, status: 'error' } : r
        ))
      }
    }

    setIsProcessing(false)
  }

  const handleRemoveReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id))
  }

  const handleUpdateReceipt = (id: string, updates: Partial<Receipt['extractedData']>) => {
    setReceipts(prev => prev.map(receipt => {
      if (receipt.id === id) {
        return {
          ...receipt,
          extractedData: {
            ...receipt.extractedData!,
            ...updates
          }
        }
      }
      return receipt
    }))
  }

  const handleBatchCategoryUpdate = (category: string) => {
    setReceipts(prev => prev.map(receipt => ({
      ...receipt,
      extractedData: receipt.extractedData ? {
        ...receipt.extractedData,
        category
      } : receipt.extractedData
    })))
  }

  const handleProceedToCheckout = async (stripePriceId: string) => {
    try {
      setIsProcessing(true)
      const readyReceipts = receipts.filter(r => r.status === 'extracted')
      const selectedTierData = PRICING_TIERS.find(t => t.id === selectedTier)!
      
      if (readyReceipts.length > selectedTierData.receiptLimit) {
        alert(`Too many receipts for $${selectedTierData.price} plan`)
        setIsProcessing(false)
        return
      }

      // Store receipts locally before checkout
      const localSessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Call Stripe Checkout with the Price ID AND local session ID
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: stripePriceId,
        receiptCount: readyReceipts.length,
        localSessionId, // Pass local session ID
        receiptData: readyReceipts.map(r => ({
          id: r.id,
          extractedData: r.extractedData,
          fileName: r.file?.name || 'receipt.jpg'
        }))
      })
    })

    if (!response.ok) throw new Error('Checkout failed')

    const { url } = await response.json()
    
    // Store receipts in memory (they'll be saved to DB after payment in webhook)
    storeReceipts(localSessionId, 'pending', readyReceipts)
    
    // Store in localStorage as backup
    localStorage.setItem(`receipts_${localSessionId}`, JSON.stringify({
      receipts: readyReceipts,
      timestamp: Date.now()
    }))
    
    // Redirect to Stripe Checkout
    window.location.href = url

  } catch (error) {
    console.error('Checkout error:', error)
    alert('Checkout failed. Please try again.')
    setIsProcessing(false)
  }
}

  const readyCount = receipts.filter(r => r.status === 'extracted').length
  const totalAmount = receipts.reduce((sum, r) => sum + (r.extractedData?.total || 0), 0)
  const selectedTierData = PRICING_TIERS.find(t => t.id === selectedTier)!

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Receipt Scanner</h1>
              <p className="text-gray-600 mt-2">
                Upload, extract, export. No accounts. Auto-delete in 30 minutes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Files auto-delete after 30min</span>
            </div>
          </div>
        </header>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>How this works:</strong> Upload receipts → See extracted data → 
            <span className="font-semibold"> Preview first 3 for free</span> → 
            Choose cleanup size → Pay one-time fee → Download all data.
            Files auto-delete in 30 minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <UploadZone
                onFilesAdded={handleFilesAdded}
                receipts={receipts}
                onRemoveReceipt={handleRemoveReceipt}
              />
              
              {receipts.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      {receipts.filter(r => r.status === 'extracted').length} of {receipts.length} processed
                    </div>
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Table */}
            {readyCount > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Review & Edit ({readyCount} ready)
                  </h2>
                  <button
                    onClick={() => handleBatchCategoryUpdate('Other')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset all to "Other"
                  </button>
                </div>

                <ReceiptTable
                  receipts={receipts}
                  onUpdateReceipt={handleUpdateReceipt}
                  onBatchCategoryUpdate={handleBatchCategoryUpdate}
                />

                <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Click any field to edit. Use batch actions for multiple receipts.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Export */}
          <div className="space-y-6">
            {/* Pricing Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <PricingSelector
                selectedTier={selectedTier}
                onSelectTier={setSelectedTier}
                receiptCount={readyCount}
                onProceedToCheckout={handleProceedToCheckout}
              />

              {/* Preview CSV Button */}
              <div className="mt-4 text-center">
                {readyCount > 0 && (
                  <button
                    onClick={() => {
                      const readyReceipts = receipts.filter(r => r.status === 'extracted')
                      const sampleReceipts = readyReceipts.slice(0, 3)
                      const headers = ['Date', 'Vendor', 'Total', 'Tax', 'Category']
                      const rows = sampleReceipts.map(r => [
                        r.extractedData?.date || '',
                        `"${(r.extractedData?.vendor || '').replace(/"/g, '""')}"`,
                        r.extractedData?.total?.toFixed(2) || '0.00',
                        r.extractedData?.tax?.toFixed(2) || '0.00',
                        r.extractedData?.category || 'Other'
                      ])
                      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      window.open(url)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    👁️ Preview CSV (first 3 receipts)
                  </button>
                )}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected plan</span>
                  <span className="font-medium">
                    {selectedTierData.label} (up to {selectedTierData.receiptLimit})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your receipts</span>
                  <span className="font-medium">
                    {readyCount} of {selectedTierData.receiptLimit} used
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total amount</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Privacy & Session Warning */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Auto-Delete Privacy</p>
                    <p className="text-green-700 text-sm mt-1">
                      All files permanently deleted after 30 minutes. No data stored.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">30-Minute Session</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Keep tab open. Bookmark download page. Files disappear after 30min.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Pricing Helper */}
            {readyCount > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {PRICING_TIERS.filter(tier => readyCount <= tier.receiptLimit).map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`
                        px-3 py-1.5 text-sm rounded-lg border transition
                        ${selectedTier === tier.id 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      ${tier.price} plan
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>No accounts. No subscriptions. Pay once. Use forever. Files auto-delete in 30 minutes.</p>
          <p className="mt-1">Processing fees are non-refundable. No recovery after deletion.</p>
        </div>
      </div>
    </div>
  )
}