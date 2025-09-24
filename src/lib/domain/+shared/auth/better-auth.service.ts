import type { Adapter, BetterAuthOptions, Where } from "better-auth/types";
import { createTransform } from "./better-auth.util";
import type { Surreal } from "surrealdb";


export class SurrealDBQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SurrealDBQueryError";
  }
}

export class BetterAuthService implements Adapter {
  readonly id = "surreal";

  transformInput: ReturnType<typeof createTransform>["transformInput"];
  transformOutput: ReturnType<typeof createTransform>["transformOutput"];
  convertWhereClause: ReturnType<typeof createTransform>["convertWhereClause"];
  getField: ReturnType<typeof createTransform>["getField"];

  constructor(
    private readonly getDb: () => Promise<Surreal>,
    options: BetterAuthOptions,
  ) {
    const { transformInput, transformOutput, convertWhereClause, getField } =
      createTransform(options);
    this.transformInput = transformInput;
    this.transformOutput = transformOutput;
    this.convertWhereClause = convertWhereClause;
    this.getField = getField;
  }

  async create<T extends Record<string, unknown>, R = T>({
    model,
    data,
  }: { model: string; data: T }): Promise<R> {
    const db = await this.getDb();
    const transformed = this.transformInput(data, model, "create");
    const [result] = await db.create(model, transformed);

    if (!result) throw new SurrealDBQueryError("Failed to create record");
    return this.transformOutput(result, model) as R;
  }

  async findOne<T>({
    model,
    where,
    select = [],
  }: { model: string; where: Where[]; select?: string[] }): Promise<T | null> {
    const db = await this.getDb();
    const whereClause = this.convertWhereClause(where, model);
    const selectClause =
      (select.length > 0 && select.map((f) => this.getField(model, f))) || [];
    const query =
      select.length > 0
        ? `SELECT ${selectClause.join(", ")} FROM ${model} WHERE ${whereClause} LIMIT 1`
        : `SELECT * FROM ${model} WHERE ${whereClause} LIMIT 1`;

    const result = (await db.query(query)) as [Record<string, unknown>[]];
    const output = result[0][0];

    if (!output) {
      return null as T | null;
    }
    return this.transformOutput(output, model, select) as T | null;
  }

  async findMany<T>({
    model,
    where,
    sortBy,
    limit,
    offset,
  }: {
    model: string;
    where?: Where[];
    sortBy?: { field: string; direction: "asc" | "desc" };
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    const db = await this.getDb();
    let query = `SELECT * FROM ${model}`;
    if (where) {
      const whereClause = this.convertWhereClause(where, model);
      query += ` WHERE ${whereClause}`;
    }
    if (sortBy) {
      query += ` ORDER BY ${this.getField(model, sortBy.field)} ${sortBy.direction}`;
    }
    if (limit !== undefined) {
      query += ` LIMIT ${limit}`;
    }
    if (offset !== undefined) {
      query += ` START ${offset}`;
    }
    const [results] = (await db.query(query)) as [Record<string, unknown>[]];
    return results.map((record: Record<string, unknown>) => this.transformOutput(record, model) as T);
  }

  async count({ model, where }: { model: string; where?: Where[] }): Promise<number> {
    const db = await this.getDb();
    const whereClause = where ? this.convertWhereClause(where, model) : "";
    const query = `SELECT count(${whereClause}) FROM ${model} GROUP ALL`;

    const [result] = (await db.query(query)) as [Record<string, unknown>[]];
    const res = result[0];

    if (!res) throw new SurrealDBQueryError("Failed to count records");
    return Number(res["count"]);
  }

  async update<T extends Record<string, unknown>, R = T>({
    model,
    where,
    update,
  }: { model: string; where: Where[]; update: T }): Promise<R> {
    const db = await this.getDb();
    const whereClause = this.convertWhereClause(where, model);
    const transformedUpdate = this.transformInput(update, model, "update");
    const [result] = (await db.query(
      `UPDATE ${model} MERGE $transformedUpdate WHERE ${whereClause}`,
      {
        transformedUpdate,
      },
    )) as [Record<string, unknown>[]];

    const output = result[0];
    if (!output) throw new SurrealDBQueryError("Failed to update record");
    return this.transformOutput(output, model) as R;
  }

  async delete({ model, where }: { model: string; where: Where[] }): Promise<void> {
    const db = await this.getDb();
    const whereClause = this.convertWhereClause(where, model);
    await db.query(`DELETE FROM ${model} WHERE ${whereClause}`);
  }

  async deleteMany({ model, where }: { model: string; where: Where[] }): Promise<number> {
    const db = await this.getDb();
    const whereClause = this.convertWhereClause(where, model);
    const [result] = (await db.query(
      `DELETE FROM ${model} WHERE ${whereClause}`,
    )) as [Record<string, unknown>[]];
    return result.length;
  }

  async updateMany<T extends Record<string, unknown>, R = T>({
    model,
    where,
    update,
  }: { model: string; where: Where[]; update: T }): Promise<R> {
    const db = await this.getDb();
    const whereClause = this.convertWhereClause(where, model);
    const transformedUpdate = this.transformInput(update, model, "update");
    const [result] = (await db.query(
      `UPDATE ${model} MERGE $transformedUpdate WHERE ${whereClause}`,
      {
        transformedUpdate,
      },
    )) as [Record<string, unknown>[]];

    const output = result[0];
    if (!output) throw new SurrealDBQueryError("Failed to update many records");
    return this.transformOutput(output, model) as R;
  }
}
