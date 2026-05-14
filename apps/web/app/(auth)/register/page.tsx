import type { Metadata } from 'next';
import RegisterPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Sign up for ShofferAI — your AI shopping assistant.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
