import { NextResponse } from "next/server";
import { z } from "zod";

import { registerUser } from "@/lib/users";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const user = await registerUser(body);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create your account right now.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
