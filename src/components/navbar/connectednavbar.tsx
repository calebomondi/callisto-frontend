import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
// import LockAsset from "../dashboard/lockAsset";
import { useAccount } from "wagmi";
import { CustomConnectButton } from "../walletconnect/walletconnect";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CircleUserIcon, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
// import { Button } from "../ui/button";Bell
import { TokenBalances } from "@/types/index.types";
import apiService from "@/backendServices/apiservices";
import { currentChainId } from "@/blockchain-services/useFvkry";
import { getWalletClient } from "@/blockchain-services/useFvkry";

export default function ConnectedNavbar() {
  const { isConnected } = useAccount();
  const location = useLocation();

  const [path,setPath] = useState<string>('dashboard');
  const [tokensData, setTokensData] = useState<TokenBalances[]>([]);
  
  useEffect(() => {
    const path = location.pathname.substring(1);
    const pathSegments = path.split('/');
    const firstSegment = pathSegments[0];
    setPath(firstSegment);

    if (isConnected) {
      const fetchTokensData = async () => {
        try {
          const user = await getWalletClient();
          const tokensData = await apiService.getTokenBalances(currentChainId(), user.address);
          setTokensData(tokensData);
        } catch (error) {
          console.error('Error fetching tokens data:', error);
        }
      }

      fetchTokensData();
    }

  }, [isConnected, location.pathname]);

  return (
    <>
    <div className="navbar dark:bg-gray-900 border-b border-gray-800 bg-white sticky top-0 shadow-lg z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <Menu />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li className={path === 'dashboard' ? 'text-purple-600' : ''}>
              <Link to="/dashboard/">Dashboard</Link>
            </li>
            <li>
              <Link to="/myvaults/">My Vaults</Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center md:ml-10">
          <a href="/">
            <img
              src="/new_logo.png"
              alt=""
              className='md:w-6 w-6'
            />
          </a>
        </div>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-semibold">
          <li className={path === 'dashboard' ? 'text-purple-400' : ''}>
            <Link to="/dashboard/">Dashboard</Link>
          </li>
          <li className={path === 'myvaults' ? 'text-purple-400' : ''}>
            <Link to="/myvaults/">My Vaults</Link>
          </li>
          
        </ul>
      </div>
      <div className="navbar-end scale-75">
        {/* <button className={`${!isConnected && 'hidden'} px-12 py-2 btn rounded-lg border-none text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:scale-95`} onClick={() => (document.getElementById('my_modal_4') as HTMLDialogElement).showModal()}>
          Lock
        </button>
        <dialog id="my_modal_4" className="modal">
          <div className="modal-box dark:bg-gray-900">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <LockAsset />             
          </div>
        </dialog> */}
        <div className="hidden md:block ml-4">
          {isConnected ? <ConnectButton /> :<CustomConnectButton />}
        </div>
        <button className="md:hidden btn rounded-md border-none text-base bg-transparent font-semibold hover:scale-95" onClick={() => (document.getElementById('my_modal_5') as HTMLDialogElement).showModal()}>
          <CircleUserIcon className="w-10 h-10"/>
        </button>
        <dialog id="my_modal_5" className="modal">
          <div className="modal-box">
              <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              {isConnected ? <ConnectButton /> :<CustomConnectButton />}              
          </div>
        </dialog>
        {/* <Button
          className="bg-transparent hover:bg-gray-400 w-10 h-10"
        >
          <Bell className="h-5 w-5"  />
        </Button> */}
      </div>
    </div>
    {isConnected && (
      <div className="flex justify-center items-center p-2 text-md gap-2 font-semibold">
        <span className="text-gray-300">Balances:</span>
        {
          tokensData.map((asset, index) => (
            <p key={index} className="flex gap-1">
              <span>{asset.symbol}</span>
              (<span>{Math.floor(parseFloat(asset.balance))}</span>)
            </p>
          ))
        }
      </div>
    )}
    </>
  )
}
