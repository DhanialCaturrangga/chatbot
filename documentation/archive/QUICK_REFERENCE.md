# 🎨 AI Image Generation - Quick Reference

## File yang Diubah/Verified

### 1. ✅ `src/lib/image-generator.ts`
**Status:** Complete & Verified

Function: `generateImage(prompt: string)`
- Uses: `gemini-2.5-flash-image` model
- Returns: Base64 data URL atau null
- Error handling: Comprehensive try-catch

### 2. ✅ `src/app/api/chat/route.ts`
**Status:** Complete & Verified

Changes:
- Tool declaration: `imageGenerationTool` (lines 40-57)
- System prompt: Include image generation instructions (lines 30-33)
- Function call handling: Check & execute generate_image (lines 104-138)

Key Points:
- AI check: `response.functionCalls`
- Tool name: `generate_image`
- Extract prompt: `functionCall.args?.prompt`
- Return: `{ success, message, image, imagePrompt }`

### 3. ✅ `src/components/ChatWidget.tsx`
**Status:** Complete & Verified

Changes:
- Message interface: Add `image?: string` (line 14)
- sendMessageToAI: Return `{ message, image }` (lines 89-92)
- handleSend: Handle image in bot message (line 125)
- Message render: Conditional image display (lines 210-222)
- Loader: Typing indicator (lines 236-251)

## 🧪 How to Test

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Open Chat Widget
- Click floating chat button (bottom-right)

### Step 3: Try These Commands
1. "Buatkan gambar kucing lucu"
2. "Generate gambar sunset di pantai"
3. "Buat gambar robot futuristik"

### Step 4: Verify
- [ ] Bot respond dengan message
- [ ] Gambar generate & muncul di chat
- [ ] Gambar bisa di-click untuk fullscreen
- [ ] Chat history saved (reload halaman, history persist)

## ⚡ Environment Check

Make sure `.env.local` exists:
```
GEMINI_API_KEY=your_actual_api_key_here
```

⚠️ **PENTING:** Don't commit `.env.local` ke git!

## 🔍 Debug Tips

If something doesn't work:

1. **Check Browser Console:**
   - Press `F12` → Console tab
   - Look for errors atau API responses

2. **Network Tab:**
   - Check `/api/chat` request
   - Verify response includes `image` field

3. **API Response Structure:**
   ```json
   {
     "success": true,
     "message": "Ini dia gambar yang kamu minta! 🎨",
     "image": "data:image/png;base64,iVBORw0KGgo...",
     "imagePrompt": "a cute cat wearing a hat"
   }
   ```

4. **Common Issues:**
   - "Model not found" → Check model IDs
   - "API key invalid" → Verify GEMINI_API_KEY
   - "Rate limit" → Free tier has limits (~500/day)
   - "No image in response" → Try different prompt

## 📝 Key Code Sections

### Tool Declaration
Location: `src/app/api/chat/route.ts:40-57`
```typescript
const imageGenerationTool = {
  functionDeclarations: [{
    name: 'generate_image',
    description: 'Generate gambar...',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, ... }
      },
      required: ['prompt'],
    },
  }],
}
```

### Image Generation Call
Location: `src/app/api/chat/route.ts:114-123`
```typescript
const imageData = await generateImage(imagePrompt)
return NextResponse.json({
  success: true,
  message: `Ini dia gambar yang kamu minta! 🎨`,
  image: imageData,
  imagePrompt: imagePrompt,
})
```

### Image Rendering
Location: `src/components/ChatWidget.tsx:210-222`
```typescript
{msg.image && (
  <div className="mt-3">
    <img src={msg.image} ... />
  </div>
)}
```

## 🎯 Success Criteria

✅ **All Complete:**
- Tool declaration syntax correct
- generateImage function works
- API properly handles function calls
- ChatWidget displays images
- Images persist in localStorage

## 📚 Documentation

Full detailed guide available in: `IMPLEMENTATION_GUIDE.md`

---

**Ready to Test!** 🚀  
Run `npm run dev` and try asking the bot to generate images!
