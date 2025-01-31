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

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `你是一個專業的內容轉換助手，負責將文章內容轉換為生動的對話形式。
          請遵循以下規則：
          1. 識別文章的主要觀點和關鍵信息
          2. 選擇適合的角色（如教授、學生、記者等）
          3. 以對話形式呈現內容，保持原意的完整性
          4. 使對話生動有趣，但不失專業性
          5. 回傳格式為 JSON 字串，包含 roles（角色列表）和 dialogues（對話內容）
          `
        },
        {
          role: "user",
          content: `請將以下內容轉換為對話形式：\n\n${content}`
        }
      ],
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error("Error converting content to dialog:", error)
    throw error
  }
}
