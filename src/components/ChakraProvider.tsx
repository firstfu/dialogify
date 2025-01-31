import { ChakraProvider as ChakraUIProvider } from "@chakra-ui/react"
import { type PropsWithChildren } from "react"

export const ChakraProvider = ({ children }: PropsWithChildren) => {
  return <ChakraUIProvider>{children}</ChakraUIProvider>
}

export default ChakraProvider
