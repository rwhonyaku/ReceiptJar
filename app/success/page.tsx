'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Download, FileText, Shield, Clock, Copy, Home } from 'lucide-react'
import Link from 'next/link'

// Remove MOCK_SESSION completely

const PRICING_TIERS = {
  small: { price: 3, label: 'Small cleanup' },
  monthly: { price: 5, label: 'Monthly mess' },
  quarterly: { price: 8, label: 'Quarterly cleanup' },
  yearly: { price: 12, label: 'Year-end tax batch' },
  unlimited: { price: 19, label: 'Unlimited cleanup' },
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(true)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [copied, setCopied] = useState(false)

  // Get REAL data from URL params
  const sessionId = searchParams.get('session_id') || 'N/A'
  const tierId = searchParams.get('tier') || 'unlimited'
  const price = searchParams.get('price') || '19'
  const count = searchParams.get('count') || '0'
  
  const tier = PRICING_TIERS[tierId as keyof typeof PRICING_TIERS] || PRICING_TIERS.unlimited

  useEffect(() => {
    // Calculate processing time based on receipt count (2 seconds per receipt, max 3 minutes)
    const receiptCount = parseInt(count || '0')
    const processingSeconds = Math.min(receiptCount * 2, 180) // Max 3 minutes
    
    // Simulate processing delay
    const timer = setTimeout(() => {
      setIsGenerating(false)
      // Use the REAL session ID for download
      setDownloadUrl(`/api/download/${sessionId}`)
      // TIMER STARTS HERE - 30 minutes AFTER processing finishes
      setTimeLeft(30 * 60) // 30 minutes from now
    }, processingSeconds * 1000)

    // Countdown timer (starts after processing)
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(countdown)
    }
  }, [count, sessionId]) // Add sessionId to dependencies

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const copySessionLink = () => {
    // Use REAL session ID
    const link = `${window.location.origin}/success?session_id=${sessionId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate file size based on receipt count (mock)
  const calculateFileSize = (count: string) => {
    const num = parseInt(count) || 0
    const sizeInMB = Math.max(0.5, num * 0.2) // Rough estimate
    return `${sizeInMB.toFixed(1)} MB`
  }

  if (timeLeft === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h1>
          <p className="text-gray-600 mb-6">
            Your download session has expired. All files have been permanently deleted.
          </p>
          <Link
            href="/tool"
            className="inline-block w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Start New Cleanup
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-gray-700">
            <Home className="h-5 w-5" />
            <span className="font-medium">ReceiptJar</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Deletes in: {formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Auto-delete enabled</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Success Message */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Export Complete!</h1>
                  <p className="text-gray-600">
                    {count} receipt{count !== '1' ? 's' : ''} processed • ${price} one-time payment
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{tier.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Receipts processed</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Session ID</span>
                    <span className="font-mono text-xs">{sessionId}</span> {/* Use REAL sessionId */}
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Amount paid</span>
                    <span className="font-bold">${price}</span>
                  </div>
                </div>
              </div>

              {/* Session Management */}
              <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Session Management</h3>
                  <button
                    onClick={copySessionLink}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Bookmark or copy this page link to re-download within {formatTime(timeLeft)}.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Important:</strong> This session expires in {formatTime(timeLeft)}. 
                    After that, all files are permanently deleted and cannot be recovered.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Download your ZIP file below</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Extract and review the CSV with your accountant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Keep this page bookmarked if you need to re-download</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Files auto-delete after {formatTime(timeLeft)} - no action needed</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column - Download */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Your Export</h3>
                  <p className="text-sm text-gray-600">Ready for download</p>
                </div>
              </div>

              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-gray-700">
                      Processing {count} receipt{count !== '1' ? 's' : ''}...
                    </span>
                    </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 text-center">
                      ⏱️ Your 30-minute download window starts when processing finishes.
                      {parseInt(count || '0') > 25 && " This batch may take 1-2 minutes."}
                    </p>
                  </div>
                </div>
              ) : downloadUrl ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">CSV Ready!</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <div className="flex justify-between">
                        <span>File size:</span>
                        <span className="font-medium">~{(parseInt(count) * 0.1).toFixed(1)} KB</span>
                      </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="font-medium">CSV (Excel compatible)</span>
                    </div>
                  </div>
                  </div>
                  
                  <a
                    href={`/api/download?session_id=${sessionId}&local_session=${searchParams.get('local_session') || ''}`}
                    download={`receipts-${sessionId}.csv`}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
                  >
                  <Download className="h-5 w-5" />
                    Download CSV Export
                  </a>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      ⚠️ Download now! Files available for {formatTime(timeLeft)} after processing.
                    </p>
                    <p className="text-xs text-gray-500">
                      No re-downloads after expiration. No recovery possible.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Session Timer */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Download window ends in</span>
                  <span className="text-sm font-bold text-gray-900">{formatTime(timeLeft)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${(timeLeft / (30 * 60)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                href="/tool"
                className="block w-full py-3 text-center border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition"
              >
                Start New Cleanup
              </Link>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Need help?</h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• No support emails - check FAQ</li>
                  <li>• No file recovery after deletion</li>
                  <li>• No refunds for expired sessions</li>
                  <li>• Bookmark this page to re-download</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Files auto-delete after 30 minutes. No accounts. No subscriptions. No data stored.</p>
          <p className="mt-1">Processing fees are non-refundable. No recovery after deletion.</p>
        </div>
      </div>
    </div>
  )
}