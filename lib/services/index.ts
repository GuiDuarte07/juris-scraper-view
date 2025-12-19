export { BaseService } from "./base.service";
export { EprocService, eprocService } from "./eproc.service";
export { EsajService, esajService } from "./esaj.service";
export { ProcessService, processService } from "./process.service";

// Re-export types for convenience
export type {
  LawsuitData,
  LawsuitUrl,
  ImportPdfResponse,
  BatchStatusDTO,
  BatchWithStatusDTO,
} from "./eproc.service";

export type {
  Process,
  ProcessListResponse,
  ProcessListParams,
  UpdateContactData,
} from "./process.service";
