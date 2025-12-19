"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { eprocService, esajService } from "@/lib/services"
import { Search, ExternalLink, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { da } from "date-fns/locale"

export default function SearchPage() {
  const [processNumber, setProcessNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [processUrl, setProcessUrl] = useState<string | null>(null)
  const [system, setSystem] = useState<"eproc" | "esaj">("esaj")
  const { toast } = useToast()

  async function handleSearch() {
    if (!processNumber) {
      toast({
        title: "Erro",
        description: "Digite um número de processo",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setResult(null)
      setProcessUrl(null)

      const service = system === "esaj" ? esajService : eprocService

      const [data, urlData] = await Promise.all([
        service.getLawsuitData(processNumber),
        service.getLawsuitUrl(processNumber),
      ])

      console.log(data, urlData)

      setResult(data)
      setProcessUrl(urlData.url)

      toast({
        title: "Sucesso",
        description: "Dados do processo obtidos",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao buscar dados do processo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buscar Processo</h1>
        <p className="text-muted-foreground">Consulte dados e URL de acesso de um processo específico</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Consulta de Processo</CardTitle>
            <CardDescription>Digite o número CNJ do processo para buscar informações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system">Sistema</Label>
              <div className="flex gap-2 mb-2">
                <Select
                  value={system}
                  onValueChange={(v) => setSystem(v as "eproc" | "esaj")}
                >
                  <SelectTrigger aria-label="Sistema">
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eproc">EPROC</SelectItem>
                    <SelectItem value="esaj">ESAJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Label htmlFor="process-number">Número do Processo</Label>
              <div className="flex gap-2">
                <Input
                  id="process-number"
                  placeholder="0000000-00.0000.0.00.0000"
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {processUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                URL do Processo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input value={processUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={() => window.open(processUrl, "_blank")}>
                  Abrir
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados do Processo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 border-b pb-3 last:border-0">
                    <div className="font-medium capitalize">{key.replace(/_/g, " ")}</div>
                    <div className="col-span-2 text-muted-foreground">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
