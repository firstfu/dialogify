import { convertToDialog } from "~utils/openai"

// 監聽來自內容腳本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CONVERT_CONTENT") {
    convertToDialog(request.content)
      .then((result) => {
        sendResponse(result)
      })
      .catch((error) => {
        sendResponse({ error: error.message })
      })

    return true // 表示會異步發送回應
  }
})
