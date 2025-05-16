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