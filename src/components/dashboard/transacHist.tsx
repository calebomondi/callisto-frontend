import { useState, useMemo, useEffect } from 'react';
import { 
  AlertCircle,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import {
  // ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAccount } from 'wagmi';
import { CustomTooltipProps, AnalysisData } from '@/types/index.types';
import { sampleAnalyzedData } from './mockplatformdata';
import apiService from '@/backendServices/apiservices';
import { currentChainId } from '@/blockchain-services/useFvkry';
import { getWalletClient } from '@/blockchain-services/useFvkry';
import WalletCharacter from './walletcharacter';
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

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

const TransactionDashboard = () => {
  const { isConnected } = useAccount();
  const [analysisData, setAnalysisData] = useState<AnalysisData>(sampleAnalyzedData);

  useEffect(() => {
    if(isConnected) {
      const fetchData = async () => {
        const chainId = currentChainId()
        const user = await getWalletClient();
        const data = await apiService.getTransactionHistory(chainId, user.address)
        // const data = await apiService.getTransactionHistory(8453, "0xcB1C1FdE09f811B294172696404e88E658659905")
        if(data) {
            setAnalysisData(data)
        }
      }

      fetchData()
    } else {
      setAnalysisData(sampleAnalyzedData);
    }
  }, [isConnected]);

  const formatCurrency = (value:number, currency = 'ETH') => {
    if (Math.abs(value) > 1000000) {
      return `${(value / 1000000).toFixed(2)}M ${currency}`;
    }
    if (Math.abs(value) > 1000) {
      return `${(value / 1000).toFixed(2)}K ${currency}`;
    }
    return `${value.toFixed(6)} ${currency}`;
  };

  const categoryPieData = useMemo(() => {
    return Object.entries(analysisData.categories).map(([category, data], index) => ({
      name: category.replace('_', ' ').toUpperCase(),
      value: data.count,
      color: COLORS[index % COLORS.length]
    }));
  }, [analysisData]);

  const monthlyChartData = useMemo(() => {
    return Object.entries(analysisData.monthlyBreakdown).map(([month, data]) => ({
      month: month,
      transactions: data.transactions,
      gasFees: parseFloat((data.gasFees * 1000).toFixed(4)), // Convert to readable scale
      volume: data.volume || 0
    }));
  }, [analysisData]);

//   const gasFeesByCategory = useMemo(() => {
//     return Object.entries(analysisData.categories).map(([category, data]) => ({
//       category: category.replace('_', ' ').toUpperCase(),
//       gasFees: parseFloat((data.gasFees * 1000).toFixed(4)), // Convert to milli-ETH for readability
//       transactions: data.count
//     })).sort((a, b) => b.gasFees - a.gasFees);
//   }, [analysisData]);

  const topTokensData = useMemo(() => {
    return analysisData.topTokens.slice(0, 6).map(token => ({
      symbol: token.symbol,
      volume: token.totalVolume,
      transactions: token.transactions
    }));
  }, [analysisData]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-500">{label}</p>
          {payload.map((entry, index:number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  /*const convertRiskScoreToBreakdown = (totalScore: number) => ({
  discipline: Math.round(totalScore * 0.35),
  trading: Math.round(totalScore * 0.30),
  risk: Math.round(totalScore * 0.20),
  safety: Math.round(totalScore * 0.15),
  total: totalScore
});

  const getPersonalityType = (score: number) => {
    if (score < 40) return "ZEN_HOLDER";
    if (score < 80) return "CURIOUS_APE";
    return "DEGEN_MONKEY";
  };*/

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-center">
          <p className="text-center">*Based on your wallet's immediate previous <span className="font-bold text-pink-500">{analysisData.summary.totalTransactions}</span> transactions.</p>
        </div>

        <div className='grid grid-cols-1 gap-4'>
          {/**first grid */}
          <div>
            <WalletCharacter
              score={analysisData.behaviorAnalysis.riskScore} 
              frequentTxs={analysisData.behaviorAnalysis.frequentTrading.length}
              impulsiveTxs={analysisData.behaviorAnalysis.impulsiveSpending.length}
            />
          </div>
          {/**Second grid 
          <div>
            <ScoreBreakdown scores={convertRiskScoreToBreakdown(analysisData.behaviorAnalysis.riskScore)}/>
          </div>
          */}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/**first grid */}
          {/* Monthly Activity Line Chart */}
          <div className="rounded-lg p-6 border dark:border-gray-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Monthly Activity Trend</h3>
                <p className="text-sm text-gray-500 italic">Total Transactions and Gas Fees per month</p>
              </div>
              <LineChartIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Transactions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gasFees" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Gas Fees (mETH)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Categories Pie Chart */}
          <div className="p-6 border dark:border-gray-800 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Transaction Categories</h3>
                <p className="text-sm text-gray-500 italic">Distribution of transactions across categories</p>
              </div>
              <PieChartIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div className='flex flex-col'>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-1">
                {categoryPieData.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {/* <p className="text-sm text-gray-400">
                          {asset.value}
                        </p> */}
                      </div>
                    </div>
                    <p className="font-medium">{asset.value}</p>
                  </div>
                ))}
            </div>
            </div>
          </div>
            {/* Top Tokens Volume Chart */}
          <Card className="border dark:border-gray-800 shadow-md">
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>Top Tokens By Volume</CardTitle>
                <p className="text-sm text-gray-500 italic">Total amount sent and received</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={topTokensData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="symbol"
                      tickLine={false}
                      className="font-bold"
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="volume" fill="#60a5fa" radius={10} />
                  </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Behavioral Alerts */}
        {(analysisData.behaviorAnalysis.impulsiveSpending.length > 0 || 
          analysisData.behaviorAnalysis.frequentTrading.length > 0) && (
          <div className="rounded-xl p-6 shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-600">Behavioral Insights & Risk Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.behaviorAnalysis.impulsiveSpending.slice(0, 5).map((alert, index) => (
                <div key={index} className="rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{alert.flag}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-1">{alert.summary}</p>
                  <p className="text-xs text-gray-200">Gas: {formatCurrency(alert.gasFee)} (Avg: {formatCurrency(alert.averageGasFee)})</p>
                </div>
              ))}
              {analysisData.behaviorAnalysis.frequentTrading.slice(0, 5).map((alert, index) => (
                <div key={index} className="rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{alert.flag}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-1">{alert.summary}</p>
                  <p className="text-xs text-gray-200">{alert.timeDifference?.toFixed(1)} minutes apart</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionDashboard;