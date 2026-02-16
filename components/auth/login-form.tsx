import { Suspense } from 'react'
import { LoginFormClient } from './login-form-client'

interface LoginFormProps {
  callbackUrl: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormClient callbackUrl={callbackUrl} />
    </Suspense>
  )
}
