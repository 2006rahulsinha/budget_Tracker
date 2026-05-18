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
  Legend,
  Area,
  AreaChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { mockTransactions, mockChartData, totalSpending } from '@/lib/mock-data';
import { TrendingUp } from 'lucide-react';
import { usePrediction } from '@/hooks/usePrediction'
import { Car, UtensilsCrossed, Tv, CircleEllipsis, ShoppingBag, FileText } from 'lucide-react'
export default function DashboardPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { prediction, loading: predictionLoading, error } = usePrediction()
  const categoryTotals: Record<string, number> = {}
  const now = new Date()
  
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Transport:     <Car className="h-3.5 w-3.5" />,
  Food:          <UtensilsCrossed className="h-3.5 w-3.5" />,
  Entertainment: <Tv className="h-3.5 w-3.5" />,
  Misc:          <CircleEllipsis className="h-3.5 w-3.5" />,
  Shopping:      <ShoppingBag className="h-3.5 w-3.5" />,
  Bills:         <FileText className="h-3.5 w-3.5" />,
}
const CATEGORY_COLORS: Record<string, string> = {
  Transport:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  Food:          'bg-green-100 text-green-700 border-green-200',
  Entertainment: 'bg-amber-100 text-amber-700 border-amber-200',
  Misc:          'bg-red-100 text-red-700 border-red-200',
  Shopping:      'bg-blue-100 text-blue-700 border-blue-200',
  Bills:         'bg-purple-100 text-purple-700 border-purple-200',
}
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area' | 'radar'>('bar')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  
  // Add this derived data — list of unique months for the selector
  const availableMonths = Array.from(
    new Set(expenses.map(e => {
      const d = new Date(e.date)
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    }))
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Filter chartData based on selected month


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
  const filteredPieData = (selectedMonth === 'all' ? expenses : expenses.filter(e => {
      const d = new Date(e.date)
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) === selectedMonth
    })).reduce<Record<string, number>>((acc, e) => {
      const name = e.categories?.name || 'Other'
      acc[name] = (acc[name] || 0) + Number(e.amount)
      return acc
    }, {})

    const piChartData = Object.entries(filteredPieData).map(([name, value]) => ({
      name,
      amount: value,
    }))

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
    const filteredChartData = selectedMonth === 'all'
      ? chartData
      : chartData.filter(d => {
      // d.date is "15/10/2024" — convert back to match "Oct 2024"
      const [day, month, year] = d.date.split('/')
      const parsed = new Date(`${year}-${month}-${day}`)
      const label = parsed.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      return label === selectedMonth
    })
    const radarData = Object.entries(filteredPieData).map(([name, value]) => ({
      category: name,
      amount: value,
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
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Spending Overview</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMonth === 'all' ? 'All time' : selectedMonth}
              </p>
            </div>

            {/* Month selector */}
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Months</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Segmented control */}
              <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
                {[
                  { key: 'bar',  label: 'Bar'  },
                  { key: 'line', label: 'Line' },
                  { key: 'pie',  label: 'Pie'  },
                  { key: 'radar', label: 'Radar'  },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setChartType(key as any)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                      chartType === key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={filteredChartData} barSize={14}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} width={55} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={v => [`₹${v}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              ): chartType === 'line' ? (
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
              ) : chartType === 'radar' ? (
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={110}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    tickFormatter={v => `₹${v}`}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={v => [`₹${v}`, 'Spent']}
                  />
                </RadarChart>
              ) : (
                <PieChart>
                  <Pie data={piChartData} dataKey="amount" nameKey="name" outerRadius={120} innerRadius={50} paddingAngle={3} labelLine={false}>
                    {piChartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={v => [`₹${v}`, 'Amount']}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              )
              }
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
<Card className="shadow-sm">
  <CardHeader className="border-b pb-4">
    <CardTitle className="text-base font-semibold">Predicted Spending Next Month</CardTitle>
    <p className="text-xs text-muted-foreground mt-1">Based on your historical spending patterns</p>
  </CardHeader>

  <CardContent className="pt-4 px-0">
    {predictionLoading && (
      <div className="flex items-center gap-2 p-4 text-muted-foreground text-sm">
        <div className="h-3 w-3 rounded-full bg-muted-foreground/30 animate-pulse" />
        Calculating predictions...
      </div>
    )}

    {error && (
      <div className="mx-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        Could not load predictions
      </div>
    )}

    {prediction &&
  Object.entries(prediction).map(([cat, pred]: [string, any], index) => {
    if (!pred) return null

    // handle both shapes — plain number or object
    const predicted = typeof pred === 'number' ? pred : pred.predicted
    const lower     = typeof pred === 'number' ? pred : pred.lower
    const upper     = typeof pred === 'number' ? pred : pred.upper

    if (predicted === undefined) return null

    const colors = CATEGORY_COLORS[categoryMap[cat]] ?? 'bg-gray-100 text-gray-700'
    return (
      <div
        key={cat}
        className={`flex justify-between items-center px-6 py-3 hover:bg-muted/40 transition-colors ${
          index !== Object.entries(prediction).length - 1 ? 'border-b' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${colors}`}>
            {CATEGORY_ICONS[categoryMap[cat]]}
            {categoryMap[cat] || 'Others'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">₹{Number(predicted).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            ₹{Number(lower).toFixed(0)} – ₹{Number(upper).toFixed(0)}
          </p>
        </div>
      </div>
    )
  })}
  </CardContent>
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