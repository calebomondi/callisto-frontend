import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Filter, Settings, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, LayoutDashboard, DollarSign, BarChart3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import { VaultData } from "@/types/index.types";
import { useAccount } from "wagmi";
import apiService from "@/backendServices/apiservices";
import { currentChainId, getWalletClient } from "@/blockchain-services/useFvkry";
import { mockVaultsData } from "./mockplatformdata"

interface SidebarProps {
  onVaultSelect: (selection: { type: "overview" | "assets" | "analytics" | "vault"; vault?: VaultData }) => void;
}

const Sidebar = ({ onVaultSelect }: SidebarProps) => {
  const [selectedSection, setSelectedSection] = useState<"overview" | "assets" | "analytics" | "vault" >("analytics");
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [showVaults, setShowVaults] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation()
  
  const [vaultData, setVaultData] = useState<VaultData[]>([])
  const [loading, setLoading] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useAccount()
  
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        console.log(loading)
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
            } else if (vaults && vaults.length === 0) {
              localStorage.removeItem('vault_data')
              setVaultData(mockVaultsData)
            }
  
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
            console.log("Error", error)
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
    }, [location, isConnected])

  const statuses = ["goal", "Fixed", "schedule"];

  const filteredVaults = vaultData.filter((vault) => {
    return selectedStatus === "all" || vault.vaultType === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "goal":
        return "text-purple-500 bg-purple-500/10";
      case "Fixed":
        return "text-blue-500 bg-blue-500/10";
      case "schedule":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const handleOverviewClick = () => {
    setSelectedSection("overview");
    setSelectedVaultId(null);
    onVaultSelect({ type: "overview" });
  };

  const handleAssetsClick = () => {
    setSelectedSection("assets");
    setSelectedVaultId(null);
    onVaultSelect({ type: "assets" });
  };

  const handleVaultClick = (vault: VaultData) => {
    setSelectedSection("vault");
    setSelectedVaultId(vault.vaultId);
    onVaultSelect({ type: "vault", vault });
  };

  const handleAnalyticsClick = () => {
    setSelectedSection("analytics");
    setSelectedVaultId(null);
    onVaultSelect({ type: "analytics" });
  };

  return (
    <div className={`sticky top-0 h-screen border-r border-gray-800 shadow-md bg-gray-900/50 p-4 flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? "w-20" : "w-80"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold transition-opacity duration-300 ${isCollapsed ? "hidden" : "inline"}`}>
          Dashboard
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="mb-4 text-gray-400 hover:text-white hover:bg-gray-600 self-end"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 font-bold" /> : <ChevronLeft className="w-4 h-4 font-bold" />}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`border-gray-700 shadow-sm bg-white text-gray-500 hover:bg-white  ${isCollapsed ? "hidden" : ""}`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Status
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white hover:bg-transparent">
            <DropdownMenuItem onClick={() => setSelectedStatus("all")} className="bg-white text-gray-500 hover:bg-white">
              All Statuses
            </DropdownMenuItem>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setSelectedStatus(status)}
                className="bg-white text-gray-500 hover:bg-transparent"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-3 rounded-lg border ${
            selectedSection === "overview" ? "border-purple-500" : "border-gray-800 shadow-md hover:border-purple-500/50"
          } cursor-pointer transition-all`}
          onClick={handleOverviewClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              {!isCollapsed && <span className="font-medium">Overview</span>}
            </div>
            {!isCollapsed && (
              <button
             onClick={(e) => { e.stopPropagation(); setShowVaults(!showVaults); }}
              >
              {showVaults ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
             </button>
            )}
          </div>
        </motion.div>

        {/* Vault Submenu */}
        {showVaults &&
          filteredVaults.map((vault) => (
            <motion.div
              key={vault.vaultId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`ml-4 p-3 rounded-lg border ${
                selectedSection === "vault" && selectedVaultId === vault.vaultId
                  ? "border-purple-500"
                  : "border-gray-800 shadow-sm hover:border-purple-500/50"
              } cursor-pointer transition-all`}
              onClick={() => handleVaultClick(vault)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{vault.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vault.vaultType)}`}
                >
                  {vault.vaultType}
                </span>
              </div>
              <div className="text-xs text-gray-400">{vault.amount} {vault.symbol}</div>
            </motion.div>
          ))}

        {/* Assets Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-3 rounded-lg border ${
            selectedSection === "assets" ? "border-purple-500" : "border-gray-800 shadow-md hover:border-purple-500/50"
          } cursor-pointer transition-all`}
          onClick={handleAssetsClick}
        >
         <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {!isCollapsed && <span className="font-medium">Assets</span>}
          </div>
          {!isCollapsed && (
            <div className="text-sm text-gray-400">All your tokens & earnings</div>
          )}
        </motion.div>

        {/**Analytics Card */}    
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-3 rounded-lg border ${
            selectedSection === "analytics" ? "border-purple-500" : "border-gray-800 shadow-md hover:border-purple-500/50"
          } cursor-pointer transition-all`}
          onClick={handleAnalyticsClick}
        >
           <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {!isCollapsed && <span className="font-medium">Wallet Analytics</span>}
          </div>
          {!isCollapsed && (
            <div className="text-sm text-gray-400">View your wallet analytics</div>
          )}
        </motion.div>
      </div>

      {/* Settings */}
      <div className="pt-4 mt-4 border-t border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:bg-transparent"
        >
          <Settings className="w-4 h-4 mr-2" />
          Vault Settings
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
