import { ArrowUp, Download, Mic, MicOff } from 'lucide-react'
import PropTypes from 'prop-types'
import { useEffect } from 'react'

function MessageInput({
  inputValue,
  setInputValue,
  handleSendMessage,
  handleMicrophoneClick,
  isRecording,
  downloadChatAsBraille
}) {
  // Agregar evento para detectar las teclas cuando el componente se monta
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Solo ejecuta las funciones si el foco no está en el campo de entrada
      if (document.activeElement.tagName !== 'INPUT') {
        if (e.key === 'm' || e.key === 'M') {
          handleMicrophoneClick()
        }
        if (e.key === 'd' || e.key === 'D') {
          downloadChatAsBraille()
        }
      }
    }

    // Añadir el evento de tecla al documento
    document.addEventListener('keypress', handleKeyPress)

    // Eliminar el evento cuando el componente se desmonta
    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [handleMicrophoneClick, downloadChatAsBraille])

  return (
    <div className="md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent w-full">
      <div className="m-auto text-base px-3 w-full lg:px-4 xl:px-5">
        <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
          <div className="w-full">
            <div className="flex relative">
              <input
                type="text"
                placeholder="Envía un mensaje a CodeAloud..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="h-12 px-4 flex-col rounded-[26px] bg-[#2f2f2f] dark:bg-token-main text-white w-full"
              />
              <button
                onClick={handleSendMessage}
                className="text-white bg-[#424242] hover:opacity-80 w-fit rounded-full p-2 absolute right-1 top-1"
              >
                <ArrowUp />
              </button>
            </div>
          </div>
          <button
            onClick={handleMicrophoneClick}
            className={`rounded-full relative -p-1 ${
              isRecording ? 'text-red-500 animate-pulse' : 'text-white hover:opacity-80'
            }`}
          >
            {isRecording ? <Mic /> : <MicOff />}
          </button>
          <button onClick={downloadChatAsBraille} className="text-white hover:opacity-80">
            <Download />
          </button>
        </div>
      </div>
    </div>
  )
}

MessageInput.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  handleMicrophoneClick: PropTypes.func.isRequired,
  isRecording: PropTypes.bool.isRequired,
  downloadChatAsBraille: PropTypes.func.isRequired
}

export default MessageInput
