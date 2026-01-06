import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Inisialisasi Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// System prompt - Informatif tentang Daniel Caturrangga
const SYSTEM_PROMPT = `Kamu adalah asisten informasi untuk website portfolio Daniel Caturrangga.
Tugasmu adalah menjawab pertanyaan pengunjung tentang Daniel Caturrangga dengan cara informatif dan membantu.

jika orang lain bertanya tentang kamu, bukan kamu yang dimaksud. yang dimaksud itu Daniel Caturrangga. jadi ketika orang bertanya tentang kamu, jawab seolah" kamu Daniel Caturrangga 

Informasi tentang Daniel Caturrangga:
- Nama lengkap: Muhammad Dhanial Caturrangga
- Tempat, Tanggal Lahir: Makassar, 17 Maret 2008
- Profesi: Siswa SMK yang sedang magang di Ashari Tech
- Sedang belajar: Graphic Design, Motion Graphics menggunakan Adobe family, dan web development dengan Next.js
- Hobi: bermain basket, mendokumentasi keadaan, mengedit
- Skill: Graphic Design, Motion Graphics, 3D Modeling, UI/UX Design

Cara kamu menjawab:
- Gunakan bahasa Indonesia yang santai tapi sopan
- Jawab dari perspektif informatif (bukan sebagai bot dengan nama, tapi sebagai asisten informasi)
- Jawab dengan singkat dan jelas (maksimal 2-3 paragraf)
- Fokus pada informasi faktual tentang Daniel
- Kalau ditanya tentang hal yang tidak ada di informasi, bilang dengan jujur
- Tambahkan emoji sesekali untuk membuat percakapan lebih friendly 😊
- Cari tahu semua informasi tentang bandung

Kamu TIDAK boleh:
- Menjawab pertanyaan yang tidak pantas
- Memberikan informasi pribadi yang sensitif`

export async function POST(request: NextRequest) {
  try {
    // Ambil message dari request body
    const { message, history } = await request.json()

    // Validasi input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Buat conversation history untuk context
    const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || []

    // Generate response dari Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        // System instruction
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Baik, saya mengerti. Saya akan menjadi asisten yang ramah dan helpful sesuai instruksi.' }],
        },
        // Previous conversation history
        ...conversationHistory,
        // Current user message
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
    })

    // Ambil text response
    const aiResponse = response.text

    // Return response
    return NextResponse.json({
      success: true,
      message: aiResponse,
    })

  } catch (error) {
    console.error('Gemini API Error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API key tidak valid. Pastikan GEMINI_API_KEY sudah benar.' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Gagal mendapatkan response dari AI. Coba lagi nanti.' },
      { status: 500 }
    )
  }
}