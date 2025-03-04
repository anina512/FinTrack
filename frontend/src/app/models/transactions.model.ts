export interface Expense {
    id?: string;
    user_id: number;         
    amount: number;     
    category: string;   
    date: string;       
    description: string;
    created_at: string;   
  }

export interface Income {
  id?: string;   
  user_id: number;      
  amount: number;     
  category: string;   
  date: string;       
  description: string;
  created_at: string;   
}

export interface Budget {
  id?: string;
  name: string;
  monthlyIncome: number;
  startDate: string;
  endDate: string;
  details: string;
  created_at: Date;
}