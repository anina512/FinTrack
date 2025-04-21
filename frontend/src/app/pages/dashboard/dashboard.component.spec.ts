import { of, throwError } from 'rxjs'

jest.mock('@angular/core', () => {
  const d = () => (c: any) => c
  return {
    Component: d,
    Injectable: d,
    Directive: d,
    Pipe: d,
    NgModule: d,
    Input: () => {},
    Output: () => {},
    EventEmitter: class { emit() {} },
    ChangeDetectorRef: class { detectChanges() {} },
    Inject: () => () => {},
    PLATFORM_ID: 'browser',
  }
})

jest.mock('@angular/common', () => {
  const actual = jest.requireActual('@angular/common')
  return { ...actual, isPlatformBrowser: () => true }
})

jest.mock('@angular/router', () => ({
  Router: class { navigate() {} },
  ActivatedRoute: class {},
  RouterModule: { forRoot: () => ({}) },
  NavigationEnd: class {},
}))

jest.mock('@angular/forms', () => ({ FormsModule: class {} }))
jest.mock('@angular/common/http', () => ({ HttpClientModule: class {} }))

const ChartMock: any = jest.fn(() => ({ data: {}, update: jest.fn() }))
ChartMock.register = jest.fn()
ChartMock.registerables = []
jest.mock('chart.js', () => ({ Chart: ChartMock, registerables: [] }))

class MockCDR { detectChanges = jest.fn() }
class MockExpense { saveExpense = jest.fn() }
class MockIncome { saveIncome = jest.fn() }
class MockBudget { saveBudget = jest.fn() }

const mockTx = {
  getExpenses: jest.fn(),
  getIncomes: jest.fn(),
  getBudget: jest.fn(),
  updateExpense: jest.fn(),
}

const mockAuth = { getUserId: jest.fn() }
const mockRoute = { snapshot: { queryParamMap: { get: jest.fn() } } } as any
const mockRouter = { navigate: jest.fn() } as any

import { DashboardComponent } from './dashboard.component'
import { Chart } from 'chart.js'

