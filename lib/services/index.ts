export { BaseService } from "./base.service";
export { EprocService, eprocService } from "./eproc.service";
export { EsajService, esajService } from "./esaj.service";
export { ProcessService, processService } from "./process.service";
export { AuthService, authService } from "./auth.service";

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

export type { User, LoginResponse, CreateUserData } from "./auth.service";

export { UserRole } from "./auth.service";
