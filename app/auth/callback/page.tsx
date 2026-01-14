'use client';

import React, { useEffect, useState, Suspense, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasExchanged = useRef(false);

  const initialState = useMemo(() => {
    const error = searchParams.get('message');
    const urlToken = searchParams.get('token');
    
    if (error) {
      return {
        status: 'error' as const,
        message: `Authentication failed: ${error}`,
        needsRedirect: '/login',
      };
    }
    if (urlToken) {
      return {
        status: 'success' as const,
        message: 'Authentication successful! Redirecting to dashboard...',
        token: urlToken,
        needsRedirect: '/app',
      };
    }
    return {
      status: 'processing' as const,
      message: 'Processing authentication...',
    };
  }, [searchParams]);

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(initialState.status);
  const [message, setMessage] = useState(initialState.message);

  useEffect(() => {
    // Handle URL token (legacy flow)
    if (initialState.token) {
      localStorage.setItem('token', initialState.token);
      const timeout = setTimeout(() => {
        window.location.href = '/app';
      }, 1500);
      return () => clearTimeout(timeout);
    }

    // Handle error from URL
    if (initialState.status === 'error') {
      const timeout = setTimeout(() => router.push('/login'), 4000);
      return () => clearTimeout(timeout);
    }

    // New secure flow: exchange httpOnly cookie for token
    const exchangeToken = async () => {
      // Prevent duplicate calls from React strict mode
      if (hasExchanged.current) return;
      hasExchanged.current = true;

      try {
        const response = await fetch(`${API_URL}/auth/exchange-token`, {
          method: 'GET',
          credentials: 'include', // Important: sends cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success && data.data?.access_token) {
          localStorage.setItem('token', data.data.access_token);
          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');
          setTimeout(() => {
            window.location.href = '/app';
          }, 1500);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to complete authentication');
          setTimeout(() => router.push('/login'), 4000);
        }
      } catch (err) {
        console.error('Token exchange error:', err);
        setStatus('error');
        setMessage('Network error during authentication');
        setTimeout(() => router.push('/login'), 4000);
      }
    };

    exchangeToken();
  }, [searchParams, router, initialState]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7c3aed] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{
            animation: 'float-blob 8s ease-in-out infinite',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute top-1/3 -right-20 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{
            animation: 'float-blob 8s ease-in-out infinite',
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#7c3aed] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{
            animation: 'float-blob 8s ease-in-out infinite',
            animationDelay: '4s'
          }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#18181b]/80 backdrop-blur-xl border border-[#3f3f46] rounded-2xl p-8 shadow-2xl text-center">
            
            <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-[#fafafa] mb-2">
              {status === 'processing' && 'Verifying...'}
              {status === 'success' && 'Welcome Back!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            
            <div className="py-6 flex justify-center">
               {status === 'processing' && (
                  <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin" />
               )}
               {status === 'success' && (
                  <CheckCircle className="w-12 h-12 text-[#22c55e]" />
               )}
               {status === 'error' && (
                  <XCircle className="w-12 h-12 text-red-500" />
               )}
            </div>

            <p className="text-[#a1a1aa] mb-4">
              {message}
            </p>

            {status === 'error' && (
                 <button
                 onClick={() => router.push('/login')}
                  className="mt-4 px-6 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-lg transition-colors border border-[#3f3f46]"
                 >
                 Back to Login
                 </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
       </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
