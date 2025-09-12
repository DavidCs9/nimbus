# 🌀 Nimbus - Mini AWS Console

> **🚧 Currently in Development**

A custom, focused AWS Management Console built with Next.js. This project provides a fast, opinionated, serverless-first UI for the AWS services I use most, while serving as a deep learning exercise in AWS APIs, authentication flows, and modern frontend architecture.

## 🎯 Project Goal

Build a lightweight AWS Console that:

- ✅ Authenticates securely using **Cognito + STS** (temporary credentials)
- ✅ Interacts **directly with AWS services via SDK** for a snappy UX
- ✅ Provides a **better user experience** for core services (Lambda, API Gateway, DynamoDB, S3, CloudFormation)
- ✅ Serves as a **learning project** to deepen AWS and frontend engineering skills
- ✅ Doubles as a **portfolio piece** showcasing system design and cloud integration

For detailed project overview and architecture, see [`overview.md`](./overview.md).

## � Preview

![Nimbus Console Login Interface](docs/screenshots/nimbus-login-interface.png)
_The sleek login interface with AWS Cognito authentication_

## �🚀 Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Package Manager**: pnpm (as specified in project guidelines)
- **AWS Integration**: AWS SDK for JavaScript
- **Authentication**: AWS Cognito + STS for temporary credentials

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── login/        # Authentication pages
│   └── layout.tsx    # Root layout
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui components
└── lib/             # Utility functions and configurations
```

## 🎯 Current Status

This project is **actively under development**. Core features implemented:

- ✅ **AWS Cognito authentication flow** with Hosted UI integration
- ✅ **Secure token management** with automatic refresh
- ✅ **STS credential exchange** for temporary AWS access
- ✅ **Modern authentication UI** with error handling
- [ ] Service dashboards (Lambda, API Gateway, S3, DynamoDB)
- [ ] Real-time AWS resource monitoring
- [ ] Optimistic UI updates with TanStack Query

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- AWS Account with Cognito User Pool and Identity Pool configured
- Basic understanding of AWS IAM and Cognito

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd nimbus
   pnpm install
   ```

2. **Configure AWS Cognito:**
   Follow our detailed [Cognito Setup Guide](./docs/COGNITO_SETUP.md) to set up:

   - Cognito User Pool with Hosted UI
   - Cognito Identity Pool for AWS access
   - IAM roles with appropriate permissions

3. **Environment configuration:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Cognito configuration
   ```

4. **Start development server:**

   ```bash
   pnpm dev
   ```

5. **Test authentication:**
   - Navigate to http://localhost:3000/login
   - Click "Continue with AWS Cognito"
   - Complete the sign-in flow

### Authentication Flow

The authentication system implements a secure OAuth2 flow:

1. **Login**: Redirects to Cognito Hosted UI
2. **Callback**: Handles authorization code exchange
3. **Token Management**: Stores JWT tokens securely in session storage
4. **AWS Access**: Exchanges tokens for temporary AWS credentials
5. **Auto-refresh**: Automatically refreshes expired tokens
