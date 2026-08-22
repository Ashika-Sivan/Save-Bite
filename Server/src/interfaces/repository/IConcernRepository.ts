import { IConcern } from "../models/IConcern.model";
import { BaseRepository } from "../../repositories/base.repository";

export interface IConcernRepository {
  createConcern(data: Partial<IConcern>): Promise<IConcern>;
  findById(concernId: string): Promise<IConcern | null>;
  findByOrderId(orderId: string): Promise<IConcern | null>;
  findAll(filter?: any): Promise<IConcern[]>;
  updateConcernStatus(
    concernId: string,
    status: string,
    adminNote?: string,
    resolvedAt?: Date
  ): Promise<IConcern | null>;
}
