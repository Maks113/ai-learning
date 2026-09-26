import { BadGatewayException, Injectable } from '@nestjs/common';
import Ajv2020 from 'ajv/dist/2020';
import type { JsonSchema } from '../../common/llm/types';

@Injectable()
export class PromptOutputValidatorService {
  private readonly ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  validate<TOutput>(schema: JsonSchema, output: unknown): TOutput {
    const validate = this.ajv.compile(schema);
    const isValid = validate(output);

    if (!isValid) {
      throw new BadGatewayException({
        message: 'LLM structured output does not match JSON schema',
        errors: validate.errors,
      });
    }

    return output as TOutput;
  }
}
