export interface LockMyAsset {
    title: string;
    amount: string;
    symbol: string;
    duration: string;
    durationType: string;
    lockType: string;
    assetType: string;
    goal: string;
}

export interface Send2DB extends LockMyAsset {
    token: `0x${string}`;
    decimals: number;
    chainId: string;
}

export interface Lock {
    token: `0x${string}`;
    amount: bigint;
    lockEndTime: number;
    title: string;
    withdrawn: boolean;
    isNative: boolean;
    vaultType: number;
    lockIndex: number;
}

type LockType = "goal" | "fixed";

export interface VaultData {
    title: string;
    amount: number;
    start_time: string;
    end_time: string;
    unlock_goal_usd: number;
    lock_type: LockType;
    withdrawn: boolean;
    asset_address: string;
    asset_symbol: string;
    decimals: number;
    unlock_schedule: number;
    next_unlock: string;
    unlock_amount: number;
    unlock_type: string;
    vaultType?: number;
    lockIndex?: number;
    chainId: string;
}

export interface TokenConfig {
    addressLSK: `0x${string}`;
    addressSEP: `0x${string}`;
    abi: any;
    decimals: number;
    symbol: string;
}

export interface VaultCardProps {
    subvault: VaultData;
}

export interface VaultGridProps {
    vaultData: VaultData[];
    vaultType: string;
}

export interface ScheduledData {
    amount: number;
    duration: number;
    unlockType: string;
    nextUnlock: string;
    userAddress: string;
    lockTitle: string;
    lockAmount: number;
    assetSymbol: string;
    chainId: string;
}

export interface UpdateToLock {
    updatedAmount: number;
    title: string;
    assetSymbol: string;
    chainId: string;
}

export interface DeleteLock {
    assetSymbol: string;
    title: string;
    vaultType: string;
    chainId: string;
}

// dahboard
type DurationType = 'days' | 'weeks' | 'months'

interface Vault {
    vault_id: number;
    user_address: string;
    vault_type: DurationType;
    asset_address: string;
    amount: number;
    start_time: string;
    end_time: string;
    unlock_goal_usd: number;
    updated_at: string;
    unlock_schedule: number;
    lock_type: LockType;
    title: string;
    asset_symbol: string;
    next_unlock: string;
    unlock_amount: number;
    decimals: number;
    unlock_type: string;
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
    userAddress: string;
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
    };
    lockTypeByAsset: {
        [symbol: string]: {
        fixed: number;
        goal: number;
        };
    };
    durationDistribution: {
        days: number;
        weeks: number;
        months: number;
    };
    monthlyActivity: MonthlyActivity[];
    vaults: Vault[];
}

export interface UserVaultDashboardProps {
    data: DashboardData | null;
}