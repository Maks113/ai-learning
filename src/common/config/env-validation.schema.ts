import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  LLM_PROVIDER: Joi.string().valid('openai', 'local').default('local'),
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  OPENAI_MODEL: Joi.string().default('gpt-5.5'),
  LOCAL_LLM_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:8080/v1'),
  LOCAL_LLM_API_KEY: Joi.string().allow('').default('none'),
  LOCAL_LLM_MODEL: Joi.string().default('mlx-community/Qwen3.5-9B-MLX-4bit'),
});
