import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer, Wallet, ArrowUpRight, Search, Lock, Plus } from 'lucide-react';
import { VaultCardProps, VaultGridProps } from '@/types/index.types';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import apiService from '@/backendServices/apiservices';
import { currentChainId, getWalletClient } from '@/blockchain-services/useFvkry';
import LockAsset from './lockAsset';
import { useAccount } from 'wagmi';
  
const VaultCard: React.FC<VaultCardProps> = ({ subvault, chainId, lockAsset }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const navigate = useNavigate();

    const handleNavigate = () => {
      navigate(`/vault?&vaultId=${subvault.vaultId}&chainId=${chainId}&lockAsset=${lockAsset}&address=${subvault.owner}`);
    }
    
    useEffect(() => {
      const calculateTimeLeft = (): string => {
      // Get current time in UTC
      const now = new Date();
      const utcNow = new Date(
        now.getTime() + (now.getTimezoneOffset() * 60000)
      );
  
      // Parse the end time directly (assuming subvault.endDate is in UTC)
      const endTime = new Date(subvault.endDate);
      const difference = endTime.getTime() - utcNow.getTime();
  
      if (difference <= 0) {
        return 'Expired';
      }
  
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  
      return `${days}d ${hours}h ${minutes}m`;
    };
    
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000);
    
      setTimeLeft(calculateTimeLeft()); // Initial calculation
    
      return () => clearInterval(timer);
    }, [subvault.endDate]);
  
    return (
      <Card className="p-4 dark:bg-gray-900/50 border dark:border-gray-700 hover:border-purple-500 transition-colors">
        <div className='flex items-center justify-between '>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {subvault.title}
            </CardTitle>
          </CardHeader>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
            {subvault.title}
          </span>
        </div>
        <CardContent>
          <div className="space-y-4 flex flex-col items-left justify-center">
            {/* Amount and Asset */}
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 dark:text-gray-400" />
              <p className="dark:text-gray-400">
                {subvault.amount.toString()} {subvault.symbol}
              </p>
            </div>
  
            {/* Lock Type */}
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 dark:text-gray-400" />
              <p className="capitalize dark:text-gray-400">
                {subvault.vaultType}
              </p>
            </div>
  
            {/* Countdown Timer */}
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 dark:text-gray-400" />
              <p className="dark:text-gray-400">{timeLeft}</p>
            </div>
          </div>
  
          <Button 
            variant="outline"
            className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none  transform transition-transform duration-150 hover:scale-95"
            onClick={handleNavigate}
          >
            View Vault
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
};
  
 // Main component that renders the grid of vault cards
