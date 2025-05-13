import axios, {AxiosResponse} from 'axios';
import { API_URL } from './apiurl';
import { Send2DB, DashboardData} from '@/types';
import { getWalletClient, currentChainId } from '@/blockchain-services/useFvkry';

import { TokenData, ChainData } from '@/types/index.types';

const apiService = {
    lockAsset: async (formData:Send2DB): Promise<any> => {
        const { address } = await getWalletClient();
        
        try {
          const response: AxiosResponse<any> = await axios.post(
            `${API_URL}/api/write/lockAsset`,
            {
              address,
              lockData: formData
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
    }
}

export default apiService;