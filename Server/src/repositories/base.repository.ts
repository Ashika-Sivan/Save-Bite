

import { Model, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interfaces/repository/IBaseRepository";

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected _model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this._model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this._model.findById(id);
  }

  async findAll(): Promise<T[]> {
    return await this._model.find();
  }

  async updateById(
    id: string,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteById(id: string): Promise<T | null> {
    return await this._model.findByIdAndDelete(id);
  }
}