import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, date, category_id')
      .eq('user_id', user.id)

    if (error) {
      return Response.json({ error: 'DB error' }, { status: 500 })
    }
    // 🔥 CALL PYTHON API
    const res = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenses),
    })

    const text = await res.text() // safer than json()

    if (!text) {
      return Response.json({ error: 'Empty ML response' }, { status: 500 })
    }

    const data = JSON.parse(text)

    return Response.json(data)
  } catch (err) {

    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}