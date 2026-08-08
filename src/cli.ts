#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * =========================================================
 * Generic Module Generator
 * =========================================================
 *
 * Generates a full CRUD module for ANY project:
 *
 * app/api/<collection>/
 * ├── route.ts
 * └── [id]/
 *     └── route.ts
 *
 * src/models/
 * └── <name>.model.ts
 *
 * src/modules/<name>/
 * ├── index.ts
 * ├── <collection>.repository.ts
 * ├── <collection>.service.ts
 * ├── <collection>.schema.ts
 * ├── serializer.ts
 * ├── types.ts
 * └── actions.ts
 *
 * ------------------------------------------------
 * Usage
 * ------------------------------------------------
 *
 * npm run generate:module -- activity
 *
 * Force overwrite:
 *
 * npm run generate:module -- activity --force
 *
 * Options:
 *
 *   --force           Overwrite existing files
 *   --init            Write a generate.config.ts with defaults
 *   --config <path>   Config file (default: generate.config.ts)
 *   --src-dir <dir>   Override source directory (e.g. src)
 *   --modules-dir <dir> Override modules directory
 *   --models-dir <dir>  Override models directory
 *   --api-dir <dir>   Override API directory (e.g. app/api)
 *   --alias <prefix>  Import alias (e.g. @/ or ~/)
 *   --no-alias        Use relative imports instead of an alias
 *   --help            Show this help
 *
 * ------------------------------------------------
 * Portability
 * ------------------------------------------------
 *
 * Copy this file into any project and run it. The generator:
 *
 *  1. Reads an optional generate.config.ts (see --init) for
 *     project-specific paths and settings.
 *  2. Auto-detects the tsconfig alias style, so generated
 *     imports always resolve:
 *        "@/*": ["./src/*"]  ->  "@/models/..."
 *        "@/*": ["./*"]      ->  "@/src/models/..."
 *  3. Falls back to relative imports with --no-alias.
 * =========================================================
 */

/* =========================================================
   CLI PARSING
========================================================= */

interface CliOptions {
    input: string[];
    force: boolean;
    help: boolean;
    init: boolean;
    configPath: string;
    srcDir?: string;
    modulesDir?: string;
    modelsDir?: string;
    apiDir?: string;
    alias?: string;
}

function parseArgs(
    args: string[]
): CliOptions {
    const options: CliOptions = {
        input: [],
        force: false,
        help: false,
        init: false,
        configPath: "generate.config.ts",
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        const value = () => {
            const next = args[++i];

            if (!next || next.startsWith("-")) {
                console.warn(
                    `⚠️ Missing value for ${arg}`
                );

                return undefined;
            }

            return next;
        };

        switch (arg) {
            case "--force":
                options.force = true;
                break;

            case "--help":
                options.help = true;
                break;

            case "--init":
                options.init = true;
                break;

            case "--config":
                options.configPath =
                    value() ?? options.configPath;
                break;

            case "--src-dir":
                options.srcDir = value();
                break;

            case "--modules-dir":
                options.modulesDir = value();
                break;

            case "--models-dir":
                options.modelsDir = value();
                break;

            case "--api-dir":
                options.apiDir = value();
                break;

            case "--alias":
                options.alias = value();
                break;

            case "--no-alias":
                options.alias = "none";
                break;

            default:
                if (arg.startsWith("-")) {
                    console.warn(
                        `⚠️ Unknown option: ${arg}`
                    );
                } else {
                    options.input.push(arg);
                }
        }
    }

    return options;
}

function showHelp() {
    console.log(`
Generic Module Generator
========================

Creates a full CRUD module:

  app/api/<collection>/
  ├── route.ts
  └── [id]/
      └── route.ts

  src/models/<name>.model.ts
  src/modules/<name>/
  ├── index.ts
  ├── <collection>.repository.ts
  ├── <collection>.service.ts
  ├── <collection>.schema.ts
  ├── serializer.ts
  ├── types.ts
  └── actions.ts

Usage
-----

  npm run generate:module -- <name> [options]

Options
-------

  --force            Overwrite existing files
  --init             Write a generate.config.ts with defaults
  --config <path>    Config file (default: generate.config.ts)
  --src-dir <dir>    Override source directory (e.g. src)
  --modules-dir <dir> Override modules directory
  --models-dir <dir>  Override models directory
  --api-dir <dir>    Override API directory (e.g. app/api)
  --alias <prefix>   Import alias (e.g. @/ or ~/)
  --no-alias         Use relative imports instead of an alias
  --help             Show this help

Config file
-----------

Create one with --init, then adjust the paths:

  const config = {
    paths: {
      srcDir: "src",
      modulesDir: "src/modules",
      modelsDir: "src/models",
      apiDir: "app/api",
    },
    alias: "@/",
    tsconfigPath: "tsconfig.json",
    autoConfigureAlias: true,
  };

  export default config;

CLI flags always override the config file. When no config file
exists, sensible defaults (above) are used.
`);
}

