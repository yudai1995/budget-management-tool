#!/usr/bin/env ts-node
/**
 * 初回セットアップ用スクリプト。以下を自動生成して .env / apps/web/.env.local に書き込む:
 *   - JWT RS256 RSA 鍵ペア（JWT_PRIVATE_KEY / JWT_PUBLIC_KEY）
 *   - Prisma 接続 URL（DATABASE_URL）
 *
 * 実行方法:
 *   pnpm gen:keys
 *
 * 上書き判定:
 *   - 値が存在しない / プレースホルダー（"..."を含む）→ 実値で置換
 *   - 有効な実値が設定済み → スキップ（既存値を保護）
 */
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');
const WEB_ENV_PATH = resolve(ROOT, 'apps/web/.env.local');

// ─────────────────────────────────────────
// JWT RSA 鍵ペアの生成
// ─────────────────────────────────────────
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const toSingleLine = (pem: string) => pem.replace(/\n/g, '\\n').trim();
const privateKeyLine = `JWT_PRIVATE_KEY="${toSingleLine(privateKey)}"`;
const publicKeyLine = `JWT_PUBLIC_KEY="${toSingleLine(publicKey)}"`;

console.log('\n========== JWT RSA 鍵ペアの生成 ==========');
console.log(privateKeyLine.slice(0, 60) + '...');
console.log(publicKeyLine.slice(0, 60) + '...');

// プレースホルダー値かどうかを判定（"..."を含む場合はプレースホルダー）
const isPlaceholder = (content: string, key: string): boolean => {
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match !== null && match[1].includes('...');
};

let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';

// ─────────────────────────────────────────
// JWT 鍵 → .env への書き込み
// ─────────────────────────────────────────
const hasPrivateKey = envContent.includes('JWT_PRIVATE_KEY=');
const hasKeyPlaceholder = isPlaceholder(envContent, 'JWT_PRIVATE_KEY');

if (hasPrivateKey && !hasKeyPlaceholder) {
    console.log('\n⚠️  JWT_PRIVATE_KEY は既に有効な値が設定されています。スキップします。');
} else if (hasPrivateKey && hasKeyPlaceholder) {
    envContent = envContent
        .replace(/^JWT_PRIVATE_KEY=.*$/m, privateKeyLine)
        .replace(/^JWT_PUBLIC_KEY=.*$/m, publicKeyLine);
    writeFileSync(ENV_PATH, envContent, 'utf-8');
    console.log(`\n✅ .env のプレースホルダーを実際の鍵で置換しました: ${ENV_PATH}`);
} else {
    // 鍵が存在しない場合は追記
    envContent += `\n${privateKeyLine}\n${publicKeyLine}\n`;
    writeFileSync(ENV_PATH, envContent, 'utf-8');
    console.log(`\n✅ .env に鍵を追記しました: ${ENV_PATH}`);
}

// ─────────────────────────────────────────
// DATABASE_URL → .env への書き込み
// ─────────────────────────────────────────
envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';

const dbHost = (envContent.match(/^DB_HOSTNAME=(.*)$/m) ?? [])[1]?.trim() ?? '127.0.0.1';
const dbPort = (envContent.match(/^DB_PORT=(.*)$/m) ?? [])[1]?.trim() ?? '3306';
const dbUser = (envContent.match(/^DB_USER=(.*)$/m) ?? [])[1]?.trim() ?? 'Admin';
const dbPass = (envContent.match(/^DB_PASSWORD=(.*)$/m) ?? [])[1]?.trim() ?? 'password';
const dbName = (envContent.match(/^DB_NAME=(.*)$/m) ?? [])[1]?.trim() ?? 'budgetdb';

const databaseUrl = `DATABASE_URL="mysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}"`;
const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
const hasDatabaseUrlPlaceholder = isPlaceholder(envContent, 'DATABASE_URL');

if (hasDatabaseUrl && !hasDatabaseUrlPlaceholder) {
    console.log('\n⚠️  DATABASE_URL は既に設定されています。スキップします。');
} else if (hasDatabaseUrl && hasDatabaseUrlPlaceholder) {
    envContent = envContent.replace(/^DATABASE_URL=.*$/m, databaseUrl);
    writeFileSync(ENV_PATH, envContent, 'utf-8');
    console.log(`\n✅ DATABASE_URL のプレースホルダーを置換しました: ${ENV_PATH}`);
} else {
    envContent += `\n${databaseUrl}\n`;
    writeFileSync(ENV_PATH, envContent, 'utf-8');
    console.log(`\n✅ DATABASE_URL を追記しました: ${ENV_PATH}`);
}

// ─────────────────────────────────────────
// JWT 公開鍵 → apps/web/.env.local への書き込み
// ─────────────────────────────────────────
let webEnvContent = existsSync(WEB_ENV_PATH) ? readFileSync(WEB_ENV_PATH, 'utf-8') : '';

const webHasPublicKey = webEnvContent.includes('JWT_PUBLIC_KEY=');
const webHasPlaceholder = isPlaceholder(webEnvContent, 'JWT_PUBLIC_KEY');

if (webHasPublicKey && !webHasPlaceholder) {
    console.log('\n⚠️  apps/web/.env.local の JWT_PUBLIC_KEY はスキップします（有効な値が存在）。');
} else if (webHasPublicKey && webHasPlaceholder) {
    webEnvContent = webEnvContent.replace(/^JWT_PUBLIC_KEY=.*$/m, publicKeyLine);
    writeFileSync(WEB_ENV_PATH, webEnvContent, 'utf-8');
    console.log(`\n✅ apps/web/.env.local のプレースホルダーを置換しました: ${WEB_ENV_PATH}`);
} else {
    webEnvContent += `\n${publicKeyLine}\n`;
    writeFileSync(WEB_ENV_PATH, webEnvContent, 'utf-8');
    console.log(`\n✅ apps/web/.env.local に JWT_PUBLIC_KEY を追記しました: ${WEB_ENV_PATH}`);
}
