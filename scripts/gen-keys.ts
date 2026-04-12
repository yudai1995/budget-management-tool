#!/usr/bin/env ts-node
/**
 * JWT RS256 用の RSA 鍵ペアを生成して .env と apps/web/.env.local に書き込むスクリプト。
 *
 * 実行方法:
 *   pnpm gen:keys
 *
 * 出力形式:
 *   シングルライン PEM（\n でエスケープ）を書き込む。
 *
 * 上書き判定:
 *   - JWT_PRIVATE_KEY が存在しない → 追記
 *   - JWT_PRIVATE_KEY がプレースホルダー値（"..."を含む）→ 実値で置換
 *   - JWT_PRIVATE_KEY が有効な実値 → スキップ（既存キーを保護）
 */
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');
const WEB_ENV_PATH = resolve(ROOT, 'apps/web/.env.local');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
});

// 改行を \n にエスケープしてシングルライン化
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

// ─────────────────────────────────────────
// .env への書き込み
// ─────────────────────────────────────────
let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';

const hasPrivateKey = envContent.includes('JWT_PRIVATE_KEY=');
const hasPlaceholder = isPlaceholder(envContent, 'JWT_PRIVATE_KEY');

if (hasPrivateKey && !hasPlaceholder) {
    console.log('\n⚠️  JWT_PRIVATE_KEY は既に .env に有効な値が設定されています。スキップします。');
    console.log('   強制更新する場合は .env から JWT_PRIVATE_KEY / JWT_PUBLIC_KEY を削除してください。');
} else if (hasPrivateKey && hasPlaceholder) {
    // プレースホルダー行を実値で置換
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
// apps/web/.env.local への書き込み
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
