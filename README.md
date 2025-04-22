# 📊 FinTrack

<img src="https://img.icons8.com/dusk/64/000000/money.png" alt="FinTrack Logo" width="64"/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()  
[![Coverage](https://img.shields.io/badge/coverage-90%25-yellow.svg)]()  

---

## 📝 Table of Contents
1. [🎯 Problem Statement](#-problem-statement)  
2. [💡 Project Description](#-project-description)  
3. [📆 Development Sprints](#-development-sprints)  
4. [🚀 Features & Functionality](#-features--functionality)  
5. [⚙️ Tech Stack](#️-tech-stack)  
6. [🛠️ Installation & Setup](#️-installation--setup)  
7. [🏃‍♂️ Running the App](#️-running-the-app)  
8. [📖 API Endpoints](#-api-endpoints)  
9. [🧪 Testing](#-testing)  
10. [👥 Contributors](#-contributors)  
11. [📄 License](#-license)  

---

## 🎯 Problem Statement

Modern professionals juggle multiple streams of income, expenses, and budgets—often relying on manual spreadsheets or siloed apps that lack cohesion, real‑time insights, and robust security. This leads to:
- **Fragmented data**: Income, expenses, and savings scattered across different tools.  
- **Lack of visibility**: Difficult to track spending trends or budget overages at a glance.  
- **Security concerns**: Storing sensitive financial information without enterprise‑grade authentication.

**FinTrack** addresses these challenges by providing a unified, secure, and user‑friendly platform to track every dollar you earn and spend, visualize your financial health over time, and set budgets with real‑time alerts.

---

## 💡 Project Description

FinTrack is a **full‑stack personal finance management** application designed to give users complete control and visibility over their money. It features:
- **Secure Authentication** via Google OAuth 2.0 and traditional email/password logins.  
- **Dynamic Dashboards** with interactive charts and statistics for incomes, expenses, and budgets.  
- **Profile Management** allowing users to update usernames, emails, and passwords seamlessly.  
- **Comprehensive API** built in Go/Gin for lightning‑fast data operations, backed by PostgreSQL for reliability.

---

## 📆 Development Sprints

Over the course of **four** development sprints, we’ve delivered incremental features, rigorous testing, and robust integrations:

#### Sprint 1
**Frontend**  
- Set up Angular project (Angular CLI, folder structure, Angular Material, routing).  
- Implemented User Registration & Login (forms, validation, error handling).  
- Created Dashboard Overview UI (account summary, recent transactions, navigation).  
- Added Transaction forms (income & expense entry with categories).  
- Enabled Monthly Budget setting (budget form, categorization).  

**Backend**  
- User Authentication & Login: hashed passwords, unique usernames.  
- Transaction Storage: store/retrieve user‑specific transactions securely.  
- Data Security & Encryption: private database, encrypted credentials.

#### Sprint 2
**Integration & Data Flow**  
- Connected Angular frontend to Go/Gin backend and PostgreSQL database.  
- Implemented Add/View/Delete for Expense, Income, and Budget.  
- Replaced mock data with real API calls and database persistence.  

**Testing**  
- Frontend unit tests (Jest) for components: login, register, dashboard, expense, income, budget, services.  
- Cypress component tests for critical user flows (login, register, dashboard).  
- Postman collections for API endpoint validation.

#### Sprint 3
- **Core Budgeting Features**: dynamic charts (income vs. expenses, weekly trends), 
  status flags (Overdue/Pending/Paid), transaction history modals.

#### Sprint 4
- **Google OAuth Integration**: one‑click login with Google, secure token handling.  
- **Enhanced Profile Management**: editable user profile (username, email, password).  
- **End‑to‑End Testing**: extensive Cypress & Postman coverage for all flows.

---

## 🚀 Features & Functionality

| Icon | Feature                                      | Description                                                                                   |
|:----:|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| 🔐   | **Google OAuth**                             | One‑click authentication using Google accounts `<img src="https://img.icons8.com/color/20/000000/google-logo.png"/>`. |
| 👤   | **User Profile Management**                 | Edit username, email, and password in real time.                                              |
| 📈   | **Income & Expense Charts**                  | Visualize categories, monthly totals, and percentage changes.                                 |
| 📊   | **Budget Tracking**                          | Set monthly budgets, view spent/remaining/overspent charts.                                   |
| ✅   | **Payment Status Flags**                     | Mark expenses as Overdue, Pending, or Paid.                                                  |
| 🕒   | **Recent Activity & History**                | See your last 5 actions and browse full transaction history in a modal.                      |
| 🛡️   | **Secure Backend**                           | Go/Gin API with JWT session tokens, hashed passwords, and OAuth flows.                        |

---

## ⚙️ Tech Stack

| Layer         | Technology                                                     |
|--------------:|----------------------------------------------------------------|
| **Frontend**  | Angular 15, TypeScript, HTML5, CSS3                            |
| **Backend**   | Go 1.20, Gin framework, JWT, OAuth2                            |
| **Database**  | PostgreSQL 14, GORM ORM                                        |
| **Testing**   | Jest (unit), Cypress (E2E & component), Postman (API)          |
| **Dev Ops**   | npm, Go toolchain, Docker (optional)                           |

---

## 🛠️ Installation & Setup

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/fintrack.git
   cd fintrack
   ```
2. **PostgreSQL**  
   - Create database `fintrack`  
   - Configure your `.env` (copy from `.env.example`)  
3. **Frontend**  
   ```bash
   cd frontend
   npm install
   ```
4. **Backend**  
   ```bash
   cd ../backend
   go mod download
   ```

---

## 🏃‍♂️ Running the App

### Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```
_Open your browser at_ `http://localhost:4200`

### Database
```bash
# In psql:
CREATE DATABASE fintrack;
# Usual PostgreSQL setup (user, password, host, port)
```

### Backend (Go)
```bash
cd backend
go run fintrack.go
```
_Server listens on_ `http://localhost:8080`

---

## 📖 API Endpoints

> Base URL: `http://localhost:8080`

### Authentication
- **Start Google OAuth**  
  `GET /login/google`  
- **Handle OAuth Callback**  
  `GET /oauth2/callback`

### User Profile
- `PUT /users/{id}/username`  
- `PUT /users/{id}/email`  
- `PUT /users/{id}/password`

### Expenses
- `POST /expenses`  
- `GET  /expenses?user_id={id}`  
- `DELETE /expenses/{id}`  

### Income
- `POST /incomes`  
- `GET  /incomes?user_id={id}`  
- `DELETE /incomes/{id}`  

### Budget
- `POST /budget`  
- `GET  /budget?user_id={id}`  
- `DELETE /budget/{id}`  

---

## 🧪 Testing

| Type               | Command                                        |
|--------------------|------------------------------------------------|
| **Unit (Frontend)**| `npm test`                                     |
| **Coverage**       | `npm run test:coverage`                        |
| **Component (Cypress)** | `npx cypress open`                       |
| **Unit (Backend)** | `go test -v`                                   |
| **Coverage (Backend)** | `go test -cover`                          |

---

## 👥 Contributors

- **Anina Pillai** – MS Computer Science, University of Florida (UFID: 92315651)  
- **Ganesh Chowdary Manne** – MS Computer Science, University of Florida (UFID: 37555930)
- **Bhanuteja Kanaparthi** – MS Computer Science, University of Florida (UFID: 76647877)
- **Pavan Prudhvi Madhamsetty** – MS Computer Science, University of Florida (UFID: 71745585)

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.
