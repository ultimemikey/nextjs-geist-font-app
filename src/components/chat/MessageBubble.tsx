'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isVoice?: boolean
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
              : 'bg-gradient-to-r from-cyan-400 to-purple-500'
          }`}
        >
          <span className="text-white font-semibold text-sm">
            {isUser ? 'U' : 'F'}
          </span>
        </motion.div>

        {/* Message Content */}
        <motion.div
          initial={{ opacity: 0, x: isUser ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="relative"
        >
          <Card className={`p-4 ${
            isUser
              ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border-blue-500/30 text-white'
              : 'bg-gray-800/80 border-purple-500/30 text-gray-100'
          } backdrop-blur-sm shadow-lg`}>
            
            {/* Voice indicator */}
            {message.isVoice && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 mb-2 text-xs opacity-70"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Message vocal</span>
              </motion.div>
            )}
            
            {/* Message text with typing animation for assistant */}
            <div className="text-sm leading-relaxed">
              {!isUser ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {message.content}
                </motion.div>
              ) : (
                message.content
              )}
            </div>
            
            {/* Timestamp */}
            <div className={`text-xs mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </Card>

          {/* Glow effect for assistant messages */}
          {!isUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg blur-xl -z-10"
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
