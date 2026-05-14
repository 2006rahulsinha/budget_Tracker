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
import { Car, UtensilsCrossed, Tv, CircleEllipsis, ShoppingBag, FileText } from 'lucide-react'

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

  const CATEGORY_COLORS: Record<string, string> = {
  Transport:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  Food:          'bg-green-100 text-green-700 border-green-200',
  Entertainment: 'bg-amber-100 text-amber-700 border-amber-200',
  Misc:          'bg-red-100 text-red-700 border-red-200',
  Shopping:      'bg-blue-100 text-blue-700 border-blue-200',
  Bills:         'bg-purple-100 text-purple-700 border-purple-200',
}
  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Transport:     <Car className="h-3.5 w-3.5" />,
  Food:          <UtensilsCrossed className="h-3.5 w-3.5" />,
  Entertainment: <Tv className="h-3.5 w-3.5" />,
  Misc:          <CircleEllipsis className="h-3.5 w-3.5" />,
  Shopping:      <ShoppingBag className="h-3.5 w-3.5" />,
  Bills:         <FileText className="h-3.5 w-3.5" />,
}
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
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
          <h1 className="text-3xl font-semibold ">Expenses</h1>
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

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">All Expenses</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} transactions total</p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wide">Date</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Description</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Category</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Amount</TableHead>
                <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedExpenses.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-6 text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>

                  <TableCell className="font-medium text-sm">
                    {transaction.description}
                  </TableCell>

                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      CATEGORY_COLORS[transaction.categories?.name] || 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {CATEGORY_ICONS[transaction.categories?.name]}
                      {transaction.categories?.name || 'General'}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-semibold text-sm">
                    ₹{Number(transaction.amount).toFixed(2)}
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setEditingExpense(transaction)
                        setDescription(transaction.description)
                        setAmount(transaction.amount.toString())
                        setCategoryID(transaction.category_id || '')
                        setEditOpen(true)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => handleDeleteExpense(transaction.id)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, expenses.length)} of {expenses.length}
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={currentPage === p ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8 text-sm"
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </Button>
            </div>
          </div>
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
