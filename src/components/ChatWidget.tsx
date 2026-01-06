'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// Import gambar profil
import profileImage from '../assets/images/logo.png' // Pastikan path sesuai

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: string
}

const STORAGE_KEY = 'chat_messages'
const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Halo! Ada yang bisa saya bantu hari ini? 😊',
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Load messages dari localStorage saat mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem(STORAGE_KEY)
      if (storedMessages) {
        try {
          setMessages(JSON.parse(storedMessages))
        } catch (error) {
          console.error('Failed to parse stored messages:', error)
          setMessages(DEFAULT_MESSAGES)
        }
      } else {
        setMessages(DEFAULT_MESSAGES)
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

  // 3. Auto scroll ke pesan terbaru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // 4. Fungsi untuk memanggil API AI
  const sendMessageToAI = async (userMessage: string) => {
    try {
      // Ambil 10 pesan terakhir untuk konteks (history)
      const history = messages.slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: history,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan response')
      }

      return data.message
    } catch (error) {
      console.error('Error calling AI:', error)
      return 'Maaf, sepertinya ada masalah koneksi. Coba lagi ya! 😅'
    }
  }

  // 5. Handle kirim pesan
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const currentInput = inputValue.trim()
    
    // Tambah pesan user ke UI
    const userMsg: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: 'user',
      timestamp: 'Delivered'
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    
    // Aktifkan indikator mengetik
    setIsTyping(true)

    // Panggil API
    const aiResponseText = await sendMessageToAI(currentInput)

    // Tambah respons bot ke UI
    const botReply: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, botReply])
    setIsTyping(false)
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans antialiased">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[550px] bg-black rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-[#262629] animate-in fade-in zoom-in duration-200 origin-bottom-right">
          
          {/* Header */}
          <div className="px-5 py-4 bg-black/80 backdrop-blur-xl flex items-center justify-between border-b border-[#262629]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#3a3a3c] flex items-center justify-center bg-gray-800">
                  <Image src={profileImage} alt="Daniegga" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">Daniegga AI</h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isTyping ? 'Typing...' : 'Active now'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClearChat} className="text-white/50 hover:text-white transition-colors p-1 rounded hover:bg-white/10" title="Clear chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors p-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-black"
          >
            <div className="text-center my-4">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">iMessage • Today</span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-end gap-2 max-w-[85%] group">
                  <div className="flex flex-col w-full">
                    <div className={`px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user' 
                      ? 'bg-[#007AFF] text-white rounded-[1.2rem] rounded-br-none' 
                      : 'bg-[#262629] text-white rounded-[1.2rem] rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {msg.sender === 'user' && (
                        <span className="text-[9px] text-gray-600 font-medium px-1">Delivered</span>
                      )}
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyResponse(msg.text, msg.id)}
                          className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 px-1 flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator (Typing Dots) */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="bg-[#262629] px-4 py-3 rounded-[1.2rem] rounded-bl-none flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-duration:1s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:1s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:1s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Input Bar */}
          <div className="px-4 py-4 bg-black pb-6">
            <div className="relative flex items-center bg-[#1c1c1e] px-4 py-2 rounded-full border border-[#3a3a3c] focus-within:border-gray-500 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="iMessage"
                disabled={isTyping}
                className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-gray-600 disabled:opacity-50"
              />
              {(inputValue.trim() && !isTyping) && (
                <button 
                  onClick={handleSend}
                  className="ml-2 w-7 h-7 bg-[#007AFF] text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="relative w-14 h-14">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute inset-0 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 active:scale-90 z-50 ${
            isOpen ? 'bg-[#1c1c1e]' : 'bg-[#007AFF] hover:scale-110'
          }`}
        >
          {/* Icon Chat */}
          <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
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