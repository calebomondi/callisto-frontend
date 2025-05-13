import { createPublicClient, createWalletClient, custom, http, parseEther, getContract, parseUnits } from "viem";
import { createConfig } from "wagmi";
import { base, baseSepolia } from '@wagmi/core/chains'
import { getChainId } from '@wagmi/core'

import { ApproveTokenParams, Transaction } from "@/types";
import { TokenVaultParams } from "@/types/index.types";
import apiService from "@/backendServices/apiservices";

import { LOCKASSET_CONTRACT_ABI, ERC20_ABI } from "./core";

//wagmi config and get chain ID
const config = createConfig({
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(`${import.meta.env.VITE_BASE_RPC_URL}`),
        [baseSepolia.id]: http(`${import.meta.env.VITE_BASE_SEP_RPC_URL}`),
    },
})

export const currentChainId = () => {
    const chainId = getChainId(config)
    return chainId
}

//get chain from chainId
const supportedChains: { [key: number]: {chain: any, rpc:string} } = {
    8453: {chain: base, rpc: import.meta.env.VITE_BASE_RPC_URL},
    84532: {chain: baseSepolia, rpc: import.meta.env.VITE_BASE_SEP_RPC_URL},
}

//set up public cient
function getPublicClient() {
    const chainId = currentChainId();
    const thisChain = supportedChains[chainId];
    
    return createPublicClient({
      chain: thisChain.chain,
      transport: http(thisChain.rpc),
    });
}

//get the wallet client using browser wallet
export async function getWalletClient() {
    if(!window.ethereum) {
        throw new Error('Please install MetaMask or another web3 wallet');
    }

    const chainId = currentChainId();
    const thisChain = supportedChains[chainId];

    const walletClient = createWalletClient({
        chain: thisChain.chain,
        transport: custom(window.ethereum)
    })

    const [address] = await walletClient.requestAddresses(); 
    console.log('Connected Address: ', address, 'ChainID: ', chainId);

    return {walletClient, address}
}

//Write Functions

export async function createETHVault(_amount:string, _vault:number, _lockperiod:number, _title: string) {
    try {
        const { walletClient, address } = await getWalletClient();
        const { currentAddress, currentABI } = useCurrentContract()
        const publicClient = getPublicClient()

        //convert days to seconds
        const daysToSeconds = BigInt(_lockperiod * 24 * 60 * 60);

        //convert amount to wei
        const ethToWei = parseEther(_amount);

        //call function
        const { request } = await publicClient.simulateContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: "lockETH",
            args: [ _vault, daysToSeconds, _title],
            account: address,
            value: ethToWei
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error: any) {
        console.log('Error in creating ETH sub-vault', error);

        // Check for custom contract errors
        if (error.message.includes('VaultIsFull')) {
            throw new Error('This vault has reached maximum capacity');
        }
        
        if (error.message.includes('AmountBeGreaterThan0')) {
            throw new Error('Amount must be greater than 0');
        }

        // Handle other common wallet/network errors
        if (error.message.includes('user rejected')) {
            throw new Error('Transaction rejected by user');
        }

        if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient balance for transaction');
        }

        // For any other error, throw the original message
        throw new Error(error.message || 'Transaction failed');
    }

}

export async function addToEthVault(_vault:number, _index:number, _amount:string) {
    try {
        const { walletClient, address } = await getWalletClient();
        const { currentAddress, currentABI } = useCurrentContract()
        const publicClient = getPublicClient()

        //convert amount to wei
        const ethToWei = parseEther(_amount);

        //call function
        const { request } = await publicClient.simulateContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: "addToLockedETH",
            args: [ _vault, _index],
            account: address,
            value: ethToWei
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error: any) {
        // Check for custom contract errors
        if (error.message.includes('InvalidAssetID')) {
            throw new Error('This assetID entered is Invalid!');
        }
        
        if (error.message.includes('LockPeriodExpired')) {
            throw new Error('Lock Period Has Expired!');
        }

        // Handle other common wallet/network errors
        if (error.message.includes('user rejected')) {
            throw new Error('Transaction rejected by user');
        }

        if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient balance for transaction');
        }
    }
}


