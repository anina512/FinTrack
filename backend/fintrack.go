package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
	"strconv"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB
var oauthConf *oauth2.Config
var jwtKey []byte

// User struct
type User struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	FullName string `json:"fullName" gorm:"not null"`
	Username string `json:"username" gorm:"unique;not null"`
	Email    string `json:"email" gorm:"unique;not null"`
	Password string `json:"password" gorm:"not null"`
}

// Expense struct
type Expense struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	UserID      uint    `json:"user_id"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	CreatedAt   string  `json:"created_at"`
	Paid        bool    `json: "Paid"`
}

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

type Income struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	UserID      uint    `json:"user_id"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	CreatedAt   string  `json:"created_at"`
}

func initEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	oauthConf = &oauth2.Config{
		RedirectURL:  "http://localhost:8080/oauth2/callback",
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	jwtKey = []byte(os.Getenv("JWT_SECRET"))
}

func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=root dbname=fintrack port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	db.AutoMigrate(&User{}, &Expense{}, &Budget{}, &Income{})
}

func main() {
	initEnv()
	initDB()
	router := gin.Default()

	// Enable CORS for all routes
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	router.GET("/login/google", StartGoogleLogin)
	router.GET("/oauth2/callback", HandleGoogleCallback)
	router.POST("/register", RegisterUser)
	router.POST("/login", LoginUser)
	router.POST("/expenses", AddExpense)
	router.GET("/expenses", GetExpenses)
	router.POST("/budget", SetBudget)
	router.GET("/budget", GetBudgetDetails)
	router.DELETE("/budget/:id", DeleteBudget)
	router.DELETE("/expenses/:id", DeleteExpense)
	router.POST("/incomes", AddIncome)
	router.GET("/incomes", GetIncomes)
	router.DELETE("/incomes/:id", DeleteIncome)
	router.PUT("/expenses/:id/paid", UpdateExpenseStatus)
	router.GET("/users/:id", GetUser)
	router.PUT("/users/:id/username", UpdateUsername)
	router.PUT("/users/:id/password", UpdatePassword)
	router.PUT("/users/:id/email", UpdateEmail)

	router.Run(":8080")
}

