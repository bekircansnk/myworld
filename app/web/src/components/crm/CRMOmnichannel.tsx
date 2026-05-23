"use client"

import * as React from "react"
import { Send, CheckCheck, MessageSquare, Phone, Info, MessageCircle, Facebook, Instagram, Building, Star, Mail, Search } from "lucide-react"

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
      timestamp: "Yesterday",
      unread: false,
      avatarColor: "#3b82f6",
      company: "Kaya Tasarım",
      email: "ayse@kayatasarim.com",
      phone: "+90 544 888 7766",
      messages: [
        { id: "m4", text: "Reklam kampanyası tasarımı hakkında destek almak istiyorduk.", sender: "customer", timestamp: "Yesterday 15:20" },
        { id: "m5", text: "Memnuniyetle. Yarın sabah saat 10:00'da bir online toplantı planlayalım mı?", sender: "me", timestamp: "Yesterday 15:45" },
        { id: "m6", text: "Harika! Yarın saat 10:00'da görüşmek üzere.", sender: "customer", timestamp: "Yesterday 15:48" }
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

  // Demo bot yanıtları
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return

    const newMessage: Message = {
      id: `m-me-${Date.now()}`,
      text: inputText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })
    }

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
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      
      let botResponse = "Mesajınızı aldım. En kısa sürede geri dönüş yapacağım."
      const lowerMsg = userMsg.toLowerCase()
      if (lowerMsg.includes("fiyat") || lowerMsg.includes("teklif") || lowerMsg.includes("tutar")) {
        botResponse = `Ödeme koşulları ve detaylı fiyat teklifi konusunda size özel bir plan çıkardık. E-postanızı (${activeChat.email}) kontrol edebilir misiniz?`
      } else if (lowerMsg.includes("merhaba") || lowerMsg.includes("selam")) {
        botResponse = `Merhaba! Size nasıl yardımcı olabilirim?`
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
    whatsapp: <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />,
    facebook: <Facebook className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />,
    instagram: <Instagram className="w-3.5 h-3.5 text-pink-500" />
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f9fa]">
      {/* Sol: Gelen Kutusu Sohbet Listesi */}
      <div className="w-80 border-r border-[#e9ecef] bg-white flex flex-col shrink-0 h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9ecef] shrink-0">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Inbox</h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f5]">
          {chats.map((chat) => {
            const isActive = chat.id === selectedChatId
            return (
              <button
                key={chat.id}
                onClick={() => {
                  setSelectedChatId(chat.id)
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c))
                }}
                className={`w-full text-left px-5 py-4.5 flex items-start gap-3 transition-all ${
                  isActive ? "bg-slate-50 border-l-4 border-slate-950 pl-4" : "hover:bg-[#fafbfc]"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-xs"
                    style={{ backgroundColor: chat.avatarColor }}
                  >
                    {chat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    {channelIcons[chat.channel]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900 truncate">{chat.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{chat.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-1.5 font-bold">
                    {chat.lastMessage}
                  </p>
                  {chat.unread && (
                    <div className="flex justify-end mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orta: Yazışma Akışı */}
      {activeChat && (
        <div className="flex-1 flex flex-col bg-[#f8f9fa] h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e9ecef] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-xs"
                style={{ backgroundColor: activeChat.avatarColor }}
              >
                {activeChat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-none">{activeChat.name}</h4>
                <p className="text-[9px] text-indigo-600 font-bold mt-1.5 uppercase">
                  Connected via {activeChat.channel}
                </p>
              </div>
            </div>
          </div>

          {/* Mesaj Kutuları */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#f8f9fa]">
            {activeChat.messages.map((msg) => {
              const isMe = msg.sender === "me"
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-xl text-xs font-semibold leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-[#e9ecef] rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[8.5px] mt-1.5 ${
                        isMe ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-xl border border-[#e9ecef] rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Girişi */}
          <div className="p-4 bg-white border-t border-[#e9ecef] shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-2 rounded-lg text-xs bg-[#fafbfc] border border-[#e9ecef] focus:outline-none focus:border-slate-350 transition-all font-semibold"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-sm text-xs font-bold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sağ: Müşteri Kartı */}
      {activeChat && (
        <div className="hidden lg:flex w-80 border-l border-[#e9ecef] bg-white flex-col h-full overflow-hidden p-6 shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-6">Contact Card</h4>
          
          <div className="flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm mb-3.5"
              style={{ backgroundColor: activeChat.avatarColor }}
            >
              {activeChat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
            <h3 className="text-xs font-black text-slate-900 leading-none">{activeChat.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">{activeChat.company}</p>
          </div>

          <div className="mt-8 flex flex-col gap-4 pt-4 border-t border-[#f1f3f5]">
            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <Mail className="w-4 h-4 text-slate-355" />
              <span className="truncate">{activeChat.email}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <Phone className="w-4 h-4 text-slate-355" />
              <span>{activeChat.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <Building className="w-4 h-4 text-slate-355" />
              <span>{activeChat.company}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
