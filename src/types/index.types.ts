export interface TokenData {
    address: `0x${string}`;
    decimals: number;
}

export interface ChainData {
    poolAddress: `0x${string}`;
    dataProvider: `0x${string}`;
    lockAsset: `0x${string}`;
}

export interface SupportedTokens {
    symbol: string;
    aave: boolean;
}

export interface TokenVaultParams {
    symbol: string;
    title: string;
    totalAmount: string;
    vaultType: string;
    lockPeriod: number;
    slip: number;
    unLockDuration: number;
    unLockAmount: number;
    unLockGoal: number;
}

export interface Transaction {
    depositor: `0x${string}`;
    amount: bigint;
    withdrawn: boolean;
    timestamp: number;
}

export interface ApproveTokenParams {
    symbol: string;
    amount: bigint;
}

export interface FormValues {
    symbol: string;
    title: string;
    totalAmount: string;
    vaultType: string;
    lockPeriod: string;
    slip: string;
    unLockDuration: string;
    unLockAmount: string;
    unLockGoal: string;
    durationType: string;
}

export interface VaultData {
    vaultId: number;
    owner: string;
    asset: string;
    symbol: string;
    decimals: number;
    native: boolean;
    amount: string;
    unLockedTotal: string;
    startDate: string;
    endDate: string;
    vaultType: string;
    neededSlip: number;
    unLockDuration: number;
    unLockAmount: string;
    unLockGoal: string;
    title: string;
    emergency: boolean;
}

export interface VaultCardProps {
    subvault: VaultData;
    chainId: number;
    lockAsset: `0x${string}`;
}

export interface VaultGridProps {
    vaultData: VaultData[];
}

export interface VaultTransactions {
    depositor: string;
    amount: string;
    withdrawn: boolean;
    timestamp: string;
}

export interface UnlockStatus {
    canUnlockNow: boolean;
    amountToUnlock: number;
}

type DaysStatus = 'past' | 'current' | 'future';

export interface UnlockDays {
    date: number;
    status: DaysStatus;
}

export interface ScheduledData {
    checkUnlockStatus: UnlockStatus;
    unlockDaysStatus: UnlockDays[];
}

interface AssetTotal {
    symbol: string;
    totalAmount: number;
    decimals: number;
    address: string;
}
  
interface AssetValue extends AssetTotal {
    valueUSD: number;
    price: number;
}
  
interface AvgLockDaysByAsset {
    symbol: string;
    avgDays: number;
}

interface UniqueAsset {
    address: string;
    symbol: string;
    name: string;
}

interface UpcomingUnlock {
    id: number;
    title: string;
    asset: string;
    unlockDate: string;
    daysRemaining: number;
    amount: number;
}

interface MonthlyActivity {
    month: string;
    count: number;
}

export interface DashboardData {
    totalVaults: number;
    avgLockDays: number;
    avgLockDaysByAsset: AvgLockDaysByAsset[];
    uniqueAssets: UniqueAsset[];
    upcomingUnlocks: UpcomingUnlock[];
    assetTotals: AssetTotal[];
    assetValues: AssetValue[];
    totalValueUSD: number;
    lockTypeCounts: {
        fixed: number;
        goal: number;
        scheduled: number;
    };
    lockTypeByAsset: {
        [symbol: string]: {
            Fixed: number;
            goal: number;
            schedule: number;
        };
    };
    monthlyActivity: MonthlyActivity[];
}

export interface UserVaultDashboardProps {
    data: DashboardData;
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

interface DateRange {
  from: string;
  to: string;
}

interface NetFlow {
  ETH: number;
  tokens: Record<string, number>;
}

interface Summary {
  totalTransactions: number;
  totalGasFees: number;
  netFlow: NetFlow;
  dateRange: DateRange;
}

interface TransactionCategory {
  count: number;
  transactions: any[];
  totalValue: number;
  gasFees: number;
}

interface SpendingBehavior {
  hash: string;
  summary: string;
  category: string;
  timestamp: string;
}

interface ImpulsiveSpending extends SpendingBehavior {
  gasFee: number;
  averageGasFee: number;
  flag: string;
  severity: 'low' | 'medium' | 'high';
  timeDifference?: number;
}

interface FrequentSpending extends SpendingBehavior {
  timeDifference?: number;
  flag: string;
  severity: 'low' | 'medium' | 'high';
}

interface BehaviorAnalysis {
  impulsiveSpending: ImpulsiveSpending[];
  frequentTrading: FrequentSpending[];
  unusualActivity: FrequentSpending[];
  riskScore: number;
}

interface MonthlyData {
  transactions: number;
  gasFees: number;
  volume: number;
  categories: Record<string, number>;
}

interface TopToken {
  symbol: string;
  name: string;
  totalVolume: number;
  transactions: number;
  logo: string | null;
}

interface GasFeeAnalysis {
  total: number;
  average: number;
}

export interface AnalysisData {
  summary: Summary;
  categories: Record<string, TransactionCategory>;
  behaviorAnalysis: BehaviorAnalysis;
  monthlyBreakdown: Record<string, MonthlyData>;
  topTokens: TopToken[];
  gasFeeAnalysis: GasFeeAnalysis;
}

// Chart data interfaces
export interface CategoryPieData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyChartData {
  month: string;
  transactions: number;
  gasFees: number;
  volume: number;
}

export interface GasFeesByCategoryData {
  category: string;
  gasFees: number;
  transactions: number;
}

export interface TopTokensData {
  symbol: string;
  volume: number;
  transactions: number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export interface EarnPoints {
  status: boolean;
}

export interface BreakVault {
  message: string;
  pointsafterPenalty: number;
}

export interface VaultGoal {
  remainingAmount: number;
  daysToEndDate: number;
  weeksToEndDate: number;
  monthsToEndDate: number;
  progress: number;
  amountToSaveDaily: number;
  amountToSaveWeekly: number;
  amountToSaveMonthly: number;
}

export interface TokenBalances {
    balance: string;
    symbol: string;
}