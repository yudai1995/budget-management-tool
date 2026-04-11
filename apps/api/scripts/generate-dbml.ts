import { mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';

import { BudgetDataModel } from '../src/infrastructure/persistence/entity/BudgetDataModel';
import { UserDataModel } from '../src/infrastructure/persistence/entity/UserDataModel';

function main() {
    const projectRoot = path.resolve(__dirname, '..'); // apps/api
    const repoRoot = path.resolve(projectRoot, '..', '..'); // repo root
    const outDir = path.join(repoRoot, 'docs', 'database');
    const outFile = path.join(outDir, 'schema.dbml');

    mkdirSync(outDir, { recursive: true });

    // Ensure decorators are loaded
    void BudgetDataModel;
    void UserDataModel;

    const storage = getMetadataArgsStorage();

    const entities = storage.tables
        .filter((t) => t.target === BudgetDataModel || t.target === UserDataModel)
        .map((t) => ({
            target: t.target as Function,
            name: (t as any).name || (t.target as any).name,
        }));

    const columnsByTarget = new Map<Function, typeof storage.columns>();
    for (const e of entities) {
        columnsByTarget.set(
            e.target,
            storage.columns.filter((c) => c.target === e.target)
        );
    }

    const relations = storage.relations.filter((r) => r.target === BudgetDataModel || r.target === UserDataModel);
    const joinColumns = storage.joinColumns;

    const tableNameOf = (target: Function) => {
        const found = entities.find((e) => e.target === target);
        return found?.name ?? (target as any).name;
    };

    const columnNameOf = (c: any) => (c.options && c.options.name) || c.propertyName;

    const dbmlTypeOf = (c: any): string => {
        const t = c.options?.type;

        // 1) Entity の物理型指定を最優先
        if (typeof t === 'string') {
            if (t === 'int' || t === 'integer' || t === 'bigint') return 'integer';
            if (t === 'tinyint') return 'tinyint';
            if (t === 'varchar' || t === 'text') return 'varchar';
            if (t === 'enum') return 'enum';
            if (t === 'datetime' || t === 'timestamp' || t === 'date') return 'datetime';
            return t;
        }

        // 2) type が関数指定の場合の補正
        if (typeof t === 'function') {
            const n = t.name;
            if (n === 'Number') return 'integer';
            if (n === 'Date') return 'datetime';
            if (n === 'String') return 'varchar';
        }

        // 3) TypeScript の反射型へフォールバック
        const reflected = c.options?.reflectedType;
        if (reflected === Number) return 'integer';
        if (reflected === Date) return 'datetime';
        if (reflected === String) return 'varchar';

        return 'varchar';
    };

    const dbmlDefault = (c: any): string | null => {
        if (c.options?.default === undefined) return null;
        // numbers like 1, strings, functions etc
        const d = c.options.default;
        if (typeof d === 'number') return String(d);
        if (typeof d === 'string') return `'${d}'`;
        return null;
    };

    const lines: string[] = [];

    for (const e of entities) {
        lines.push(`Table ${e.name} {`);

        // Combine columns and special columns (CreateDateColumn etc) are already in storage.columns
        const cols = columnsByTarget.get(e.target) || [];
        for (const c of cols) {
            const colName = columnNameOf(c);
            const type = dbmlTypeOf(c);

            const attrs: string[] = [];
            const isPk = storage.columns.some(
                (cc) => cc.target === e.target && cc.propertyName === c.propertyName && (cc.options as any)?.primary
            );
            if (isPk) attrs.push('pk');
            if (c.options?.nullable) attrs.push('null');
            const def = dbmlDefault(c);
            if (def !== null) attrs.push(`default: ${def}`);

            lines.push(`  ${colName} ${type}${attrs.length ? ' [' + attrs.join(', ') + ']' : ''}`);
        }

        lines.push('}');
        lines.push('');
    }

    // Refs (relations)
    // We only need Budget.userId -> User.userId currently.
    for (const r of relations) {
        if (r.relationType !== 'many-to-one') continue;
        const fromTable = tableNameOf(r.target as any);
        const toTarget = (r.type as any)();
        const toTable = tableNameOf(toTarget);

        // Find join column name on this relation
        const jc = joinColumns.find((j) => j.target === r.target && j.propertyName === r.propertyName);
        const fromCol = jc?.name || 'userId';
        const toCol = jc?.referencedColumnName || 'userId';

        lines.push(`Ref: ${fromTable}.${fromCol} > ${toTable}.${toCol}`);
    }

    writeFileSync(outFile, lines.join('\n'), 'utf8');

    console.log(`\nGenerated DBML: ${outFile}\n`);
}

main();
