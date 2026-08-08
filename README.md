# IOTA Next Module Generator

A CLI tool for generating a consistent Next.js module architecture with API routes, Mongoose models, repositories, services, schemas, serializers, types, and actions.

## Features

* Generates Next.js App Router API routes
* Generates Mongoose models
* Generates repository layer
* Generates service layer
* Generates Zod schemas
* Generates serializers
* Generates TypeScript types
* Generates action definitions
* Supports pagination boilerplate
* Supports `--force` regeneration
* Automatically configures the `@/*` TypeScript path alias
* Supports kebab-case module names
* Generates singular model names and plural API routes
* Designed for scalable Next.js applications
* Suitable for construction SaaS and project management applications

## Package

```bash
@iota/next-module-generator
```

CLI:

```bash
iota-next-module
```

## Generated Structure

Running:

```bash
npx @iota/next-module-generator activity
```

generates:

```text
app/
└── api/
    └── activities/
        ├── route.ts
        └── [id]/
            └── route.ts

src/
├── models/
│   └── activity.model.ts
│
└── modules/
    └── activity/
        ├── index.ts
        ├── activities.repository.ts
        ├── activities.service.ts
        ├── activities.schema.ts
        ├── serializer.ts
        ├── types.ts
        └── actions.ts
```

## Requirements

The target project should use:

* Next.js
* TypeScript
* Mongoose
* Zod
* Next.js App Router

The generator expects the target project to have a structure similar to:

```text
project/
├── app/
├── src/
│   ├── models/
│   └── modules/
├── package.json
└── tsconfig.json
```

## Installation

Use the package directly with `npx`:

```bash
npx @iota/next-module-generator activity
```

Or install globally:

```bash
npm install -g @iota/next-module-generator
```

Then use:

```bash
iota-next-module activity
```

## Usage

Navigate to your Next.js project:

```bash
cd my-next-project
```

Generate a module:

```bash
npx @iota/next-module-generator activity
```

This creates the complete Activity module.

### Generate a Task module

```bash
npx @iota/next-module-generator task
```

Result:

```text
app/api/tasks/
├── route.ts
└── [id]/
    └── route.ts

src/models/
└── task.model.ts

src/modules/task/
├── index.ts
├── tasks.repository.ts
├── tasks.service.ts
├── tasks.schema.ts
├── serializer.ts
├── types.ts
└── actions.ts
```

### Generate a Budget module

```bash
npx @iota/next-module-generator budget
```

### Generate a Daily Report module

```bash
npx @iota/next-module-generator daily-report
```

Result:

```text
app/api/daily-reports/
├── route.ts
└── [id]/
    └── route.ts

src/models/
└── daily-report.model.ts

src/modules/daily-report/
├── index.ts
├── daily-reports.repository.ts
├── daily-reports.service.ts
├── daily-reports.schema.ts
├── serializer.ts
├── types.ts
└── actions.ts
```

## Force Regeneration

By default, the generator does not overwrite existing files.

Use:

```bash
npx @iota/next-module-generator activity --force
```

This regenerates:

```text
src/models/activity.model.ts
src/modules/activity/
app/api/activities/
```

Use `--force` carefully because existing custom changes can be overwritten.

## Generated API

Each generated module contains collection and single-resource endpoints.

### GET Collection

```http
GET /api/activities
```

Supports:

```http
GET /api/activities?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### POST Collection

```http
POST /api/activities
```

Request:

```json
{}
```

### GET Resource

```http
GET /api/activities/:id
```

### PATCH Resource

```http
PATCH /api/activities/:id
```

### DELETE Resource

```http
DELETE /api/activities/:id
```

## Generated Module Architecture

The generator follows a layered architecture:

```text
API Route
    |
    v
Service
    |
    v
Repository
    |
    v
Mongoose Model
    |
    v
