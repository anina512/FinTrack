
# Sprint 4 Final Documentation

## Objective

In Sprint 4, our final development cycle, we focused on:

- **Google OAuth Integration** for secure, streamlined user authentication.
- **Enhanced User Profile Management** allowing users to update their Username, Email, and Password directly from their profile page.

These additions have significantly enhanced the user experience, security, and data integrity.

---

## New Functionalities Added

### 1. Google OAuth Authentication

**Description**: Users can now securely log into the FinTrack application using their Google accounts, simplifying authentication.

**Process**:

- OAuth 2.0 integrated with Google.
- Users redirected to Google's authentication page and returned upon successful login.
- Automatically registers new users authenticated via Google.

**Testing Implemented**:

- **Frontend**: Cypress tests ensure proper OAuth login flow.
- **Backend**: Go unit tests (`TestStartGoogleLogin`, `TestHandleGoogleCallback`) validate OAuth token exchange and error handling.
- **API Testing**: Postman verified OAuth endpoints comprehensively.

---

### 2. Enhanced User Profile Page

**Description**: User profile redesigned to allow viewing and updating of Username, Email, and Password.

**Process**:

- Editable forms added for updating user details.
- Secure API endpoints for updating and validating user information.
- Dynamic user detail display based on logged-in user session.

**Testing Implemented**:

- **Frontend (Jest)**: Unit tests (`user.component.spec.ts`) validate frontend logic.
- **Frontend (Cypress)**: Component tests (`user.component.cy.ts`) ensure UI interactivity and responsiveness.
- **Backend (Go)**: Tests (`TestUpdateUsernameEndpoint`, `TestUpdateEmailEndpoint`, `TestUpdatePasswordEndpoint`) verify correct updates and validations.
- **API Testing**: Postman ensures API endpoints correctly handle updates and errors.

---

## Backend API Documentation (Sprint 4)

### OAuth Integration APIs

#### ➜ Start Google OAuth Login
- **Method**: `GET`
- **Endpoint**: `/login/google`
- **Description**: Initiates Google OAuth and redirects the user to Google’s login.

#### ➜ Handle OAuth Callback
- **Method**: `GET`
- **Endpoint**: `/oauth2/callback`
- **Description**: Completes OAuth login, exchanges tokens, retrieves user details, creates new users if necessary, and generates JWT token.

---

### User Profile Management APIs

#### ➜ Update Username
- **Method**: `PUT`
- **Endpoint**: `/users/{id}/username`
- **Request**:
```json
{
  "username": "newusername"
}
```
- **Response**:
```json
{
  "message": "Username updated successfully",
  "user": {
    "id": 1,
    "username": "newusername",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

#### ➜ Update Email
- **Method**: `PUT`
- **Endpoint**: `/users/{id}/email`
- **Request**:
```json
{
  "email": "newemail@example.com"
}
```
- **Response**:
```json
{
  "message": "Email updated successfully",
  "user": {
    "id": 1,
    "username": "username",
    "email": "newemail@example.com",
    "fullName": "User Name"
  }
}
```

#### ➜ Update Password
- **Method**: `PUT`
- **Endpoint**: `/users/{id}/password`
- **Request**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword"
}
```
- **Response**:
```json
{
  "message": "Password updated successfully"
}
```

---

## Backend Test Documentation (Sprint 4)

Comprehensive tests added and validated using `main_test.go`.

### OAuth Integration Tests
- **TestStartGoogleLogin**
  - Validates OAuth login initiation.
  - Checks redirection and OAuth state token correctness.

- **TestHandleGoogleCallback**
  - Ensures OAuth callback correctly handles token exchanges, user info retrieval, and error handling.

### User Profile Update Tests
- **TestUpdateUsernameEndpoint**
  - Confirms correct username updates.
  - Handles username uniqueness conflicts.
  - Validates JSON input and error scenarios.

- **TestUpdateEmailEndpoint**
  - Verifies correct email updates.
  - Checks email uniqueness constraints.
  - Validates JSON input, incorrect user IDs, and database integrity.

- **TestUpdatePasswordEndpoint**
  - Ensures secure password update procedure.
  - Verifies current password matching.
  - Confirms new password hashing and error handling.

### Key Test Coverage Areas
- User registration and login
- OAuth authentication flow and edge cases
- Expense management (create, read, update, delete)
- Income management (create, read, delete)
- Budget management (create, read, delete)
- Comprehensive error handling for invalid input scenarios and database conflicts.

---

## How to Run Backend Tests

Execute the following command to run all tests:

