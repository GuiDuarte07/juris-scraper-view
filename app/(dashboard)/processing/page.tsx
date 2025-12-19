"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { processService } from "@/lib/services"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BatchWithStatusDTO } from "@/lib/services/eproc.service"

export default function ProcessingPage() {
  const [batches, setBatches] = useState<BatchWithStatusDTO[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadBatches()
    const interval = setInterval(loadBatches, 5000) // Auto-refresh every 5s
    return () => clearInterval(interval)
  }, [])

  console.log(batches)

  async function loadBatches() {
    try {
      const batchesData = await processService.listProcessingBatches()
      setBatches(batchesData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar lotes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBatch(batchId: number) {
    try {
      await processService.deleteBatch(batchId)
      toast({
        title: "Sucesso",
        description: "Lote excluído",
      })
      loadBatches()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir lote",
        variant: "destructive",
      })
    }
  }

  function getStatusBadge(status?: string) {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Concluído</Badge>
      case "processing":
        return <Badge className="bg-blue-600">Processando</Badge>
      case "error":
        return (
          <Badge className="bg-red-600" variant="destructive">
            Erro
          </Badge>
        )
      default:
        return <Badge variant="secondary">Aguardando</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processamento</h1>
          <p className="text-muted-foreground">Acompanhe o status dos lotes em processamento</p>
        </div>
        <Button onClick={loadBatches} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum lote em processamento. Importe um PDF para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{batch.description}</CardTitle>
                      {getStatusBadge(batch.status?.status)}
                    </div>
                    <CardDescription>
                      {batch.system} • {batch.state} • Lote #{batch.id}
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir lote?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Todos os processos deste lote serão removidos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                
                {batch.status ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {batch.status.processedProcesses}/{batch.status.totalProcesses}
                        </span>
                      </div>
                      <Progress value={batch.status.percentComplete} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {batch.status.percentComplete.toFixed(1)}% concluído
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Processados</p>
                        <p className="text-2xl font-bold text-green-600">{batch.status.processedProcesses}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-bold text-blue-600">{batch.status.pendingProcesses}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Erros</p>
                        <p className="text-2xl font-bold text-red-600">{batch.status.errorProcesses}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aguardando início do processamento...</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
