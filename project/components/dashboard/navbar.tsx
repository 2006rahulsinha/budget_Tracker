'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Sun, Moon} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark'
    setIsDark(saved)

    if (saved) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }
  const [user, setUser] = useState<any>(null)
  const router = useRouter();
  useEffect(() => {
  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
  }

  getUser()
}, [])
const displayName =
  user?.user_metadata?.name ||
  user?.email?.split('@')[0] ||
  'User'
const initials = displayName
  .split(' ')
  .map((word: string) => word[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
  router.refresh()
}
  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{displayName}</p>
            <p className="text-neutral-500">{user?.email || "Loading..."}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
