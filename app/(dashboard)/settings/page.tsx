"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { eprocService } from "@/lib/services"
import { Settings, Key, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [serviceName, setServiceName] = useState("EPROC")
  const [sessionId, setSessionId] = useState("")
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

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
