'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// Import gambar profil
import profileImage from '../assets/images/logo.png'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  image?: string
  imagePrompt?: string
}

interface GalleryImage {
  id: number
  url: string
  prompt: string
  timestamp: Date
}

const STORAGE_KEY = 'chat_messages'
const GALLERY_KEY = 'image_gallery'

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 1,
    text: 'Halo! Ada yang bisa saya bantu hari ini? 😊',
    sender: 'bot',
    timestamp: new Date(),
  }
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Gallery & Lightbox states
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [showGallery, setShowGallery] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)
  const [editingImageId, setEditingImageId] = useState<number | null>(null)
  const [editPrompt, setEditPrompt] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Load messages dari localStorage saat mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem(STORAGE_KEY)
      if (storedMessages) {
        try {
          const parsed = JSON.parse(storedMessages)
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(messagesWithDates)
        } catch (error) {
          console.error('Failed to parse stored messages:', error)
          setMessages(DEFAULT_MESSAGES)
        }
      } else {
        setMessages(DEFAULT_MESSAGES)
      }

      // Load gallery
      const storedGallery = localStorage.getItem(GALLERY_KEY)
      if (storedGallery) {
        try {
          const parsed = JSON.parse(storedGallery)
          const galleryWithDates = parsed.map((img: any) => ({
            ...img,
            timestamp: new Date(img.timestamp),
          }))
          setGalleryImages(galleryWithDates)
        } catch (error) {
          console.error('Failed to parse gallery:', error)
        }
      }

      setIsLoaded(true)
    }
  }, [])

  // 2. Save messages ke localStorage setiap kali berubah
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages, isLoaded])

  // 2b. Save gallery ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(galleryImages))
    }
  }, [galleryImages])

  // 3. Auto scroll ke pesan terbaru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // 4. Fungsi untuk memanggil API AI
  const sendMessageToAI = async (userMessage: string) => {
    try {
      const history = messages.slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan response')
      }

      return {
        message: data.message,
        image: data.image || null,
      }
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  // 5. Handle kirim pesan
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Tambah pesan user
    const userMsg: Message = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const aiResponse = await sendMessageToAI(userMessage)

      // Tambah response AI (dengan atau tanpa gambar)
      const botMsg: Message = {
        id: Date.now() + 1,
        text: aiResponse.message,
        sender: 'bot',
        timestamp: new Date(),
        image: aiResponse.image || undefined,  // Simpan gambar jika ada
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: 'Maaf, terjadi kesalahan. Coba lagi ya!',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  // 6. Handle clear chat
  const handleClearChat = () => {
    setMessages(DEFAULT_MESSAGES)
    localStorage.removeItem(STORAGE_KEY)
  }

  // 7. Handle copy response
  const handleCopyResponse = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // BONUS FEATURES

  // 8. Download image
  const handleDownloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = fileName || 'generated-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 9. Add image to gallery
  const addToGallery = (imageUrl: string, prompt: string) => {
    const newImage: GalleryImage = {
      id: Date.now(),
      url: imageUrl,
      prompt: prompt,
      timestamp: new Date(),
    }
    setGalleryImages((prev) => [newImage, ...prev])
  }

  // 10. Share image
  const handleShareImage = (imageUrl: string, prompt: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Generated Image',
        text: `Check out this AI generated image: ${prompt}`,
        url: imageUrl,
      }).catch((err) => console.log('Share failed:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(imageUrl)
      alert('Image URL copied to clipboard!')
    }
  }

  // 11. Copy image URL
  const handleCopyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl)
    alert('Image URL copied to clipboard!')
  }

  // 12. Delete from gallery
  const deleteFromGallery = (imageId: number) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  // 13. Regenerate with edited prompt
  const handleRegenerateImage = (originalPrompt: string, editedPrompt: string) => {
    const newPrompt = editedPrompt.trim() ? editedPrompt : originalPrompt
    setInputValue(`Edit: ${newPrompt}`)
    setEditingImageId(null)
    setEditPrompt('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans antialiased">

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-black rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-800 animate-in fade-in zoom-in duration-200 origin-bottom-right">

          {/* Header - iOS iMessage Dark */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-950">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={profileImage}
                  alt="Assistant"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-semibold text-sm">Assistant</h3>
                <p className="text-gray-400 text-xs">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClearChat} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none" title="Clear chat" aria-label="Clear chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none" aria-label="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth bg-black"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] ${msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-3xl rounded-br-none'
                    : 'bg-gray-800 text-white rounded-3xl rounded-bl-none'
                    } px-4 py-2`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {msg.image && (
                    <div className="mt-2">
                      <div className="relative w-full aspect-square max-w-[512px]">
                        <Image
                          src={msg.image}
                          alt="Generated AI Illustration"
                          fill
                          className="rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxImage({ id: msg.id, url: msg.image!, prompt: msg.imagePrompt || '', timestamp: msg.timestamp })}
                          sizes="(max-width: 768px) 100vw, 512px"
                        />
                      </div>

                      {/* Image Action Buttons - iOS Style */}
                      <div className="flex gap-1 mt-2 flex-wrap text-xs">
                        <button
                          onClick={() => handleDownloadImage(msg.image!, `image-${msg.id}.jpg`)}
                          className={`px-2.5 py-1.5 rounded-full transition ${msg.sender === 'user' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                          title="Download"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => addToGallery(msg.image!, msg.imagePrompt || '')}
                          className={`px-2.5 py-1.5 rounded-full transition ${msg.sender === 'user' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                          title="Add to Gallery"
                        >
                          🎨
                        </button>
                        <button
                          onClick={() => handleCopyImageUrl(msg.image!)}
                          className={`px-2.5 py-1.5 rounded-full transition ${msg.sender === 'user' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                          title="Copy"
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => handleShareImage(msg.image!, msg.imagePrompt || '')}
                          className={`px-2.5 py-1.5 rounded-full transition ${msg.sender === 'user' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                          title="Share"
                        >
                          📤
                        </button>
                        <button
                          onClick={() => {
                            setEditingImageId(msg.id)
                            setEditPrompt(msg.imagePrompt || '')
                          }}
                          className={`px-2.5 py-1.5 rounded-full transition ${msg.sender === 'user' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                          title="Edit"
                        >
                          ✏️
                        </button>
                      </div>

                      {/* Edit Mode */}
                      {editingImageId === msg.id && (
                        <div className="mt-2 bg-gray-900 p-2.5 rounded-2xl border border-gray-700">
                          <input
                            type="text"
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="Edit prompt..."
                            className="w-full px-3 py-2 text-xs text-white rounded-xl border border-gray-600 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder:text-gray-500"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRegenerateImage(msg.imagePrompt || '', editPrompt)}
                              className="flex-1 bg-blue-500 text-white text-xs px-2 py-1.5 rounded-lg hover:bg-blue-600 transition"
                            >
                              Generate
                            </button>
                            <button
                              onClick={() => {
                                setEditingImageId(null)
                                setEditPrompt('')
                              }}
                              className="flex-1 bg-gray-700 text-white text-xs px-2 py-1.5 rounded-lg hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2.5 rounded-3xl rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar - iOS iMessage Dark */}
          <div className="px-4 py-3 bg-black border-t border-gray-800">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                disabled={isTyping}
                className="flex-1 px-4 py-2 text-sm bg-gray-900 text-white rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 disabled:opacity-50"
                aria-label="Message input"
              />
              {(inputValue.trim() && !isTyping) && (
                <button
                  onClick={handleSend}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
                  aria-label="Send message"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Button */}
      {isOpen && galleryImages.length > 0 && (
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="mb-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition"
        >
          🎨 Gallery ({galleryImages.length})
        </button>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative bg-gray-900 rounded-3xl shadow-2xl max-w-2xl max-h-[80vh] overflow-auto border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              aria-label="Close lightbox"
            >
              ✕
            </button>

            <div className="relative w-full h-[60vh]">
              <Image
                src={lightboxImage.url}
                alt={`Full view of ${lightboxImage.prompt}`}
                fill
                className="object-contain rounded-t-3xl"
                sizes="100vw"
                priority
              />
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800 rounded-b-3xl">
              <p className="text-white text-sm mb-3">
                <strong>Prompt:</strong> {lightboxImage.prompt}
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handleDownloadImage(lightboxImage.url, `image-${lightboxImage.id}.jpg`)}
                  className="px-4 py-2 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => handleCopyImageUrl(lightboxImage.url)}
                  className="px-4 py-2 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition"
                >
                  🔗 Copy URL
                </button>
                <button
                  onClick={() => handleShareImage(lightboxImage.url, lightboxImage.prompt)}
                  className="px-4 py-2 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition"
                >
                  📤 Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery View Modal */}
      {showGallery && (
        <div
          className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowGallery(false)}
        >
          <div
            className="relative bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-white font-bold">🎨 Image Gallery ({galleryImages.length})</h2>
              <button
                onClick={() => setShowGallery(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                aria-label="Close gallery"
              >
                ✕
              </button>
            </div>

            <div className="p-3 grid grid-cols-2 gap-2 md:grid-cols-3 bg-black">
              {galleryImages.map((img) => (
                <div key={img.id} className="bg-gray-800 rounded-2xl overflow-hidden relative group border border-gray-700">
                  <Image
                    src={img.url}
                    alt={`Gallery: ${img.prompt}`}
                    fill
                    className="object-cover cursor-pointer hover:opacity-80 transition"
                    onClick={() => {
                      setLightboxImage(img)
                      setShowGallery(false)
                    }}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-xs gap-1.5">
                    <p className="text-center px-2 line-clamp-2 text-xs">{img.prompt}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadImage(img.url, `image-${img.id}.jpg`)
                        }}
                        className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition"
                        title="Download"
                      >
                        📥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyImageUrl(img.url)
                        }}
                        className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition"
                        title="Copy"
                      >
                        🔗
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFromGallery(img.id)
                        }}
                        className="bg-gray-600 p-2 rounded-full hover:bg-gray-500 transition"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {galleryImages.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-black">
                No images in gallery yet. Generate some images to fill it!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="relative w-14 h-14">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute inset-0 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 active:scale-90 z-50 focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${isOpen ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
            }`}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {/* Icon Chat */}
          <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          </div>

          {/* Icon X */}
          <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        </button>
      </div>

    </div>
  )
}