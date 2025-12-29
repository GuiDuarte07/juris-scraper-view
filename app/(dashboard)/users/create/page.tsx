"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authService, UserRole } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Shield, CheckCircle } from "lucide-react"

export default function CreateUserPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>(UserRole.USER)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e confirmação devem ser iguais",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await authService.createUser({ email, password, role })
      
      setSuccess(true)
      toast({
        title: "Usuário criado",
        description: `${email} foi cadastrado com sucesso!`,
      })

      // Limpar formulário após 2 segundos
      setTimeout(() => {
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setRole(UserRole.USER)
        setSuccess(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Usuário</h1>
        <p className="text-muted-foreground">Cadastre novos usuários no sistema</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Novo Usuário
            </CardTitle>
            <CardDescription>
              Preencha os dados para criar um novo usuário no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-600" />
                <p className="mt-4 text-lg font-medium">Usuário criado com sucesso!</p>
                <p className="text-sm text-muted-foreground">Formulário será resetado em instantes...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Permissão</Label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as UserRole)}
                    disabled={loading}
                  >
                    <SelectTrigger id="role" className="w-full max-w-full">
                      <SelectValue className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.USER}>
                        <div className="flex items-center gap-2">
                          <span>Usuário</span>
                          <span className="text-xs text-muted-foreground">• Acesso padrão</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UserRole.ADMIN}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>Administrador</span>
                          <span className="text-xs text-muted-foreground">• Acesso total</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Criando usuário...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Usuário
                    </>
                  )}
                </Button>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Informações Importantes</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Usuários padrão têm acesso às funcionalidades do sistema</li>
                    <li>Administradores podem criar novos usuários</li>
                    <li>O usuário receberá as credenciais para primeiro acesso</li>
                  </ul>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
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