const VaultGrid: React.FC<VaultGridProps> = ({ vaultData}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedLockType, setSelectedLockType] = useState('');
  const [showNearExpiry, setShowNearExpiry] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [filteredVaults, setFilteredVaults] = useState(vaultData);
  const [chainData, setChainData] = useState<{
    chainId: number,
    lockAsset: `0x${string}`
    userAddress?: string
  }>({
    chainId: 0,
    lockAsset: '0x..',
    userAddress: ''
  })

  const [modalKey, setModalKey] = useState(0)

  const handleVaultGridModalClose  = () => {
    const modal = document.getElementById('my_modal_vaultgrid') as HTMLDialogElement;
    modal.close();
    setModalKey(prev => prev + 1);
  };
  const { isConnected } = useAccount();

  useEffect(() => {
    const fetchData = async () => {
      const chainId = currentChainId();
      const chainInfo = await apiService.getChainData(chainId);
      const user = await getWalletClient();

      setChainData({
        chainId: chainId,
        lockAsset: chainInfo.lockAsset,
        userAddress: user.address
      })
    }

    fetchData();
  }, [vaultData]);

  // Get unique asset symbols and lock types for filter options
  const assetSymbols = [...new Set(vaultData.map(vault => vault.symbol))];
  const lockTypes = [...new Set(vaultData.map(vault => vault.vaultType))];

  // Check if a vault is expiring within 7 days
  const isExpiringSoon = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return end - now < sevenDays && end - now > 0;
  };

  // Check if a vault has expired
  const isExpired = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    return  now > end;
  };

  //search by name or address
  const matchesSearchTerm = (vault: any, term: string) => {
    const searchLower = term.toLowerCase();
    return (
      vault.title.toLowerCase().includes(searchLower) ||
      vault.symbol.toLowerCase().includes(searchLower)
    );
  };

  useEffect(() => {
    // Apply filters and search
    let filtered = vaultData.filter(vault => {
      const matchesSearch = searchTerm ? matchesSearchTerm(vault, searchTerm) : true;
      const matchesAsset = selectedAsset ? vault.symbol === selectedAsset : true;
      const matchesLockType = selectedLockType ? vault.vaultType === selectedLockType : true;
      const matchesExpiry = showNearExpiry ? isExpiringSoon(vault.endDate) : true;
      const matchesExpired = showExpired ? isExpired(vault.endDate) : !isExpired(vault.endDate);

      return matchesSearch && matchesAsset && matchesLockType && matchesExpiry && matchesExpired;
    });

    setFilteredVaults(filtered);
  }, [searchTerm, selectedAsset, selectedLockType, showNearExpiry, showExpired, vaultData]);

  return (
    <div className="space-y-8 dark:bg-gradient-to-b from-gray-900 to-black min-h-screen">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-1 sticky top-20 p-2 rounded-md bg-gray-900 z-50">
        <div className='flex flex-col md:flex-row justify-between items-center pr-10 pl-6'>
          {/* Top Row - Always visible */}
          <div>
            <h1 className="text-3xl font-bold hidden md:block">Your Vaults</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex flex-col sm:flex-row md:flex-row w-full">
            {/* Search Input */}
            <div className="relative flex w-full p-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Title or Asset Symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent"
              />
            </div>
          </div>
          
          {/* Collapsible Filter Section */}
          <div className={`flex flex-row flex-wrap w-full`}>
            {/* Asset Symbol Filter */}
            <div className="flex flex-row gap-3 sm:ml-auto">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="h-10 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent sm:max-w-xs"
              >
                <option className='bg-base-300' value="">All Assets</option>
                {assetSymbols.map(symbol => (
                  <option className='bg-base-300' key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>

              {/* Lock Type Filter */}
              <select
                value={selectedLockType}
                onChange={(e) => setSelectedLockType(e.target.value)}
                className="h-10 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent sm:max-w-xs"
              >
                <option className='bg-base-300' value="">All Lock</option>
                {lockTypes.map(type => (
                  <option className='bg-base-300' key={type} value={type}>{type}</option>
                ))}
              </select>
            
              {/* Expiring Soon Toggle */}
              <button
                onClick={() => {
                  setShowNearExpiry(!showNearExpiry);
                  if (showExpired && !showNearExpiry) setShowExpired(false);
                }}
                className={`h-10 px-4 rounded-md border flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-none
                  ${showNearExpiry 
                    ? 'border-purple-600 text-purple-400 bg-purple-600/10' 
                    : 'border-gray-300 dark:border-gray-600'}`}
              >
                <Timer className="w-4 h-4" />
                <span className="sm:inline text-sm">Expiring Soon</span>
              </button>

              {/* Expired Toggle */}
              <button
                onClick={() => {
                  setShowExpired(!showExpired);
                  if (showNearExpiry && !showExpired) setShowNearExpiry(false);
                }}
                className={`h-10 px-4 rounded-md border flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-none
                  ${showExpired 
                    ? 'border-red-600 text-red-600 bg-red-600/10' 
                    : 'border-gray-300 dark:border-gray-600'}`}
              >
                <Lock className="w-4 h-4" />
                <span className="sm:inline text-sm">Expired</span>
              </button>
            </div>
          </div>
          </div>
        </div> 
        
        {/* Results Count - Always visible */}
        <div className="text-sm text-gray-500 mt-1 pl-6">
          Showing {filteredVaults.length} of {vaultData.length} vaults
        </div>
        
        <div className="flex pl-6 justify-end mb-6">
          <Button
            className={`${isConnected ? "" : "hidden"} bg-gradient-to-r from-purple-500 to-pink-500 text-white  transform transition-transform duration-150 hover:scale-95`}
            onClick={() => (document.getElementById('my_modal_vaultgrid') as HTMLDialogElement).showModal()}
          >
            <Plus className="w-4 h-4 mr-1" /> Create New Vault
          </Button>
          <dialog id="my_modal_vaultgrid" className="modal">
            <div className="modal-box dark:bg-gray-900">
              <form method="dialog">
                <button
                 className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                 onClick={handleVaultGridModalClose}
                >
                  ✕
                </button>
              </form>
              <LockAsset key={modalKey} />             
            </div>
          </dialog>
        </div>
      </div>
      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {filteredVaults.length > 0 ? (
          filteredVaults.map((subvault, index) => (
            <VaultCard key={index} subvault={subvault} chainId={chainData.chainId} lockAsset={chainData.lockAsset} />
          ))
        ) : (
          <p className="text-center col-span-full">No vaults match your criteria</p>
        )}
      </div>
    </div>
  );
};
  
 export default VaultGrid;