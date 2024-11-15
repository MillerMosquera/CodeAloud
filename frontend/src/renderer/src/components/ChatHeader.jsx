function ChatHeader() {
  return (
    <div className="draggable no-draggable-children sticky top-0 p-3 mb-1.5 flex items-center justify-between z-10 h-header-height font-semibold bg-token-main-surface-primary max-md:hidden">
      <div className="absolute start-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2"></div>
      <div className="flex items-center gap-0 overflow-hidden">
        <p className="text-token-text-secondary text-xl">CodeAloud</p>
      </div>
    </div>
  )
}

export default ChatHeader