async function approveToken({symbol, amount}: ApproveTokenParams) {
    try {
        const { walletClient, address } = await getWalletClient()
        const publicClient = getPublicClient()

        // fetch token address  and decimals from db
        const token = await apiService.getTokenData(symbol, currentChainId());

        //get contract instance
        const contract = getContract({
            address: token.address,
            abi: ERC20_ABI,
            client : {
                public: publicClient,
                wallet: walletClient
            }
        });

        //convert to proper decimals
        const amountInWei = parseUnits(amount.toString(), token.decimals);

        // get contract address
        const chainInfo = await apiService.getChainData(currentChainId());

        //send approve transaction
        const hash = await contract.write.approve([chainInfo.lockAsset, amountInWei], { account: address });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        console.log(`receipt => ${receipt}`)

        return {
            tokenAddress: token.address,
            amount: amountInWei,
            walletClient,
            address
        };
    } catch(error: any) {
        throw new Error(`Error approving ${symbol} tokens`)
    }

}   

export async function createTokenVault({ symbol, title, totalAmount, vaultType, lockPeriod, slip, unLockDuration, unLockAmount, unLockGoal }: TokenVaultParams) {
    try {
        //aprove token
        const { tokenAddress, amount: approvedAmount, walletClient, address} = await approveToken({symbol: symbol, amount: BigInt(totalAmount)});
        const publicClient = getPublicClient()

        //chain data
        const chainInfo = await apiService.getChainData(currentChainId());

        //call function
        const { request } = await publicClient.simulateContract({
            address: chainInfo.lockAsset,
            abi: LOCKASSET_CONTRACT_ABI,
            functionName: "createTokenVault",
            args: [ tokenAddress, title, approvedAmount, lockPeriod, vaultType, slip, unLockDuration, unLockAmount, unLockGoal, chainInfo.poolAddress, chainInfo.dataProvider],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash
    } catch (error) {
        console.log('Error in creating token vault', error);
        throw error;
    }
}

export async function addToTokenVault(owner:string, _index:number, _symbol:string, _amount:string) {
    try {
        //aprove token
        const { amount: approvedAmount, walletClient, address} = await approveToken({symbol: _symbol, amount: BigInt(_amount)});
        const publicClient = getPublicClient()

        //chain data
        const chainInfo = await apiService.getChainData(currentChainId());

        //call function
        const { request } = await publicClient.simulateContract({
            address: chainInfo.lockAsset,
            abi: LOCKASSET_CONTRACT_ABI,
            functionName: "depositToken",
            args: [ owner,  _index, approvedAmount, chainInfo.poolAddress, chainInfo.dataProvider],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash
    } catch (error) {
        throw error;
    }
}

export async function withdrawAsset(_index:number, _vault:number, _amount:string, _goal:boolean, _symbol:string) {
    try {
        const { walletClient, address } = await getWalletClient();
        const publicClient = getPublicClient()

        //chain data and token data
        const token = await apiService.getTokenData(_symbol, currentChainId());
        const chainInfo = await apiService.getChainData(currentChainId());

        //parse amount
        const parsedAmount = parseUnits(_amount, token.decimals);

        //call function
        const { request } = await publicClient.simulateContract({
            address: chainInfo.lockAsset,
            abi: LOCKASSET_CONTRACT_ABI,
            functionName: "withdrawAsset",
            args: [ _index, parsedAmount, chainInfo.poolAddress, _goal],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error: any) {
        console.log('Error in Withdrawing', error);
        throw error;
    }
}

export async function deleteLock(_index:number, _vault:number) {
    try {
        const { walletClient, address } = await getWalletClient();
        const { currentAddress, currentABI } = useCurrentContract()
        const publicClient = getPublicClient()

        //call function
        const { request } = await publicClient.simulateContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: "deleteSubVault",
            args: [ _vault,  _index],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash
    } catch (error) {
        console.log('Error in deleting sub vault', error);
        throw error;
    }
}

//Read Functions

export async function getTransanctions(vault:number): Promise<Transaction[] | []> {
    const { address } = await getWalletClient();
    const { currentAddress, currentABI } = useCurrentContract()
    const publicClient = getPublicClient()
    
    try {
        const data = await publicClient.readContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: 'getUserTransactions',
            args: [vault],
            account: address,
          }) as Transaction[];
    
          const formattedData = data.map((tx) => ({
            ...tx,
            amount: BigInt(tx.amount.toString()),
          }));

          return formattedData
          
    } catch (error) {
        console.log('Error in fetching transactions', error);
        throw error;
    }
}