"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnFilterPopup } from "./column-filter"
import type {
  ColumnConfig,
  DataGridFilters,
  DataGridSort,
  DataGridQuery,
  ColumnFilter,
} from "@/lib/types/data-grid.types"

interface DataGridProps<T> {
  columns: ColumnConfig<T>[]
  data: T[]
  loading?: boolean
  editable?: boolean
  onCellEdit?: (row: T, field: keyof T, value: any) => void | Promise<void>
  onQueryChange?: (query: DataGridQuery) => void
  className?: string
}

export function DataGrid<T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  editable = false,
  onCellEdit,
  onQueryChange,
  className,
}: DataGridProps<T>) {
  const [filters, setFilters] = useState<DataGridFilters>({})
  const [sort, setSort] = useState<DataGridSort | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: number | string; field: keyof T } | null>(null)

  function handleFilterChange(field: string, filter: ColumnFilter | undefined) {
    const newFilters = { ...filters }
    if (filter === undefined) {
      delete newFilters[field]
    } else {
      newFilters[field] = filter
    }
    setFilters(newFilters)
    notifyQueryChange(newFilters, sort)
  }

  function handleSortChange(field: string, direction: "asc" | "desc" | null) {
    const newSort = direction ? { field, direction } : null
    setSort(newSort)
    notifyQueryChange(filters, newSort)
  }

  function notifyQueryChange(currentFilters: DataGridFilters, currentSort: DataGridSort | null) {
    if (onQueryChange) {
      const query: DataGridQuery = {
        filters: Object.entries(currentFilters)
          .filter(([_, filter]) => filter !== undefined)
          .map(([field, filter]) => ({
            field,
            operator: filter!.operator,
            value: filter!.value,
          })),
        sort: currentSort || undefined,
        page: 1,
        pageSize: 50,
      }
      onQueryChange(query)
    }
  }

  function EditableCell({ row, column }: { row: T; column: ColumnConfig<T> }) {
    const field = column.field
    const value = row[field]
    const isEditing = editingCell?.id === row.id && editingCell?.field === field

    if (!editable || column.editable === false) {
      return <div className="px-2 py-1">{renderCellValue(column, value, row)}</div>
    }

    if (column.type === "boolean") {
      return (
        <div className="flex justify-center">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => {
              onCellEdit?.(row, field, checked)
            }}
          />
        </div>
      )
    }

    if (isEditing) {
      return (
        <Input
          autoFocus
          type={column.type === "number" || column.type === "currency" ? "number" : "text"}
          value={String(value || "")}
          onChange={(e) => {
            // Update local state if needed
          }}
          onBlur={(e) => {
            setEditingCell(null)
            const newValue =
              column.type === "number" || column.type === "currency"
                ? Number.parseFloat(e.target.value)
                : e.target.value
            if (newValue !== value) {
              onCellEdit?.(row, field, newValue)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur()
            }
            if (e.key === "Escape") {
              setEditingCell(null)
            }
          }}
          className="h-8 w-full"
        />
      )
    }

    return (
      <div
        onClick={() => setEditingCell({ id: row.id, field })}
        className="cursor-pointer rounded px-2 py-1 hover:bg-muted/50 transition-colors"
      >
        {renderCellValue(column, value, row)}
      </div>
    )
  }

  function renderCellValue(column: ColumnConfig<T>, value: any, row: T) {
    if (column.render) {
      return column.render(value, row)
    }

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }

    switch (column.type) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      case "number":
        return new Intl.NumberFormat("pt-BR").format(value)
      case "boolean":
        return value ? "Sim" : "Não"
      case "date":
        return new Date(value).toLocaleDateString("pt-BR")
      default:
        return String(value)
    }
  }

  function getActiveFilterCount() {
    return Object.keys(filters).length
  }

  function getActiveSortField() {
    return sort?.field
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Nenhum registro encontrado</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {(getActiveFilterCount() > 0 || sort) && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          {getActiveFilterCount() > 0 && (
            <span>
              {getActiveFilterCount()} {getActiveFilterCount() === 1 ? "filtro ativo" : "filtros ativos"}
            </span>
          )}
          {sort && (
            <span>
              • Ordenado por {columns.find((c) => c.field === sort.field)?.header} (
              {sort.direction === "asc" ? "crescente" : "decrescente"})
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th
                  key={String(column.field)}
                  className="p-2 text-left text-sm font-medium"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.header}</span>
                    <ColumnFilterPopup
                      column={column}
                      filter={filters[String(column.field)]}
                      sortDirection={sort?.field === column.field ? sort.direction : null}
                      onFilterChange={(filter) => handleFilterChange(String(column.field), filter)}
                      onSortChange={(direction) => handleSortChange(String(column.field), direction)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                {columns.map((column) => (
                  <td key={String(column.field)} className="p-2 text-sm">
                    <EditableCell row={row} column={column} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
