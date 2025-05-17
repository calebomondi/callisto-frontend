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
    chainId: number;
    lockAsset: `0x${string}`;
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
}