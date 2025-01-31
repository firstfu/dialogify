import { ChakraProvider as ChakraUIProvider } from "@chakra-ui/react"
import { type PropsWithChildren } from "react"

import "~styles/markdown.css"

export const ChakraProvider = ({ children }: PropsWithChildren) => {
  return <ChakraUIProvider>{children}</ChakraUIProvider>
}

export default ChakraProvider
