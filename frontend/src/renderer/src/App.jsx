// Home.jsx
import { useEffect, useRef, useState } from 'react'
import ChatHeader from './components/ChatHeader'
import MessageInput from './components/MessageInput'
import MessageList from './components/MessageList'
import Sidebar from './components/Sidebar'
import { toBraille } from './utils/Braille'

function App() {
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [partialTranscription, setPartialTranscription] = useState('')
  const [lastBotMessage, setLastBotMessage] = useState('')
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('chats')) || []
    setChats(savedChats)
    if (savedChats.length > 0) {
      const lastChat = savedChats[0]
      setCurrentChatId(lastChat.id)
      setMessages(lastChat.messages)
    } else {
      createNewChat()
    }

    // Event listener for key press to play last bot message
    const handleKeyPress = (e) => {
      if (document.activeElement.tagName !== 'INPUT') {
        if (e.key === 'e' || e.key === 'E') {
          if (lastBotMessage) {
            playTextToSpeech(lastBotMessage)
          }
        }
      }
    }

    document.addEventListener('keypress', handleKeyPress)

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [lastBotMessage])

  const saveChatsToLocalStorage = (chats) => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'Nuevo Chat',
      messages: [],
      createdAt: new Date().toISOString()
    }
    setChats((prevChats) => {
      const updatedChats = [newChat, ...prevChats]
      saveChatsToLocalStorage(updatedChats)
      return updatedChats
    })
    setCurrentChatId(newChat.id)
    setMessages([])
  }

  const startRecording = async () => {
    try {
      setPartialTranscription('')
      setInputValue('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = async (event) => {
        audioChunksRef.current.push(event.data)

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        try {
          const formData = new FormData()
          formData.append('file', audioBlob, 'recording.wav')
          const response = await fetch('http://localhost:5000/transcribe', {
            method: 'POST',
            body: formData
          })
          const data = await response.json()
          setPartialTranscription(data.transcription)
        } catch (error) {
          console.error('Error transcribing audio:', error)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await handleAudioTranscription(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Error accessing microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const handleAudioTranscription = async (audioBlob) => {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.wav')

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      setPartialTranscription('')
      setInputValue(data.transcription)
      // Automatically send the transcribed message
      handleSendMessage(data.transcription)
    } catch (error) {
      console.error('Error transcribing audio:', error)
    }
  }

  const downloadChatAsBraille = () => {
    const savedChats = JSON.parse(localStorage.getItem('chats')) || []
    const currentChat = savedChats.find((chat) => chat.id === currentChatId)

    if (!currentChat) {
      alert('No chat selected')
      return
    }

    const messages = currentChat.messages
    let textContent = ''

    messages.forEach((message) => {
      const sender = message.sender === 'user' ? 'You' : 'Bot'
      const brailleText = toBraille(message.text)
      textContent += `${sender}: ${brailleText}\n\n`
    })

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'chat_braille.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const playTextToSpeech = async (text) => {
    if (isPlaying) return

    try {
      setIsPlaying(true)
      const response = await fetch('http://localhost:5000/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('TTS request failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (error) {
      console.error('Error playing TTS:', error)
      setIsPlaying(false)
    }
  }

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Modificamos la función handleSendMessage para enviar el historial completo de mensajes al backend
  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return

    const newMessage = { sender: 'user', text }
    const updatedMessages = [...messages, newMessage]

    setMessages(updatedMessages)
    setInputValue('')
    setPartialTranscription('')

    if (chats.find((chat) => chat.id === currentChatId)?.title === 'Nuevo Chat') {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, title: text.slice(0, 20) } : chat
        )
      )
    }

    try {
      const response = await fetch('http://localhost:5000/generateText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: updatedMessages
        })
      })

      const data = await response.json()
      const botMessage = { sender: 'bot', text: data.bot }

      let index = 0
      const interval = setInterval(() => {
        if (index < data.bot.length) {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: 'bot', text: data.bot.slice(0, index + 1) }
          ])
          index++
        } else {
          clearInterval(interval)
          setLastBotMessage(data.bot)
        }
      }, 50)

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, botMessage]
        if (chats.find((chat) => chat.id === currentChatId)?.title === 'Nuevo Chat') {
          const newTitle = data.bot.split('\n')[0].slice(0, 20)
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === currentChatId ? { ...chat, title: newTitle } : chat
            )
          )
        }
        const updatedChats = chats.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat
        )
        saveChatsToLocalStorage(updatedChats)
        return updatedMessages
      })

      await playTextToSpeech(data.bot)
    } catch (error) {
      console.error('Error generating response:', error)
    }
  }

  const switchChat = (chatId) => {
    const selectedChat = chats.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setCurrentChatId(chatId)
      setMessages(selectedChat.messages)
    }
  }

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    setChats(updatedChats)
    saveChatsToLocalStorage(updatedChats)
    if (updatedChats.length > 0) {
      const lastChat = updatedChats[0]
      setCurrentChatId(lastChat.id)
      setMessages(lastChat.messages)
    } else {
      createNewChat()
    }
  }

  return (
    <div className="flex h-screen">
      <div className="min-h-screen h-full dark:text-white dark:bg-[#212121] flex">
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={createNewChat}
          onSelectChat={switchChat}
          onDeleteChat={deleteChat}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between gap-3 pb-5 px-4">
        <ChatHeader />
        <MessageList
          messages={
            isRecording ? [...messages, { sender: 'user', text: partialTranscription }] : messages
          }
          playTextToSpeech={playTextToSpeech}
        />
        <MessageInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          handleMicrophoneClick={handleMicrophoneClick}
          isRecording={isRecording}
          downloadChatAsBraille={downloadChatAsBraille}
        />
      </div>
    </div>
  )
}

export default App
