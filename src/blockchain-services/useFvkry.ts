import { createPublicClient, createWalletClient, custom, http, parseEther, getContract, parseUnits } from "viem";
import { createConfig } from "wagmi";
import { base, baseSepolia } from '@wagmi/core/chains'
import { getChainId } from '@wagmi/core'
import { ApproveTokenParams, TokenVaultParams,  Transaction } from "@/types";

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
        const { currentAddress, chainId } = useCurrentContract()
        const publicClient = getPublicClient()

        // fetch token address  and decimals from db, pass symbol and network id

        //get token
        const token = getTokenConfig(symbol);

        //get contract instance
        const contract = getContract({
            address: chainId === 4202 ? token.addressLSK : token.addressSEP,
            abi: token.abi,
            client : {
                public: publicClient,
                wallet: walletClient
            }
        });

        //convert to proper decimals
        const amountInWei = parseUnits(amount.toString(), token.decimals);

        //send approve transaction
        const hash = await contract.write.approve([currentAddress, amountInWei], { account: address });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        console.log(`receipt => ${receipt}`)

        return {
            receipt,
            tokenAddress: chainId === 4202 ? token.addressLSK : token.addressSEP,
            amount: amountInWei,
            walletClient,
            address
        };
    } catch(error: any) {
        throw new Error(`Error approving ${symbol} tokens`)
    }

}   

export async function createTokenVault({ symbol, amountT, vault, lockPeriod, title }: TokenVaultParams) {
    try {
        //aprove token
        const { tokenAddress, amount: approvedAmount, walletClient, address} = await approveToken({symbol: symbol, amount: BigInt(amountT)});
        const { currentAddress, currentABI } = useCurrentContract()
        const publicClient = getPublicClient()

        //convert days to seconds
        const daysToSeconds = BigInt(lockPeriod * 24 * 60 * 60);

        //call function
        const { request } = await publicClient.simulateContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: "lockToken",
            args: [ tokenAddress, approvedAmount, vault, daysToSeconds, title],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash
    } catch (error) {
        if (error instanceof Error) {
            // Check for common contract errors
            if (error.message.includes('VaultIsFull')) {
              throw new Error('Vault has reached maximum capacity');
            }
            if (error.message.includes('TokenIsBlackListed')) {
              throw new Error(`Token ${symbol} is blacklisted`);
            }
            if (error.message.includes('InadequateTokenBalance')) {
              throw new Error('Insufficient token balance');
            }
            if (error.message.includes('InvalidTokenAddress')) {
              throw new Error('Invalid token address provided');
            }
        }

        // Re-throw other errors
        throw error;
    }
}

export async function addToTokenVault(_vault:number, _index:number, _symbol:string, _amount:string) {
    try {
        //aprove token
        const { tokenAddress, amount: approvedAmount, walletClient, address} = await approveToken({symbol: _symbol, amount: BigInt(_amount)});
        const { currentAddress, currentABI } = useCurrentContract()
        const publicClient = getPublicClient()

        //call function
        const { request } = await publicClient.simulateContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: "addToLockedTokens",
            args: [ tokenAddress, _index, approvedAmount, _vault],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash
    } catch (error) {
        if (error instanceof Error) {
            // Check for common contract errors
            if (error.message.includes('TokenIsBlackListed')) {
              throw new Error(`Token ${_symbol} is blacklisted`);
            }
            if (error.message.includes('InadequateTokenBalance')) {
              throw new Error('Insufficient token balance');
            }
            if (error.message.includes('InvalidTokenAddress')) {
              throw new Error('Invalid token address provided');
            }
        }

        // Re-throw other errors
        throw error;
    }
}

export async function withdrawAsset(_index:number, _vault:number, _amount:string, _goal:boolean, _decimals:number, _symbol:string) {
    try {
        const { walletClient, address } = await getWalletClient();
        const { currentAddress, currentABI } = useCurrentContract()
        const publicClient = getPublicClient()

        //parse amount
        let parsedAmount;
        if(_symbol === 'ETH') {
            parsedAmount = parseEther(_amount)
        } else {
            parsedAmount = parseUnits(_amount, _decimals)
        }

        //call function
        const { request } = await publicClient.simulateContract({
            address: currentAddress as `0x${string}`,
            abi: currentABI,
            functionName: "withdrawAsset",
            args: [ _index, _vault, parsedAmount, _goal],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error: any) {
        console.log('Error in Withdrawing', error);

        // Check for custom contract errors
        if (error.message.includes('InvalidAssetID')) {
            throw new Error('Invalid Asset ID');
        }
        
        if (error.message.includes('VaultHasBeenFullyWithdrawn')) {
            throw new Error('Vault has been fully withdrawn');
        }

        if (error.message.includes('NotEnoughToWithdraw')) {
            throw new Error('Insufficient balance to withdraw');
        }
        
        if (error.message.includes('LockPeriodNotExpiredAndGoalNotReached')) {
            throw new Error('Lock period not expired and goal not reached');
        }

        if (error.message.includes('ETHTransferFailed')) {
            throw new Error('ETH transfer failed');
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
        if (error instanceof Error) {
            // Check for common contract errors
            if (error.message.includes('LockPeriodNotExpired')) {
              throw new Error('Lock Period Has Not Expired!');
            }
            if (error.message.includes('VaultHasNotBeenFullyWithdrawn')) {
              throw new Error(`Vault Has Not Been Fully Withdrawn!`);
            }
        }

        // Re-throw other errors
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
      console.error('Error fetching user transanctions!:', error)
      throw new Error("Cannot Fetch User Transanctions Data!")
    }
}