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

export interface FormTokenVault extends TokenVaultParams {
    durationType: string;
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