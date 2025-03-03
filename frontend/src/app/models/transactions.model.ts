export interface Expense {
    id: string;         
    amount: number;     
    category: string;   
    date: string;       
    description: string;
    createdAt: Date;   
  }

export interface Income {
  id: string;         
  amount: number;     
  category: string;   
  date: string;       
  description: string;
  createdAt: Date;   
}

export interface Budget {
  id: string;
  name: string;
  monthlyIncome: number;
  startDate: string;
  endDate: string;
  details: string;
  createdAt: Date;
}