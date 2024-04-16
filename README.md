# Learning Microsoft Automation with MS Graph APIs - NestJS Backend

## Description

Microsoft Teams is kind of terrible, but like many employees, I'm stuck in a Microsoft world.
I would love to automate some annoying steps I often have to repeat a lot.
I also want to learn NestJS, so why not learn both at the same time.

This repo is to document my learning in developing a backend API that can authenticate with a Azure tenant, and automate the creation and modification of Microsoft Teams channels/teams, SharePoint, and Microsoft Lists (aka SharePoint Lists).

If you'd like to see how I did it, scroll to the How I Did It section of this Readme.

### Goals

What I hope to achieve with this project:

- [ ] Authenticate with Azure, using the users session (and their permissions).
- [ ] Create a Teams team using the Body of a HTTP POST.
- [ ] Create a Teams channel within above team.
- [ ] Add users to Teams channel.

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
yarn run start

# watch mode
yarn run start:dev

# production mode
yarn run start:prod
```

## Test

```bash
# unit tests
yarn run test

# e2e tests
yarn run test:e2e

# test coverage
yarn run test:cov
```

## License

As this project is for my own learning, this repo is [MIT licensed](LICENSE).

## How I Did It

I like to document my process to solidfy what I learn, but if this helps you then that's even better.

### 1. Azure Entra App Registration