const INIT_CONFIG_TEMPLATE = `
/**
 * Generic module generator configuration.
 *
 * Created with: npm run generate:module -- --init
 *
 * Adjust the paths below to match THIS project, then run:
 *
 *   npm run generate:module -- <module-name>
 *
 * CLI flags (--src-dir, --alias, --no-alias, ...) always
 * override the values in this file.
 */
const config = {
    paths: {
        srcDir: "src",
        modulesDir: "src/modules",
        modelsDir: "src/models",
        apiDir: "app/api",
    },
    alias: "@/",
    tsconfigPath: "tsconfig.json",
    autoConfigureAlias: true,
};

export default config;
`;

function writeInitConfig(
    configPath: string
) {
    const absolutePath = path.resolve(
        configPath
    );

    if (fs.existsSync(absolutePath)) {
        console.error(
            `❌ ${configPath} already exists.`
        );

        process.exit(1);
    }

    fs.writeFileSync(
        absolutePath,
        INIT_CONFIG_TEMPLATE.trimStart(),
        "utf8"
    );

    console.log(
        `✓ Created ${configPath}`
    );

    console.log(
        "Edit it to match this project, then run the generator again."
    );
}

const cli = parseArgs(
    process.argv.slice(2)
);

if (cli.help) {
    showHelp();
    process.exit(0);
}

if (cli.init) {
    writeInitConfig(cli.configPath);
    process.exit(0);
}

const input = cli.input[0];

if (!input) {
    console.error(
        "❌ Module name is required.\n"
    );

    console.error(
        "Usage:\n" +
        "  npm run generate:module -- activity\n" +
        "  npm run generate:module -- activity --force\n"
    );

    console.error(
        "Run with --help for all options."
    );

    process.exit(1);
}

/**
 * =========================================================
 * Name Helpers
 * =========================================================
 */

function kebabCase(value: string) {
    return value
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
}

function pascalCase(value: string) {
    return value
        .split("-")
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0).toUpperCase() +
                part.slice(1)
        )
        .join("");
}

function camelCase(value: string) {
    const pascal = pascalCase(value);

    return (
        pascal.charAt(0).toLowerCase() +
        pascal.slice(1)
    );
}

function pluralize(value: string) {
    if (value.endsWith("y")) {
        return `${value.slice(0, -1)}ies`;
    }

    if (
        value.endsWith("s") ||
        value.endsWith("x") ||
        value.endsWith("z") ||
        value.endsWith("ch") ||
        value.endsWith("sh")
    ) {
        return `${value}es`;
    }

    return `${value}s`;
}

/**
 * =========================================================
 * Names
 * =========================================================
 */

const moduleName = kebabCase(input);

if (!moduleName) {
    console.error(
        "❌ Invalid module name."
    );

    process.exit(1);
}

const ModuleName = pascalCase(moduleName);

const moduleVariable = camelCase(moduleName);

const collectionName = pluralize(moduleName);

const CollectionName = pascalCase(collectionName);

/**
 * =========================================================
 * Config
 * =========================================================
 */

const root = process.cwd();

interface GenerateConfig {
    paths: {
        srcDir: string;
        modulesDir: string;
        modelsDir: string;
        apiDir: string;
    };
    alias: string | null;
    tsconfigPath: string;
    autoConfigureAlias: boolean;
}

const DEFAULT_CONFIG: GenerateConfig = {
    paths: {
        srcDir: "src",
        modulesDir: "src/modules",
        modelsDir: "src/models",
        apiDir: "app/api",
    },
    alias: "@/",
    tsconfigPath: "tsconfig.json",
    autoConfigureAlias: true,
};

