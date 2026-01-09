# 🧪 STEP-BY-STEP TESTING GUIDE

## Prerequisites ✅

Before testing, make sure:
1. ✅ `.env.local` exists in project root
2. ✅ `GEMINI_API_KEY=your_actual_key` is set
3. ✅ API key is valid (test in Gemini API console if unsure)

---

## Phase 1: Setup (2 minutes)

### Step 1.1: Verify Environment
```bash
# Check .env.local exists
cat .env.local

# Should output:
# GEMINI_API_KEY=sk-xxxxx...
```

❓ **Not working?** 
- Create `.env.local` if missing
- Add `GEMINI_API_KEY=your_key_here`
- Restart dev server

### Step 1.2: Start Dev Server
```bash
npm run dev
```

✅ Should see:
```
> next dev

▲ Next.js 16.1.1
- Local:        http://localhost:3000
```

---

## Phase 2: Basic Chat Test (5 minutes)

### Step 2.1: Open Application
Open browser: `http://localhost:3000`

### Step 2.2: Open Chat Widget
- Look for chat bubble (bottom-right corner)
- Should be blue with chat icon
- Click the bubble

### Step 2.3: Send Regular Message
Type: `"Siapa nama kamu?"`
- ✅ Should get response about Dhanial
- ✅ No image should appear
- ✅ Message saved in localStorage

### Expected Screenshot:
```
┌─────────────────────────────┐
│ Daniegga AI        ⊗        │
├─────────────────────────────┤
│ [Bot greeting]              │
│                             │
│                  [Your: "..."] ← Right align, blue
│                             │
│ [Bot: "Muhammad Dhanial..."] ← Left align, white
└─────────────────────────────┘
```

---

## Phase 3: Image Generation Test (15 minutes)

### Step 3.1: First Image Request - Simple
Type: `"Buatkan gambar kucing"`

Expected flow:
1. Your message sent → appears in chat
2. Typing indicator appears ("Sedang memproses...")
3. Bot responds: "Baik, saya akan membuatkan gambar..."
4. Wait 10-15 seconds for generation
5. Image appears below bot message

### Test Results:
- [ ] Message appears in chat ✅
- [ ] Typing indicator shows ✅
- [ ] Bot acknowledges ✅
- [ ] Image loads ✅
- [ ] Image displays with styling ✅
- [ ] "Klik gambar untuk melihat ukuran penuh" appears ✅

### Step 3.2: Verify Image Interaction
Click the generated image
- Should open fullscreen in new tab
- Check image quality
- Close tab, return to chat

### Step 3.3: Second Image Request - Detailed
Type: `"Generate gambar sunset di pantai dengan cahaya emas, realistic style"`

Expected:
- Bot acknowledges with detail
- More complex image generated
- Image quality should be higher

---

## Phase 4: Edge Cases & Error Handling (10 minutes)

### Step 4.1: Normal Chat (No Image)
Type: `"Apa hobi kamu?"`

Expected:
- ✅ Bot responds about Dhanial's hobbies
- ✅ No image generated
- ✅ Normal text response

### Step 4.2: Ambiguous Request
Type: `"Gambar something random"`

Expected:
- ✅ Bot tries to generate image
- ✅ May get unexpected image or error message
- ✅ App handles gracefully (no crash)

### Step 4.3: Multiple Requests
Send 2-3 image requests in sequence

Expected:
- ✅ Each queues properly
- ✅ Typing indicator works for each
- ✅ All images display
- ✅ No race conditions

### Step 4.4: Rapid Requests
Send message → Don't wait → Send another

Expected:
- ✅ Input disabled during processing (isTyping === true)
- ✅ Button disabled until response received
- ✅ No duplicate requests

---

## Phase 5: Persistence Test (5 minutes)

### Step 5.1: Chat History
1. Generate an image
2. Close chat (X button)
3. Reopen chat (click button again)

Expected:
- ✅ Chat history still there
- ✅ Images still loaded
- ✅ Messages in correct order

### Step 5.2: Page Reload
1. Generate an image
2. Press F5 (refresh page)
3. Click chat button

Expected:
- ✅ Chat history persisted
- ✅ Images still display
- ✅ localStorage working

### Step 5.3: Clear Chat
1. Click trash icon in chat header
2. Confirm action

Expected:
- ✅ Chat cleared
- ✅ All messages gone
- ✅ localStorage cleared
- ✅ Reset to default message

---

## Phase 6: Browser Console Debugging (10 minutes)

### Step 6.1: Open Console
Press `F12` → Console tab

### Step 6.2: Test and Monitor
Send message: `"Buatkan gambar robot"`

Check console for:
```javascript
// Should see no errors
// Check Network tab for:
POST /api/chat
Response: {
  success: true,
  message: "...",
  image: "data:image/png;base64,..."
}
```

### Step 6.3: Error Simulation
(Skip if everything works!)

**To simulate API key error:**
1. Change GEMINI_API_KEY to invalid value
2. Try image request
3. Should see error message (not crash)
4. Restore correct key

