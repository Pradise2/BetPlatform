import { http, createConfig } from 'wagmi'
import { mainnet, base } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'


export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
        
    metaMask()
    
  ],
  transports: {
    [mainnet.id]:  http("https://base-mainnet.g.alchemy.com/v2/23jsJTJNwRJR6RJBcO6NCcgBuK01TNdX"),
    [base.id]:  http("https://base-mainnet.g.alchemy.com/v2/23jsJTJNwRJR6RJBcO6NCcgBuK01TNdX"),
  },
})