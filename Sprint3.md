# Sprint 3 Documentation

## Objective
In Sprint 3, the focus was on adding advanced features to improve user experience, enhance financial tracking, and implement visual data representation. The sprint also focused on ensuring that all features are specific to the user and that data is dynamically displayed based on the logged-in user’s activity.

## Functionalities Added

### User Page with Current Logged-in User Details
**Description:**
A user page has been introduced that displays the current logged-in user's details, such as their name, email, and other relevant information.

**Process:**
The frontend now fetches user-specific details from the backend and displays them dynamically based on the logged-in session.

**Testing:**
This feature was verified through Cypress tests to ensure that the correct user data is displayed upon login.

### Income Chart Dividing Income Based on Category
**Description:**
A chart has been added to visually display the user's income, categorized by source. Updated categories include salaries, freelance work, investments, etc.

**Process:**
The data for the income chart is fetched from the backend, where it is categorized and then displayed using a charting library.

**Testing:**
The functionality was tested using Jest and Cypress to ensure that the chart reflects the correct income categories and amounts.

### Total Income Calculated and Displayed
**Description:**
The total income for the current month is calculated and displayed on the dashboard.

**Process:**
The total income is dynamically calculated by aggregating all income records for the current month, which is then shown on the user dashboard.

**Testing:**
The calculation logic was verified through unit tests, and the displayed value was checked using Cypress tests.

### Statistics Showing Percentage Difference Between Last Month's Income
**Description:**
A statistic has been added to compare this month's income with the previous month's, showing the percentage difference.

**Process:**
The percentage difference is calculated on the backend, comparing the current month's income with the previous month’s, and then displayed on the frontend.

**Testing:**
The calculation and display were verified through unit and integration tests, ensuring that the percentage difference is calculated correctly.

### Expense Chart Dividing Expenses Based on Category
**Description:**
A similar chart was introduced for expenses, dividing them into updated categories such as rent, utilities, groceries, etc.

**Process:**
Data is fetched from the backend, categorized, and then visualized in a chart.

**Testing:**
This feature was tested with Cypress to ensure the proper categorization and accurate chart rendering.

### Total Expense Calculated and Displayed
**Description:**
The total expense for the current month is dynamically calculated and displayed in the user dashboard.

**Process:**
Total expenses are calculated by summing all expense records for the current month and displayed on the dashboard.

**Testing:**
Testing was done using Jest for backend calculations and Cypress for frontend display accuracy.

### Statistics Showing Percentage Difference Between Last Month's and Current Month’s Income
**Description:**
This feature calculates and displays the percentage difference between last month’s total income and this month’s total income.

**Process:**
The percentage difference is calculated on the backend and rendered on the frontend dynamically.

**Testing:**
Unit tests were implemented to verify the calculation, and Cypress tests ensured the correct display on the dashboard.

### Field Added to Expenses to Mark as Paid
**Description:**
Users can now mark their expenses as "Paid" by adding a field to track this status.

**Process:**
A new field has been added to the expense form, and the status of an expense is updated in the database when the user marks it as "Paid."

**Testing:**
This feature was tested through Cypress to ensure that the expense status is updated in the database and reflected in the UI.

### Overdue, Pending (Due), and Paid Expenses Displayed
**Description:**
Expenses are now categorized into three statuses: Overdue, Pending (Due), and Paid. These statuses are displayed on the user’s dashboard.

**Process:**
The expenses are fetched from the database with a status label and displayed accordingly in the UI.

**Testing:**
This feature was thoroughly tested using Jest and Cypress to ensure that the correct status is displayed for each expense.

### Budget Section Updated Allowing User to Set a Monthly Budget
**Description:**
The budget section has been updated to allow users to set a monthly budget. Users can define a budget for different categories.

**Process:**
The user enters their desired budget through a form, which is then saved to the backend and displayed on the user’s dashboard.

**Testing:**
The form functionality was tested using Jest for frontend validation, and Postman was used to verify backend data saving.

### Chart Displaying Spent, Remaining, and Overspent Amounts
**Description:**
A chart has been added to visually display the total amount spent, remaining budget, and overspent amounts for the current month.

**Process:**
The chart fetches budget data and expense records, calculates the amounts, and then displays them using a charting library.

