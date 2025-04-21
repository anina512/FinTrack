// main_test.go
package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB initializes an in-memory SQLite DB and migrates models.
func setupTestDB() {
	var err error
	db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect test db")
	}
	db.AutoMigrate(&User{}, &Expense{}, &Budget{}, &Income{})
}

// setupRouter registers all routes on a Gin engine in TestMode.
func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/register", RegisterUser)
	r.POST("/login", LoginUser)
	r.POST("/expenses", AddExpense)
	r.GET("/expenses", GetExpenses)
	r.DELETE("/expenses/:id", DeleteExpense)
	r.PUT("/expenses/:id/paid", UpdateExpenseStatus)
	r.GET("/users/:id", GetUser)
	r.POST("/incomes", AddIncome)
	r.GET("/incomes", GetIncomes)
	r.DELETE("/incomes/:id", DeleteIncome)
	r.POST("/budget", SetBudget)
	r.GET("/budget", GetBudgetDetails)
	r.DELETE("/budget/:id", DeleteBudget)
	return r
}

// --- Registration tests ---

func TestRegisterUser_Success(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	body := `{"fullName":"Test","username":"user1","email":"u1@example.com","password":"pass"}`
	req := httptest.NewRequest("POST", "/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, "User registered successfully", resp["message"])
}

func TestRegisterUser_InvalidJSON(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	req := httptest.NewRequest("POST", "/register", bytes.NewBufferString(`{bad json}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestRegisterUser_DuplicateUsernameOrEmail(t *testing.T) {
	setupTestDB()
	// seed existing user
	db.Create(&User{FullName: "X", Username: "u1", Email: "u1@example.com", Password: "p"})
	r := setupRouter()

	// duplicate username
	body1 := `{"fullName":"Y","username":"u1","email":"u2@example.com","password":"pass"}`
	req1 := httptest.NewRequest("POST", "/register", bytes.NewBufferString(body1))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusConflict, w1.Code)

	// duplicate email
	body2 := `{"fullName":"Y","username":"u2","email":"u1@example.com","password":"pass"}`
	req2 := httptest.NewRequest("POST", "/register", bytes.NewBufferString(body2))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusConflict, w2.Code)
}

// --- Login tests ---

func TestLoginUser_Success(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	pw, _ := bcrypt.GenerateFromPassword([]byte("pass"), bcrypt.DefaultCost)
	db.Create(&User{FullName: "T", Username: "u", Email: "e@ex.com", Password: string(pw)})

	body := `{"email":"e@ex.com","password":"pass"}`
	req := httptest.NewRequest("POST", "/login", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, "Login successful", resp["message"])
	assert.EqualValues(t, 1, resp["userId"])
}

func TestLoginUser_WrongPassword(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	hashed, _ := bcrypt.GenerateFromPassword([]byte("right"), bcrypt.DefaultCost)
	db.Create(&User{FullName: "T", Username: "u", Email: "e@ex.com", Password: string(hashed)})

	body := `{"email":"e@ex.com","password":"wrong"}`
	req := httptest.NewRequest("POST", "/login", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestLoginUser_InvalidJSONOrCreds(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// malformed JSON
	req1 := httptest.NewRequest("POST", "/login", bytes.NewBufferString(`{bad`))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusBadRequest, w1.Code)

	// nonexistent user
	req2 := httptest.NewRequest("POST", "/login", bytes.NewBufferString(`{"email":"x","password":"y"}`))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusUnauthorized, w2.Code)
}

// --- GetUser tests ---

func TestGetUser_SuccessAndPasswordCleared(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	hashed, _ := bcrypt.GenerateFromPassword([]byte("pass"), bcrypt.DefaultCost)
	db.Create(&User{FullName: "A", Username: "a", Email: "a@a.com", Password: string(hashed)})

	// found
	req1 := httptest.NewRequest("GET", "/users/1", nil)
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	var u User
	assert.NoError(t, json.Unmarshal(w1.Body.Bytes(), &u))
	assert.Empty(t, u.Password)

	// not found
	req2 := httptest.NewRequest("GET", "/users/999", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusNotFound, w2.Code)
}

// --- Expense endpoints ---

func TestExpenseEndpoints(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// invalid JSON
	req0 := httptest.NewRequest("POST", "/expenses", bytes.NewBufferString(`{bad}`))
	req0.Header.Set("Content-Type", "application/json")
	w0 := httptest.NewRecorder()
	r.ServeHTTP(w0, req0)
	assert.Equal(t, http.StatusBadRequest, w0.Code)

	// create
	req1 := httptest.NewRequest("POST", "/expenses", bytes.NewBufferString(
		`{"user_id":1,"amount":10,"category":"c","description":"d","date":"2025-04-20"}`,
	))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// get missing
	req2 := httptest.NewRequest("GET", "/expenses", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusBadRequest, w2.Code)

	// get none
	req3 := httptest.NewRequest("GET", "/expenses?user_id=2", nil)
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	assert.Equal(t, http.StatusNotFound, w3.Code)

	// insert & get
	db.Create(&Expense{UserID: 2, Amount: 5, Category: "x", Description: "y", Date: "2025-04-20"})
	req4 := httptest.NewRequest("GET", "/expenses?user_id=2", nil)
	w4 := httptest.NewRecorder()
	r.ServeHTTP(w4, req4)
	assert.Equal(t, http.StatusOK, w4.Code)

	// update missing
	req5 := httptest.NewRequest("PUT", "/expenses/999/paid", bytes.NewBufferString(`{"paid":true}`))
	req5.Header.Set("Content-Type", "application/json")
	w5 := httptest.NewRecorder()
	r.ServeHTTP(w5, req5)
	assert.Equal(t, http.StatusNotFound, w5.Code)

	// update invalid JSON
	req6 := httptest.NewRequest("PUT", "/expenses/1/paid", bytes.NewBufferString(`{bad}`))
	req6.Header.Set("Content-Type", "application/json")
	w6 := httptest.NewRecorder()
	r.ServeHTTP(w6, req6)
	assert.Equal(t, http.StatusBadRequest, w6.Code)

	// update success
	req7 := httptest.NewRequest("PUT", "/expenses/1/paid", bytes.NewBufferString(`{"paid":true}`))
	req7.Header.Set("Content-Type", "application/json")
	w7 := httptest.NewRecorder()
	r.ServeHTTP(w7, req7)
	assert.Equal(t, http.StatusOK, w7.Code)

	// delete existing
	reqDel1 := httptest.NewRequest("DELETE", "/expenses/1", nil)
	wDel1 := httptest.NewRecorder()
	r.ServeHTTP(wDel1, reqDel1)
	assert.Equal(t, http.StatusOK, wDel1.Code)

	// delete missing
	reqDel2 := httptest.NewRequest("DELETE", "/expenses/999", nil)
	wDel2 := httptest.NewRecorder()
	r.ServeHTTP(wDel2, reqDel2)
	assert.Equal(t, http.StatusOK, wDel2.Code)
}

// --- Income endpoints ---

func TestIncomeEndpoints(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// invalid JSON
	req0 := httptest.NewRequest("POST", "/incomes", bytes.NewBufferString(`{bad}`))
	req0.Header.Set("Content-Type", "application/json")
	w0 := httptest.NewRecorder()
	r.ServeHTTP(w0, req0)
	assert.Equal(t, http.StatusBadRequest, w0.Code)

	// create
	req1 := httptest.NewRequest("POST", "/incomes", bytes.NewBufferString(
		`{"user_id":1,"amount":100,"category":"sal","description":"d","date":"2025-04-20"}`,
	))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// get missing
	req2 := httptest.NewRequest("GET", "/incomes", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusBadRequest, w2.Code)

	// get none
	req3 := httptest.NewRequest("GET", "/incomes?user_id=2", nil)
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	assert.Equal(t, http.StatusNotFound, w3.Code)

	// insert & get
	db.Create(&Income{UserID: 2, Amount: 50, Category: "x", Description: "y", Date: "2025-04-20"})
	req4 := httptest.NewRequest("GET", "/incomes?user_id=2", nil)
	w4 := httptest.NewRecorder()
	r.ServeHTTP(w4, req4)
	assert.Equal(t, http.StatusOK, w4.Code)

	// delete existing
	reqDel1 := httptest.NewRequest("DELETE", "/incomes/1", nil)
	wDel1 := httptest.NewRecorder()
	r.ServeHTTP(wDel1, reqDel1)
	assert.Equal(t, http.StatusOK, wDel1.Code)

	// delete missing
	reqDel2 := httptest.NewRequest("DELETE", "/incomes/999", nil)
	wDel2 := httptest.NewRecorder()
	r.ServeHTTP(wDel2, reqDel2)
	assert.Equal(t, http.StatusOK, wDel2.Code)
}

// --- Budget endpoints ---

func TestBudgetEndpoints(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// invalid JSON
	req0 := httptest.NewRequest("POST", "/budget", bytes.NewBufferString(`{bad}`))
	req0.Header.Set("Content-Type", "application/json")
	w0 := httptest.NewRecorder()
	r.ServeHTTP(w0, req0)
	assert.Equal(t, http.StatusBadRequest, w0.Code)

	// create
	req1 := httptest.NewRequest("POST", "/budget", bytes.NewBufferString(
		`{"user_id":1,"budget_name":"b","budget_amount":100,"start_date":"2025-04-01","end_date":"2025-04-30"}`,
	))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// get missing
	req2 := httptest.NewRequest("GET", "/budget", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusBadRequest, w2.Code)

	// get none
	req3 := httptest.NewRequest("GET", "/budget?user_id=2", nil)
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	assert.Equal(t, http.StatusNotFound, w3.Code)

	// insert & get
	db.Create(&Budget{UserID: 2, BudgetName: "b", BudgetAmount: 50, StartDate: "2025-04-01", EndDate: "2025-04-30"})
	req4 := httptest.NewRequest("GET", "/budget?user_id=2", nil)
	w4 := httptest.NewRecorder()
	r.ServeHTTP(w4, req4)
	assert.Equal(t, http.StatusOK, w4.Code)

	// delete existing
	reqDel1 := httptest.NewRequest("DELETE", "/budget/1", nil)
	wDel1 := httptest.NewRecorder()
	r.ServeHTTP(wDel1, reqDel1)
	assert.Equal(t, http.StatusOK, wDel1.Code)

	// delete missing
	reqDel2 := httptest.NewRequest("DELETE", "/budget/999", nil)
	wDel2 := httptest.NewRecorder()
	r.ServeHTTP(wDel2, reqDel2)
	assert.Equal(t, http.StatusOK, wDel2.Code)
}

// --- Helpers & OAuth ---

func TestJWTandStateHelpers(t *testing.T) {
	// state
	s1 := generateStateToken()
	s2 := generateStateToken()
	assert.NotEmpty(t, s1)
	assert.NotEqual(t, s1, s2)
	_, err := base64.URLEncoding.DecodeString(s1)
	assert.NoError(t, err)

	// JWT
	jwtKey = []byte("secret")
	tkn := generateJWT("e@e.com", 42)
	parsed, err := jwt.Parse(tkn, func(tkn *jwt.Token) (interface{}, error) { return jwtKey, nil })
	assert.NoError(t, err)
	claims := parsed.Claims.(jwt.MapClaims)
	assert.Equal(t, "e@e.com", claims["email"])
	assert.EqualValues(t, 42, claims["userId"])
	exp := int64(claims["exp"].(float64))
	assert.True(t, exp > time.Now().Unix())
}

func TestStartGoogleLogin_Basic(t *testing.T) {
	oauthConf = &oauth2.Config{
		RedirectURL:  "http://localhost/cb",
		ClientID:     "cid",
		ClientSecret: "cs",
		Endpoint:     oauth2.Endpoint{AuthURL: "https://example.com/auth"},
	}
	r := gin.Default()
	r.GET("/login/google", StartGoogleLogin)

	req := httptest.NewRequest("GET", "/login/google", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusTemporaryRedirect, w.Code)
	cookies := w.Result().Cookies()
	assert.Len(t, cookies, 1)
	state := cookies[0].Value
	assert.NotEmpty(t, state)
	loc := w.Result().Header.Get("Location")
	assert.Contains(t, loc, "state="+state)
}

func TestHandleGoogleCallback_TokenExchangeError(t *testing.T) {
	oauthConf = &oauth2.Config{Endpoint: oauth2.Endpoint{TokenURL: ""}}
	r := gin.Default()
	r.GET("/oauth2/callback", HandleGoogleCallback)

	req := httptest.NewRequest("GET", "/oauth2/callback?state=x&code=y", nil)
	req.AddCookie(&http.Cookie{Name: "oauthstate", Value: "x"})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandleGoogleCallback_InvalidState(t *testing.T) {
	oauthConf = &oauth2.Config{}
	r := gin.Default()
	r.GET("/oauth2/callback", HandleGoogleCallback)

	req := httptest.NewRequest("GET", "/oauth2/callback?state=WRONG", nil)
	req.AddCookie(&http.Cookie{Name: "oauthstate", Value: "GOOD"})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestInitEnvLoads_(t *testing.T) {
	// write .env
	content := []byte("GOOGLE_CLIENT_ID=AAA\nGOOGLE_CLIENT_SECRET=BBB\nJWT_SECRET=ZZZ")
	ioutil.WriteFile(".env", content, 0644)
	defer os.Remove(".env")

	initEnv()
	assert.Equal(t, "AAA", oauthConf.ClientID)
	assert.Equal(t, "BBB", oauthConf.ClientSecret)
	assert.Equal(t, "ZZZ", string(jwtKey))
}
