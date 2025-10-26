export interface User {
  id: string;
  name: string;
  identification: string;
  email: string;
  is_active?: boolean;
  roles?: string[]; 
}

export interface LoginRequest {
  login: string;      
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  token: string;
  user: User;
}
