import React, { Component, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

import "highlight.js/styles/github-dark.css"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// 錯誤邊界組件
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Markdown rendering error:", error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div className="markdown-error">內容無法正確顯示</div>
    }

    return this.props.children
  }
}

// Markdown 渲染組件
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}>
      {content}
    </ReactMarkdown>
  )
}

interface MessageBubbleProps {
  role: string
  content: string
  index: number
  roles?: string[]
}

// 根據角色名稱生成顏色
const generateRoleColor = (
  role: string,
  index: number,
  totalRoles: number
): string => {
  if (!role) return "hsl(0, 0%, 95%)" // 預設顏色

  // 根據角色在 roles 陣列中的位置生成顏色
  const hue = (360 / totalRoles) * index
  return `hsl(${hue}, 70%, 95%)`
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content = "",
  index,
  roles = []
}) => {
  // 使用 useMemo 緩存樣式計算
  const bubbleStyle = useMemo(() => {
    // 找出當前角色在 roles 陣列中的索引
    const roleIndex = roles.indexOf(role)
    const color = generateRoleColor(
      role,
      roleIndex >= 0 ? roleIndex : 0,
      roles.length || 1
    )

    return {
      "--animation-delay": `${index * 0.1}s`,
      "--role-color": color
    }
  }, [role, index, roles])

  // 確保內容是字串且不為空
  const safeContent = typeof content === "string" ? content.trim() : ""

  return (
    <div
      className="widget-message-bubble"
      style={bubbleStyle as React.CSSProperties}>
      <div className="widget-message-bubble-inner">
        <div className="widget-message-header">
          <span className="widget-message-role">{role}</span>
        </div>
        <div className="widget-message-content">
          <ErrorBoundary>
            {safeContent ? (
              <MarkdownRenderer content={safeContent} />
            ) : (
              <div className="empty-content"></div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
