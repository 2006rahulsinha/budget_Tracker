'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ExpensesPage from '../expenses/page'
import { set } from 'date-fns'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [expenses, setExpenses] = useState<any[]>([])
    const [categoryID, setCategoryID] = useState('')
    const spendingMap: Record<string, number> = {}
    const budgetMap: Record<string, number> = {}
  useEffect(() => {
    fetchBudgets()
    fetchCategories()
    fetchExpenses()
  }, [])
  const now = new Date()
    const expensesThisMonths = expenses.filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    expensesThisMonths.forEach((e) => {
        const cat = e.category_id
        spendingMap[cat] = (spendingMap[cat] || 0) + e.amount
    })
    budgets.forEach((b) => {
        const cat = b.category_id
        budgetMap[cat] = b.amount
    })
    const budgetData = categories.map((cat) => {
        const spent = spendingMap[cat.id] || 0
        const limit = budgetMap[cat.id] || 0
        return {
            name : cat.name,
            spent,
            limit,
            percentage: limit  ? Math.round((spent / limit) * 100) : 0,
        }
    })
  async function fetchBudgets() {
    const { data } = await supabase
      .from('budgets')
      .select('*, categories(name)')

    setBudgets(data || [])
  }
  async function handleAddBudget() {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (!categoryID || !amount) {
        alert('Fill all fields')
        return
    }
    
    
    const month = new Date()
    month.setDate(1)

    const { error } = await supabase.from('budgets').upsert([
        {
        user_id: user.id,
        category_id: categoryID,
        amount: Number(amount),
        month: month.toISOString(),
        },
    ])

    if (error) {
        console.error(error)
        return
    }

    setOpen(false)
    setAmount('')
    setCategoryID('')

    fetchBudgets() // refresh UI
    }
async function fetchExpenses() {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return
        const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
            if(error) {
                console.error(error)
                return
            }
        setExpenses(data || [])
        }
  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')

    setCategories(data || [])
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Budgets</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold">Category-Wise Budgets</h1>

            <Button onClick={() => setOpen(true)}>
                Set Budget
            </Button>
            </div>
        </CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.map((b) => (
            <div key={b.id} className="flex justify-between">
              <span>{b.categories?.name}</span>
              <span>₹{b.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Monthly Budget Usage</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
            {budgetData.map((b) => (
            <div key={b.name} className="space-y-1">
                
                {/* Top Row */}
                <div className="flex justify-between text-sm">
                <span className="font-medium">{b.name}</span>
                <span>
                    ₹{b.spent.toFixed(0)} / ₹{b.limit || 0}
                </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                    b.percentage > 100
                        ? 'bg-red-500'
                        : b.percentage > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                    width: `${Math.min(b.percentage, 100)}%`,
                    }}
                />
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between text-xs text-muted-foreground">
                <span>{b.percentage.toFixed(0)}% used</span>

                {b.percentage > 100 && (
                    <span className="text-red-500 font-medium">
                    Over budget 🚨
                    </span>
                )}
                </div>
            </div>
            ))}
        </CardContent>
        </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Set Budget</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
            <div>
                <Label>Category</Label>
                <select
                value={categoryID}
                onChange={(e) => setCategoryID(e.target.value)}
                className="w-full rounded-md border border-input bg-background text-foreground px-2 py-3 text-sm"
                >
                <option  value="">Select category</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                    {cat.name}
                    </option>
                ))}
                </select>
            </div>

            <div>
                <Label>Budget Amount</Label>
                <Input
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            </div>

            <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
            </Button>
            <Button onClick={handleAddBudget}>
                Save
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </div>
    
  )
}