import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { hashPassword, comparePassword, validatePasswordStrength } from "../utils/password";
import { Role } from "@prisma/client";

export interface LoginResult {
  user: {
    id: string;
    username: string;
    role: Role;
    mustChangePassword: boolean;
    employee?: {
      fullName: string;
    } | null;
  };
  token: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { employee: true },
  });

  if (!user) {
    throw new Error("Credenciales inválidas.");
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw new Error("Credenciales inválidas.");
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      employee: user.employee
        ? {
            fullName: user.employee.fullName,
          }
        : null,
    },
    token,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  const validCurrent = await comparePassword(currentPassword, user.passwordHash);
  if (!validCurrent) {
    throw new Error("La contraseña actual es incorrecta.");
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    throw new Error(strength.message!);
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
      employee: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  return user;
}
