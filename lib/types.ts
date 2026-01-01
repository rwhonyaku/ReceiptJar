export interface Receipt {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'processing' | 'extracted' | 'error'
  extractedData?: {
    date: string
    vendor: string
    total: number
    tax: number
    category: string
  }
}

export const CATEGORIES = [
  'Meals & Entertainment',
  'Office Supplies',
  'Travel',
  'Utilities',
  'Other'
] as const

export type Category = typeof CATEGORIES[number]