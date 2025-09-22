// app/video-creator/page.tsx

'use client'

import { AnalysisCard } from '@/components/shared/AnalysisCard';
import FloatButton from '@/components/shared/FloatButton';
import { ImageGeneratorCard } from '@/components/shared/ImageGeneratorCard';
import { ColorPickerFloat } from '@/components/ui/color-picker-float';
import { ImagePreview } from '@/components/video-creator/components/ImagePreview';
import { SidebarControls } from '@/components/video-creator/components/SidebarControls';
import { MagicOptions } from '@/components/video-creator/steps/MagicOptions';
import { MethodSelection } from '@/components/video-creator/steps/MethodSelection';
import { TransitionSelection } from '@/components/video-creator/steps/TransitionSelection';
import { VideoGeneration } from '@/components/video-creator/steps/VideoGeneration';
import { ViralTemplates } from '@/components/video-creator/steps/ViralTemplates';
import { useVideoCreation } from '@/components/video-creator/useVideoCreation';
import { useTheme, ThemeProvider } from '@/contexts/ThemeContext';
import { cropImage, cleanupImageUrl } from '@/lib/imageProcessing';
import { ViralTemplate } from '@/lib/types';
import { Upload, Plus } from 'lucide-react'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

// Viral Template Data
const viralTemplates: ViralTemplate[] = [
  {
    id: 'tech-transform',
    name: 'Tech Transformation',
    description: 'Futuristic product reveal with neon effects',
    example: 'Product morphs with holographic overlays',
    requiredImages: { imageA: 'Product image' },
    superOptimizedPrompt: 'Transform product with futuristic tech effects',
    estimatedViralScore: 85,
    trending: true,
    duration: 5,
    tags: ['#tech', '#viral', '#futuristic']
  },
  {
    id: 'magic-reveal',
    name: 'Magic Reveal',
    description: 'Mystical transformation with particles',
    example: 'Golden particles and ethereal effects',
    requiredImages: { imageA: 'Product image' },
    superOptimizedPrompt: 'Create magical reveal with golden particles',
    estimatedViralScore: 92,
    trending: true,
    duration: 4,
    tags: ['#magic', '#viral', '#mystical']
  },
  {
    id: 'dynamic-morph',
    name: 'Dynamic Morph',
    description: 'Energetic transformation with fluid motion',
    example: 'Smooth morphing with dynamic effects',
    requiredImages: { imageA: 'Product image' },
    superOptimizedPrompt: 'Create dynamic morphing with fluid movement',
    estimatedViralScore: 78,
    trending: false,
    duration: 6,
    tags: ['#dynamic', '#viral', '#morph']
  },
  {
    id: 'cinematic-fade',
    name: 'Cinematic Fade',
    description: 'Professional transition with depth',
    example: 'Movie-style fade with depth effects',
    requiredImages: { imageA: 'Product image' },
    superOptimizedPrompt: 'Create cinematic fade with professional depth',
    estimatedViralScore: 95,
    trending: true,
    duration: 7,
    tags: ['#cinematic', '#viral', '#professional']
  },
  {
    id: 'explosive-impact',
    name: 'Explosive Impact',
    description: 'High-energy reveal with impact effects',
    example: 'Dramatic explosion with impact waves',
    requiredImages: { imageA: 'Product image' },
    superOptimizedPrompt: 'Create explosive impact with energy waves',
    estimatedViralScore: 88,
    trending: true,
    duration: 3,
    tags: ['#explosive', '#viral', '#impact']
  },
  {
    id: 'smooth-glide',
    name: 'Smooth Glide',
    description: 'Elegant transition with smooth motion',
    example: 'Graceful gliding with elegant motion',
    requiredImages: { imageA: 'Product image' },
    superOptimizedPrompt: 'Create smooth gliding with elegant motion',
    estimatedViralScore: 72,
    trending: false,
    duration: 5,
    tags: ['#smooth', '#viral', '#elegant']
  }
];

const templateVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
];

const templateThumbnailUrls = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/600?random=2',
  'https://picsum.photos/400/600?random=3',
  'https://picsum.photos/400/600?random=4',
  'https://picsum.photos/400/600?random=5',
  'https://picsum.photos/400/600?random=6'
];

function VideoCreatorContent() {
  const videoCreation = useVideoCreation()
  const { backgroundColor, setBackgroundColor } = useTheme()
  
  // State to control when to show method selection
  const [showMethodSelection, setShowMethodSelection] = useState(false)
  
  // State to control when creative mode should proceed to transitions
  const [creativeConfirmed, setCreativeConfirmed] = useState(false)
  
  // State to control image generation container
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [isGeneratingNewImage, setIsGeneratingNewImage] = useState(false)
  
  // State for sidebar controls
  const [isImageEditMode, setIsImageEditMode] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 320, height: 240 })
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('free')
  const [isCropMode, setIsCropMode] = useState(false)

  const {
    uploadedImage,
    selectedScenario,
    selectedMethod,
    analysis,
    isAnalyzing,
    selectedMagicOption,
    customMagicInput,
    isGeneratingImage,
    showImageProcessing,
    generatedImageUrl,
    imageBPreview,
    uploadedImageB,
    selectedTemplate,
    viralTemplateConfirmed,
    isLoadingTransitions,
    transitionSuggestions,
    selectedTransition,
    selectedTransitionOption,
    customTransitionPrompt,
    isGeneratingVideo,
    finalVideoUrl,
    videoGenerationTasks,
    handleFileSelect,
    handleFileRemove,
    selectScenario,
    selectMagicScenario,
    handleImageBSelect,
    handleImageBRemove,
    selectTransition,
    generateVideo,
    downloadVideo,
    setSelectedMethod,
    setSelectedMagicOption,
    setCustomMagicInput,
    setSelectedTemplate,
    setViralTemplateConfirmed,
    setSelectedTransitionOption,
    setCustomTransitionPrompt,
    setUploadedImage,
    setUploadedImageB,
    setImageBPreview
  } = videoCreation

  // Helper function to check if transition selection should be shown
  const shouldShowTransitionSelection = () => {
    const shouldShow = (selectedScenario === 'magic' && generatedImageUrl) ||
           (selectedScenario === 'creative' && uploadedImageB && creativeConfirmed) ||
           (selectedScenario === 'viral' && selectedTemplate && viralTemplateConfirmed)
    
    // Load transition suggestions when transition selection should be shown
    if (shouldShow && transitionSuggestions.length === 0 && !isLoadingTransitions) {
      videoCreation.loadTransitionSuggestions()
    }
    
    return shouldShow
  }

  // Helper function to determine next action and show floating next button
  const getNextAction = () => {
    // Show method selection after image upload
    if (uploadedImage && !showMethodSelection && !selectedScenario) {
      return {
        show: true,
        action: () => {
          setShowMethodSelection(true)
          // Close sidebar controls when proceeding to method selection
          setIsImageEditMode(false)
          setIsCropMode(false)
        },
        tooltip: 'Choose method'
      }
    }
    
    // Method selection
    if (uploadedImage && showMethodSelection && !selectedScenario && selectedMethod) {
      return {
        show: true,
        action: () => {
          selectScenario(selectedMethod)
          // Close sidebar controls when proceeding to scenario
          setIsImageEditMode(false)
          setIsCropMode(false)
        },
        tooltip: 'Proceed with method'
      }
    }
    
    // Magic scenario - generate image
    if (selectedScenario === 'magic' && selectedMagicOption && !isGeneratingImage && !generatedImageUrl) {
      const canProceed = selectedMagicOption !== 'custom' || customMagicInput.trim()
      if (canProceed) {
        return {
          show: true,
          action: () => {
            console.log('🔥 Floating next button Magic action called')
            selectMagicScenario(selectedMagicOption)
          },
          tooltip: 'Generate image'
        }
      }
    }
    
    // Creative scenario - proceed to transitions after Image B upload
    if (selectedScenario === 'creative' && uploadedImageB && !creativeConfirmed) {
      return {
        show: true,
        action: () => {
          setCreativeConfirmed(true)
          videoCreation.loadTransitionSuggestions()
          // Close sidebar controls when proceeding to transitions
          setIsImageEditMode(false)
          setIsCropMode(false)
        },
        tooltip: 'Proceed to transitions'
      }
    }
    
    // Viral scenario - confirm template
    if (selectedScenario === 'viral' && selectedTemplate && !viralTemplateConfirmed) {
      return {
        show: true,
        action: () => {
          setViralTemplateConfirmed(true)
          videoCreation.loadTransitionSuggestions()
          // Close sidebar controls when proceeding to transitions
          setIsImageEditMode(false)
          setIsCropMode(false)
        },
        tooltip: 'Confirm template'
      }
    }
    
    // Transition selection - generate video
    if (shouldShowTransitionSelection() && selectedTransitionOption && !selectedTransition) {
      const canProceed = selectedTransitionOption !== 'custom' || customTransitionPrompt.trim()
      if (canProceed) {
        return {
          show: true,
          action: () => {
            console.log('🔥 Floating next button Transition action called')
            let transition
            if (selectedTransitionOption === 'custom') {
              transition = {
                id: 'custom',
                name: 'Transição Personalizada',
                description: customTransitionPrompt.trim(),
                prompt: customTransitionPrompt.trim(),
                duration: 4,
                complexity: 'medium' as const
              }
            } else {
              transition = transitionSuggestions.find(t => t.id === selectedTransitionOption)
            }
            if (transition) {
              selectTransition(transition)
              generateVideo(transition)
            }
          },
          tooltip: 'Generate video'
        }
      }
    }
    
    return { show: false, action: () => {}, tooltip: '' }
  }

  const nextAction = getNextAction()

  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-4rem)] p-8 my-8 transition-all duration-700 ease-in-out w-full flex items-center justify-center">
      {/* Sidebar Controls - Only show when image is the main content */}
      <SidebarControls
        isVisible={isImageEditMode && (
          // Show for first image when it's the main content
          (!!uploadedImage && !showMethodSelection && !selectedScenario) ||
          // Show for second image in creative mode before transitions
          (selectedScenario === 'creative' && !!uploadedImageB && !isLoadingTransitions && !selectedTransition)
        )}
        imageDimensions={imageDimensions}
        brightness={brightness}
        contrast={contrast}
        rotation={rotation}
        selectedAspectRatio={selectedAspectRatio}
        isCropMode={isCropMode}
        onImageResize={(value) => {
          const aspectRatio = imageDimensions.width / imageDimensions.height
          const newWidth = value
          const newHeight = newWidth / aspectRatio
          const newDimensions = { width: newWidth, height: newHeight }
          setImageDimensions(newDimensions)
        }}
        onBrightnessChange={setBrightness}
        onContrastChange={setContrast}
        onRotationChange={setRotation}
        onFlipHorizontal={() => setFlipHorizontal(!flipHorizontal)}
        onFlipVertical={() => setFlipVertical(!flipVertical)}
        onAspectRatioChange={setSelectedAspectRatio}
        onCropToggle={() => setIsCropMode(!isCropMode)}
        onAiToolClick={(tool) => {
          console.log(`AI Tool clicked: ${tool}`)
          // TODO: Implement AI tool functionality
        }}
      />

      {/* Single Progressive Container */}
      <div className="flex flex-col items-center gap-8 max-w-4xl w-full -mt-16">
        {/* Image Generator Container - Shows when + button is clicked */}
        <ImageGeneratorCard
          isOpen={showImageGenerator && !uploadedImage}
          onClose={() => setShowImageGenerator(false)}
          isGenerating={isGeneratingNewImage}
          onGenerate={(prompt) => {
            console.log('🎨 Generating image with prompt:', prompt)
            setIsGeneratingNewImage(true)
            // Simulate generation time
            setTimeout(() => {
              setIsGeneratingNewImage(false)
            }, 3000)
          }}
        />
        
        {/* Step 2: Image Preview with File Details (shows after upload, hides when method selection starts) */}
        {uploadedImage && !showMethodSelection && !selectedScenario && (
          <ImagePreview
            src={uploadedImage.preview}
            alt="Uploaded"
            name={uploadedImage.name}
            size={uploadedImage.size}
            type={uploadedImage.type}
            imageDimensions={imageDimensions}
            brightness={brightness}
            contrast={contrast}
            rotation={rotation}
            flipHorizontal={flipHorizontal}
            flipVertical={flipVertical}
            selectedAspectRatio={selectedAspectRatio}
            isCropMode={isCropMode}
            onEditModeChange={setIsImageEditMode}
            onImageDimensionsChange={setImageDimensions}
            onCropApply={async (cropArea) => {
              console.log('Crop applied to first image:', cropArea)
              try {
                // Crop the actual image
                const croppedImage = await cropImage(
                  uploadedImage.preview,
                  cropArea,
                  uploadedImage.name,
                  0.95, // Higher quality for better results
                  imageDimensions
                )
                
                // Clean up the old preview URL
                cleanupImageUrl(uploadedImage.preview)
                
                // Update the uploaded image with the cropped version
                setUploadedImage({
                  name: croppedImage.file.name,
                  size: croppedImage.file.size,
                  type: croppedImage.file.type,
                  preview: croppedImage.preview,
                  file: croppedImage.file
                })
                
                // Update image dimensions to match cropped size
                setImageDimensions(croppedImage.croppedDimensions)
                
                // Exit crop mode
                setIsCropMode(false)
                
                console.log('Image successfully cropped:', {
                  original: croppedImage.originalDimensions,
                  cropped: croppedImage.croppedDimensions
                })
              } catch (error) {
                console.error('Failed to crop image:', error)
                alert('Failed to crop image. Please try again.')
              }
            }}
            onCropCancel={() => {
              console.log('Crop cancelled for first image')
              setIsCropMode(false)
            }}
          />
        )}
        
        {/* Step 3: Method Selection (shows after clicking next arrow, hides after selection) */}
        {uploadedImage && showMethodSelection && !selectedScenario && (
          <MethodSelection
            selectedMethod={selectedMethod}
            onMethodSelect={setSelectedMethod}
            onProceed={() => selectScenario(selectedMethod)}
          />
        )}
        
        {/* AI Analysis Data Display - Only for Magic scenario after proceeding, hides after clicking Generate Image */}
        {selectedScenario === 'magic' && analysis && !isGeneratingImage && !showImageProcessing && !generatedImageUrl && (
          <AnalysisCard 
            analysis={analysis} 
            uploadedImageUrl={uploadedImage?.preview}
          />
        )}
        
        {/* Generated Image Preview - Shows AI generated image in Magic scenario */}
        {selectedScenario === 'magic' && generatedImageUrl && !isLoadingTransitions && !selectedTransition && (
          <div className="flex justify-center">
            <div className="animate-fade-in relative inline-block rounded-xl overflow-hidden border border-white/10">
              <img 
                src={generatedImageUrl} 
                alt="AI Generated Image" 
                className="block max-w-full max-h-48 h-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Step 4.5: Image B Preview with File Details (shows when uploaded in Creative mode, hides when transitions start) */}
        {imageBPreview && selectedScenario === 'creative' && uploadedImageB && !isLoadingTransitions && !selectedTransition && !shouldShowTransitionSelection() && (
          <ImagePreview
            src={imageBPreview}
            alt="Second Image"
            name={uploadedImageB.name}
            size={uploadedImageB.size}
            type={uploadedImageB.type}
            imageDimensions={imageDimensions}
            brightness={brightness}
            contrast={contrast}
            rotation={rotation}
            flipHorizontal={flipHorizontal}
            flipVertical={flipVertical}
            selectedAspectRatio={selectedAspectRatio}
            isCropMode={isCropMode}
            onEditModeChange={setIsImageEditMode}
            onImageDimensionsChange={setImageDimensions}
            onCropApply={async (cropArea) => {
              console.log('Crop applied to second image:', cropArea)
              try {
                // Crop the actual image
                const croppedImage = await cropImage(
                  imageBPreview,
                  cropArea,
                  uploadedImageB.name,
                  0.95, // Higher quality for better results
                  imageDimensions
                )
                
                // Clean up the old preview URL
                cleanupImageUrl(imageBPreview)
                
                // Update the uploaded image B with the cropped version
                setUploadedImageB({
                  name: croppedImage.file.name,
                  size: croppedImage.file.size,
                  type: croppedImage.file.type,
                  preview: croppedImage.preview,
                  file: croppedImage.file
                })
                
                // Update the preview state
                setImageBPreview(croppedImage.preview)
                
                // Update image dimensions to match cropped size
                setImageDimensions(croppedImage.croppedDimensions)
                
                // Exit crop mode
                setIsCropMode(false)
                
                console.log('Second image successfully cropped:', {
                  original: croppedImage.originalDimensions,
                  cropped: croppedImage.croppedDimensions
                })
              } catch (error) {
                console.error('Failed to crop second image:', error)
                alert('Failed to crop second image. Please try again.')
              }
            }}
            onCropCancel={() => {
              console.log('Crop cancelled for second image')
              setIsCropMode(false)
            }}
          />
        )}

        {/* Step 5: Scenario-Specific Content */}
        {selectedScenario && (
          <div className="w-full max-w-2xl space-y-4 animate-slide-in-right">
            
            {/* Magic Scenario Customization */}
            {selectedScenario === 'magic' && (
              <MagicOptions
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                selectedMagicOption={selectedMagicOption}
                customMagicInput={customMagicInput}
                onOptionSelect={setSelectedMagicOption}
                onCustomInputChange={setCustomMagicInput}
                onProceed={(scenarioId: string) => {
                  console.log('🔥 Main component Magic onProceed called with scenarioId:', scenarioId)
                  selectMagicScenario(scenarioId)
                }}
                isGeneratingImage={isGeneratingImage}
                showImageProcessing={showImageProcessing}
                generatedImageUrl={generatedImageUrl}
              />
            )}

            {/* Creative Scenario Customization - Upload handled by floating button */}

            {/* Viral Scenario Customization */}
            {selectedScenario === 'viral' && (
              <ViralTemplates
                templates={viralTemplates}
                videoUrls={templateVideoUrls}
                thumbnailUrls={templateThumbnailUrls}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                onConfirm={() => {
                  setViralTemplateConfirmed(true)
                  videoCreation.loadTransitionSuggestions()
                  // Close sidebar controls when proceeding to transitions
                  setIsImageEditMode(false)
                  setIsCropMode(false)
                }}
                viralTemplateConfirmed={viralTemplateConfirmed}
              />
            )}

            {/* Transition Selection & Video Generation */}
            {shouldShowTransitionSelection() && (
              <div className="space-y-4">
                <TransitionSelection
                  isLoadingTransitions={isLoadingTransitions}
                  transitionSuggestions={transitionSuggestions}
                  selectedTransitionOption={selectedTransitionOption}
                  customTransitionPrompt={customTransitionPrompt}
                  selectedTransition={selectedTransition}
                  onTransitionOptionSelect={setSelectedTransitionOption}
                  onCustomPromptChange={setCustomTransitionPrompt}
                  onProceed={(transition) => {
                    console.log('🔥 Main component onProceed called with transition:', transition)
                    selectTransition(transition)
                    console.log('🔥 About to call generateVideo() with transition')
                    generateVideo(transition)
                  }}
                />

                <VideoGeneration
                  selectedTransition={selectedTransition}
                  isGeneratingVideo={isGeneratingVideo}
                  finalVideoUrl={finalVideoUrl}
                  videoGenerationTasks={videoGenerationTasks}
                  generatedImageUrl={generatedImageUrl}
                  imageBPreview={imageBPreview}
                  uploadedImagePreview={uploadedImage?.preview}
                  onGenerateVideo={generateVideo}
                  onDownloadVideo={downloadVideo}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Controls - Centered as a group */}
      <div className="fixed left-1/2 bottom-6 transform -translate-x-1/2 z-[1001] flex items-center gap-3">
        {/* Generate Image Button - Show when no image uploaded and generator not open */}
        {!uploadedImage && !showImageGenerator && (
          <div className="relative group">
            <FloatButton
              icon={<Plus className="w-4 h-4" />}
              type="primary"
              onClick={() => setShowImageGenerator(true)}
              style={{ position: 'relative' }}
            />
            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Generate image
            </div>
          </div>
        )}

        {/* Upload Button - Show when no image uploaded OR when in creative mode and need Image B, but not when generator is open */}
        {((!uploadedImage && !showImageGenerator) || (selectedScenario === 'creative' && !imageBPreview)) && (
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const preview = e.target?.result as string
                    // Determine if this is for Image A or Image B
                    if (!uploadedImage) {
                      // First upload - Image A
                      handleFileSelect(file, preview)
                    } else if (selectedScenario === 'creative' && !imageBPreview) {
                      // Creative mode - Image B
                      handleImageBSelect(file, preview)
                    }
                  }
                  reader.readAsDataURL(file)
                }
                // Reset the input so the same file can be selected again if needed
                e.target.value = ''
              }}
              className="hidden"
              id="file-upload"
            />
            <FloatButton
              icon={<Upload className="w-4 h-4" />}
              type="primary"
              onClick={() => document.getElementById('file-upload')?.click()}
              style={{ 
                position: 'relative',
                animation: (selectedScenario === 'creative' && !imageBPreview) ? 'pulse 2s infinite' : 'none'
              }}
            />
            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {!uploadedImage ? 'Upload image' : 'Upload second image'}
            </div>
          </div>
        )}

        {/* Color Picker */}
        <div className="group">
          <ColorPickerFloat 
            onColorChange={setBackgroundColor}
            currentColor={backgroundColor}
          />
        </div>
        
        {/* Reset Flow Button - Only show when there's something to reset */}
        {(uploadedImage || selectedScenario) && (
          <div className="relative group">
            <FloatButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              type="primary"
              onClick={() => {
                handleFileRemove()
                setSelectedMethod(null)
                setShowMethodSelection(false)
                setCreativeConfirmed(false)
                setShowImageGenerator(false)
                setIsImageEditMode(false)
                setImageDimensions({ width: 320, height: 240 })
                setBrightness(100)
                setContrast(100)
                setRotation(0)
                setFlipHorizontal(false)
                setFlipVertical(false)
                setSelectedAspectRatio('free')
                setIsCropMode(false)
              }}
              style={{ position: 'relative' }}
            />
            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Reset flow
            </div>
          </div>
        )}

        {/* Next Action Button - Shows when user can proceed to next step */}
        {nextAction.show && (
          <div className="relative group">
            <FloatButton
              icon={<ArrowRight className="w-4 h-4" />}
              type="primary"
              onClick={nextAction.action}
              style={{ position: 'relative' }}
            />
            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {nextAction.tooltip}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VideoCreatorPage() {
  return (
    <ThemeProvider>
      <VideoCreatorContent />
    </ThemeProvider>
  )
}