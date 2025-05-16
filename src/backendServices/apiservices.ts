import axios, {AxiosResponse} from 'axios';
import { API_URL } from './apiurl';
import { currentChainId } from '@/blockchain-services/useFvkry';
import { TokenData, ChainData, SupportedTokens, VaultData, VaultTransactions, ScheduledData } from '@/types/index.types';

const apiService = {
    vaultSchedule: async (vaultData:VaultData): Promise<ScheduledData> => {        
        try {
          const response: AxiosResponse<ScheduledData> = await axios.post(
            `${API_URL}/api/vaults/scheduled`,
            {
              vaultData
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
    
          return response.data;
          
        } catch (error) {
          console.error('Asset Locking Failed:', error);
          throw error;
        }
    },
    getChainData: async (chainId: number): Promise<ChainData> => {
      try {
        const response: AxiosResponse<ChainData> = await axios.get(
          `${API_URL}/api/tokens/chain-data`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            params: {
              chainId
            }
          }
        );
  
        return response.data;
        
      } catch (error) {
        console.error('Getting Chain Data Failed:', error);
        throw error;
      }
    },
    getTokenData: async (symbol: string, chainId: number): Promise<TokenData> => {
      try {
        const response: AxiosResponse<TokenData> = await axios.get(
          `${API_URL}/api/tokens/token-data`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            params: {
              symbol,
              chainId
            }
          }
        );
  
        return response.data;
        
      } catch (error) {
        console.error('Getting Token Data Failed:', error);
        throw error;
      }
    },
    getSupportedTokens: async (): Promise<SupportedTokens[]> => {
      const chainId = currentChainId();
      console.log(`Fetching from ${API_URL}/api/tokens/supported-chains with chainId: ${chainId}`);
    
      try {
        const response: AxiosResponse<SupportedTokens[]> = await axios.get(
          `${API_URL}/api/tokens/supported-tokens`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            params: {
              chainId
            }
          }
        );
  
        return response.data;
        
      } catch (error) {
        console.error('Getting Supported Chains Failed:', error);
        // More detailed error logging
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
          console.error('Response headers:', error.response?.headers);
        }
        throw error;
      }
    },
    getUserVaults: async (chainId: number, owner: string, contractAddress: string): Promise<VaultData[]> => {
      try {
        const response: AxiosResponse<VaultData[]> = await axios.get(
          `${API_URL}/api/vaults/get-user-vaults`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            params: {
              owner,
              chainId,
              contractAddress
            }
          }
        );
  
        return response.data;
        
      } catch (error) {
        console.error('Getting User Vaults Failed:', error);
        throw error;
      }
    },
    getVaultTransactions: async (chainId: number, contractAddress: string, owner: string, decimals: number, vaultId: number): Promise<VaultTransactions[]> => {
      try {
        const response: AxiosResponse<VaultTransactions[]> = await axios.get(
          `${API_URL}/api/vaults/get-vault-transactions`,
          {
            params: {
              owner,
              chainId,
              contractAddress,
              decimals,
              vaultId
            }
          }
        );
  
        return response.data;
        
      } catch (error) {
        console.error('Getting Vault Transactions Failed:', error);
        throw error;
      }
    }
}

export default apiService;