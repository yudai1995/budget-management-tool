#!/usr/bin/env ts-node
/**
 * JWT RS256 用の RSA 鍵ペアを生成して .env に追記するスクリプト。
 *
 * 実行方法:
 *   pnpm gen:keys
 *
 * 出力形式:
 *   シングルライン PEM（\n でエスケープ）を .env に追記する。
 *   既存の JWT_PRIVATE_KEY / JWT_PUBLIC_KEY は上書きしない。
 */
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
});

// 改行を \n にエスケープしてシングルライン化
const toSingleLine = (pem: string) => pem.replace(/\n/g, '\\n').trim();

const privateKeyLine = `JWT_PRIVATE_KEY="${toSingleLine(privateKey)}"`;
const publicKeyLine = `JWT_PUBLIC_KEY="${toSingleLine(publicKey)}"`;

console.log('\n========== 生成された鍵 (.env に追記) ==========');
console.log(privateKeyLine.slice(0, 60) + '...');
console.log(publicKeyLine.slice(0, 60) + '...');

let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';

if (envContent.includes('JWT_PRIVATE_KEY=')) {
    console.log('\n⚠️  JWT_PRIVATE_KEY は既に .env に存在します。上書きしませんでした。');
    console.log('   手動で更新する場合は .env を直接編集してください。');
} else {
    envContent += `\n${privateKeyLine}\n${publicKeyLine}\n`;
    writeFileSync(ENV_PATH, envContent, 'utf-8');
    console.log(`\n✅ .env に追記しました: ${ENV_PATH}`);
}

console.log('\n📋 apps/web/.env.local にも JWT_PUBLIC_KEY を追加してください:');
console.log(publicKeyLine);
