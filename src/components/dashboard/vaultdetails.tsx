import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, TrendingUp, CircleArrowOutDownRight, Plus } from 'lucide-react';
import ConnectedNavbar from '../navbar/connectednavbar';
import { VaultData } from '@/types/index.types';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { mockSingleVaultData } from './mockplatformdata';
import AddToLock from './addToLock';
import Withdraw from './withdraw';
import { deleteLock } from '@/blockchain-services/useFvkry';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"
import apiService from '@/backendServices/apiservices';
import { useNavigate } from 'react-router-dom';
import TransactionsTable from './transactions';
import { VaultTransactions, UnlockDays, UnlockStatus, VaultGoal } from '@/types/index.types';
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"
import { currentChainId, getWalletClient } from "@/blockchain-services/useFvkry"


interface PriceData {
  currentPrice: number;
  lockedPrice: number;
}

interface VaultDetailsProps {
  vault?: VaultData;
  showNavbar?: boolean;
}

const VaultDetails = ({ showNavbar = true, vault }: VaultDetailsProps) => {
  const [goalData, setGoalData] = useState<VaultGoal | null>(null);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    const fetchGoalData = async () => {
      const vaultData = await apiService.vaultGoal(Number(vault?.amount) || 0, Number(vault?.unLockGoal) || 0, vault?.endDate || '');
      if(vaultData) {
        setGoalData(vaultData);
      }
    }
    // Fetch goal data if vault is of type 'goal'
    if (vault && vault.vaultType === 'goal') {
      fetchGoalData();
    } 

    // Fetch points data
    const fetchPointsData = async () => {
      const chainId = currentChainId()
      const user = await getWalletClient();
      const pointsData = await apiService.getPoints(chainId, vault?.vaultId || 0, user.address);
      if(pointsData) {
        setPoints(pointsData)
      }
    }
    fetchPointsData();
  }, []);  
  
  const data = [
    {
      name: 'Completion',
      uv: goalData?.progress, // Represents 24%
      fill: '#4285F4', // Blue color for the completed portion
    },
  ];

  const backgroundData = [
    {
      name: 'Background',
      uv: 100, // Full circle for the background
      fill: '#E0E0E0', // Light grey color for the background
    },
  ];
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const [vaultData, setVaultData] = useState<VaultData>(mockSingleVaultData)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [priceData, setPriceData] = useState<PriceData>({
    currentPrice: 0,
    lockedPrice: 0
  });
  const [unlockDays, setUnlockDays] = useState<UnlockDays[]>([]);
  const [canUnlockNow, setCanUnlockNow] = useState<UnlockStatus>({
    canUnlockNow: false,
    amountToUnlock: 0
});
  const [isLockExpired, setIsLockExpired] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<VaultTransactions[]>([])
  //const [viewTransactions, setViewTransactions] = useState<boolean>(false)
  const [withdrawModalKey, setWithdrawModalKey] = useState(0);
  const [addFundsModalKey, setAddFundsModalKey] = useState(0);


  //get params and query values
  const [searchParams] = useSearchParams();
  
  const address = searchParams.get('address');
  const vaultId = searchParams.get('vaultId');
  const lockAsset = searchParams.get('lockAsset');
  const chainId = searchParams.get('chainId') || '4202'; // Default to 4202 if not provided
  
  //check if connected
  const { isConnected } = useAccount();

  function getSingleVaultData(data: string | null) {
    if (data) {
      const vaults = JSON.parse(data) as VaultData[];
      const vault = vaults.find((vault) => vault.vaultId === Number(vaultId));
      if (vault) {
        setVaultData(vault);
        setIsLockExpired(new Date(vault.endDate) < new Date());
      } else {
        setVaultData(mockSingleVaultData);
      }
    } else {
      setVaultData(mockSingleVaultData)
    }
  }

  //If vault is passed in via props (e.g., from sidebar/dashboard), use it immediately
  useEffect(() => {
    if (vault) {
      setVaultData(vault);
    }
  }, [vault]);
  
  // Effect for fetching vault data
  useEffect(() => {
    if (vault) return; //skips fetching if prop is already provided
    const fetchVaultData = async () => {
        if (isConnected && vaultId) {
          try {
            // Fetch vault data from local storage first
            const vaultsLS = localStorage.getItem('vault_data')
            getSingleVaultData(vaultsLS)

            // Then fetch from API if address and lockAsset are available
            if (address && lockAsset) {
              const vaults = await apiService.getUserVaults(Number(chainId), address, lockAsset);
              if (vaults && vaults.length > 0) {
                getSingleVaultData(JSON.stringify(vaults))
              }
            } else {
              console.error("Address is null. Cannot fetch user vaults.");
            }
          } catch (error) {
            console.error("Error fetching specific vault data:", error);
            throw new Error(`Error ${error} occurred!`)
          }
        } 
    }
    fetchVaultData();
  }, [vault, isConnected, vaultId, address, lockAsset, chainId]);

  // Separate effect for fetching transactions - runs when vaultData changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (isConnected && address && lockAsset && vaultData.decimals !== 0 && vaultId) {
        try {
          const transactionsData = await apiService.getVaultTransactions(
            Number(chainId), 
            lockAsset, 
            address, 
            vaultData.decimals, 
            Number(vaultId)
          );
          if (transactionsData) {
            setTransactions(transactionsData);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }
    };

    fetchTransactions();
  }, [vaultData, isConnected, address, lockAsset, vaultId, chainId]);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = (): string => {
      // Get current time in UTC
      const now = new Date();
      const utcNow = new Date(
        now.getTime() + (now.getTimezoneOffset() * 60000)
      );
  
      // Parse the end time directly (assuming subvault.endDate is in UTC)
      const endTime = new Date(vaultData.endDate);
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
    }, 1000);
  
    setTimeLeft(calculateTimeLeft()); // Initial calculation
  
    return () => clearInterval(timer);
  }, [vaultData.endDate]);

  // Calculate unlock schedule timeline
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (vaultData.vaultType === 'schedule') {
        const scheduleData = await apiService.vaultSchedule(vaultData);
        if (scheduleData) {
          setCanUnlockNow(scheduleData.checkUnlockStatus);
          setUnlockDays(scheduleData.unlockDaysStatus);
        }
      }
    };
    fetchScheduleData();
  }, [vaultData.unLockDuration, vaultData.vaultType]);

  //price data
  useEffect(() => {
    setPriceData({currentPrice: 1, lockedPrice: 0.995})
  }, []);

  const formatDate = (date: number): string => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const deleteVault = async(_index:number) => {
    setIsDeleting(true)

    try {
      let tx;
      tx = await deleteLock(_index);
      if(tx) {
        //toast
        toast({
          title: `${vaultData.title.toUpperCase()}`,
          description: `Successfully Deleted Lock`,
          action: (
              <ToastAction 
                  altText="Goto schedule to undo"
                  onClick={() => window.open(
                    Number(chainId) === 84532 
                    ? `https://sepolia-blockscout.lisk.com/tx/${tx}` 
                    : `https://sepolia.ethersan.io/tx/${tx}`, '_blank'
                  )}
              >
                  View Transaction
              </ToastAction>
          )
        });

        setIsDeleting(false)
        navigate("/myvaults")

      }
    } catch (error) {
      toast({
          variant: "destructive",
          title: "Error",
          description: (error as any).message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }

  const handleWithdrawModalClose = () => {
    const modal = document.getElementById('my_modal_15') as HTMLDialogElement;
    modal.close();
    setWithdrawModalKey(prev => prev + 1);
  };

  const handleAddFundsModalClose = () => {
    const modal = document.getElementById('my_modal_14') as HTMLDialogElement;
    modal.close();
    setAddFundsModalKey(prev => prev + 1);
  };

  const handleNavigateToVaults = () => {
    navigate("/myvaults");
  }

  return (
    <div className=''>
      {showNavbar && <ConnectedNavbar />}

      <div>
        <div className='dark:bg-gray-900'>
          <div className="flex items-center text-gray-400 text-sm py-4 pl-12">
            <button onClick={handleNavigateToVaults} className='hover:text-gray-300'>Vaults</button>
            <ArrowRight className="w-4 h-4 mx-2" />
            <span className="text-purple-400">{vaultData.title}</span>
          </div>
          <h1 className="text-3xl font-bold dark:text-white pb-2 pl-12">{vaultData.title}</h1>
          <div className="flex items-center dark:text-gray-300 pl-12">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Time remaining - {timeLeft}
            </span>
          </div>
        </div>
        <div className="px-12 py-6 grid grid-cols-1 xl:grid-cols-3 gap-8 md:h-full dark:bg-gradient-to-b from-gray-900 to-black">
        {/*LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          {/**Vault Stats */}
          <div className="rounded-xl p-6 border border-purple-500/20">
            <h3 className="dark:text-white text-lg font-medium mb-6">Vault Overview</h3>
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Locked Amount */}
                    <div className="space-y-2">
                      <h4 className="dark:text-gray-400 text-sm">Total Locked</h4>
                      <div className="text-xl font-bold dark:text-white">{vaultData.amount} {vaultData.symbol}</div>
                      <div className="dark:text-gray-500 text-sm">≈ {formatCurrency(Number(Number(vaultData.amount)) * priceData.currentPrice)}</div>
                    </div>

                    {/* Vault Type */}
                    <div className="space-y-2">
                      <h4 className="dark:text-gray-400 text-sm">Vault Type</h4>
                      <div className="text-lg dark:text-white font-medium capitalize">{vaultData.vaultType}</div>
                      {/* <div className="text-purple-400 text-sm">APY: 12%</div> */}
                    </div>
                    {vaultData.vaultType === 'schedule' && (
                      <div className=''>
                        <p className="text-sm dark:text-gray-400">Unlock Schedule</p>
                        <p className="font-bold text-xl">{vaultData.unLockDuration === 0 ? 'None' : `every ${vaultData.unLockDuration} days`}</p>
                      </div>
                    )}
                    {vaultData.unLockDuration > 0 && (
                      <div className=''>
                          <p className="dark:text-gray-300 text-sm">Unlock Amount</p>
                          <p className="font-bold text-xl">{vaultData.unLockAmount} {vaultData.symbol}</p>
                      </div>
                    )}
                    {Number(vaultData.unLockGoal) > 0 && (
                      <div className=''>
                          <p className="text-sm dark:text-gray-400">Goal Amount</p>
                          <p className="font-bold text-xl">{formatCurrency(Number(vaultData.unLockGoal))}</p>
                      </div>
                    )}

                    {/**Value Change */}
                    <div className="space-y-1">
                      <h3 className="text-sm dark:text-gray-400">Value Change</h3>
                      <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className={` ${
                          priceData.currentPrice > priceData.lockedPrice 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                          {((priceData.currentPrice - priceData.lockedPrice) / priceData.lockedPrice * 100).toFixed(2)}%
                          </span>
                      </div>
                      <p className="dark:text-gray-500 text-sm">
                          Initial: {formatCurrency(Number(vaultData.amount) * priceData.lockedPrice)}
                      </p>
                    </div>
                  </div>

                {/**Date Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 dark:bg-black/20 rounded-lg border dark:border-purple-500/10">
                  <div className="text-center md:text-left">
                    <div className="dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Start Date</div>
                    <div className="dark:text-white font-medium">{formatDate(new Date(vaultData.startDate).getTime())}</div>
                  </div>

                  <div className="text-center">
                    <div className="dark:text-gray-400 text-xs uppercase tracking-wide mb-1">End Date</div>
                    <div className="dark:text-white font-medium">{formatDate(new Date(vaultData.endDate).getTime())}</div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <div className="dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Time Remaining</div>
                    <div className="flex items-center justify-end gap-2 dark:text-purple-300 font-medium">
                      <Clock className='w-4 h-4' /> {timeLeft}
                    </div>
                  </div>
                </div>

          {/* Timeline of Unlock Events */}
          <div className={`space-y-4 border dark:border-gray-800 shadow-md my-4 rounded-md p-2 ${vaultData.vaultType !== 'schedule' && 'hidden'}`}>
            <h3 className="text-xl font-semibold dark:text-white m-2">Unlock Schedule</h3>
            <div className="h-auto overflow-x-auto flex justify-center">
              {
                vaultData.unLockDuration !== 0 ?
                  <ul className="timeline overflow-x-auto">
                      {unlockDays.map((event, index) => (
                          <li key={index} className="space-x-4 flex flex-col items-center justify-center">                            
                              <div className="timeline-start timeline-box dark:bg-gray-900">{formatDate(event.date * 1000)}</div>
                              <div className="timeline-middle">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className={`h-5 w-5 text-white rounded-full ${event.status === 'past' ? 'bg-red-500' : event.status === 'current' ? 'bg-green-500' : event.status === 'future' ? 'bg-blue-500' : ''}`}
                              >  
                                    <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                    clipRule="evenodd" />
                                </svg>
                              </div>
                              <hr className='bg-purple-600'/>
                          </li>
                      ))}
                  </ul> :
                  <div className='grid place-items-center '>
                    {
                      vaultData.vaultType !== 'schedule' ? 'Cannot Set Unlock Schedule For Goal Based Locks' : 'No Unlock Schedule Have Been Set, SetUp One.'}
                  </div>
              }
            </div>
          </div> 
          
          </div>

          {/*Transactions Table */}
          <div className="rounded-xl p-6 border dark:border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="dark:text-white text-lg font-medium">Transaction History</h3>
              <button className="dark:text-purple-300 text-sm dark:hover:text-purple-200 transition-colors">
                View All
              </button>
            </div>
            <TransactionsTable transactions={transactions} />
          </div>
        </div>

        {/* RIGHT COLUMN - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className=" rounded-xl p-6 border dark:border-purple-500/20">
              <h3 className="dark:text-white text-lg font-medium mb-6">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  onClick={() => (document.getElementById('my_modal_14') as HTMLDialogElement).showModal()}
                  className={`w-full text-white flex items-center justify-center space-x-2 border-none bg-gradient-to-r from-purple-500 to-pink-500 transform transition-transform duration-150 hover:scale-95 ${isLockExpired && 'hidden'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Funds</span>
                </Button>
                <dialog id="my_modal_14" className="modal">
                  <div className="modal-box dark:bg-gray-900">
                    <form method="dialog">
                      <button 
                        onClick={handleAddFundsModalClose}
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      >
                        ✕
                      </button>
                    </form>
                    <AddToLock key={addFundsModalKey} vaultData={vaultData} chainId={Number(chainId)}/>            
                  </div>
                </dialog>

                {/**Withdraw */}
                <Button 
                   variant="outline"
                   className={`w-full text-white flex items-center justify-center space-x-2 border-none bg-gradient-to-r from-purple-500 to-pink-500 transform transition-transform duration-150 hover:scale-95 ${isLockExpired || canUnlockNow.canUnlockNow ? '' : 'hidden'}`}
                   onClick={() => (document.getElementById('my_modal_15') as HTMLDialogElement).showModal()}
                   disabled = {Number(vaultData.amount) === 0}
                 >
                   <CircleArrowOutDownRight className="w-4 h-4" />
                   <span>Withdraw</span>
                 </Button>
                 <dialog id="my_modal_15" className="modal">
                   <div className="modal-box dark:bg-gray-900">
                     <form method="dialog">
                       <button 
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={handleWithdrawModalClose}
                        >
                          ✕
                        </button>
                     </form>
                     <Withdraw key={withdrawModalKey} vaultData={vaultData} chainId={Number(chainId)}/>            
                   </div>
                 </dialog>

                  {/*Delete Lock*/}
                  <Button 
                    variant="outline"
                    className={`w-full flex text-white border-none items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 transform transition-transform duration-150 hover:scale-95 ${isLockExpired && Number(vaultData.amount) === 0 ? '' : 'hidden'}`}
                    onClick={() => (document.getElementById('my_modal_16') as HTMLDialogElement).showModal()}
                  >
                  {isDeleting ? 
                    <>
                      <span className="loading loading-ring loading-xs"></span>
                      <span>Deleting...</span>
                    </> 
                  : "Delete Lock"}
                  </Button>
                  <dialog id="my_modal_16" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box bg-gray-900">
                      <h3 className="font-semibold text-lg text-red-500">Deleting Lock!</h3>
                      <p className="py-4">{vaultData.title.toUpperCase()}</p>
                      <div className="modal-action">
                        <form method="dialog">
                          <button className="btn btn-sm btn-error m-1" onClick={async () => {
                            if (vaultData.vaultId !== undefined && vaultData.vaultType !== undefined) {
                              await deleteVault(vaultData.vaultId);
                            }
                          }} >Proceed</button>
                          <button className="btn btn-sm btn-success m-1">Cancel</button>
                        </form>
                      </div>
                    </div>
                  </dialog>
              </div>
          </div>

          <div className="rounded-xl p-6 border border-purple-500/20">
              <div className='flex items-center justify-center mb-4'>
                <div className='text-5xl mr-2 font-bold text-green-500'>{points}</div>
                <div className='text-lg font-medium text-gray-400 flex flex-col items-start justify-start'>
                  <span>Points</span>
                  <span>Earned</span>
                </div>
              </div>
              <p className='text-center text-amber-400 text-sm'>*Claimable after vault expires</p>
          </div>
          
          {/* Goal Details */}
          {vaultData.vaultType === "goal" && !isLockExpired && (
          <div className="rounded-xl p-6 border border-purple-500/20 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Goal Tracker</h3>
            <div className="w-64 h-64 relative"> {/* Fixed size container for the chart */}
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="75%" // Inner radius to create the donut effect
                  outerRadius="90%" // Outer radius for the bar
                  barSize={10} // Thickness of the bar
                  data={backgroundData} // Render background first
                  startAngle={90} // Start from the top
                  endAngle={-270} // Go full circle (360 degrees)
                >
                  <RadialBar
                    
                    background={false} // No background for the foreground bar itself
                    //clockWise={false} // Counter-clockwise for the background bar
                    dataKey="uv"
                    cornerRadius={5} // Slightly rounded ends for the bar
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height="100%" className="absolute top-0 left-0">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="75%"
                  outerRadius="90%"
                  barSize={10}
                  data={data} // Render actual progress on top
                  startAngle={90}
                  endAngle={90 - ((data[0]?.uv ?? 0) / 100) * 360} // Calculate end angle based on percentage
                >
                  <RadialBar
                    
                    background={false}
                    //clockWise={false} // Counter-clockwise for the progress bar
                    dataKey="uv"
                    cornerRadius={5}
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              {/* Text overlay for percentage and label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-blue-600">
                  {data[0].uv}%
                </span>
                <span className="text-lg text-gray-600">
                  Complete
                </span>
              </div>
            </div>
            <div className="p-4 w-full text-center space-y-3">
              {/* Top Stats */}
              <div className="flex justify-evenly text-sm font-semibold">
                <div>
                  <div className="text-purple-600 text-xl">Target:</div>
                  <div className="text-blue-600 text-lg">{vault?.unLockGoal} USDC</div>
                </div>
                <div>
                  <div className="text-purple-600 text-xl">Deficit:</div>
                  <div className="text-blue-600 text-lg">{goalData?.remainingAmount} USDC</div>
                </div>
              </div>

              {/* Time Remaining */}
              <div>
                <div className="text-pink-700 font-semibold text-xl">Time Remaining</div>
                <div className="grid grid-cols-3 text-sm gap-y-1">
                  <div>
                    <div className="text-gray-600 text-xl">Days</div>
                    <div className="text-blue-600 font-semibold text-lg">{goalData?.daysToEndDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xl">Weeks</div>
                    <div className="text-blue-600 font-semibold text-lg">{goalData?.weeksToEndDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xl">Months</div>
                    <div className="text-blue-600 font-semibold text-lg">{goalData?.monthsToEndDate}</div>
                  </div>
                </div>
              </div>

              {/* Saving Strategy */}
              <div>
                <div className="text-pink-700 font-semibold text-xl">Saving Strategy</div>
                <div className="grid grid-cols-3 text-sm gap-y-1">
                  <div>
                    <div className="text-gray-600 text-xl">Daily</div>
                    <div className="text-blue-600 font-semibold text-lg">{goalData?.amountToSaveDaily} USDC</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xl">Weekly</div>
                    <div className="text-blue-600 font-semibold text-lg">{goalData?.amountToSaveWeekly} USDC</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xl">Monthly</div>
                    <div className="text-blue-600 font-semibold text-lg">{goalData?.amountToSaveMonthly} USDC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
  

          {/*vaultData.vaultType === "goal" &&(
            <div className="rounded-xl p-6 border border-purple-500/20">
            <h3 className="dark:text-white text-lg font-medium mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-300">Current APY</span>
                <span className="text-green-400 font-medium">{((priceData.currentPrice - priceData.lockedPrice) / priceData.lockedPrice * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-300">Total Amount</span>
                <span className="dark:text-white font-medium">{vaultData.amount} {vaultData.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-300">Total Duration</span>
                <span className="dark:text-white font-medium">
                  {
                    Math.ceil(
                      (new Date(vaultData.endDate).getTime() - new Date(vaultData.startDate).getTime()) / (1000 * 60 * 60 * 24)
                    )
                  } days
                </span>
              </div>
            </div>
          </div>
          )*/}
          
        </div>
        
        </div>

      </div>
    </div>
  );
};

export default VaultDetails;