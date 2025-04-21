// main_test.go
package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
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

func setupTestDB() {
	var err error
	db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}
	db.AutoMigrate(&User{}, &Expense{}, &Budget{}, &Income{})
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/register", RegisterUser)
	router.POST("/login", LoginUser)
	router.POST("/expenses", AddExpense)
	router.GET("/expenses", GetExpenses)
	router.DELETE("/expenses/:id", DeleteExpense)
	router.PUT("/expenses/:id/paid", UpdateExpenseStatus)
	router.GET("/users/:id", GetUser)
	router.POST("/incomes", AddIncome)
	router.GET("/incomes", GetIncomes)
	router.DELETE("/incomes/:id", DeleteIncome)
	router.POST("/budget", SetBudget)
	router.GET("/budget", GetBudgetDetails)
	router.DELETE("/budget/:id", DeleteBudget)
	return router
}

func TestRegisterUser_Success(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	body := `{"fullName":"Test","username":"user1","email":"u1@example.com","password":"pass"}`
	req := httptest.NewRequest("POST", "/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "User registered successfully", resp["message"])
}

func TestRegisterUser_InvalidJSON(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	req := httptest.NewRequest("POST", "/register", bytes.NewBufferString(`{bad json}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestRegisterUser_DuplicateUsernameOrEmail(t *testing.T) {
	setupTestDB()
	db.Create(&User{FullName: "X", Username: "u1", Email: "u1@example.com", Password: "p"})
	router := setupRouter()

	// duplicate username
	body1 := `{"fullName":"Y","username":"u1","email":"u2@example.com","password":"pass"}`
	req1 := httptest.NewRequest("POST", "/register", bytes.NewBufferString(body1))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusConflict, w1.Code)

	// duplicate email
	body2 := `{"fullName":"Y","username":"u2","email":"u1@example.com","password":"pass"}`
	req2 := httptest.NewRequest("POST", "/register", bytes.NewBufferString(body2))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusConflict, w2.Code)
}

func TestLoginUser_Success(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	pw, _ := bcrypt.GenerateFromPassword([]byte("pass"), bcrypt.DefaultCost)
	db.Create(&User{FullName: "T", Username: "u", Email: "e@ex.com", Password: string(pw)})

	body := `{"email":"e@ex.com","password":"pass"}`
	req := httptest.NewRequest("POST", "/login", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Login successful", resp["message"])
	assert.EqualValues(t, 1, resp["userId"])
}

func TestLoginUser_InvalidJSONOrCreds(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// invalid JSON
	req1 := httptest.NewRequest("POST", "/login", bytes.NewBufferString(`{bad`))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusBadRequest, w1.Code)

	// no such user
	body := `{"email":"x","password":"y"}`
	req2 := httptest.NewRequest("POST", "/login", bytes.NewBufferString(body))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusUnauthorized, w2.Code)
}

func TestGetUser_SuccessAndNotFound(t *testing.T) {
	setupTestDB()
	router := setupRouter()
	db.Create(&User{FullName: "A", Username: "a", Email: "a@a.com", Password: "p"})

	// success
	req1 := httptest.NewRequest("GET", "/users/1", nil)
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// not found
	req2 := httptest.NewRequest("GET", "/users/999", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusNotFound, w2.Code)
}

func TestExpenseEndpoints(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// 1) invalid JSON on add
	req0 := httptest.NewRequest("POST", "/expenses", bytes.NewBufferString(`{bad}`))
	req0.Header.Set("Content-Type", "application/json")
	w0 := httptest.NewRecorder()
	router.ServeHTTP(w0, req0)
	assert.Equal(t, http.StatusBadRequest, w0.Code)

	// 2) add valid => record ID 1
	body := `{"user_id":1,"amount":10,"category":"c","description":"d","date":"2025-04-20"}`
	req1 := httptest.NewRequest("POST", "/expenses", bytes.NewBufferString(body))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// 3) missing user_id on get
	req2 := httptest.NewRequest("GET", "/expenses", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusBadRequest, w2.Code)

	// 4) no records for user_id=2
	req3 := httptest.NewRequest("GET", "/expenses?user_id=2", nil)
	w3 := httptest.NewRecorder()
	router.ServeHTTP(w3, req3)
	assert.Equal(t, http.StatusNotFound, w3.Code)

	// 5) insert record for user_id=2, then get
	db.Create(&Expense{UserID: 2, Amount: 5, Category: "x", Description: "y", Date: "2025-04-20"})
	req4 := httptest.NewRequest("GET", "/expenses?user_id=2", nil)
	w4 := httptest.NewRecorder()
	router.ServeHTTP(w4, req4)
	assert.Equal(t, http.StatusOK, w4.Code)

	// 6) update not found
	req5 := httptest.NewRequest("PUT", "/expenses/999/paid", bytes.NewBufferString(`{"paid":true}`))
	req5.Header.Set("Content-Type", "application/json")
	w5 := httptest.NewRecorder()
	router.ServeHTTP(w5, req5)
	assert.Equal(t, http.StatusNotFound, w5.Code)

	// 7) update invalid JSON on ID=1
	req6 := httptest.NewRequest("PUT", "/expenses/1/paid", bytes.NewBufferString(`{bad}`))
	req6.Header.Set("Content-Type", "application/json")
	w6 := httptest.NewRecorder()
	router.ServeHTTP(w6, req6)
	assert.Equal(t, http.StatusBadRequest, w6.Code)

	// 8) update success on ID=1
	req7 := httptest.NewRequest("PUT", "/expenses/1/paid", bytes.NewBufferString(`{"paid":true}`))
	req7.Header.Set("Content-Type", "application/json")
	w7 := httptest.NewRecorder()
	router.ServeHTTP(w7, req7)
	assert.Equal(t, http.StatusOK, w7.Code)

	// 9) delete existing ID=1
	reqDel := httptest.NewRequest("DELETE", "/expenses/1", nil)
	wDel := httptest.NewRecorder()
	router.ServeHTTP(wDel, reqDel)
	assert.Equal(t, http.StatusOK, wDel.Code)

	// 10) delete missing ID=999
	reqDel2 := httptest.NewRequest("DELETE", "/expenses/999", nil)
	wDel2 := httptest.NewRecorder()
	router.ServeHTTP(wDel2, reqDel2)
	assert.Equal(t, http.StatusOK, wDel2.Code)
}

func TestIncomeEndpoints(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// invalid JSON on add
	req0 := httptest.NewRequest("POST", "/incomes", bytes.NewBufferString(`{bad}`))
	req0.Header.Set("Content-Type", "application/json")
	w0 := httptest.NewRecorder()
	router.ServeHTTP(w0, req0)
	assert.Equal(t, http.StatusBadRequest, w0.Code)

	// valid add => ID=1
	body := `{"user_id":1,"amount":100,"category":"sal","description":"d","date":"2025-04-20"}`
	req1 := httptest.NewRequest("POST", "/incomes", bytes.NewBufferString(body))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// missing user_id on get
	req2 := httptest.NewRequest("GET", "/incomes", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusBadRequest, w2.Code)

	// no records for user_id=2
	req3 := httptest.NewRequest("GET", "/incomes?user_id=2", nil)
	w3 := httptest.NewRecorder()
	router.ServeHTTP(w3, req3)
	assert.Equal(t, http.StatusNotFound, w3.Code)

	// insert record for user_id=2 and get
	db.Create(&Income{UserID: 2, Amount: 50, Category: "x", Description: "y", Date: "2025-04-20"})
	req4 := httptest.NewRequest("GET", "/incomes?user_id=2", nil)
	w4 := httptest.NewRecorder()
	router.ServeHTTP(w4, req4)
	assert.Equal(t, http.StatusOK, w4.Code)

	// delete existing ID=1
	reqDel := httptest.NewRequest("DELETE", "/incomes/1", nil)
	wDel := httptest.NewRecorder()
	router.ServeHTTP(wDel, reqDel)
	assert.Equal(t, http.StatusOK, wDel.Code)

	// delete missing ID=999
	reqDel2 := httptest.NewRequest("DELETE", "/incomes/999", nil)
	wDel2 := httptest.NewRecorder()
	router.ServeHTTP(wDel2, reqDel2)
	assert.Equal(t, http.StatusOK, wDel2.Code)
}

func TestBudgetEndpoints(t *testing.T) {
	setupTestDB()
	router := setupRouter()

	// invalid JSON on add
	req0 := httptest.NewRequest("POST", "/budget", bytes.NewBufferString(`{bad}`))
	req0.Header.Set("Content-Type", "application/json")
	w0 := httptest.NewRecorder()
	router.ServeHTTP(w0, req0)
	assert.Equal(t, http.StatusBadRequest, w0.Code)

	// valid add => ID=1
	body := `{"user_id":1,"budget_name":"b","budget_amount":100,"start_date":"2025-04-01","end_date":"2025-04-30"}`
	req1 := httptest.NewRequest("POST", "/budget", bytes.NewBufferString(body))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusOK, w1.Code)

	// missing user_id on get
	req2 := httptest.NewRequest("GET", "/budget", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	assert.Equal(t, http.StatusBadRequest, w2.Code)

	// no records for user_id=2
	req3 := httptest.NewRequest("GET", "/budget?user_id=2", nil)
	w3 := httptest.NewRecorder()
	router.ServeHTTP(w3, req3)
	assert.Equal(t, http.StatusNotFound, w3.Code)

	// insert record for user_id=2 and get
	db.Create(&Budget{UserID: 2, BudgetName: "b", BudgetAmount: 50, StartDate: "2025-04-01", EndDate: "2025-04-30"})
	req4 := httptest.NewRequest("GET", "/budget?user_id=2", nil)
	w4 := httptest.NewRecorder()
	router.ServeHTTP(w4, req4)
	assert.Equal(t, http.StatusOK, w4.Code)

	// delete existing ID=1
	reqDel := httptest.NewRequest("DELETE", "/budget/1", nil)
	wDel := httptest.NewRecorder()
	router.ServeHTTP(wDel, reqDel)
	assert.Equal(t, http.StatusOK, wDel.Code)

	// delete missing ID=999
	reqDel2 := httptest.NewRequest("DELETE", "/budget/999", nil)
	wDel2 := httptest.NewRecorder()
	router.ServeHTTP(wDel2, reqDel2)
	assert.Equal(t, http.StatusOK, wDel2.Code)
}

func TestJWTandStateHelpers(t *testing.T) {
	// state token
	s1 := generateStateToken()
	s2 := generateStateToken()
	assert.NotEmpty(t, s1)
	assert.NotEqual(t, s1, s2)
	_, err := base64.URLEncoding.DecodeString(s1)
	assert.NoError(t, err)

	// JWT
	jwtKey = []byte("secret")
	token := generateJWT("e@e.com", 42)
	parsed, err := jwt.Parse(token, func(tkn *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
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
	router := gin.Default()
	router.GET("/login/google", StartGoogleLogin)

	req := httptest.NewRequest("GET", "/login/google", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

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
	router := gin.Default()
	router.GET("/oauth2/callback", HandleGoogleCallback)

	req := httptest.NewRequest("GET", "/oauth2/callback?state=x&code=y", nil)
	req.AddCookie(&http.Cookie{Name: "oauthstate", Value: "x"})
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandleGoogleCallback_InvalidState(t *testing.T) {
	oauthConf = &oauth2.Config{}
	router := gin.Default()
	router.GET("/oauth2/callback", HandleGoogleCallback)

	req := httptest.NewRequest("GET", "/oauth2/callback?state=WRONG", nil)
	req.AddCookie(&http.Cookie{Name: "oauthstate", Value: "GOOD"})
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
