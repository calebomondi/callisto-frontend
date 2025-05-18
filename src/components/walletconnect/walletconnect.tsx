// src/components/WalletConnectFlow.tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export const CustomConnectButton = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        if (!mounted) return null;
        
        return (
          <button
            onClick={openConnectModal}
            className="md:px-6 px-4 py-3 bg-amber-500 rounded-lg text-base font-semibold hover:bg-amber-500 hover:scale-105 transition-all flex items-center btn-sm"
          >
            Launch App
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
};
