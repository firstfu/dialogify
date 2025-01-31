import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  useDisclosure,
  useToast
} from "@chakra-ui/react"
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
        bg="white"
        boxShadow="lg"
        zIndex={999999}
        transform={`translateX(${_isOpen ? "0" : "100%"})`}
        transition="transform 0.3s ease-in-out"
        borderLeft="1px solid"
        borderColor="gray.200">
        {dialogResult ? (
          <DialogView
            roles={dialogResult.roles}
            messages={dialogResult.dialogues}
            onClose={() => setDialogResult(null)}
            onRetry={handleRetry}
          />
        ) : (
          <Container p={4} height="100%">
            <Flex direction="column" gap={4} height="100%">
              <Flex justify="space-between" align="center">
                <Heading size="md">Dialogify</Heading>
                <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
              </Flex>

              <Button
                colorScheme="blue"
                onClick={handleConvert}
                isDisabled={isProcessing}
                width="100%">
                {isProcessing ? <Spinner size="sm" mr={2} /> : null}
                {isProcessing ? "轉換中..." : "開始轉換"}
              </Button>
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
