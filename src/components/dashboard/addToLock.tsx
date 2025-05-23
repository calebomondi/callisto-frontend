import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"
import { VaultData } from "@/types/index.types"
import { addToTokenVault } from "@/blockchain-services/useFvkry";

const handleRefresh = () => {
  window.location.reload();
};

export default function AddToLock({vaultData, chainId}:{vaultData:VaultData, chainId: Number}) {
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formValues, setFormValues] = useState<{amount: string}>({
        amount: ''
    })

    const amount = Number(formValues.amount);
    const validateForm = () => {
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Amount must be a positive number and greater than 0');
        }
        if(vaultData.symbol === "ETH" && amount < 0.001) {
            throw new Error('Amount must be a greater than 0');
        }
        if(vaultData.symbol !== "ETH" && amount < 1) {
            throw new Error('Amount must be a greater than 1');
        }

        return true
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            validateForm();
        
            //add to lock
            let tx = "";

            if (vaultData.symbol !== 'ETH') {
               tx = await addToTokenVault(vaultData.owner, vaultData.vaultId, vaultData.symbol, formValues.amount) || '';
            }        
            if(tx) {
                //toast
                toast({
                    title: `${vaultData.title.toUpperCase()}`,
                    description: `Successfully Added ${formValues.amount} ${vaultData.symbol} To ${vaultData.title}`,
                    action: (
                        <ToastAction 
                            altText="View Transaction"
                            onClick={() => window.open(
                                chainId === 84532 
                                ? `https://base-sepolia.blockscout.com/tx/${tx}` 
                                : `https://base.blockscout.com/tx/${tx}`
                                , '_blank'
                            )}
                        >
                            View Transaction
                        </ToastAction>
                    )
                });
                
                //refresh page
                handleRefresh();
            }

        } catch (error: any) {
            console.error("Failed to create schedule:", error.message);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        } finally {
            //clear form
            setFormValues({
                amount: ''
            })
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center">
            <div className="m-2 p-2 flex flex-col justify-center items-center rounded-lg">
                <h2 className="text-center text-lg font-semibold">Add To Lock ({vaultData.symbol})</h2>
                <form onSubmit={handleSubmit} className="w-full p-1">
                    <div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0 space-y-2 space-x-0 items-center justify-center">
                        <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-amber-600">
                            Amount
                            <input 
                                type="text" 
                                id="amount"
                                name="amount"
                                value={formValues.amount}
                                onChange={handleChange}
                                className="md:w-5/6 p-2 dark:text-white text-gray-700" 
                                placeholder={vaultData.symbol === 'ETH' ? "0.001" : "1"} 
                                required
                            />
                        </label>
                    </div>
                    <div className="p-1 flex justify-center mt-2">
                        <button 
                            type="submit" 
                            className="btn bg-amber-500 w-1/2 text-white text-base border border-amber-500 hover:bg-amber-600"
                        >
                            {isLoading ? 
                                <>
                                    <span className="loading loading-ring loading-xs"></span>
                                    <span>Adding ...</span>
                                </>
                            : 'ADD'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}