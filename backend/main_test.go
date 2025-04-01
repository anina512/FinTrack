package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Setup a test database
func setupTestDB() {
	var err error
	db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}
	db.AutoMigrate(&User{}, &Expense{}, &Budget{}, &Income{})
}

// Create a test router
func setupRouter() *gin.Engine {
	router := gin.Default()
	router.POST("/register", RegisterUser)
	router.POST("/login", LoginUser)
	router.POST("/expenses", AddExpense)
	router.GET("/expenses", GetExpenses)
	router.DELETE("/expenses/:id", DeleteExpense)
	router.PUT("/expenses/:id/paid", UpdateExpenseStatus)
	router.GET("/users/:id", GetUser)
	// Income routes
	router.POST("/income", AddIncome)
	router.GET("/income", GetIncomes)
	router.DELETE("/income/:id", DeleteIncome)
	// Budget routes
	router.POST("/budget", SetBudget)
	router.GET("/budget", GetBudgetDetails)
	router.DELETE("/budget/:id", DeleteBudget)
	return router
}

func TestRegisterUser(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	userData := `{"fullName": "Test User", "username": "testuser", "email": "test@example.com", "password": "password123"}`
	req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer([]byte(userData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// func TestDuplicateUserRegistration(t *testing.T) {
// 	setupTestDB()
// 	router := setupRouter()

// 	userData := `{"fullName": "Test User", "username": "testuser", "email": "test@example.com", "password": "password123"}`
// 	req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer([]byte(userData)))
// 	req.Header.Set("Content-Type", "application/json")

// 	// First registration should pass
// 	w := httptest.NewRecorder()
// 	router.ServeHTTP(w, req)
// 	assert.Equal(t, http.StatusOK, w.Code)

// 	// Second registration should fail
// 	w = httptest.NewRecorder()
// 	router.ServeHTTP(w, req)
// 	assert.Equal(t, http.StatusConflict, w.Code)
// }

func TestLoginUser(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Create a user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	db.Create(&User{FullName: "Test User", Username: "testuser", Email: "test@example.com", Password: string(hashedPassword)})

	loginData := `{"email": "test@example.com", "password": "password123"}`
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer([]byte(loginData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestInvalidLogin(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	loginData := `{"email": "wrong@example.com", "password": "wrongpassword"}`
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer([]byte(loginData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAddExpense(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	expenseData := `{"user_id": 1, "amount": 100.5, "category": "Food", "description": "Lunch", "date": "2025-03-31"}`
	req, _ := http.NewRequest("POST", "/expenses", bytes.NewBuffer([]byte(expenseData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetExpenses(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert an expense
	db.Create(&Expense{UserID: 1, Amount: 50.0, Category: "Transport", Description: "Bus fare", Date: "2025-03-31"})

	req, _ := http.NewRequest("GET", "/expenses?user_id=1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestDeleteExpense(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert an expense
	expense := Expense{UserID: 1, Amount: 50.0, Category: "Transport", Description: "Bus fare", Date: "2025-03-31"}
	db.Create(&expense)

	req, _ := http.NewRequest("DELETE", "/expenses/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestUpdateExpenseStatus(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert an expense
	expense := Expense{UserID: 1, Amount: 100.0, Category: "Rent", Description: "Monthly Rent", Date: "2025-03-31", Paid: false}
	db.Create(&expense)

	updateData := `{"paid": true}`
	req, _ := http.NewRequest("PUT", "/expenses/1/paid", bytes.NewBuffer([]byte(updateData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Check if the expense was updated
	var updatedExpense Expense
	db.First(&updatedExpense, 1)
	assert.Equal(t, true, updatedExpense.Paid)
}

// ---------------- INCOME TESTS ----------------

// Test Adding Income
func TestAddIncome(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	incomeData := `{"user_id": 1, "amount": 5000, "source": "Salary", "date": "2025-03-31"}`
	req, _ := http.NewRequest("POST", "/income", bytes.NewBuffer([]byte(incomeData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

// Test Getting Incomes
func TestGetIncomes(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert an income entry
	db.Create(&Income{UserID: 1, Amount: 5000, Category: "Salary", Date: "2025-03-31"})

	req, _ := http.NewRequest("GET", "/income?user_id=1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

// Test Deleting Income
func TestDeleteIncome(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert an income entry
	income := Income{UserID: 1, Amount: 5000, Category: "Salary", Date: "2025-03-31"}
	db.Create(&income)

	req, _ := http.NewRequest("DELETE", "/income/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

// ---------------- BUDGET TESTS ----------------

// Test Setting Budget
func TestSetBudget(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	budgetData := `{"user_id": 1, "amount": 2000, "category": "Food", "date": "2025-03-31"}`
	req, _ := http.NewRequest("POST", "/budget", bytes.NewBuffer([]byte(budgetData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

// Test Getting Budget Details
func TestGetBudgetDetails(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert a budget entry
	db.Create(&Budget{UserID: 1, BudgetName: "test", BudgetAmount: 2000, StartDate: "2025-03-31", EndDate: "2025-04-31"})

	req, _ := http.NewRequest("GET", "/budget?user_id=1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

// Test Deleting Budget
func TestDeleteBudget(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert a budget entry
	budget := Budget{UserID: 1, BudgetName: "test", BudgetAmount: 2000, StartDate: "2025-03-31", EndDate: "2025-04-31"}
	db.Create(&budget)

	req, _ := http.NewRequest("DELETE", "/budget/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetUser(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// Insert a user
	user := User{FullName: "John Doe", Username: "johndoe", Email: "johndoe@example.com", Password: "hashedpassword"}
	db.Create(&user)

	req, _ := http.NewRequest("GET", "/users/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetNonExistentUser(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	req, _ := http.NewRequest("GET", "/users/999", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}
