'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength <= 1) return { strength: 25, label: "Weak", color: "#ef4444" };
    if (strength === 2) return { strength: 50, label: "Fair", color: "#f59e0b" };
    if (strength === 3) return { strength: 75, label: "Good", color: "#06b6d4" };
    return { strength: 100, label: "Strong", color: "#22c55e" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (formData.username.length < 8) {
      setError("Username must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(formData.username, formData.email, formData.password);
      // Navigation is handled in AuthContext
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    loginWithGoogle();
  };

  const passwordStrength = getPasswordStrength();

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

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center space-y-8 p-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#fafafa]">Ggomruk</h1>
                <p className="text-sm text-[#a1a1aa]">Trading Strategy Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-[#fafafa] mb-4 leading-tight">
              Start Your Trading Journey Today
            </h2>
            <p className="text-lg text-[#a1a1aa] leading-relaxed">
              Join thousands of traders optimizing their strategies with our professional backtesting platform.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-[#18181b]/50 backdrop-blur-sm border border-[#3f3f46] rounded-lg hover:border-[#22c55e]/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#fafafa] mb-1">Free Forever Plan</h3>
                <p className="text-xs text-[#a1a1aa]">Get started with our generous free tier</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#18181b]/50 backdrop-blur-sm border border-[#3f3f46] rounded-lg hover:border-[#22c55e]/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#fafafa] mb-1">No Credit Card Required</h3>
                <p className="text-xs text-[#a1a1aa]">Start testing strategies immediately</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#18181b]/50 backdrop-blur-sm border border-[#3f3f46] rounded-lg hover:border-[#22c55e]/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#fafafa] mb-1">Cancel Anytime</h3>
                <p className="text-xs text-[#a1a1aa]">No long-term commitments required</p>
              </div>
            </div>
          </div>


        </div>

        {/* Right Side - Signup Form */}
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-[#3f3f46] rounded-2xl p-8 shadow-2xl">
              {/* Mobile branding */}
              <div className="md:hidden flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#fafafa]">Ggomruk</h1>
                  <p className="text-xs text-[#a1a1aa]">Trading Strategy Platform</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#fafafa] mb-2">Create your account</h2>
                <p className="text-sm text-[#a1a1aa]">Start optimizing your trading strategies</p>
              </div>

               {/* Error Message */}
               {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <XCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-[#fafafa] mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-[#a1a1aa]" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      required
                      minLength={8}
                      placeholder="Enter username (min 8 chars)"
                      className="block w-full pl-10 pr-3 py-3 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#fafafa] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#a1a1aa]" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="block w-full pl-10 pr-3 py-3 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#fafafa] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#a1a1aa]" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="block w-full pl-10 pr-12 py-3 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#a1a1aa]">Password strength:</span>
                        <span className="text-xs font-semibold" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${passwordStrength.strength}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#fafafa] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#a1a1aa]" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="block w-full pl-10 pr-12 py-3 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#3f3f46] bg-[#27272a] text-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2 text-xs text-[#a1a1aa] leading-relaxed">
                    I agree to the{" "}
                    <button type="button" className="text-[#7c3aed] hover:text-[#06b6d4] transition-colors">
                      Terms of Service
                    </button>
                    {" "}and{" "}
                    <button type="button" className="text-[#7c3aed] hover:text-[#06b6d4] transition-colors">
                      Privacy Policy
                    </button>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !agreedToTerms}
                  className="w-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Add Google Sign Up if consistent with Login Page, or omit if not requested. Assuming user wants similar consistency. */}
              {/* Login link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-[#a1a1aa]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#7c3aed] hover:text-[#06b6d4] font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
