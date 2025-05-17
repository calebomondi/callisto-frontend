import { useEffect, useState } from "react"
import { useAccount } from 'wagmi'
import ConnectedNavbar from "../navbar/connectednavbar"
import { VaultData } from "@/types/index.types"
import VaultGrid from "./vaultgrid"
import { mockVaultsData } from "./mockplatformdata"
import Skeletun from "../skeletons/skeleton"
import apiService from "@/backendServices/apiservices"
import { currentChainId, getWalletClient } from "@/blockchain-services/useFvkry"
import { useLocation } from "react-router-dom"

export default function SubVaultsContainer() {
  const location = useLocation()

  const [vaultData, setVaultData] = useState<VaultData[]>([])
  const [loading, setLoading] = useState(false)
  const [chainData, setChainData] = useState<{
    chainId: number,
    lockAsset: `0x${string}`
  }>({
    chainId: 0,
    lockAsset: '0x..'
  })
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useAccount()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if(isConnected) {
        try {
          //from ls
          const cachedData = localStorage.getItem('vault_data')
          if(cachedData) {
            setVaultData(JSON.parse(cachedData))
            setLoading(false)
          }
          //
          const chainId = currentChainId()
          const chainInfo = await apiService.getChainData(chainId);
          const user = await getWalletClient();

          const vaults = await apiService.getUserVaults(chainId, user.address, chainInfo.lockAsset)
          if (vaults && vaults.length > 0) {
            setVaultData(vaults)
            localStorage.setItem('vault_data', JSON.stringify(vaults))
            setChainData({
              chainId: chainId,
              lockAsset: chainInfo.lockAsset
            })
          }

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
        } finally {
          setLoading(false)
        }
      } else {
        // If not connected, show mock or public data
        setVaultData(mockVaultsData)
        setLoading(false)
        localStorage.removeItem('vault_data')
      }
    }

    fetchData()
  }, [location])

  const renderContent = () => {
    if (loading) {
      return <Skeletun />
    }

    if (error) {
      return <p className="text-center text-red-500">Error: {error}</p>
    }

    return (
      <>
        <p className={`text-center my-4 text-amber-600 ${isConnected ? 'hidden' : ''}`}>
          Connect your wallet to interact with your vaults
        </p>
        <VaultGrid vaultData={vaultData} />
      </>
    )
  }

  return (
    <>
      <ConnectedNavbar />
      <div className="container mx-auto">
        {renderContent()}
      </div>
    </>
  )
}