'use server'

import OpenAI from 'openai'
import yaml from 'js-yaml'
import { fal } from '@fal-ai/client'
import axios from 'axios'
import { createClient } from '../lib/supabase/server'



interface VideoScene {
  model: string
  video_prompt: string
  aspect_ratio_video: string
}

interface FalMergeResult {
  video?: {
    url: string
  }
  data?: {
    video?: {
      url: string
    }
    video_url?: string
  }
  video_url?: string
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  console.log('🔑 OpenAI API Key existe:', !!apiKey)
  console.log('🔑 OpenAI API Key primeiros chars:', apiKey ? apiKey.slice(0, 8) + '...' : 'INEXISTENTE')
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não encontrada no ambiente')
  }
  
  return new OpenAI({
    apiKey: apiKey,
  })
}

function configureFalClient() {
  let falKey = process.env.FAL_KEY
  console.log('🔧 Configurando fal.ai, key existe:', !!falKey)
  
  if (falKey) {
    // Limpar caracteres extra se existirem
    falKey = falKey.replace(/^[=]+/, '').trim()
    console.log('🔧 FAL key limpa primeiros chars:', falKey.slice(0, 10) + '...')
    console.log('🔧 FAL key formato:', falKey.includes(':') ? 'Correto (tem :)' : 'Incorreto (sem :)')
  }
  
  fal.config({
    credentials: falKey,
  })
}

// Função para buscar o status atual de um job
export async function getJobStatus(jobId: string) {
  try {
    const supabase = await createClient()
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar job: ${error.message}`)
    }

    return job
  } catch (error) {
    console.error('Erro ao buscar status do job:', error)
    throw error
  }
}

export async function createJob(formData: FormData) {
  try {
    const prompt = formData.get('prompt') as string
    const image = formData.get('image') as File | null
    const aspectRatio = formData.get('aspect_ratio') as string || '9:16'
    const duration = formData.get('duration') as string || '8'

    if (!prompt) {
      throw new Error('Prompt é obrigatório')
    }

    // Criar prompt enriquecido com as configurações do usuário (em inglês)
    const enrichedPrompt = `${prompt}

Requested settings:
- Video format: ${aspectRatio}
- Total duration: ${duration} seconds`

    const supabase = await createClient()
    let imageUrl: string | null = null

    // Upload da imagem se foi fornecida
    if (image && image.size > 0) {
      const fileName = `imagem-${Date.now()}-${image.name}`
      
      console.log('🔍 Upload de imagem iniciado:', fileName.split('/').pop())
      
      // Verificar se o bucket existe, se não, criar
      const bucketName = 'image-uploads'
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
       if (listError) {
         console.error('❌ Erro ao listar buckets:', listError)
       } else {
         const bucketExists = buckets.some(bucket => bucket.name === bucketName)
         
         if (!bucketExists) {
           console.log('🏗️ Criando bucket...')
           const { error: createError } = await supabase.storage.createBucket(bucketName, {
             public: true,
             allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
             fileSizeLimit: 50 * 1024 * 1024
           })
           
           if (createError) {
             console.error('❌ Erro ao criar bucket:', createError)
           }
         }
       }
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, image)

       if (uploadError) {
         console.error('❌ Upload falhou:', uploadError.message)
         throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`)
       }
       
       console.log('✅ Upload concluído:', uploadData.path)

      // Obter URL público da imagem
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path)
      
      imageUrl = publicUrl
    }

    // Inserir na base de dados
    const { data: newJobData, error: dbError } = await supabase
      .from('jobs')
      .insert({
        prompt: enrichedPrompt,
        image_url: imageUrl,
        status: 'pending'
      })
      .select('id')
      .single()

    if (dbError) {
      throw new Error(`Erro ao inserir na base de dados: ${dbError.message}`)
    }

    const newJobId = newJobData.id.toString()

    // Iniciar processamento em background sem await
    if (imageUrl) {
      processJobInBackground(newJobId).catch(error => {
        console.error('Erro no processamento em background:', error)
      })
    }

    // Retornar o job completo imediatamente
    return newJobData
    
  } catch (error) {
    console.error('Erro ao criar job:', error)
    throw error
  }
}

