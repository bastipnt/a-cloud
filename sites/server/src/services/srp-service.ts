import { createSRPServer } from "@swan-io/srp";

export const srpService = createSRPServer("SHA-256", 2048);
