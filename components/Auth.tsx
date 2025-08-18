import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Separator } from './ui/separator';
import { Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, Key, Sun, Moon } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

const translations = {
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password',
    signInDesc: 'Enter your credentials to access your account',
    signUpDesc: 'Create a new account to start reporting issues',
    forgotPasswordDesc: 'Enter your email address and we\'ll send you a link to reset your password',
    email: 'Email',
    emailPlaceholder: 'Enter your email address',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    signInButton: 'Sign In',
    signUpButton: 'Create Account',
    sendResetLink: 'Send Reset Link',
    backToSignIn: 'Back to Sign In',
    signing: 'Signing in...',
    creating: 'Creating account...',
    sendingReset: 'Sending reset link...',
    continueWithGoogle: 'Continue with Google',
    orContinueWith: 'Or continue with',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    forgotYourPassword: 'Forgot your password?',
    clickHere: 'Click here',
    resetLinkSent: 'Password reset link sent! Check your email for instructions.',
    passwordMismatch: 'Passwords do not match',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    nameRequired: 'Full name is required',
    googleSetupRequired: 'Google authentication requires additional setup. Please contact your administrator.',
    authenticationFailed: 'Authentication failed. Please try again.',
    resetPasswordFailed: 'Failed to send reset link. Please try again.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    toggleTheme: 'Toggle theme'
  },
  fr: {
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    forgotPassword: 'Mot de passe oublié',
    signInDesc: 'Entrez vos identifiants pour accéder à votre compte',
    signUpDesc: 'Créer un nouveau compte pour commencer à signaler des problèmes',
    forgotPasswordDesc: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe',
    email: 'Email',
    emailPlaceholder: 'Entrez votre adresse email',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Entrez votre nom complet',
    signInButton: 'Se connecter',
    signUpButton: 'Créer un compte',
    sendResetLink: 'Envoyer le lien',
    backToSignIn: 'Retour à la connexion',
    signing: 'Connexion...',
    creating: 'Création du compte...',
    sendingReset: 'Envoi du lien...',
    continueWithGoogle: 'Continuer avec Google',
    orContinueWith: 'Ou continuer avec',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    dontHaveAccount: "Vous n'avez pas de compte?",
    forgotYourPassword: 'Mot de passe oublié?',
    clickHere: 'Cliquez ici',
    resetLinkSent: 'Lien de réinitialisation envoyé! Vérifiez votre email pour les instructions.',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    invalidEmail: 'Veuillez entrer une adresse email valide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    nameRequired: 'Le nom complet est requis',
    googleSetupRequired: "L'authentification Google nécessite une configuration supplémentaire. Veuillez contacter votre administrateur.",
    authenticationFailed: "L'authentification a échoué. Veuillez réessayer.",
    resetPasswordFailed: "Échec de l'envoi du lien de réinitialisation. Veuillez réessayer.",
    showPassword: 'Montrer le mot de passe',
    hidePassword: 'Cacher le mot de passe',
    toggleTheme: 'Basculer le thème'
  }
};