func StartGoogleLogin(c *gin.Context) {
	state := generateStateToken()
	c.SetCookie("oauthstate", state, 300, "/", "localhost", false, true)
	url := oauthConf.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func HandleGoogleCallback(c *gin.Context) {
	cookieState, _ := c.Cookie("oauthstate")
	if c.Query("state") != cookieState {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state"})
		return
	}

	token, err := oauthConf.Exchange(context.Background(), c.Query("code"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to exchange code"})
		return
	}

	client := oauthConf.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user info"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var userInfo map[string]interface{}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}

	email := userInfo["email"].(string)
	fullName := userInfo["name"].(string)

	var user User
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		user = User{
			FullName: fullName,
			Username: strings.Split(email, "@")[0],
			Email:    email,
			Password: "google-oauth",
		}
		db.Create(&user)
	}

	tokenStr := generateJWT(email, user.ID)
	c.Redirect(http.StatusSeeOther, "http://localhost:4200/dashboard?token="+tokenStr)
}

func generateJWT(email string, userID uint) string {
	claims := jwt.MapClaims{
		"email":  email,
		"userId": userID,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString(jwtKey)
	return signed
}

func generateStateToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

func RegisterUser(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var existingUser User
	// Check if the username already exists
	if err := db.Where("username = ?", user.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Check if the email already exists
	if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password before saving
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	// Save user to DB
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

func LoginUser(c *gin.Context) {
	var input User
	var user User

	// Parse request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Find user by email
	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Login successful, return user ID along with success message
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"userId":  user.ID, // Assuming user.ID is the user ID from the database
	})
}

func GetUser(c *gin.Context) {
	// parse URL param
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
	  return
	}
  
	var user User
	if err := db.First(&user, id).Error; err != nil {
	  c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	  return
	}
  
	user.Password = ""
	c.JSON(http.StatusOK, user)
  }
  
  func UpdateUsername(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
	  return
	}
  
	var input struct{ Username string `json:"username"` }
	if err := c.ShouldBindJSON(&input); err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
	  return
	}
  
	// load the target user
	var user User
	if err := db.First(&user, id).Error; err != nil {
	  c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	  return
	}
  
	// ensure no one else uses this username
	var other User
	if err := db.Where("username = ? AND id <> ?", input.Username, id).
				  First(&other).Error; err == nil {
	  c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
	  return
	}
  
	user.Username = input.Username
	if err := db.Save(&user).Error; err != nil {
	  c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update username"})
	  return
	}
  
	user.Password = ""
	c.JSON(http.StatusOK, gin.H{"message": "Username updated successfully", "user": user})
  }
  
  func UpdatePassword(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
	  return
	}
  
	var input struct {
	  CurrentPassword string `json:"currentPassword"`
	  NewPassword     string `json:"newPassword"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
	  return
	}
  
	var user User
	if err := db.First(&user, id).Error; err != nil {
	  c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	  return
	}
  
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.CurrentPassword)); err != nil {
	  c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
	  return
	}
  
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
	  c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
	  return
	}
  
	user.Password = string(hashed)
	if err := db.Save(&user).Error; err != nil {
	  c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
	  return
	}
  
	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
  }
  
  func UpdateEmail(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
	  return
	}
  
	var input struct{ Email string `json:"email"` }
	if err := c.ShouldBindJSON(&input); err != nil {
	  c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
	  return
	}
  
	var user User
	if err := db.First(&user, id).Error; err != nil {
	  c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	  return
	}
  
	var other User
	if err := db.Where("email = ? AND id <> ?", input.Email, id).
				  First(&other).Error; err == nil {
	  c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
	  return
	}
  
	user.Email = input.Email
	if err := db.Save(&user).Error; err != nil {
	  c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update email"})
	  return
	}
  
	user.Password = ""
	c.JSON(http.StatusOK, gin.H{"message": "Email updated successfully", "user": user})
  }
  

func AddExpense(c *gin.Context) {
	var expense Expense
	if err := c.ShouldBindJSON(&expense); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	db.Create(&expense)
	c.JSON(http.StatusOK, expense)
}

func DeleteExpense(c *gin.Context) {
	expenseID := c.Param("id")
	if err := db.Delete(&Expense{}, expenseID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete expense"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Expense deleted"})
}

func GetExpenses(c *gin.Context) {
	userID := c.Query("user_id") // Get user ID from query parameter
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var expenses []Expense
	result := db.Where("user_id = ?", userID).Find(&expenses)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve expenses"})
		return
	}

	if len(expenses) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No expenses found"})
		return
	}

	c.JSON(http.StatusOK, expenses)
}

func SetBudget(c *gin.Context) {
	var budget Budget
	if err := c.ShouldBindJSON(&budget); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := db.Create(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save budget"})
		return
	}

	c.JSON(http.StatusOK, budget)
}

func GetBudgetDetails(c *gin.Context) {
	userID := c.Query("user_id") // Get user ID from query parameter
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var budgets []Budget
	result := db.Where("user_id = ?", userID).Find(&budgets)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve budgets"})
		return
	}

	if len(budgets) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No budgets found"})
		return
	}

	c.JSON(http.StatusOK, budgets)
}

func AddIncome(c *gin.Context) {
	var income Income
	if err := c.ShouldBindJSON(&income); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := db.Create(&income).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save income"})
		return
	}
	c.JSON(http.StatusOK, income)
}

func GetIncomes(c *gin.Context) {
	userID := c.Query("user_id") // Get user ID from query parameter
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var incomes []Income
	result := db.Where("user_id = ?", userID).Find(&incomes)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve incomes"})
		return
	}

	if len(incomes) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No incomes found"})
		return
	}

	c.JSON(http.StatusOK, incomes)
}

func DeleteIncome(c *gin.Context) {
	incomeID := c.Param("id")
	if err := db.Delete(&Income{}, incomeID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete income"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Income deleted"})
}

func DeleteBudget(c *gin.Context) {
	budgetID := c.Param("id")
	if err := db.Delete(&Budget{}, budgetID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete budget"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Budget deleted"})
}

func UpdateExpenseStatus(c *gin.Context) {
	expenseID := c.Param("id")

	var expense Expense
	if err := db.First(&expense, expenseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	var updateData struct {
		Paid bool `json:"paid"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	expense.Paid = updateData.Paid
	if err := db.Save(&expense).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update expense"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expense status updated", "expense": expense})
}