
import bcrypt from "bcrypt";
import { IPasswordHasher } from "../../interfaces/service/auth/IPasswordHasher";
import { env } from "../../config/env";

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}