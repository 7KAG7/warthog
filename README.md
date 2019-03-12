# Warthog - GraphQL API Framework

[![npm version](https://img.shields.io/npm/v/warthog.svg)](https://www.npmjs.org/package/warthog)
[![CircleCI](https://circleci.com/gh/goldcaddy77/warthog/tree/master.svg?style=shield)](https://circleci.com/gh/goldcaddy77/warthog/tree/master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](#badge)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Join the chat at https://gitter.im/warthog-graphql/community](https://badges.gitter.im/warthog-graphql/community.svg)](https://gitter.im/warthog-graphql/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Opinionated framework for building GraphQL APIs with strong conventions.  With Warthog, set up your data models and the following are automatically generated:

- Database schema - generated by [TypeORM](https://github.com/typeorm/typeorm)
- Your entire GraphQL Schema including:
  - types to match your entities - generated by [TypeGraphQL](https://github.com/19majkel94/type-graphql)
  - GraphQL inputs for consistent creates, updates, filtering, and pagination
    inspired by [Prisma](https://github.com/prisma/prisma)'s conventions
- A [graphql-binding](https://github.com/graphql-binding/graphql-binding) for
  type-safe programmatic access to your APIs.
- TypeScript classes for the generated GraphQL schema for type-safety while developing.
- Automatic validation before data is saved using any of the decorators available in the [class-validator](https://github.com/typestack/class-validator#validation-decorators) library.

## Warning

The API for this library is still subject to change.  It will likely shift until version 2, at which time it will become stable.  I'd love early adopters, but please know that there might be some breaking changes for a few more weeks.

## Prerequisites

You must have Postgresql installed to use Warthog.  If you're on OSX and have [Homebrew](https://brew.sh/) installed, you can simply run:

```bash
brew install postgresql
```

Otherwise, you can install [Postgres.app](https://postgresapp.com/) or use the Google machine to figure out how to install on your OS.

## Usage

The easiest way to start using Warthog for a fresh project is to clone the [warthog-starter](https://github.com/goldcaddy77/warthog-starter) repo.  This has a simple example in place to get you started.  There are also a bunch of examples in the [examples](./examples/README.md) folder for more advanced use cases.

Note that the examples in the [examples](./examples/README.md) folder use relative import paths to call into Warthog.  In your projects, you won't need to set this config value as it's only set to deal with the fact that it's using the Warthog core files without consuming the package from NPM.  In your projects, you can omit this as I do in [warthog-starter](https://github.com/goldcaddy77/warthog-starter).

### Installing in Existing Project

```bash
yarn add warthog
```

### 1. Create a Model

The model will auto-generate your database table and graphql types.  Warthog will find all models that match the following glob - `'/**/*.model.ts'`.  So for this file, you would name it `user.model.ts`

```typescript
import { BaseModel, Model, StringField } from 'warthog';

@Model()
export class User extends BaseModel {
  @StringField()
  name?: string;
}
```

### 2. Create a Resolver

The resolver auto-generates queries and mutations in your GraphQL schema.  Warthog will find all resolvers that match the following glob - `'/**/*.resolver.ts'`.  So for this file, you would name it `user.resolver.ts`

```typescript
import { User } from './user.model';

@Resolver(User)
export class UserResolver extends BaseResolver<User> {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
    super(User, userRepository);
  }

  @Query(returns => [User])
  async users(
    @Args() { where, orderBy, limit, offset }: UserWhereArgs
  ): Promise<User[]> {
    return this.find<UserWhereInput>(where, orderBy, limit, offset);
  }

  @Mutation(returns => User)
  async createUser(@Arg('data') data: UserCreateInput, @Ctx() ctx: BaseContext): Promise<User> {
    return this.create(data, ctx.user.id);
  }
}
```

### 3. Add config to .env file

```env
APP_HOST=localhost
APP_PORT=4100
TYPEORM_DATABASE=warthog
TYPEORM_USERNAME=postgres
TYPEORM_PASSWORD=
```

### 4. Run your server

```typescript

import 'reflect-metadata';
import { Server } from 'warthog';

async function bootstrap() {
  const server = new Server();
  return server.start();
}

bootstrap()
```

When you start your server, there will be a new `generated` folder that has your GraphQL schema in `schema.graphql`.  This contains:

```graphql
type User implements BaseGraphQLObject {
  id: String!
  createdAt: DateTime!
  createdById: String!
  updatedAt: DateTime
  updatedById: String
  deletedAt: DateTime
  deletedById: String
  version: Int!
  name: String!
}

input UserCreateInput {
  name: String!
}

enum UserOrderByInput {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  deletedAt_ASC
  deletedAt_DESC
  name_ASC
  name_DESC
}

input UserUpdateInput {
  name: String
}

input UserWhereInput {
  id_eq: String
  id_in: [String!]
  createdAt_eq: String
  createdAt_lt: String
  createdAt_lte: String
  createdAt_gt: String
  createdAt_gte: String
  createdById_eq: String
  updatedAt_eq: String
  updatedAt_lt: String
  updatedAt_lte: String
  updatedAt_gt: String
  updatedAt_gte: String
  updatedById_eq: String
  deletedAt_all: Boolean
  deletedAt_eq: String
  deletedAt_lt: String
  deletedAt_lte: String
  deletedAt_gt: String
  deletedAt_gte: String
  deletedById_eq: String
  name_eq: String
  name_contains: String
  name_startsWith: String
  name_endsWith: String
  name_in: [String!]
}

input UserWhereUniqueInput {
  id: String!
}
```

Notice how we've only added a single field on the model and you get pagination, filtering and tracking of who created, updated and deleted records automatically.

## Config

All config is driven by environment variables.  Most options can also be set by setting the value when creating your `Server` instance.

| variable | value | config option name | default |
| --- | --- | --- | --- |
| APP_HOST | App server host | appOptions.host | _none_ |
| APP_PORT | App server port | appOptions.port | 4000 |
| TYPEORM_DATABASE | DB name | _none_ | _none_ |
| TYPEORM_USERNAME | DB username | _none_ | _none_ |
| TYPEORM_PASSWORD | DB password | _none_ | _none_ |

## Intentionally Opinionated

Warthog is intentionally opinionated to accelerate development and make use of technology-specific features:

- Postgres - currently the only database supported.  This could be changed, but choosing Postgres allows adding a docker container and other goodies easily.
- Jest - other harnesses will work, but if you use Jest, we will not open the GraphQL playground when the server starts, for example.
- Soft deletes - no records are ever deleted, only "soft deleted".  The base service used in resolvers filters out the deleted records by default.

## Thanks

Special thanks to the authors of:

- [TypeORM](https://github.com/typeorm/typeorm)
- [TypeGraphQL](https://github.com/19majkel94/type-graphql)
- [Prisma](https://github.com/prisma/prisma)

Warthog is essentially a really opinionated composition of TypeORM and TypeGraphQL that uses similar GraphQL conventions to the Prisma project.

## Contribute

PRs accepted, fire away!  Or add issues if you have use cases Warthog doesn't cover.

## License

MIT © Dan Caddigan
