'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface VoiceRecorderProps {
  onResult: (transcript: string) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export function VoiceRecorder({ onResult, isRecording, setIsRecording }: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'fr-FR'

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)

        if (finalTranscript) {
          onResult(finalTranscript.trim())
          setTranscript('')
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onResult, setIsRecording])

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center text-gray-400">
          <p className="text-sm">La reconnaissance vocale n'est pas supportée par votre navigateur.</p>
          <p className="text-xs mt-1">Utilisez Chrome, Edge ou Safari pour cette fonctionnalité.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Transcript preview */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-3 bg-gray-800/50 border border-purple-500/30 rounded-lg"
        >
          <p className="text-sm text-gray-300 text-center">
            {transcript}
          </p>
        </motion.div>
      )}

      {/* Recording button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={toggleRecording}
          className={`relative w-16 h-16 rounded-full ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
          } text-white shadow-lg`}
        >
          {/* Microphone icon */}
          <motion.div
            animate={isRecording ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
            className="text-2xl"
          >
            🎤
          </motion.div>

          {/* Recording pulse effect */}
          {isRecording && (
            <>
              <motion.div
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
            </>
          )}
        </Button>
      </motion.div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gray-400 text-center max-w-xs"
      >
        {isRecording 
          ? 'Parlez maintenant... Cliquez pour arrêter'
          : 'Cliquez sur le microphone pour commencer à parler'
        }
      </motion.p>
    </div>
  )
}
