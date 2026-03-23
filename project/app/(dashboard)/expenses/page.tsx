'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockTransactions } from '@/lib/mock-data';
import { Plus , Trash,Pencil} from 'lucide-react';
import { supabase } from '@/lib/supabase'


export default function ExpensesPage() {  
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [description, setDescription] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  useEffect(() => {
  fetchExpenses()
  fetchCategories()
    }, [])

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
    async function fetchCategories() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('categories')
        .select('*')

      if (error) {
        console.error(error)
        return
      }

      console.log(data)
      setCategories(data || [])
    }
    async function handleAddCategory() {
        if (!newCategory) return

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase.from('categories').insert([
          {
            name: newCategory,
            user_id: user.id,
          },
        ])

        if (error) {
          console.error(error)
          return
        }

        setNewCategory('')
        setCategoryOpen(false)

        fetchCategories() // refresh dropdown
      }
    async function handleAddExpense() {
    console.log(categoryID)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }
    if (!description || !amount) {
      alert('Please fill all required fields')
      return
    }
    if (Number(amount) <= 0) {
      alert('Amount must be greater than 0')
      return
    }
    const { error } = await supabase.from('expenses').insert([
      {
        user_id: user.id,
        description,
        category_id: categoryID,
        amount: Number(amount),
        date: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error(error)
      return
    }

    // reset form
    setDescription('')
    setCategoryID('')
    setAmount('')
    setOpen(false)

    // refresh data
    fetchExpenses()
  }
  async function handleUpdateExpense() {
    if (!editingExpense) return

    const { error } = await supabase
      .from('expenses')
      .update({
        description,
        amount: Number(amount),
        category_id: categoryID || null,
      })
      .eq('id', editingExpense.id)

    if (error) {
      console.error(error)
      return
    }

    setEditOpen(false)
    setEditingExpense(null)

    fetchExpenses()
  }
  async function handleDeleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    // update UI instantly (better UX)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }
  if (loading) return <div className="p-6">Loading...</div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Expenses</h1>
          <p className="text-neutral-500 mt-1">Manage your expenses</p>
        </div>
        <Button onClick={() => setCategoryOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
            Add Category
        </Button>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
            Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
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
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                      {transaction.categories?.name || "General"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                     onClick={() => {
                      setEditingExpense(transaction)
                      setDescription(transaction.description)
                      setAmount(transaction.amount.toString())
                      setCategoryID(transaction.category_id || '')
                      setEditOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size= "icon"
                      onClick={() => handleDeleteExpense(transaction.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input placeholder="e.g. Groceries" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              />
              
            </div>

            <div>
              <Label>Category</Label>
                <select
                  value={categoryID}
                  onChange={(e) => setCategoryID(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}
              disabled={!description || !amount || Number(amount) <= 0}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                placeholder="e.g. Food"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={categoryID}
                onChange={(e) => setCategoryID(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExpense}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
