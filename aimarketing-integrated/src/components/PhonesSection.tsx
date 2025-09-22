// src/components/PhonesSection.tsx

"use client"

import React, { useEffect, useRef } from 'react'

interface PhoneMockupProps {
  title: string
  description: string
  videoSrc: string
}

function PhoneMockup({ title, description, videoSrc }: PhoneMockupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Array of sample video URLs (you can replace these with actual video URLs)
  const randomVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  ]
  
  useEffect(() => {
    if (videoRef.current) {
      // Select a random video
      const randomIndex = Math.floor(Math.random() * randomVideos.length)
      videoRef.current.src = randomVideos[randomIndex]
      videoRef.current.play().catch(() => {
        // Fallback if autoplay fails
        console.log('Autoplay failed')
      })
    }
  }, [])

  return (
    <div className="text-center">
      <div className="relative mx-auto w-64 h-128 bg-gray-800 rounded-3xl p-2 shadow-2xl">
        <div className="w-full h-full bg-black rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Phone details - keeping only the top notch */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
}

export default function PhonesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-1/2 -translate-x-1/2 aspect-[1155/678] w-[50rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-40 sm:w-[80rem]"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Três Cenários Únicos
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Escolha o cenário perfeito para o seu conteúdo e deixe a IA fazer o resto
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <PhoneMockup 
            title="Cenário 1"
            description="Transforme fotos em vídeos dinâmicos"
            videoSrc="/api/placeholder/300/600"
          />
          <PhoneMockup 
            title="Cenário 2" 
            description="Crie apresentações animadas"
            videoSrc="/api/placeholder/300/600"
          />
          <PhoneMockup 
            title="Cenário 3"
            description="Gere conteúdo viral automaticamente"
            videoSrc="/api/placeholder/300/600"
          />
        </div>
      </div>
      </div>
    </section>
  )
}
