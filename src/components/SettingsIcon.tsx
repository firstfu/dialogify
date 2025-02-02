import { FiSettings } from "react-icons/fi"

interface SettingsIconProps {
  onClick: () => void
}

export const SettingsIcon = ({ onClick }: SettingsIconProps) => {
  return (
    <button
      className="widget-settings-button"
      aria-label="設定"
      onClick={onClick}>
      <FiSettings size={20} />
    </button>
  )
}
