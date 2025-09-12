# 🌀 Mini AWS Console (Personal Project)

A **custom, focused AWS Management Console** built with Next.js.  
This project is designed to provide a **fast, opinionated, serverless-first UI** for the AWS services I use the most, while helping me **learn deeply about AWS APIs, authentication flows, and modern frontend architecture**.

---

## 🎯 Project Goal

Build my own lightweight AWS Console that:

- Authenticates securely using **Cognito \+ STS** (temporary credentials).
- Interacts **directly with AWS services via SDK** for a snappy UX.
- Provides a **better user experience** for the subset of services I actually need (Lambda, API Gateway, DynamoDB, S3, CloudFormation).
- Serves as a **learning project** to deepen my AWS and frontend engineering skills.
- Doubles as a **portfolio piece** to showcase system design, cloud integration, and UI engineering.

---

## 🔹 Motivation

- The official AWS Console is **feature-rich but overwhelming** — I don’t need all services.
- I want a **streamlined, minimal UI** tailored to _my workflows_ (deployments, testing serverless APIs, debugging events).
- By re-implementing a mini console, I’ll gain insights into:
  - How AWS APIs are actually used under the hood.
  - Authentication and identity management (Cognito, STS, IAM roles).
  - Optimistic UI, caching, and local-first UX patterns.

---

## 🏗 High-Level Architecture

\[ User \] → \[ Next.js Frontend \]

           \- React / App Router

           \- TanStack Query for caching \+ optimistic updates

           \- Styled UI components

\[ Cognito User Pool \+ Hosted UI \]

           \- Handles login (IdP federation possible)

\[ Cognito Identity Pool \]

           \- Exchanges JWT → AWS STS creds (temporary)

           \- IAM roles define per-user access

\[ AWS SDK (in browser) \]

           \- Direct calls to AWS APIs (Lambda, DynamoDB, S3, etc.)

\[ Optional Backend (Next.js API Routes) \]

           \- Proxy or batch operations when needed

           \- Adds security, caching, or auditing if required

---

## 📦 Target Services (Phase 1\)

- **Lambda**

  - List functions, runtimes, last modified
  - Invoke test events
  - View logs (basic integration with CloudWatch Logs)

- **S3**

  - List buckets
  - Browse objects, upload/download

- **DynamoDB**

  - List tables & item counts
  - Query simple records by PK/SK

- **API Gateway**

  - Visualize routes and connected Lambdas
  - Enable/disable stages

- **CloudFormation**
  - View deployed stacks
  - Inspect stack resources & statuses

---

## 🚀 Roadmap

### Phase 1 (MVP)

- Authentication with Cognito (Hosted UI → STS creds).
- Basic dashboard with Lambda \+ S3 \+ DynamoDB listings.

### Phase 2

- Add actions: invoke Lambda, upload to S3, query DynamoDB records.
- CloudFormation stack viewer (list \+ resources).

### Phase 3

- API Gateway visualization \+ route management.
- Improving UI with optimistic updates and background revalidation.
- Local-first caching (React Query \+ IndexedDB).

### Phase 4

- More AWS integrations (SNS, SQS, EventBridge).
- Dashboards combining multiple services under a “project view.”
- Polished UI \+ documentation \+ deployment guide.

---

## 🔐 Security Principles

- No permanent IAM credentials — **only short-lived STS creds**.
- **Least-privilege IAM roles** (scoped by service/action).
- Store tokens securely (in-memory/session, **not** in localStorage).
- Option to run with a backend proxy for sensitive operations.

---

## 🧑‍💻 Learning Outcomes

- Practical AWS API usage (not just console/CLI).
- Hands-on experience with **Cognito, STS, IAM policies**.
- Building secure **auth flows in Next.js**.
- Designing a **local-first, optimistic UI** with React Query.
- Developing a real-world project that connects **infra \+ frontend**.

---

## 🌟 Why This Project Matters

This is not just a toy:  
By building a custom AWS Console, I demonstrate:

- The ability to abstract **complex cloud APIs into clean UX**.
- Strong knowledge of **cloud fundamentals and frontend system design**.
- Creativity in rethinking bloated tools with **developer-focused simplification**.

This project will serve both as:

1. A day-to-day helper for my serverless workflows.
2. A showcase portfolio project for career growth.

---
