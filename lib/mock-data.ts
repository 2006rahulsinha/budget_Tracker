export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface ChartData {
  date: string;
  amount: number;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-02-20',
    description: 'Grocery Store',
    category: 'Food',
    amount: 85.32,
  },
  {
    id: '2',
    date: '2024-02-19',
    description: 'Gas Station',
    category: 'Transportation',
    amount: 45.00,
  },
  {
    id: '3',
    date: '2024-02-18',
    description: 'Coffee Shop',
    category: 'Food',
    amount: 12.50,
  },
  {
    id: '4',
    date: '2024-02-17',
    description: 'Online Shopping',
    category: 'Shopping',
    amount: 124.99,
  },
  {
    id: '5',
    date: '2024-02-16',
    description: 'Restaurant',
    category: 'Food',
    amount: 68.75,
  },
];

export const mockChartData: ChartData[] = [
  { date: 'Feb 14', amount: 120 },
  { date: 'Feb 15', amount: 150 },
  { date: 'Feb 16', amount: 180 },
  { date: 'Feb 17', amount: 160 },
  { date: 'Feb 18', amount: 200 },
  { date: 'Feb 19', amount: 220 },
  { date: 'Feb 20', amount: 190 },
];

export const totalSpending = mockTransactions.reduce(
  (acc, transaction) => acc + transaction.amount,
  0
);