**Testing:**
The chart’s logic was validated through both Jest and Cypress to ensure accurate calculations and visualization.

### Total Monthly Income and Expense Displayed
**Description:**
The total monthly income and expense values are displayed at the top of the user’s dashboard for quick reference.

**Process:**
These values are dynamically calculated from the user’s income and expense records for the current month.

**Testing:**
The display was tested using Cypress to ensure it accurately reflects the calculated values.

### Bar Chart Depicting Last Week's Expense Trends
**Description:**
A bar chart was introduced to display expense trends for the previous week.

**Process:**
The chart fetches expense data for the last seven days and displays it as a bar chart, showing daily spending trends.

**Testing:**
This feature was tested using Jest and Cypress to ensure that the correct data is displayed.

### Upcoming Payments Section Displaying Payment, Amount, Due Date, and Button to Mark as Paid

**Description:**
The upcoming payments section displays all future payments, including their due dates and amounts. Users can also mark these payments as "Paid."

**Process:**
Upcoming payments are fetched from the database and displayed with a "Mark as Paid" button. Clicking the button updates the payment status.

**Testing:**
Tested using Cypress and Jest. Ensured that payments can be marked as paid and displayed correctly.

### Recent Activities Section Displaying 5 Recent Activities

**Description:**
A recent activities section has been added to the dashboard, displaying the last five activities performed by the user.

**Process:**
The user's recent actions, such as adding or deleting income/expense records, are tracked and displayed.

**Testing:**
Verified with Cypress to ensure correct activities are displayed.

### Button to View Transaction History

**Description:**
A button has been added that opens a modal window displaying the user's entire transaction history.

**Process:**
Clicking the "View Transaction History" button opens a modal window. The modal fetches and displays all past transactions from the backend.

**Testing:**
Verified button functionality and transaction history display using Cypress.

### Everything Made Specific to the User with Logged-in User Saved in Session

**Description:**
All data and features are now tied to the currently logged-in user, with session management ensuring that data is displayed only for the authenticated user.

**Process:**
Backend verifies user sessions. Data is personalized based on the logged-in user.

**Testing:**
Ensured correct behavior for different users based on their session.


## Testing and Quality Assurance
- **Unit Tests:** Jest was used for frontend components and backend logic testing.
- **Cypress Component Tests:** Cypress was used to validate user flows and UI interactions.
- **Postman API Testing:** Postman was used to verify backend API behavior and CRUD operations.

# Backend Documentation for Sprint 3

# Go API Documentation

## Overview
This API is built using Golang and the Gin framework to manage users, expenses, budgets, and incomes. It provides authentication, financial tracking, and budget management functionalities.

## Database Setup
The application uses PostgreSQL as its database. It connects using the following configuration:

```go
dsn := "host=localhost user=postgres password=root dbname=fintrack port=5432 sslmode=disable"
db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
```

## Models

### User
```go
type User struct {
    ID       uint   `json:"id" gorm:"primaryKey"`
    FullName string `json:"fullName" gorm:"not null"`
    Username string `json:"username" gorm:"unique;not null"`
    Email    string `json:"email" gorm:"unique;not null"`
    Password string `json:"password" gorm:"not null"`
}
```
### Expense
```go
type Expense struct {
    ID          uint    `json:"id" gorm:"primaryKey"`
    UserID      uint    `json:"user_id"`
    Amount      float64 `json:"amount"`
    Category    string  `json:"category"`
    Description string  `json:"description"`
    Date        string  `json:"date"`
    CreatedAt   string  `json:"created_at"`
    Paid        bool    `json:"paid"`
}
```
### Budget
```go
type Budget struct {
    ID           uint    `json:"id" gorm:"primaryKey"`
    UserID       uint    `json:"user_id"`
    BudgetName   string  `json:"budget_name"`
    BudgetAmount float64 `json:"budget_amount"`
    StartDate    string  `json:"start_date"`
    EndDate      string  `json:"end_date"`
    Notes        string  `json:"notes"`
    CreatedAt    string  `json:"created_at"`
}
```
### Income
```go
type Income struct {
    ID          uint    `json:"id" gorm:"primaryKey"`
    UserID      uint    `json:"user_id"`
    Amount      float64 `json:"amount"`
    Category    string  `json:"category"`
    Description string  `json:"description"`
    Date        string  `json:"date"`
    CreatedAt   string  `json:"created_at"`
}
```

