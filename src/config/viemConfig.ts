import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'


export const config = createConfig({
  chains: [ base],
  connectors: [
        
    metaMask()
    
  ],
  transports: {
   
    [base.id]:  http("https://base-mainnet.g.alchemy.com/v2/23jsJTJNwRJR6RJBcO6NCcgBuK01TNdX"),
  },
})