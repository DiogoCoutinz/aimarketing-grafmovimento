// lib/imageProcessing.ts

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CroppedImageResult {
  file: File;
  preview: string;
  originalDimensions: { width: number; height: number };
  croppedDimensions: { width: number; height: number };
}

/**
 * Crop an image using canvas
 */
export async function cropImage(
  imageSrc: string,
  cropArea: CropArea,
  fileName: string,
  quality: number = 0.9,
  originalDimensions: { width: number; height: number }
): Promise<CroppedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Set canvas size to crop area size
      canvas.width = cropArea.width
      canvas.height = cropArea.height
      
      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height, // Source rectangle
        0, 0, cropArea.width, cropArea.height // Destination rectangle
      )
      
      // Convert to blob and create file
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'))
            return
          }
          
          const croppedFile = new File([blob], fileName, { type: 'image/jpeg' })
          const preview = URL.createObjectURL(blob)
          
          resolve({
            file: croppedFile,
            preview,
            originalDimensions,
            croppedDimensions: { width: cropArea.width, height: cropArea.height }
          })
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageSrc
  })
}

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupImageUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  }
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(dimensions)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}