// components/VideoCreator/steps/ViralTemplates.tsx

'use client'

import { VideoTemplateGrid } from '../../ui/video-template-card'
import { ViralTemplate } from '../../../lib/types'

interface ViralTemplatesProps {
  templates: ViralTemplate[]
  videoUrls: string[]
  thumbnailUrls: string[]
  selectedTemplate: ViralTemplate | null
  onTemplateSelect: (template: ViralTemplate) => void
  onConfirm: () => void
  viralTemplateConfirmed: boolean
}

export function ViralTemplates({
  templates,
  videoUrls,
  thumbnailUrls,
  selectedTemplate,
  onTemplateSelect,
  onConfirm,
  viralTemplateConfirmed
}: ViralTemplatesProps) {
  return (
    <div className="space-y-4">
      {/* Video Templates Grid - Only show when no template is confirmed */}
      {!viralTemplateConfirmed && (
        <VideoTemplateGrid
          templates={templates}
          videoUrls={videoUrls}
          thumbnailUrls={thumbnailUrls}
          selectedTemplateId={selectedTemplate?.id}
          onTemplateSelect={onTemplateSelect}
          columns={3}
          gap="md"
        />
      )}
      

    </div>
  )
}
