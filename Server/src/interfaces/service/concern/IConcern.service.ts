import { IConcern } from "../../../interfaces/models/IConcern.model";
import { RaiseConcernDTO, ReviewConcernDTO } from "../../../dtos/concern.dto";

export interface IConcernService {
  raiseConcern(
    data: RaiseConcernDTO,
    file: Express.Multer.File
  ): Promise<IConcern>;
  getAllConcerns(filterStatus?: string): Promise<IConcern[]>;
  getConcernById(concernId: string): Promise<IConcern | null>;
  approveConcern(concernId: string, adminNote?: string): Promise<IConcern>;
  rejectConcern(concernId: string, adminNote?: string): Promise<IConcern>;
}
