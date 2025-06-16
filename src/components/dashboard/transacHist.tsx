import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Shuffle,
  Image,
  Zap,
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
// import { currentChainId } from '@/blockchain-services/useFvkry';
import { getWalletClient } from '@/blockchain-services/useFvkry';

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
        const { address } = await getWalletClient();
        const data = await apiService.getTransactionHistory(8453, "0xcB1C1FdE09f811B294172696404e88E658659905")

        if(data) {
            setAnalysisData(data)
        }
      }

      fetchData()
    } else {
      setAnalysisData(sampleAnalyzedData);
    }
  }, [isConnected]);

  const getCategoryIcon = (category:string) => {
    switch (category.toLowerCase()) {
      case 'token swap': return <Shuffle className="w-4 h-4" />;
      case 'token receive': 
      case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'send':
      case 'token send': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'nft receive':
      case 'nft sale': return <Image className="w-4 h-4" />;
      case 'airdrop': return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskColor = (score:number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg shadow-md p-6 border dark:border-gray-800">
            <h3 className="text-sm text-gray-400">Total Transactions</h3>
            <p className="text-2xl font-bold">{analysisData.summary.totalTransactions}</p>
            <p className="text-xs text-gray-500 mt-1">Immediate previous transactions</p>
          </div>

          <div className="rounded-lg shadow-md p-6 border dark:border-gray-800">
            <h3 className="text-sm text-gray-400">Total Gas Fees</h3>
            <p className="text-2xl font-bold">
              {formatCurrency(analysisData.summary.totalGasFees)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Combined</p>
          </div>

          <div className="rounded-lg shadow-md p-6 border dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400">ETH Net Flow</h3>
                <p className={`text-2xl font-bold ${analysisData.summary.netFlow.ETH >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysisData.summary.netFlow.ETH >= 0 ? '+' : ''}{formatCurrency(analysisData.summary.netFlow.ETH)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analysisData.summary.netFlow.ETH >= 0 ? 'Received more than sent' : 'Sent more than received' }
                </p>
              </div>
              <div>
                {analysisData.summary.netFlow.ETH >= 0 ? 
                  <TrendingUp className="h-5 w-5 text-green-600" /> : 
                  <TrendingDown className="h-5 w-5 text-red-600" />
                }
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-md p-6 border dark:border-gray-800">
              <div>
                <h3 className="text-sm text-gray-400">Risk Score</h3>
                <p className={`text-2xl font-bold ${getRiskColor(analysisData.behaviorAnalysis.riskScore)}`}>
                  {analysisData.behaviorAnalysis.riskScore}/100
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className={`${analysisData.behaviorAnalysis.riskScore < 30 ? "text-green-500"
                   : analysisData.behaviorAnalysis.riskScore < 60 ? "text-blue-500" 
                   : "text-red-500"}`}
                  >{
                    analysisData.behaviorAnalysis.riskScore < 30 ? 'Low' : 
                    analysisData.behaviorAnalysis.riskScore < 60 ? 'Medium' :
                    'High'
                  }</span> risk level
                </p>
              </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/**first grid */}
          {/* Transaction Categories Pie Chart */}
          <div className="p-6 border dark:border-gray-800 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Distribution</h3>
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
          
          {/**second grid */}
          <div className="grid md:grid-cols-2 md:grid-rows-2 gap-10 md:p-10">
            {/**first card */}
            <div className="p-4 rounded-3xl border dark:border-gray-800 shadow-md">
                <div className="flex flex-col items-start gap-y-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold">Avg. Gas Fee</h4>
                </div>
                <p className="text-3xl font-bold">
                  {formatCurrency(analysisData.gasFeeAnalysis.average)}
                </p>
                <p className="text-sm text-gray-400 mt-2">Per transaction</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">65% efficiency</span>
                </div>
            </div>
            {/**second card */}  
            <div className="p-4 rounded-3xl border dark:border-gray-800 shadow-md">
              <div className="flex flex-col items-start gap-y-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold">Most Active Month</h4>
              </div>
              {(() => {
                const mostActiveMonth = Object.entries(analysisData.monthlyBreakdown)
                  .sort((a, b) => b[1].transactions - a[1].transactions)[0];
                return (
                  <>
                    <p className="text-3xl font-bold">{ mostActiveMonth ? mostActiveMonth[0] : 'Nan' }</p>
                    <p className="text-sm text-gray-400 mt-2">{ mostActiveMonth ? mostActiveMonth[1].transactions : '0'} transactions</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Peak activity period</span>
                    </div>
                  </>
                );
              })()}
            </div>
            {/**third card */}
            <div className="p-4 rounded-3xl border dark:border-gray-800 shadow-md">
                <div className="flex flex-col items-start gap-y-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold">Avg. Gas Fee</h4>
                </div>
                <p className="text-3xl font-bold">
                  {formatCurrency(analysisData.gasFeeAnalysis.average)}
                </p>
                <p className="text-sm text-gray-400 mt-2">Per transaction</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">65% efficiency</span>
                </div>
            </div>
            {/**fourth card */}
            <div className="p-4 rounded-3xl border dark:border-gray-800 shadow-md">
              <div className="flex flex-col items-start gap-y-2">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Shuffle className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="text-lg font-semibold">Token Diversity</h4>
              </div>
              <p className="text-3xl font-bold">
              {Object.keys(analysisData.summary.netFlow.tokens).filter(token => 
                analysisData.summary.netFlow.tokens[token] > 0
              ).length}
            </p>
            <p className="text-sm text-gray-400 mt-2">Unique tokens held</p>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-sm text-indigo-600">Total</span>
            </div>
            </div>
            
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border dark:border-gray-800 shadow-md">
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>Top Tokens By Volume</CardTitle>
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
          {/* Top Tokens Volume Chart */}
          {/* Monthly Activity Line Chart */}
          <div className="rounded-lg p-6 border dark:border-gray-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Activity Trend</h3>
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

        {/* Behavioral Alerts */}
        {(analysisData.behaviorAnalysis.impulsiveSpending.length > 0 || 
          analysisData.behaviorAnalysis.frequentTrading.length > 0) && (
          <div className="rounded-xl p-6 shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-600">Behavioral Insights & Risk Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.behaviorAnalysis.impulsiveSpending.map((alert, index) => (
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
              {analysisData.behaviorAnalysis.frequentTrading.map((alert, index) => (
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

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Detailed Category Breakdown */}
          <div className="rounded-lg border dark:border-gray-800 overflow-hidden p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Transaction Category Details</h3>
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-800 hover:bg-gray-800/20">
                  <TableHead className="text-gray-400 font-medium">Category</TableHead>
                  <TableHead className="text-gray-400 font-medium">Transaction Count</TableHead>
                  <TableHead className="text-gray-400 font-medium">Gas Fees</TableHead>
                  <TableHead className="text-gray-400 font-medium">Percentage of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(analysisData.categories).map(([category, data]) => {
                  const percentage = (data.count / analysisData.summary.totalTransactions) * 100;

                  return (
                    <TableRow key={category} className="dark:border-gray-800 hover:bg-gray-800/20">
                      <TableCell className="flex items-center gap-2 font-medium capitalize">
                        {getCategoryIcon(category)}
                        {category.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{formatCurrency(data.gasFees)}</TableCell>
                      <TableCell>{percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Token Balance Overview with Visual Enhancement */}
          <div className="p-6 rounded-lg border dark:border-gray-800 overflow-hidden shadow-md">
            <h3 className="text-lg font-semibold mb-6">Asset Transfers</h3>
            <Table>
              <TableCaption>Net inflow/outflow summary for ETH and top tokens.</TableCaption>
              <TableHeader>
                <TableRow className="dark:border-gray-800 hover:bg-gray-800/20">
                  <TableHead className="text-gray-400 font-medium w-[200px]">Token</TableHead>
                  <TableHead className="text-gray-400 font-medium w-[200px]">Net Flow</TableHead>
                  <TableHead className="text-gray-400 font-medium ">Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* ETH Balance Row */}
                {analysisData.summary.netFlow.ETH !== 0 && (
                  <TableRow className="dark:border-gray-800 hover:bg-gray-800/20">
                    <TableCell className="flex items-center gap-3 font-semibold">
                      ETH
                    </TableCell>
                    <TableCell className={`font-semibold ${analysisData.summary.netFlow.ETH >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(Math.abs(analysisData.summary.netFlow.ETH))}
                    </TableCell>
                    <TableCell >
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium 
                        ${analysisData.summary.netFlow.ETH >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {analysisData.summary.netFlow.ETH >= 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            Net Inflow
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4" />
                            Net Outflow
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Top Token Holdings Rows */}
                {Object.entries(analysisData.summary.netFlow.tokens)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([token, balance]) => (
                    <TableRow key={token} className="dark:border-gray-800 hover:bg-gray-800/20">
                      <TableCell className="flex items-center gap-3 font-semibold">
                        {token}
                      </TableCell>
                      <TableCell className={`font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(Math.abs(balance), token.substring(0, 2))}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium 
                          ${balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {balance >= 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4" />
                              Net Inflow
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4" />
                              Net Outflow
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionDashboard;