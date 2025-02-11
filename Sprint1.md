# FinTrack

FinTrack is a personal finance application that helps users track their income, expenses, and set monthly budgets. This application provides a secure and user-friendly interface for managing personal finances.

## Front-End

### User Stories

#### 1. Setting Up Angular Project
- Install Angular CLI and create a new project:
  - Run `ng new project-name` to initialize the Angular project.
  - Configure `app.module.ts` to include necessary dependencies.
  - Set up a folder structure (e.g., `pages`, `services`, `models`, `components`).
  - Install and configure Angular Material by running `ng add @angular/material`.
  - Implement basic routing using `app-routing.module.ts`.
  - Test the application setup by running `ng serve` and checking the default page.

#### 2. User Registration & Login
**As a user, I want to securely register and log in to the application so that I can access my personal finance data and manage my financial activities.**

- **Login Page**:
  - Design a login form with email and password fields.
  - Display validation errors for incorrect credentials.

- **Registration Page**:
  - Create a registration form with validation for required fields.
  - Display error messages for incorrect or missing inputs.

#### 3. Dashboard Overview
**As a user, I want to see an overview of my finances on the dashboard so that I can quickly assess my financial health.**

- Design the **dashboard UI**.
- Create a UI for the **side navigation panel**.
- Create a UI to display **Account Summary** (income, expenses, savings).
- Create UI for **recent transactions**, **upcoming expenses**, and **weekly expenses**.

#### 4. Add Transactions
**As a user, I want to add income and expense transactions so that I can track my financial activities.**

- Implement fields for **amount**, **category**, and **description**.
- Add validation for missing inputs (e.g., amount, category).
- Allow users to **categorize transactions** (e.g., food, entertainment, etc.).
- Implement UI for **forms** to add transactions.
- Implement models for storing the transactions.

#### 5. Set Monthly Budgets
**As a user, I need the ability to set specific budgets for different categories of expenses each month (e.g., food, rent, entertainment, etc.).**

- Implement fields for **Budget date**, **monthly income**, and **start date**.
- Add validation for missing inputs.
- Categorize budget amounts into different **categories** (e.g., food, rent, entertainment).
- Implement UI for the **budget form**.
- Implement models for storing the **budget data**.


## Back-End

### User Stories


#### 1. User Authentication & Login
**As a user, I want to store my data more privately and securly without any fear of data leaks.**

- **Hash passwords**:
  - Each password is encrypted into hash passwords, which will mask the real passwords and are then storesd ina private database.
  - Each username will be unique so that there will no longer be any clashes for any users.


#### 2. Storing user transactions
**As a user, I want to safely store all of my transactions where I can retrive my data securely.**

- Data is stored in the database by the usernameID, thus displaying the data only to the specific user.
- All the tranwsactions can be viewed, edited and deleted only by the user and solely their own transactions.

#### 3. Data Security and Encryption
**As a user, I want to be assured all sorts of safety of my transactions and personal information.**

- Since all the data is stored in a private database, there is no scope of any data leaks. Since there is an encryption of passwords, that is one of the stepping stones of data protection.



## Completed Issues
- All the above mentioned user stories have been completed

---

## Incomplete Issues
### Front_End
 - Integrating Front-End with Back-End

### Back-End

 - Database password will be protected by an authentication key in near future.
 - More categorization of transactions category will be added.
---

