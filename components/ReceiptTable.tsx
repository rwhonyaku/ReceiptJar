'use client'

import { useState } from 'react'
import { Edit2, Check, X, ChevronDown } from 'lucide-react'
import type { Receipt, Category } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'

interface ReceiptTableProps {
  receipts: Receipt[]
  onUpdateReceipt: (id: string, updates: Partial<Receipt['extractedData']>) => void
  onBatchCategoryUpdate: (category: string) => void
}

export default function ReceiptTable({ receipts, onUpdateReceipt, onBatchCategoryUpdate }: ReceiptTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<keyof Receipt['extractedData'] | null>(null)
  const [batchCategory, setBatchCategory] = useState<Category>('Other')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const readyReceipts = receipts.filter(r => r.extractedData)

  const handleEdit = (id: string, field: keyof Receipt['extractedData']) => {
    setEditingId(id)
    setEditingField(field)
  }

  const handleSave = (id: string, field: keyof Receipt['extractedData'], value: string) => {
    const updates: Partial<Receipt['extractedData']> = {}
    
    if (field === 'date' || field === 'vendor' || field === 'category') {
      updates[field] = value
    } else if (field === 'total' || field === 'tax') {
      updates[field] = parseFloat(value) || 0
    }
    
    onUpdateReceipt(id, updates)
    setEditingId(null)
    setEditingField(null)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === readyReceipts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(readyReceipts.map(r => r.id)))
    }
  }

  const applyBatchCategory = () => {
    if (selectedIds.size === 0) {
      // Apply to all if none selected
      onBatchCategoryUpdate(batchCategory)
    } else {
      // Apply to selected only
      selectedIds.forEach(id => {
        onUpdateReceipt(id, { category: batchCategory })
      })
    }
    setSelectedIds(new Set())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (readyReceipts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Upload receipts to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions Bar */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.size === readyReceipts.length && readyReceipts.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              {selectedIds.size > 0 
                ? `${selectedIds.size} selected` 
                : 'Select all'}
            </span>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Apply category to selected:</span>
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value as Category)}
                className="text-sm border rounded px-2 py-1"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={applyBatchCategory}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Apply to all:</span>
          <select
            value={batchCategory}
            onChange={(e) => setBatchCategory(e.target.value as Category)}
            className="text-sm border rounded px-2 py-1"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => onBatchCategoryUpdate(batchCategory)}
            className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
          >
            Apply All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Select
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vendor
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tax
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {readyReceipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                {/* Select Checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(receipt.id)}
                    onChange={() => toggleSelect(receipt.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  {editingId === receipt.id && editingField === 'date' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        defaultValue={receipt.extractedData!.date}
                        onBlur={(e) => handleSave(receipt.id, 'date', e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-32"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{receipt.extractedData!.date}</span>
                      <button
                        onClick={() => handleEdit(receipt.id, 'date')}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Vendor */}
                <td className="px-4 py-3">
                  {editingId === receipt.id && editingField === 'vendor' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={receipt.extractedData!.vendor}
                        onBlur={(e) => handleSave(receipt.id, 'vendor', e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-48"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{receipt.extractedData!.vendor}</span>
                      <button
                        onClick={() => handleEdit(receipt.id, 'vendor')}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Total */}
                <td className="px-4 py-3">
                  {editingId === receipt.id && editingField === 'total' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={receipt.extractedData!.total}
                        onBlur={(e) => handleSave(receipt.id, 'total', e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-24"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(receipt.extractedData!.total)}</span>
                      <button
                        onClick={() => handleEdit(receipt.id, 'total')}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Tax */}
                <td className="px-4 py-3">
                  {editingId === receipt.id && editingField === 'tax' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={receipt.extractedData!.tax}
                        onBlur={(e) => handleSave(receipt.id, 'tax', e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-24"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(receipt.extractedData!.tax)}</span>
                      <button
                        onClick={() => handleEdit(receipt.id, 'tax')}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  {editingId === receipt.id && editingField === 'category' ? (
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={receipt.extractedData!.category}
                        onChange={(e) => handleSave(receipt.id, 'category', e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        autoFocus
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{receipt.extractedData!.category}</span>
                      <button
                        onClick={() => handleEdit(receipt.id, 'category')}
                        className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      const fields: Array<keyof Receipt['extractedData']> = ['date', 'vendor', 'total', 'tax', 'category']
                      const nextField = fields[(fields.indexOf(editingField || 'date') + 1) % fields.length]
                      handleEdit(receipt.id, nextField)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Quick Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500 pt-2">
        Click any field to edit. Use batch actions above to update multiple receipts at once.
      </div>
    </div>
  )
}