import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Password must be at least 8 characters, contain at least 1 uppercase letter
 * and at least 1 number.
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: "La contraseña debe tener al menos 8 caracteres",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "La contraseña debe contener al menos una letra mayúscula",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "La contraseña debe contener al menos un número",
    };
  }
  return { valid: true };
}
