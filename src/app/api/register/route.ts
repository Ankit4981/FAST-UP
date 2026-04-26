import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";
import { registerUser } from "@/lib/users";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `register:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many signup attempts. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const rawBody = await request.json().catch(() => null);
    const body = registerSchema.parse(rawBody);
    const user = await registerUser(body);

    return NextResponse.json(
      { user },
      { status: 201, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid signup payload." },
        { status: 400, headers: rateLimitHeaders(rateLimit) }
      );
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { message: "Unable to create account with these details." },
        { status: 400, headers: rateLimitHeaders(rateLimit) }
      );
    }

    console.error("User registration failed", error);
    return NextResponse.json(
      { message: "Unable to create your account right now." },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    );
  }
}
