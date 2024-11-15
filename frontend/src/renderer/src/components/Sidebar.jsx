import PropTypes from 'prop-types'
import { useState } from 'react'
import { FaChevronLeft } from 'react-icons/fa'
import { TbMinusVertical } from 'react-icons/tb'
import { Trash, Plus } from 'lucide-react'

function Sidebar({ onNewChat, onSelectChat, onDeleteChat, currentChatId = null, chats = [] }) {
  const [isSidebar, setSidebar] = useState(true)

  function toggleSidebar() {
    setSidebar(!isSidebar)
  }

  return (
    <div
      className={`min-h-screen relative transition-all ${
        isSidebar ? 'w-[244px]' : '-translate-x-full'
      }`}
    >
      {isSidebar && (
        <div className="min-h-screen w-full pl-4 pr-6 pt-20 dark:bg-[#171717]">
          {/*Boton para crear nuevo chat */}
          <div className="absolute top-5 left-0 pl-4 pr-6 w-full">
            <button
              onClick={onNewChat}
              className="flex justify-between w-full items-center p-2 hover:bg-[#212121] rounded-lg transition-all"
            >
              <section className="flex items-center gap-2">
                <p className="text-sm">Nuevo Chat</p>
              </section>
              <Plus
                className="text-white text-sm"
                title="Nuevo chat"
                style={{ width: '16px', height: '16px' }}
              />
            </button>
          </div>

          {/* Lista de chat */}
          <div className="w-full flex flex-col gap-2 mt-16">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex justify-between items-center p-2 hover:bg-[#212121] rounded-lg transition-all text-white cursor-pointer ${
                    currentChatId === chat.id ? 'bg-[#212121]' : ''
                  }`}
                >
                  <p className="truncate max-w-[180px] overflow-hidden  text-ellipsis ">
                    {chat.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(chat.id)
                    }}
                    className="text-white hover:text-white"
                  >
                    <Trash title="Eliminar chat" style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center mt-10">No hay chat disponibles</p>
            )}
          </div>
        </div>
      )}
      <div className="absolute inset-y-0 right-[-30px] flex items-center justify-center w-[30px]">
        <button
          onClick={toggleSidebar}
          className="h-[100px] group text-gray-500 hover:text-white w-full flex items-center justify-center transition-all"
        >
          <FaChevronLeft className="hidden group-hover:flex text-xl delay-500 duration-500 ease-in-out transition-all" />
          <TbMinusVertical className="text-3xl group-hover:hidden delay-500 duration-500 ease-in-out transition-all" />
        </button>
      </div>
    </div>
  )
}

// Definición de PropTypes
Sidebar.propTypes = {
  onNewChat: PropTypes.func.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  onDeleteChat: PropTypes.func.isRequired,
  currentChatId: PropTypes.number,
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      messages: PropTypes.arrayOf(
        PropTypes.shape({
          sender: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ).isRequired
}

export default Sidebar
