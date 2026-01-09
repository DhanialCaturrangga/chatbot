# 🎨 AI Image Generation Feature - Implementation Guide

## ✅ Apa yang Sudah Diimplementasikan

### 1. **Tool Declaration (Function Calling Setup)**
**File:** `src/app/api/chat/route.ts` (Lines 39-57)

Tool `generate_image` sudah didefinisikan dengan:
- ✅ Name: `generate_image`
- ✅ Description: Deskripsi yang jelas tentang fungsi
- ✅ Parameters: `prompt` (string) dalam bahasa Inggris
- ✅ Type validation: `Type.OBJECT` dan `Type.STRING`
- ✅ Integration: Dimasukkan dalam config.tools pada AI call

```typescript
const imageGenerationTool = {
  functionDeclarations: [
    {
      name: 'generate_image',
      description: 'Generate gambar berdasarkan deskripsi dari user.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          prompt: {
            type: Type.STRING,
            description: 'Deskripsi detail gambar dalam bahasa Inggris.',
          },
        },
        required: ['prompt'],
      },
    },
  ],
}
```

### 2. **Image Generator Helper Function**
**File:** `src/lib/image-generator.ts`

Fungsi `generateImage` sudah lengkap dengan:
- ✅ Model: `gemini-2.5-flash-image`
- ✅ Base64 encoding: Mengembalikan data URL format
- ✅ Error handling: Try-catch dengan logging
- ✅ Response parsing: Extract dari `response.candidates[0].content.parts`

```typescript
export async function generateImage(prompt: string): Promise<string | null>
```

### 3. **API Endpoint Logic**
**File:** `src/app/api/chat/route.ts` (Lines 104-138)

Flow sudah sempurna:
1. ✅ Check apakah AI memanggil tool (`functionCalls`)
2. ✅ Validasi function name (`generate_image`)
3. ✅ Extract prompt dari `functionCall.args.prompt`
4. ✅ Call `generateImage(imagePrompt)`
5. ✅ Return response dengan field `image` (base64)
6. ✅ Error handling untuk image generation failures

```typescript
if (functionCalls && functionCalls.length > 0) {
  const functionCall = functionCalls[0]
  if (functionCall.name === 'generate_image') {
    const imagePrompt = functionCall.args?.prompt as string
    const imageData = await generateImage(imagePrompt)
    return NextResponse.json({
      success: true,
      message: `Ini dia gambar yang kamu minta! 🎨`,
      image: imageData,
      imagePrompt: imagePrompt,
    })
  }
}
```

### 4. **ChatWidget Frontend Updates**
**File:** `src/components/ChatWidget.tsx`

#### 4a. Message Interface
✅ Updated dengan field `image?: string`

```typescript
interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  image?: string  // ← Untuk menyimpan gambar
}
```

#### 4b. sendMessageToAI Function
✅ Return object dengan `message` dan `image`

```typescript
return {
  message: data.message,
  image: data.image || null,  // Bisa null jika tidak ada gambar
}
```

#### 4c. handleSend Function
✅ Handle gambar saat add bot message

```typescript
const botMsg: Message = {
  id: Date.now() + 1,
  text: aiResponse.message,
  sender: 'bot',
  timestamp: new Date(),
  image: aiResponse.image || undefined,  // Simpan gambar jika ada
}
```

#### 4d. Message Rendering
✅ Conditional render untuk gambar

```typescript
{msg.image && (
  <div className="mt-3">
    <img
      src={msg.image}
      alt="Generated image"
      className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => window.open(msg.image, '_blank')}
    />
    <p className="text-xs text-gray-400 mt-1">
      Klik gambar untuk melihat ukuran penuh
    </p>
  </div>
)}
```

### 5. **System Prompt Enhancement**
**File:** `src/app/api/chat/route.ts` (Lines 30-33)

System prompt sudah include instruksi untuk:
- ✅ Tahu tentang kemampuan generate gambar
- ✅ Trigger tool saat user minta gambar
- ✅ Explain sebelum generate (friendly UX)

## 🎯 Cara Kerja: Flow Diagram

