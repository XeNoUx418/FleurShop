export interface RegisterData {
  username: string;
  email:    string;
  password: string;
  phone:    string;
  role:     'customer' | 'admin';
}

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  access:  string;
  refresh: string;
}

export interface User {
  id:       number;
  username: string;
  email:    string;
  role:     'customer' | 'admin';
  phone:    string;
}