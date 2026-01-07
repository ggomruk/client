'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('message');

    if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => router.push('/login'), 4000);
        return;
    }
    
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      setStatus('success');
      setMessage('Authentication successful! Redirecting to dashboard...');
      
      // Redirect to app after a brief delay
      setTimeout(() => {
        router.push('/app');
        // Force a reload to trigger AuthContext to load the new token
        // window.location.href = '/app'; // Using router.push is smoother if AuthContext listens to storage or is re-mounted. 
        // But since AuthContext reads generic "token" on mount, a hard reload might be safer for now.
        window.location.href = '/app';
      }, 1500);
    } else {
      // If we land here without token/error, wait a bit in case it's a slow hydration or something, 
      // but usually searchParams are ready.
       // However, to be safe against double-renders:
       const timeout = setTimeout(() => {
          if (status === 'processing') {
             setStatus('error');
             setMessage('No authentication token received');
             setTimeout(() => {
                router.push('/login');
              }, 3000);
          }
       }, 2000);
       return () => clearTimeout(timeout);
    }
  }, [searchParams, router, status]);

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
