import { BaseService } from "./base.service";
import type {
  LawsuitData,
  LawsuitUrl,
  ImportPdfResponse,
  BatchStatusDTO,
  BatchWithStatusDTO,
} from "./eproc.service";

export class EsajService extends BaseService {
  constructor() {
    super("/esaj");
  }

  /**
   * Buscar dados do processo no ESAJ
   * GET /esaj/lawsuit/{number}
   */
  async getLawsuitData(number: string): Promise<LawsuitData> {
    return this.get<LawsuitData>(`/lawsuit/${number}`);
  }

  /**
   * Retorna URL de acesso ao processo no ESAJ
   * GET /esaj/lawsuit-url/{number}
   */
  async getLawsuitUrl(number: string): Promise<LawsuitUrl> {
    return this.get<LawsuitUrl>(`/lawsuit-url/${number}`);
  }

  /**
   * Importar PDF de lista processo do ESAJ
   * POST /esaj/import-pdf
   */
  async importPdf(file: File, state: string): Promise<ImportPdfResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("state", state);

    return this.post<ImportPdfResponse>("/import-pdf", formData, true);
  }

  /**
   * Retorna o status de processamento do lote
   * GET /esaj/batch/{batchId}
   */
  async getBatchStatus(batchId: number): Promise<BatchStatusDTO> {
    return this.get<BatchStatusDTO>(`/batch/${batchId}`);
  }

  /**
   * Deletar todos os processos de um lote específico
   * DELETE /esaj/batch/{batchId}
   */
  async deleteBatch(batchId: number): Promise<void> {
    return this.delete<void>(`/batch/${batchId}`);
  }

  /**
   * Lista todos os lotes de processos em processamento
   * GET /esaj/batch
   */
  async listProcessingBatches(): Promise<BatchWithStatusDTO[]> {
    return this.get<BatchWithStatusDTO[]>("/batch/processing");
  }

  /**
   * Lista todos os lotes de processos
   * GET /eproc/batch
   */
  async listAllBatches(): Promise<BatchWithStatusDTO[]> {
    return this.get<BatchWithStatusDTO[]>("/batch");
  }

  /**
   * Exportar processos de um lote para Excel
   * GET /esaj/export/batch/{batchId}
   */
  async exportBatchToExcel(batchId: number): Promise<Blob> {
    return this.downloadFile(`/export/batch/${batchId}`);
  }
}

// Singleton instance
export const esajService = new EsajService();
