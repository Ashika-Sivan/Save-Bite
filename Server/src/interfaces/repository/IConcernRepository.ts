import { IConcern } from "../models/IConcern.model";


export interface IConcernRepository {
  createConcern(data: Partial<IConcern>): Promise<IConcern>;
  findById(concernId: string): Promise<IConcern | null>;
  findByOrderId(orderId: string): Promise<IConcern | null>;
  findAll(filter?: Record<string, unknown>): Promise<IConcern[]>;
  updateConcernStatus(
    concernId: string,
    status: string,
    adminNote?: string,
    resolvedAt?: Date
  ): Promise<IConcern | null>;
}
