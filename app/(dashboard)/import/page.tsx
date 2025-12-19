"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { eprocService, esajService } from "@/lib/services"
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type SystemType = "eproc" | "esaj"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState("SP")
  const [system, setSystem] = useState<SystemType>("eproc")
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const systemNames = {
    eproc: "EPROC",
    esaj: "ESAJ",
  }

  const stateNames: Record<string, string> = {
    SP: "São Paulo",
    // RJ: "Rio de Janeiro",
    // MG: "Minas Gerais",
    // RS: "Rio Grande do Sul",
    // PR: "Paraná",
  }

  function handleImportClick() {
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo PDF",
        variant: "destructive",
      })
      return
    }
    setShowConfirmDialog(true)
  }

  async function handleConfirmImport() {
    setShowConfirmDialog(false)
    
    try {
      setUploading(true)
      const service = system === "eproc" ? eprocService : esajService
      const result = await service.importPdf(file!, state)
      
      setSuccess(true)
      toast({
        title: "Sucesso",
        description: `PDF importado! Lote #${result.batchId} criado.`,
      })
      setTimeout(() => {
        router.push("/processing")
      }, 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao importar PDF",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar PDF</h1>
        <p className="text-muted-foreground">Faça upload de um PDF contendo lista de processos para processamento</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo</CardTitle>
            <CardDescription>O sistema irá extrair os processos do PDF e processá-los automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-600" />
                <p className="mt-4 text-lg font-medium">PDF importado com sucesso!</p>
                <p className="text-sm text-muted-foreground">Redirecionando para a página de processamento...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="system">Sistema</Label>
                  <Select value={system} onValueChange={(value) => setSystem(value as SystemType)}>
                    <SelectTrigger id="system">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eproc">EPROC</SelectItem>
                      <SelectItem value="esaj">ESAJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">São Paulo (SP)</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
                      <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
                      <SelectItem value="PR">Paraná (PR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo PDF</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  )}
                </div>

                <Button onClick={handleImportClick} disabled={!file || uploading} className="w-full" size="lg">
                  {uploading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar PDF
                    </>
                  )}
                </Button>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Formato esperado:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>PDF com lista de processos do {systemNames[system]}</li>
                    <li>Cada processo será extraído e enriquecido automaticamente</li>
                    <li>O processamento ocorre em segundo plano</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirmar Importação
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>Você tem certeza que deseja importar esse PDF para <strong>{stateNames[state]}</strong> pelo sistema do <strong>{systemNames[system]}</strong>?</p>
                <p className="text-amber-600 font-medium">
                  Lembrando que o sistema necessita que essas informações estejam corretas para que o PDF seja processado corretamente.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}