```bash
go test -v -cover ./...
```

- `-v` provides verbose test output.
- `-cover` provides coverage analysis.

---

## Running the API Locally

```bash
go run fintrack.go
```
Ensure PostgreSQL database is properly configured (`.env`) and running.

---

## Sprint 4 Completed Issues Summary

### Frontend
- Implemented Google OAuth login button and handling.
- Enhanced user profile page (update Username, Email, Password).
- Improved validation and error handling in profile interactions.

### Backend
- Integrated secure OAuth authentication endpoints.
- Created secure endpoints for updating user profile details.
- Enhanced backend validations and security checks for profile data updates.

---

## Testing & Quality Assurance Summary
- **Frontend**:
  - Jest unit tests validate form validations and logic.
  - Cypress tests validate UI interactions and OAuth flow.

- **Backend**:
  - Go unit tests ensure secure OAuth integration, user profile updates, and error handling.
  - Postman tests extensively validate API endpoints and data integrity.

---

## Summary of Sprint 4

Sprint 4 represents the culmination of FinTrack's development, significantly enhancing user security through Google OAuth integration and providing robust user profile management. Comprehensive API testing, meticulous backend validations, and rigorous frontend testing guarantee an efficient, secure, and user-friendly financial tracking experience.

---

# Front-end Unit Tests

## AppComponent
- should create the app
- should have the 
- should render title

## LoginComponent
- should create
- should set errorMessage when form invalid
- should navigate on successful login
- should set specific errorMessage on login error
- should fallback to default errorMessage when backend gives none
- should navigate to register
- should redirect to google login

## RegisterComponent
- should create the component and initialize form controls
- goToLogin should navigate to /login
- should return null when passwords match
- should return mismatch error when passwords differ
- should toggle hidePassword
- should toggle hideConfirmPassword
- should set errorMessage if form is invalid
- should set errorMessage if passwords do not match
- should call AuthService.registerUser and navigate on success
- should set errorMessage from server error on failure
- should use fallback errorMessage when server error has no message

## DashboardComponent
- ngOnInit loads data
- getActivityColor returns hex
- updateSavingsChart branches and chart update
- markAsPaid branches
- modals toggle and reload
- fetchWeeklyExpenses updates chart and error path
- fetchIncomeData totals and chart update
- fetchExpenseData totals and chart update
- fetchBudgetData sets budget and updates savings
- updateCombinedActivities through fetchAll
- activities modal open/close
- onExpense/Income/BudgetSaved paths
- ngAfterViewInit creates charts
- invokes remaining public methods at least once

## BudgetComponent
- close() emits closeModal
- ngOnInit calls loadBudget
- loadBudget fills list
- handles loadBudget error
- deleteBudget updates list
- handles delete error
- calculateDates sets correct start and end
- does not add budget when mandatory fields missing
- adds valid budget, emits and closes
- handles addBudget error
- months array contains all 12 months

## ExpenseComponent
- emits closeModal when close() called
- does nothing when mandatory fields missing
- saves valid expense and emits events
- logs error when addExpense fails
- loadExpenses populates list
- handles loadExpenses error
- deletes expense and updates list
- handles delete error
- ngOnInit calls loadExpenses
- has correct categories
- returns Paid
- returns Due for future unpaid
- returns Overdue for past unpaid

## IncomeComponent
- emits closeModal when close() is called
- does nothing when mandatory fields missing
- saves valid income, emits events and closes
- logs error when addIncome fails
- loadIncomes populates list
- handles loadIncomes error
- deletes income and updates list
- handles delete error
- ngOnInit calls loadIncomes
- initializes category list correctly

## UserComponent 
- should create
- ngOnInit fetches user when id exists
- ngOnInit does nothing when id missing
- fetchUserData populates user on success
- fetchUserData logs error on failure
- logout clears storage and redirects
- toggleSettings toggles showSettings and resets forms
- resetForms restores form values
- updateUsername updates user on success
- updateUsername handles empty username
- updateUsername handles service error
- updateUsername fallback error message on unknown error
- updateEmail updates user on success
- updateEmail handles invalid email
- updateEmail handles service error
- updateEmail fallback error message on unknown error
- updatePassword updates password on success
- updatePassword handles password mismatch
- updatePassword handles short password
- updatePassword handles service error
- updatePassword fallback error message on unknown error

## AuthService 
- should be created
- registerUser should POST /register
- login should persist userId and update observable
- getUserId should read from sessionStorage on construction
- observable should emit userId taken from sessionStorage
- logout should clear storage and emit null
- constructor should decode JWT when no session userId
- should handle bad JWT gracefully
- getUserId should return null on server
- logout on server should not touch browser storage
- getUserId should return null when sessionStorage is empty

