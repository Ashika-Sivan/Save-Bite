import { IConcern } from "../../../interfaces/models/IConcern.model";
import { RaiseConcernDTO, IConcernResponseDTO } from "../../../dtos/concern.dto";

export interface IConcernService {
  raiseConcern(
    data: RaiseConcernDTO,
    file: Express.Multer.File
  ): Promise<IConcernResponseDTO>;
  getAllConcerns(filterStatus?: string): Promise<IConcernResponseDTO[]>;
  getConcernById(concernId: string): Promise<IConcernResponseDTO | null>;
  approveConcern(concernId: string, adminNote?: string): Promise<IConcernResponseDTO>;
  rejectConcern(concernId: string, adminNote?: string): Promise<IConcernResponseDTO>;
}
