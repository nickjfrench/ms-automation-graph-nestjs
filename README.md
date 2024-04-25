# Learn Microsoft Automation with MS Graph APIs and NestJS Backend

This repo hopes to provide an almost boilerplate-like setup for NestJS with access to Microsoft (MS) Graph APIs. I've also provided a write-up on how I developed this project, but that is not a tutorial. All I hope to provide is something that gets you off the ground and teaches you something along the way.

Upon cloning this project, you'll be able to call the /api/v1/user route to be redirected to Microsoft for Authorization and displayed your User Profile (from Microsoft).

## 📖 Why I Developed This Project

I would love to automate some annoying steps I often have to repeat a lot within the Microsoft suite (e.g. Teams, SharePoint), but I've found their no-code solutions limiting when I could do so much more with actual code, so I thought lets just access Microsoft Graph APIs in code.

I also want to learn NestJS, so why not use this opportunity to learn both in a practical purpose.

To access MS Graph APIs you need an access token, either application provided or user delegated. To utilize the existing user access controls on Azure and ensuring a user is not performing something they wouldn't normally be able to do, I needed user delegated.

I found the learning material to gain authorization on NestJS with MS to be quite lacking. Most materials focused on using gaining authentication integration for user login to access app resources, the option seen on many websites to "Sign in with Microsoft". However, I need to gain user authorization to access MS Graph APIs on their behalf.

I hope to fill at least a part of this information gap with this repo.

### Write-Up on Development

If you'd like to see my write-up on how I implemented this project, and hopefully learn something along the way, see the [How I Did It](#-how-i-did-it) section of this Readme.

### ❗ Disclaimer

I am not an expert or authority on these topics, what I've provided here is just what I've learnt along the way. This repo is not production-grade nor secure. All I aim to provide is something that gets you off the ground and teaches you something along the way.

## 🛠️ Setup Instructions

### 🔧 Installation

Install NodeJS, Yarn, and NestJS CLI.

Then install the package dependencies with:

```bash
yarn install
```

### ☁️ Azure Entra App Registration

A detailed step-by-step guide is included within [/docs/write-up/README.md](/docs/write-up/README.md).

The TLDR:

- Set Scopes as per `appConfig.json` : "AZURE_SCOPES"
- Set RedirectURI to `http://localhost:3000/api/v1/auth/callback` or production equivalent.
- Copy the Azure secrets listed in the next heading.

### 🔑 Secrets

Set the below secrets as per <https://docs.nestjs.com/techniques/configuration>. For example, a `.env.development.local` file within project root folder.

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_REDIRECT_URI` - {http/https}://{baseurl}/api/v1/auth/callback - Azure Entra App Registration needs to match.
- `SESSION_SECRET_KEY` - This is the secret used by Express-Session within App middleware.

#### 🔒 1Password CLI for Secret Management

I'm using 1Password to manage secrets for this project. That means no secrets are stored in files or in environment variables. This is optional, although the dev package will be installed regardless.

If you wish to use 1Password, ensure 1Password CLI is set up correctly and you're using 1Password secret paths within a .env file. For example, my `.env.development.local` file contains: `AZURE_TENANT_ID=op://Dev/azure-entra/tenant-id`.
Then start the project with `yarn start:dev_op`.

If not using 1Password, ignore this section, use the standard Node start scripts (that have no `_op` appended), and feel free to remove the 1Password package and any mention.

### 🏃 Running the app

```bash
# development
yarn start

# watch mode
yarn start:dev

# watch mode with 1Password CLI secrets management
yarn start:dev_op

# production mode
yarn start:prod
```

### 🔨 Test

```bash
# unit tests
yarn run test

# e2e tests
yarn run test:e2e

# test coverage
yarn run test:cov
```

### 🛣️ Route Prefix

Sticking to API standards, all routes in this project are prefixed with `/api/v1/{route_path}`.
E.g. /api/v1/user

This is configured within [/src/main.ts](/src/main.ts).

## 🪧 License

As this project is for my own learning, this repo is [MIT licensed](LICENSE).

Feel free to use it as you like.

## 🧑‍🏫 How I Did It

I like to document my process to solidify what I learn, so I hope you get some value out of this too.

See [docs/write-up/README.md](docs/write-up/README.md) for the write up on how I developed this project.

This write up isn't a "code as we go" tutorial, instead acts as clone-able codebase that will explain the decisions made and logic being performed.
