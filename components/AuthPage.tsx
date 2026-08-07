
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const { login, signup, loginWithGoogle } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters");
                }
                await signup(name, email, password);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError("Google sign in failed");
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-5xl bg-gray-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]">
                
                {/* Left Side - Brand */}
                <div className="md:w-1/2 bg-gradient-to-br from-orange-600 to-red-700 p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3.3.5.5.5.8z"></path>
                                </svg>
                             </div>
                            <h1 className="text-2xl font-bold text-white tracking-wide">FireSocial</h1>
                        </div>
                        
                        <div className="space-y-6">
                            <h2 className="text-5xl font-bold text-white leading-tight">
                                {isLogin ? "Welcome\nBack." : "Join the\nMovement."}
                            </h2>
                            <p className="text-orange-100 text-lg leading-relaxed max-w-sm">
                                {isLogin 
                                    ? "Log in to connect with your community, track your streaks, and create amazing content with AI." 
                                    : "Create an account today. Experience a new era of social networking powered by creativity."}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12">
                         <div className="flex items-center gap-2 text-white/60 text-sm">
                            <span>© 2024 FireSocial Inc.</span>
                         </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-gray-900/40">
                    <div className="max-w-md mx-auto w-full">
                        <h3 className="text-3xl font-bold text-white mb-2">{isLogin ? "Sign In" : "Create Account"}</h3>
                        <p className="text-gray-400 mb-8">
                            {isLogin ? "Enter your details to continue." : "It's free and only takes a minute."}
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-200 animate-in slide-in-from-top-2">
                                <AlertTriangle size={20} className="flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 rounded-xl bg-white text-gray-900 font-roboto font-medium text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition-all transform active:scale-[0.98] disabled:opacity-70 mb-6 shadow-lg relative"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-gray-900" size={20} />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
                                </>
                            )}
                        </button>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="px-4 bg-transparent text-gray-500 font-semibold">Or email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                                        <input 
                                            type="text" 
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    placeholder="Email Address"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    placeholder="Password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {!isLogin && (
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input 
                                        type="password" 
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                        placeholder="Confirm Password"
                                    />
                                </div>
                            )}

                            {isLogin && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors">Forgot password?</button>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-4 px-4 mt-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")} 
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button 
                                    onClick={toggleMode}
                                    className="text-orange-400 font-bold hover:text-orange-300 transition-colors ml-1"
                                >
                                    {isLogin ? "Sign up" : "Log in"}
                                </button>
                            </p>
                             {isLogin && <div className="mt-4 p-2 bg-white/5 rounded-lg text-xs text-gray-500 border border-white/5 inline-block">Demo: yourname@example.com / password</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
