"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { processService, type Process } from "@/lib/services"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterProcessed, setFilterProcessed] = useState<boolean | undefined>(true)
  const [filterContacted, setFilterContacted] = useState<boolean | undefined>()
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProcesses()
  }, [page, search, filterProcessed, filterContacted])

  async function loadProcesses() {
    try {
      setLoading(true)
      const response = await processService.listProcesses({
        page,
        limit: 50,
        search: search || undefined,
        processed: filterProcessed,
        contatoRealizado: filterContacted,
      })
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

  async function handleCellUpdate(id: number, field: keyof Process, value: any) {
    try {
      if (field === "contato" || field === "contatoRealizado" || field === "observacoes") {
        const updated = await processService.updateProcessContact(id, { [field]: value })
        setProcesses(processes.map((p) => (p.id === id ? updated : p)))
      }
      toast({
        title: "Sucesso",
        description: "Processo atualizado",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar processo",
        variant: "destructive",
      })
    }
  }

  function EditableCell({
    process,
    field,
    type = "text",
  }: {
    process: Process
    field: keyof Process
    type?: "text" | "checkbox"
  }) {
    const [value, setValue] = useState(process[field])
    const isEditing = editingCell?.id === process.id && editingCell?.field === field

    if (type === "checkbox") {
      return (
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => {
            setValue(checked)
            handleCellUpdate(process.id, field, checked)
          }}
        />
      )
    }

    if (isEditing) {
      return (
        <Input
          autoFocus
          value={String(value || "")}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setEditingCell(null)
            if (value !== process[field]) {
              handleCellUpdate(process.id, field, value)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditingCell(null)
              if (value !== process[field]) {
                handleCellUpdate(process.id, field, value)
              }
            }
            if (e.key === "Escape") {
              setValue(process[field])
              setEditingCell(null)
            }
          }}
          className="h-8"
        />
      )
    }

    return (
      <div
        onClick={() => setEditingCell({ id: process.id, field })}
        className="cursor-pointer rounded px-2 py-1 hover:bg-muted"
      >
        {String(value || "-")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
        <p className="text-muted-foreground">Lista completa de processos com edição inline</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Processos</CardTitle>
              <CardDescription>Total: {total} processos • Clique para editar</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar processo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-processed">Processado:</Label>
              <Select
                value={filterProcessed === undefined ? "all" : String(filterProcessed)}
                onValueChange={(v) => setFilterProcessed(v === "all" ? undefined : v === "true")}
              >
                <SelectTrigger id="filter-processed" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="filter-contacted">Contatado:</Label>
              <Select
                value={filterContacted === undefined ? "all" : String(filterContacted)}
                onValueChange={(v) => setFilterContacted(v === "all" ? undefined : v === "true")}
              >
                <SelectTrigger id="filter-contacted" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : processes?.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum processo encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left text-sm font-medium">Processo</th>
                    <th className="p-2 text-left text-sm font-medium">Requerido</th>
                    <th className="p-2 text-left text-sm font-medium">Valor</th>
                    <th className="p-2 text-left text-sm font-medium">Comarca</th>
                    <th className="p-2 text-left text-sm font-medium">Contato</th>
                    <th className="p-2 text-center text-sm font-medium">Contatado</th>
                    <th className="p-2 text-left text-sm font-medium">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {processes?.map((process) => (
                    <tr key={process.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 text-sm font-mono">{process.processo}</td>
                      <td className="p-2 text-sm">
                        <EditableCell process={process} field="requerido" />
                      </td>
                      <td className="p-2 text-sm">
                        {process.valor
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(process.valor)
                          : "-"}
                      </td>
                      <td className="p-2 text-sm">{process.comarca}</td>
                      <td className="p-2 text-sm">
                        <EditableCell process={process} field="contato" />
                      </td>
                      <td className="p-2 text-center">
                        <EditableCell process={process} field="contatoRealizado" type="checkbox" />
                      </td>
                      <td className="p-2 text-sm">
                        <EditableCell process={process} field="observacoes" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 50 && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {Math.ceil(total / 50)}
              </span>
              <Button variant="outline" disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
