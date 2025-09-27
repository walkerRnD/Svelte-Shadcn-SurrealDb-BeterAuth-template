
import { error } from '@sveltejs/kit';

// Lightweight date string check (ISO or parsable)
function isDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isNaN(Date.parse(value));
}
import type { FieldAttribute } from "better-auth/db";
import { StringRecordId } from "surrealdb";
import { generateId } from "better-auth";
import { getAuthTables } from "better-auth/db";
import type { BetterAuthOptions, Where } from "better-auth/types";
import { jsonify, type RecordId } from "surrealdb";

function shouldConvertToRecordId(fieldName: string | undefined, model?: string): boolean {
  if (!fieldName?.endsWith("Id")) {
    return false;
  }
  const excludedFields = ["providerId", "activeOrganizationId"];
  if (excludedFields.includes(fieldName)) {
    return false;
  }
  if (fieldName === "accountId" && model === "account") {
    return false;
  }
  return true;
}

export function withApplyDefault(
  value: any,
  field: FieldAttribute,
  action: "create" | "update",
  model?: string,
) {
  switch (true) {
    case action === "update":
      return value;
    case value === undefined || value === null:
      if (field.defaultValue) {
        return typeof field.defaultValue === "function"
          ? field.defaultValue()
          : field.defaultValue;
      }
      return value;
    case field.references?.model !== undefined:
      return new StringRecordId(value);
    case shouldConvertToRecordId(field.fieldName, model):
      return new StringRecordId(value);
    case typeof value === "string" && isDateString(value):
      return new Date(value);
    default:
      return value;
  }
}

export const createTransform = (options: BetterAuthOptions) => {
  const schema = getAuthTables(options);

  function transformSelect(select: string[], model: string): string[] {
    if (!select || select.length === 0) return [];
    return select.map((field) => getField(model, field));
  }

  function getField(model: string, field: string) {
    if (field === "id") {
      return field;
    }

    const f = schema[model]?.fields[field];
    return f?.fieldName || field;
  }

  return {
    transformInput<T extends Record<string, unknown>>(
      data: T,
      model: string,
      action: "update" | "create",
    ) {
      const transformedData: Record<string, unknown> =
        action === "update"
          ? {}
          : {
            id: options.advanced?.generateId
              ? options.advanced.generateId({ model })
              : data['id'] || generateId(),
          };

      const fields = schema[model]?.fields;
      if (!fields) throw new Error(`Model ${model} not found in schema`);

      for (const [field, fieldValue] of Object.entries(fields)) {
        const value = data[field];
        if (value === undefined && !fieldValue.defaultValue) {
          continue;
        }

        transformedData[fieldValue.fieldName || field] = withApplyDefault(
          value,
          {
            ...fieldValue,
            fieldName: fieldValue.fieldName || field,
          },
          action,
          model,
        );
      }

      return transformedData;
    },
    transformOutput<T extends Record<string, unknown>>(
      data: T,
      model: string,
      select: string[] = [],
    ) {
      if (!data) return null;
      const transformedData: Record<string, unknown> =
        data['id'] || data['_id']
          ? select.length === 0 || select.includes("id")
            ? { id: jsonify(data['id']) }
            : {}
          : {};

      const tableSchema = schema[model]?.fields;
      if (!tableSchema) throw new Error(`Model ${model} not found in schema`);

      for (const key in tableSchema) {
        if (select.length && !select.includes(key)) {
          continue;
        }
        const field = tableSchema[key];
        if (field) {
          transformedData[key] = jsonify(data[field.fieldName || key]);
        }
      }
      return transformedData as T;
    },
    convertWhereClause(where: Where[], model: string) {
      return where
        .map((clause) => {
          const { field: _field, value, operator } = clause;
          const field = getField(model, _field);
          const v = value as unknown as RecordId;
          const isRecordId = !!v.tb;
          switch (operator) {
            case "eq":
              return field === "id" || isRecordId
                ? `${field} = ${jsonify(value)}`
                : `${field} = '${jsonify(value)}'`;
            case "in":
              return `${field} IN [${jsonify(value)}]`;
            case "contains":
              return `${field} CONTAINS '${jsonify(value)}'`;
            case "starts_with":
              return `string::starts_with(${field},'${value}')`;
            case "ends_with":
              return `string::ends_with(${field},'${value}')`;
            default:
              if (field.endsWith("Id") || isRecordId || field === "id") {
                return `${field} = ${jsonify(value)}`;
              }
              return `${field} = '${jsonify(value)}'`;
          }
        })
        .join(" AND ");
    },
    transformSelect,
    getField,
  };
};

export function getAuthUser(locals: App.Locals) {
  // If a real authenticated user is present, use it
  if (locals.user) return locals.user;

  // Test-mode fallback: allow APIs to run without an interactive login
  // This is enabled when the server runs with NODE_ENV=test (e.g., preview:test-non-bloc)
  if (process.env.NODE_ENV === 'test') {
    return {
      id: 'user-test',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as App.Locals['user'];
  }

  // Otherwise, require authentication
  throw error(401, 'Unauthorized');
}