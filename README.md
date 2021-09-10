# PancakeSwap NFT Marketplace API

Serverless API implementation for PancakeSwap NFT Marketplace

# Dependencies

- [Vercel CLI](https://vercel.com/download)
  - Required to emulate local environment (serverless).

# Configuration

# 1. Database

You can configure your database URI for any development purpose by exporting an environment variable.

```shell
# Default: mongodb://localhost:27017/marketplace
export MONGO_URI = "mongodb://host:port/database";
```

# Development

## Install requirements

```shell
yarn global add vercel
```

## Build

```shell
# Install dependencies
yarn

# Build project
vercel dev
```

Endpoints are based on filename inside the `api/` folder.

```shell
# api/version.ts
curl -X GET 'localhost:3000/api/version'

# ...
```

# Production

## Deploy

Deploy to production should be triggered by a webhook when a commit, or a pull-request is merged to `master`.

If you need to force a deployment, use the following command:

```shell
vercel --prod
```
