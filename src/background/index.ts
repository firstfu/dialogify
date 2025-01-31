import { Storage } from "@plasmohq/storage"

import { convertToDialog } from "~utils/openai"

const storage = new Storage()

// 處理擴充功能圖示點擊事件
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return

  // 向 content script 發送開關側邊欄的消息
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" })
})

// 監聽來自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "EXTRACT_CONTENT") {
    // 獲取當前活動的分頁
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) {
        sendResponse({ error: "無法取得當前分頁" })
        return
      }

      // 向 content script 請求提取內容
      chrome.tabs.sendMessage(
        tab.id,
        { type: "EXTRACT_CONTENT" },
        (response) => {
          console.log("從 content script 收到的回應:", response)
          if (response && response.roles && response.dialogues) {
            // 如果已經是轉換後的結果，直接傳回
            sendResponse(response)
          } else {
            // 否則傳回提取的內容
            sendResponse(response)
          }
        }
      )
    })
    return true
  }

  if (request.type === "CONVERT_CONTENT") {
    console.log("收到轉換內容請求", request)

    if (!request.content) {
      console.error("請求中沒有內容")
      sendResponse({ error: "無法提取網頁內容" })
      return true
    }

    console.log("內容長度:", request.content.length)
    console.log("內容片段:", request.content.slice(0, 200) + "...")

    handleContentConversion(request.content)
      .then((response) => {
        console.log("轉換成功:", response)
        sendResponse(response)
      })
      .catch((error) => {
        console.error("轉換失敗:", error)
        sendResponse({ error: error.message })
      })
    return true
  }
})

async function handleContentConversion(content: string) {
  console.log("開始處理內容轉換...")

  const apiKey = await storage.get("openai_api_key")
  if (!apiKey) {
    throw new Error("請先設定 OpenAI API Key")
  }

  return await convertToDialog(content)
}
