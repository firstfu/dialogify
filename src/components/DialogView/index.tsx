import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Tag,
  TagLabel,
  Text
} from "@chakra-ui/react"
import { type ReactNode } from "react"

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
  return (
    <Flex direction="column" h="100%" overflow="hidden">
      {/* Header */}
      <Box p={3} borderBottom="1px solid" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm">對話結果</Heading>
          <Button size="sm" onClick={onClose}>
            返回
          </Button>
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
      <Box flex={1} overflowY="auto" p={3}>
        {messages.map((message, index) => (
          <Box
            key={index}
            mb={3}
            p={3}
            bg="gray.50"
            borderRadius="md"
            borderLeft="4px solid"
            borderLeftColor="blue.500">
            <Text fontSize="sm" color="gray.600" mb={1}>
              {message.role}
            </Text>
            <Text>{message.content}</Text>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box p={3} borderTop="1px solid" borderColor="gray.200">
        <Button size="sm" width="100%" onClick={onRetry}>
          重新轉換
        </Button>
      </Box>
    </Flex>
  )
}

export default DialogView
