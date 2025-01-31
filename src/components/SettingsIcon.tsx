import { IconButton } from "@chakra-ui/react"
import { FiSettings } from "react-icons/fi"

interface SettingsIconProps {
  onClick: () => void
}

export const SettingsIcon = ({ onClick }: SettingsIconProps) => {
  return (
    <IconButton
      aria-label="Settings"
      icon={<FiSettings />}
      variant="ghost"
      size="sm"
      onClick={onClick}
    />
  )
}
