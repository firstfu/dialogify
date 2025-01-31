export const extractMainContent = (document: Document): string => {
  // 移除不需要的元素
  const elementsToRemove = document.querySelectorAll(
    "script, style, header, footer, nav, aside, iframe, .ad, .advertisement, .social-share"
  )
  elementsToRemove.forEach((el) => el.remove())

  // 尋找主要內容區域
  const possibleContentSelectors = [
    "article",
    '[role="main"]',
    ".post-content",
    ".article-content",
    ".entry-content",
    ".content",
    "main"
  ]

  let mainContent: Element | null = null

  // 尋找最可能的主要內容容器
  for (const selector of possibleContentSelectors) {
    const element = document.querySelector(selector)
    if (element) {
      mainContent = element
      break
    }
  }

  // 如果找不到特定容器，使用 body
  if (!mainContent) {
    mainContent = document.body
  }

  // 提取純文字內容
  const textContent = mainContent.textContent || ""

  // 清理文字內容
  return cleanText(textContent)
}

const cleanText = (text: string): string => {
  return text
    .replace(/\\s+/g, " ") // 將多個空白字符替換為單個空格
    .replace(/\\n+/g, "\\n") // 將多個換行符替換為單個換行符
    .trim() // 移除首尾空白
}

export const isValidContent = (content: string): boolean => {
  const minLength = 100 // 最小字數限制
  const maxLength = 10000 // 最大字數限制

  return content.length >= minLength && content.length <= maxLength
}
