export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  role: Role;
}
