**Sprint 2**

In Sprint 2, we successfully integrated the frontend with the backend, ensuring seamless data flow between the two. All data added via the frontend is now properly stored in the database and reflected across the relevant tables. The frontend has been connected to the backend, and data fetching from the database works as expected. Unit tests have been added using Jest for all frontend components, while backend unit tests ensure the robustness of the server-side logic. Cypress component tests were implemented for all pages, and Postman was used to thoroughly test the APIs. The previously mocked data for Income, Expense, and Budget is now being saved to the backend and database via UI forms, and new functionalities were added for viewing and deleting Income, Expense, and Budget items, with these operations fully integrated into the backend.

Frontend work:

**Sprint 2 - Completed Work**

1. **Functionality**

In this sprint, we focused on enhancing the expense management capabilities of the application. The following features were added:

### **a. Add Expense**

- **Description**: The functionality allows users to add new expense records through the frontend UI form, which are then saved to the backend and database.
- **Process**:
  - Users fill in the necessary details for an expense, such as amount, category, and description, via the UI form.
  - Once the form is submitted, the data is sent to the backend where it is processed and stored in the database.
- **Testing**: This functionality has been tested using Jest for the frontend component and Postman for the backend API to ensure the data is properly saved.

### **b. View Expense**

- **Description**: Users can view the list of all recorded expenses.
- **Process**:
  - The frontend sends a request to the backend to fetch all stored expenses.
  - The backend retrieves the data from the database and sends it back to the frontend, where it is displayed in a readable table format.
- **Testing**: This feature was verified using Cypress to ensure the correct display of data on the frontend and the appropriate fetching of data from the backend.

### **c. Delete Expense**

- **Description**: This functionality allows users to delete an existing expense record from the system.
- **Process**:
  - A user selects the expense they wish to delete, and upon confirmation, the frontend sends a request to the backend to remove the expense from the database.
  - The backend deletes the record from the database and returns a success response to the frontend.
- **Testing**: The delete functionality was tested through both Jest for frontend interaction and Postman for backend API calls to ensure the expense is removed from both the UI and the database.

### **d. Add Income**

- **Description**: Users can add new income entries through the frontend, and this data is then saved to the backend and the database.
- **Process**:
  - Users provide the necessary details such as amount, source, and description for their income.
  - Upon submission, the form data is sent to the backend, processed, and stored in the database.
- **Testing**: The functionality was tested using Jest for the frontend and Postman for the backend to ensure that the income is correctly saved.

### **e. View Income**

- **Description**: Users can view all their income entries stored in the system.
- **Process**:
  - A request is made from the frontend to fetch the income data stored in the database.
  - The backend retrieves the data and returns it, which is then displayed in a user-friendly table format on the frontend.
- **Testing**: Cypress was used for frontend testing to ensure that income data is displayed correctly, and Postman was used to verify data fetching from the backend.

### **f. Delete Income**

- **Description**: This functionality allows users to delete an income record from the system.
- **Process**:
  - The user selects the income record they wish to delete. After confirming the action, the frontend sends a request to the backend to delete the record from the database.
  - The backend removes the record and returns a success message to the frontend.
- **Testing**: Jest and Postman were used to ensure that the delete operation is functioning as expected on both the frontend and backend.

### **g. Add Budget**

- **Description**: Users can add budget entries, which are saved to the backend and the database.
- **Process**:
  - Users enter details like category, amount, and time period for their budget.
  - The form data is then sent to the backend, where it is processed and stored in the database.
- **Testing**: Jest tests were added for the frontend components, and Postman was used to verify that the budget is saved correctly on the backend.

### **h. View Budget**

- **Description**: Users can view the list of all budget records they have set.
- **Process**:
  - The frontend sends a request to fetch all the stored budgets.
  - The backend retrieves the data and returns it to the frontend, which displays it accordingly.
- **Testing**: Cypress was used to test the frontend view of budgets, ensuring they are fetched and displayed correctly, while Postman verified the backend API for data fetching.

### **i. Delete Budget**

- **Description**: Users can delete a budget entry if no longer needed.
- **Process**:
  - A user selects the budget they wish to delete. Once confirmed, the frontend sends a request to the backend to delete the budget from the database.
  - The backend processes the request and removes the budget record, sending a success response to the frontend.
