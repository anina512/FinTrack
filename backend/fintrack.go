package main

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

// User struct
type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	FullName string `json:"fullName"`
	Username string `json:"username" gorm:"unique"`
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"password"`
}

// Expense struct
type Expense struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	UserID   uint    `json:"user_id"`
	Amount   float64 `json:"amount"`
	Category string  `json:"category" gorm:"check:category IN ('bills', 'education', 'food', 'trip', 'transportation', 'gym', 'others')"`
	Note     string  `json:"note"`
	Date     string  `json:"date"` // Keep it as string for JSON serialization
}

// Budget struct
type Budget struct {
	ID            uint    `json:"id" gorm:"primaryKey"`
	UserID        uint    `json:"user_id"`
	BudgetName    string  `json:"budget_name"`
	MonthlyIncome float64 `json:"monthly_income"`
	StartDate     string  `json:"start_date"`
	EndDate       string  `json:"end_date"`
	Details       string  `json:"details"`
}

func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=Pavan@257 dbname=fintrack port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}
	if err := db.AutoMigrate(&User{}, &Expense{}, &Budget{}); err != nil {
		panic("Migration failed: " + err.Error())
	}
}

func main() {
	initDB()
	router := gin.Default()

	// Enable CORS for all routes
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200"}, // Allow frontend domain
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.POST("/register", RegisterUser)
	router.POST("/login", LoginUser)
	router.POST("/expenses", AddExpense)
	router.GET("/expenses", GetExpenses)
	router.POST("/budget", SetBudget)
	router.GET("/budget", GetBudgetDetails)
	router.DELETE("/expenses/:id", DeleteExpense)

	router.Run(":8080")
}

// var users = []User{}

func RegisterUser(c *gin.Context) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if username or email already exists
	var existingUser User
	if err := db.Where("username = ?", input.Username).Or("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username or email already exists"})
		return
	}

	// Hash password before storing
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	users := User{
		FullName: input.FullName,
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword), // Store hashed password
	}

	// Save user in the database
	if err := db.Create(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user in database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful", "user": users})
}

// 	if err := c.ShouldBindJSON(&user); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
// 		return
// 	}

// 	// Check if username already exists
// 	var existingUser User
// 	if err := db.Where("username = ?", user.Username).First(&existingUser).Error; err == nil {
// 		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
// 		return
// 	}

// 	// Hash password
// 	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
// 		return
// 	}
// 	user.Password = string(hashedPassword)

// 	// Save user in DB
// 	if err := db.Create(&user).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
// }

func LoginUser(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user User
	// Check if user exists with the provided email
	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "email": user.Email})
}

func AddExpense(c *gin.Context) {
	var expense Expense
	if err := c.ShouldBindJSON(&expense); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	expense.Date = time.Now().Format("2006-01-02") // Format date correctly
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
	var expenses []Expense
	db.Find(&expenses)
	c.JSON(http.StatusOK, expenses)
}

func SetBudget(c *gin.Context) {
	var budget Budget
	if err := c.ShouldBindJSON(&budget); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	db.Create(&budget)
	c.JSON(http.StatusOK, budget)
}

func GetBudgetDetails(c *gin.Context) {
	var budgets []Budget
	result := db.Find(&budgets) // Instead of LIMIT 1, fetch all

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
