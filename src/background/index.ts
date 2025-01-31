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
  if (request.type === "CONVERT_CONTENT") {
    handleContentConversion(request.content)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }))
    return true
  }
})

async function handleContentConversion(content: string) {
  const apiKey = await storage.get("openai_api_key")
  if (!apiKey) {
    throw new Error("請先設定 OpenAI API Key")
  }

  return await convertToDialog(content)
}