// Função para processar o job em background
async function processJobInBackground(jobId: string) {
  try {
    await analyzeImage(jobId)
    // A cadeia completa será: analyzeImage -> generateImagePrompt -> generateImage -> generateVideoPrompts
    // (as chamadas subsequentes já estão encadeadas nas funções existentes)
  } catch (error) {
    console.error('Erro no processamento em background:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
  }
}

export async function analyzeImage(jobId: string) {
  try {
    console.log('🔍 Iniciando análise de imagem para job:', jobId)
    const supabase = await createClient()

    // 1. Procurar o trabalho na base de dados
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('image_url')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Trabalho não encontrado: ${fetchError?.message}`)
    }

    if (!job.image_url) {
      throw new Error('Trabalho não possui imagem para análise')
    }

    console.log('🖼️ Imagem encontrada, iniciando análise OpenAI...')

    // 2. Atualizar status para 'analyzing_image'
    const { error: statusUpdateError } = await supabase
      .from('jobs')
      .update({ status: 'analyzing_image' })
      .eq('id', jobId)

    if (statusUpdateError) {
      throw new Error(`Erro ao atualizar status: ${statusUpdateError.message}`)
    }

    // 3. Fazer chamada para OpenAI
    const openai = getOpenAIClient()
    console.log('🤖 Chamando OpenAI para análise...')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the given image and determine if it primarily depicts a product or a character, or BOTH.

- If the image is of a product, return the analysis in YAML format with the following fields:

brand_name: (Name of the brand shown in the image, if visible or inferable)
color_scheme:
  - hex: (Hex code of each prominent color used)
    name: (Descriptive name of the color)
font_style: (Describe the font family or style used: serif/sans-serif, bold/thin, etc.)
visual_description: (A full sentence or two summarizing what is seen in the image, ignoring the background)

- If the image is of a character, return the analysis in YAML format with the following fields:

character_name: (Name of the character if visible or inferable)
color_scheme:
  - hex: (Hex code of each prominent color used on the character)
    name: (Descriptive name of the color)
outfit_style: (Description of clothing style, accessories, or notable features)
visual_description: (A full sentence or two summarizing what the character looks like, ignoring the background)

- if it is BOTH, return both descriptions as guided above in YAML format

Only return the YAML. Do not explain or add any other comments.`
            },
            {
              type: 'image_url',
              image_url: {
                url: job.image_url
              }
            }
          ]
        }
      ]
    })

    // 4. Obter a resposta YAML
    let yamlResponse = response.choices[0]?.message?.content
    console.log('✅ OpenAI respondeu com sucesso')

    if (!yamlResponse) {
      throw new Error('Resposta vazia da OpenAI')
    }

    // 5. Limpar markdown code blocks se existirem
    yamlResponse = yamlResponse.replace(/```yaml\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    console.log('🧹 YAML limpo:', yamlResponse.substring(0, 100) + '...')

    // 6. Fazer parse do YAML
    const analysisResult = yaml.load(yamlResponse) as Record<string, unknown>
    console.log('✅ YAML processado com sucesso')

    // 7. Atualizar a base de dados com o resultado
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        analysis_result: analysisResult,
        status: 'analysis_complete'
      })
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Erro ao guardar análise: ${updateError.message}`)
    }
    
    console.log('✅ Análise salva na DB, iniciando geração de prompt...')

    // 8. Gerar prompt de imagem automaticamente
    await generateImagePrompt(jobId)

    return analysisResult

  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
    
    throw error
  }
}