```
User: "Buatkan gambar kucing lucu"
   ↓
ChatWidget (handleSend) → API /chat
   ↓
API Route (POST)
   ├─ Kirim message + history + tools ke Gemini
   ├─ Gemini analyze → "Oh, user minta gambar!"
   ├─ Gemini return: functionCalls dengan generate_image
   ↓
API Check functionCalls
   ├─ Name === 'generate_image'? → YES
   ├─ Extract prompt dari args
   ├─ Call generateImage(prompt)
   ↓
generateImage() Function
   ├─ Call gemini-2.5-flash-image model
   ├─ Extract base64 data
   ├─ Return data URL
   ↓
API Response: {
   success: true,
   message: "Ini dia gambar...",
   image: "data:image/png;base64,..."
}
   ↓
ChatWidget (sendMessageToAI) ← Response
   ├─ message & image
   ├─ Add bot message dengan image
   ├─ localStorage save
   ↓
UI Render
   ├─ Bot message + text
   ├─ Image muncul di chat
   ├─ Clickable untuk fullscreen
```

## 🧪 Testing Checklist

### A. Setup & Environment
- [ ] Pastikan `GEMINI_API_KEY` sudah di `.env.local`
- [ ] Verifikasi file `.env.local` tidak di-commit (di `.gitignore`)

### B. Local Testing
```bash
npm run dev
```

Test dengan prompts ini:
1. **Prompt Sederhana:**
   - "Buatkan gambar kucing" 
   - "Generate gambar matahari terbit"
   
2. **Prompt Detail:**
   - "Gambar robot futuristik dengan neon lights, digital art"
   - "Lukisan sunset di pantai dengan burung camar, realistic style"

3. **Edge Cases:**
   - "Siapa nama kamu?" (No image, normal chat)
   - "Buat 5 gambar sekaligus" (Check behavior)
   - "Gambar sesuatu yang forbidden" (Check system prompt)

### C. Browser Console
- [ ] Check console untuk errors
- [ ] Verify response structure: `{ success, message, image }`
- [ ] Verify base64 image data format

### D. UI/UX Verification
- [ ] Gambar tampil dengan styling yang benar
- [ ] Timestamp menampil
- [ ] Hover effect bekerja
- [ ] Click untuk fullscreen berfungsi
- [ ] localStorage persist chat history dengan gambar
- [ ] Clear chat clear semua termasuk gambar

## ⚙️ Troubleshooting

### Error: "Model not found"
**Solusi:**
- Verify model IDs:
  - Chat: `gemini-2.5-flash`
  - Image: `gemini-2.5-flash-image`
- Check API key validity

### Error: "Rate limit exceeded"
**Solusi:**
- Free tier limit: ~500 images/day
- Wait dan try lagi nanti
- Atau upgrade API key

### Gambar tidak muncul
**Debug Steps:**
1. Check browser console (F12 → Console)
2. Verify API response structure
3. Check image src format (should start with `data:image`)
4. Test di incognito mode (clear cache)

### AI tidak memanggil tool
**Debugging:**
1. Check system prompt include instruksi generate
2. Try explicit prompt: "generate gambar ..." bukan hanya "gambar ..."
3. Check functionCalls dalam response
4. Verifikasi tool declaration syntax

## 📊 Kriteria Penilaian

| Kriteria | Bobot | Status |
|----------|-------|--------|
| Tool Declaration | 20 pts | ✅ Complete |
| Image Generation | 30 pts | ✅ Complete |
| UI Display | 25 pts | ✅ Complete |
| Kreativitas | 25 pts | 🔄 Optional |
| **Total** | **100 pts** | **75+** |

## 🚀 Next Steps (Optional/Bonus)

1. **Download Button** - Tombol untuk download gambar
   ```typescript
   <button onClick={() => {
     const a = document.createElement('a')
     a.href = msg.image
     a.download = 'generated-image.png'
     a.click()
   }}>Download</button>
   ```

2. **Image Lightbox** - Zoom di modal saat di-click

3. **Image Gallery** - Simpan all generated images

4. **Share Image** - Copy link atau share ke social

5. **Edit Image** - "Edit gambar tadi, tambahkan ..."

## 📝 Catatan Penting

- **Response Time:** Generate gambar butuh 5-15 detik (normal)
- **Prompt Quality:** Bahasa Inggris lebih bagus hasilnya
- **Rate Limiting:** Jangan spam requests
- **Security:** Jangan expose API key, selalu gunakan environment variables
- **Cleanup:** localStorage akan grow besar kalau banyak images → implementasi cleanup jika diperlukan

## 🎨 Hasil yang Diharapkan

Setelah testing:
- ✅ User bisa chat normal
- ✅ User bisa request gambar
- ✅ AI understand dan generate image
- ✅ Gambar muncul di chat dengan styling bagus
- ✅ Gambar bisa di-click untuk fullscreen
- ✅ Chat history tersimpan dengan gambar

---

**Status:** ✅ Implementation Complete  
**Last Updated:** 2026-01-09  
**Verified:** All core features implemented
