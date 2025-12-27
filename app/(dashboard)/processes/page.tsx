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
  
  const { toast } = useToast()

  const columns: ColumnConfig<Process>[] = [
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

  // Carrega batches quando o sistema é selecionado
  useEffect(() => {
    if (filterSystem) {
      loadBatches()
    } else {
      setBatchOptions([])
      setFilterBatchId(undefined)
    }
  }, [filterSystem])

  async function loadBatches() {
    try {
      setLoadingBatches(true)
      let batches: BatchWithStatusDTO[] = []

      if (filterSystem === "EPROC") {
        batches = await eprocService.listAllBatches()
      } else if (filterSystem === "ESAJ") {
        batches = await esajService.listAllBatches()
      }

      const options = batches.map((batch) => ({
        id: batch.id,
        description: batch.description,
      }))

      
      setBatchOptions(options)
    } catch (error) {
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
        const updated = await processService.updateProcessContact(row.id, { [field]: value })
        setProcesses(processes.map((p) => (p.id === row.id ? updated : p)))
        toast({
          title: "Sucesso",
          description: "Processo atualizado com sucesso",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar processo",
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
    </div>
  )
}
