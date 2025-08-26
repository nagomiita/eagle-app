export default {
  fastapi: {
    input: "./openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/api/generated.ts",
      schemas: "./src/api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/api/custom-axios.ts",
          name: "customAxios",
        },
      },
    },
  },
};
