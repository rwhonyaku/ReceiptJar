import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Receipt } from './types'

export function generateCSV(receipts: Receipt[]): string {
  const headers = ['Date', 'Vendor', 'Total', 'Tax', 'Category', 'Filename']
  
  const rows = receipts
    .filter(r => r.extractedData)
    .map(receipt => {
      const data = receipt.extractedData!
      return [
        data.date,
        `"${data.vendor.replace(/"/g, '""')}"`, // Escape quotes for CSV
        data.total.toFixed(2),
        data.tax.toFixed(2),
        data.category,
        receipt.file.name
      ]
    })
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

export async function createExportZip(receipts: Receipt[]): Promise<Blob> {
  const zip = new JSZip()
  
  // Add CSV file
  const csvContent = generateCSV(receipts)
  zip.file('receipts.csv', csvContent)
  
  // Add images to receipts folder
  const imgFolder = zip.folder('receipts')
  for (const receipt of receipts) {
    const arrayBuffer = await receipt.file.arrayBuffer()
    imgFolder?.file(receipt.file.name, arrayBuffer)
  }
  
  return await zip.generateAsync({ type: 'blob' })
}

export function downloadZip(blob: Blob, filename = 'receipts-export.zip') {
  saveAs(blob, filename)
}