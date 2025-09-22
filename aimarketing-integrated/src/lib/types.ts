// lib/types.ts

export interface ImageUpload {
  file: File;
  url: string;
  id: string;
}

export interface VideoProject {
  id: string;
  name: string;
  imageA: ImageUpload | null; // Initial image
  imageB: ImageUpload | null; // Final image
  scenario: VideoScenario;
  prompt?: string;
  template?: ViralTemplate;
  status: ProjectStatus;
  createdAt: Date;
  videoUrl?: string;
  audioTrack?: AudioTrack;
}

export type VideoScenario = 'magico' | 'criativo' | 'viral';

export type ProjectStatus = 'initial' | 'uploading' | 'analyzing' | 'generating' | 'completed' | 'error';

export interface AIScenarioSuggestion {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'adventure' | 'luxury' | 'minimal' | 'futuristic';
}

export interface TransitionPrompt {
  id: string;
  text: string;
  description: string;
  mood: 'smooth' | 'dramatic' | 'elegant' | 'energetic';
}

export interface ViralTemplate {
  id: string;
  name: string;
  description: string;
  example: string;
  requiredImages: {
    imageA: string;
    imageB?: string;
    additional?: string[];
  };
  superOptimizedPrompt: string;
  estimatedViralScore: number;
  trending: boolean;
  duration: number;
  tags: string[];
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  mood: 'energetic' | 'calm' | 'dramatic' | 'upbeat' | 'cinematic';
  genre: string;
}

export interface VideoGenerationRequest {
  imageA: string; // Base64 or URL
  imageB: string; // Base64 or URL
  prompt: string;
  template?: string;
  duration?: number;
  quality?: 'draft' | 'standard' | 'high';
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  processingTime?: number;
}

// Usage tracking and pricing types
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: {
    videosPerMonth: number;
    maxVideoLength: number; // in seconds
    maxFileSize: number; // in MB
    aiAnalysis: boolean;
    customPrompts: boolean;
    viralTemplates: boolean;
    audioLibrary: boolean;
    hd4kExport: boolean;
    priority: boolean;
  };
}

export interface UsageMetrics {
  videosCreated: number;
  videosRemaining: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
  aiAnalysisUsed: number;
  aiAnalysisRemaining: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface UsageHistory {
  date: Date;
  videosCreated: number;
  storageUsed: number;
  aiAnalysisUsed: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: PricingPlan;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}
