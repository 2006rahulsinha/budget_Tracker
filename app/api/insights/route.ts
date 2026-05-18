// app/api/insights/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ratelimit } from '@/lib/ratelimit'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value, set: () => {}, remove: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit per user
  const { success, remaining, reset } = await ratelimit.limit(user.id)
  if (!success) {
    const resetDate = new Date(reset)
    return Response.json({
      error: `Rate limit exceeded. Try again at ${resetDate.toLocaleTimeString()}`
    }, { status: 429 })
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, date, category_id')
    .eq('user_id', user.id)

  // Build summary
  const categoryMonthly: Record<string, number[]> = {}
  expenses?.forEach((e) => {
    if (!categoryMonthly[e.category_id]) categoryMonthly[e.category_id] = []
    categoryMonthly[e.category_id].push(Number(e.amount))
  })

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'You are a personal finance advisor. Be concise, friendly, and specific.'
  })

  // Forward to Python for summary building, or call Gemini directly here
const res = await fetch(`${process.env.ML_API_URL}/insights`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(expenses)
})

const text = await res.text() 
console.log('Python API response:', text)  // ← check your Next.js terminal

if (!res.ok) {
  return Response.json({ error: text }, { status: 500 })
}

const data = JSON.parse(text)
return Response.json({ ...data, remaining })
}