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
            className="md:px-8 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-lg font-semibold hover:scale-105 transition-all"
          >
            Connect Wallet
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
};
