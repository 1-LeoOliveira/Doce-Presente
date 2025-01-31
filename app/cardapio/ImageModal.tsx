import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface ImageModalProps {
  src: string
  alt: string
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90%] max-h-[90%] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 z-10 bg-pink-500 text-white p-1 rounded-full hover:bg-pink-600"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="max-w-full max-h-full">
          <Image 
            src={src} 
            alt={alt}
            width={800}
            height={600}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh', 
              objectFit: 'contain' 
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ImageModal