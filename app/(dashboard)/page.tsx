"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BatchWithStatusDTO, processService } from "@/lib/services"
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [batches, setBatches] = useState<BatchWithStatusDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProcesses: 0,
    processedProcesses: 0,
    pendingProcesses: 0,
    errorProcesses: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const batchesData = await processService.listProcessingBatches()
      setBatches(batchesData)

      // Calculate overall stats
      let totalProc = 0
      let processedProc = 0
      let pendingProc = 0
      let errorProc = 0

      for (const batch of batchesData) {
        try {
          totalProc += batch.status?.totalProcesses || 0
          processedProc += batch.status?.processedProcesses || 0
          pendingProc += batch.status?.pendingProcesses || 0
          errorProc += batch.status?.errorProcesses || 0
        } catch (error) {
          console.error(`Failed to load status for batch ${batch.id}`)
        }
      }

      setStats({
        totalProcesses: totalProc,
        processedProcesses: processedProc,
        pendingProcesses: pendingProc,
        errorProcesses: errorProc,
      })
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">Estatísticas gerais do sistema de processamento</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">Estatísticas gerais do sistema de processamento</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcesses}</div>
            <p className="text-xs text-muted-foreground">Processos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedProcesses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProcesses > 0
                ? `${((stats.processedProcesses / stats.totalProcesses) * 100).toFixed(1)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProcesses}</div>
            <p className="text-xs text-muted-foreground">Aguardando processamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorProcesses}</div>
            <p className="text-xs text-muted-foreground">Falhas no processamento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lotes Recentes</CardTitle>
          <CardDescription>Últimos lotes de processos importados</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lote encontrado. Importe um PDF para começar.</p>
          ) : (
            <div className="space-y-4">
              {batches.slice(0, 5).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <p className="font-medium">{batch.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {batch.system} - {batch.state} • {batch.status?.totalProcesses} processos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {batch.status?.processedProcesses}/{batch.status?.totalProcesses}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {batch.status?.status === "completed" ? "Concluído" : "Em processamento"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
