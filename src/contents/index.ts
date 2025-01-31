import type { PlasmoCSConfig } from "plasmo"
import React from "react"
import { createRoot } from "react-dom/client"

import { Sidebar } from "~components/Sidebar"
import { extractMainContent, isValidContent } from "~utils/content"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 建立側邊欄容器
let sidebarRoot: ReturnType<typeof createRoot> | null = null
let sidebarContainer: HTMLDivElement | null = null
let isOpen = false

function toggleSidebar() {
  if (!sidebarContainer) {
    sidebarContainer = document.createElement("div")
    document.body.appendChild(sidebarContainer)
    sidebarRoot = createRoot(sidebarContainer)
  }

  isOpen = !isOpen
  sidebarRoot.render(
    React.createElement(Sidebar, {
      isOpen,
      onClose: () => {
        isOpen = false
        sidebarRoot.render(React.createElement(Sidebar, { isOpen: false }))
      }
    })
  )
}

// 監聽來自 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TOGGLE_SIDEBAR") {
    toggleSidebar()
    sendResponse({ success: true })
    return
  }

  if (request.type === "EXTRACT_CONTENT") {
    try {
      console.log("開始提取內容...")
      const content = extractMainContent(document)
      console.log("提取完成，內容長度:", content?.length || 0)

      if (!content) {
        console.error("提取的內容為空")
        sendResponse({ error: "無法提取網頁內容" })
        return
      }

      if (!isValidContent(content)) {
        console.error("內容長度不符合要求")
        sendResponse({ error: "內容長度不符合要求（需介於 100-10000 字之間）" })
        return
      }

      console.log("開始發送內容到背景處理...")
      // 使用 background service worker 處理
      chrome.runtime.sendMessage(
        {
          type: "CONVERT_CONTENT",
          content
        },
        (response) => {
          console.log("收到背景處理回應:", response)
          sendResponse(response)
        }
      )

      return true // 表示會異步發送回應
    } catch (error) {
      console.error("提取內容時發生錯誤:", error)
      sendResponse({ error: `提取內容時發生錯誤: ${error.message}` })
      return
    }
  }
})
