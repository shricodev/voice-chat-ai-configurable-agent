import { z } from "zod";

export const messageSchema = z.object({
  message: z.string(),
  aliases: z.record(
    z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    ),
  ),
});

export type TMessageSchema = z.infer<typeof messageSchema>;
