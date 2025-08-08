# Finance Manager App

**Finance Manager** is a cross-platform mobile application built with **React Native** that helps you manage savings, track expenses, and organize your personal finances with ease.  
It’s designed for simplicity, accuracy, and security — giving you the tools you need to stay in control of your money.

---

## **Features**

### 💰 Savings Accounts
- Create and manage **multiple savings accounts**.
- Record **positive transactions** (deposits) and **negative transactions** (withdrawals) to update balances.
- Keep an overview of all accounts in a single dashboard.

### 📊 Expense Tracking
- Create **expense topics** (e.g., *January 2025*, *Vacation*, *Household*).
- Add detailed **expense entries** under each topic.
- Assign **categories** to expenses for better organization and analytics.

### 🔐 Secure Login
- **Username and password** authentication.
- **Stay signed in** using fingerprint authentication — the app securely stores and reloads the token for fast access.

---

## **Tech Stack**

### **Frontend (App)**
- **React Native** for cross-platform development (iOS & Android)
- **Forms**: [Yup](https://github.com/jquense/yup) for validation, [Formik](https://formik.org/) for form management
- **API Communication**: GraphQL with [Apollo Client](https://www.apollographql.com/docs/react/)
- **Code Style**: [Prettier](https://prettier.io/) for consistent formatting
- statemanagement with zustand preffered to capsulate all api stuff there
- navigation with [React Navigation](https://reactnavigation.org/) for seamless transitions

### **Backend**
- **NestJS** for scalable server-side logic
- **PostgreSQL** for data storage
- **GraphQL API** with Apollo Server
- graphql schema cfrom the backend can be found in .ai/backend_graphql_schema.json
---

## **Core Benefits**
- **Simple financial overview** without unnecessary complexity.
- **Customizable expense organization** for personal budgeting.
- **Secure and fast login** with biometric authentication.
- **Modern, maintainable codebase** using industry best practices.
