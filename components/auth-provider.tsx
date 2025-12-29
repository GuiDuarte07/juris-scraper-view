"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authService, type User } from "@/lib/services"
import { usePathname, useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasToken, setHasToken] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Tenta recuperar o usuário do authService (cache ou localStorage)
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setHasToken(true)
    } else {
      setHasToken(false)
    }
    setLoading(false)
  }, [pathname])

  useEffect(() => {
    // Redireciona para login se backend confirmou que não há token e não está em rota pública
    if (!loading && !user && !hasToken && !isPublicRoute) {
      router.push("/login")
    }

    console.log({ loading, user, hasToken, pathname })

    // Redireciona para dashboard se autenticado e está na página de login
    if (!loading && (user || hasToken) && pathname === "/login") {
      router.push("/")
    }
  }, [loading, user, hasToken, isPublicRoute, pathname, router])

  async function logout() {
    try {
      await authService.logout()
      setUser(null)
      setHasToken(false)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Sincroniza com authService quando há mudança
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser?.id !== user?.id) {
      setUser(currentUser)
    }
  }, [user])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user || hasToken,
    isAdmin: user?.role === "admin",
    logout,
  }

  // Mostra loading apenas em rotas protegidas
  if (loading && !isPublicRoute) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
