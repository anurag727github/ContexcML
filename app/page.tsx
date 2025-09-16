'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, MicOff, Send, Copy, CheckCircle, AlertCircle, Loader2, Settings, Volume2, VolumeX, Play, Square, Shield, RefreshCw } from 'lucide-react'
import { generateCode } from './actions'

interface GenerationStatus {
  isGenerating: boolean
  isSending: boolean
  error: string | null
  success: string | null
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string
      }
      isFinal: boolean
    }
  }
  resultIndex: number
}

// EmailJS Configuration - Replace with your actual values
const EMAILJS_CONFIG = {
  publicKey: 'gSzAYtERZ6iPLH_OV',    // Paste your public key here
  serviceId: 'service_indlo7r',    // Paste your service ID here  
  templateId: 'template_2j9tqk7'   // Paste your template ID here
}

export default function CodeGeneratorWithEmail() {
  const [prompt, setPrompt] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [emailJSLoaded, setEmailJSLoaded] = useState(false)
  const [emailJSError, setEmailJSError] = useState<string | null>(null)
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    isSending: false,
    error: null,
    success: null
  })

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [speechFeedback, setSpeechFeedback] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [speechHistory, setSpeechHistory] = useState<string[]>([])
  const [permissionRequested, setPermissionRequested] = useState(false)

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const emailJSRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout>()

  // Check microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicrophonePermission('denied')
        return
      }

      // Check current permission state
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicrophonePermission(permission.state as any)
        
        // Listen for permission changes
        permission.onchange = () => {
          setMicrophonePermission(permission.state as any)
        }
      } else {
        // Fallback for browsers without permissions API
        setMicrophonePermission('prompt')
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error)
      setMicrophonePermission('prompt')
    }
  }

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      setPermissionRequested(true)
      setSpeechError(null)
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      setMicrophonePermission('granted')
      setSpeechError(null)
      
      if (speechFeedback) {
        speakText('Microphone access granted. You can now use voice input.')
      }
      
      return true
    } catch (error: any) {
      console.error('Microphone permission error:', error)
      setMicrophonePermission('denied')
      
      let errorMessage = 'Microphone access denied.'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is being used by another application.'
      }
      
      setSpeechError(errorMessage)
      return false
    }
  }

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setSpeechSupported(true)
        
        // Initialize recognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        recognitionRef.current.maxAlternatives = 1

        // Handle speech recognition results
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ''
          let finalTranscript = ''

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Update states
          setInterimTranscript(interimTranscript)
          
          if (finalTranscript) {
            setFinalTranscript(finalTranscript)
            setPrompt(prev => {
              const newPrompt = prev + (prev ? ' ' : '') + finalTranscript
              return newPrompt
            })
            
            // Add to history
            setSpeechHistory(prev => [...prev.slice(-4), finalTranscript])
            
            // Provide audio feedback
            if (speechFeedback) {
              speakText(`Added: ${finalTranscript}`)
            }
          }
        }

        // Handle speech recognition start
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started')
          setIsListening(true)
          setIsRecording(true)
          setSpeechError(null)
          
          if (speechFeedback) {
            speakText('Listening for your code request')
          }
        }

        // Handle speech recognition end
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended')
          setIsListening(false)
          setIsRecording(false)
          setInterimTranscript('')
        }

        // Handle speech recognition errors
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setIsRecording(false)
          setInterimTranscript('')
          
          let errorMessage = 'Speech recognition error'
          let shouldRetry = false
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try speaking louder and clearer.'
              shouldRetry = true
              break
            case 'audio-capture':
              errorMessage = 'Microphone not accessible. Please check your microphone connection.'
              setMicrophonePermission('denied')
              break
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please click "Allow Microphone" to enable voice input.'
              setMicrophonePermission('denied')
              setPermissionRequested(false)
              break
            case 'network':
              errorMessage = 'Network error occurred. Please check your internet connection.'
              shouldRetry = true
              break
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not allowed. Please try again.'
              break
            case 'bad-grammar':
              errorMessage = 'Speech recognition grammar error. Please try again.'
              shouldRetry = true
              break
            case 'language-not-supported':
              errorMessage = 'Language not supported. Please check your browser settings.'
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}. Please try again.`
              shouldRetry = true
          }
          
          setSpeechError(errorMessage)
          
          if (speechFeedback && event.error !== 'aborted') {
            speakText(errorMessage)
          }

          // Auto-retry for certain errors
          if (shouldRetry && microphonePermission === 'granted') {
            setTimeout(() => {
              if (!isListening) {
                setSpeechError(null)
              }
            }, 3000)
          }
        }

        // Handle no speech match
        recognitionRef.current.onnomatch = () => {
          console.log('No speech match found')
          setSpeechError('No speech recognized. Please try speaking more clearly.')
        }

      } else {
        setSpeechSupported(false)
        console.log('Speech recognition not supported in this browser')
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        speechSynthesisRef.current = window.speechSynthesis
      }

      // Check microphone permission on load
      checkMicrophonePermission()
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [])

  // Load EmailJS
  useEffect(() => {
    const loadEmailJS = async () => {
      try {
        // Load EmailJS from CDN
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
        script.onload = () => {
          if ((window as any).emailjs) {
            emailJSRef.current = (window as any).emailjs
            emailJSRef.current.init(EMAILJS_CONFIG.publicKey)
            setEmailJSLoaded(true)
            console.log('EmailJS loaded successfully')
          }
        }
        script.onerror = () => {
          setEmailJSError('Failed to load EmailJS library')
        }
        document.head.appendChild(script)
      } catch (error) {
        setEmailJSError('Error loading EmailJS: ' + (error as Error).message)
      }
    }

    loadEmailJS()
  }, [])

  const speakText = (text: string) => {
    if (!speechFeedback || !speechSynthesisRef.current) return
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.7
    utterance.lang = 'en-US'
    
    speechSynthesisRef.current.speak(utterance)
  }

  const startListening = async () => {
    if (!recognitionRef.current || !speechSupported) {
      setSpeechError('Speech recognition not supported in this browser')
      return
    }

    // Check and request permission if needed
    if (microphonePermission !== 'granted') {
      const granted = await requestMicrophonePermission()
      if (!granted) {
        return
      }
    }

    try {
      setSpeechError(null)
      setInterimTranscript('')
      recognitionRef.current.start()
      
      // Set timeout to handle potential startup issues
      setTimeout(() => {
        if (!isListening && !speechError) {
          setSpeechError('Failed to start speech recognition. Please try again.')
        }
      }, 3000)
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setSpeechError('Failed to start speech recognition. Please try again.')
      setIsListening(false)
      setIsRecording(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsRecording(false)
      setInterimTranscript('')
      setSpeechError(null)
      
      if (speechFeedback) {
        speakText('Speech recognition stopped')
      }
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const clearTranscript = () => {
    setPrompt('')
    setTranscript('')
    setFinalTranscript('')
    setInterimTranscript('')
    setSpeechHistory([])
    setSpeechError(null)
    
    if (speechFeedback) {
      speakText('Transcript cleared')
    }
  }

  const insertSampleText = () => {
    const samplePrompts = [
      'Create a React component for a todo list with add, delete, and toggle functionality',
      'Write a Python function to sort an array using quicksort algorithm',
      'Generate HTML and CSS for a responsive navigation bar',
      'Create a JavaScript function to validate email addresses',
      'Write a SQL query to find the top 10 customers by purchase amount'
    ]
    
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
    setPrompt(randomPrompt)
    
    if (speechFeedback) {
      speakText('Sample prompt inserted')
    }
  }

  const retryPermission = async () => {
    setPermissionRequested(false)
    setSpeechError(null)
    await checkMicrophonePermission()
    if (microphonePermission !== 'granted') {
      await requestMicrophonePermission()
    }
  }

  const clearStatus = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => ({ ...prev, error: null, success: null }))
    }, 5000)
  }

  const sendEmailWithEmailJS = async (emailParams: any) => {
    if (!emailJSRef.current) {
      throw new Error('EmailJS not loaded')
    }

    try {
      const response = await emailJSRef.current.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        emailParams
      )
      return response
    } catch (error) {
      console.error('EmailJS send error:', error)
      throw error
    }
  }

  const [generationMethod, setGenerationMethod] = useState<'ai' | 'fallback' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim() || !name.trim() || !email.trim()) {
      setStatus(prev => ({ ...prev, error: 'Please fill in all fields' }))
      clearStatus()
      return
    }

    if (!emailJSLoaded) {
      setStatus(prev => ({ ...prev, error: 'EmailJS not ready. Please wait and try again.' }))
      clearStatus()
      return
    }

    // Stop speech recognition during processing
    if (isListening) {
      stopListening()
    }

    setStatus({
      isGenerating: true,
      isSending: false,
      error: null,
      success: null
    })
    setGeneratedCode('')
    setGenerationMethod(null)

    if (speechFeedback) {
      speakText('Generating code based on your request')
    }

    try {
      // Generate code based on prompt
      const result = await generateCode(prompt)
      
      if (!result.success) {
        throw new Error(result.error || 'Code generation failed')
      }

      setGeneratedCode(result.code)
      setGenerationMethod(result.usingAI ? 'ai' : 'fallback')
      
      // Update status to sending email
      setStatus({
        isGenerating: false,
        isSending: true,
        error: null,
        success: `Code generated successfully${result.usingAI ? ' using AI' : ' using smart templates'}! Sending email...`
      })

      if (speechFeedback) {
        speakText('Code generated successfully. Now sending email.')
      }

      // Send email notification using EmailJS
      const emailParams = {
        to_name: name,
        to_email: email,
        from_name: 'AI Code Generator',
        user_prompt: prompt,
        generated_code: result.code,
        user_message: `Hello ${name}! Here's your freshly generated code based on your request: "${prompt}". Happy coding! 🚀`
      }

      await sendEmailWithEmailJS(emailParams)

      setStatus({
        isGenerating: false,
        isSending: false,
        error: null,
        success: `✅ Code generated and email sent successfully to ${email}!`
      })

      if (speechFeedback) {
        speakText(`Code generated and email sent successfully to ${email}`)
      }

      // Reset form
      setPrompt('')
      setName('')
      setEmail('')
      setTranscript('')
      setFinalTranscript('')
      setSpeechHistory([])
      
    } catch (error) {
      setStatus({
        isGenerating: false,
        isSending: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        success: null
      })

      if (speechFeedback) {
        speakText('An error occurred during code generation')
      }
    }
    
    clearStatus()
  }

  const copyToClipboard = async () => {
    if (!generatedCode) return
    
    try {
      await navigator.clipboard.writeText(generatedCode)
      setStatus(prev => ({ ...prev, success: 'Code copied to clipboard!' }))
      
      if (speechFeedback) {
        speakText('Code copied to clipboard')
      }
      
      clearStatus()
    } catch (error) {
      setStatus(prev => ({ ...prev, error: 'Failed to copy code' }))
      clearStatus()
    }
  }

  const getPermissionStatusColor = () => {
    switch (microphonePermission) {
      case 'granted': return 'border-green-300 bg-green-50'
      case 'denied': return 'border-red-300 bg-red-50'
      case 'prompt': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getPermissionStatusText = () => {
    switch (microphonePermission) {
      case 'granted': return 'Microphone access granted ✅'
      case 'denied': return 'Microphone access denied ❌'
      case 'prompt': return 'Microphone permission required ⚠️'
      default: return 'Checking microphone permission...'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status Messages */}
        {status.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 p-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{status.error}</span>
            </CardContent>
          </Card>
        )}

        {status.success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-2 p-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{status.success}</span>
            </CardContent>
          </Card>
        )}

        {/* Speech Recognition Status */}
        {speechSupported && (
          <Card className={`border-2 ${isListening ? 'border-red-300 bg-red-50' : getPermissionStatusColor()}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mic className={`h-5 w-5 ${isListening ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                Voice-to-Text Recognition
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpeechFeedback(!speechFeedback)}
                  >
                    {speechFeedback ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  {microphonePermission === 'granted' ? (
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      size="sm"
                      onClick={toggleListening}
                      disabled={!speechSupported}
                    >
                      {isListening ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Listening
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={retryPermission}
                      disabled={microphonePermission === 'checking'}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Allow Microphone
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Permission Status */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  microphonePermission === 'granted' ? 'bg-green-100 text-green-800' :
                  microphonePermission === 'denied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    microphonePermission === 'granted' ? 'bg-green-500' :
                    microphonePermission === 'denied' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  {getPermissionStatusText()}
                </div>
                
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Recording...
                  </div>
                )}
              </div>

              {/* Permission Instructions */}
              {microphonePermission === 'denied' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Microphone Permission Required</h4>
                      <div className="text-sm text-red-700 space-y-2">
                        <p>To use voice input, please allow microphone access:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-4">
                          <li>Click the microphone icon in your browser's address bar</li>
                          <li>Select "Always allow" for this site</li>
                          <li>Refresh the page or click "Allow Microphone" button</li>
                        </ol>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={retryPermission}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry Permission
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Transcript */}
              {microphonePermission === 'granted' && (interimTranscript || isListening) && (
                <div className="p-3 bg-white border rounded-lg">
                  <Label className="text-sm font-medium text-gray-700">Live Transcript:</Label>
                  <div className="mt-1 text-gray-900">
                    {interimTranscript && (
                      <span className="text-gray-500 italic">"{interimTranscript}"</span>
                    )}
                    {!interimTranscript && isListening && (
                      <span className="text-gray-400">Listening for speech...</span>
                    )}
                  </div>
                </div>
              )}

              {/* Speech History */}
              {speechHistory.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <Label className="text-sm font-medium text-gray-700">Recent Speech:</Label>
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                    {speechHistory.slice(-3).map((text, index) => (
                      <div key={index} className="text-sm text-blue-800 bg-blue-50 px-2 py-1 rounded">
                        "{text}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speech Error */}
              {speechError && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">{speechError}</span>
                  </div>
                </div>
              )}

              {/* Speech Controls */}
              {microphonePermission === 'granted' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearTranscript}
                    disabled={!prompt && speechHistory.length === 0}
                  >
                    Clear Transcript
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={insertSampleText}
                  >
                    Insert Sample
                  </Button>
                </div>
              )}

              {/* Browser Compatibility Info */}
              {!speechSupported && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <div className="font-medium">Speech recognition not supported</div>
                      <div>Please use Chrome, Edge, or Safari for voice input</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📝 Code Generation Request</span>
              {(status.isGenerating || status.isSending) && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={status.isGenerating || status.isSending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status.isGenerating || status.isSending}
                    required
                  />
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="flex items-center gap-2">
                  Code Request
                  {speechSupported && microphonePermission === 'granted' && (
                    <Button
                      type="button"
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      onClick={toggleListening}
                      disabled={status.isGenerating || status.isSending}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isListening ? 'Stop' : 'Voice'}
                    </Button>
                  )}
                </Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what code you want me to generate... (e.g., 'Create a React component for a todo list' or 'Write a Python function to sort an array')"
                  rows={4}
                  disabled={status.isGenerating || status.isSending}
                  required
                  className={isListening ? 'border-red-300 bg-red-50' : ''}
                />
                {isListening && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <Mic className="h-4 w-4 animate-pulse" />
                    Listening... Speak your code request
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={status.isGenerating || status.isSending || !emailJSLoaded}
              >
                {status.isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Code...
                  </>
                ) : status.isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Email...
                  </>
                ) : !emailJSLoaded ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading EmailJS...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Code & Send Email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Code Display */}
        {generatedCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🎯 Generated Code</span>
                  {generationMethod === 'ai' && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      🤖 AI Generated
                    </span>
                  )}
                  {generationMethod === 'fallback' && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      📝 Template Based
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </div>
              {generationMethod === 'fallback' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> This code was generated using smart templates. 
                    For more advanced AI-generated code, add your OpenAI API key to the environment variables.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Information */}
        {(status.isGenerating || status.isSending) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {status.isGenerating ? '🤖 AI is generating your code...' : '📧 Sending email notification...'}
                </h3>
                <p className="text-blue-700">
                  {status.isGenerating 
                    ? 'Please wait while our AI analyzes your request and generates the perfect code for you.'
                    : 'Your code has been generated! We\'re now sending it to your email address via EmailJS.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
