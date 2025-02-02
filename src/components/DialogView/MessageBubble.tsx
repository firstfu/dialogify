import { useState } from "react"
import ReactMarkdown from "react-markdown"

// 角色類名映射
const roleClassNames = {
  教授: "widget-role-professor",
  學生: "widget-role-student",
  記者: "widget-role-reporter",
  專家: "widget-role-expert",
  default: "widget-role-default"
}

interface MessageBubbleProps {
  role: string
  content: string
  index: number
}

export const MessageBubble = ({ role, content, index }: MessageBubbleProps) => {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

  // 根據角色取得類名
  const getRoleClassName = (role: string) => {
    if (!role) return roleClassNames.default
    const normalizedRole = Object.keys(roleClassNames).find((key) =>
      role.toLowerCase().includes(key.toLowerCase())
    )
    return roleClassNames[normalizedRole] || roleClassNames.default
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setShowCopiedTooltip(true)
      setTimeout(() => setShowCopiedTooltip(false), 2000)
    } catch (err) {
      console.error("複製失敗:", err)
    }
  }

  return (
    <div
      className="widget-message-bubble"
      style={{
        // 為每個消息添加延遲動畫
        animationDelay: `${index * 0.1}s`
      }}>
      <div className={`widget-message-bubble-inner ${getRoleClassName(role)}`}>
        {/* 角色名稱 */}
        <div className="widget-message-header">
          <span className={`widget-message-role ${getRoleClassName(role)}`}>
            {role}
          </span>
        </div>

        {/* 對話內容 */}
        <div className="widget-message-content">
          <div className="widget-markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* 複製按鈕 */}
          <button
            className="widget-icon-button widget-message-copy widget-tooltip"
            onClick={handleCopy}
            data-tooltip={showCopiedTooltip ? "已複製！" : "複製內容"}
            aria-label="複製內容">
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
        </div>
      </div>
    </div>
  )
}
