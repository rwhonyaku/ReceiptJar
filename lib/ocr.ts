// /lib/ocr.ts
function generateMockReceiptData(filename: string) {
  const vendors = [
    'Starbucks Coffee', 'Amazon.com', 'Uber', 'Lyft', 'Whole Foods',
    'Home Depot', 'Office Depot', 'FedEx', 'UPS Store', 'Verizon Wireless',
    'AT&T', 'Comcast', 'Netflix', 'Spotify', 'Adobe Creative Cloud',
    'Google Workspace', 'Zoom', 'Slack', 'Dropbox', 'Salesforce'
  ]
  
  const categories = [
    'Meals & Entertainment',
    'Office Supplies', 
    'Travel',
    'Utilities',
    'Other'
  ]
  
  const vendor = vendors[Math.floor(Math.random() * vendors.length)]
  const total = parseFloat((Math.random() * 200 + 5).toFixed(2))
  const tax = parseFloat((total * 0.08).toFixed(2))
  
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  const dateStr = date.toISOString().split('T')[0]
  
  const category = categories[Math.floor(Math.random() * categories.length)]
  
  return { date: dateStr, vendor, total, tax, category }
}

export async function extractTextFromImage(file: File): Promise<string> {
  console.log('📄 Processing:', file.name, 'Type:', file.type, 'Size:', file.size)
  
  // Handle PDFs differently
  if (file.type === 'application/pdf') {
    console.log('📑 Processing PDF receipt')
    
    // Simulate PDF processing (longer delay for PDFs)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockData = generateMockReceiptData(file.name)
    
    return `PDF RECEIPT - ${mockData.vendor}
    
Invoice Date: ${mockData.date}
Invoice Number: INV-${Math.floor(Math.random() * 10000)}
    
Description                      Amount
------------------------------------------
Product/Service 1                $${(mockData.total * 0.6).toFixed(2)}
Product/Service 2                $${(mockData.total * 0.4).toFixed(2)}
    
Subtotal:                       $${mockData.total.toFixed(2)}
Tax (8%):                       $${mockData.tax.toFixed(2)}
TOTAL:                          $${(mockData.total + mockData.tax).toFixed(2)}
    
Payment Method: Credit Card
Status: Paid
Thank you for your business!`
  }
  
  // Handle images
  console.log('🖼️ Processing image receipt')
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500))
  
  const mockData = generateMockReceiptData(file.name)
  
  return `
    ${mockData.vendor}
    123 Example St
    City, State ZIP
    
    Date: ${mockData.date}
    Time: ${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM
    
    ITEM 1              $${(mockData.total * 0.7).toFixed(2)}
    ITEM 2              $${(mockData.total * 0.3).toFixed(2)}
    
    Subtotal           $${mockData.total.toFixed(2)}
    Tax                $${mockData.tax.toFixed(2)}
    TOTAL              $${(mockData.total + mockData.tax).toFixed(2)}
    
    Thank you for your business!
  `
}

export function parseReceiptText(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  
  let date = new Date().toISOString().split('T')[0]
  let vendor = 'Unknown Vendor'
  let total = 0
  let tax = 0
  
  // Patterns for both image and PDF receipts
  const patterns = {
    date: /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/,
    dateLabel: /(?:Date|Invoice Date|DATE)[:\s]+(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    total: /(?:TOTAL|AMOUNT DUE|BALANCE|Total Amount)[:\s$]*(\d+\.\d{2})/i,
    tax: /(?:TAX|SALES TAX|Tax Amount)[:\s$]*(\d+\.\d{2})/i,
    vendor: /^[A-Z][A-Z\s&.,]+$/,
    pdfVendor: /PDF RECEIPT - (.+)$/m
  }
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Try date patterns
    const dateMatch = trimmed.match(patterns.date) || trimmed.match(patterns.dateLabel)
    if (dateMatch) date = dateMatch[1]
    
    // Try total patterns
    const totalMatch = trimmed.match(patterns.total)
    if (totalMatch) total = parseFloat(totalMatch[1])
    
    // Try tax patterns
    const taxMatch = trimmed.match(patterns.tax)
    if (taxMatch) tax = parseFloat(taxMatch[1])
    
    // Try vendor patterns
    if (vendor === 'Unknown Vendor') {
      const pdfVendorMatch = trimmed.match(patterns.pdfVendor)
      if (pdfVendorMatch) {
        vendor = pdfVendorMatch[1]
      } else if (patterns.vendor.test(trimmed)) {
        vendor = trimmed.substring(0, 50)
      }
    }
  }
  
  // Fallback to mock data if parsing failed
  if (total === 0 || vendor === 'Unknown Vendor') {
    const mock = generateMockReceiptData('fallback')
    return {
      date: mock.date,
      vendor: mock.vendor,
      total: mock.total,
      tax: mock.tax,
      category: mock.category
    }
  }
  
  return {
    date,
    vendor: vendor || 'Unknown Vendor',
    total,
    tax: tax || total * 0.08,
    category: 'Other'
  }
}