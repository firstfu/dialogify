import type { PlasmoCSConfig } from "plasmo"

import { extractMainContent, isValidContent } from "~utils/content"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 監聽來自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "EXTRACT_CONTENT") {
    const content = extractMainContent(document)

    if (!isValidContent(content)) {
      sendResponse({ error: "內容長度不符合要求" })
      return
    }

    // 使用 background service worker 處理
    chrome.runtime.sendMessage(
      {
        type: "CONVERT_CONTENT",
        content
      },
      (response) => {
        sendResponse(response)
      }
    )

    return true // 表示會異步發送回應
  }
})
