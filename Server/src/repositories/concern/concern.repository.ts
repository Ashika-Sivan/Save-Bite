import { UpdateQuery } from "mongoose";
import { Concern } from "../../models/concern/concern.model";
import { IConcern } from "../../interfaces/models/IConcern.model";
import { IConcernRepository } from "../../interfaces/repository/IConcernRepository";
import { BaseRepository } from "../base.repository";

export class ConcernRepository extends BaseRepository<IConcern> implements IConcernRepository {
  constructor() {
    super(Concern);
  }

  async createConcern(data: Partial<IConcern>): Promise<IConcern> {
    const concern = new Concern(data);
    return await concern.save();
  }

  async findById(concernId: string): Promise<IConcern | null> {
    return await Concern.findById(concernId)
      .populate("customerId", "name email phone")
      .populate("vendorId", "name email")
      .populate("orderId");
  }

  async findByOrderId(orderId: string): Promise<IConcern | null> {
    return await Concern.findOne({ orderId })
      .populate("customerId", "name email phone")
      .populate("vendorId", "name email")
      .populate("orderId");
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IConcern[]> {
    return await Concern.find(filter)
      .sort({ createdAt: -1 })
      .populate("customerId", "name email phone")
      .populate("vendorId", "name email")
      .populate("orderId");
  }

  async updateConcernStatus(concernId: string,status: string,adminNote?: string, resolvedAt?: Date ): Promise<IConcern | null> {
    const updateData: UpdateQuery<IConcern> = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (resolvedAt) updateData.resolvedAt = resolvedAt;

    return await Concern.findByIdAndUpdate(concernId, updateData, { new: true })
      .populate("customerId", "name email phone")
      .populate("vendorId", "name email")
      .populate("orderId");
  }
  

  
}
