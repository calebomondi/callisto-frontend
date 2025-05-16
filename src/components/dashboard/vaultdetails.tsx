import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, TrendingUp, CircleArrowOutDownRight } from 'lucide-react';
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
import { VaultTransactions } from '@/types/index.types';

interface PriceData {
  currentPrice: number;
  lockedPrice: number;
}

interface TimelineEvent {
  date: Date;
  amount: number;
  isWithdrawn: boolean;
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
  const [unlockEvents, setUnlockEvents] = useState<TimelineEvent[]>([]);
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
      setVaultData(mockSingleVaultData);
    }
  }

  //get actual spefic VaultData
  useEffect(() => {
    const fetchData = async () => {
        if (isConnected) {
          try {
            if (vaultId) {
              // Fetch vault data from local storage and API
              const vaultsLS = localStorage.getItem('vault_data')
              getSingleVaultData(vaultsLS)

              if (address && lockAsset) {
                const vaults = await apiService.getUserVaults(Number(chainId), address, lockAsset);
                if (vaults && vaults.length > 0) {
                  getSingleVaultData(JSON.stringify(vaults))
                }
              } else {
                console.error("Address is null. Cannot fetch user vaults.");
              }

              // Fetch transactions data from API
              if (address && lockAsset) {
                const transactionsData = await apiService.getVaultTransactions(Number(chainId), lockAsset, address, vaultData.decimals, vaultData.vaultId);
                if (transactionsData) {
                  setTransactions(transactionsData);
                }
              }
            }
          } catch (error) {
            console.error("Error fetching specific vault data:", error);
            throw new Error(`Error ${error} occured!`)
          }
        } 
    }
    fetchData();
  }, [isConnected, timeLeft]);

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

  /*/ Calculate unlock schedule timeline
  useEffect(() => {
    if (vaultData.startDate && vaultData.endDate && vaultData.unLockDuration) {
      const events: TimelineEvent[] = [];
      const startDate = new Date(vaultData.next_unlock).toISOString();
      const endDate = new Date(vaultData.endDate);
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        events.push({
          date: new Date(currentDate),
          amount: Number(vaultData.unLockAmount),
          isWithdrawn: new Date() > currentDate
        });
        currentDate.setDate(currentDate.getDate() + vaultData.unLockDuration);
      }

      setUnlockEvents(events);
    }
  }, [vaultData.unLockDuration]);
  */

  //price data
  useEffect(() => {
    setPriceData({currentPrice: 1, lockedPrice: 0.995})
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Calculate total lock duration in days
  const getTotalLockDays = () => {
    const startDate = new Date();
    const endDate = new Date(vaultData.endDate);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const vaultType = (vault:number):string => {
    if(vault === 1)
      return "days";
    if(vault === 2)
      return "weeks";
    if(vault === 3)
      return "months";
    if(vault === 4)
      return "years";

    return "";
  }

  const deleteVault = async(_index:number, _vault:number) => {
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
                    chainId === '4202' 
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
                  <span className="text-2xl text-amber-600">#{vaultData.title}</span>
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
                  <p className="text-center text-gray-400">Start Date</p>
                  <p className="font-semibold text-center">{formatDate(new Date(vaultData.startDate))}</p>
                  </div>
                  <div className='md:w-1/3'>
                  <p className="text-center text-gray-400">End Date</p>
                  <p className="font-semibold text-center">{formatDate(new Date(vaultData.endDate))}</p>
                  </div>
                  <div className='md:w-1/3'>
                  <p className="text-center text-gray-400">Lock Type</p>
                  <p className="font-semibold text-center capitalize">{vaultData.vaultType}</p>
                  </div>
                  { 
                    vaultData.vaultType === 'schedule' && (
                      <div className='md:w-1/3'>
                        <p className="text-center text-gray-400">Unlock Schedule</p>
                        <p className="font-semibold text-center">{vaultData.unLockDuration === 0 ? 'None' : `${vaultData.vaultType} ${vaultData.unLockDuration} days`}</p>
                      </div>
                    )
                  }
                  {Number(vaultData.unLockGoal) > 0 && (
                  <div className='md:w-1/3'>
                      <p className="text-center text-gray-400">Goal Amount</p>
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
                      <AddToLock vaultData={vaultData}/>            
                    </div>
                  </dialog>

                  {/*Withdraw*/}
                  <Button 
                    variant="outline"
                    className={`flex bg-amber-600 border-none text-gray-900 font-semibold hover:bg-gray-900 hover:border-amber-600 hover:text-amber-600 items-center space-x-2 ${isLockExpired ? '' : 'hidden'}`}
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
                      <Withdraw vaultData={vaultData}/>            
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
                              //await deleteVault(vaultData.vaultId, vaultData.vaultType);
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
          <div className={`space-y-4 border border-white shadow-md my-2 rounded-md p-2 ${vaultData.vaultType !== 'schedule' ? 'hidden' : ''}`}>
          <h3 className="text-xl font-semibold text-amber-600 m-2">Unlock Schedule</h3>
          <div className="h-auto overflow-x-auto">
            {
              vaultData.unLockDuration !== 0 ?
                <ul className="timeline overflow-x-auto">
                    {unlockEvents.map((event, index) => (
                        <li key={index} className="space-x-4 flex flex-col items-center justify-center">                            
                            <div className="timeline-start timeline-box dark:bg-gray-900">{formatDate(event.date)}</div>
                            <div className="timeline-middle">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-5 w-5">
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
              className="bg-orange-400 dark:text-black text-white py-2 px-2 rounded"
            >
            {viewTransactions ? 'Hide Transactions' : 'View Transactions'}
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