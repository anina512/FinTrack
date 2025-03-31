export interface Expense {
  id?: string;
  user_id: number | null;         
  amount: number;     
  category: string;   
  date: string;       
  description: string;
  created_at: string;   
  Paid: boolean;
}

export interface Income {
id?: string;   
user_id: number | null;      
amount: number;     
category: string;   
date: string;       
description: string;
created_at: string;   
}

export interface Budget {
id?: string;
user_id: number | null;
budget_name: string;
monthly_income: number;
start_date: string;
end_date: string;
details: string;
created_at: string;
}