import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  useToast
} from "@chakra-ui/react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { ChakraProvider } from "~components/ChakraProvider"
import { DialogView, type DialogMessage } from "~components/DialogView"
import { Settings } from "~components/Settings"
import { SettingsIcon } from "~components/SettingsIcon"

// 設定固定的 popup 尺寸
const POPUP_WIDTH = "400px"
const POPUP_HEIGHT = "500px"

const storage = new Storage()

interface DialogResult {
  roles: string[]
  dialogues: DialogMessage[]
}

function IndexPopup() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [dialogResult, setDialogResult] = useState<DialogResult | null>(null)
  const toast = useToast()

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
      // 獲取當前分頁
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!tab.id) {
        throw new Error("無法取得當前分頁")
      }

      // 發送消息到內容腳本
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "EXTRACT_CONTENT"
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

  return (
    <div style={{ width: POPUP_WIDTH, height: POPUP_HEIGHT }}>
      <ChakraProvider>
        <Box width="100%" height="100%" bg="white">
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
    </div>
  )
}

export default IndexPopup