- **Testing**: This functionality was tested using both Jest for the frontend and Postman for the backend API to ensure proper deletion of the budget.

### **2\. Data Flow Integration**

- **Description**: All new functionalities are integrated with the backend, meaning that data entered through the frontend is saved, retrieved, and manipulated via the backend and database. All components related to expenses, income, and budget have been connected to a real database instead of relying on mock data.
- **Process**:
  - All forms (for adding, viewing, and deleting expenses, income, and budgets) are directly connected to backend APIs.
  - Data added through the frontend is saved to the database, and any retrieval or deletion operations are reflected on both the UI and the database.
- **Testing**: The integration was tested thoroughly with Cypress for the frontend and Postman for the backend to ensure that data flows seamlessly between the frontend, backend, and database.

**3. Frontend Unit Tests**

Unit tests were created for various frontend components to ensure that the application is working as expected. These tests validate individual units of functionality and make sure that the components behave correctly under different conditions.

**The following component unit tests were added:**

- **login.component.spec.ts** – Tests related to the login component, verifying user authentication.
- **register.component.spec.ts** – Tests for the registration process, ensuring proper data validation and submission.
- **dashboard.component.spec.ts** – Tests for the dashboard component, checking if user data is rendered correctly.
- **budget.component.spec.ts** – Validates budget-related functionality like fetching and displaying budget data.
- **expense.component.spec.ts** – Ensures that expenses are properly added, deleted, and displayed.
- **income.component.spec.ts** – Verifies the correct handling and display of income data.
- **transaction.services.spec.ts** – Tests the transaction service logic, ensuring correct interaction between frontend and backend.
- **auth.service.spec.ts** – Verifies authentication-related services and their methods.
- **header.component.spec.ts** – Tests for the header component and its functionality.
- **side-nav.component.spec.ts** – Ensures the side navigation menu works properly.
- **app.component.spec.ts** – General tests for the root component of the application.

**4. Cypress Component Tests**

Cypress tests were added to perform end-to-end validation of critical components. These tests are designed to simulate real user interactions and ensure that everything works from the user’s perspective.

**The following Cypress component tests were added:**

- **login.component.cy.ts** – Tests to verify that the login process works as expected by simulating user input and validating responses.
- **register.component.cy.ts** – Ensures that the registration process functions smoothly, including form submission and validation.
- **dashboard.component.cy.ts** – Verifies that the dashboard displays the correct user data, such as expenses, income, and budget, and updates as expected.

**5. Summary of Changes**

In Sprint 2, several key functionalities were added and integrated, including the ability to add, view, and delete Expense, Income, and Budget records. Data entered through the frontend is now saved to the backend and database, replacing the previously used mock data. Unit tests were implemented for both frontend components using Jest and backend logic. Cypress was used for component testing on the frontend, and Postman was employed for thorough API testing on the backend. All operations, including adding, viewing, and deleting records, were fully integrated with the backend to ensure seamless data flow and functionality across the system.

**Detailed Documentation of Backend APIs**

1. REGISTER USER

This API, we will start with the new user registration, wherein the user has to give their full name, email, username and password, and they have to rewrite the password. Since we have tested all the backend APIs in postman, there is a snippet below which shows how do we run the APIs.

All the data is given in a JSON format and the example is shown below.

**JSON format:** {

&nbsp;   "fullname" : "enter your full name",

&nbsp;   "username" : "enter your username",

&nbsp;   "email" : "enter email address",

&nbsp;   "password" : "enter a secure password"

}
2.	LOGIN USER
After the user is registered successfully, user can login with their email and password. Now, we will use the GET request for the login details, here is the JSON format on how to get the login details.

**JSON Format:** {
  &nbsp;   		"email" : "usertest@gmail.com",
  &nbsp;   		"password" : "securepassword"

}


3. EXPENSES (ADD, GET AND DELETE)

For adding expenses, when there is a new data added from the frontend, then the newly added data will be stored in the database, which is uniquely stored according to the user who implemented the data. Same goes for viewing and deleting the expenses, which are assigned to the users who created the data. This ensures privacy for each user as their expenses cannot be viewed by anyone.

4. BUDGET (ADD AND SET)

Users can add, edit their budgets in the website itself, which is stored in the database under budget table, which also can solely be edited by the user who designed it. Adding this feature will help the user track if they are well spending under their budget or over-spending their budget.
