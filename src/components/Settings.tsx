import "../styles/settings.css"

import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

const storage = new Storage()

// OpenAI 模型列表
const OPENAI_MODELS = [
  // GPT-4o 系列
  { value: "gpt-4o", label: "GPT-4o (多功能旗艦模型)" },
  { value: "gpt-4o-2024-08-06", label: "GPT-4o (2024-08-06)" },
  { value: "gpt-4o-2024-11-20", label: "GPT-4o (2024-11-20)" },
  { value: "gpt-4o-2024-05-13", label: "GPT-4o (2024-05-13)" },
  { value: "chatgpt-4o-latest", label: "ChatGPT-4o (最新版本)" },

  // GPT-4o mini 系列
  { value: "gpt-4o-mini", label: "GPT-4o Mini (快速經濟型)" },
  { value: "gpt-4o-mini-2024-07-18", label: "GPT-4o Mini (2024-07-18)" },

  // o1 系列
  { value: "o1", label: "o1 (進階推理模型)" },
  { value: "o1-2024-12-17", label: "o1 (2024-12-17)" },
  { value: "o1-mini", label: "o1 Mini (快速推理模型)" },
  { value: "o1-mini-2024-09-12", label: "o1 Mini (2024-09-12)" },
  { value: "o1-preview", label: "o1 Preview" },
  { value: "o1-preview-2024-09-12", label: "o1 Preview (2024-09-12)" },

  // GPT-4o Realtime 系列
  { value: "gpt-4o-realtime-preview", label: "GPT-4o Realtime Preview" },
  {
    value: "gpt-4o-realtime-preview-2024-12-17",
    label: "GPT-4o Realtime (2024-12-17)"
  },
  {
    value: "gpt-4o-mini-realtime-preview",
    label: "GPT-4o Mini Realtime Preview"
  },
  {
    value: "gpt-4o-mini-realtime-preview-2024-12-17",
    label: "GPT-4o Mini Realtime (2024-12-17)"
  },

  // GPT-4o Audio 系列
  { value: "gpt-4o-audio-preview", label: "GPT-4o Audio Preview" },
  {
    value: "gpt-4o-audio-preview-2024-12-17",
    label: "GPT-4o Audio (2024-12-17)"
  },
  { value: "gpt-4o-mini-audio-preview", label: "GPT-4o Mini Audio Preview" },
  {
    value: "gpt-4o-mini-audio-preview-2024-12-17",
    label: "GPT-4o Mini Audio (2024-12-17)"
  },

  // GPT-4 Turbo 系列
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4-turbo-2024-04-09", label: "GPT-4 Turbo (2024-04-09)" },
  { value: "gpt-4-turbo-preview", label: "GPT-4 Turbo Preview" },
  { value: "gpt-4-0125-preview", label: "GPT-4 (0125 Preview)" },
  { value: "gpt-4-1106-preview", label: "GPT-4 (1106 Preview)" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-0613", label: "GPT-4 (0613)" },

  // GPT-3.5 Turbo 系列
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-3.5-turbo-0125", label: "GPT-3.5 Turbo (0125)" },
  { value: "gpt-3.5-turbo-1106", label: "GPT-3.5 Turbo (1106)" }
]

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")

  useEffect(() => {
    // 載入設定
    storage.get("openai_api_key").then((key) => {
      if (key) setApiKey(key)
    })
    storage.get("openai_model").then((model) => {
      if (model) setSelectedModel(model)
    })
  }, [])

  const handleSave = () => {
    storage.set("openai_api_key", apiKey)
    storage.set("openai_model", selectedModel)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="widget-modal-overlay widget-fade-in" onClick={onClose}>
      <div className="widget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="widget-modal-header">
          設定
          <button
            className="widget-modal-close"
            onClick={onClose}
            aria-label="關閉"></button>
        </div>

        <div className="widget-modal-body">
          <div className="widget-form-control">
            <label className="widget-form-label">OpenAI API Key</label>
            <input
              className="widget-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="widget-form-control">
            <label className="widget-form-label">選擇模型</label>
            <select
              className="widget-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}>
              {OPENAI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="widget-modal-footer">
          <button
            className="widget-button widget-button-primary"
            onClick={handleSave}>
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
