import { createSRPServer } from "@swan-io/srp";

export const srpServer = createSRPServer("SHA-256", 2048);
