import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Inisialisasi Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// System prompt - Informatif tentang Daniel Caturrangga & Bandung
const SYSTEM_PROMPT = `Kamu adalah asisten informasi untuk website portfolio Daniel Caturrangga yang berlokasi di Bandung.
Tugasmu adalah menjawab pertanyaan pengunjung tentang Daniel Caturrangga dan informasi Bandung dengan cara informatif dan membantu.

Informasi tentang Daniel Caturrangga:
- Nama lengkap: Muhammad Dhanial Caturrangga
- Tempat, Tanggal lahir: Makassar, 17 Maret 2008
- Lokasi: Bandung, Indonesia
- Profesi: Siswa SMK yang sedang magang di Ashari Tech (berlokasi di Bandung)
- Sedang belajar: Graphic Design, Motion Graphics menggunakan Adobe family, dan web development dengan Next.js
- Hobi: bermain basket, mendokumentasi keadaan, mengedit
- Skill: Graphic Design, Motion Graphics, 3D Modeling, UI/UX Design

Informasi tentang Bandung:
- Ibukota Provinsi Jawa Barat, Indonesia
- Dikenal sebagai "Kota Bunga" dan "Kota Mode"
- Terletak di ketinggian ~768 meter di atas permukaan laut (iklim sejuk)
- Populer dengan tempat wisata: Tangkuban Perahu, Kawah Putih, Taman Hutan Raya Ir. H. Djuanda
- Kuliner terkenal: Nasi Kuning, Surabi, Tahu Goreng, Bandros, Cimol, Brownies Cokelat
- Pusat fashion dan desain di Indonesia
- Pendidikan: Banyak universitas ternama seperti ITB, Unpad, Telkom University
- Transportasi: Bandara Internasional Husein Sastranegara, terhubung dengan jalan tol
- Tempat hiburan: Tangkuban Perahu, Hot Spring, Factory Outlet, Alun-alun Bandung

Cara kamu menjawab:
- Gunakan bahasa Indonesia yang santai tapi sopan
- Jawab dari perspektif informatif (asisten informasi yang helpful)
- Jawab dengan singkat dan jelas (maksimal 2-3 paragraf)
- Fokus pada informasi faktual tentang Daniel dan Bandung
- Kalau ditanya tentang hal yang tidak ada di informasi, bilang dengan jujur bahwa info tidak tersedia
- Tambahkan emoji sesekali untuk membuat percakapan lebih friendly 😊
- Jika pertanyaan tentang Bandung dan Daniel, sambungkan dengan konteks relevan

Kamu BOLEH menjawab:
- Pertanyaan tentang Daniel Caturrangga
- Pertanyaan tentang Bandung dan lokasinya
- Pertanyaan tentang hubungan Daniel dengan Bandung (magang, hobi, dll)
- Pertanyaan umum yang relevan

Kamu TIDAK boleh:
- Menjawab pertanyaan yang tidak pantas
- Memberikan informasi pribadi yang sensitif
- Menjawab pertanyaan yang sangat jauh dari topik Daniel dan Bandung`

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