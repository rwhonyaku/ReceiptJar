'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Camera, FileText } from 'lucide-react'
import type { Receipt } from '@/lib/types'

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void
  receipts: Receipt[]
  onRemoveReceipt: (id: string) => void
}

export default function UploadZone({ onFilesAdded, receipts, onRemoveReceipt }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles)
  }, [onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleCameraClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Mobile: back camera
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        onFilesAdded(Array.from(files))
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop receipts here' : 'Drag & drop receipt photos'}
            </p>
            <p className="text-gray-500 mt-1">or click to browse</p>
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={handleCameraClick}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Camera className="h-4 w-4" />
              Use Camera
            </button>
            <button
              type="button"
              {...getRootProps()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Upload Files
            </button>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Supports: JPG, PNG, WEBP, PDF</p>
            <p>Max 10MB per file</p>
            <p className="text-xs text-gray-400">PDF receipts are supported via OCR</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {receipts.length > 0 && (
        <div className="border rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-3">Uploaded Receipts ({receipts.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {receipts.map((receipt) => {
              const isPDF = receipt.file.type === 'application/pdf'
              
              return (
                <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded flex items-center justify-center ${isPDF ? 'bg-red-100' : 'bg-gray-200'}`}>
                      {isPDF ? '📄' : '🖼️'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{receipt.file.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                          {receipt.status === 'processing' ? 'Processing...' : 
                           receipt.status === 'extracted' ? 'Ready' : 'Pending'}
                        </p>
                        {isPDF && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveReceipt(receipt.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}