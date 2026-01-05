'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// Import gambar profil
import profileImage from '../assets/images/logo.png' // Pastikan path sesuai dengan struktur folder

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
    text: 'Halo! Ada yang bisa saya bantu? 😊',
    sender: 'bot',
    timestamp: '12:22 PM'
  }
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Load messages dari localStorage saat mount
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

  // Save messages ke localStorage setiap kali berubah
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages, isLoaded])

  // Auto scroll ke pesan terbaru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const generateBotReply = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Keyword-based responses
    const responses: { [key: string]: string[] } = {
      greeting: [
        'Halo! 👋 Senang berbincang denganmu. Ada yang bisa dibantu?',
        'Hai! 😊 Apa kabar? Ada pertanyaan untuk saya?',
        'Salam! 🙌 Siapa nama kamu?',
      ],
      name: [
        'Nama yang bagus! 😄 Senang kenal denganmu!',
        'Wah, nama yang keren! 🎉 Apa yang bisa saya bantu?',
        'Nice to meet you! 👋 Ada yang ingin dibicarakan?',
      ],
      project: [
        'Saya telah bekerja dengan berbagai teknologi modern! 🚀 Tertarik dengan proyek tertentu?',
        'Saya banyak membuat project menggunakan Next.js dan Tailwind CSS 💻',
        'Portfolio saya mencakup web app, design responsif, dan UI/UX! 🎨',
      ],
      skill: [
        'Saya ahli di Next.js, React, TypeScript, dan Tailwind CSS! 💪',
        'Skills saya: Frontend Development, Web Design, dan Problem Solving 🧠',
        'Saya fokus pada modern web development dengan teknologi terkini! ⚡',
      ],
      contact: [
        'Hubungi saya melalui email atau media sosial! 📧',
        'Tentu! Kamu bisa menghubungi saya via kontak di portfolio saya 💬',
        'Senang dengarnya! Silakan tinggalkan pesan atau hubungi langsung 📞',
      ],
      thanks: [
        'Sama-sama! 🙏 Ada lagi yang bisa dibantu?',
        'Terima kasih juga! 😊 Senang berbincang denganmu!',
        'Dengan senang hati! 💝 Masih ada pertanyaan?',
      ],
      help: [
        'Tentu! Saya siap membantu. Apa yang perlu kamu ketahui? 🤝',
        'Aku di sini untuk membantu! Tanyakan apa saja! 💪',
        'Baik, beri tahu saya apa yang bisa saya lakukan untuk mu! 🎯',
      ]
    }

    // Check for keywords
    if (/halo|hi|hello|salam|hey|pagi|sore|malam/i.test(lowerMessage)) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
    }
    if (/nama|siapa|who are you/i.test(lowerMessage)) {
      return responses.name[Math.floor(Math.random() * responses.name.length)]
    }
    if (/project|projek|portfolio|karya/i.test(lowerMessage)) {
      return responses.project[Math.floor(Math.random() * responses.project.length)]
    }
    if (/skill|kemampuan|bisa apa|keahlian/i.test(lowerMessage)) {
      return responses.skill[Math.floor(Math.random() * responses.skill.length)]
    }
    if (/kontak|hubungi|contact|email|whatsapp|wa/i.test(lowerMessage)) {
      return responses.contact[Math.floor(Math.random() * responses.contact.length)]
    }
    if (/terima kasih|thanks|tq|makasih|terimakasih/i.test(lowerMessage)) {
      return responses.thanks[Math.floor(Math.random() * responses.thanks.length)]
    }
    if (/bantu|tolong|bisa|help|bagaimana/i.test(lowerMessage)) {
      return responses.help[Math.floor(Math.random() * responses.help.length)]
    }

    // Default responses untuk pertanyaan yang tidak ada keyword-nya
    const defaultReplies = [
      'Menarik! 🤔 Bisa jelaskan lebih detail?',
      'Oh ya? Cerita lebih lanjut dong! 👂',
      'Interessting! 😊 Apa maksudnya?',
      'Saya paham! Ada yang lain? 💭',
      'Noted! 📝 Kamu bisa minta bantuan apa lagi?',
      'Wah, itu bagus! 🌟 Ada pertanyaan lain?',
      'Got it! 👍 Bagaimana dengan hal lain?',
    ]

    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: 'Delivered'
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    
    setIsTyping(true)
    setTimeout(() => {
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotReply(userMsg.text),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botReply])
      setIsTyping(false)
    }, 1500)
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
                {/* Foto Profil Diganti di sini */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#3a3a3c] flex items-center justify-center">
                  <Image src={profileImage} alt="Daniegga" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">Daniegga</h3>
                <p className="text-[11px] text-gray-500 font-medium">Active now</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors p-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
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
                <div className="flex items-end gap-2 max-w-[80%]">
                  {/* Avatar bot dihapus agar lebih bersih, karena sudah ada di header */}
                  <div className="flex flex-col">
                    <div className={`px-4 py-2.5 text-[14px] leading-relaxed ${
                      msg.sender === 'user' 
                      ? 'bg-[#007AFF] text-white rounded-[1.2rem] rounded-br-none' 
                      : 'bg-[#262629] text-white rounded-[1.2rem] rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                      <span className="text-[9px] text-gray-600 mt-1 self-end font-medium px-1">Delivered</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
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
                className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-gray-600"
              />
              {inputValue.trim() && (
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