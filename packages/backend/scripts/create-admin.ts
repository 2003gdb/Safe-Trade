#!/usr/bin/env ts-node

/**
 * Script interactivo para crear administradores en SafeTrade
 *
 * Uso: npx ts-node scripts/create-admin.ts
 */

import * as crypto from 'crypto';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Funciones de hashing (aligned with hash.util.ts)
function generateSalt(): string {
    return crypto.randomBytes(32).toString('hex');
}

async function hashPassword(password: string, salt: string): Promise<string> {
    const saltedPassword = password + salt;
    return crypto.createHash('sha256').update(saltedPassword).digest('hex');
}

// Validar email
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Crear interfaz de readline
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

// Preguntar al usuario
function question(rl: readline.Interface, query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function createAdmin() {
    console.log('\n═══════════════════════════════════════');
    console.log('   Crear Nuevo Administrador SafeTrade');
    console.log('═══════════════════════════════════════\n');

    const rl = createInterface();
    let connection: mysql.Connection | null = null;

    try {
        // Solicitar email
        let email = '';
        while (!email || !isValidEmail(email)) {
            email = await question(rl, '📧 Email del administrador: ');
            if (!isValidEmail(email)) {
                console.log('❌ Email inválido. Por favor ingresa un email válido.\n');
                email = '';
            }
        }

        // Solicitar contraseña
        let password = '';
        while (!password || password.length < 8) {
            password = await question(rl, '🔑 Contraseña (mínimo 8 caracteres): ');
            if (password.length < 8) {
                console.log('❌ La contraseña debe tener al menos 8 caracteres.\n');
                password = '';
            }
        }

        // Confirmar contraseña
        const passwordConfirm = await question(rl, '🔑 Confirmar contraseña: ');
        if (password !== passwordConfirm) {
            console.log('\n❌ Las contraseñas no coinciden. Abortando.\n');
            rl.close();
            process.exit(1);
        }

        console.log('\n🔌 Conectando a la base de datos...');

        // Conectar a la base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'safetrade_dev2'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar si el admin ya existe
        const [existingAdmin] = await connection.query(
            'SELECT id, email FROM admin_users WHERE email = ?',
            [email]
        );

        if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
            console.log('⚠️  Ya existe un administrador con este email');
            console.log('   ID:', (existingAdmin[0] as any).id);
            console.log('   Email:', (existingAdmin[0] as any).email);
            console.log('\n❌ No se puede crear el administrador duplicado.\n');
            rl.close();
            return;
        }

        // Generar salt y hash
        console.log('🔐 Generando credenciales seguras...');
        const salt = generateSalt();
        const passHash = await hashPassword(password, salt);

        // Insertar administrador
        const [result] = await connection.query(
            'INSERT INTO admin_users (email, pass_hash, salt) VALUES (?, ?, ?)',
            [email, passHash, salt]
        );

        const insertId = (result as any).insertId;

        console.log('\n✅ Administrador creado exitosamente!\n');
        console.log('═══════════════════════════════════════');
        console.log('   ID:', insertId);
        console.log('   Email:', email);
        console.log('   Contraseña:', '***' + '*'.repeat(password.length - 3));
        console.log('═══════════════════════════════════════\n');
        console.log('🎉 El administrador puede iniciar sesión en:');
        console.log('   URL: http://localhost:3001/login\n');

        rl.close();

    } catch (error) {
        console.error('\n❌ Error al crear el administrador:', error);
        if (error instanceof Error) {
            console.error('   Mensaje:', error.message);
        }
        rl.close();
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada\n');
        }
    }
}

// Ejecutar el script
createAdmin()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