export async function generateImagePrompt(jobId: string) {
  try {
    console.log('🎯 Iniciando geração de prompt de imagem...')
    const supabase = await createClient()

    // 1. Buscar dados do trabalho
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('prompt, analysis_result')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Trabalho não encontrado: ${fetchError?.message}`)
    }

    if (!job.prompt || !job.analysis_result) {
      throw new Error('Dados insuficientes para gerar prompt de imagem')
    }

    // 2. Atualizar status para 'generating_image_prompt'
    const { error: statusUpdateError } = await supabase
      .from('jobs')
      .update({ status: 'generating_image_prompt' })
      .eq('id', jobId)

    if (statusUpdateError) {
      throw new Error(`Erro ao atualizar status: ${statusUpdateError.message}`)
    }

    // 3. Construir prompts para OpenAI
    const systemPrompt = `## SYSTEM PROMPT: Image Prompt Generator

Default: If the user's instructions are not very detailed, just default the prompt to: put this (product) into the scene with the (character).

***

If the user wants UGC authentic casual content: Use **casual UGC-style scenes** unless the user specifies otherwise, and follow the instructions below.

If the user explicitly requests a different style or setting, follow their instructions.

Your task: Take the reference image or the product in the reference image and place it into realistic, casual scenes as if captured by everyday content creators or influencers.

All outputs must feel **natural, candid, and unpolished** - avoiding professional or overly staged looks. This means:
- Everyday realism with authentic, relatable settings
- Amateur-quality iPhone photo style
- Slightly imperfect framing and lighting
- Candid poses and genuine expressions
- Visible imperfections (blemishes, messy hair, uneven skin, texture flaws)
- Real-world environments left as-is (clutter, busy backgrounds)
Always preserve all visible product text accurately (logos, slogans, packaging claims). Never invent extra claims or numbers.

Camera parameter must always include casual realism descriptors such as:
unremarkable amateur iPhone photos, reddit image, snapchat photo, Casual iPhone selfie, slightly uneven framing, Authentic share, slightly blurry, Amateur quality phone photo

Dialogue/video generation is not required. Only image prompts are generated.

Avoid mentioning the name of any copyrighted characters in the prompt

A - Ask:
Generate image generation instructions only for AI models based on the user's request, ensuring exact JSON format.
Default to vertical aspect ratio if unspecified.
Always include both:
'image_prompt' (a single string with scene details)
'aspect_ratio_image' ("3:2" or "2:3")

G - Guidance:
Always follow UGC-style casual realism principles listed above.
Ensure diversity in gender, ethnicity, and hair color when applicable. Default to actors in 21 to 38 years old unless specified otherwise.
Default to casual real-world environments unless a setting is explicitly specified.
Avoid double quotes in the image prompts.

Examples:
good examples:
{
    "image_prompt": "action: character holds product naturally, character: infer from the reference image, product: show product with all visible text clear and accurate, setting: infer from the image or from user instruction, camera: amateur iPhone photo, casual selfie, uneven framing, slightly blurry, style: candid UGC look, no filters, imperfections intact, text_accuracy: preserve all visible text exactly as in reference image",
    "aspect_ratio_image": "2:3"
}
bad examples:
Altering or fabricating product packaging text

N - Notation:
Final output is an object containing only:
'image_prompt' -> string
'aspect_ratio_image' -> "3:2" or "2:3" (default vertical -> "2:3")

T - Tools:
Think Tool: Double-check output for completeness, text accuracy, adherence to UGC realism, and that only image outputs are returned.`

    // Converter analysis_result para string formatada
    const analysisResultString = JSON.stringify(job.analysis_result, null, 2)

    const userPrompt = `Your task: Create 1 image prompt as guided by your system guidelines.
Make sure that the reference image is depicted as ACCURATELY as possible in the resulting images, especially all text

Please respond in JSON format as specified in the system guidelines.

***

These are the user's instructions
${job.prompt}
***

Description of the reference image:
${analysisResultString}

***

The user's preferred aspect ratio: inferred based on their message above, default is vertical if not given

***

use the think tool to double check your output`

    // 4. Chamar a API da OpenAI
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    // 5. Obter e fazer parse da resposta JSON
    const jsonResponse = response.choices[0]?.message?.content
    console.log('✅ OpenAI gerou prompt com sucesso')

    if (!jsonResponse) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const generatedPrompt = JSON.parse(jsonResponse)

    // 6. Guardar o resultado na base de dados
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        generated_image_prompt: generatedPrompt,
        status: 'image_prompt_complete'
      })
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Erro ao guardar prompt gerado: ${updateError.message}`)
    }
    
    console.log('✅ Prompt salvo na DB, iniciando geração de imagem...')

    // 7. Gerar imagem automaticamente
    await generateImage(jobId)

    return generatedPrompt

  } catch (error) {
    console.error('Erro ao gerar prompt de imagem:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
    
    throw error
  }
}

