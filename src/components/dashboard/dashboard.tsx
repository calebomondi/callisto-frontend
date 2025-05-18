import { useAccount } from 'wagmi';
import { useEffect, useState } from "react";
import ConnectedNavbar from "../navbar/connectednavbar";
import { DashboardData } from '@/types/index.types';
import apiService from '@/backendServices/apiservices';
import UserVaultDashboard from './userdashboard';
import { mockDashboardData } from './mockplatformdata';
import Skeletun from '../skeletons/skeleton';
import { currentChainId, getWalletClient } from '@/blockchain-services/useFvkry';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(false)
  const [dashData, setDashData] = useState<DashboardData | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if (isConnected) {
        try {
          //from ls
          const cachedData = localStorage.getItem('dashboard_data')
          if(cachedData) {
            setDashData(JSON.parse(cachedData))
            setLoading(false)
          }
          
          //from get vaults contract
          const chainId = currentChainId()
          const chainInfo = await apiService.getChainData(chainId);
          const user = await getWalletClient();

          const vaults = await apiService.getUserVaults(chainId, user.address, chainInfo.lockAsset)
          if (vaults && vaults.length > 0) {
            localStorage.setItem('vault_data', JSON.stringify(vaults))
            const dashboardData = await apiService.dashboardData(vaults)
            localStorage.setItem('dashboard_data', JSON.stringify(dashboardData))
            setDashData(dashboardData)
          } else if (vaults && vaults.length === 0) {
            localStorage.removeItem('vault_data')
            setDashData(mockDashboardData)
          }

        } catch (error) {
          console.error("Error fetching wallet data:", error);
        } finally {
          setLoading(false)
        }
      } else {
        setDashData(mockDashboardData)
        setLoading(false)
        localStorage.removeItem('dashboard_data')
      }
    }

    fetchData()
  }, [isConnected])

  if (loading) {
    return (
      <>
        <ConnectedNavbar />
        <Skeletun />
      </>
    )
  }

  return (
    <div className="">
      <ConnectedNavbar />
      <p className={`text-center my-2 text-amber-600 ${isConnected ? 'hidden' : ''}`}>
        Connect your wallet to view your asset lock analytics
      </p>
      {dashData && <UserVaultDashboard data={dashData} />}
    </div>
  )
}