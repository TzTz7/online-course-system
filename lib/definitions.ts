export type UserRole = 'student' | 'teacher' | 'admin';

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at: string;
};
