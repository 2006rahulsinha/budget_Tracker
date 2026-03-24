'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { mockTransactions, mockChartData, totalSpending } from '@/lib/mock-data';
import { TrendingUp } from 'lucide-react';
export default function DashboardPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<Record<string, number> | null>(null)
  const categoryTotals: Record<string, number> = {}
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar')
  const now = new Date()
  const thisMonthsExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  })
  thisMonthsExpenses.forEach((e) => {
  const name = e.categories?.name || "Other"
  categoryTotals[name] = (categoryTotals[name] || 0) + Number(e.amount)
  })
  const piChartData = Object.entries(categoryTotals).map(
  ([name, value]) => ({
    name,
    amount: value,
  })
)
  const categoryMap: Record<string, string> = {
  "113225e0-523b-4f3c-af5e-3b1bfc17b202": "Shopping",
  "3e320471-accc-4b94-b4e6-1a2d853d51a1": "Entertainment",
  "9d500dc7-0fc5-47b5-bf3b-1d5f57982793": "Transport",
  "a4615ed1-a622-4ba1-9527-99a2f99ece5b": "Misc",
  "dfe79feb-8e63-4016-9994-706f81570549": "Food",
  "f3bccc52-435d-4fec-bb68-8ce687e665eb": "Bills"
}
const COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#a855f7', // purple
]
const monthlyTotals: Record<string, number> = {}

expenses.forEach((e) => {
  const d = new Date(e.date)

  const key = d.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  }) // e.g. "Oct 2025"

  monthlyTotals[key] =
    (monthlyTotals[key] || 0) + Number(e.amount)
})
const monthlyChartData = Object.entries(monthlyTotals).map(
  ([month, amount]) => ({
    month,
    amount,
    date : new Date(month),
  })
).sort((a, b) => a.date.getTime() - b.date.getTime())
useEffect(() => {
  async function loadPredictions() {
    try {
      const res = await fetch('/api/predict')

      if (!res.ok) {
        console.error('API error:', res.status)
        return
      }

      const text = await res.text()

      if (!text) {
        console.error('Empty response from API')
        return
      }

      const data = JSON.parse(text)

      setPredictions(data)
    } catch (err) {
      console.error('Fetch failed:', err)
    }
  }

  loadPredictions()
}, [])
  console.log(predictions);
  useEffect(() => {
  async function fetchExpenses() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('expenses')
      .select('*, categories(name)')
      .order('date', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setExpenses(data || [])
    setLoading(false)
  }

  fetchExpenses()
}, [])
  function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }
    const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
    const currentMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.date)
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    })
    const totalSpending = currentMonthExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    )

    const average =
      currentMonthExpenses.length > 0 ? totalSpending / currentMonthExpenses.length : 0
      const grouped: Record<string, number> = {}

      sortedExpenses.forEach((e) => {
        const date = formatDate(e.date)

        if (!grouped[date]) grouped[date] = 0
        grouped[date] += Number(e.amount)
      })

      const chartData = Object.entries(grouped).map(([date, amount]) => ({
        date,
        amount,
      }))
      if (loading) {
        return <div className="p-6">Loading...</div>
      }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of your budget and spending
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spending
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              ₹{totalSpending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {currentMonthExpenses.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              ₹{average.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <div className='flex gap-2'>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 rounded-md text-sm ${
                chartType === 'bar' ? 'bg-primary text-white' : 'bg-muted'
              }`}
            >
              Trend View
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-2 py-1 rounded-md text-sm ${
                chartType === 'pie' ? 'bg-primary text-white' : 'bg-muted'
              }`}
            >
                Category-wise View
              </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-1 rounded-md text-sm ${
                chartType === 'line' ? 'bg-primary text-white' : 'bg-muted'
                }`}
                >
                Monthly Trend
              </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' && 
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />

                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`₹${value}`, 'Amount']}
                    />

                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
}
                {chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={piChartData}
                      dataKey="amount"
                      nameKey="name"
                      outerRadius={130}
                      labelLine={false}
                    >
                      {piChartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                )}
                {chartType === 'line' && (
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`₹${value}`, 'Amount']}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(categoryTotals).map(([cat, value]) => (
              <div key={cat} className="flex justify-between">
                <span>{cat}</span>
                <span>₹{Number(value).toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card> */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Spending Next Month</CardTitle>
        </CardHeader>
       {predictions &&
          Object.entries(predictions).map(([cat, value]) => (
            <div key={cat} className=" flex justify-between items-center p-4 rounded-md ">
              <span>{categoryMap[cat] || "Others"}</span>
              <span>₹{value}</span>
            </div>
          ))}  
        </Card>       
      {/* Table */}
      {/* <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      {transaction.categories?.name || "General"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </div>
  );
}