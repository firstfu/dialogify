import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack
} from "@chakra-ui/react"
import heroIllustration from "data-text:~assets/hero-illustration.svg"
import { motion } from "framer-motion"
import type { FC } from "react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { ChakraProvider } from "./ChakraProvider"
import { DialogView, type DialogMessage } from "./DialogView"
import { Settings } from "./Settings"
import { SettingsIcon } from "./SettingsIcon"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface DialogResult {
  roles: string[]
  dialogues: DialogMessage[]
}

const storage = new Storage()

const settingsIconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 180 },
  tap: { scale: 0.95 }
}

export const Sidebar: FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { isOpen: _isOpen, onClose: _onClose } = useDisclosure({
    isOpen,
    onClose,
    defaultIsOpen: isOpen
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [dialogResult, setDialogResult] = useState<DialogResult | null>(null)
  const toast = useToast()

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        _onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [_onClose])

  useEffect(() => {
    // 載入 API Key
    storage.get("openai_api_key").then((key) => {
      if (key) {
        setApiKey(key)
      }
    })
  }, [])

  // 轉換對話格式
  const transformDialogues = (
    dialogues: Record<string, string>[]
  ): DialogMessage[] => {
    return dialogues.map((dialog) => {
      const [role, content] = Object.entries(dialog)[0]
      return { role, content: content as string }
    })
  }

  const handleConvert = async () => {
    if (!apiKey) {
      toast({
        title: "請先設定 OpenAI API Key",
        status: "error",
        duration: 3000
      })
      setIsSettingsOpen(true)
      return
    }

    setIsProcessing(true)
    setDialogResult(null)

    try {
      console.log("開始提取內容...")
      // 直接向 content script 請求提取內容
      const extractResponse = await chrome.runtime.sendMessage({
        type: "EXTRACT_CONTENT"
      })

      console.log("提取內容回應:", extractResponse)
      if (extractResponse.error) {
        throw new Error(extractResponse.error)
      }

      // 如果 extractResponse 已經是轉換後的結果，直接使用
      if (extractResponse.roles && extractResponse.dialogues) {
        console.log("收到已轉換的對話結果")
        const transformedResult = {
          roles: extractResponse.roles,
          dialogues: transformDialogues(extractResponse.dialogues)
        }
        console.log("轉換後的對話結果:", transformedResult)
        setDialogResult(transformedResult)
      } else {
        console.log("開始轉換內容...")
        // 使用提取的內容進行轉換
        const response = await chrome.runtime.sendMessage({
          type: "CONVERT_CONTENT",
          content: extractResponse
        })

        console.log("轉換內容回應:", response)
        if (response.error) {
          throw new Error(response.error)
        }

        // 處理對話結果
        const transformedResult = {
          roles: response.roles,
          dialogues: transformDialogues(response.dialogues)
        }
        console.log("轉換後的對話結果:", transformedResult)
        setDialogResult(transformedResult)
      }

      console.log("設置對話結果完成")

      toast({
        title: "轉換成功",
        status: "success",
        duration: 3000
      })
    } catch (error) {
      console.error("轉換過程錯誤:", error)
      toast({
        title: "轉換失敗",
        description: error.message,
        status: "error",
        duration: 3000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    setDialogResult(null)
    handleConvert()
  }

  if (!_isOpen) return null

  return (
    <ChakraProvider>
      <Box
        position="fixed"
        top={0}
        right={0}
        width="400px"
        height="100vh"
        bgGradient="linear(to-b, blue.50, white, blue.50)"
        boxShadow="2xl"
        zIndex={999999}
        transform={`translateX(${_isOpen ? "0" : "100%"})`}
        transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        backdropFilter="blur(10px)"
        opacity={0.98}
        borderLeft="1px solid"
        borderColor="gray.100">
        {dialogResult ? (
          <DialogView
            roles={dialogResult.roles}
            messages={dialogResult.dialogues}
            onClose={() => setDialogResult(null)}
            onRetry={handleRetry}
          />
        ) : (
          <Container p={8} height="100%" maxW="container.sm">
            <Flex direction="column" gap={6} height="100%">
              <Box
                as={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: "0.5s" }}>
                <Flex
                  justify="space-between"
                  align="center"
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  boxShadow="md"
                  _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease">
                  <Heading
                    size="lg"
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    bgClip="text"
                    letterSpacing="tight">
                    Dialogify
                  </Heading>
                  <Box
                    as={motion.div}
                    variants={settingsIconVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap">
                    <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
                  </Box>
                </Flex>
              </Box>

              <Flex
                direction="column"
                flex={1}
                justify="center"
                align="center"
                gap={4}
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: "0.2s" }}>
                <Box position="relative" width="200px" height="200px" mb={4}>
                  <div dangerouslySetInnerHTML={{ __html: heroIllustration }} />
                </Box>

                <VStack spacing={3} mb={6}>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    textAlign="center"
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    bgClip="text">
                    智能對話轉換器
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    textAlign="center"
                    maxW="280px">
                    輕鬆將網頁內容轉換成生動的對話形式， 讓閱讀更有趣、更易理解
                  </Text>
                </VStack>

                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={handleConvert}
                  isDisabled={isProcessing}
                  width="100%"
                  height="70px"
                  fontSize="xl"
                  boxShadow="lg"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "2xl",
                    bgGradient: "linear(to-r, blue.500, purple.600)"
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "md"
                  }}
                  transition="all 0.3s ease-in-out">
                  {isProcessing ? (
                    <Flex align="center" justify="center">
                      <Spinner size="sm" mr={3} />
                      <Text>轉換進行中...</Text>
                    </Flex>
                  ) : (
                    "開始轉換對話"
                  )}
                </Button>

                {!isProcessing && (
                  <Text
                    color="gray.500"
                    fontSize="sm"
                    textAlign="center"
                    mt={4}
                    fontWeight="medium"
                    letterSpacing="wide"
                    as={motion.p}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}>
                    點擊上方按鈕開始轉換對話內容
                  </Text>
                )}
              </Flex>
            </Flex>
          </Container>
        )}

        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Box>
    </ChakraProvider>
  )
}
