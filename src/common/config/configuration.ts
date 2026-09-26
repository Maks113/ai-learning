export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV,
    port: Number(process.env.PORT),
  },
  llm: {
    provider: process.env.LLM_PROVIDER,
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
    },
    local: {
      baseUrl: process.env.LOCAL_LLM_BASE_URL,
      apiKey: process.env.LOCAL_LLM_API_KEY,
      model: process.env.LOCAL_LLM_MODEL,
    },
  },
});
