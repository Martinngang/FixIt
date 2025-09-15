import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from "./ui/button.tsx"
import { Badge } from "./ui/badge.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Card, CardContent } from "./ui/card.tsx"

import { 
  Camera, 
  MapPin, 
  Bell, 
  Users, 
  CheckCircle, 
  Star,
  Globe,
  Lightbulb,
  Car,
  Trash2,
  CloudRain,
  ArrowRight,
  Play,
  Shield,
  Award,
  TrendingUp,
  Moon,
  Sun,
  Menu,
  X,
  Smartphone,
  Zap,
  Eye,
  Heart
} from 'lucide-react';

const translations = {
  en: {
    features: 'Features',
    howItWorks: 'How it Works',
    testimonials: 'Testimonials',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    toggleTheme: 'Toggle theme',
    heroTagline: 'Speak Up. Report Issues. Fix Your City.',
    heroSubtitle: 'Empower your community by reporting local issues. Connect with authorities and track progress in real-time.',
    reportNow: 'Report an Issue Now',
    watchDemo: 'Watch Demo',
    downloadApp: 'Download App',
    issuesReported: 'Issues Reported',
    issuesResolved: 'Issues Resolved',
    activeCommunities: 'Active Communities',
    commonIssues: 'Common Issues We Help Fix',
    roads: 'Road Issues',
    roadsDesc: 'Potholes, damaged roads, missing signs',
    lighting: 'Street Lighting',
    lightingDesc: 'Broken lights, dark areas, safety concerns',
    waste: 'Waste Management',
    wasteDesc: 'Overflowing bins, illegal dumping, collection issues',
    drainage: 'Drainage Problems',
    drainageDesc: 'Flooding, blocked drains, poor drainage',
    howItWorksTitle: 'How FixIt Works',
    howItWorksSubtitle: 'Reporting community issues has never been easier',
    step1Title: 'Snap a Photo',
    step1Desc: 'Take a photo of the issue you want to report',
    step2Title: 'Submit with Location',
    step2Desc: 'Add details and location using GPS or manual entry',
    step3Title: 'Get Updates',
    step3Desc: 'Track progress and receive notifications on resolution',
    featuresTitle: 'Why Choose FixIt?',
    featuresSubtitle: 'Built for communities, trusted by authorities',
    feature1Title: 'Real-time Tracking',
    feature1Desc: 'Monitor the status of your reports from submission to resolution',
    feature2Title: 'Community Driven',
    feature2Desc: 'Vote on issues and see what matters most to your neighbors',
    feature3Title: 'Official Integration',
    feature3Desc: 'Direct connection with local authorities and service providers',
    feature4Title: 'Mobile Optimized',
    feature4Desc: 'Report issues on-the-go with our responsive mobile interface',
    testimonialsTitle: 'What Our Community Says',
    testimonial1: '"FixIt helped me report a dangerous pothole that was fixed within a week. Amazing response time!"',
    testimonial1Author: 'Sarah Johnson',
    testimonial1Role: 'Community Member',
    testimonial2: '"As a city official, FixIt has streamlined our issue tracking and improved citizen engagement significantly."',
    testimonial2Author: 'Mayor David Chen',
    testimonial2Role: 'City of Toronto',
    testimonial3: '"The app is so easy to use. I\'ve reported several issues in my neighborhood and they all got resolved."',
    testimonial3Author: 'Fatima Al-Rashid',
    testimonial3Role: 'Resident',
    trustTitle: 'Trusted by Cities Across the Globe',
    trustSubtitle: 'Join thousands of communities already using FixIt',
    ctaTitle: 'Ready to Fix Your City?',
    ctaSubtitle: 'Join thousands of citizens making their communities better',
    ctaButton: 'Start Reporting Issues',
    footerText: '© 2024 FixIt. Making communities better, one issue at a time.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact Us'
  },
  fr: {
    features: 'Fonctionnalités',
    howItWorks: 'Comment ça marche',
    testimonials: 'Témoignages',
    getStarted: 'Commencer',
    signIn: 'Se connecter',
    toggleTheme: 'Basculer le thème',
    heroTagline: 'Exprimez-vous. Signalez les problèmes. Réparez votre ville.',
    heroSubtitle: 'Renforcez votre communauté en signalant les problèmes locaux. Connectez-vous avec les autorités et suivez les progrès en temps réel.',
    reportNow: 'Signaler un problème maintenant',
    watchDemo: 'Voir la démo',
    downloadApp: 'Télécharger l\'app',
    issuesReported: 'Problèmes signalés',
    issuesResolved: 'Problèmes résolus',
    activeCommunities: 'Communautés actives',
    commonIssues: 'Problèmes courants que nous aidons à résoudre',
    roads: 'Problèmes routiers',
    roadsDesc: 'Nids-de-poule, routes endommagées, panneaux manquants',
    lighting: 'Éclairage public',
    lightingDesc: 'Lumières cassées, zones sombres, préoccupations de sécurité',
    waste: 'Gestion des déchets',
    wasteDesc: 'Poubelles qui débordent, décharges illégales, problèmes de collecte',
    drainage: 'Problèmes de drainage',
    drainageDesc: 'Inondations, drains bloqués, mauvais drainage',
    howItWorksTitle: 'Comment fonctionne FixIt',
    howItWorksSubtitle: 'Signaler les problèmes communautaires n\'a jamais été aussi facile',
    step1Title: 'Prenez une photo',
    step1Desc: 'Prenez une photo du problème que vous voulez signaler',
    step2Title: 'Soumettez avec localisation',
    step2Desc: 'Ajoutez des détails et la localisation via GPS ou saisie manuelle',
    step3Title: 'Recevez des mises à jour',
    step3Desc: 'Suivez les progrès et recevez des notifications sur la résolution',
    featuresTitle: 'Pourquoi choisir FixIt ?',
    featuresSubtitle: 'Conçu pour les communautés, approuvé par les autorités',
    feature1Title: 'Suivi en temps réel',
    feature1Desc: 'Surveillez le statut de vos rapports de la soumission à la résolution',
    feature2Title: 'Piloté par la communauté',
    feature2Desc: 'Votez sur les problèmes et voyez ce qui importe le plus à vos voisins',
    feature3Title: 'Intégration officielle',
    feature3Desc: 'Connexion directe avec les autorités locales et les fournisseurs de services',
    feature4Title: 'Optimisé pour mobile',
    feature4Desc: 'Signalez les problèmes en déplacement avec notre interface mobile responsive',
    testimonialsTitle: 'Ce que dit notre communauté',
    testimonial1: '"FixIt m\'a aidé à signaler un nid-de-poule dangereux qui a été réparé en une semaine. Temps de réponse incroyable !"',
    testimonial1Author: 'Sarah Johnson',
    testimonial1Role: 'Membre de la communauté',
    testimonial2: '"En tant qu\'officiel municipal, FixIt a rationalisé notre suivi des problèmes et amélioré l\'engagement citoyen significativement."',
    testimonial2Author: 'Maire David Chen',
    testimonial2Role: 'Ville de Toronto',
    testimonial3: '"L\'application est si facile à utiliser. J\'ai signalé plusieurs problèmes dans mon quartier et ils ont tous été résolus."',
    testimonial3Author: 'Fatima Al-Rashid',
    testimonial3Role: 'Résidente',
    trustTitle: 'Approuvé par les villes du monde entier',
    trustSubtitle: 'Rejoignez des milliers de communautés utilisant déjà FixIt',
    ctaTitle: 'Prêt à réparer votre ville ?',
    ctaSubtitle: 'Rejoignez des milliers de citoyens qui améliorent leurs communautés',
    ctaButton: 'Commencer à signaler des problèmes',
    footerText: '© 2024 FixIt. Améliorer les communautés, un problème à la fois.',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
    contact: 'Nous contacter'
  }
};

