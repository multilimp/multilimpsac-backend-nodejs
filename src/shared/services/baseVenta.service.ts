import { Prisma } from '@prisma/client';

export abstract class BaseVentaService<T, CreateInput, UpdateInput> {
  protected abstract model: any;

  async getAll(args?: any): Promise<T[]> {
    return this.model.findMany(args);
  }

  async getById(id: number, args?: any): Promise<T | null> {
    return this.model.findUnique({ where: { id }, ...args });
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: number, data: UpdateInput): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: number): Promise<T> {
    return this.model.delete({ where: { id } });
  }
}