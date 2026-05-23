"use client"

import * as React from "react"
import { Send, CheckCheck, MessageSquare, Phone, Info, MessageCircle, Facebook, Instagram, Building, Star, Mail } from "lucide-react"

interface CRMOmnichannelProps {
  projectId: number | null
}

interface Message {
  id: string
  text: string
  sender: "me" | "customer"
  timestamp: string
}

interface Chat {
  id: string
  name: string
  channel: "whatsapp" | "facebook" | "instagram"
  lastMessage: string
  timestamp: string
  unread: boolean
  avatarColor: string
  company: string
  email: string
  phone: string
  messages: Message[]
}

export function CRMOmnichannel({ projectId }: CRMOmnichannelProps) {
  const [chats, setChats] = React.useState<Chat[]>([
    {
      id: "chat-1",
      name: "Ahmet Yılmaz",
      channel: "whatsapp",
      lastMessage: "Fiyat teklifini inceledim, ödeme koşullarını konuşabilir miyiz?",
      timestamp: "14:02",
      unread: true,
      avatarColor: "#10b981",
      company: "Yılmaz Holding",
      email: "ahmet@yilmazholding.com",
      phone: "+90 532 999 8877",
      messages: [
        { id: "m1", text: "Merhaba, yazılım projesi için bilgi alabilir miyim?", sender: "customer", timestamp: "10:15" },
        { id: "m2", text: "Tabii ki Ahmet Bey, projenizin detaylarını ve kapsamını öğrenebilir miyiz?", sender: "me", timestamp: "10:17" },
        { id: "m3", text: "Fiyat teklifini inceledim, ödeme koşullarını konuşabilir miyiz?", sender: "customer", timestamp: "14:02" }
      ]
    },
    {
      id: "chat-2",
      name: "Ayşe Kaya",
      channel: "facebook",
      lastMessage: "Harika! Yarın saat 10:00'da görüşmek üzere.",
      timestamp: "Dün",
      unread: false,
      avatarColor: "#3b82f6",
      company: "Kaya Tasarım",
      email: "ayse@kayatasarim.com",
      phone: "+90 544 888 7766",
      messages: [
        { id: "m4", text: "Reklam kampanyası tasarımı hakkında destek almak istiyorduk.", sender: "customer", timestamp: "Dün 15:20" },
        { id: "m5", text: "Memnuniyetle. Yarın sabah saat 10:00'da bir online toplantı planlayalım mı?", sender: "me", timestamp: "Dün 15:45" },
        { id: "m6", text: "Harika! Yarın saat 10:00'da görüşmek üzere.", sender: "customer", timestamp: "Dün 15:48" }
      ]
    },
    {
      id: "chat-3",
      name: "Mehmet Demir",
      channel: "instagram",
      lastMessage: "Yeni modelleriniz ne zaman stokta olur?",
      timestamp: "21 May",
      unread: false,
      avatarColor: "#ec4899",
      company: "Demir Ticaret",
      email: "mehmet@demirticaret.com",
      phone: "+90 555 777 6655",
      messages: [
        { id: "m7", text: "Selamlar, katalogtaki ürünler çok güzel görünüyor.", sender: "customer", timestamp: "21 May 11:20" },
        { id: "m8", text: "Beğenmenize çok sevindik Mehmet Bey. Yardımcı olabileceğimiz bir konu var mı?", sender: "me", timestamp: "21 May 11:25" },
        { id: "m9", text: "Yeni modelleriniz ne zaman stokta olur?", sender: "customer", timestamp: "21 May 11:30" }
      ]
    }
  ])

  const [selectedChatId, setSelectedChatId] = React.useState<string>("chat-1")
  const [inputText, setInputText] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const activeChat = chats.find(c => c.id === selectedChatId)

  // Otomatik Demo Akıllı Bot Yanıtları
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return

    const newMessage: Message = {
      id: `m-me-${Date.now()}`,
      text: inputText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })
    }

    // Mesajımızı ekleyelim ve unread durumunu kapatalım
    setChats(prevChats =>
      prevChats.map(c => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            unread: false,
            lastMessage: inputText,
            timestamp: "Şimdi",
            messages: [...c.messages, newMessage]
          }
        }
        return c
      })
    )

    const userMsg = inputText
    setInputText("")

    // Müşterinin yazıyor simülasyonunu başlat
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      
      let botResponse = "Mesajınızı aldım. Satış ekibimiz en kısa sürede size geri dönüş yapacaktır. Teşekkürler!"
      
      // Akıllı cevap simülasyonu
      const lowerMsg = userMsg.toLowerCase()
      if (lowerMsg.includes("fiyat") || lowerMsg.includes("teklif") || lowerMsg.includes("tutar")) {
        botResponse = `Ödeme koşulları ve detaylı fiyatlandırma konusunda size özel bir teklif hazırladık bile. E-postanızı (${activeChat.email}) kontrol edebilir veya telefonunuzdan (${activeChat.phone}) sizi aramamızı ister misiniz?`
      } else if (lowerMsg.includes("merhaba") || lowerMsg.includes("selam")) {
        botResponse = `Merhaba Ahmet Bey! Size nasıl yardımcı olabilirim? Yazılım projesi veya teklifler hakkında bilgi almak ister misiniz?`
      } else if (lowerMsg.includes("ödeme") || lowerMsg.includes("taksit") || lowerMsg.includes("indirim")) {
        botResponse = `Ödeme işlemlerini 3 taksit halinde veya peşin ödemede %10 indirimle gerçekleştirebiliyoruz. Hangisi sizin için daha uygun olur?`
      } else if (lowerMsg.includes("toplantı") || lowerMsg.includes("görüşme") || lowerMsg.includes("zoom")) {
        botResponse = `Görüşme talebiniz kaydedildi. Takvim modülümüz üzerinden size uygun bir saat belirleyip Zoom davetiyesini e-postanıza göndereceğiz.`
      }

      const responseMessage: Message = {
        id: `m-cust-${Date.now()}`,
        text: botResponse,
        sender: "customer",
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })
      }

      setChats(prevChats =>
        prevChats.map(c => {
          if (c.id === activeChat.id) {
            return {
              ...c,
              lastMessage: botResponse,
              timestamp: "Şimdi",
              messages: [...c.messages, responseMessage]
            }
          }
          return c
        })
      )
    }, 1500)
  }

  const channelIcons = {
    whatsapp: <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-500" />,
    facebook: <Facebook className="w-4 h-4 text-blue-600 fill-blue-600" />,
    instagram: <Instagram className="w-4 h-4 text-pink-500" />
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sol: Mesajlaşan Kişiler Listesi */}
      <div className="w-80 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 shrink-0">
          <h3 className="text-xs font-black text-brand-dark dark:text-white uppercase tracking-wider">Kanallar & Gelen Kutusu</h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {chats.map((chat) => {
            const isActive = chat.id === selectedChatId
            return (
              <button
                key={chat.id}
                onClick={() => {
                  setSelectedChatId(chat.id)
                  // Okundu olarak işaretle
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c))
                }}
                className={`w-full text-left p-4.5 flex items-start gap-3 transition-all duration-150 ${
                  isActive ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-4 border-indigo-600 pl-3.5" : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {/* Avatar & Kanal İkonu */}
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs"
                    style={{ backgroundColor: chat.avatarColor }}
                  >
                    {chat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
                    {channelIcons[chat.channel]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-brand-dark dark:text-white truncate">{chat.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{chat.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1.5 font-medium leading-none">
                    {chat.lastMessage}
                  </p>
                  {chat.unread && (
                    <div className="flex justify-end mt-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orta: Chat Yazışma Alanı */}
      {activeChat && (
        <div className="flex-1 flex flex-col bg-slate-50/40 dark:bg-slate-900/10 h-full overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs"
                style={{ backgroundColor: activeChat.avatarColor }}
              >
                {activeChat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-black text-brand-dark dark:text-white leading-none">{activeChat.name}</h4>
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                  {activeChat.channel.toUpperCase()} Üzerinden Bağlı
                </p>
              </div>
            </div>
          </div>

          {/* Mesaj Balonları Alanı */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
            {activeChat.messages.map((msg) => {
              const isMe = msg.sender === "me"
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/5 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                        isMe ? "text-indigo-200" : "text-slate-400 dark:text-gray-500"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Müşteri Yazıyor Efekti */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-white/5 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Alt Mesaj Yazma Girişi */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mesajınızı buraya yazın..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shadow-md shadow-indigo-600/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sağ: Müşteri CRM Kartı */}
      {activeChat && (
        <div className="hidden lg:flex w-80 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex-col h-full overflow-hidden p-6 shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-6">Müşteri Detay Kartı</h4>
          
          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-md mb-3"
              style={{ backgroundColor: activeChat.avatarColor }}
            >
              {activeChat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
            <h3 className="text-sm font-black text-brand-dark dark:text-white">{activeChat.name}</h3>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">{activeChat.company}</p>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{activeChat.email}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{activeChat.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{activeChat.company}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 mt-8 pt-6">
            <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3">Entegre Otomasyonlar</h5>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span className="font-bold text-slate-700 dark:text-slate-300">WhatsApp Bildirimleri</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                <span className="font-bold text-slate-700 dark:text-slate-300">E-Posta Kampanyası</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
