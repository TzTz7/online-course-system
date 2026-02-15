'use server';

import { signIn, signOut } from '@/auth/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import type { User } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const RegisterSchema = z.object({
  name: z.string().min(2, { message: '名字至少需要 2 个字符' }),
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(6, { message: '密码至少需要 6 个字符' }),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: '请选择用户类型' }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    role?: string[];
  };
  message?: string | null;
};

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return '邮箱或密码错误';
        default:
          return '登录失败，请重试';
      }
    }
    throw error;
  }
}

export async function registerUser(
  state: RegisterState | undefined,
  payload: FormData,
): Promise<RegisterState | undefined> {
  const validatedFields = RegisterSchema.safeParse({
    name: payload.get('name'),
    email: payload.get('email'),
    password: payload.get('password'),
    confirmPassword: payload.get('confirmPassword'),
    role: payload.get('role'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '请检查输入的信息',
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const existingUser = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return {
        message: '该邮箱已被注册',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, email, password_hash, role, status, avatar)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, 'active', NULL)
    `;
  } catch (error) {
    return {
      message: '注册失败，请重试',
    };
  }

  await signIn('credentials', { email, password });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
}
