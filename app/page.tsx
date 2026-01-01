import Link from 'next/link'
import { ReceiptText, Zap, Shield, Download } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ReceiptJar</span>
          </div>
          <Link 
            href="/tool" 
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition"
          >
            Try Free Preview
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Snap receipts. Get tax-ready spreadsheet.
            <span className="block text-3xl text-gray-600 mt-2">
              No accounts. <span className="text-blue-600">$3 to $19</span> one-time. Auto-delete in 30min.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Upload receipt photos. We extract the data. You get a perfect CSV for your accountant. 
            We delete everything automatically. No strings attached.
          </p>

          <div className="flex justify-center mb-20">
            <Link 
              href="/tool"
              className="rounded-xl bg-blue-600 px-12 py-4 text-white font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Try Free Preview (3 receipts)
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">5-Minute Setup</h3>
              <p className="text-gray-600">Upload, review, export. Done.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Auto-Delete Privacy</h3>
              <p className="text-gray-600">All files auto-delete after 30 minutes. Guaranteed.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Simple Pricing</h3>
              <p className="text-gray-600">$3 to $19 based on size. No subscriptions.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}