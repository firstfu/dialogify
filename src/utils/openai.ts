import OpenAI from "openai"

import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const getOpenAIInstance = async () => {
  const apiKey = await storage.get("openai_api_key")
  if (!apiKey) {
    throw new Error("OpenAI API key not found")
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })
}

export const convertToDialog = async (content: string) => {
  const openai = await getOpenAIInstance()
  const model = (await storage.get("openai_model")) || "gpt-4"

  // 預處理內容，標記特殊元素
  const processedContent = content
    .replace(
      /```([\s\S]*?)```/g,
      (match, code) => `[CODE_BLOCK]${code}[/CODE_BLOCK]`
    )
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      (match, alt, src) => `[IMAGE alt="${alt}" src="${src}"]`
    )

  console.log("送到llm內容 rs:", processedContent)

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `你是一個專業的內容轉換助手，負責將文章內容轉換為生動且富有教育意義的對話形式。

          核心原則：
          1. 對話結構與角色：
             - 根據內容主題選擇 2-3 個最適合的對話角色（例如：專家、學習者、實踐者等）
             - 確保角色之間有明確的知識層級差異，以便進行有意義的問答互動
             - 對話要有起承轉合，循序漸進地展開話題

          2. 內容處理原則：
             - 將複雜概念分解成容易理解的小單元
             - 通過提問、舉例和類比來深化理解
             - 在關鍵節點加入互動性提問或思考點
             - 適時總結重要知識點，強化記憶

          3. 格式與呈現：
             - 使用 Markdown 語法提升可讀性：
               * 程式碼：\`\`\`language\\n code \`\`\`
               * 圖片：![alt](src)
               * 重要概念：**bold** 或 *italic*
             - 保持對話自然流暢，避免生硬的知識灌輸
             - 適當使用表情符號增加親和力

          4. 回傳格式（JSON）：
          {
            "roles": ["實際使用的角色列表"],
            "dialogues": [
              {
                "role": "角色名稱",
                "content": "包含 Markdown 的對話內容"
              }
            ]
          }
          `
        },
        {
          role: "user",
          content: `請將以下內容轉換為對話形式：\n\n${processedContent}`
        }
      ],
      response_format: { type: "json_object" }
    })

    if (!response.choices[0].message.content) {
      throw new Error("OpenAI API 回傳的內容為空")
    }

    let rs = JSON.parse(response.choices[0].message.content)

    console.log("生成結果 rs:", rs)

    return rs
  } catch (error) {
    console.error("Error converting content to dialog:", error)
    throw error
  }
}
