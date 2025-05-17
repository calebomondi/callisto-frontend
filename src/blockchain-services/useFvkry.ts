import { createPublicClient, createWalletClient, custom, http, getContract, parseUnits } from "viem";
import { createConfig } from "wagmi";
import { base, baseSepolia } from '@wagmi/core/chains'
import { getChainId } from '@wagmi/core'

import { TokenVaultParams, ApproveTokenParams } from "@/types/index.types";
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
async function approveToken({symbol, amount}: ApproveTokenParams) {
    try {
        const { walletClient, address } = await getWalletClient()
        const publicClient = getPublicClient()

        // fetch token address  and decimals from db
        const token = await apiService.getTokenData(symbol, currentChainId());

        //get contract instance
        const contract = getContract({
            address: token.address as `0x${string}`,
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

        console.log("amount: ", amountInWei, "ChainInfo: ", chainInfo.lockAsset)

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
        console.log(`Error => ${error}`)
        throw new Error(`Error approving ${symbol}`)
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

export async function withdrawAsset(_index:number, _amount:string, _goal:boolean, _symbol:string) {
    try {
        const { walletClient, address } = await getWalletClient()
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
            functionName: "withdraw",
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

export async function deleteLock(_index:number) {
    try {
        const { walletClient, address } = await getWalletClient();
        const publicClient = getPublicClient()

        //chain data
        const chainInfo = await apiService.getChainData(currentChainId());

        //call function
        const { request } = await publicClient.simulateContract({
            address: chainInfo.lockAsset,
            abi: LOCKASSET_CONTRACT_ABI,
            functionName: "deleteVault",
            args: [_index],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash
    } catch (error) {
        console.log('Error in deleting sub vault', error);
        throw error;
    }
}