---

## Phase 7: Visual Verification (5 minutes)

### Styling Checks:
- [ ] Chat bubble position correct (bottom-right)
- [ ] Chat window size correct (350x550px)
- [ ] Input bar looks like iMessage
- [ ] Blue send button appears when text entered
- [ ] Image displays with rounded corners
- [ ] Timestamp shows correctly
- [ ] Dark theme applied
- [ ] Animations smooth

### Interaction Checks:
- [ ] Can scroll chat history
- [ ] Auto-scroll to latest message
- [ ] Typing indicator bounces
- [ ] Send button animates when clicked
- [ ] Image clickable (cursor changes to pointer)
- [ ] Open/close animation smooth

---

## Phase 8: Performance Test (5 minutes)

### Load Test:
1. Generate 3 images in sequence
2. Each should complete within 20 seconds
3. App should remain responsive

### Memory Check:
- [ ] No memory leaks
- [ ] Chat scrolls smoothly
- [ ] Images load without lag
- [ ] No console errors

### Browser Tools:
Open DevTools → Performance:
1. Record session while generating image
2. Check for long tasks
3. Should be minimal blocking

---

## ✅ Final Checklist

### Core Features:
- [ ] Regular chat works
- [ ] Image generation works
- [ ] Images display correctly
- [ ] Click image opens fullscreen
- [ ] Typing indicator visible
- [ ] Clear chat button works
- [ ] localStorage persistence works
- [ ] Page reload preserves history

### Error Handling:
- [ ] Invalid API key → clear error message
- [ ] Network error → graceful handling
- [ ] Generation timeout → user message
- [ ] No crashes on edge cases

### UI/UX:
- [ ] All styling correct
- [ ] Responsive on different sizes
- [ ] Smooth animations
- [ ] Good contrast & readability
- [ ] Mobile-friendly layout
- [ ] Accessibility good

### Code Quality:
- [ ] No console errors
- [ ] No console warnings
- [ ] Network requests clean
- [ ] Response structure correct
- [ ] localStorage data valid JSON

---

## 🎯 Test Cases Summary

| # | Test | Command | Expected | ✅ |
|---|------|---------|----------|-----|
| 1 | Setup | npm run dev | Server runs | [ ] |
| 2 | Regular chat | "Siapa nama kamu?" | Text response, no image | [ ] |
| 3 | Simple image | "Buatkan gambar kucing" | Image generates | [ ] |
| 4 | Complex image | "Sunset di pantai..." | Quality image | [ ] |
| 5 | Click image | Click generated image | Opens fullscreen | [ ] |
| 6 | History | Refresh page | Chat persists | [ ] |
| 7 | Clear | Click trash icon | Chat cleared | [ ] |
| 8 | Persist | Reload → reopen | Images load | [ ] |

---

## 📊 Test Report Template

Use this to document your testing:

```
TEST REPORT - AI Image Generation Feature
Date: ________
Tester: ______

CORE FUNCTIONALITY:
Regular Chat: PASS [ ] FAIL [ ]
Image Generation: PASS [ ] FAIL [ ]
Image Display: PASS [ ] FAIL [ ]
Persistence: PASS [ ] FAIL [ ]

ERROR HANDLING:
Invalid API Key: PASS [ ] FAIL [ ]
Network Error: PASS [ ] FAIL [ ]
Generation Timeout: PASS [ ] FAIL [ ]

UI/UX:
Styling: PASS [ ] FAIL [ ]
Animations: PASS [ ] FAIL [ ]
Responsiveness: PASS [ ] FAIL [ ]

NOTES:
_________________________________
_________________________________

OVERALL: PASS [ ] FAIL [ ]
```

---

## 🐛 Troubleshooting During Test

### Issue: Images Don't Load
**Steps to debug:**
1. Check browser console (F12 → Console)
2. Look for JavaScript errors
3. Check Network tab → /api/chat response
4. Verify `image` field in response JSON
5. Check if image src starts with `data:image`

**Solution:**
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check API key validity

### Issue: "Model not found" Error
**Solution:**
- Verify model IDs:
  - Chat: `gemini-2.5-flash`
  - Image: `gemini-2.5-flash-image`
- Check API documentation for current models

### Issue: "Rate limit exceeded"
**Solution:**
- Free tier: ~500 images/day
- Wait a few minutes
- Try again later

### Issue: Chat Button Not Appearing
**Solution:**
- Check browser console for errors
- Verify ChatWidget imported in page.tsx
- Clear cache and reload

---

## 📝 Notes

- **Image Generation Time:** 5-15 seconds is normal
- **API Rate Limit:** Free tier has limits (~500/day)
- **localStorage Size:** Each image adds ~20-100KB
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🎉 Success Criteria

You're done when:
1. ✅ All tests in "Final Checklist" are checked
2. ✅ No errors in browser console
3. ✅ Images generate and display correctly
4. ✅ Chat history persists
5. ✅ No crashes or unexpected behavior

---

**Happy Testing!** 🚀

Generated: 2026-01-09
