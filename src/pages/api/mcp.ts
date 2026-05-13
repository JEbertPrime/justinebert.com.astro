import type { APIRoute } from "astro";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "roll_dice",
      "Rolls an N-sided die",
      { sides: z.number().int().min(2) },
      async ({ sides }) => {
        const value = 1 + Math.floor(Math.random() * sides);
        return {
          content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
        };
      },
    );

    server.tool(
      "flip_coin",
      "Flips a fair coin and returns heads or tails",
      {},
      async () => {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        return {
          content: [{ type: "text", text: `🪙 ${result}!` }],
        };
      },
    );

    server.tool(
      "pick_number",
      "Picks a random integer between min and max (inclusive)",
      { min: z.number().int(), max: z.number().int() },
      async ({ min, max }) => {
        if (min > max) {
          return {
            content: [{ type: "text", text: `Error: min (${min}) must be ≤ max (${max})` }],
            isError: true,
          };
        }
        const value = min + Math.floor(Math.random() * (max - min + 1));
        return {
          content: [{ type: "text", text: `🎯 Picked ${value} (range ${min}–${max})` }],
        };
      },
    );
  },
  {},
  { basePath: "/api" },
);
export const prerender = false;
export const GET: APIRoute = ({ request }) => handler(request);
export const POST: APIRoute = ({ request }) => handler(request);
export const DELETE: APIRoute = ({ request }) => handler(request);