describe('DashboardComponent', () => {
  let comp: DashboardComponent
  const newComp = () =>
    new DashboardComponent(
      new MockCDR() as any,
      new MockExpense() as any,
      new MockIncome() as any,
      new MockBudget() as any,
      mockTx as any,
      mockAuth as any,
      mockRoute,
      mockRouter,
      'browser',
    )

  beforeEach(() => {
    jest.clearAllMocks()
    comp = newComp()
  })

  const mkExpense = (a: number, c = 'Food', d = new Date().toISOString()) => ({
    amount: a,
    category: c,
    date: d,
    Paid: false,
    created_at: d,
  })
  const mkIncome = (a: number, c = 'Salary', d = new Date().toISOString()) => ({
    amount: a,
    category: c,
    date: d,
    created_at: d,
  })
  const mkBudget = (s: string, e: string, a = 1000) => ({
    start_date: s,
    end_date: e,
    budget_amount: a,
    created_at: s,
  })

  it('ngOnInit loads data', () => {
    mockAuth.getUserId.mockReturnValue(1)
    mockTx.getIncomes.mockReturnValue(of([mkIncome(500)]))
    mockTx.getExpenses.mockReturnValue(of([mkExpense(100)]))
    mockTx.getBudget.mockReturnValue(of([mkBudget('2025-04-01', '2025-04-30')]))
    comp.ngOnInit()
    expect(comp.income).toBe(500)
    expect(comp.expenses).toBe(100)
  })

  it('getActivityColor returns hex', () => {
    expect(comp.getActivityColor('income')).toBe('#2ecc71')
    expect(comp.getActivityColor('expense')).toBe('#e74c3c')
    expect(comp.getActivityColor('budget')).toBe('#3498db')
    expect(comp.getActivityColor('x')).toBe('#95a5a6')
  })

  it('updateSavingsChart branches and chart update', () => {
    comp.savingsChart = { data: {}, update: jest.fn() } as any
    comp.currentMonthExpenses = 0
    comp.currentMonthBudget = 100
    comp.updateSavingsChart()
    expect(comp.savingsChart.update).toHaveBeenCalled()
    comp.currentMonthExpenses = 250
    comp.currentMonthBudget = 0
    comp.updateSavingsChart()
    expect(comp.savingsChartData.labels).toEqual(['Expenses'])
    comp.currentMonthExpenses = 800
    comp.currentMonthBudget = 500
    comp.updateSavingsChart()
    expect(comp.savingsChartData.labels).toEqual(['Budget', 'Overspent'])
  })

  it('markAsPaid branches', () => {
    comp.markAsPaid({ Paid: true })
    expect(mockTx.updateExpense).not.toHaveBeenCalled()
    mockTx.updateExpense.mockReturnValue(of({}))
    comp.loggedInUserId = 2
    comp.markAsPaid(mkExpense(10))
    expect(mockTx.updateExpense).toHaveBeenCalled()
  })

  it('modals toggle and reload', () => {
    comp.loggedInUserId = 7
    mockTx.getExpenses.mockReturnValue(of([]))
    mockTx.getIncomes.mockReturnValue(of([]))
    mockTx.getBudget.mockReturnValue(of([]))
    comp.openExpenseModal()
    comp.closeExpenseModal()
    comp.openIncomeModal()
    comp.closeIncomeModal()
    comp.openBudgetModal()
    comp.closeBudgetModal()
    expect(mockTx.getBudget).toHaveBeenCalled()
  })

  it('fetchWeeklyExpenses updates chart and error path', () => {
    comp.weeklyExpensesChart = { data: {}, update: jest.fn() } as any
    const d = new Date()
    d.setDate(d.getDate() - 2)
    mockTx.getExpenses.mockReturnValue(of([mkExpense(20, 'Food', d.toISOString())]))
    comp.fetchWeeklyExpenses(5)
    expect(comp.weeklyExpensesChart.update).toHaveBeenCalled()
    mockTx.getExpenses.mockReturnValue(throwError(() => new Error('x')))
    comp.fetchWeeklyExpenses(5)
  })

  it('fetchIncomeData totals and chart update', () => {
    const today = new Date().toISOString()
    const prev = new Date()
    prev.setMonth(prev.getMonth() - 1)
    mockTx.getIncomes.mockReturnValue(of([
      { amount: 200, category: 'Salary', date: today },
      { amount: 100, category: 'Salary', date: prev.toISOString() },
      { amount: 50, category: 'XYZ', date: today },
    ]))
    comp.incomeChart = { data: {}, update: jest.fn() } as any
    comp.fetchIncomeData(9)
    expect(comp.income).toBe(350)
    expect(comp.incomeChart.update).toHaveBeenCalled()
  })

  it('fetchExpenseData totals and chart update', () => {
    const today = new Date().toISOString()
    const prev = new Date()
    prev.setMonth(prev.getMonth() - 1)
    mockTx.getExpenses.mockReturnValue(of([
      { amount: 300, category: 'Food', date: today },
      { amount: 100, category: 'ABC', date: prev.toISOString() },
    ]))
    comp.expensesChart = { data: {}, update: jest.fn() } as any
    comp.savingsChart = { data: {}, update: jest.fn() } as any
    comp.fetchExpenseData(3)
    expect(comp.expenses).toBe(400)
    expect(comp.expensesChart.update).toHaveBeenCalled()
    expect(comp.savingsChart.update).toHaveBeenCalled()
  })

  it('fetchBudgetData sets budget and updates savings', () => {
    const n = new Date()
    const s = new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10)
    const e = new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().slice(0, 10)
    mockTx.getBudget.mockReturnValue(of([mkBudget(s, e, 900)]))
    comp.savingsChart = { data: {}, update: jest.fn() } as any
    comp.fetchBudgetData(1)
    expect(comp.currentMonthBudget).toBe(900)
    mockTx.getBudget.mockReturnValue(throwError(() => new Error('x')))
    comp.fetchBudgetData(1)
    expect(comp.currentMonthBudget).toBe(0)
  })

  it('updateCombinedActivities through fetchAll', () => {
    const i = mkIncome(100, 'Salary', '2025-04-01T00:00:00.000Z')
    const e = mkExpense(50, 'Food', '2025-04-02T00:00:00.000Z')
    mockTx.getIncomes.mockReturnValue(of([i]))
    mockTx.getExpenses.mockReturnValue(of([e]))
    comp.fetchAllIncomes(1)
    comp.fetchAllExpenses(1)
    expect(comp.combinedActivities.length).toBe(2)
    expect(comp.combinedActivities[0].amount).toBe(50)
  })

  it('activities modal open/close', () => {
    comp.openActivitiesModal()
    expect(comp.showActivitiesModal).toBe(true)
    comp.closeActivitiesModal()
    expect(comp.showActivitiesModal).toBe(false)
  })

  it('onExpense/Income/BudgetSaved paths', () => {
    comp.loggedInUserId = 10
    mockTx.getExpenses.mockReturnValue(of([]))
    mockTx.getIncomes.mockReturnValue(of([]))
    mockTx.getBudget.mockReturnValue(of([]))
    comp.onExpenseSaved({})
    comp.onIncomeSaved({})
    comp.onBudgetSaved({})
    expect((comp as any).expenseInstance.saveExpense).toHaveBeenCalled()
    expect((comp as any).incomeInstance.saveIncome).toHaveBeenCalled()
    expect((comp as any).budgetInstance.saveBudget).toHaveBeenCalled()
  })

  it('ngAfterViewInit creates charts', () => {
    jest.useFakeTimers()
    document.body.innerHTML = `
      <canvas id="savingsChart"></canvas>
      <canvas id="incomeChart"></canvas>
      <canvas id="expensesChart"></canvas>
      <canvas id="weeklyExpensesChart"></canvas>
    `
    comp.ngAfterViewInit()
    jest.advanceTimersByTime(150)
    expect((Chart as any).mock.calls.length).toBe(4)
    jest.useRealTimers()
  })
})

