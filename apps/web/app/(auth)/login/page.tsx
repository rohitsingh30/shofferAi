import type { Metadata } from 'next';
import LoginPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to ShofferAI to start shopping with your AI assistant.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
