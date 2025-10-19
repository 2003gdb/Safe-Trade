import { Injectable } from '@nestjs/common';

export interface RequiredEnvVars {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET?: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

@Injectable()
export class EnvValidationService {
  private static requiredVars: (keyof RequiredEnvVars)[] = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  static validateRequiredEnvVars(): void {
    const missingVars: string[] = [];

    for (const envVar of this.requiredVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      const errorMessage = `Las siguientes variables de entorno son requeridas pero no están definidas: ${missingVars.join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Validate JWT_SECRET strength
    const jwtSecret = process.env.JWT_SECRET!;
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres para mayor seguridad');
    }

    if (jwtSecret === 'supersecret' || jwtSecret === 'your-secret-key' || jwtSecret === 'secret') {
      throw new Error('JWT_SECRET no puede usar valores por defecto inseguros');
    }
  }

  static getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    return secret;
  }

  static getJwtRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET || this.getJwtSecret();
  }
}