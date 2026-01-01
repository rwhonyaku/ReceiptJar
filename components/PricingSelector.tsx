'use client'

import { useState } from 'react'
import { Check, Zap, Calendar, Briefcase, Infinity as InfinityIcon } from 'lucide-react'

const PRICING_TIERS = [
  {
    id: 'small',
    price: 3,
    receiptLimit: 25,
    label: 'Small cleanup',
    description: 'For a handful of recent receipts',
    icon: Zap,
    popular: false,
    stripePriceId: 'price_1SkYtRQa1XREkmsDiriueRnm',
  },
  {
    id: 'monthly',
    price: 5,
    receiptLimit: 75,
    label: 'Monthly mess',
    description: 'Perfect for end-of-month sorting',
    icon: Calendar,
    popular: true,
    stripePriceId: 'price_1SkYtdQa1XREkmsDe895poxu',
  },
  {
    id: 'quarterly',
    price: 8,
    receiptLimit: 150,
    label: 'Quarterly cleanup',
    description: 'For business quarter reviews',
    icon: Briefcase,
    popular: false,
    stripePriceId: 'price_1SkYtyQa1XREkmsDMaZJt4Fz',
  },
  {
    id: 'yearly',
    price: 12,
    receiptLimit: 300,
    label: 'Year-end tax batch',
    description: 'Get ready for tax season',
    icon: Calendar,
    popular: false,
    stripePriceId: 'price_1SkYuhQa1XREkmsDF8PGMTm6',
  },
  {
    id: 'unlimited',
    price: 19,
    receiptLimit: 500,
    label: 'Max cleanup',
    description: 'Maximum batch size (500 receipts)',
    icon: InfinityIcon,
    popular: false,
    bestValue: true,
    stripePriceId: 'price_1SkYuyQa1XREkmsDxY02SUSQ',
  },
]

interface PricingSelectorProps {
  selectedTier: string
  onSelectTier: (tierId: string) => void
  receiptCount: number
  onProceedToCheckout?: (stripePriceId: string) => void
}

export default function PricingSelector({ 
  selectedTier, 
  onSelectTier, 
  receiptCount,
  onProceedToCheckout = () => {} // ← ADD THIS
}: PricingSelectorProps) {
  const getTierByReceiptCount = () => {
    for (const tier of PRICING_TIERS) {
      if (receiptCount <= tier.receiptLimit) return tier.id
    }
    return 'unlimited'
  }

  const suggestedTier = getTierByReceiptCount()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-900">Choose your cleanup size</h3>
        <div className="text-sm text-gray-600">
          {receiptCount} receipt{receiptCount !== 1 ? 's' : ''} ready
        </div>
      </div>

      <div className="space-y-3">
        {PRICING_TIERS.map((tier) => {
          const Icon = tier.icon
          const isSelected = selectedTier === tier.id
          const isSuggested = suggestedTier === tier.id
          const isWithinLimit = receiptCount <= tier.receiptLimit

          return (
            <label
              key={tier.id}
              className={`
                relative flex items-start p-4 border rounded-xl cursor-pointer transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                ${!isWithinLimit ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              onClick={() => isWithinLimit && onSelectTier(tier.id)}
            >
              <input
                type="radio"
                name="pricing"
                value={tier.id}
                checked={isSelected}
                onChange={() => {}}
                className="sr-only"
                disabled={!isWithinLimit}
              />
              
              <div className="flex items-center h-5">
                <div className={`
                  w-5 h-5 rounded-full border flex items-center justify-center
                  ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}
                `}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>

              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{tier.label}</span>
                    {tier.bestValue && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Best value
                      </span>
                    )}
                    {tier.popular && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Most popular
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">${tier.price}</div>
                    <div className="text-xs text-gray-500">one-time</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Up to {tier.receiptLimit} receipts
                  </span>
                  {isSuggested && receiptCount > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      ✓ Fits your {receiptCount} receipt{receiptCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {!isWithinLimit && (
                    <span className="text-xs text-red-600 font-medium">
                      ✗ Too many receipts
                    </span>
                  )}
                </div>
              </div>
            </label>
          )
        })}
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Keep this tab open:</strong> Your files will be deleted 30 minutes after processing. 
          Bookmark your download page to retrieve within that window.
        </p>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => {
          const selectedTierObj = PRICING_TIERS.find(t => t.id === selectedTier)
          if (selectedTierObj && onProceedToCheckout) {
            onProceedToCheckout(selectedTierObj.stripePriceId)
          }
        }}
        disabled={!selectedTier}
        className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        Proceed to Secure Checkout
      </button>

      {/* Receipt Counter Helper */}
      {receiptCount > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Your receipts fit in:</span>
            <div className="flex gap-2">
              {PRICING_TIERS.filter(tier => receiptCount <= tier.receiptLimit).map(tier => (
                <button
                  key={tier.id}
                  onClick={() => onSelectTier(tier.id)}
                  className={`
                    px-3 py-1 text-sm rounded-full border transition
                    ${selectedTier === tier.id 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  ${tier.price}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Refund Notice */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Payments cover processing time. Files auto-delete after 30 minutes. 
        No refunds for expired sessions or lost files.
      </p>
    </div>
  )
}