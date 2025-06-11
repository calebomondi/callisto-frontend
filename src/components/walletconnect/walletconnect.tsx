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
            className="md:px-6 px-8 py-3 bg-amber-500 rounded-xl text-lg font-semibold hover:bg-amber-500 hover:scale-105 transition-all"
          >
            Launch App
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
};
