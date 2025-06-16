import { VaultData, DashboardData, AnalysisData } from "@/types/index.types"

export const mockVaultsData: VaultData[] = [
    
]

export const mockSingleVaultData: VaultData = {
    "vaultId": 0,
    "owner": "0x0000000000000000000000000000000000000000",
    "asset": "0x0000000000000000000000000000000000000000",
    "symbol": "---",
    "decimals": 0,
    "native": false,
    "amount": "0",
    "unLockedTotal": "0",
    "startDate": "2025-02-12T07:45:58.174",
    "endDate": "2025-02-12T07:45:58.174",
    "vaultType": "fixed",
    "neededSlip": 0,
    "unLockDuration": 0,
    "unLockAmount": "0",
    "unLockGoal": "0",
    "title": "---",
    "emergency": false
}

export const mockDashboardData: DashboardData = {
    "totalVaults": 0,
    "avgLockDays": 0,
    "avgLockDaysByAsset": [
      
    ],
    "uniqueAssets": [
      
    ],
    "upcomingUnlocks": [
      
    ],
    "assetTotals": [
      
    ],
    "assetValues": [
      
    ],
    "totalValueUSD": 0,
    "lockTypeCounts": {
      "fixed": 0,
      "goal": 0,
      "scheduled": 0
    },
    "lockTypeByAsset": {
      
    },
    "monthlyActivity": [
      
    ]
}

export const sampleAnalyzedData: AnalysisData = {
  "summary": {
    "totalTransactions": 0,
    "totalGasFees": 0,
    "netFlow": {
      "ETH": 0,
      "tokens": {}
    },
    "dateRange": {
      "from": "",
      "to": ""
    }
  },
  "categories": {},
  "behaviorAnalysis": {
    "impulsiveSpending": [],
    "frequentTrading": [],
    "unusualActivity": [],
    "riskScore": 0
  },
  "monthlyBreakdown": {},
  "topTokens": [],
  "gasFeeAnalysis": {
    "total": 0,
    "average": 0
  }
};