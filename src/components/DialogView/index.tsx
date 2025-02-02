import "../../styles/dialogview.css"

import { useEffect, useRef, useState } from "react"

import { MessageBubble } from "./MessageBubble"

export interface DialogMessage {
  role: string
  content: string
}

export interface DialogViewProps {
  roles: string[]
  messages: DialogMessage[]
  onClose?: () => void
  onRetry?: () => void
}

export const DialogView = ({
  roles,
  messages,
  onClose,
  onRetry
}: DialogViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showToast, setShowToast] = useState(false)

  // 自動滾動到最新消息
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [messages])

  // 顯示 Toast
  const showToastMessage = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // 複製全部對話
  const handleCopyAll = () => {
    const text = messages
      .map((msg) => `${msg.role}：\n${msg.content}\n`)
      .join("\n")
    navigator.clipboard.writeText(text)
    showToastMessage()
  }

  return (
    <div className="widget-dialog-view">
      {/* Header */}
      <div className="widget-dialog-header">
        <div className="widget-dialog-header-content">
          <h2 className="widget-dialog-title">對話結果</h2>
          <div className="widget-dialog-actions">
            <button
              className="widget-icon-button widget-tooltip"
              onClick={handleCopyAll}
              data-tooltip="複製全部">
              <svg
                className="widget-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="widget-button" onClick={onClose}>
              返回
            </button>
          </div>
        </div>
        <div className="widget-roles-list">
          {roles.map((role) => (
            <span key={role} className="widget-role-tag">
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="widget-dialog-content" ref={contentRef}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            index={index}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="widget-dialog-footer">
        <button className="widget-button widget-button-full" onClick={onRetry}>
          <svg
            className="widget-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9-9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          重新轉換
        </button>
      </div>

      {/* Toast */}
      {showToast && <div className="widget-toast">已複製全部對話</div>}
    </div>
  )
}

export default DialogView
