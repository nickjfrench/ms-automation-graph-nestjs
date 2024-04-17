# Learning Microsoft Automation with MS Graph APIs - NestJS Backend

## 📖 Description

Microsoft Teams is kind of terrible, but like many employees, I'm stuck in a Microsoft world.
I would love to automate some annoying steps I often have to repeat a lot.
I also want to learn NestJS in a practical way, so why not learn both at the same time.

This repo is to document my learning in developing a backend API that can authenticate with a Azure tenant, and automate the creation and modification of Microsoft Teams channels/teams, SharePoint, and Microsoft Lists (aka SharePoint Lists).

If you'd like to see how I did it, scroll to the How I Did It section of this Readme.

### ⭐ Goals

What I hope to achieve with this project:

#### 📝 Basic Features

- [ ] Authenticate with Azure, using the users session (and their permissions).
- [ ] Get list of all teams user is a member of.
- [ ] Create a team.
- [ ] Create a private channel within above team.
- [ ] Access SharePoint site within the private channel.
- [ ] Create a SharePoint List within site.
- [ ] Populate with some rows.
- [ ] Upload a few documents to the SharePoint site.
- [ ] Pin SharePoint List to channel tab.

#### 🗂️ Full Automation

To take it a step further, I would like to use pre-defined templates to structure the Teams, Channels, and Lists.

- [ ] Data structure for template different projects. (Probably just JSON hard coded for now. Look at Docker Compose files for ideas.)
- [ ] Provide a name and create team, if it doesn't exist already.
- [ ] From project options, create a channel.
- [ ] Based on project selected, create SharePoint Lists with columns and formatting defined in template.
- [ ] Based on project selected, create SharePoint List example rows.
- [ ] Based on project selected, populate SharePoint site with folder structures and files.
- [ ] Based on project selected, pin relevant tabs to Teams channel.

## 🛠️ Setup Instructions

### 🔧 Installation

```bash
yarn install
```

### 🔑 Azure Entra ID Secrets

I'm using 1Password to manage secrets for this project. That's the things like `op://dev/item/secret-id` you'll see.

You'll need to either re-point the secret path to your 1Pass vault and item or point to your system env if you're not using 1Pass.

TODO: Flesh Out.

### 🏃 Running the app

```bash
# development
yarn run start

# watch mode
yarn run start:dev

# production mode
yarn run start:prod
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

## 🪧 License

As this project is for my own learning, this repo is [MIT licensed](LICENSE).

## 🧑‍🏫 How I Did It

I like to document my process to solidify what I learn, but if this helps you then that's even better.

### 1. Azure Entra App Registration

## Resources Used

- <https://medium.com/@swagatachaudhuri/implement-azure-ad-authentication-in-nest-js-1fe947da2c99>