export function Auth({ language = 'en' }: { language?: 'en' | 'fr' }) {
  const [currentView, setCurrentView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = translations[language];
  const isSignUp = currentView === 'signup';
  const isForgotPassword = currentView === 'forgot';

  // Theme toggle logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(formData.email)) {
      setError(t.invalidEmail);
      return false;
    }
    
    if (!isForgotPassword && formData.password.length < 6) {
      setError(t.passwordTooShort);
      return false;
    }
    
    if (isSignUp) {
      if (!formData.fullName.trim()) {
        setError(t.nameRequired);
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError(t.passwordMismatch);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          throw error;
        }

        setSuccess(t.resetLinkSent);
        setFormData(prev => ({ ...prev, email: '' }));
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.fullName,
              role: 'citizen'
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          setError('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          setError('');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (isForgotPassword) {
        setError(err.message || t.resetPasswordFailed);
      } else {
        setError(err.message || t.authenticationFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.message?.includes('provider') || err.message?.includes('not enabled')) {
        setError(t.googleSetupRequired);
      } else {
        setError(err.message || t.authenticationFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const switchView = (view: 'signin' | 'signup' | 'forgot') => {
    setCurrentView(view);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  return (
    <>
      <style>{`
        :root {
          --background: #F8FAFC;
          --foreground: #1E293B;
          --card: #FFFFFF;
          --muted-foreground: #64748B;
          --primary: #2563EB;
          --border: #E2E8F0;
          --muted: #F1F5F9;
          --destructive: #EF4444;
          --destructive-foreground: #FFFFFF;
        }
        .dark {
          --background: #0F172A;
          --foreground: #F1F5F9;
          --card: #1E293B;
          --muted-foreground: #94A3B8;
          --primary: #3B82F6;
          --border: #334155;
          --muted: #1E293B;
          --destructive: #DC2626;
          --destructive-foreground: #F1F5F9;
        }
        html { scroll-behavior: smooth; }
        body {
          background-color: var(--background);
          color: var(--foreground);
          transition: background-color 0.3s ease, color 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .bg-background { background-color: var(--background); }
        .bg-card { background-color: var(--card); }
        .bg-muted { background-color: var(--muted); }
        .text-foreground { color: var(--foreground); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .text-primary { color: var(--primary); }
        .border-border { border-color: var(--border); }
        .bg-primary { background-color: var(--primary); }
        .text-destructive { color: var(--destructive); }
        .bg-destructive { background-color: var(--destructive); }
        .text-destructive-foreground { color: var(--destructive-foreground); }
        button:focus-visible, input:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Theme Toggle Button */}
          {/* <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-3 rounded-xl hover:bg-muted transition-all duration-300 min-w-[48px] min-h-[48px]"
              title={t.toggleTheme}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-orange-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>
          </div> */}

          {/* Forgot Password View */}
          {isForgotPassword ? (
            <Card className="border-border bg-card shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => switchView('signin')}
                    className="p-0 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <CardTitle className="text-2xl text-foreground">{t.forgotPassword}</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  {t.forgotPasswordDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-muted text-foreground">
                    <Key className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-foreground">{t.email}</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t.sendingReset}
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        {t.sendResetLink}
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => switchView('signin')}
                  >
                    {t.backToSignIn}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={isSignUp ? 'signup' : 'signin'} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger
                  value="signin"
                  onClick={() => switchView('signin')}
                  className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <Mail className="h-4 w-4" />
                  <span>{t.signIn}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  onClick={() => switchView('signup')}
                  className="flex items-center space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  <User className="h-4 w-4" />
                  <span>{t.signUp}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-6">
                <Card className="border-border bg-card shadow-lg">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center text-foreground">{t.signIn}</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                      {t.signInDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2 h-12 border-border hover:bg-muted"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>{t.continueWithGoogle}</span>
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t.orContinueWith}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-muted text-foreground">
                        <Key className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-foreground">{t.email}</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-foreground">{t.password}</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t.passwordPlaceholder}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            className="bg-background border-border text-foreground pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? t.hidePassword : t.showPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t.signing}
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            {t.signInButton}
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="text-center text-sm space-y-2">
                      <div>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => switchView('forgot')}
                        >
                          {t.forgotYourPassword}
                        </Button>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.dontHaveAccount} </span>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => switchView('signup')}
                        >
                          {t.clickHere}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <Card className="border-border bg-card shadow-lg">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center text-foreground">{t.signUp}</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                      {t.signUpDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2 h-12 border-border hover:bg-muted"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>{t.continueWithGoogle}</span>
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t.orContinueWith}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-destructive text-destructive-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-muted text-foreground">
                        <Key className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-foreground">{t.fullName}</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder={t.fullNamePlaceholder}
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          required
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-foreground">{t.email}</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-foreground">{t.password}</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t.passwordPlaceholder}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            className="bg-background border-border text-foreground pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? t.hidePassword : t.showPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password" className="text-foreground">{t.confirmPassword}</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t.confirmPasswordPlaceholder}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            required
                            className="bg-background border-border text-foreground pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? t.hidePassword : t.showPassword}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t.creating}
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            {t.signUpButton}
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">{t.alreadyHaveAccount} </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => switchView('signin')}
                      >
                        {t.clickHere}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
}