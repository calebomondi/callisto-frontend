import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer, Target, Wallet, ArrowUpRight, Search, Lock, Filter } from 'lucide-react';
import { VaultCardProps, VaultGridProps } from '@/types/index.types';
import { useNavigate } from 'react-router-dom';
  
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
    
        // Parse the end time directly (assuming subvault.end_time is in UTC)
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
    }, [timeLeft]);
  
    return (
      <Card className="hover:cursor-pointer dark:bg-base-200 border-none shadow-md hover:shadow-sm hover:shadow-amber-400 transition-all duration-300 mx-4 md:mx-0">
        <CardHeader>
          <CardTitle className="text-center truncate py-1 text-amber-600">
            {subvault.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 flex flex-col items-center justify-center">
            {/* Amount and Asset */}
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <p className="text-center font-semibold">
                {subvault.amount.toString()} {subvault.symbol}
              </p>
            </div>
  
            {/* Lock Type */}
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <p className="text-center font-semibold capitalize">
                {subvault.vaultType}
              </p>
            </div>
  
            {/* Countdown Timer */}
            <div className="flex items-center space-x-2 text-emerald-500">
              <Timer className="w-4 h-4" />
              <p className="font-mono">{timeLeft}</p>
            </div>
          </div>
  
          <button 
            className="btn btn-sm text-amber-600 btn-outline hover:bg-amber-600 hover:text-gray-800 hover:border-amber-600 mt-5 w-full flex items-center justify-center gap-2" 
            onClick={handleNavigate}
          >
            View Lock
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </CardContent>
      </Card>
    );
};
  
 // Main component that renders the grid of vault cards
const VaultGrid: React.FC<VaultGridProps> = ({ vaultData, chainId, lockAsset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedLockType, setSelectedLockType] = useState('');
  const [showNearExpiry, setShowNearExpiry] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [filteredVaults, setFilteredVaults] = useState(vaultData);
  const [showFilters, setShowFilters] = useState(false);

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
    return end - now < 0 && now > end;
  };

  //search by name or address
  const matchesSearchTerm = (vault: any, term: string) => {
    const searchLower = term.toLowerCase();
    return (
      vault.title.toLowerCase().includes(searchLower) ||
      vault.asset_symbol.toLowerCase().includes(searchLower)
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
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-1 sticky top-20 dark:bg-black/90 bg-white shadow-md p-2 rounded-md">
        <div className='flex'>
          {/* Top Row - Always visible */}
          <div className="flex flex-col sm:flex-row gap-3 lg:w-1/2 w-full">
            {/* Search Input */}
            <div className="relative flex w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Title or Asset Symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:w-full w-1/2 h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent"
              />
            </div>
            
            {/* Mobile-friendly toggle for filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center h-10 px-4 rounded-md border border-gray-300 dark:border-gray-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters 
            </button>
          </div>
          
          {/* Collapsible Filter Section */}
          <div className={`flex flex-6 flex-row ${showFilters ? 'block' : 'hidden sm:flex sm:flex-row'} sm:flex-wrap lg:w-1/2 w-full`}>
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
                <option className='bg-base-300' value="">All Lock Types</option>
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
                    ? 'border-amber-600 text-amber-600 bg-amber-600/10' 
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
        
        {/* Results Count - Always visible */}
        <div className="text-sm text-gray-500 mt-1">
          Showing {filteredVaults.length} of {vaultData.length} vaults
        </div>
        
      </div>
      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredVaults.length > 0 ? (
          filteredVaults.map((subvault, index) => (
            <VaultCard key={index} subvault={subvault} chainId={chainId} lockAsset={lockAsset} />
          ))
        ) : (
          <p className="text-center col-span-full">No vaults match your criteria</p>
        )}
      </div>
    </div>
  );
};
  
 export default VaultGrid;