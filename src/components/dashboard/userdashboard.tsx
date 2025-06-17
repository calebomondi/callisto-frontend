import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, ResponsiveContainer } from 'recharts';
import { UserVaultDashboardProps } from '@/types/index.types';
import Sidebar from './sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  // ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import LockAsset from './lockAsset';
import { Plus } from "lucide-react"; 
import { VaultData } from "@/types/index.types";
import VaultDetails from './vaultdetails';
import TransactionDashboard from './transacHist';
import { useAccount } from 'wagmi';

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
}
/*
interface Activity {
  type: string;
  amount: string;
  vault: string;
  timestamp: string;
  txHash: string;
  status: string;
}

const recentActivity: Activity[] = [
    {
      type: "Deposit",
      amount: "1.2 ETH",
      vault: "Long-term Savings",
      timestamp: "2 hours ago",
      txHash: "0x1234...5678",
      status: "Confirmed",
    },
    {
      type: "Vault Created",
      amount: "2.5 ETH",
      vault: "Emergency Fund",
      timestamp: "1 day ago",
      txHash: "0x8765...4321",
      status: "Confirmed",
    },
    {
      type: "Lock Period Extended",
      amount: "0.5 ETH",
      vault: "Education Fund",
      timestamp: "3 days ago",
      txHash: "0x9876...1234",
      status: "Confirmed",
    },
];
*/
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const UserVaultDashboard: React.FC<UserVaultDashboardProps> = ({ data }) => {
  const { isConnected } = useAccount();
  const [selectedView, setSelectedView] = useState<{
    type: "overview" | "assets" | "analytics" | "vault";
    vault?: VaultData;
  }>({ type: "analytics" });

  const [modalKey, setModalKey] = useState(0);

  const handleModalClose = () => {
    const modal = document.getElementById('my_modal_4') as HTMLDialogElement;
    modal.close();
    setModalKey(prev => prev + 1);
  };

  if (!data) {
    return <p className='text-center text-lg my-4'>
      <span className="loading loading-spinner loading-xl text-purple-600"></span>
    </p>
  }

  const renderOverview = (): JSX.Element => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total value card */}
      <div className="p-6 rounded-lg shadow-md border dark:border-gray-800">
        <h3 className="text-sm text-gray-400">Total Locked Value</h3>
        <p className="text-2xl font-bold mt-2">{formatCurrency(data.totalValueUSD)}</p>
        <p className="text-sm text-gray-500 mt-1">Across {data.totalVaults} vaults</p>
      </div>
      
      {/* Average lock time */}
      <div className="p-6 rounded-lg shadow-md border dark:border-gray-800">
        <h3 className="text-sm text-gray-400">Average Lock Time</h3>
        <p className="text-2xl font-bold mt-2">{Math.round(data.avgLockDays)} days</p>
        <p className="text-sm text-gray-500 mt-1">All assets combined</p>
      </div>
      
      {/* Lock Types */}
      <div className="p-6 rounded-lg shadow-md border dark:border-gray-800">
        <h3 className="text-sm text-gray-400">Lock Types</h3>
        <div className="flex justify-around items-center mt-2">
          <div className="text-center">
            <p className="text-2xl font-bold">{data.lockTypeCounts.fixed}</p>
            <p className="text-sm text-gray-500">Fixed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold ">{data.lockTypeCounts.goal}</p>
            <p className="text-sm text-gray-500">Goal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{data.lockTypeCounts.scheduled}</p>
            <p className="text-sm text-gray-500">Scheduled</p>
          </div>
        </div>
      </div>
      
      {/* Upcoming unlocks */}
      <div className="dark:bg-gray-900/50 border dark:border-gray-800 rounded-lg shadow-md p-6  md:col-span-2">
        <h3 className="text-xl font-semibold">Upcoming Unlocks (Next 7 Days)</h3>
        {data.upcomingUnlocks.length > 0 ? (
          <div className="mt-2 overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow className="dark:border-gray-800 hover:bg-gray-800/20">
                  <TableHead className="text-gray-400 font-medium">Title</TableHead>
                  <TableHead className="text-gray-400 font-medium">Asset</TableHead>
                  <TableHead className="text-gray-400 font-medium">Amount</TableHead>
                  <TableHead className="text-gray-400 font-medium">Unlock Date</TableHead>
                  <TableHead className="text-gray-400 font-medium">Days Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {data.upcomingUnlocks.map((unlock) => (
                  <TableRow key={unlock.id} className="dark:border-gray-800 hover:bg-gray-800/20">
                    <TableCell className="px-4 py-2 whitespace-nowrap">{unlock.title}</TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">{unlock.asset}</TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">{unlock.amount}</TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">{new Date(unlock.unlockDate).toLocaleDateString()}</TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {unlock.daysRemaining} days
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No unlocks expriring in the next 7 days</p>
        )}
      </div>
      
      {/* Asset distribution */}
      <div className="p-4 dark:bg-gray-900/50 border dark:border-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-1">Asset Distribution</h3>
        <p className="text-gray-400 text-sm">Distribution of locked assets</p>
        <div  className="flex flex-col items-center justify-center gap-2">
          <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.assetValues}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={60}
                  paddingAngle={5}
                  fill="#8884d8"
                  dataKey="valueUSD"
                  nameKey="symbol"
                  // label={({ symbol, percent }) => `${symbol} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.assetValues.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-evenly w-full space-x-4">
            {data.assetValues.map((asset, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} // Use corresponding color
                  />
                  <div>
                    <p className="font-medium">{asset.symbol}</p>
                    <p className="text-sm text-gray-400">
                      ${Math.floor(asset.valueUSD)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Recent Activity 
         <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button
              variant="outline"
              className="dark:text-gray-400 dark:border-gray-800 hover:bg-gray-300"
            >
              View All
            </Button>
          </div>
          <div className="rounded-lg border dark:border-gray-800 dark:bg-gray-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-800 hover:bg-gray-800/20">
                    <TableHead className="text-gray-400 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium">
                      Amount
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium">
                      Vault
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium">
                      Time
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium">
                      Transaction
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, index) => (
                    <TableRow
                      key={index}
                      className="dark:border-gray-800 hover:bg-gray-800/20"
                    >
                      <TableCell className="font-medium py-4">
                        {activity.type}
                      </TableCell>
                      <TableCell className="py-4">{activity.amount}</TableCell>
                      <TableCell className="py-4">{activity.vault}</TableCell>
                      <TableCell className="py-4">
                        {activity.timestamp}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          {activity.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <a
                          href={`https://etherscan.io/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-500 hover:text-purple-400"
                        >
                          {activity.txHash}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div> */}
    </div>
  );
  
  const renderAssets = (): JSX.Element => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Asset Overview</h3>
      
      {/* Asset details table */}
      <div className="dark:bg-gray-900/50 border dark:border-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table className="min-w-full divide-y dark:divide-gray-600">
          <TableHeader>
            <TableRow className="dark:border-gray-800 hover:bg-gray-800/20">
              <TableHead className="text-gray-400 font-medium">Asset</TableHead>
              <TableHead className="text-gray-400 font-medium">Total Amount</TableHead>
              <TableHead className="text-gray-400 font-medium">Current Value</TableHead>
              <TableHead className="text-gray-400 font-medium">Avg Lock Period</TableHead>
              <TableHead className="text-gray-400 font-medium">Lock Types</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.assetValues.map((asset) => {
              const avgDaysAsset = data.avgLockDaysByAsset.find(a => a.symbol === asset.symbol);
              const avgDays = avgDaysAsset ? avgDaysAsset.avgDays : 0;
              const lockTypes = data.lockTypeByAsset[asset.symbol] || { fixed: 0, goal: 0, scheduled: 0 };
              
              return (
                <TableRow key={asset.address} className="dark:border-gray-800 hover:bg-gray-800/20">
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg border dark:border-gray-800 flex items-center justify-center text-lg font-bold">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-600">{asset.symbol}</div>
                        <div className="text-xs text-gray-500 truncate w-32" title={asset.address}>
                          {asset.address.substring(0, 6)}...{asset.address.substring(asset.address.length - 4)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className=" py-4">
                    <div className="text-sm">{asset.totalAmount} {asset.symbol}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm">{formatCurrency(asset.valueUSD)}</div>
                    <div className="text-xs text-gray-400">@ {formatCurrency(asset.price)} per {asset.symbol}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm">{Math.round(avgDays)} days</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Fixed: {lockTypes.Fixed}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Goal: {lockTypes.goal}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Scheduled: {lockTypes.schedule}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Total: {lockTypes.Fixed + lockTypes.goal + lockTypes.schedule}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Asset lock duration chart */}
      <div className="w-1/2 mt-6 dark:bg-gray-900/50 border dark:border-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium">Average Lock Duration by Asset</h3>
        <div className="h-64 mt-4">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={data.avgLockDaysByAsset}
              // margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              //strokeDasharray="3 3"
            >
              <CartesianGrid  vertical={false} />
              <XAxis
                dataKey="symbol"
                tickLine={false}
                className="font-bold"
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)} 
              />
              {/* <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} /> */}
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                // formatter={(value) => [`${Math.round(Number(value))} days`, 'Avg Lock Period']} 
              />
              <Bar dataKey="avgDays" fill="#8884d8"  radius={10}  name="Average Lock Days" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );

  const renderVaultDetail = (vaultData: VaultData): JSX.Element => (
    <VaultDetails vault={vaultData} showNavbar={false} />
  );

  const renderAnalytics = (): JSX.Element => (
    <TransactionDashboard />
  );

  const handleVaultSelect = (selection: { type: "overview" | "assets" | "analytics" | "vault"; vault?: VaultData })  => {
    setSelectedView(selection);
  };
  
  return (
    // <div className=" px-2 sm:px-2 lg:px-8 py-2 min-h-screen bg-[#1a1122]">
    //   <Sidebar onVaultSelect={handleVaultSelect} />
    //   {/* Navigation tabs */}
    //   {/* <div className="border-b dark:border-gray-600 border-gray-300 mb-6 sticky top-20 dark:bg-black bg-white shadow-md dark:bg-opacity-70 px-3 rounded-sm z-10">
    //     <nav className="-mb-px flex space-x-8">
    //       {[
    //         { id: 'overview' as const, label: 'Overview' }, 
    //         { id: 'assets' as const, label: 'Assets' }, 
    //       ].map((tab) => (
    //         <button
    //           key={tab.id}
    //           onClick={() => setSelectedTab(tab.id)}
    //           className={`
    //             py-4 px-1 border-b-2 font-medium text-sm
    //             ${selectedTab === tab.id
    //               ? 'border-amber-500 text-amber-600'
    //               : 'border-transparent text-amber-400  hover:dark:text-gray-600 hover:border-gray-300'}
    //           `}
    //         >
    //           {tab.label}
    //         </button>
    //       ))}
    //     </nav>
    //   </div> */}
      
    //   {/* Tab content */}
    //   {/* <div className="mt-6">
    //     {selectedTab === 'overview' && renderOverview()}
    //     {selectedTab === 'assets' && renderAssets()}
    //   </div> */}
    // </div>

    <div className='flex dark:bg-gradient-to-b from-gray-900 to-black h-screen overflow-hidden'>
      <Sidebar onVaultSelect={handleVaultSelect} />

      {/* Right section: Graphs, Distribution, Unlocks (spans 2 columns) */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {selectedView.type === "overview" && "Overall Dashboard"}
            {selectedView.type === "assets" && "Assets Dashboard"}
            {selectedView.type === "vault" && "Vault Dashboard"}
            {selectedView.type === "analytics" && "Wallet Analytics"}
          </h1>
          <Button
            className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white  transform transition-transform duration-150 hover:scale-95 ${!isConnected && 'hidden'}`}
            onClick={() => (document.getElementById('my_modal_4') as HTMLDialogElement).showModal()}
          >
            <Plus className="w-4 h-4 mr-1" /> Create New Vault
          </Button>
          <dialog id="my_modal_4" className="modal">
            <div className="modal-box dark:bg-gray-900">
              <form method="dialog">
                <button
                 className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                 onClick={handleModalClose}
                >
                  ✕
                </button>
              </form>
              <LockAsset key={modalKey} />             
            </div>
          </dialog>
        </div>
        {/* {renderOverview()}
        {selectedVault && renderAssets()} */}
        {selectedView.type === "overview" && renderOverview()}
        {selectedView.type === "assets" && renderAssets()}
        {selectedView.type === "vault" && selectedView.vault && renderVaultDetail(selectedView.vault)}
        {selectedView.type === "analytics" && renderAnalytics()}
      </div>
    </div>
  );
};

export default UserVaultDashboard;