MongoDB
```

### API

Located at:

```text
app/api/
```

Responsible for:

* HTTP requests
* HTTP responses
* Request parsing
* Validation
* HTTP status codes

### Service

Located at:

```text
src/modules/<module>/<module>.service.ts
```

Responsible for:

* Business logic
* Coordinating repositories
* Application-level operations

### Repository

Located at:

```text
src/modules/<module>/<module>.repository.ts
```

Responsible for:

* Database queries
* Database mutations
* Mongoose operations

### Model

Located at:

```text
src/models/
```

Responsible for:

* MongoDB schema
* Mongoose model
* Database indexes

### Schema

Located at:

```text
src/modules/<module>/<module>.schema.ts
```

Responsible for:

* Zod validation
* Request validation
* Query validation

### Serializer

Located at:

```text
src/modules/<module>/serializer.ts
```

Responsible for:

* API response formatting
* Converting MongoDB `_id` to `id`
* Removing internal MongoDB fields

### Types

Located at:

```text
src/modules/<module>/types.ts
```

Responsible for:

* Create input types
* Update input types
* Query types

### Actions

Located at:

```text
src/modules/<module>/actions.ts
```

Responsible for defining module actions.

Example:

```ts
export const TASK_ACTIONS = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
} as const;
```

## TypeScript Path Alias

The generated code uses:

```ts
import { TaskModel } from "@/models/task.model";
```

and:

```ts
import {
  create,
  findAll,
} from "@/modules/task";
```

The generator expects:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

If the alias is missing, the generator attempts to add it automatically.

## Local Development

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/iota-next-module-generator.git
```

Navigate into the repository:

```bash
cd iota-next-module-generator
```

Install dependencies:

```bash
npm install
```

Run the generator directly with `tsx`:

```bash
npm run dev -- activity
```

## Build

Build the CLI:

```bash
npm run build
```

This generates:

```text
dist/
└── cli.js
```

Test the compiled CLI:

```bash
node dist/cli.js activity
```

## Local Package Testing

Create a package archive:

```bash
npm pack
```

This produces a package similar to:

```text
iota-next-module-generator-1.0.0.tgz
```

Install it into a test Next.js project:

```bash
npm install /path/to/iota-next-module-generator-1.0.0.tgz
```

Then run:

```bash
npx @iota/next-module-generator activity
```

## Development with npm link

From the generator repository:

```bash
npm run build
npm link
```

Navigate to your Next.js project:

```bash
cd my-next-project
```

Run:

```bash
iota-next-module activity
```

## Publishing

Make sure you are logged into npm:

```bash
npm login
```

Check your npm account:

```bash
npm whoami
```

Check the package:

```bash
npm view @iota/next-module-generator
```

Build the package:

```bash
npm run build
```

Test the package contents:

```bash
npm pack --dry-run
```

Publish the package:

```bash
npm publish --access public
```

After publishing, users can run:

```bash
npx @iota/next-module-generator activity
```

or install it globally:

```bash
npm install -g @iota/next-module-generator
```

Then:

```bash
iota-next-module activity
```

## Naming

The generator accepts module names such as:

```bash
npx @iota/next-module-generator activity
npx @iota/next-module-generator task
npx @iota/next-module-generator budget
npx @iota/next-module-generator daily-report
npx @iota/next-module-generator change-order
```

Naming is normalized automatically.

For example:

```text
daily-report
```

generates:

```text
Model:
DailyReport

API:
daily-reports

Module:
daily-report

Repository:
daily-reports.repository.ts

Service:
daily-reports.service.ts

Schema:
daily-reports.schema.ts
```

## Example Construction SaaS Modules

The generator can be used for modules such as:

```text
project
task
budget
team
document
activity
daily-report
schedule
issue
procurement
change-order
inspection
safety
subcontractor
equipment
invoice
payment
```

Example:

```bash
npx @iota/next-module-generator task
npx @iota/next-module-generator budget
npx @iota/next-module-generator activity
npx @iota/next-module-generator daily-report
npx @iota/next-module-generator procurement
npx @iota/next-module-generator change-order
npx @iota/next-module-generator inspection
```

## Recommended Project Architecture

A project using the generator can follow:

```text
app/
└── api/
    ├── projects/
    ├── tasks/
    ├── budgets/
    ├── activities/
    ├── documents/
    ├── daily-reports/
    ├── procurement/
    └── change-orders/

src/
├── models/
│   ├── project.model.ts
│   ├── task.model.ts
│   ├── budget.model.ts
│   ├── activity.model.ts
│   └── document.model.ts
│
└── modules/
    ├── project/
    ├── task/
    ├── budget/
    ├── activity/
    ├── document/
    ├── daily-report/
    ├── procurement/
    └── change-order/
```

## Roadmap

Potential future features:

* Custom templates
* Module configuration
* Authentication middleware generation
* Role and permission generation
* Soft-delete support
* Audit/activity logging
* Database indexes
* Controller generation
* Unit test generation
* API documentation generation
* OpenAPI schema generation
* Custom output directories
* Template configuration
* Interactive CLI prompts

## License

MIT

## Maintainer

IOTA

Package:

```text
@iota/next-module-generator
```
