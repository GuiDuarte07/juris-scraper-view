"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, ArrowUp, ArrowDown } from "lucide-react"
import type { ColumnConfig, ColumnFilter, ColumnType, FilterOperator } from "@/lib/types/data-grid.types"

interface ColumnFilterProps {
  column: ColumnConfig
  filter?: ColumnFilter
  sortDirection?: "asc" | "desc" | null
  onFilterChange: (filter: ColumnFilter | undefined) => void
  onSortChange: (direction: "asc" | "desc" | null) => void
}

const STRING_OPERATORS: Array<{ value: FilterOperator; label: string }> = [
  { value: "equals", label: "Igual a" },
  { value: "notEquals", label: "Diferente de" },
  { value: "contains", label: "Contém" },
  { value: "startsWith", label: "Começa com" },
  { value: "endsWith", label: "Termina com" },
]

const NUMBER_OPERATORS: Array<{ value: FilterOperator; label: string }> = [
  { value: "equals", label: "Igual a" },
  { value: "notEquals", label: "Diferente de" },
  { value: "greaterThan", label: "Maior que" },
  { value: "lessThan", label: "Menor que" },
  { value: "greaterOrEqual", label: "Maior ou igual" },
  { value: "lessOrEqual", label: "Menor ou igual" },
]

const BOOLEAN_OPERATORS: Array<{ value: FilterOperator; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
]

export function ColumnFilterPopup({ column, filter, sortDirection, onFilterChange, onSortChange }: ColumnFilterProps) {
  const [operator, setOperator] = useState<FilterOperator>(filter?.operator || getDefaultOperator(column.type))
  const [value, setValue] = useState<string>(filter?.value?.toString() || "")
  const [open, setOpen] = useState(false)

  const hasActiveFilter = filter !== undefined
  const hasActiveSort = sortDirection !== null

  function getDefaultOperator(type: ColumnType): FilterOperator {
    switch (type) {
      case "string":
        return "contains"
      case "number":
      case "currency":
        return "equals"
      case "boolean":
        return "all"
      default:
        return "equals"
    }
  }

  function getOperators() {
    switch (column.type) {
      case "string":
        return STRING_OPERATORS
      case "number":
      case "currency":
        return NUMBER_OPERATORS
      case "boolean":
        return BOOLEAN_OPERATORS
      default:
        return STRING_OPERATORS
    }
  }

  function handleApplyFilter() {
    if (column.type === "boolean") {
      if (operator === "all") {
        onFilterChange(undefined)
      } else {
        onFilterChange({ operator, value: operator === "true" })
      }
    } else {
      if (value.trim() === "") {
        onFilterChange(undefined)
      } else {
        const filterValue = column.type === "number" || column.type === "currency" ? Number.parseFloat(value) : value
        onFilterChange({ operator, value: filterValue })
      }
    }
    setOpen(false)
  }

  function handleClearFilter() {
    setValue("")
    setOperator(getDefaultOperator(column.type))
    onFilterChange(undefined)
  }

  function handleSort(direction: "asc" | "desc") {
    if (sortDirection === direction) {
      onSortChange(null)
    } else {
      onSortChange(direction)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${hasActiveFilter || hasActiveSort ? "text-primary" : "text-muted-foreground"}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filtrar {column.header}</h4>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Sorting */}
          {column.sortable !== false && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Ordenação</Label>
              <div className="flex gap-2">
                <Button
                  variant={sortDirection === "asc" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSort("asc")}
                >
                  <ArrowUp className="h-3 w-3 mr-1" />
                  Crescente
                </Button>
                <Button
                  variant={sortDirection === "desc" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSort("desc")}
                >
                  <ArrowDown className="h-3 w-3 mr-1" />
                  Decrescente
                </Button>
              </div>
            </div>
          )}

          {/* Filtering */}
          {column.filterable !== false && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Operador</Label>
                <Select value={operator} onValueChange={(v) => setOperator(v as FilterOperator)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperators().map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {column.type !== "boolean" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Valor</Label>
                  <Input
                    type={column.type === "number" || column.type === "currency" ? "number" : "text"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={`Digite o valor...`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleApplyFilter()
                      }
                    }}
                  />
                </div>
              )}

              <Button className="w-full" onClick={handleApplyFilter}>
                Aplicar Filtro
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
