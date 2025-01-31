import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  useToast as useChakraToast
} from "@chakra-ui/react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { ChakraProvider } from "~components/ChakraProvider"

// 設定固定的 popup 尺寸
const POPUP_WIDTH = "400px"
const POPUP_HEIGHT = "300px"

const storage = new Storage()

function IndexPopup() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const toast = useChakraToast()

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
      return
    }

    setIsProcessing(true)

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
      const { roles, dialogues } = response

      // TODO: 顯示對話結果
      console.log("Converted result:", { roles, dialogues })

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

  return (
    <div style={{ width: POPUP_WIDTH, height: POPUP_HEIGHT }}>
      <ChakraProvider>
        <Box width="100%" height="100%" bg="white">
          <Container p={4} height="100%">
            <Flex direction="column" gap={4} height="100%">
              <Heading size="md">Dialogify</Heading>

              {!apiKey ? (
                <Box>
                  <Text mb={2}>請先設定 OpenAI API Key：</Text>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      const key = e.target.value
                      setApiKey(key)
                      storage.set("openai_api_key", key)
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "8px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "4px"
                    }}
                  />
                </Box>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={handleConvert}
                  isDisabled={isProcessing}
                  width="100%">
                  {isProcessing ? <Spinner size="sm" mr={2} /> : null}
                  {isProcessing ? "轉換中..." : "開始轉換"}
                </Button>
              )}
            </Flex>
          </Container>
        </Box>
      </ChakraProvider>
    </div>
  )
}

export default IndexPopup
