import Ajv, { type ErrorObject } from "ajv";
import schema from "../../data/project.schema.json";
import type { GuildProject } from "../../domain/project";

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  strict: false
});
const validate = ajv.compile<GuildProject>(schema);

export interface SchemaValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export function validateSchema(data: unknown): SchemaValidationResult {
  const valid = validate(data);
  return {
    valid: Boolean(valid),
    errors: validate.errors ? [...validate.errors] : []
  };
}
