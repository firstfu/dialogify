export const extractMainContent = (document: Document): string => {
  try {
    console.log("開始提取內容...")

    // 克隆 document 以避免修改原始頁面
    const docClone = document.cloneNode(true) as Document

    // 在克隆的文檔上進行操作，但保留 pre 和 code 元素
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

    // 處理圖片
    const images = mainContent.querySelectorAll("img")
    images.forEach((img) => {
      const alt = img.getAttribute("alt") || "圖片"
      const src = img.getAttribute("src") || ""
      const markdown = `\n![${alt}](${src})\n`
      img.replaceWith(docClone.createTextNode(markdown))
    })

    // 處理程式碼區塊
    const codeBlocks = mainContent.querySelectorAll("pre, code")
    codeBlocks.forEach((block) => {
      const language = block.className.match(/language-(\w+)/)?.[1] || ""
      const code = block.textContent || ""
      const markdown = `\n\`\`\`${language}\n${code}\n\`\`\`\n`
      block.replaceWith(docClone.createTextNode(markdown))
    })

    // 提取內容
    const textContent = mainContent.textContent || ""

    // 如果內容為空，拋出錯誤
    if (!textContent.trim()) {
      throw new Error("無法提取有效的內容")
    }

    // 清理文字內容
    const cleanedText = cleanText(textContent)
    console.log("清理後的內容長度:", cleanedText.length)

    // 驗證內容
    if (!isValidContent(cleanedText)) {
      console.log("內容驗證失敗，原始內容片段:", cleanedText.slice(0, 200))
      throw new Error("提取的內容未通過驗證")
    }

    // 只在 console.log 中截斷內容，實際返回完整內容
    console.log(
      "清理後的內容片段(僅供預覽):",
      cleanedText.slice(0, 200) + "..."
    )

    return cleanedText
  } catch (error) {
    console.error("提取內容時發生錯誤:", error)
    return ""
  }
}

const cleanText = (text: string): string => {
  return text
    .replace(/\s*\n\s*/g, "\n") // 保留單個換行符，移除換行符周圍的空白
    .replace(/\n{3,}/g, "\n\n") // 將連續3個以上換行符替換為2個
    .replace(/[ \t]+/g, " ") // 將連續空格和tab替換為單個空格
    .trim() // 移除首尾空白
}

export const isValidContent = (content: string): boolean => {
  if (!content) {
    console.log("內容為空")
    return false
  }

  const minLength = 50 // 降低最小字數限制
  const maxLength = 50000 // 提高最大字數限制
  const cleanedContent = content.trim()
  const contentLength = cleanedContent.length

  // 增加更詳細的日誌
  console.log({
    contentLength,
    minLength,
    maxLength,
    tooShort: contentLength < minLength,
    tooLong: contentLength > maxLength,
    sampleContent: cleanedContent.slice(0, 100) + "..."
  })

  const isValid = contentLength >= minLength && contentLength <= maxLength

  if (!isValid) {
    console.log(
      `內容長度驗證失敗: ${contentLength} 字元 (需介於 ${minLength}-${maxLength} 字元之間)`
    )
  }

  return isValid
}
