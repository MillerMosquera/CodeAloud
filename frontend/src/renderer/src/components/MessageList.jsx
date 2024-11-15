// MessageList.jsx
import { motion } from 'framer-motion'
import { Copy, Volume2 } from 'lucide-react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MessageList({ messages, playTextToSpeech }) {
  return (
    <div className="m-auto text-base overflow-y-auto max-h-[calc(100vh-200px)] py-[18px] px-3 w-full md:px-5 lg:px-4 xl:px-5">
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
        <div className="flex-1">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1

            return (
              <motion.div
                key={index}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                } group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`m-2 p-2 rounded-lg max-w-[100%] ${
                    message.sender === 'user'
                      ? 'text-white rounded-3xl px-5 bg-[#2f2f2f]'
                      : 'text-white '
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={materialDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                  {message.sender === 'bot' && (
                    <>
                      <motion.div
                        className={`flex items-center gap-2 mt-1 text-white ${isLastMessage ? '' : 'hidden group-hover:flex'}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        <Volume2
                          className="cursor-pointer hover:text-gray-300"
                          onClick={() => playTextToSpeech(message.text)}
                          title="Escuchar"
                          style={{ width: '16px', height: '16px' }}
                        />
                        <Copy
                          className="cursor-pointer hover:text-gray-300"
                          title="Copiar"
                          style={{ width: '16px', height: '16px' }}
                        />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      sender: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  ).isRequired,
  playTextToSpeech: PropTypes.func.isRequired
}

export default MessageList
