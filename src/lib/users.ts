import bcrypt from "bcryptjs";

import { connectToDatabase, isDatabaseConfigured } from "@/lib/db";
import { UserModel } from "@/models/User";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type MemoryUser = SafeUser & {
  passwordHash: string;
};

let memoryUsers: MemoryUser[] | null = null;

async function getMemoryUsers() {
  if (!memoryUsers) {
    memoryUsers = [
      {
        id: "demo_user",
        name: "Demo Athlete",
        email: "demo@fastup.dev",
        passwordHash: await bcrypt.hash("Demo@1234", 10)
      }
    ];
  }

  return memoryUsers;
}

function toSafeUser(raw: Record<string, unknown>): SafeUser {
  return {
    id: String(raw._id ?? raw.id),
    name: String(raw.name),
    email: String(raw.email),
    image: raw.image ? String(raw.image) : undefined
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const email = input.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(input.password, 10);

  if (!isDatabaseConfigured()) {
    const users = await getMemoryUsers();
    if (users.some((user) => user.email === email)) {
      throw new Error("An account already exists for this email.");
    }

    const user: MemoryUser = {
      id: `user_${Date.now().toString(36)}`,
      name: input.name.trim(),
      email,
      passwordHash
    };
    users.push(user);
    return toSafeUser(user);
  }

  await connectToDatabase();

  const existingUser = await UserModel.findOne({ email }).lean();
  if (existingUser) {
    throw new Error("An account already exists for this email.");
  }

  const user = await UserModel.create({
    name: input.name.trim(),
    email,
    passwordHash
  });

  return toSafeUser(user.toObject() as Record<string, unknown>);
}

export async function verifyUserCredentials(emailInput?: string, passwordInput?: string) {
  if (!emailInput || !passwordInput) {
    return null;
  }

  const email = emailInput.toLowerCase().trim();

  if (!isDatabaseConfigured()) {
    const users = await getMemoryUsers();
    const user = users.find((candidate) => candidate.email === email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(passwordInput, user.passwordHash);
    return isValid ? toSafeUser(user) : null;
  }

  await connectToDatabase();
  const user = await UserModel.findOne({ email }).lean();

  if (!user) {
    return null;
  }

  const candidate = user as Record<string, unknown>;
  const isValid = await bcrypt.compare(passwordInput, String(candidate.passwordHash));

  return isValid ? toSafeUser(candidate) : null;
}
