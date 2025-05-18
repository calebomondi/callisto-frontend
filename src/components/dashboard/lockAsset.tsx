import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import apiService from "@/backendServices/apiservices";
import { createTokenVault, currentChainId } from "@/blockchain-services/useFvkry";
import { useAccount } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"
import { SupportedTokens, FormValues } from "@/types/index.types";
import { parseUnits } from "viem";

export default function LockAsset() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const { isConnected } = useAccount();

    //form
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formValues, setFormValues] = useState<FormValues>({
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
    const [supportedTokens, setSupportedTokens] = useState<SupportedTokens[]>([])

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
        } catch (error) {
            console.error("Error fetching supported tokens:", error);

        }
    }, []);

    const TITLE_WORD_LIMIT = 5;

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
        } else {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsLoading(true)
        try {
            //validate input data
            if (isNaN(Number(formValues.totalAmount)) || Number(formValues.totalAmount) <= 0.001) {
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

            //set form values according to vault type
            if(formValues.vaultType === 'schedule') {
                formValues.unLockGoal = ''
            }
            if(formValues.vaultType === 'goal') {
                formValues.unLockDuration = ''
                formValues.unLockAmount = ''
            }
            if(formValues.vaultType === 'Fixed') {
                formValues.unLockDuration = ''
                formValues.unLockAmount = ''
                formValues.unLockGoal = ''
            }

            //get vault and duration in day
            const days = convertToDays(formValues.durationType,Number(formValues.lockPeriod))

            const chainID = currentChainId()

            //get asset decimals
            const tokenDecimals = await apiService.getTokenData(formValues.symbol, chainID)
            if(!tokenDecimals) {
                throw new Error('Token Decimals Not Retrieved!')
            }

            //lock asset
            let tx = await createTokenVault(
                {
                    symbol: formValues.symbol, 
                    title: formValues.title, 
                    totalAmount: formValues.totalAmount, 
                    vaultType: formValues.vaultType, 
                    lockPeriod: days, 
                    slip: 0, 
                    unLockDuration: formValues.unLockDuration.length > 0 ? Number(formValues.unLockDuration) : 0,
                    unLockAmount: formValues.unLockAmount.length > 0 ? Number(parseUnits(formValues.unLockAmount, tokenDecimals.decimals)) : 0,
                    unLockGoal: formValues.unLockGoal.length > 0 ? Number(formValues.unLockGoal) : 0
                }
            )
            if(tx) {
                //toast
                toast({
                    title: `${formValues.title.toUpperCase()}`,
                    description: `Vault has been Created Successfully`,
                    action: (
                        <ToastAction 
                            altText="View Transaction"
                            onClick={() => window.open(
                                chainID === 84532 
                                ? `https://base-sepolia.blockscout.com/tx/${tx}` 
                                : `https://base.blockscout.com/tx/${tx}`
                                , '_blank'
                            )}
                        >
                            View Transaction
                        </ToastAction>
                    )
                });

                navigate("/myvaults")
            }
            
        } catch (error:any) {
            console.error("Failed to create campaign:", error.message);
            toast({
                variant: "destructive",
                title: "ERROR",
                description: error.message,
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
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

    //calculate service fee 0.5%
    const formatNumber = (num: number, maxDecimals = 6) => {
        // Handle the floating point precision issue by using toFixed
        // to get a reasonable string representation
        const fixedNum = Number(num.toFixed(maxDecimals));
        
        // Convert to string to handle trailing zeros
        const numStr = fixedNum.toString();
        
        // If it's a whole number, return it as is
        if (!numStr.includes('.')) {
            return numStr;
        }
        
        // For decimal numbers, format with toPrecision to get proper representation
        // then convert to number and back to string to remove trailing zeros
        return Number(parseFloat(numStr).toPrecision(15)).toString();
    };

    const serviceFee = formValues.totalAmount && formatNumber(Number(formValues.totalAmount) * 0.005);

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
        console.log('toUnlockTotal', toUnlockTotal, 'amountFine', amountFine, 'notShow', notShow)
    }

  return (
    <div className="flex justify-center items-center">
        <div className="m-2 p-2 flex flex-col justify-center items-center rounded-lg">
            <h2 className="text-center text-lg font-semibold">Lock Asset</h2>
            <form onSubmit={handleSubmit} className="w-full p-1">
                <div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0 space-y-2 space-x-0 items-center justify-center">
                    <label className="input input-bordered flex items-center justify-between gap-2 font-semibold text-amber-600">
                        Duration
                        <select onChange={handleChange} required value={formValues.durationType} name="durationType" id="" className="bg-transparent outline-none border-none dark:text-white text-gray-700">
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="days">Day(s)</option>
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="weeks">Week(s)</option>
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="months">Month(s)</option>
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="years">Year(s)</option>
                        </select>
                    </label>
                    <label className="input input-bordered flex items-center justify-between gap-2 font-semibold text-amber-600">
                        Vault Type
                        <select onChange={handleChange} required value={formValues.vaultType} name="vaultType" id="" className="bg-transparent outline-none border-none dark:text-white text-gray-700">
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="fixed">Fixed</option>
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="goal">Goal Based</option>
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="schedule">Scheduled</option>
                        </select>
                    </label>
                </div>
                <div className="p-2 grid place-items-center">
                    <label className="input input-bordered flex items-center justify-between gap-2 font-semibold text-amber-600">
                        StableCoin
                        <select 
                            onChange={handleChange} value={formValues.symbol} 
                            name="symbol" id="" 
                            className="bg-transparent outline-none border-none dark:text-white text-gray-700"
                        >
                            <option className="dark:text-white text-gray-700 dark:bg-black/90" value="">Select Token</option>
                            {
                                supportedTokens.map((token, index) => (
                                    <option key={index} className="dark:text-white text-gray-700 dark:bg-black/90" value={token.symbol}>{token.symbol}</option>
                                ))
                            }
                        </select>
                    </label>
                </div>
                <div className="mb-2">
                    <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600">
                        Name
                        <input 
                            type="text" 
                            id="title"
                            name="title"
                            value={formValues.title}
                            onChange={handleChange}
                            className="md:w-5/6 p-2 dark:text-white text-gray-700" 
                            placeholder="Longtime saving" 
                            required
                        />
                    </label>
                    <div className={`text-sm ${remainingTitleWords < 3 ? 'text-red-500' : 'text-gray-500'} text-right`}>
                        {remainingTitleWords} words remaining
                    </div>
                </div>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600">
                    Amount
                    <input 
                        type="text" 
                        id="totalAmount"
                        name="totalAmount"
                        value={formValues.totalAmount}
                        onChange={handleChange}
                        className="dark:text-white text-gray-700 md:w-5/6 p-2" 
                        placeholder="e.g 100"
                        required
                    />
                </label>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600">
                    Period
                    <input 
                        type="text" 
                        id="lockPeriod"
                        name="lockPeriod"
                        value={formValues.lockPeriod}
                        onChange={handleChange}
                        className="md:w-5/6 p-2 dark:text-white text-gray-700" 
                        placeholder={durationPlaceholders[formValues.durationType]} 
                        required
                    />
                </label>
                <label className={`${formValues.vaultType !== 'goal' && 'hidden'} input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600`}>
                    Goal
                    <input 
                        type="text" 
                        id="unLockGoal"
                        name="unLockGoal"
                        value={formValues.unLockGoal}
                        onChange={handleChange}
                        className="dark:text-white text-gray-700 md:w-5/6 p-2" 
                        placeholder="target amount"
                        disabled={formValues.vaultType !== 'goal'}
                        required
                    />
                </label>
                <label className={`${formValues.vaultType !== 'schedule' && 'hidden'} input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600`}>
                    Unlock
                    <input 
                        type="text" 
                        id="unLockAmount"
                        name="unLockAmount"
                        value={formValues.unLockAmount}
                        onChange={handleChange}
                        className="dark:text-white text-gray-700 md:w-5/6 p-2" 
                        placeholder="amount"
                        disabled={formValues.vaultType !== 'schedule'}
                        required
                    />
                </label>
                <label className={`${formValues.vaultType !== 'schedule' && 'hidden'} input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600`}>
                    Every
                    <input 
                        type="text" 
                        id="unLockDuration"
                        name="unLockDuration"
                        value={formValues.unLockDuration}
                        onChange={handleChange}
                        className="dark:text-white text-gray-700 md:w-5/6 p-2" 
                        placeholder="days"
                        disabled={formValues.vaultType !== 'schedule'}
                        required
                    />
                </label>
                <div className="w-full text-center flex flex-col items-center">
                    <span className={`text-sm dark:text-gray-400 my-2 ${formValues.totalAmount.length > 0 ? "" : "hidden"} text-center`}>
                        {`Service Fee: ${serviceFee} - To Lock: ${formatNumber(Number(formValues.totalAmount) - Number(serviceFee))}`} 
                    </span>
                    <span className={`text-sm text-gray-400 my-2 ${!amountFine && 'text-red-600'} ${!notShow && 'hidden'} ${formValues.vaultType !== 'schedule' && 'hidden'}`}>
                        {`Unlock ${formValues.unLockAmount} ${formValues.symbol} After Every ${formValues.unLockDuration} days, Total Amount: ${toUnlockTotal}`}
                    </span>
                </div>
                <div className="p-1 flex justify-center mt-2">
                    <button 
                        type="submit" 
                        className="btn bg-amber-500 w-1/2 text-white text-base border border-amber-500 hover:bg-amber-600"
                        disabled={formValues.vaultType === 'schedule' && !amountFine}
                    >
                        {
                            isLoading ? (
                                <>
                                    <span className="loading loading-ring loading-xs"></span>
                                    <span>Creating ...</span>
                                </>
                            ) : 'Create Vault'
                        }
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}