describe('DashboardComponent', () => {
  const mk = () => new DashboardComponent(
    new MockCDR() as any,
    new MockExpense() as any,
    new MockIncome()  as any,
    new MockBudget()  as any,
    mockTx as any,
    mockAuth as any,
    mockRoute,
    mockRouter,
    'browser',
  )

  const mkBud = (s: string, e: string, v = 500) =>
    ({ start_date: s, end_date: e, budget_amount: v, created_at: s })

  const mkInc = (n: number) =>
    ({ amount: n, category: 'Salary', date: new Date().toISOString(), created_at: new Date().toISOString() })

  const mkExp = (n: number) =>
    ({ amount: n, category: 'Food', date: new Date().toISOString(), Paid: false, created_at: new Date().toISOString() })

  it('invokes remaining public methods at least once', () => {
    const c = mk()

    c.openExpenseModal(); c.viewExpenseDetails()
    c.openIncomeModal();  c.viewIncomeDetails()
    c.openBudgetModal();  c.viewBudgetDetails()

    c.loggedInUserId = 99
    mockTx.getBudget  .mockReturnValue(of([mkBud('2025-04-01', '2025-04-30')]))
    mockTx.getIncomes .mockReturnValue(of([mkInc(20)]))
    mockTx.getExpenses.mockReturnValue(of([mkExp(40)]))

    c.fetchAllBudgets(99)
    c.fetchAllIncomes(99)
    c.fetchAllExpenses(99)

    expect(c.showBudgetModal).toBe(true)
  })
})
