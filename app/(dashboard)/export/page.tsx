"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { eprocService, esajService, processService, type BatchWithStatusDTO } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"
import { Download, FileSpreadsheet, RefreshCw, Server } from "lucide-react"

type SystemType = "eproc" | "esaj"

export default function ExportPage() {
  const [system, setSystem] = useState<SystemType>("eproc")
  const [batches, setBatches] = useState<BatchWithStatusDTO[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined)
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  const systemLabel = useMemo(() => (system === "eproc" ? "EPROC" : "ESAJ"), [system])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        setLoadingBatches(true)
        setSelectedBatchId(undefined)
        const svc = system === "eproc" ? eprocService : esajService
        const data = await svc.listAllBatches()
        if (!active) return
        setBatches(data)
      } catch (e) {
        setBatches([])
        toast({ title: "Erro", description: "Falha ao carregar lotes", variant: "destructive" })
      } finally {
        setLoadingBatches(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [system, toast])

  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId),
    [batches, selectedBatchId]
  )

  async function handleExport() {
    if (!selectedBatchId) {
      toast({ title: "Atenção", description: "Selecione um lote para exportar." })
      return
    }
    try {
      setDownloading(true)
      // Usa rota unificada do backend em /process/export/batch/:batchId
      const blob = await processService.exportBatchToExcel(selectedBatchId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const safeDesc = (selectedBatch?.description || "lote").replace(/[^a-zA-Z0-9-_\. ]/g, "_")
      a.href = url
      a.download = `${systemLabel.toLowerCase()}-${safeDesc}-${selectedBatchId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: "Exportação iniciada", description: "Seu download foi gerado com sucesso." })
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao exportar lote para Excel", variant: "destructive" })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exportar Lotes</h1>
        <p className="text-muted-foreground">Baixe os processos de um lote em planilha Excel</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Exportação para Excel
            </CardTitle>
            <CardDescription>
              Escolha o sistema e o lote para gerar o arquivo Excel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 overflow-hidden">
                <Label htmlFor="system">Sistema</Label>
                <Select
                  value={system}
                  onValueChange={(v) => setSystem(v as SystemType)}
                >
                  <SelectTrigger id="system" className="w-full max-w-full">
                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eproc">EPROC</SelectItem>
                    <SelectItem value="esaj">ESAJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 overflow-hidden">
                <Label htmlFor="batch">Lote</Label>
                <Select
                  value={selectedBatchId?.toString() || ""}
                  onValueChange={(v) => setSelectedBatchId(Number(v))}
                  disabled={loadingBatches || batches.length === 0}
                >
                  <SelectTrigger id="batch" className="w-full max-w-full">
                    <SelectValue className="truncate" placeholder={loadingBatches ? "Carregando lotes..." : batches.length ? "Selecione um lote" : "Nenhum lote disponível"} />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Server className="h-4 w-4" />
                <span>
                  {systemLabel} • {batches.length} lote{batches.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="text-right">
                <p className="font-medium truncate max-w-[36ch]">
                  {selectedBatch ? selectedBatch.description : "Nenhum lote selecionado"}
                </p>
                <p className="text-xs text-muted-foreground">ID: {selectedBatch?.id ?? "—"}</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={handleExport}
              disabled={!selectedBatchId || downloading}
            >
              {downloading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Excel...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </>
              )}
            </Button>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Dicas</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Os lotes listados vêm do sistema selecionado.</li>
                <li>O arquivo gerado é um .xlsx pronto para análise.</li>
                <li>Caso o download não inicie, verifique bloqueadores de pop‑up.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
