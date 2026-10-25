import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.ts";

import "./auth.openapi.ts";

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Classifieds API",
      version: "1.0.0",
      description: "REST API for managing classifieds",
    },
    servers: [{ url: "/" }],
  });
}