interface EnhancedLandingPageProps {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  onGetStarted: () => void;
}

export default function EnhancedLandingPage({ language, setLanguage, onGetStarted }: EnhancedLandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = translations[language];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Modern Geometric Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-600/10 dark:to-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FixIt</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">Civic Solutions</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">{t.features}</a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">{t.howItWorks}</a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">{t.testimonials}</a>
            </div>
            
            {/* Right Side Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                title={t.toggleTheme}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                <SelectTrigger className="w-auto border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Globe className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-300" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="hidden sm:flex items-center space-x-3">
                <Button onClick={onGetStarted} variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  {t.signIn}
                </Button>
                <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-2 rounded-xl">
                  {t.getStarted}
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-slate-600 dark:text-slate-300"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {isMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 py-4 space-y-4">
              <a href="#features" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.features}</a>
              <a href="#how-it-works" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.howItWorks}</a>
              <a href="#testimonials" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.testimonials}</a>
              <div className="flex space-x-3 px-4 pt-4">
                <Button onClick={onGetStarted} variant="outline" size="sm" className="flex-1">
                  {t.signIn}
                </Button>
                <Button onClick={onGetStarted} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                  {t.getStarted}
                </Button>
              </div>
            </div>
          )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div className="text-center lg:text-left mb-12 lg:mb-0">
                <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700/50 shadow-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Trusted by 500+ Communities
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t.heroTagline.split(' ').slice(0, 2).join(' ')}
                  </span>{' '}
                  <span className="text-slate-900 dark:text-white">
                    {t.heroTagline.split(' ').slice(2).join(' ')}
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed">
                  {t.heroSubtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                  <Button 
                    onClick={onGetStarted}
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6 rounded-2xl group"
                  >
                    <Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    {t.reportNow}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-8 py-6 rounded-2xl border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300 group"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    {t.watchDemo}
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">25,847</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t.issuesReported}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">21,203</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t.issuesResolved}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">500+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t.activeCommunities}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="absolute top-1/2 -right-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700 animate-bounce">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  
                  <div className="w-80 h-[640px] bg-slate-900 dark:bg-slate-700 rounded-[3rem] p-4 shadow-2xl">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white text-sm">
                          <div>9:41 AM</div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="ml-2 text-xs">100%</div>
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white text-xl font-bold">Report Issue</h3>
                          <p className="text-blue-100 text-sm">Make your city better</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">Take Photo</span>
                          </div>
                          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl h-24 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-slate-400" />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">Location</span>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl h-16 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-green-500" />
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl py-3 text-white shadow-lg">
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Issues Section */}
        <section className="py-16 sm:py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                {t.commonIssues}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { icon: Car, title: t.roads, desc: t.roadsDesc, colors: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20', iconColor: 'text-orange-600 dark:text-orange-400' },
                { icon: Lightbulb, title: t.lighting, desc: t.lightingDesc, colors: 'from-yellow-500 to-orange-500', bg: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20', iconColor: 'text-yellow-600 dark:text-yellow-400' },
                { icon: Trash2, title: t.waste, desc: t.wasteDesc, colors: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', iconColor: 'text-green-600 dark:text-green-400' },
                { icon: CloudRain, title: t.drainage, desc: t.drainageDesc, colors: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20', iconColor: 'text-blue-600 dark:text-blue-400' }
              ].map((item, idx) => (
                <Card key={idx} className="group bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.howItWorksTitle}</h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">{t.howItWorksSubtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
              {[
                { icon: Camera, title: t.step1Title, desc: t.step1Desc, bg: 'from-blue-500 to-indigo-600', number: 1 },
                { icon: MapPin, title: t.step2Title, desc: t.step2Desc, bg: 'from-green-500 to-emerald-600', number: 2 },
                { icon: Bell, title: t.step3Title, desc: t.step3Desc, bg: 'from-orange-500 to-red-600', number: 3 }
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-br ${step.bg} rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white border-0 shadow-sm">{step.number}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.featuresTitle}</h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">{t.featuresSubtitle}</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { icon: TrendingUp, title: t.feature1Title, desc: t.feature1Desc, color: 'text-blue-600 dark:text-blue-400' },
                { icon: Users, title: t.feature2Title, desc: t.feature2Desc, color: 'text-green-600 dark:text-green-400' },
                { icon: Shield, title: t.feature3Title, desc: t.feature3Desc, color: 'text-orange-600 dark:text-orange-400' },
                { icon: Smartphone, title: t.feature4Title, desc: t.feature4Desc, color: 'text-purple-600 dark:text-purple-400' }
              ].map((feature, idx) => (
                <Card key={idx} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.testimonialsTitle}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { quote: t.testimonial1, author: t.testimonial1Author, role: t.testimonial1Role, initial: 'S', colors: 'from-blue-400 to-blue-600' },
                { quote: t.testimonial2, author: t.testimonial2Author, role: t.testimonial2Role, initial: 'D', colors: 'from-green-400 to-green-600' },
                { quote: t.testimonial3, author: t.testimonial3Author, role: t.testimonial3Role, initial: 'F', colors: 'from-orange-400 to-orange-600' }
              ].map((testimonial, idx) => (
                <Card key={idx} className="border-0 shadow-lg bg-white dark:bg-slate-800 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-900 dark:text-white mb-6 italic text-sm sm:text-base">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.colors} rounded-full flex items-center justify-center text-white mr-4 shadow-sm`}>
                        {testimonial.initial}
                      </div>
                      <div>
                        <div className="text-slate-900 dark:text-white font-medium">{testimonial.author}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 sm:py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.trustTitle}</h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-12">{t.trustSubtitle}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 items-center">
              {['City of Toronto', 'Vancouver Metro', 'Calgary', 'Ottawa'].map((city, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-6 h-20 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t.ctaTitle}</h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">{t.ctaSubtitle}</p>
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <ArrowRight className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {t.ctaButton}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">FixIt</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.footerText}</p>
                </div>
              </div>
              
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.privacy}</a>
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.terms}</a>
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.contact}</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}