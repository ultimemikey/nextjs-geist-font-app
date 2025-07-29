'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { VoiceRecorder } from './VoiceRecorder'
import { VoiceVisualizer } from './VoiceVisualizer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isVoice?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis Fatou AI, votre assistant intelligent. Comment puis-je vous aider aujourd\'hui ?',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string, isVoice = false) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      isVoice
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur de réseau')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Text-to-speech for voice mode
      if (isVoiceMode && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.message)
        utterance.lang = 'fr-FR'
        utterance.rate = 0.9
        utterance.pitch = 1.1
        
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Erreur:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const handleVoiceResult = (transcript: string) => {
    sendMessage(transcript, true)
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/20 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Fatou AI</h1>
            <p className="text-sm text-gray-300">Assistant Intelligent</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleVoiceMode}
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            className={`${
              isVoiceMode 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                : 'border-purple-500/50 text-purple-300 hover:bg-purple-500/20'
            }`}
          >
            {isVoiceMode ? '🎤 Mode Vocal' : '💬 Mode Texte'}
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <Card className="bg-gray-800/50 border-purple-500/20 p-4 max-w-xs">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Visualizer */}
      {isVoiceMode && (isSpeaking || isRecording) && (
        <div className="px-4 py-2">
          <VoiceVisualizer isActive={isSpeaking || isRecording} />
        </div>
      )}

      {/* Input Area */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-t border-purple-500/20 bg-black/20 backdrop-blur-sm"
      >
        {isVoiceMode ? (
          <VoiceRecorder
            onResult={handleVoiceResult}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={isLoading}
              className="flex-1 bg-gray-800/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
            >
              Envoyer
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
