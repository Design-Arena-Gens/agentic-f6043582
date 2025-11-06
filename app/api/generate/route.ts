import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Replicate from 'replicate'

export async function POST(request: NextRequest) {
  try {
    const { prompt, contentType } = await request.json()

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 })
    }

    if (contentType === 'image') {
      return await generateImage(prompt)
    } else if (contentType === 'video') {
      return await generateVideo(prompt)
    } else {
      return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Generation failed' }, { status: 500 })
  }
}

async function generateImage(prompt: string) {
  try {
    // Try OpenAI DALL-E first
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      })

      return NextResponse.json({
        success: true,
        url: response.data?.[0]?.url || '',
        provider: 'openai'
      })
    }

    // Fallback to Replicate Stable Diffusion
    if (process.env.REPLICATE_API_TOKEN) {
      const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            num_outputs: 1,
          }
        }
      ) as string[]

      return NextResponse.json({
        success: true,
        url: output[0],
        provider: 'replicate'
      })
    }

    // Demo mode - return placeholder
    return NextResponse.json({
      success: true,
      url: `https://picsum.photos/seed/${Date.now()}/1024/1024`,
      provider: 'demo'
    })
  } catch (error: any) {
    throw new Error(`Image generation failed: ${error.message}`)
  }
}

async function generateVideo(prompt: string) {
  try {
    // Try Replicate for video generation (Stable Video Diffusion or similar)
    if (process.env.REPLICATE_API_TOKEN) {
      const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

      // Using a video generation model
      const output = await replicate.run(
        "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
        {
          input: {
            prompt: prompt,
            num_frames: 24,
          }
        }
      ) as unknown as string

      return NextResponse.json({
        success: true,
        url: output,
        provider: 'replicate'
      })
    }

    // Demo mode - return placeholder video
    return NextResponse.json({
      success: true,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      provider: 'demo'
    })
  } catch (error: any) {
    throw new Error(`Video generation failed: ${error.message}`)
  }
}
