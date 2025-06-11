import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  Calendar,
  BadgeDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Shuffle,
  Image,
  Zap,
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart3,
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
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useAccount } from 'wagmi';
import { CustomTooltipProps, AnalysisData } from '@/types/index.types';
import { sampleAnalyzedData } from './mockplatformdata';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

const TransactionDashboard = () => {
  const { isConnected } = useAccount();
  const [analysisData, setAnalysisData] = useState<AnalysisData>(sampleAnalyzedData);

  useEffect(() => {
    if(isConnected) {
      //
    } else {
      setAnalysisData(sampleAnalyzedData);
    }
  }, []);

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

  const gasFeesByCategory = useMemo(() => {
    return Object.entries(analysisData.categories).map(([category, data]) => ({
      category: category.replace('_', ' ').toUpperCase(),
      gasFees: parseFloat((data.gasFees * 1000).toFixed(4)), // Convert to milli-ETH for readability
      transactions: data.count
    })).sort((a, b) => b.gasFees - a.gasFees);
  }, [analysisData]);

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
        <div className="p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
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
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold">{analysisData.summary.totalTransactions}</p>
                <p className="text-xs text-gray-500 mt-1">Immediate previous transactions</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Gas Fees</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analysisData.summary.totalGasFees)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Combined</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <BadgeDollarSign className="h-6 w-6 text-orange-600"/>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">ETH Net Flow</p>
                <p className={`text-2xl font-bold ${analysisData.summary.netFlow.ETH >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysisData.summary.netFlow.ETH >= 0 ? '+' : ''}{formatCurrency(analysisData.summary.netFlow.ETH)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analysisData.summary.netFlow.ETH >= 0 ? 'Received more than sent' : 'Sent more than received' }
                </p>
              </div>
              <div className={`p-3 rounded-full ${analysisData.summary.netFlow.ETH >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {analysisData.summary.netFlow.ETH >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-green-600" /> : 
                  <TrendingDown className="h-6 w-6 text-red-600" />
                }
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(analysisData.behaviorAnalysis.riskScore)}`}>
                  {analysisData.behaviorAnalysis.riskScore}/100
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {
                    analysisData.behaviorAnalysis.riskScore < 30 ? 'Low' : 
                    analysisData.behaviorAnalysis.riskScore < 60 ? 'Medium' :
                    'High'
                  } risk level
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className={`h-6 w-6 ${getRiskColor(analysisData.behaviorAnalysis.riskScore)}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Transaction Categories Pie Chart */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Distribution</h3>
              <PieChartIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
          </div>

          {/* Monthly Activity Line Chart */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Activity Trend</h3>
              <LineChartIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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

        <div className="grid grid-cols-1 gap-6">
          {/* Top Tokens Volume Chart */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Tokens by Volume</h3>
              <BarChart3 className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTokensData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="symbol" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" fill="#10B981" radius={[4, 4, 0, 0]} name="Volume" />
                </BarChart>
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

        {/* Detailed Category Breakdown */}
        <div className="rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Category Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysisData.categories).map(([category, data]) => (
              <div key={category} className="rounded-lg p-4 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 ext-gray-400">
                    {getCategoryIcon(category)}
                    <h4 className="font-medium capitalize">{category.replace('_', ' ')}</h4>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{data.count}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Gas Fees:</span>
                    <span className="font-medium">{formatCurrency(data.gasFees)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(data.count / analysisData.summary.totalTransactions) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-300 text-center">
                    {((data.count / analysisData.summary.totalTransactions) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Balance Overview with Visual Enhancement */}
        <div className="rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Token Transfers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* ETH Balance Card */}
            <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 ${analysisData.summary.netFlow.ETH === 0 && 'hidden'}`}>
              <div className={ `flex items-center justify-between mb-4`}>
                <div className={ `flex items-center space-x-3`}>
                  <div className={`w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">Ξ</span>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${analysisData.summary.netFlow.ETH >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(Math.abs(analysisData.summary.netFlow.ETH))}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analysisData.summary.netFlow.ETH >= 0 ? 'Net Inflow' : 'Net Outflow'}
                    </p>
                  </div>
                </div>
                <div className={`p-2 rounded-full ${analysisData.summary.netFlow.ETH >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {analysisData.summary.netFlow.ETH >= 0 ? 
                    <TrendingUp className="h-4 w-4 text-green-600" /> : 
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  }
                </div>
              </div>
            </div>
            
            {/* Top Token Holdings */}
            {Object.entries(analysisData.summary.netFlow.tokens)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([token, balance]) => (
              <div key={token} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-even space-x-3 w-full">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{token.substring(0, 2)}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(balance, token)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {balance >= 0 ? 'Net Inflow' : 'Net Outflow'}
                      </p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {balance >= 0 ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> : 
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Average Transaction Value */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Avg. Gas Fee</h4>
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
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

          {/* Most Active Period */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Most Active Month</h4>
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
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

          {/* Portfolio Diversity */}
          <div className="rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Token Diversity</h4>
              <div className="p-2 bg-indigo-100 rounded-full">
                <Shuffle className="h-5 w-5 text-indigo-600" />
              </div>
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
    </div>
  );
};

export default TransactionDashboard;