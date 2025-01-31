import {
  Box,
  Flex,
  IconButton,
  Text,
  Tooltip,
  useClipboard,
  useToast
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

const MotionBox = motion(Box)

// 角色顏色映射
const roleColors = {
  教授: "purple.500",
  學生: "green.500",
  記者: "blue.500",
  專家: "red.500",
  default: "gray.500"
}

interface MessageBubbleProps {
  role: string
  content: string
  index: number
}

export const MessageBubble = ({ role, content, index }: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { hasCopied, onCopy } = useClipboard(content)
  const toast = useToast()

  // 根據角色取得顏色
  const getColorByRole = (role: string) => {
    if (!role) return roleColors.default
    const normalizedRole = Object.keys(roleColors).find((key) =>
      role.toLowerCase().includes(key.toLowerCase())
    )
    return roleColors[normalizedRole] || roleColors.default
  }

  const handleCopy = () => {
    onCopy()
    toast({
      title: "已複製到剪貼簿",
      status: "success",
      duration: 2000
    })
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      mb={3}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Flex
        direction="column"
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        position="relative"
        borderLeft="4px solid"
        borderLeftColor={getColorByRole(role)}>
        {/* 角色名稱 */}
        <Box
          px={4}
          py={2}
          borderBottom="1px solid"
          borderColor="gray.100"
          bg="gray.50">
          <Text fontSize="md" fontWeight="bold" color={getColorByRole(role)}>
            {role}
          </Text>
        </Box>

        {/* 對話內容 */}
        <Box px={4} py={3} position="relative">
          <Box className="markdown-content" fontSize="lg" lineHeight="1.8">
            <ReactMarkdown>{content}</ReactMarkdown>
          </Box>

          {/* 複製按鈕 */}
          <Tooltip
            label={hasCopied ? "已複製！" : "複製內容"}
            placement="top"
            hasArrow>
            <IconButton
              aria-label="Copy content"
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
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              opacity={isHovered ? 1 : 0}
              transition="opacity 0.2s"
              onClick={handleCopy}
            />
          </Tooltip>
        </Box>
      </Flex>
    </MotionBox>
  )
}
