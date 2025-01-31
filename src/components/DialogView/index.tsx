import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Tag,
  TagLabel,
  Tooltip,
  useToast
} from "@chakra-ui/react"
import { useEffect, useRef } from "react"

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
  const toast = useToast()

  // 自動滾動到最新消息
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [messages])

  // 複製全部對話
  const handleCopyAll = () => {
    const text = messages
      .map((msg) => `${msg.role}：\n${msg.content}\n`)
      .join("\n")
    navigator.clipboard.writeText(text)
    toast({
      title: "已複製全部對話",
      status: "success",
      duration: 2000
    })
  }

  return (
    <Flex direction="column" h="100%" overflow="hidden">
      {/* Header */}
      <Box p={3} borderBottom="1px solid" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm">對話結果</Heading>
          <Flex gap={2}>
            <Tooltip label="複製全部" placement="top" hasArrow>
              <IconButton
                aria-label="Copy all"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
                size="sm"
                onClick={handleCopyAll}
              />
            </Tooltip>
            <Button size="sm" onClick={onClose}>
              返回
            </Button>
          </Flex>
        </Flex>
        <Flex gap={2} overflowX="auto" pb={2}>
          {roles.map((role) => (
            <Tag key={role} colorScheme="blue" size="sm">
              <TagLabel>{role}</TagLabel>
            </Tag>
          ))}
        </Flex>
      </Box>

      {/* Content */}
      <Box flex={1} overflowY="auto" p={3} ref={contentRef}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            index={index}
          />
        ))}
      </Box>

      {/* Footer */}
      <Box p={3} borderTop="1px solid" borderColor="gray.200">
        <Button
          size="sm"
          width="100%"
          onClick={onRetry}
          leftIcon={
            <svg
              width="16"
              height="16"
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
          }>
          重新轉換
        </Button>
      </Box>
    </Flex>
  )
}

export default DialogView