## TransactionsService
- should be created
- addIncome → POST /incomes
- getIncomes → GET /incomes?user_id
- deleteIncome → DELETE /incomes/:id
- addExpense → POST /expenses
- getExpenses → GET /expenses?user_id
- deleteExpense → DELETE /expenses/:id
- updateExpense → PUT /expenses/:id/paid
- addBudget → POST /budget
- getBudget → GET /budget?user_id
- deleteBudget → DELETE /budget/:id
- getUser → GET /users/:id
- updateUsername → PUT /users/:id/username
- updatePassword → PUT /users/:id/password
- updateEmail → PUT /users/:id/email

## ActivitiesModalComponent
- should create the component
- should emit closeModal event when close is called
- should return correct color for activity type
- should receive combinedActivities input

## HeaderComponent
- should create

## SideNavComponent
- should create
- should navigate to login page on logout


# Cypress Component Tests

## User Component Tests (`user.component.cy.ts`)

- `shows loader when no userId is returned`
- `fetches and displays user data and welcoming message when userId is present`
- `toggles settings section and displays forms`
- `updates username successfully`
- `updates email successfully`
- `updates password successfully`
- `shows error when new passwords do not match`

## Login Component Tests (`login.component.cy.ts`)

- `should render the form controls and buttons`
- `should show form-level error when submitted empty`
- `should show field errors when touched and invalid`
- `should call AuthService.login and navigate on success`
- `should display server error message on login failure`
- `should toggle password visibility when icon clicked`
- `should call loginWithGoogle on Google button click`
- `should navigate to register page when register link clicked`

## Register Component Tests (`register.component.cy.ts`)

- `should render all form fields and buttons`
- `should show form-level error when submitted empty`
- `should show individual field errors when touched and invalid`
- `should toggle password visibility for both password fields`
- `should call registerUser and navigate on successful registration`
- `should display server error when registration fails`
- `should navigate to login when login link clicked`

## Dashboard Component Tests (`dashboard.component.cy.ts`)

- `renders the three stats cards`
- `lists only the unpaid upcoming payments`
- `calls updateExpense when marking a payment paid`
- `opens the expense modal when Add Expense is clicked`
- `opens the income modal when Add Income is clicked`
- `opens the budget modal when Add Budget is clicked`
- `opens the activities modal when View All Transactions is clicked`

## Activities Modal Component Tests (`activities-modal.component.cy.ts`)

- `displays "No activities found" when there are no activities`
- `renders a row for each activity with correct content and styling`
- `emits closeModal when close buttons are clicked`


# Backend Unit Tests

## User Authentication Tests
- `TestRegisterUser_Success`
- `TestRegisterUser_InvalidJSON`
- `TestRegisterUser_DuplicateUsernameOrEmail`
- `TestLoginUser_Success`
- `TestLoginUser_WrongPassword`
- `TestLoginUser_InvalidJSONOrCreds`

## User Retrieval Tests
- `TestGetUser_SuccessAndPasswordCleared`

## User Profile Update Tests
- `TestUpdateUsernameEndpoint`
- `TestUpdateEmailEndpoint`
- `TestUpdatePasswordEndpoint`

## Expense Management Tests
- `TestExpenseEndpoints`

## Income Management Tests
- `TestIncomeEndpoints`

## Budget Management Tests
- `TestBudgetEndpoints`

## OAuth Integration Tests
- `TestStartGoogleLogin_Basic`
- `TestHandleGoogleCallback_TokenExchangeError`
- `TestHandleGoogleCallback_InvalidState`

## Helper Function Tests
- `TestJWTandStateHelpers`
- `TestInitEnvLoads_`


# FinTrack Full Backend API Documentation

## Overview

The FinTrack backend API is built using **Go**, **Gin**, and **PostgreSQL**, providing secure management of personal finance activities like authentication, transaction handling (expenses and income), budget management, and Google OAuth integration.

---

## Base URL
```
http://localhost:8080
```

## API Endpoints

### User Authentication and Management

#### **Google OAuth Login**
- Initiates OAuth login via Google.

**Endpoint:**  
```
GET /login/google
```

#### **OAuth Callback Handler**
- Handles Google's OAuth callback, authenticates the user, creates an account if new, and returns JWT.

**Endpoint:**  
```
GET /oauth2/callback
```

#### **Register New User**
- Creates a new user account.

