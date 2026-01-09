import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/image-generator'

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// System prompt - Hybrid Mode
const SYSTEM_PROMPT = `Kamu adalah asisten informasi untuk website portfolio Daniel Caturrangga.
Tugasmu adalah menjawab pertanyaan pengunjung tentang Daniel Caturrangga.

Informasi:
- Nama: Muhammad Dhanial Caturrangga (Daniel)
- Lahir: Makassar, 17 Maret 2008
- Skill: Graphic Design, Motion Graphics, Next.js
- Hobi: Basket, dokumentasi

Panduan:
1. Jawab santai & sopan.
2. Gunakan emoji 😊.
3. **PENTING: DETEKSI PERMINTAAN GAMBAR**
   - Jika user meminta gambar (contoh: "buatkan gambar kucing", "gambarin ..."), kamu DILARANG menolak.
   - Kamu HARUS membalas HANYA dengan kode khusus ini:
     [GENERATE_IMAGE: <deskripsi prompt bahasa inggris>]
   
   Contoh:
   User: "Buatkan gambar mobil merah"
   Assistant: [GENERATE_IMAGE: A realistic red sports car, cinematic lighting, 8k]
`

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Validasi API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API Key Missing' }, { status: 500 })
    }

    // Init Model (Downgrade ke gemini-pro agar kompatibel dengan API Key ini)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    // Construct History
    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || []

    // 1. Generate Text Response dari Gemini
    const result = await model.generateContent({
      contents: [...chatHistory, { role: 'user', parts: [{ text: message }] }],
    })

    const aiResponse = result.response.text()

    // 2. Cek apakah Gemini meminta Generate Image
    const imageMatch = aiResponse.match(/\[GENERATE_IMAGE:\s*(.*?)\]/i)

    if (imageMatch) {
      const imagePrompt = imageMatch[1].trim()
      console.log('🖼️ Gemini detected image request:', imagePrompt)

      // 3. Generate Image via Pollinations
      const imageUrl = await generateImage(imagePrompt)

      return NextResponse.json({
        success: true,
        message: `Oke, ini gambarnya: "${imagePrompt}" 🎨`,
        image: imageUrl,
        imagePrompt: imagePrompt,
      })
    }

    // Response Normal (Teks Saja)
    return NextResponse.json({
      success: true,
      message: aiResponse,
    })

  } catch (error: any) {
    console.error('API Error:', error)

    // Handle Quota Error
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json({
        error: '⚠️ Kuota Gemini Habis (429). Tunggu sebentar.'
      }, { status: 429 })
    }

    // Handle Model 404 (Salah nama model)
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json({
        error: '⚠️ Model AI tidak ditemukan. Cek settingan model di route.ts'
      }, { status: 500 })
    }

    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}