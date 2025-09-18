'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  ImageIcon,
  Video,
  Volume2,
  Download,
  Zap
} from 'lucide-react'

export default function GrafMovimentoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AIMarketing
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-purple-400 transition-colors">
              Home
            </Link>
            <Link href="#how-it-works" className="hover:text-purple-400 transition-colors">
              How it Works
            </Link>
          </div>
          
          <Link href="/grafmovimento/create">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 border-0">
              Create Video
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-[#0A0A0A] to-cyan-900/20" />
          
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
              Transform Images Into
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Dynamic Videos
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-300">With AI Magic.</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Upload your image, choose your destination, and watch AI create 
            smooth video transitions with cinematic flair.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/grafmovimento/create">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-lg px-8 py-6 rounded-full border-0 shadow-2xl shadow-purple-500/25">
                <Play className="mr-2 h-5 w-5" />
                Create Video Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative">
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
                4 Simple Steps
              </span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: ImageIcon,
                title: 'Upload Image A',
                description: 'Start with your base image - the beginning of your story',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Sparkles,
                title: 'Choose Image B',
                description: 'AI suggestions, custom prompt, or upload your own destination',
                color: 'from-pink-500 to-red-500'
              },
              {
                icon: Video,
                title: 'Generate Video',
                description: 'AI creates smooth transition with cinematic effects',
                color: 'from-red-500 to-orange-500'
              },
              {
                icon: Volume2,
                title: 'Add Audio',
                description: 'Perfect soundtrack selected and mixed automatically',
                color: 'from-orange-500 to-cyan-500'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-lg">
                  {step.description}
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
              Ready to Create <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Amazing</span> Videos?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Transform your static images into dynamic stories with AI-powered video generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link href="/grafmovimento/create">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-xl px-12 py-6 rounded-full border-0 shadow-2xl shadow-purple-500/25">
                  <Zap className="mr-3 h-6 w-6" />
                  Start Creating
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              
              <Link href="/grafmovimento/templates">
                <Button size="lg" variant="outline" className="border-2 border-gradient-to-r from-pink-500 to-orange-500 text-white text-xl px-12 py-6 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 hover:from-pink-500/20 hover:to-orange-500/20 shadow-xl">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Use Viral Templates
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Download className="h-4 w-4 text-green-400 mr-2" />
                HD Video Downloads
              </div>
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                AI-Powered Creation
              </div>
              <div className="flex items-center">
                <Video className="h-4 w-4 text-cyan-400 mr-2" />
                Smooth Transitions
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link href="/" className="font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 md:mb-0">
              AIMarketing
            </Link>
            <div className="text-gray-400 text-sm">
              © 2025 AIMarketing. Creating the future of visual content.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
