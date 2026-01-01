export async function extractReceiptData(file: File): Promise<any> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) return getMockData(file.name)
  
  const buffer = await file.arrayBuffer()
  const base64Image = Buffer.from(buffer).toString('base64')
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
        }]
      })
    }
  )
  
  const data = await response.json()
  const text = data.responses?.[0]?.fullTextAnnotation?.text || ''
  return parseReceiptText(text, file.name)
}

function parseReceiptText(text: string, filename: string) {
  // Simple parsing - same as before
  const lines = text.split('\n').filter(l => l.trim())
  let date = '', vendor = '', total = 0, tax = 0
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!date && /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(trimmed)) date = trimmed
    const totalMatch = trimmed.match(/(?:TOTAL|AMOUNT)[:\s$]*(\d+\.?\d*)/i)
    if (totalMatch && !total) total = parseFloat(totalMatch[1])
    if (!vendor && trimmed.length > 3 && !/\d/.test(trimmed)) vendor = trimmed
  }
  
  return {
    date: date || new Date().toISOString().split('T')[0],
    vendor: vendor || 'Unknown Vendor',
    total: total || 0,
    tax: tax || 0
  }
}

function getMockData(filename: string) {
  return {
    date: new Date().toISOString().split('T')[0],
    vendor: 'Mock Vendor',
    total: 25.99,
    tax: 2.08
  }
}