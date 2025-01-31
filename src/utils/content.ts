export const extractMainContent = (document: Document): string => {
  try {
    console.log("開始提取內容...")

    // 克隆 document 以避免修改原始頁面
    const docClone = document.cloneNode(true) as Document

    // 在克隆的文檔上進行操作
    const elementsToRemove = docClone.querySelectorAll(
      "script, style, header, footer, nav, aside, iframe, .ad, .advertisement, .social-share"
    )
    console.log("要移除的元素數量:", elementsToRemove.length)
    elementsToRemove.forEach((el) => el.remove())

    // 尋找主要內容區域
    const possibleContentSelectors = [
      "article",
      '[role="main"]',
      ".post-content",
      ".article-content",
      ".entry-content",
      ".content",
      "main",
      "#content",
      "#main",
      ".main",
      // 增加更多常見的內容選擇器
      ".article",
      ".post",
      "#article",
      "#post",
      ".story-content",
      ".story",
      ".news-content",
      ".news-article"
    ]

    let mainContent: Element | null = null
    let maxTextLength = 0
    let selectedSelector = ""

    // 尋找包含最多文字內容的元素
    for (const selector of possibleContentSelectors) {
      const elements = docClone.querySelectorAll(selector)
      console.log(`選擇器 "${selector}" 找到 ${elements.length} 個元素`)

      elements.forEach((element) => {
        const textLength = (element.textContent || "").length
        console.log(`- 元素文字長度: ${textLength}`)
        if (textLength > maxTextLength) {
          maxTextLength = textLength
          mainContent = element
          selectedSelector = selector
        }
      })
    }

    console.log("最終選擇的選擇器:", selectedSelector)
    console.log("最大文字長度:", maxTextLength)

    // 如果找不到特定容器，使用 body
    if (!mainContent) {
      console.log("找不到特定容器，使用 body")
      mainContent = docClone.body
    }

    // 提取純文字內容
    const textContent = mainContent.textContent || ""
    console.log("提取的原始內容長度:", textContent.length)
    console.log("提取的原始內容片段:", textContent.slice(0, 200) + "...")

    // 如果內容為空，拋出錯誤
    if (!textContent.trim()) {
      throw new Error("無法提取有效的內容")
    }

    // 清理文字內容
    const cleanedText = cleanText(textContent)
    console.log("清理後的內容長度:", cleanedText.length)
    console.log("清理後的內容片段:", cleanedText.slice(0, 200) + "...")

    return cleanedText
  } catch (error) {
    console.error("提取內容時發生錯誤:", error)
    return ""
  }
}

const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, " ") // 將多個空白字符替換為單個空格
    .replace(/\n+/g, "\n") // 將多個換行符替換為單個換行符
    .replace(/\t+/g, " ") // 將 tab 替換為空格
    .trim() // 移除首尾空白
}

export const isValidContent = (content: string): boolean => {
  if (!content) {
    console.log("內容為空")
    return false
  }

  const minLength = 100 // 最小字數限制
  const maxLength = 10000 // 最大字數限制
  const cleanedContent = content.trim()

  console.log("驗證內容長度:", cleanedContent.length)
  console.log(
    "內容是否有效:",
    cleanedContent.length >= minLength && cleanedContent.length <= maxLength
  )

  return (
    cleanedContent.length >= minLength && cleanedContent.length <= maxLength
  )
}
