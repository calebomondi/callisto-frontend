import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, TrendingUp, CircleArrowOutDownRight, ReceiptText, Eye, EyeClosed } from 'lucide-react';
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
import { VaultTransactions, UnlockDays, UnlockStatus } from '@/types/index.types';

interface PriceData {
  currentPrice: number;
  lockedPrice: number;
}

const VaultDetails = () => {
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
  const [viewTransactions, setViewTransactions] = useState<boolean>(false)

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

  // Effect for fetching vault data
  useEffect(() => {
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
  }, [isConnected, vaultId, address, lockAsset, chainId]);

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

  return (
    <div className=''>
    <ConnectedNavbar />
    <p className={`text-center my-4 text-amber-600 ${isConnected ? 'hidden' : ''}`}>
      Connect your wallet to view your indepth lock details
    </p>
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:h-screen">
        <div className="">
          {/* Header Section */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl text-amber-500">{vaultData.title}</span>
                  <p className="text-lg font-mono flex space-x-2"> <Timer /> <span>{timeLeft}</span></p>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* Asset Information */}
              <div className="flex flex-col md:flex-row items-center md:justify-evenly">
                  <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-center">Locked Amount</h3>
                      <p className="text-2xl font-bold text-center">
                          {Number(vaultData.amount)} {vaultData.symbol}
                      </p>
                      <p className="text-gray-500 text-center">
                          ≈ {formatCurrency(Number(Number(vaultData.amount)) * priceData.currentPrice)}
                      </p>
                  </div>
                  
                  <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-center">Value Change</h3>
                      <div className="flex items-center space-x-2 justify-center">
                          <TrendingUp className="w-5 h-5" />
                          <span className={`text-xl font-bold ${
                          priceData.currentPrice > priceData.lockedPrice 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                          {((priceData.currentPrice - priceData.lockedPrice) / priceData.lockedPrice * 100).toFixed(2)}%
                          </span>
                      </div>
                      <p className="text-gray-500 text-center">
                          Initial: {formatCurrency(Number(vaultData.amount) * priceData.lockedPrice)}
                      </p>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row">
                  <div className='md:w-1/3'>
                  <p className="text-center text-gray-600 dark:text-gray-400">Start Date</p>
                  <p className="font-semibold text-center">{formatDate(new Date(vaultData.startDate).getTime())}</p>
                  </div>
                  <div className='md:w-1/3'>
                  <p className="text-center text-gray-600 dark:text-gray-400">End Date</p>
                  <p className="font-semibold text-center">{formatDate(new Date(vaultData.endDate).getTime())}</p>
                  </div>
                  <div className='md:w-1/3'>
                  <p className="text-center text-gray-600 dark:text-gray-400">Lock Type</p>
                  <p className="font-semibold text-center capitalize">{vaultData.vaultType}</p>
                  </div>
                  { 
                    vaultData.vaultType === 'schedule' && (
                      <div className='md:w-1/3'>
                        <p className="text-center text-gray-600 dark:text-gray-400">Unlock Schedule</p>
                        <p className="font-semibold text-center">{vaultData.unLockDuration === 0 ? 'None' : `every ${vaultData.unLockDuration} days`}</p>
                      </div>
                    )
                  }
                  {Number(vaultData.unLockGoal) > 0 && (
                  <div className='md:w-1/3'>
                      <p className="text-center text-gray-600 dark:text-gray-400">Goal Amount</p>
                      <p className="font-semibold text-center">{formatCurrency(Number(vaultData.unLockGoal))}</p>
                  </div>
                  )}
                  {vaultData.unLockDuration > 0 && (
                  <div className='md:w-1/3'>
                      <p className="text-center text-gray-400">Unlock Amount</p>
                      <p className="font-semibold text-center">{vaultData.unLockAmount} {vaultData.symbol}</p>
                  </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center justify-center">
                  {/*Add 2 Lock*/}
                  <Button 
                    variant="outline"
                    className={`flex bg-amber-600 border-none text-gray-900 font-semibold hover:bg-gray-900 hover:border-amber-600 hover:text-amber-600 items-center space-x-2 ${isLockExpired ? 'hidden' : ''}`}
                    onClick={() => (document.getElementById('my_modal_14') as HTMLDialogElement).showModal()}
                    disabled={!isConnected}
                  >
                  <CircleArrowOutDownRight className="w-4 h-4" />
                    <span>Add To Lock</span>
                  </Button>
                  <dialog id="my_modal_14" className="modal">
                    <div className="modal-box">
                      <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                      </form>
                      <AddToLock vaultData={vaultData} chainId={Number(chainId)}/>            
                    </div>
                  </dialog>

                  {/*Withdraw*/}
                  <Button 
                    variant="outline"
                    className={`flex bg-amber-600 border-none text-gray-900 font-semibold hover:bg-gray-900 hover:border-amber-600 hover:text-amber-600 items-center space-x-2 ${isLockExpired || canUnlockNow.canUnlockNow ? '' : 'hidden'}`}
                    onClick={() => (document.getElementById('my_modal_15') as HTMLDialogElement).showModal()}
                    disabled = {Number(vaultData.amount) === 0}
                  >
                    <CircleArrowOutDownRight className="w-4 h-4" />
                    <span>Withdraw</span>
                  </Button>
                  <dialog id="my_modal_15" className="modal">
                    <div className="modal-box">
                      <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                      </form>
                      <Withdraw vaultData={vaultData} chainId={Number(chainId)}/>            
                    </div>
                  </dialog>

                  {/*Delete Lock*/}
                  <Button 
                    variant="outline"
                    className={`flex bg-amber-600 border-none text-gray-900 font-semibold hover:bg-gray-900 hover:border-amber-600 hover:text-amber-600 items-center space-x-2 ${isLockExpired && Number(vaultData.amount) === 0 ? '' : 'hidden'}`}
                    onClick={() => (document.getElementById('my_modal_16') as HTMLDialogElement).showModal()}
                  >

                    <span>{isDeleting ? 'Deleting...' : 'Delete Lock'}</span>
                  </Button>
                  <dialog id="my_modal_16" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
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
              </CardContent>
          </Card>
          {/* Timeline of Unlock Events */}
          <div className={`space-y-4 border border-white shadow-md my-4 rounded-md p-2 ${vaultData.vaultType !== 'schedule' && 'hidden'}`}>
            <h3 className="text-xl font-semibold text-amber-600 m-2">Unlock Schedule</h3>
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
                                    className={`h-5 w-5 rounded-full ${event.status === 'past' ? 'bg-red-500' : event.status === 'current' ? 'bg-green-500' : event.status === 'future' ? 'bg-blue-500' : ''}`}
                              >  
                                    <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                    clipRule="evenodd" />
                                </svg>
                              </div>
                              <hr className='bg-amber-600'/>
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
          {/* Show Transactions */}
          <div className='flex items-center justify-center my-2'>
            <button 
              type="button" 
              onClick={() => {setViewTransactions(!viewTransactions)}}
              className="flex bg-amber-600 border-none text-gray-900 font-semibold hover:bg-gray-900 hover:border-amber-600 hover:text-amber-600 items-center space-2 rounded p-2 gap-1"
            >
              {viewTransactions ? (<Eye />) : (<EyeClosed />)} <ReceiptText />
            </button>
          </div>
          {
            viewTransactions && (
              <TransactionsTable transactions={transactions} />
            )
          }
        </div>
        
    </div>
    </div>
  );
};

export default VaultDetails;