export async function generateImage(jobId: string) {
  try {
    console.log('🖼️ Iniciando geração de imagem com fal.ai...')
    const supabase = await createClient()

    // 1. Buscar dados do trabalho
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('generated_image_prompt, image_url')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Trabalho não encontrado: ${fetchError?.message}`)
    }

    if (!job.generated_image_prompt || !job.image_url) {
      throw new Error('Dados insuficientes para gerar imagem (prompt ou imagem original em falta)')
    }

    // 2. Atualizar status para 'generating_image'
    const { error: statusUpdateError } = await supabase
      .from('jobs')
      .update({ status: 'generating_image' })
      .eq('id', jobId)

    if (statusUpdateError) {
      throw new Error(`Erro ao atualizar status: ${statusUpdateError.message}`)
    }

    // 3. Configurar cliente fal.ai
    configureFalClient()

    // 4. Extrair prompt de texto
    const imagePromptText = job.generated_image_prompt.image_prompt
    const originalImageUrl = job.image_url

    if (!imagePromptText) {
      throw new Error('Prompt de imagem não encontrado no resultado gerado')
    }

    // 5. Chamar a API da fal.ai
    console.log('🎨 Chamando fal.ai para gerar imagem...')
    console.log('🔑 FAL_KEY existe:', !!process.env.FAL_KEY)
    console.log('📝 Prompt:', imagePromptText.substring(0, 100) + '...')
    console.log('🖼️ URL original:', originalImageUrl)
    
    try {
      const result = await fal.subscribe('fal-ai/nano-banana/edit', {
        input: {
          prompt: imagePromptText,
          image_urls: [originalImageUrl],
          num_images: 1,
          output_format: 'jpeg'
        }
      })
      
      console.log('📦 Resposta fal.ai:', JSON.stringify(result, null, 2))
      
      // 6. Verificar se temos resultado (estrutura correta da fal.ai)
      if (!result.data || !result.data.images || !result.data.images[0] || !result.data.images[0].url) {
        console.error('❌ Estrutura da resposta fal.ai:', {
          hasData: !!result.data,
          hasImages: !!result.data?.images,
          imagesLength: result.data?.images?.length,
          firstImage: result.data?.images?.[0],
          fullResult: result
        })
        throw new Error('Resposta inválida da API fal.ai - imagem não gerada')
      }

      const generatedImageUrl = result.data.images[0].url
      console.log('✅ Imagem gerada com sucesso')

      // 7. Guardar resultado na base de dados
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          generated_image_url: generatedImageUrl,
          status: 'image_complete'
        })
        .eq('id', jobId)

      if (updateError) {
        throw new Error(`Erro ao guardar imagem gerada: ${updateError.message}`)
      }
      
      console.log('✅ Imagem salva na DB, iniciando geração de prompts de vídeo...')

      // 8. Gerar prompts de vídeo automaticamente
      await generateVideoPrompts(jobId)
      
      // 9. Gerar clips de vídeo automaticamente
      const videoResult = await generateVideoClips(jobId)
      
    // 10. Juntar clips num vídeo final (só se necessário)
    if (Array.isArray(videoResult) && videoResult.length > 1) {
      console.log(`🔗 Multiple clips detected (${videoResult.length}), merging videos...`);
      await mergeVideoClips(jobId)
    } else if (Array.isArray(videoResult) && videoResult.length === 1) {
      console.log(`🎬 Single clip detected, setting as final video...`);
      // If only one clip, set it directly as final video
      const supabase = await createClient();
      await supabase
        .from('jobs')
        .update({ 
          video_url: videoResult[0],
          status: 'complete'
        })
        .eq('id', jobId);
    } else {
      console.log(`⚠️ No valid video clips found, cannot proceed with merge`);
    }

      return generatedImageUrl
      
    } catch (falError: unknown) {
      const error = falError as { message?: string; status?: number; body?: unknown }
      console.error('❌ Erro na fal.ai:', {
        message: error.message,
        status: error.status,
        body: error.body
      })
      
      // BYPASS TEMPORÁRIO - Vamos completar o fluxo sem imagem gerada
      console.log('⚠️ BYPASS: Continuando sem geração de imagem, saltando para prompts de vídeo...')
      
      // Atualizar status e continuar
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          status: 'image_skipped'
        })
        .eq('id', jobId)

      if (updateError) {
        console.error('❌ Erro ao atualizar status bypass:', updateError)
      }
      
      // Continuar para prompts de vídeo mesmo sem imagem
      await generateVideoPrompts(jobId)
      
      // Não gerar vídeos sem imagem de referência - finalizar aqui
      console.log('⚠️ BYPASS: Saltando geração de vídeos (sem imagem de referência)')
      await supabase
        .from('jobs')
        .update({ status: 'complete' })
        .eq('id', jobId)
      
      return 'fal_bypassed'
    }


  } catch (error) {
    console.error('Erro ao gerar imagem:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
    
    throw error
  }
}

export async function generateVideoPrompts(jobId: string) {
  try {
    console.log('🎬 Iniciando geração de prompts de vídeo...')
    const supabase = await createClient()

    // 1. Buscar dados do trabalho
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('prompt, analysis_result')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Trabalho não encontrado: ${fetchError?.message}`)
    }

    if (!job.prompt || !job.analysis_result) {
      throw new Error('Dados insuficientes para gerar prompts de vídeo')
    }

    // 2. Atualizar status para 'generating_video_prompts'
    const { error: statusUpdateError } = await supabase
      .from('jobs')
      .update({ status: 'generating_video_prompts' })
      .eq('id', jobId)

    if (statusUpdateError) {
      throw new Error(`Erro ao atualizar status: ${statusUpdateError.message}`)
    }

    // 3. Construir prompts para OpenAI
    const systemPrompt = `SYSTEM PROMPT: UGC-Style Veo3_fast Prompt Generator (Video-Only)

You are a UGC (User-Generated Content) AI agent.

Your task: Take the reference image or the product in the reference image and place it into realistic, casual scenes as if captured by everyday content creators or influencers.

All outputs must feel natural, candid, and unpolished – avoiding professional or overly staged looks. This means:

Everyday realism with authentic, relatable settings

Amateur-quality iPhone photo/video style

Slightly imperfect framing and lighting

Candid poses and genuine expressions

Visible imperfections (blemishes, messy hair, uneven skin)

Real-world environments left as-is (clutter, busy backgrounds)

We need these videos to look natural and real. So in the prompts, have the Camera parameter always use keywords like these: unremarkable amateur iPhone photos, reddit image, snapchat video, Casual iPhone selfie, slightly uneven framing, Authentic share, slightly blurry, Amateur quality phone photo

If the dialogue is not provided by the user or you are explicitly asked to create it, generate a casual, conversational line under 150 characters, as if a person were speaking naturally to a friend while talking about the product. Avoid overly formal or sales-like language. The tone should feel authentic, spontaneous, and relatable, matching the UGC style. Use ... to indicate pauses, and avoid special characters like em dashes or hyphens.

A - Ask:
Generate only video generation instructions for AI models (no image prompts). Infer aspect ratios from vertical/horizontal context; default to vertical if unspecified.

Scene count rule:

Read the user's requested total video duration and the per-video length (in seconds).

Calculate the required number of videos by dividing total duration by per-video length, rounding up to the nearest integer.

Output exactly that many scenes.

Never output more or fewer scenes than requested.


G - Guidance:

Always follow UGC-style casual realism principles listed above.

Ensure diversity in gender, ethnicity, and hair color when applicable. Default to actors in 21 to 38 years old unless specified otherwise.

Use provided scene list when available.

Do not use double quotes in any part of the prompts.

E - Examples:
good_examples:

{
"scenes": [
{
"video_prompt": "dialogue: so tikTok made me buy this... honestly its the best tasting fruit beer in sydney and they donate profits to charity...\\naction: character sits in drivers seat of a parked car, holding the beer can casually while speaking\\ncamera: amateur iphone selfie video, uneven framing, natural daylight\\nemotion: very happy, casual excitement\\ntype: veo3_fast",
"aspect_ratio_video": "9:16",
"model": "veo3_fast"
}
]
}

N - Notation:

Final output is a "scenes" array at the root level.

The array must contain exactly 'scene_count' objects, where 'scene_count' is the user-calculated number.

All clips are sequential parts of ONE single continuous video. 
Dialogue and actions must feel like natural continuation from the previous scene. 
Do not restart or repeat the introduction after scene 1.
If you receive 'Unknown brand', never mention it. It only means there is no brand to represent, so you must not say 'Unknown brand' under any circumstance.`

    // Converter analysis_result para string formatada
    const analysisResultString = JSON.stringify(job.analysis_result, null, 2)

    // Extract duration from the enriched prompt to calculate exact scene count
    let exactSceneCount = 1; // default
    if (job.prompt.includes('Total duration: 16 seconds')) {
      exactSceneCount = 2;
    } else if (job.prompt.includes('Total duration: 24 seconds')) {
      exactSceneCount = 3;
    } else if (job.prompt.includes('Total duration: 8 seconds')) {
      exactSceneCount = 1;
    }
    
    console.log(`🎯 OpenAI will generate exactly ${exactSceneCount} scene(s) based on duration`);

    const userPrompt = `Your task: Create video prompts as guided by your system guidelines.

Please respond in JSON format with the scenes array as specified in the system guidelines.

CRITICAL: You MUST generate exactly ${exactSceneCount} scene(s). No more, no less.

Make sure that the reference image is depicted as ACCURATELY as possible in the resulting videos, especially all text.

For each of the scenes, make sure the dialogue runs continuously and makes sense. And always have the character just talk about the product benefits based on what you understand about the brand, and how it's used. So if it's a drink, talk about the taste; if it's a bag, talk about the design; if it's tech, talk about its features, and so on.

All dialogue should be in ENGLISH. Make it sound natural and authentic like a real influencer.

If the character will mention the brand name, only do so in the FIRST scene.

Unless stated by the user, do not have the character open or eat or use the product. They are just showing it to the camera.

***
These are the users instructions: ${job.prompt}

***

Description of the reference image/s. Just use this to understand who the product or character is, don't use it as basis for the dialogue: ${analysisResultString}

The user's preferred aspect ratio: inferred based on their message above, default is vertical if not given

The user's preferred model: inferred based on their message above, default is veo3_fast if not given

The users preferred dialogue script: inferred based on their message above, suggest a script

***
Use the Think tool to double check your JSON output

Remember: Generate exactly ${exactSceneCount} scene(s). Each scene will be 8 seconds long.`

    // 4. Chamar a API da OpenAI
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    // 5. Obter e fazer parse da resposta JSON
    const jsonResponse = response.choices[0]?.message?.content

    if (!jsonResponse) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const videoPrompts = JSON.parse(jsonResponse)

    // 6. Guardar o resultado na base de dados
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        generated_video_prompts: videoPrompts.scenes,
        status: 'video_prompts_complete'
      })
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Erro ao guardar prompts de vídeo: ${updateError.message}`)
    }
    
    console.log('✅ Prompts de vídeo salvos, iniciando geração de clips...')

    return videoPrompts.scenes

  } catch (error) {
    console.error('Erro ao gerar prompts de vídeo:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
    
    throw error
  }
}

// Função auxiliar para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function generateVideoClips(jobId: string) {
  try {
    console.log('🎬 Iniciando geração de clips de vídeo...')
    const supabase = await createClient()

    // 1. Buscar dados do trabalho
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('generated_video_prompts, generated_image_url, prompt')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Trabalho não encontrado: ${fetchError?.message}`)
    }

    if (!job.generated_video_prompts || !job.generated_image_url) {
      throw new Error('Dados insuficientes: prompts de vídeo ou imagem gerada em falta')
    }

    const scenes = job.generated_video_prompts
    const imageUrl = job.generated_image_url
    
    // Extrair aspect ratio do prompt enriched (agora em inglês)
    let aspectRatio = '9:16' // default vertical
    if (job.prompt.includes('Video format: 16:9')) {
      aspectRatio = '16:9'
    } else if (job.prompt.includes('Video format: 9:16')) {
      aspectRatio = '9:16'
    }
    
    console.log(`🎯 Processando ${scenes.length} cenas em paralelo com aspect ratio ${aspectRatio}...`)

    // 2. Atualizar status para 'generating_videos'
    const { error: statusUpdateError } = await supabase
      .from('jobs')
      .update({ status: 'generating_videos' })
      .eq('id', jobId)

    if (statusUpdateError) {
      throw new Error(`Erro ao atualizar status: ${statusUpdateError.message}`)
    }

    // 3. Processar todas as cenas em paralelo
    const videoUrls = await Promise.all(
      scenes.map(async (scene: VideoScene) => {
        try {
          console.log(`🎥 Processando cena ${scenes.indexOf(scene) + 1}...`)
          
          // a. Submeter pedido de geração
          const generateResponse = await axios.post(
            'https://api.kie.ai/api/v1/veo/generate',
            {
              prompt: scene.video_prompt,
              model: scene.model || 'veo3_fast',
              aspectRatio: aspectRatio, // Usar aspect ratio do frontend
              imageUrls: [imageUrl],
              enableFallback: true, // Ativar fallback inteligente
              enableTranslation: true // Ativar tradução automática
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 segundos timeout
            }
          )

          // Debug: Log complete response structure to find correct taskId property
          console.log(`📋 Kie.ai Generate Response (Cena ${scenes.indexOf(scene) + 1}):`, JSON.stringify(generateResponse.data, null, 2));
          
          // Try multiple possible taskId property names (Kie.ai structure)
          const taskId = generateResponse.data.data?.taskId || generateResponse.data.taskId || generateResponse.data.task_id || generateResponse.data.id || generateResponse.data.requestId;
          console.log(`✅ Cena ${scenes.indexOf(scene) + 1} submetida - Task ID: ${taskId}`);
          
          if (!taskId) {
            throw new Error(`Task ID not found in Kie.ai response for scene ${scenes.indexOf(scene) + 1}`);
          }

          // b. Implementar polling para o resultado
          let attempts = 0
          const maxAttempts = 15 // Máximo 5 minutos (15 x 20s)

          while (attempts < maxAttempts) {
            attempts++
            console.log(`⏳ Cena ${scenes.indexOf(scene) + 1} - Tentativa ${attempts}/${maxAttempts}...`)
            
            // Esperar 20 segundos antes de verificar
            await delay(20000)

            try {
              const statusResponse = await axios.get(
                `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`
                  },
                  timeout: 10000 // 10 segundos timeout
                }
              )

              // Debug: Log complete status response to find correct properties
              console.log(`📋 Kie.ai Status Response (Cena ${scenes.indexOf(scene) + 1}):`, JSON.stringify(statusResponse.data, null, 2));
              
              // Kie.ai uses successFlag: 0: Generating, 1: Success  
              const successFlag = statusResponse.data.data?.successFlag;
              const errorCode = statusResponse.data.data?.errorCode;
              const errorMessage = statusResponse.data.data?.errorMessage;
              
              console.log(`📊 Cena ${scenes.indexOf(scene) + 1} successFlag: ${successFlag}, errorCode: ${errorCode}`);

              if (successFlag === 1) { // Success
                // Kie.ai returns video URL in response.resultUrls[0]
                const videoUrl = statusResponse.data.data?.response?.resultUrls?.[0];
                if (videoUrl) {
                  console.log(`🎉 Cena ${scenes.indexOf(scene) + 1} concluída!`)
                  return videoUrl
                } else {
                  console.log(`❌ Video URL not found in response for scene ${scenes.indexOf(scene) + 1}:`, statusResponse.data);
                  throw new Error(`URL do vídeo não encontrado na resposta para cena ${scenes.indexOf(scene) + 1}`)
                }
              } else if (errorCode || errorMessage) { // Failed
                throw new Error(`Geração falhou para cena ${scenes.indexOf(scene) + 1}: ${errorCode} - ${errorMessage}`)
              } else if (successFlag === 0) {
                // Still generating, continue polling
                console.log(`⏳ Cena ${scenes.indexOf(scene) + 1} ainda gerando...`);
              } else {
                console.log(`⚠️ Status desconhecido para cena ${scenes.indexOf(scene) + 1}: successFlag=${successFlag}`);
              }
              // Se ainda está processando, continuar o loop
            } catch (pollError: unknown) {
              const error = pollError as { message?: string }
              console.error(`❌ Erro ao verificar status da cena ${scenes.indexOf(scene) + 1}:`, error.message)
              if (attempts >= maxAttempts) {
                throw pollError
              }
              // Continuar tentando
            }
          }

          throw new Error(`Timeout: Cena ${scenes.indexOf(scene) + 1} não completou após ${maxAttempts} tentativas`)

        } catch (sceneError: unknown) {
          const error = sceneError as { message?: string }
          console.error(`❌ Erro na cena ${scenes.indexOf(scene) + 1}:`, error.message)
          // Retornar null para cenas que falharam, mas não interromper outras
          return null
        }
      })
    )

    // 4. Filtrar resultados válidos
    const validVideoUrls = videoUrls.filter(url => url !== null)
    console.log(`✅ ${validVideoUrls.length}/${scenes.length} vídeos gerados com sucesso`)

    // 5. Guardar os resultados finais
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        generated_video_urls: validVideoUrls,
        status: 'videos_generated'
      })
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Erro ao guardar URLs dos vídeos: ${updateError.message}`)
    }

    console.log('✅ Clips de vídeo gerados!')
    
    // Se só há 1 clip, não precisa fazer merge
    if (validVideoUrls.length === 1) {
      console.log('🎯 Apenas 1 clip gerado, saltando merge e finalizando...')
      
      // Atualizar status diretamente para 'complete' com o URL único
      const { error: finalUpdateError } = await supabase
        .from('jobs')
        .update({
          video_url: validVideoUrls[0],
          status: 'complete'
        })
        .eq('id', jobId)

      if (finalUpdateError) {
        throw new Error(`Erro ao finalizar job: ${finalUpdateError.message}`)
      }
      
      console.log('🎊 JOB CONCLUÍDO! Vídeo único disponível!')
      return validVideoUrls[0]
    }
    
    console.log('✅ Iniciando junção de múltiplos clips...')
    return validVideoUrls

  } catch (error) {
    console.error('Erro ao gerar clips de vídeo:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
    
    throw error
  }
}

export async function mergeVideoClips(jobId: string) {
  try {
    console.log('🎬 Iniciando junção de clips de vídeo...')
    const supabase = await createClient()

    // 1. Buscar dados do trabalho
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('generated_video_urls')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      throw new Error(`Trabalho não encontrado: ${fetchError?.message}`)
    }

    if (!job.generated_video_urls || job.generated_video_urls.length === 0) {
      throw new Error('Nenhum clip de vídeo encontrado para juntar')
    }

    const videoUrls = job.generated_video_urls
    console.log(`🎯 Juntando ${videoUrls.length} clips de vídeo...`)

    // 2. Atualizar status para 'merging_videos'
    const { error: statusUpdateError } = await supabase
      .from('jobs')
      .update({ status: 'merging_videos' })
      .eq('id', jobId)

    if (statusUpdateError) {
      throw new Error(`Erro ao atualizar status: ${statusUpdateError.message}`)
    }

    // 3. Configurar cliente fal.ai
    configureFalClient()

    // 4. Chamar a API da fal.ai para juntar os vídeos
    console.log('🔗 Chamando fal.ai para juntar clips...')
    const result = await fal.subscribe('fal-ai/ffmpeg-api/merge-videos', {
      input: {
        video_urls: videoUrls
      }
    })

    console.log('📦 Resposta fal.ai merge:', JSON.stringify(result, null, 2))

    // 5. Verificar se temos resultado (baseado na documentação fal.ai)
    const falResult = result as FalMergeResult;
    const finalVideoUrl = falResult.video?.url || falResult.data?.video?.url || falResult.data?.video_url || falResult.video_url;
    
    console.log('🔍 Fal.ai merge result structure:', JSON.stringify(result, null, 2));
    
    if (!finalVideoUrl) {
      console.error('❌ Estrutura da resposta fal.ai merge:', result)
      throw new Error('URL do vídeo final não encontrado na resposta da fal.ai')
    }

    console.log('🎉 Vídeo final criado com sucesso!')

    // 6. Guardar o resultado final
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        video_url: finalVideoUrl,
        status: 'complete'
      })
      .eq('id', jobId)

    if (updateError) {
      throw new Error(`Erro ao guardar URL do vídeo final: ${updateError.message}`)
    }

    console.log('🎊 PROCESSAMENTO TOTALMENTE CONCLUÍDO! Vídeo final disponível!')
    return finalVideoUrl

  } catch (error) {
    console.error('Erro ao juntar clips de vídeo:', error)
    
    // Em caso de erro, atualizar status para 'error'
    const supabase = await createClient()
    await supabase
      .from('jobs')
      .update({ status: 'error' })
      .eq('id', jobId)
    
    throw error
  }
}
