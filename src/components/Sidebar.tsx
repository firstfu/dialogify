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
    onClose
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
      // 直接使用當前頁面的內容
      const response = await chrome.runtime.sendMessage({
        type: "CONVERT_CONTENT"
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // 處理對話結果
      setDialogResult(response)

      toast({
        title: "轉換成功",
        status: "success",
        duration: 3000
      })
    } catch (error) {
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
