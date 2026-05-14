'use client'

import { useState } from 'react'
import { X, RefreshCw, TrendingUp, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InsightsDrawer() {
  const [open, setOpen]         = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function loadInsights() {
    setOpen(true)
    if (insights) return

    setLoading(true)
    const res  = await fetch('/api/insights')
    const data = await res.json()
    setInsights(data.insights)
    setLoading(false)
  }

  async function refresh() {
    setInsights(null)
    setLoading(true)
    const res  = await fetch('/api/insights')
    const data = await res.json()
    setInsights(data.insights)
    setLoading(false)
  }

  const paragraphs = insights?.split('\n').filter(p => p.trim().length > 0) ?? []

  return (
    <>
      {/* Floating button */}
      <button
        onClick={loadInsights}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-neutral-800 transition-colors duration-200"
      >
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium tracking-wide">Monthly Review</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[400px] bg-background border-l flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="px-8 py-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                AI Analysis
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                Spending Review
              </h2>
            </div>
            <Button variant="ghost" size="icon" className="mt-1" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
          {loading && (
            <div className="space-y-3 pt-2">
              {[100, 75, 88, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 bg-muted rounded-full animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
              <p className="text-xs text-muted-foreground pt-2">Generating analysis...</p>
            </div>
          )}

{!loading && paragraphs.length > 0 && (
  <div className="space-y-4">
    {paragraphs.map((para, i) => {
      // Section headers like "1. Overview"
      const isHeader = /^\d+\./.test(para)
      // Bullet points like "- Do this"
      const isBullet = para.trim().startsWith('-')

      if (isHeader) {
        return (
          <div key={i} className="pt-4 first:pt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {para.replace(/^\d+\.\s*/, '')}
            </p>
            <div className="h-px bg-border mb-3" />
          </div>
        )
      }

      if (isBullet) {
        return (
          <div key={i} className="flex gap-3 pl-1">
            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              {para.replace(/^-\s*/, '')}
            </p>
          </div>
        )
      }

      return (
        <p key={i} className="text-sm text-foreground leading-relaxed">
          {para}
        </p>
      )
    })}
  </div>
)}

          {!loading && !insights && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-16">
              <p className="text-sm font-medium text-foreground">No analysis yet</p>
              <p className="text-xs text-muted-foreground">Click refresh to generate your spending review</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t space-y-3">
          <Button
            variant="outline"
            className="w-full text-sm gap-2 font-medium"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Based on your transaction history
          </p>
        </div>
      </div>
    </>
  )
}