function escapeRegExp(value: string) {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

function mergeConfig(
    base: GenerateConfig,
    override: Partial<GenerateConfig>
): GenerateConfig {
    return {
        ...base,
        ...override,
        paths: {
            ...base.paths,
            ...(override.paths ?? {}),
        },
    };
}

async function loadConfig(
    configPath: string
): Promise<GenerateConfig> {
    const absolutePath = path.resolve(
        configPath
    );

    if (!fs.existsSync(absolutePath)) {
        return DEFAULT_CONFIG;
    }

    try {
        const loaded = await import(
            pathToFileURL(absolutePath).href
        );

        const raw =
            loaded.default ?? loaded.config;

        if (!raw) {
            console.warn(
                `⚠️ ${configPath} has no default export. Using defaults.`
            );

            return DEFAULT_CONFIG;
        }

        return mergeConfig(
            DEFAULT_CONFIG,
            raw
        );
    } catch (error) {
        console.warn(
            `⚠️ Could not load ${configPath}:`,
            error instanceof Error
                ? error.message
                : error
        );

        console.warn(
            "Using defaults."
        );

        return DEFAULT_CONFIG;
    }
}

/**
 * =========================================================
 * Import Path Helpers
 * =========================================================
 */

function toPosix(value: string) {
    return value.split(path.sep).join("/");
}

/**
 * Builds a function that turns a target module/model path
 * into an import specifier.
 *
 * With an alias, imports go through the alias and are made
 * relative to the project root:
 *
 *   target src/models/task.model, alias "@/src/"
 *   -> "@/src/models/task.model"
 *
 * Without an alias, imports are plain relative paths:
 *
 *   "../../models/task.model"
 */
function makeImporter(
    alias: string | null,
    srcDirName: string
) {
    if (!alias) {
        return function (
            target: string,
            fromFile: string
        ) {
            const fromDir = path.dirname(
                fromFile
            );

            let relative = toPosix(
                path.relative(
                    fromDir,
                    target
                )
            );

            if (!relative.startsWith(".")) {
                relative = `./${relative}`;
            }

            return relative;
        };
    }

    return function (
        target: string,
        _fromFile: string
    ) {
        let relative = toPosix(
            path.relative(root, target)
        );

        const prefix = `${srcDirName}/`;

        if (relative.startsWith(prefix)) {
            relative = relative.slice(
                prefix.length
            );
        }

        return `${alias}${relative}`;
    };
}

/**
 * Works out the import prefix that matches the project's
 * existing tsconfig alias mapping:
 *
 *   "@/*": ["./src/*"]  ->  "@/models/..."  (prefix "@/")
 *   "@/*": ["./*"]      ->  "@/src/models/..." (prefix "@/src/")
 *
 * Falls back to the configured alias when no mapping exists.
 */
function resolveImportPrefix(
    configuredAlias: string,
    srcDirName: string,
    tsconfigPath: string
) {
    const absolutePath = path.resolve(
        tsconfigPath
    );

    if (!fs.existsSync(absolutePath)) {
        return configuredAlias;
    }

    try {
        const content = fs.readFileSync(
            absolutePath,
            "utf8"
        );

        const pattern = new RegExp(
            `"${escapeRegExp(configuredAlias)}\\*"\\s*:\\s*\\["([^"]+)"`
        );

        const match = content.match(
            pattern
        );

        if (!match) {
            return configuredAlias;
        }

        const target = match[1];

        const targetDir = target.replace(
            /\/\*$/,
            ""
        );

        // Alias maps to the project root, so source files
        // live under "<alias><srcDir>/...".
        if (
            targetDir === "." ||
            targetDir === "./"
        ) {
            return `${configuredAlias}${srcDirName}/`;
        }

        return configuredAlias;
    } catch {
        return configuredAlias;
    }
}

/**
 * =========================================================
 * File Generator
 * =========================================================
 */

function generateFile(
    filePath: string,
    content: string
) {
    fs.mkdirSync(
        path.dirname(filePath),
        {
            recursive: true,
        }
    );

    fs.writeFileSync(
        filePath,
        content.trimStart(),
        "utf8"
    );

    console.log(
        `✓ ${path.relative(root, filePath)}`
    );
}

/* =========================================================
   TYPESCRIPT PATH ALIAS
========================================================= */

function ensureTsConfigAlias() {
    const tsconfigPath = path.join(
        root,
        "tsconfig.json"
    );

    if (!fs.existsSync(tsconfigPath)) {
        console.warn(
            "⚠️ tsconfig.json not found. Skipping @/* alias setup."
        );

        return;
    }

    let content = fs.readFileSync(
        tsconfigPath,
        "utf8"
    );

    // Already configured
    if (
        /"@\/*"\s*:\s*\[\s*"\.\/src\/\*"\s*\]/.test(
            content
        )
    ) {
        console.log(
            '✓ TypeScript alias "@/*" already configured'
        );

        return;
    }

    // If paths already exists
    if (/"paths"\s*:\s*\{/.test(content)) {
        content = content.replace(
            /("paths"\s*:\s*\{)/,
            `$1\n      "@/*": ["./src/*"],`
        );

        fs.writeFileSync(
            tsconfigPath,
            content,
            "utf8"
        );

        console.log(
            '✓ Added "@/*" → "./src/*"'
        );

        return;
    }

    // If compilerOptions exists
    if (
        /"compilerOptions"\s*:\s*\{/.test(
            content
        )
    ) {
        content = content.replace(
            /("compilerOptions"\s*:\s*\{)/,
            `$1\n    "paths": {\n      "@/*": ["./src/*"]\n    },`
        );

        fs.writeFileSync(
            tsconfigPath,
            content,
            "utf8"
        );

        console.log(
            '✓ Added "@/*" → "./src/*"'
        );

        return;
    }

    console.warn(
        "⚠️ Could not configure @/* alias automatically."
    );
}
/**
 * =========================================================
 * MODEL
 * =========================================================
 */

const modelTemplate = `
import mongoose, {
    Document,
    Model,
    Schema,
} from "mongoose";

export interface I${ModuleName}
    extends Document {
    createdAt: Date;
    updatedAt: Date;
}

const ${ModuleName}Schema =
    new Schema<I${ModuleName}>(
        {},
        {
            timestamps: true,
        }
    );

${ModuleName}Schema.index({
    createdAt: -1,
});

export const ${ModuleName}Model: Model<I${ModuleName}> =
    mongoose.models.${ModuleName} ||
    mongoose.model<I${ModuleName}>(
        "${ModuleName}",
        ${ModuleName}Schema
    );
`;

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

const typesTemplate = `
export interface Create${ModuleName}Input {}

export interface Update${ModuleName}Input {}

export interface ${ModuleName}Query {
    page?: number;
    limit?: number;
    search?: string;
}
`;

/**
 * =========================================================
 * SCHEMA
 * =========================================================
 */

const schemaTemplate = `
import { z } from "zod";

export const create${ModuleName}Schema =
    z.object({});

export const update${ModuleName}Schema =
    z.object({});

export const ${moduleVariable}QuerySchema =
    z.object({
        page: z.coerce
            .number()
            .int()
            .positive()
            .default(1),

        limit: z.coerce
            .number()
            .int()
            .positive()
            .max(100)
            .default(20),

        search: z
            .string()
            .optional(),
    });
`;

/**
 * =========================================================
 * REPOSITORY
 * =========================================================
 */

function repositoryTemplate(
    modelImport: string
) {
    return `
import {
    ${ModuleName}Model,
} from "${modelImport}";

import type {
    Create${ModuleName}Input,
    Update${ModuleName}Input,
    ${ModuleName}Query,
} from "./types";

export async function create(
    data: Create${ModuleName}Input
) {
    return ${ModuleName}Model.create(data);
}

export async function findAll(
    query: ${ModuleName}Query = {}
) {
    const page = query.page ?? 1;

    const limit = query.limit ?? 20;

    const skip =
        (page - 1) * limit;

    const filter: Record<
        string,
        unknown
    > = {};

    return Promise.all([
        ${ModuleName}Model
            .find(filter)
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        ${ModuleName}Model
            .countDocuments(filter),
    ]);
}

export async function findById(
    id: string
) {
    return ${ModuleName}Model
        .findById(id)
        .lean();
}

export async function update(
    id: string,
    data: Update${ModuleName}Input
) {
    return ${ModuleName}Model
        .findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
            }
        )
        .lean();
}

export async function remove(
    id: string
) {
    return ${ModuleName}Model
        .findByIdAndDelete(id)
        .lean();
}
`;
}

/**
 * =========================================================
 * SERVICE
 * =========================================================
 */

const serviceTemplate = `
import * as repository from "./${collectionName}.repository";

import type {
    Create${ModuleName}Input,
    Update${ModuleName}Input,
    ${ModuleName}Query,
} from "./types";

export async function create(
    data: Create${ModuleName}Input
) {
    return repository.create(data);
}

export async function findAll(
    query: ${ModuleName}Query = {}
) {
    return repository.findAll(query);
}

export async function findById(
    id: string
) {
    return repository.findById(id);
}

export async function update(
    id: string,
    data: Update${ModuleName}Input
) {
    return repository.update(
        id,
        data
    );
}

export async function remove(
    id: string
) {
    return repository.remove(id);
}
`;

/**
 * =========================================================
 * SERIALIZER
 * =========================================================
 */

const serializerTemplate = `
export function serialize(
    data: any
) {
    if (!data) {
        return null;
    }

    const result = {
        ...data,
        id: data._id?.toString(),
    };

    delete result._id;
    delete result.__v;

    return result;
}

export function serializeList(
    data: any[]
) {
    return data.map(serialize);
}
`;

/**
 * =========================================================
 * ACTIONS
 * =========================================================
 */

const actionsTemplate = `
export const ${ModuleName.toUpperCase()}_ACTIONS = {
    CREATED: "created",
    UPDATED: "updated",
    DELETED: "deleted",
} as const;

export type ${ModuleName}Action =
    (typeof ${ModuleName.toUpperCase()}_ACTIONS)[keyof typeof ${ModuleName.toUpperCase()}_ACTIONS];
`;

/**
 * =========================================================
 * INDEX
 * =========================================================
 */

const indexTemplate = `
export * from "./${collectionName}.service";
export * from "./${collectionName}.schema";
export * from "./serializer";
export * from "./types";
export * from "./actions";
`;

/**
 * =========================================================
 * API - COLLECTION
 * =========================================================
 */

function apiCollectionTemplate(
    moduleImport: string
) {
    return `
import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    create,
    findAll,
    create${ModuleName}Schema,
    ${moduleVariable}QuerySchema,
    serialize,
    serializeList,
} from "${moduleImport}";

export async function GET(
    request: NextRequest
) {
    try {
        const searchParams =
            Object.fromEntries(
                request.nextUrl.searchParams
            );

        const query =
            ${moduleVariable}QuerySchema.parse(
                searchParams
            );

        const [data, total] =
            await findAll(query);

        return NextResponse.json({
            success: true,

            data: serializeList(data),

            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(
                    total /
                        (query.limit ?? 20)
                ),
            },
        });
    } catch (error) {
        console.error(
            "${CollectionName} GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch ${collectionName}",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(
    request: NextRequest
) {
    try {
        const body =
            await request.json();

        const data =
            create${ModuleName}Schema.parse(
                body
            );

        const result =
            await create(data);

        return NextResponse.json(
            {
                success: true,
                data: serialize(result),
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "${CollectionName} POST error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create ${moduleName}",
            },
            {
                status: 400,
            }
        );
    }
}
`;
}

/**
 * =========================================================
 * API - SINGLE RESOURCE
 * =========================================================
 */

function apiSingleTemplate(
    moduleImport: string
) {
    return `
import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    findById,
    update,
    remove,
    update${ModuleName}Schema,
    serialize,
} from "${moduleImport}";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const data =
            await findById(id);

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "${ModuleName} not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: serialize(data),
        });
    } catch (error) {
        console.error(
            "${ModuleName} GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch ${moduleName}",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const body =
            await request.json();

        const data =
            update${ModuleName}Schema.parse(
                body
            );

        const result =
            await update(
                id,
                data
            );

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "${ModuleName} not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: serialize(result),
        });
    } catch (error) {
        console.error(
            "${ModuleName} PATCH error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update ${moduleName}",
            },
            {
                status: 400,
            }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const result =
            await remove(id);

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "${ModuleName} not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "${ModuleName} deleted successfully",
        });
    } catch (error) {
        console.error(
            "${ModuleName} DELETE error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete ${moduleName}",
            },
            {
                status: 500,
            }
        );
    }
}
`;
}

/* =========================================================
   MAIN
========================================================= */

async function main() {
    /* ---- Config ---- */

    const config = await loadConfig(
        cli.configPath
    );

    const srcDirName = path.basename(
        path.resolve(config.paths.srcDir)
    );

    const modulesDir = path.resolve(
        config.paths.modulesDir
    );

    const modelsDir = path.resolve(
        config.paths.modelsDir
    );

    const apiDir = path.resolve(
        config.paths.apiDir
    );

    const modulePath = path.join(
        modulesDir,
        moduleName
    );

    const modelPath = path.join(
        modelsDir,
        `${moduleName}.model.ts`
    );

    const apiPath = path.join(
        apiDir,
        collectionName
    );

    /* ---- Import prefix ---- */

    const configuredAlias =
        cli.alias === "none"
            ? null
            : cli.alias ?? config.alias ?? null;

    let alias: string | null = null;

    if (configuredAlias) {
        alias = resolveImportPrefix(
            configuredAlias,
            srcDirName,
            config.tsconfigPath
        );
    }

    const importer = makeImporter(
        alias,
        srcDirName
    );

    const modelImport = importer(
        path.join(
            modelsDir,
            `${moduleName}.model`
        ),
        modulePath
    );

    const moduleImport = importer(
        path.join(
            modulesDir,
            moduleName
        ),
        apiPath
    );

    /* ---- Existing file checks ---- */

    if (!cli.force) {
        if (fs.existsSync(modulePath)) {
            console.error(
                `❌ Module already exists: ${path.relative(root, modulePath)}`
            );

            console.error(
                "Use --force to overwrite it."
            );

            process.exit(1);
        }

        if (fs.existsSync(modelPath)) {
            console.error(
                `❌ Model already exists: ${path.relative(root, modelPath)}`
            );

            console.error(
                "Use --force to overwrite it."
            );

            process.exit(1);
        }

        if (fs.existsSync(apiPath)) {
            console.error(
                `❌ API already exists: ${path.relative(root, apiPath)}`
            );

            console.error(
                "Use --force to overwrite it."
            );

            process.exit(1);
        }
    }

    /* ---- TypeScript alias ---- */

    if (
        configuredAlias &&
        config.autoConfigureAlias
    ) {

        ensureTsConfigAlias(
        );
    }

    /* ---- Summary ---- */

    console.log("");

    console.log(
        `📦 Generating ${ModuleName} module...`
    );

    console.log("");

    console.log("Resolved paths:");

    console.log(
        `  📁 modules: ${path.relative(root, modulesDir)}`
    );

    console.log(
        `  📁 models:  ${path.relative(root, modelsDir)}`
    );

    console.log(
        `  🌐 api:     ${path.relative(root, apiDir)}`
    );

    console.log(
        alias
            ? `  🔧 alias:    "${alias}" (imports use this prefix)`
            : "  🔧 alias:    relative imports (no alias)"
    );

    /* ---- Generate ---- */

    generateFile(
        path.join(
            modulePath,
            "index.ts"
        ),
        indexTemplate
    );

    generateFile(
        path.join(
            modulePath,
            `${collectionName}.repository.ts`
        ),
        repositoryTemplate(modelImport)
    );

    generateFile(
        path.join(
            modulePath,
            `${collectionName}.service.ts`
        ),
        serviceTemplate
    );

    generateFile(
        path.join(
            modulePath,
            `${collectionName}.schema.ts`
        ),
        schemaTemplate
    );

    generateFile(
        path.join(
            modulePath,
            "serializer.ts"
        ),
        serializerTemplate
    );

    generateFile(
        path.join(
            modulePath,
            "types.ts"
        ),
        typesTemplate
    );

    generateFile(
        path.join(
            modulePath,
            "actions.ts"
        ),
        actionsTemplate
    );

    generateFile(
        modelPath,
        modelTemplate
    );

    generateFile(
        path.join(
            apiPath,
            "route.ts"
        ),
        apiCollectionTemplate(moduleImport)
    );

    generateFile(
        path.join(
            apiPath,
            "[id]",
            "route.ts"
        ),
        apiSingleTemplate(moduleImport)
    );

    /* ---- Done ---- */

    console.log("");

    console.log(
        `✅ ${ModuleName} module generated successfully!`
    );

    console.log("");

    console.log("Generated:");

    console.log(
        `  📦 ${path.relative(root, modelPath)}`
    );

    console.log(
        `  📦 ${path.relative(root, modulePath)}/`
    );

    console.log(
        `  🌐 ${path.relative(root, apiPath)}/`
    );

    console.log("");

    console.log(
        `API: /api/${collectionName}`
    );

    console.log("");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});