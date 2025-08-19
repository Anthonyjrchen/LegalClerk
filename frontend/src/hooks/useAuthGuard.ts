import { supabase } from "../lib/supabaseClient"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { User } from "@supabase/supabase-js"

export function useAuthGuard() {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/login")
      else setUser(data.user)
    })
  }, [navigate])

  return user
}
