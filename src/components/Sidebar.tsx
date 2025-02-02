import "../styles/sidebar.css"

import type { FC } from "react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

// @ts-ignore
import heroIllustrationUrl from "../assets/hero-illustration.svg"
import { DialogView, type DialogMessage } from "./DialogView"
import { Settings } from "./Settings"
import { SettingsIcon } from "./SettingsIcon"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface DialogResult {
  roles: string[]
  dialogues: DialogMessage[]
}

const storage = new Storage()

export const Sidebar: FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [dialogResult, setDialogResult] = useState<DialogResult | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(isOpen)

  useEffect(() => {
    setSidebarOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  useEffect(() => {
    storage.get("openai_api_key").then((key) => {
      if (key) {
        setApiKey(key)
      }
    })
  }, [])

  const transformDialogues = (
    dialogues: Record<string, string>[]
  ): DialogMessage[] => {
    return dialogues.map((dialog) => {
      const [role, content] = Object.entries(dialog)[0]
      return { role, content: content as string }
    })
  }

  const showToast = (message: string, type: "success" | "error") => {
    // 這裡可以實現一個簡單的toast通知
    alert(message)
  }

  const handleConvert = async () => {
    if (!apiKey) {
      showToast("請先設定 OpenAI API Key", "error")
      setIsSettingsOpen(true)
      return
    }

    setIsProcessing(true)
    setDialogResult(null)

    try {
      console.log("開始提取內容...")
      const extractResponse = await chrome.runtime.sendMessage({
        type: "EXTRACT_CONTENT"
      })

      console.log("提取內容回應:", extractResponse)
      if (extractResponse.error) {
        throw new Error(extractResponse.error)
      }

      if (extractResponse.roles && extractResponse.dialogues) {
        console.log("收到已轉換的對話結果")
        const transformedResult = {
          roles: extractResponse.roles,
          dialogues: transformDialogues(extractResponse.dialogues)
        }
        console.log("轉換後的對話結果:", transformedResult)
        setDialogResult(transformedResult)
      } else {
        console.log("開始轉換內容...")
        const response = await chrome.runtime.sendMessage({
          type: "CONVERT_CONTENT",
          content: extractResponse
        })

        console.log("轉換內容回應:", response)
        if (response.error) {
          throw new Error(response.error)
        }

        const transformedResult = {
          roles: response.roles,
          dialogues: transformDialogues(response.dialogues)
        }
        console.log("轉換後的對話結果:", transformedResult)
        setDialogResult(transformedResult)
      }

      console.log("設置對話結果完成")
      showToast("轉換成功", "success")
    } catch (error) {
      console.error("轉換過程錯誤:", error)
      showToast(
        `轉換失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
        "error"
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    setDialogResult(null)
    handleConvert()
  }

  if (!sidebarOpen) return null

  return (
    <div
      className={`widget-sidebar ${!sidebarOpen ? "widget-sidebar--closed" : ""}`}>
      {dialogResult ? (
        <DialogView
          roles={dialogResult.roles}
          messages={dialogResult.dialogues}
          onClose={() => setDialogResult(null)}
          onRetry={handleRetry}
        />
      ) : (
        <div className="widget-container">
          <div className="widget-content">
            <div className="widget-header widget-slide-in">
              <div className="widget-header__title">Dialogify</div>
              <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
            </div>

            <div className="widget-flex widget-flex-col widget-flex-1 widget-items-center widget-justify-center widget-gap-4 widget-fade-in">
              <div className="widget-illustration-container">
                <img
                  src={heroIllustrationUrl}
                  alt="Hero Illustration"
                  className="widget-illustration"
                />
              </div>

              <div className="widget-text-center">
                <h2 className="widget-header__title widget-text-lg">
                  智能對話轉換器
                </h2>
                <p className="widget-text-sm widget-text-gray widget-mt-4">
                  輕鬆將網頁內容轉換成生動的對話形式， 讓閱讀更有趣、更易理解
                </p>
              </div>

              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="widget-convert-button">
                {isProcessing ? (
                  <div className="widget-flex widget-items-center widget-justify-center">
                    <div className="widget-loading-spinner" />
                    <span style={{ marginLeft: "0.75rem" }}>轉換進行中...</span>
                  </div>
                ) : (
                  "開始轉換對話"
                )}
              </button>

              {!isProcessing && (
                <p className="widget-text-sm widget-text-gray widget-mt-4 widget-font-medium widget-letter-wide widget-fade-in">
                  點擊上方按鈕開始轉換對話內容
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
