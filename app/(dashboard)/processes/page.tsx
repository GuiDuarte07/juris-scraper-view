"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { processService, eprocService, esajService, type Process, type BatchWithStatusDTO } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"
import { DataGrid } from "@/components/data-grid/data-grid"
import type { ColumnConfig, DataGridQuery } from "@/lib/types/data-grid.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ExternalLink, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentQuery, setCurrentQuery] = useState<DataGridQuery>({
    filters: [],
    page: 1,
    pageSize: 50,
  })
  
  // Filtros globais
  const [filterProcessed, setFilterProcessed] = useState<boolean | undefined>(undefined)
  const [filterSystem, setFilterSystem] = useState<string>("")
  const [filterBatchId, setFilterBatchId] = useState<number | undefined>(undefined)
  const [batchOptions, setBatchOptions] = useState<{ id: number; description: string }[]>([])
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [processToDelete, setProcessToDelete] = useState<Process | null>(null)
  
  const { toast } = useToast()

  const columns: ColumnConfig<Process>[] = [
    {
      field: "id",
      header: "Ações",
      type: "string",
      width: "140px",
      editable: false,
      filterable: false,
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            onClick={() => handleOpenProcessUrl(row)}
            title="Abrir URL do processo"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            onClick={() => handlePromptDelete(row)}
            title="Excluir processo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      field: "processo",
      header: "Processo",
      type: "string",
      width: "240px",
      editable: false,
      render: (value) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      field: "requerido",
      header: "Requerido",
      type: "string",
      width: "240px",
      editable: true,
    },
    {
      field: "valor",
      header: "Valor",
      type: "currency",
      width: "140px",
      editable: false,
    },
    {
      field: "comarca",
      header: "Comarca",
      type: "string",
      width: "150px",
      editable: false,
    },
    {
      field: "contato",
      header: "Contato",
      type: "string",
      width: "150px",
      editable: true,
    },
    {
      field: "contatoRealizado",
      header: "Contatado",
      type: "boolean",
      width: "120px",
      editable: true,
    },
    {
      field: "observacoes",
      header: "Observações",
      type: "string",
      editable: true,
    },
  ]

  useEffect(() => {
    loadProcesses()
  }, [currentQuery])

  // Carrega batches quando o sistema é selecionado e reseta o filtro de batch
  useEffect(() => {
    setFilterBatchId(undefined) // Reseta o batch selecionado ao mudar de sistema
    if (filterSystem) {
      loadBatches()
    } else {
      setBatchOptions([])
    }
  }, [filterSystem])

  async function loadBatches() {
    try {
      setLoadingBatches(true)
      let batches: BatchWithStatusDTO[] = []

      // Carrega batches apenas do sistema selecionado
      if (filterSystem === "EPROC") {
        batches = await eprocService.listAllBatches()
      } else if (filterSystem === "ESAJ") {
        batches = await esajService.listAllBatches()
      } else {
        // Se nenhum sistema foi selecionado, limpa as opções
        setBatchOptions([])
        return
      }

      // Mapeia os batches para as opções do select
      const options = batches.map((batch) => ({
        id: batch.id,
        description: batch.description,
      }))

      setBatchOptions(options)
    } catch (error) {
      console.error("Erro ao carregar batches:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar lotes",
        variant: "destructive",
      })
      setBatchOptions([])
    } finally {
      setLoadingBatches(false)
    }
  }

  async function loadProcesses() {
    try {
      setLoading(true)

      const params: any = {
        page: currentQuery.page,
        limit: currentQuery.pageSize,
      }

      // Apply global filters
      if (filterProcessed !== undefined) {
        params.processed = filterProcessed
      }
      if (filterSystem) {
        params.system = filterSystem
      }
      if (filterBatchId !== undefined) {
        params.batchId = filterBatchId
      }

      // Encode advanced filters as JSON string for GET
      if (currentQuery.filters && currentQuery.filters.length > 0) {
        try {
          params.filters = encodeURIComponent(JSON.stringify(currentQuery.filters))
        } catch (e) {
          // fallback: ignore encoding errors
        }
        // Optional: keep compatibility with existing 'search' param when filtering by processo
        const searchFilter = currentQuery.filters.find((f) => f.field === "processo")
        if (searchFilter) {
          params.search = searchFilter.value
        }
      }

      // Apply sort
      if (currentQuery.sort) {
        params.sortBy = currentQuery.sort.field
        params.sortOrder = currentQuery.sort.direction
      }

      const response = await processService.listProcesses(params)
      setProcesses(response.items)
      setTotal(response.total)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar processos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCellEdit(row: Process, field: keyof Process, value: any) {
    try {
      if (field === "contato" || field === "contatoRealizado" || field === "observacoes") {
        // Atualiza otimisticamente no estado local primeiro
        setProcesses((prev) => 
          prev.map((p) => (p.id === row.id ? { ...p, [field]: value } : p))
        )
        
        // Envia para o backend
        await processService.updateProcessContact(row.id, { [field]: value })
        
        toast({
          title: "Sucesso",
          description: "Processo atualizado com sucesso",
        })
      }
    } catch (error) {
      // Em caso de erro, reverte para o valor original
      setProcesses((prev) => 
        prev.map((p) => (p.id === row.id ? { ...p, [field]: row[field] } : p))
      )
      
      toast({
        title: "Erro",
        description: "Falha ao atualizar processo",
        variant: "destructive",
      })
    }
  }

  async function handleOpenProcessUrl(row: Process) {
    try {
      if (!filterSystem) {
        toast({
          title: "Selecione o sistema",
          description: "Defina o sistema (EPROC ou ESAJ) para abrir a URL.",
          variant: "destructive",
        })
        return
      }
      const service = filterSystem === "EPROC" ? eprocService : esajService
      const { url } = await service.getLawsuitUrl(row.processo)
      window.open(url, "_blank")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao obter URL do processo",
        variant: "destructive",
      })
    }
  }

  function handlePromptDelete(row: Process) {
    setProcessToDelete(row)
    setShowConfirmDialog(true)
  }

  async function handleConfirmDelete() {
    if (!processToDelete) return
    try {
      await processService.deleteProcess(processToDelete.id)
      setProcesses((prev) => prev.filter((p) => p.id !== processToDelete.id))
      setTotal((t) => Math.max(0, t - 1))
      setShowConfirmDialog(false)
      setProcessToDelete(null)
      toast({ title: "Sucesso", description: "Processo excluído" })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir processo",
        variant: "destructive",
      })
    }
  }

  function handleQueryChange(query: DataGridQuery) {
    setCurrentQuery(query)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
        <p className="text-muted-foreground">Gerenciamento completo com filtros e ordenação por coluna</p>
      </div>

      {/* Filtros Globais */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Globais</CardTitle>
          <CardDescription>Filtre por status de processamento, sistema e lote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="filter-processed">Processado</Label>
              <Select
                value={filterProcessed === undefined ? "all" : String(filterProcessed)}
                onValueChange={(v) => {
                  setFilterProcessed(v === "all" ? undefined : v === "true")
                  setCurrentQuery({ ...currentQuery, page: 1 })
                }}
              >
                <SelectTrigger id="filter-processed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="filter-system">Sistema</Label>
              <Select value={filterSystem || "all"} onValueChange={(v) => setFilterSystem(v === "all" ? "" : v)}>
                <SelectTrigger id="filter-system">
                  <SelectValue placeholder="Selecione um sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="EPROC">EPROC</SelectItem>
                  <SelectItem value="ESAJ">ESAJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4 overflow-hidden">
              <Label htmlFor="filter-batch">Lote (Batch)</Label>
              <Select
                value={filterBatchId?.toString() || "all"}
                onValueChange={(v) => {
                  setFilterBatchId(v === "all" ? undefined : Number(v))
                  setCurrentQuery({ ...currentQuery, page: 1 })
                }}
                disabled={!filterSystem || loadingBatches}
              >
                <SelectTrigger id="filter-batch" className="truncate max-w-full w-full">
                  <SelectValue placeholder={!filterSystem ? "Selecione um sistema primeiro" : "Selecione um lote"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {batchOptions.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id.toString()}>
                      {batch.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end md:col-span-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFilterProcessed(undefined)
                  setFilterSystem("")
                  setFilterBatchId(undefined)
                  setBatchOptions([])
                  setCurrentQuery({ ...currentQuery, page: 1 })
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Processos</CardTitle>
          <CardDescription>
            Total: {total} processos • Clique nos ícones de filtro para configurar • Clique nas células para editar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataGrid
            columns={columns}
            data={processes}
            loading={loading}
            editable={true}
            onCellEdit={handleCellEdit}
            onQueryChange={handleQueryChange}
          />

          {total > currentQuery.pageSize && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={currentQuery.page === 1}
                onClick={() => setCurrentQuery({ ...currentQuery, page: currentQuery.page - 1 })}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentQuery.page} de {Math.ceil(total / currentQuery.pageSize)}
              </span>
              <Button
                variant="outline"
                disabled={currentQuery.page >= Math.ceil(total / currentQuery.pageSize)}
                onClick={() => setCurrentQuery({ ...currentQuery, page: currentQuery.page + 1 })}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={showConfirmDialog}
        onOpenChange={(v) => {
          setShowConfirmDialog(v)
          if (!v) setProcessToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        processo={processToDelete?.processo}
      />
    </div>
  )
}

// Confirm delete dialog
// Placed after component to keep file organized; Next.js will render properly
function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  processo,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
  processo?: string
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              <p>
                Você tem certeza que deseja excluir o processo
                {" "}
                <strong>{processo}</strong>?
              </p>
              <p className="text-amber-600 font-medium">
                Essa ação é irreversível e removerá o processo da lista.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