**Endpoint:**  
```
POST /register
```
**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{ "message": "User registered successfully" }
```

#### **User Login**
- Authenticates existing users.

**Endpoint:**  
```
POST /login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{ 
  "message": "Login successful",
  "userId": 1
}
```

#### **Get User Details**
- Fetches user details by ID (excluding password).

**Endpoint:**  
```
GET /users/:id
```
**Response:**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": ""
}
```

#### **Update Username**
- Updates the user's username.

**Endpoint:**  
```
PUT /users/:id/username
```
**Request:**
```json
{ "username": "newusername" }
```
**Response:**
```json
{
  "message": "Username updated successfully",
  "user": { "id": 1, "username": "newusername", "email": "john@example.com", "fullName": "John Doe" }
}
```

#### **Update Password**
- Changes the user's password.

**Endpoint:**  
```
PUT /users/:id/password
```
**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword"
}
```
**Response:**
```json
{ "message": "Password updated successfully" }
```

#### **Update Email**
- Updates the user's email address.

**Endpoint:**  
```
PUT /users/:id/email
```
**Request:**
```json
{ "email": "newemail@example.com" }
```
**Response:**
```json
{
  "message": "Email updated successfully",
  "user": { "id": 1, "username": "johndoe", "email": "newemail@example.com", "fullName": "John Doe" }
}
```

---

### Expense Management

#### **Add Expense**
- Creates a new expense entry.

**Endpoint:**  
```
POST /expenses
```
**Request:**
```json
{
  "user_id": 1,
  "amount": 100.50,
  "category": "Groceries",
  "description": "Weekly groceries",
  "date": "2025-04-25"
}
```
**Response:** Expense object.

#### **Get Expenses**
- Retrieves expenses for a specified user.

**Endpoint:**  
```
GET /expenses?user_id=1
```

#### **Update Expense Status (Paid/Unpaid)**
- Updates payment status of an expense.

**Endpoint:**  
```
PUT /expenses/:id/paid
```
**Request:**
```json
{ "paid": true }
```
**Response:**
```json
{
  "message": "Expense status updated",
  "expense": { ... }
}
```

#### **Delete Expense**
- Removes an expense by ID.

**Endpoint:**  
```
DELETE /expenses/:id
```
**Response:**
```json
{ "message": "Expense deleted" }
```

---

### Income Management

#### **Add Income**
- Adds a new income entry.

**Endpoint:**  
```
POST /incomes
```
**Request:**
```json
{
  "user_id": 1,
  "amount": 2000,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2025-04-25"
}
```
**Response:** Income object.

#### **Get Incomes**
- Fetches income entries for a user.

**Endpoint:**  
```
GET /incomes?user_id=1
```

#### **Delete Income**
- Deletes an income entry.

**Endpoint:**  
```
DELETE /incomes/:id
```
**Response:**
```json
{ "message": "Income deleted" }
```

---

### Budget Management

#### **Set Budget**
- Creates a new budget entry.

**Endpoint:**  
```
POST /budget
```
**Request:**
```json
{
  "user_id": 1,
  "budget_name": "April Budget",
  "budget_amount": 1500,
  "start_date": "2025-04-01",
  "end_date": "2025-04-30",
  "notes": "Monthly budget"
}
```
**Response:** Budget object.

#### **Get Budgets**
- Retrieves budgets set by the user.

**Endpoint:**  
```
GET /budget?user_id=1
```

#### **Delete Budget**
- Deletes a budget entry.

**Endpoint:**  
```
DELETE /budget/:id
```
**Response:**
```json
{ "message": "Budget deleted" }
```

---

## Data Models

### **User**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "hashedpassword"
}
```

### **Expense**
```json
{
  "id": 1,
  "user_id": 1,
  "amount": 50.00,
  "category": "Food",
  "description": "Lunch",
  "date": "2025-04-20",
  "created_at": "2025-04-20",
  "paid": false
}
```

### **Income**
```json
{
  "id": 1,
  "user_id": 1,
  "amount": 2000.00,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2025-04-01",
  "created_at": "2025-04-01"
}
```

### **Budget**
```json
{
  "id": 1,
  "user_id": 1,
  "budget_name": "April Budget",
  "budget_amount": 1500.00,
  "start_date": "2025-04-01",
  "end_date": "2025-04-30",
  "notes": "Monthly expenses",
  "created_at": "2025-04-01"
}
```

---

## Running the Application
```shell
go run main.go
```

The server will start on port `8080`.

---

## Environment Variables (`.env`)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
```

Make sure PostgreSQL is running and the `.env` file is properly configured before running the server.
