'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Play, Sparkles, Zap, Target, ArrowRight, Check } from 'lucide-react'

const influencers = [
  {
    id: 1,
    name: 'Sofia',
    persona: 'Minimalist Chic',
    avatar: '/api/placeholder/300/400',
    description: 'Clean and sophisticated aesthetic'
  },
  {
    id: 2,
    name: 'Marco',
    persona: 'Tech Enthusiast',
    avatar: '/api/placeholder/300/400',
    description: 'Passion for innovation and gadgets'
  },
  {
    id: 3,
    name: 'Ana',
    persona: 'Natural Lifestyle',
    avatar: '/api/placeholder/300/400',
    description: 'Healthy and sustainable living'
  },
  {
    id: 4,
    name: 'Carlos',
    persona: 'Fitness Coach',
    avatar: '/api/placeholder/300/400',
    description: 'Constant energy and motivation'
  },
  {
    id: 5,
    name: 'Rita',
    persona: 'Fashion Forward',
    avatar: '/api/placeholder/300/400',
    description: 'Urban trends and style'
  }
]

const features = [
  {
    icon: Target,
    title: 'Choose the Persona',
    description: 'Select the perfect AI influencer for your brand'
  },
  {
    icon: Sparkles,
    title: 'Upload Your Product',
    description: 'Upload your product image in seconds'
  },
  {
    icon: Zap,
    title: 'Get Your Video',
    description: 'AI creates an authentic ad ready to go viral'
  }
]

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AIMarketing
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-purple-400 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-purple-400 transition-colors">
              Pricing
            </Link>
            <Link href="/grafmovimento" className="hover:text-purple-400 transition-colors">
              GrafMovimento
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Login
            </Button>
            <Link href="/campaigns/new">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 border-0">
                Create Free Ad
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-[#0A0A0A] to-cyan-900/20" />
          <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10" />
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(rgba(139,69,244,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,69,244,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Turn Any Product Into
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Viral Ads
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-300">In Seconds.</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Use our AI Influencers to create authentic video campaigns 
            that convert.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/campaigns/new">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-lg px-8 py-6 rounded-full border-0 shadow-2xl shadow-purple-500/25">
                <Play className="mr-2 h-5 w-5" />
                Create Free Ad
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-gradient-to-b from-purple-400 to-transparent rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* AI Influencers Section */}
      <section id="influencers" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Brand&apos;s Face</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Each AI influencer was created with a unique personality to connect with your target audience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {influencers.map((influencer, index) => (
              <motion.div
                key={influencer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <div className="aspect-[3/4] bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    {/* Placeholder for influencer image */}
                    <div className="w-full h-full bg-gray-600/20 flex items-center justify-center text-6xl">
                      👤
                    </div>
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-center w-full">
                      <h3 className="font-bold text-lg text-white mb-1">
                        {influencer.name}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        {influencer.persona}
                      </p>
                      <p className="text-xs text-gray-400">
                        {influencer.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Magic Creation in{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                3 Steps
              </span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-3xl border border-gray-700/50 p-12 backdrop-blur-sm"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Revolutionize</span> Your Marketing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of brands already creating viral ads with AI.
            </p>
            
            <Link href="/campaigns/new">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-xl px-12 py-6 rounded-full border-0 shadow-2xl shadow-purple-500/25">
                <Sparkles className="mr-3 h-6 w-6" />
                Start Now - Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            
            <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Setup in 2 minutes
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                24/7 support
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 md:mb-0">
              AIMarketing
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 AIMarketing. Creating the future of digital marketing.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}