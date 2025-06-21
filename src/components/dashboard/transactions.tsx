import { VaultTransactions } from "@/types/index.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsTable({transactions}:{transactions:VaultTransactions[]}) {

  // Format timestamp to a more readable date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Truncate long addresses for display
  const truncateAddress = (address: string) => {
    if (address.length > 12) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };
  
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-800/20">
            <TableHead className="text-gray-400 font-medium">Depositor</TableHead>
            <TableHead className="text-gray-400 font-medium">Amount</TableHead>
            <TableHead className="text-gray-400 font-medium">Type</TableHead>
            <TableHead className="text-gray-400 font-medium">Timestamp (GMT)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                No transactions found
              </td>
            </TableRow>
          ) : (
            transactions.map((transaction, index) => (
              <TableRow key={`${transaction.depositor}-${transaction.timestamp}-${index}`} 
                  className="border-gray-800 hover:bg-gray-800/20">
                <TableCell className="font-medium py-4">
                  <div className="text-sm font-medium " title={transaction.depositor}>
                    {truncateAddress(transaction.depositor)}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm">{transaction.amount}</div>
                </TableCell>
                <TableCell className="py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.withdrawn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {transaction.withdrawn ? 'Withdrawal' : 'Deposit'}
                  </span>
                </TableCell>
                <TableCell className="py-4 whitespace-nowrap text-sm">
                  {formatDate(transaction.timestamp)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};