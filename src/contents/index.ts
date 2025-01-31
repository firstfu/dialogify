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
