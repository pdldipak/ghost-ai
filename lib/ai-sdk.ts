/** Load AI SDK types from the package dist entry (adjacent .d.ts), not the untyped `main` JS file. */
export { generateText, jsonSchema, Output } from "../node_modules/ai/dist/index";
