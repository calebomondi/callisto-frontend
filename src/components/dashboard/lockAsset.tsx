import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { createTokenVault, currentChainId, getWalletClient } from "@/blockchain-services/useFvkry";
import { useAccount } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { SupportedTokens, FormValues, TokenBalances } from "@/types/index.types";
import { parseUnits } from "viem";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import apiService from "@/backendServices/apiservices";

export default function LockAsset() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const { isConnected } = useAccount()

    //form
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formValues, setFormValues] = useState<FormValues>({
        symbol: "", 
        title: "", 
        totalAmount: "", 
        vaultType: "schedule", 
        lockPeriod: "", 
        slip: "", 
        unLockDuration: "", 
        unLockAmount: "", 
        unLockGoal: "",
        durationType: 'weeks'
    })
    const [supportedTokens, setSupportedTokens] = useState<SupportedTokens[]>([])
    const [isAaveSupported, setIsAaveSupported] = useState<boolean>(false)
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
    const [showSecurityNotice, setShowSecurityNotice] = useState<boolean>(false)
    const [tokensData, setTokensData] = useState<TokenBalances[]>([])

    const handleConfirmCreationClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            // validate input data
            if(!formValues.symbol || !formValues.title || !formValues.totalAmount || !formValues.lockPeriod
            ) {
                throw new Error('Please fill all the required fields!')
            }
            if (isNaN(Number(formValues.totalAmount)) || Number(formValues.totalAmount) < 1) {
                throw new Error('Amount to lock must be a value and greater than 0.001')
            }
            if (isNaN(Number(formValues.lockPeriod)) || Number(formValues.lockPeriod) <= 0) {
                throw new Error('Lock period must be a value and greater than 0')
            }
            if (isNaN(Number(formValues.unLockGoal)) || Number(formValues.unLockGoal) < 0) {
                throw new Error('Locking Goal must be a value and greater than 0')
            }
            if (formValues.durationType === 'days' && Number(formValues.lockPeriod) > 6) {
                throw new Error('Days Cannot Exceed 7')
            }
            if (formValues.durationType === 'weeks' && Number(formValues.lockPeriod) > 3) {
                throw new Error('Weeks Cannot Exceed 4')
            }
            if (formValues.durationType === 'months' && Number(formValues.lockPeriod) > 11) {
                throw new Error('Months Cannot Exceed 11')
            }
            if (formValues.durationType === 'years' && Number(formValues.lockPeriod) > 5) {
                throw new Error('Years Cannot Exceed 5')
            }
            if (hasSufficientBalance()) {
                throw new Error('Insufficient Balance to Lock Asset!')
            }

            //set form values according to vault type
            if(formValues.vaultType === 'schedule') {
                formValues.unLockGoal = ''
                if(!formValues.unLockDuration || !formValues.unLockAmount) {
                    throw new Error('Please fill all required values!')
                }
            }
            if(formValues.vaultType === 'goal') {
                formValues.unLockDuration = ''
                formValues.unLockAmount = ''
                if(Number(formValues.unLockGoal) <= Number(formValues.totalAmount)) {
                    throw new Error('Goal Amount cannot be less than or equal to initial deposit amount!')
                }
                if(!formValues.unLockGoal) {
                    throw new Error('Please enter goal amount!')
                }
            }
            if(formValues.vaultType === 'Fixed') {
                formValues.unLockDuration = ''
                formValues.unLockAmount = ''
                formValues.unLockGoal = ''
            }

            setShowConfirmModal(true);

        } catch (error:any) {
            console.log(`Confirmation Error!`, error.message);
            toast({
                variant: "destructive",
                title: "ERROR",
                description: error.message
            })
        }
    };

     const handleCancel = () => {
        setShowConfirmModal(false);
    };

    useEffect(() => {
        try {
            const fetchSupportedTokens = async () => {
                if(isConnected) {
                    const response = await apiService.getSupportedTokens()
                    if (response && response.length > 0) {
                        setSupportedTokens(response)
                    }
                }
            }
            fetchSupportedTokens()

            const fetchTokensData = async () => {
                const user = await getWalletClient();
                const tokensData = await apiService.getTokenBalances(currentChainId(), user.address);
                setTokensData(tokensData);
            }
            fetchTokensData()
        } catch (error) {
            console.error("Error fetching supported tokens:", error);
        }
    }, [isConnected, formValues.symbol, formValues.vaultType, formValues.durationType]);

    useEffect(() => {
        if (isConnected && supportedTokens.length > 0) {
            const token = supportedTokens.find(token => token.symbol === formValues.symbol);
            if (token) {
                setIsAaveSupported(token.aave);
            }
        }
    }, [isConnected, formValues.symbol, formValues.vaultType, formValues.durationType]);

    const TITLE_WORD_LIMIT = 5;

    const hasSufficientBalance = (): boolean => {
        const token = tokensData.find(t => t.symbol === formValues.symbol);
        const availableBalance = token ? Number(token.balance) : 0;
        const amountToLock = parseFloat(formValues.totalAmount);
        return availableBalance < amountToLock
    }

    const countWords = (text: string): number => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const convertToDays = (durationType: string, duration: number): number => {
        const conversionRates: { [key: string]: number } = {
            'days': 1,
            'weeks': 7,
            'months': 30, // Assuming 30 days per month for simplicity
            'years': 365, // Not accounting for leap years
        };
    
        const normalizedType = durationType.toLowerCase();
    
        return duration * conversionRates[normalizedType];
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement  | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'title') {
            const words = countWords(value);
            if (words <= TITLE_WORD_LIMIT || value.length < formValues.title.length) {
                setFormValues(prev => ({ ...prev, [name]: value }));
            }
        } 

        if (name === "lockPeriod") {
            const numericValue = parseInt(value, 10);
            const max = durationLimits[formValues.durationType];

            if (numericValue > max) {
                // If user enters a value higher than max, ignore the update or clamp it
                setFormValues(prev => ({
                    ...prev,
                    [name]: max.toString(), // or just skip the update
                }));
                return;
            }
        }  
        
        setFormValues(prev => ({ ...prev, [name]: value }));
        
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsLoading(true)
        try {
            //get vault and duration in day
            const days = convertToDays(formValues.durationType,Number(formValues.lockPeriod))

            const chainID = currentChainId()

            //get asset decimals
            const tokenDecimals = await apiService.getTokenData(formValues.symbol, chainID)
            if(!tokenDecimals) {
                throw new Error('Token Decimals Not Retrieved!')
            }

            const deposit = Math.floor(Number(formValues.totalAmount))

            //lock asset
            let tx = await createTokenVault(
                {
                    symbol: formValues.symbol, 
                    title: formValues.title, 
                    totalAmount: deposit.toString(), 
                    vaultType: formValues.vaultType, 
                    lockPeriod: days, 
                    slip: 0, 
                    unLockDuration: formValues.unLockDuration.length > 0 ? Math.floor(Number(formValues.unLockDuration)) : 0,
                    unLockAmount: formValues.unLockAmount.length > 0 ? Math.floor(Number(parseUnits(formValues.unLockAmount, tokenDecimals.decimals))) : 0,
                    unLockGoal: formValues.unLockGoal.length > 0 ? Math.floor(Number(formValues.unLockGoal)) : 0
                }
            )
            if(tx) {
                setShowSuccessModal(true)
                setShowConfirmModal(false)
                //toast
                // toast({
                //     title: `${formValues.title.toUpperCase()}`,
                //     description: `Vault has been Created Successfully`,
                //     action: (
                //         <ToastAction 
                //             altText="View Transaction"
                //             onClick={() => window.open(
                //                 chainID === 84532 
                //                 ? `https://base-sepolia.blockscout.com/tx/${tx}` 
                //                 : `https://base.blockscout.com/tx/${tx}`
                //                 , '_blank'
                //             )}
                //         >
                //             View Transaction
                //         </ToastAction>
                //     )
                // });
                //earn points
                const { address } = await getWalletClient();
                const chainInfo = await apiService.getChainData(chainID);
                const result = await apiService.earnPoints(chainID, address, chainInfo.lockAsset, Number(formValues.totalAmount), days)
                console.log("Points Earned:", result.status);

                navigate("/myvaults")
            }
            
        } catch (error:any) {
            console.error("Failed to create campaign:", error.message);
            toast({
                variant: "destructive",
                title: "ERROR",
                description: error.message
            })
            setShowConfirmModal(false)
        } finally {
            //clear form
            setFormValues({
                symbol: "", 
                title: "", 
                totalAmount: "", 
                vaultType: "Fixed", 
                lockPeriod: "", 
                slip: "", 
                unLockDuration: "", 
                unLockAmount: "", 
                unLockGoal: "",
                durationType: 'days'
            })
            //set loading to false
            setIsLoading(false)
        }
    }

    const durationPlaceholders: Record<string, string> = {
        days: "1 - 6 days",
        weeks: "1 - 3 weeks",
        months: "1 - 11 months",
        years: "1 - 5 years",
    };

    const durationLimits: Record<string, number> = {
        days: 6,
        weeks: 3,
        months: 11,
        years: 5,
    }

    const remainingTitleWords = TITLE_WORD_LIMIT - countWords(formValues.title);

    let toUnlockTotal = 0;
    let notShow = false;
    let amountFine = false;
    if(
        formValues.unLockDuration.length > 0 && 
        formValues.unLockAmount.length > 0 &&
        formValues.lockPeriod.length > 0 &&
        formValues.durationType !== 'days'
    ) {
        notShow = true;
        toUnlockTotal = Number(formValues.unLockAmount) * Math.floor(convertToDays(formValues.durationType,Number(formValues.lockPeriod)) / Number(formValues.unLockDuration));
        amountFine = toUnlockTotal > 1 && toUnlockTotal <= Number(formValues.totalAmount);
    }

  return (
    <div className="bg-gray-900">
        <div className="m-2 p-2 flex flex-col justify-center items-center rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-left">Create New Vault</h2>
            <form onSubmit={handleSubmit} className="w-full p-1">
                <div className="mb-2">
                    <Label className="mb-2">Vault Name</Label>
                    <Input 
                        type="text" 
                        id="title"
                        name="title"
                        value={formValues.title}
                        onChange={handleChange}
                        className="text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-gray-700" 
                        placeholder="eg. Longtime saving" 
                        required
                    />

                    <div className={`text-sm ${remainingTitleWords < 3 ? 'text-red-500' : 'text-gray-500'} text-right`}>
                        {remainingTitleWords} words remaining
                    </div>
                </div>

                <div className="w-full space-y-2 mb-4">
                    <Label>
                        Vault Type
                    </Label>
                    <div className="relative">
                        <select onChange={handleChange} required value={formValues.vaultType} name="vaultType" id="" className="appearance-none w-full px-3 py-2 rounded-md first-letter:bg-transparent bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700">
                            <option className="text-white" value="fixed">Fixed</option>
                            <option className="text-white" value="goal">Goal Based</option>
                            <option className="text-white" value="schedule">Scheduled</option>
                        </select>
                        <div className="pointer-events-none absolute top-2 bottom-2 right-2 flex items-center text-white">
                            <ChevronDown size={15} strokeWidth={2.5}/>
                        </div>
                    </div>

                </div>
                
                <div className="flex gap-x-4 items-center mb-2" >
                    <div className="space-y-2 w-1/2">
                    <label
                        htmlFor="tokenType"
                        className="block text-sm font-semibold"
                    >
                        Token Type
                    </label>

                    <div className="relative">
                        <select
                        onChange={handleChange}
                        value={formValues.symbol}
                        required
                        name="symbol"
                        id="tokenType"
                        className="w-full appearance-none bg-gray-800 mb-2 text-white border border-gray-700 text-sm rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                        <option className="text-white" value="">
                            Select Token
                        </option>
                        {supportedTokens.map((token, index) => (
                            <option
                            key={index}
                            className="text-white"
                            value={token.symbol}
                            >
                            {token.symbol}
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute top-0 bottom-2 right-2 flex items-center text-white">
                            <ChevronDown size={15} strokeWidth={2.5}/>
                        </div>
                    </div>

                    {isAaveSupported && (
                        <span className="inline-block text-sm px-2 py-1 rounded bg-green-500 text-white">
                        aave
                        </span>
                    )}
                    </div>
                    <div className="space-y-2 w-1/2">
                        <Label>Amount</Label>
                            <Input 
                                type="text" 
                                id="totalAmount"
                                name="totalAmount"
                                value={formValues.totalAmount}
                                onChange={handleChange}
                                className="text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700" 
                                placeholder="e.g 100"
                                required
                            />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 w-full mb-6">
                {/* Duration Section */}
                <div className="w-full md:w-1/2 space-y-2">
                  <label
                    htmlFor="durationType"
                    className="block text-sm font-semibold"
                  >
                    Duration
                  </label>
                  <div className="relative">
                  <select
                    onChange={handleChange}
                    required
                    value={formValues.durationType}
                    name="durationType"
                    id="durationType"
                    className="appearance-none w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  > 
                    {
                        formValues.vaultType !== 'schedule' && (
                            <option className="text-white" value="days">Day(s)</option>
                        )
                    }
                    <option className="text-white" value="weeks">Week(s)</option>
                    <option className="text-white" value="months">Month(s)</option>
                    <option className="text-white" value="years">Year(s)</option>
                  </select>
                    <div className="pointer-events-none absolute top-2 bottom-2 right-2 flex items-center text-white">
                        <ChevronDown size={15} strokeWidth={2.5}/>
                    </div>
                  </div>
                </div>

                  {/* Period Input Section */}
                  <div className="w-full md:w-1/2 space-y-2">
                    <label
                      htmlFor="lockPeriod"
                      className="block text-sm font-semibold"
                    >
                      Period
                    </label>
                    <input
                      type="text"
                      id="lockPeriod"
                      name="lockPeriod"
                      value={formValues.lockPeriod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={durationPlaceholders[formValues.durationType]}
                      required
                    />
                  </div>
                </div>

                <div className={`${formValues.vaultType !== 'goal' && 'hidden'}`}>
                <h3 className="text-center font-semibold mb-2">Goal details</h3>
                <Label className={` mb-2 font-semibold`}>
                    Goal Amount
                </Label>
                    <Input 
                        type="text" 
                        id="unLockGoal"
                        name="unLockGoal"
                        value={formValues.unLockGoal}
                        onChange={handleChange}
                        className="text-white w-full rounded-md bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700" 
                        placeholder="5000"
                        disabled={formValues.vaultType !== 'goal'}
                        required
                    />
                </div>
                <div className={`${formValues.vaultType !== 'schedule' && 'hidden'} mb-4`}>
                <h3 className="text-center font-semibold mb-2">Unlock details</h3>
                <Label className={`mb-2`}>
                    Unlock Amount
                </Label>
                    <Input 
                        type="text" 
                        id="unLockAmount"
                        name="unLockAmount"
                        value={formValues.unLockAmount}
                        onChange={handleChange}
                        className="text-white w-full p-2 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-gray-700" 
                        placeholder="500"
                        disabled={formValues.vaultType !== 'schedule'}
                        required
                    />
                </div>

                <div className={`${formValues.vaultType !== 'schedule' && 'hidden'} `}>
                <Label className={`mb-2 `}>
                    After Every
                </Label>
                    <Input
                        type="text"
                        id="unLockDuration"
                        name="unLockDuration"
                        value={formValues.unLockDuration}
                        onChange={handleChange}
                        className="text-white p-2 bg-gray-800 focus:ring-2 focus:ring-purple-500 border border-gray-700" 
                        placeholder="10 days"
                        disabled={formValues.vaultType !== 'schedule'}
                        required
                    />
               
                </div>

                <div className="w-full text-center flex flex-col items-center">
                    <span className={`text-sm text-gray-400 my-3 ${!amountFine && 'text-red-600'} ${!notShow && 'hidden'} ${formValues.vaultType !== 'schedule' && 'hidden'}`}>
                        {`Unlock ${Math.floor(Number(formValues.unLockAmount))} ${formValues.symbol} After Every ${Math.floor(Number(formValues.unLockDuration))} days, Total Amount: ${Math.floor(Number(toUnlockTotal))}`}
                    </span>
                </div>
                <div className="p-1 flex justify-center mt-2">
                    <button 
                        type="button"
                        onClick={handleConfirmCreationClick} 
                        className="btn w-3/4 text-base text-white border-none bg-gradient-to-r from-purple-500 to-pink-500 transform transition-transform duration-150 hover:scale-95"
                        disabled={formValues.vaultType === 'schedule' && !amountFine}
                    >
                        Create Vault <ArrowRight size={20} />
                    </button>
                </div>
            </form>
        </div>
        {showConfirmModal && (
        <dialog open className="modal">
            <div className="modal-box bg-gray-800">
                <h3 className="font-bold text-lg text-center">Confirm Vault Creation</h3>
                <div className="py-4 px-4 mt-6 space-y-3 bg-[#1d3d36] rounded-lg ">
                    <div>
                        <div className="flex justify-between">
                            <p>Vault Name:</p>
                            <p> {formValues.title}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Vault Type:</p>
                            <p className="capitalize"> {formValues.vaultType}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Initial Amount:</p>
                            <p>{Math.floor(Number(formValues.totalAmount))} {formValues.symbol}</p>
                        </div>
                        {formValues.vaultType === "goal" && (
                            <>
                            <div className="flex justify-between">
                                <p>Goal Amount:</p>
                                <p>{Math.floor(Number(formValues.unLockGoal))} {formValues.symbol}</p>
                            </div>
                            </>
                        )}
                        <div className="flex justify-between">
                            <p>Lock Period:</p>
                            <p> {Math.floor(Number(formValues.lockPeriod))} {formValues.durationType}</p>
                        </div>
                        {formValues.vaultType === "schedule" && (
                            <>
                            <div className="flex justify-between">
                                <p>Unlock Amount:</p>
                                <p>{Math.floor(Number(formValues.unLockAmount))} {formValues.symbol}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>After Every:</p>
                                <p> {Math.floor(Number(formValues.unLockDuration))} days</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Amount per unlock:</p>
                                <p> ${Math.floor(Number(toUnlockTotal))}</p>
                            </div>
                            </>
                        )}
                    </div>
                    <div className="px-3 py-3 bg-gray-300/10 rounded-md">
                        <p className="text-gray-400 text-sm">Estimated Earnings</p>
                        <div className="flex justify-between">
                            <p>Yield Percentage:</p>
                            <p>4%</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Points to earn</p>
                            <p>{Math.floor(Number(formValues.totalAmount)) + Math.floor(convertToDays(formValues.durationType,Math.floor(Number(formValues.lockPeriod))) * 0.5)} points</p>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm">
                            <p>Service Fee</p>
                            <p>{0.005 * Math.floor(Number(formValues.totalAmount))} {formValues.symbol}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                            <p>To Lock</p>
                            <p>{Math.floor(Number(formValues.totalAmount)) - 0.005 * Math.floor(Number(formValues.totalAmount))} {formValues.symbol}</p>
                        </div>
                    </div>
                </div>
                    <div className={`bg-red-400 flex flex-col items-center justify-start p-4 rounded-lg mt-4 text-md ${currentChainId() !== 8453 && 'hidden' }`}>
                        <div className="flex items-center justify-between w-full">
                            <span className="font-bold">🛡️ MetaMask Security Notice</span>
                            <span>
                                {
                                    showSecurityNotice ? 
                                    <ChevronUp size={20} onClick={() => setShowSecurityNotice(false)} className="cursor-pointer" /> : 
                                    <ChevronDown size={20} onClick={() => setShowSecurityNotice(true)} className="cursor-pointer" />
                                }
                            </span>
                        </div>
                        <div className={`${showSecurityNotice ? 'block' : 'hidden'} flex flex-col items-start justify-start mt-2`}>
                            <span>
                                MetaMask might show a warning about this transaction because we're 
                                requesting token approval. This is standard for DEX operations.
                            </span>
                            <span className="mt-2 flex flex-col">
                                <span>What's happening:</span>
                                <span>- We need permission to swap your tokens</span>
                                <span>- Only the exact amount you specify</span>
                                <span>- Our contract is verified and audited</span>
                                <span>- You can revoke this anytime</span>
                            </span>
                        </div>
                    </div>
                <div className="modal-action">
                    <Button 
                        className="bg-red-500 hover:scale-95 hover:bg-red-500" 
                        onClick={handleCancel}
                        disabled={showSecurityNotice}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 hover:scale-95"
                        onClick={handleSubmit}
                        disabled={showSecurityNotice}
                    >
                        {
                            isLoading ? (
                                <>
                                    <span className="loading loading-ring loading-xs"></span>
                                    <span>Creating ...</span>
                                </>
                            ) : 'Create Vault'
                        }
                    </Button>
                </div>
            </div>
        </dialog>
        )}
        {showSuccessModal && (
          <dialog id="success_modal" className="modal" open>
            <div className="modal-box bg-gray-800 text-white flex flex-col justify-center items-center">
              <CheckCircle size={40} className="text-green-500"/>
              <h3 className="font-bold text-lg">Success!</h3>
              <p className="py-4">Your vault was created successfully!</p>
              <Button
                className="bg-green-500 hover:bg-green-600 px-6 text-white"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </Button>
            </div>
          </dialog>
        )}
    </div>
  )
}