## API Endpoints

### Authentication

#### Register User
**POST** `/register`
- Request Body:
```json
{
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```
- Response:
```json
{
    "message": "User registered successfully"
}
```

#### Login User
**POST** `/login`
- Request Body:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
- Response:
```json
{
    "message": "Login successful",
    "userId": 1
}
```

### Expense Management

#### Add Expense
**POST** `/expenses`
- Request Body:
```json
{
    "user_id": 1,
    "amount": 200.5,
    "category": "Food",
    "description": "Groceries",
    "date": "2025-04-01"
}
```
- Response:
```json
{
    "id": 1,
    "user_id": 1,
    "amount": 200.5,
    "category": "Food",
    "description": "Groceries",
    "date": "2025-04-01",
    "paid": false
}
```

#### Get Expenses
**GET** `/expenses?user_id=1`
- Response:
```json
[
    {
        "id": 1,
        "user_id": 1,
        "amount": 200.5,
        "category": "Food",
        "description": "Groceries",
        "date": "2025-04-01",
        "paid": false
    }
]
```

#### Delete Expense
**DELETE** `/expenses/{id}`
- Response:
```json
{
    "message": "Expense deleted"
}
```

### Budget Management

#### Set Budget
**POST** `/budget`
- Request Body:
```json
{
    "user_id": 1,
    "budget_name": "April Budget",
    "budget_amount": 2000,
    "start_date": "2025-04-01",
    "end_date": "2025-04-30"
}
```
- Response:
```json
{
    "id": 1,
    "user_id": 1,
    "budget_name": "April Budget",
    "budget_amount": 2000,
    "start_date": "2025-04-01",
    "end_date": "2025-04-30"
}
```

#### Get Budget Details
**GET** `/budget?user_id=1`
- Response:
```json
[
    {
        "id": 1,
        "user_id": 1,
        "budget_name": "April Budget",
        "budget_amount": 2000,
        "start_date": "2025-04-01",
        "end_date": "2025-04-30"
    }
]
```

#### Delete Budget
**DELETE** `/budget/{id}`
- Response:
```json
{
    "message": "Budget deleted"
}
```

### Income Management

#### Add Income
**POST** `/incomes`
- Request Body:
```json
{
    "user_id": 1,
    "amount": 5000,
    "category": "Salary",
    "description": "March Salary",
    "date": "2025-03-31"
}
```
- Response:
```json
{
    "id": 1,
    "user_id": 1,
    "amount": 5000,
    "category": "Salary",
    "description": "March Salary",
    "date": "2025-03-31"
}
```

#### Get Incomes
**GET** `/incomes?user_id=1`
- Response:
```json
[
    {
        "id": 1,
        "user_id": 1,
        "amount": 5000,
        "category": "Salary",
        "description": "March Salary",
        "date": "2025-03-31"
    }
]
```

#### Delete Income
**DELETE** `/incomes/{id}`
- Response:
```json
{
    "message": "Income deleted"
}
```

## Running the API
```sh
go run main.go
```
The API runs on port `8080`. Make sure PostgreSQL is set up and running before starting the server.

# Backend Test Documentation

Below outlines the test cases implemented for the backend of the finance tracker application. The tests ensure that the API functions correctly and handles various scenarios such as user authentication, expense management, income tracking, and budget handling.

## Test Cases

### User Authentication Tests
- `TestRegisterUser`
- `TestLoginUser`
- `TestInvalidLogin`

### Expense Management Tests
- `TestAddExpense`
- `TestGetExpenses`
- `TestDeleteExpense`
- `TestUpdateExpenseStatus`

### Income Management Tests
- `TestAddIncome`
- `TestGetIncomes`
- `TestDeleteIncome`

### Budget Management Tests
- `TestSetBudget`
- `TestGetBudgetDetails`
- `TestDeleteBudget`

### User Retrieval Tests
- `TestGetUser`
- `TestGetNonExistentUser`

## Summary of Changes
Sprint 3 introduced key user-centric features to improve financial tracking, visualization, and user experience. The integration of charts, dynamic user-specific data, and budget management capabilities has enhanced the application's usability. With thorough testing via Jest, Cypress, and Postman, these features were seamlessly integrated, ensuring reliability and user satisfaction.
