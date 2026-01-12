"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { eprocService } from "@/lib/services"
import { Settings, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SessionInfo } from "@/lib/services/eproc.service"

export default function SettingsPage() {
  const [serviceName, setServiceName] = useState("EPROC")
  const [sessionId, setSessionId] = useState("")
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const { toast } = useToast()

  // Carregar informações de sessão ao montar
  useEffect(() => {
    // Garante que sessionId começa vazio e limpa qualquer cache
    setSessionId("")
    if (typeof window !== "undefined") {
      // Remove valores salvos em localStorage que possam interferir
      try {
        localStorage.removeItem("sessionId")
        localStorage.removeItem("PHPSESSID")
      } catch {}
    }
    loadSessionInfo()
  }, [])

  async function loadSessionInfo() {
    try {
      setLoadingSession(true)
      const info = await eprocService.getSession()
      setSessionInfo(info)
    } catch (error) {
      console.log("Nenhuma sessão ativa no momento")
      setSessionInfo(null)
    } finally {
      setLoadingSession(false)
    }
  }

  async function handleUpdateSession() {
    if (!sessionId) {
      toast({
        title: "Erro",
        description: "Digite o ID da sessão",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)
      await eprocService.setSession(serviceName, sessionId)
      setSuccess(true)
      
      // Carrega as informações atualizadas da sessão imediatamente
      await loadSessionInfo()
      
      toast({
        title: "Sucesso",
        description: "Sessão atualizada com sucesso",
      })
      setTimeout(() => {
        setSuccess(false)
        setSessionId("")
      }, 3000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar sessão",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie cookies e sessões do sistema</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Atualizar Sessão (PHPSESSID)
            </CardTitle>
            <CardDescription>Atualize o cookie de sessão diariamente para manter o acesso ao EPROC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600" />
                <p className="mt-4 text-lg font-medium">Sessão atualizada!</p>
                <p className="text-sm text-muted-foreground">O sistema já pode acessar o EPROC novamente</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="service-name">Nome do Serviço</Label>
                  <Input
                    id="service-name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    disabled={updating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-id">Session ID (PHPSESSID)</Label>
                  <Input
                    id="session-id"
                    type="password"
                    placeholder="Cole o PHPSESSID aqui"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    disabled={updating}
                    autoComplete="new-password"
                    spellCheck="false"
                  />
                </div>

                <Button onClick={handleUpdateSession} disabled={!sessionId || updating} className="w-full" size="lg">
                  {updating ? (
                    <>
                      <Settings className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Atualizar Sessão
                    </>
                  )}
                </Button>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Como obter o PHPSESSID:</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Acesse o site do EPROC e faça login</li>
                    <li>Abra as ferramentas de desenvolvedor (F12)</li>
                    <li>Vá para a aba "Application" ou "Storage"</li>
                    <li>Em "Cookies", encontre o cookie "PHPSESSID"</li>
                    <li>Copie o valor e cole acima</li>
                  </ol>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Sessão Atual
            </CardTitle>
            <CardDescription>Estado atual da sessão PHPSESSID</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSession ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando informações...</span>
              </div>
            ) : sessionInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={sessionInfo.isValid && !sessionInfo.isExpired ? "default" : "destructive"}>
                      {sessionInfo.isExpired ? "Expirada" : sessionInfo.isValid ? "Válida" : "Inválida"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg bg-muted p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Session ID</span>
                    <span className="font-mono text-xs">{sessionInfo.sessionId.substring(0, 10)}...{sessionInfo.sessionId.substring(sessionInfo.sessionId.length - 5)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Criada em</span>
                    <span>{new Date(sessionInfo.createdAt).toLocaleString("pt-BR")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expira em</span>
                    <span className={sessionInfo.isExpired ? "text-red-600 font-medium" : ""}>
                      {new Date(sessionInfo.expiresAt).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  {sessionInfo.isExpired && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-950">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-800 dark:text-red-200">
                        Sua sessão expirou. Atualize o PHPSESSID acima para continuar usando o sistema.
                      </p>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" onClick={loadSessionInfo}>
                  Atualizar Informações
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-600" />
                <p className="mt-4 font-medium">Nenhuma sessão configurada</p>
                <p className="text-sm text-muted-foreground">Configure uma sessão acima para começar</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API URL</span>
                <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
