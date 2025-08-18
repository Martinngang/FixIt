import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent } from './ui/card'
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
  ChevronDown,
  Zap,
  Heart,
  Download,
  MessageCircle,
  Eye,
  Smartphone
} from 'lucide-react'

const translations = {
  en: {
    features: 'Features',
    howItWorks: 'How it Works',
    testimonials: 'Testimonials',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    toggleTheme: 'Toggle theme',
    heroTagline: 'Speak Up. Report Issues. Fix Your City.',
    heroSubtitle: 'Empower your community by reporting local issues. Connect with authorities and track progress in real-time with our AI-powered civic platform.',
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
    howItWorksSubtitle: 'Reporting community issues has never been easier with our streamlined process',
    step1Title: 'Snap a Photo',
    step1Desc: 'Take a photo of the issue you want to report using our smart camera',
    step2Title: 'Submit with Location',
    step2Desc: 'Add details and location using GPS or manual entry for precise tracking',
    step3Title: 'Get Updates',
    step3Desc: 'Track progress and receive real-time notifications on resolution status',
    featuresTitle: 'Why Choose FixIt?',
    featuresSubtitle: 'Built for communities, trusted by authorities, designed for impact',
    feature1Title: 'Real-time Tracking',
    feature1Desc: 'Monitor your reports from submission to resolution with live updates',
    feature2Title: 'Community Driven',
    feature2Desc: 'Vote on issues and see what matters most to your neighbors',
    feature3Title: 'Official Integration',
    feature3Desc: 'Direct connection with local authorities and service providers',
    feature4Title: 'Mobile Optimized',
    feature4Desc: 'Report issues anywhere with our responsive mobile-first design',
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
    footerText: '© 2025 FixIt. Making communities better, one issue at a time.',
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
    heroSubtitle: 'Renforcez votre communauté en signalant les problèmes locaux. Connectez-vous avec les autorités et suivez les progrès en temps réel avec notre plateforme civique alimentée par l’IA.',
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
    howItWorksSubtitle: 'Signaler les problèmes communautaires n\'a jamais été aussi facile avec notre processus simplifié',
    step1Title: 'Prenez une photo',
    step1Desc: 'Prenez une photo du problème que vous voulez signaler avec notre caméra intelligente',
    step2Title: 'Soumettez avec localisation',
    step2Desc: 'Ajoutez des détails et la localisation via GPS ou saisie manuelle pour un suivi précis',
    step3Title: 'Recevez des mises à jour',
    step3Desc: 'Suivez les progrès et recevez des notifications en temps réel sur l\'état de la résolution',
    featuresTitle: 'Pourquoi choisir FixIt ?',
    featuresSubtitle: 'Conçu pour les communautés, approuvé par les autorités, conçu pour avoir un impact',
    feature1Title: 'Suivi en temps réel',
    feature1Desc: 'Surveillez vos rapports de la soumission à la résolution avec des mises à jour en direct',
    feature2Title: 'Piloté par la communauté',
    feature2Desc: 'Votez sur les problèmes et voyez ce qui importe le plus à vos voisins',
    feature3Title: 'Intégration officielle',
    feature3Desc: 'Connexion directe avec les autorités locales et les fournisseurs de services',
    feature4Title: 'Optimisé pour mobile',
    feature4Desc: 'Signalez les problèmes n\'importe où avec notre conception mobile-first responsive',
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
    footerText: '© 2025 FixIt. Améliorer les communautés, un problème à la fois.',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
    contact: 'Nous contacter'
  }
}

interface LandingPageProps {
  language: 'en' | 'fr'
  setLanguage: (lang: 'en' | 'fr') => void
  onGetStarted: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

export function LandingPage({ language, setLanguage, onGetStarted, isDarkMode, toggleTheme }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const t = translations[language]

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Update active section
      const sections = ['hero', 'features', 'how-it-works', 'testimonials', 'trust']
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      setActiveSection(current || '')
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setMobileMenuOpen(false)
    }
  }

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm lg:text-base xl:text-lg font-medium transition-all duration-300 rounded-lg hover:bg-background/80 ${
        activeSection === href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
      } min-h-[48px]`}
    >
      {children}
      {activeSection === href && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
      )}
    </button>
  )

  return (
    <>
      <style>{`
        :root { --background: #F8FAFC; --foreground: #1E293B; --card: #FFFFFF; --muted-foreground: #64748B; --primary: #2563EB; --border: #E2E8F0; --muted: #F1F5F9; }
        .dark { --background: #0F172A; --foreground: #F1F5F9; --card: #1E293B; --muted-foreground: #94A3B8; --primary: #3B82F6; --border: #334155; --muted: #1E293B; }
        html { scroll-behavior: smooth; }
        body { background-color: var(--background); color: var(--foreground); transition: background-color 0.3s ease, color 0.3s ease; }
        a:focus-visible, button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
      `}</style>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Background patterns */}
        <div className="fixed inset-0 opacity-40 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-green-400 to-blue-400 dark:from-green-500 dark:to-blue-500 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Enhanced Navigation */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg' 
            : 'bg-transparent'
        }`}>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Enhanced Logo */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <CheckCircle className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    FixIt
                  </h1>
                  <p className="text-xs lg:text-sm text-muted-foreground font-medium hidden sm:block">Civic Solutions</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8 xl:space-x-12 2xl:space-x-16">
                <NavLink href="features" onClick={() => scrollToSection('features')}>
                  {t.features}
                </NavLink>
                <NavLink href="how-it-works" onClick={() => scrollToSection('how-it-works')}>
                  {t.howItWorks}
                </NavLink>
                <NavLink href="testimonials" onClick={() => scrollToSection('testimonials')}>
                  {t.testimonials}
                </NavLink>
              </div>
              
              {/* Right Controls */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Theme Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleTheme}
                  className="p-3 lg:p-4 rounded-xl hover:bg-background/80 transition-all duration-300 min-w-[48px] min-h-[48px]"
                  title={t.toggleTheme}
                >
                  {isDarkMode ? 
                    <Sun className="h-5 w-5 lg:h-6 lg:w-6 text-orange-400 dark:text-orange-300" /> : 
                    <Moon className="h-5 w-5 lg:h-6 lg:w-6 text-slate-600 dark:text-slate-400" />
                  }
                </Button>
                
                {/* Language Selector */}
                <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                  <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-background/80 rounded-xl p-3 lg:p-4 min-w-[48px] min-h-[48px]">
                    <Globe className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-foreground" />
                    <span className="text-sm lg:text-base font-medium hidden sm:inline">{language.toUpperCase()}</span>
                    <ChevronDown className="h-4 w-4 lg:h-5 lg:w-5 ml-1" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-2xl bg-card">
                    <SelectItem value="en" className="rounded-lg">🇺🇸 English</SelectItem>
                    <SelectItem value="fr" className="rounded-lg">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={onGetStarted}
                    className="rounded-xl border-2 border-border text-sm lg:text-base xl:text-lg px-4 lg:px-6 py-2 lg:py-3 hover:bg-background/80 transition-all duration-300 min-w-[80px] min-h-[48px]"
                  >
                    {t.signIn}
                  </Button>
                  <Button 
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm lg:text-base xl:text-lg px-4 lg:px-6 py-2 lg:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[100px] min-h-[48px]"
                  >
                    {t.getStarted}
                  </Button>
                </div>
                
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-3 lg:p-4 rounded-xl min-w-[48px] min-h-[48px]"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6 lg:h-7 lg:w-7 text-foreground" /> : <Menu className="h-6 w-6 lg:h-7 lg:w-7 text-foreground" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-2xl">
              <div className="px-4 py-6 space-y-4">
                {['features', 'how-it-works', 'testimonials'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="block w-full text-left py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-base lg:text-lg capitalize min-h-[48px]"
                  >
                    {t[section as keyof typeof t]}
                  </button>
                ))}
                <div className="pt-4 border-t border-border space-y-3">
                  <Button onClick={onGetStarted} variant="outline" className="w-full rounded-xl text-base lg:text-lg py-3 lg:py-4 border-border min-h-[48px]">
                    {t.signIn}
                  </Button>
                  <Button 
                    onClick={onGetStarted} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-base lg:text-lg py-3 lg:py-4 min-h-[48px]"
                  >
                    {t.getStarted}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Enhanced Hero Section */}
        <section id="hero" className="relative pt-24 lg:pt-32 xl:pt-40 pb-16 lg:pb-24 xl:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-green-900/20 opacity-50"></div>
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 2xl:gap-20 lg:items-center">
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* Enhanced Badge */}
                <Badge className="mb-6 lg:mb-8 xl:mb-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 px-4 py-2 rounded-full text-sm lg:text-base font-semibold shadow-lg">
                  <Award className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  {t.activeCommunities}
                </Badge>
                
                {/* Enhanced Headlines */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight mb-6 lg:mb-8 xl:mb-10 tracking-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                    {t.heroTagline.split('.')[0]}.
                  </span>
                  <br />
                  <span className="text-foreground">{t.heroTagline.split('.')[1]}.</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {t.heroTagline.split('.')[2]}.
                  </span>
                </h1>
                
                <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-8 lg:mb-12 xl:mb-16 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {t.heroSubtitle}
                </p>
                
                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 xl:gap-8 justify-center lg:justify-start mb-12 lg:mb-16 xl:mb-20">
                  <Button 
                    onClick={onGetStarted}
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg lg:text-xl xl:text-2xl px-8 lg:px-10 xl:px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group min-h-[48px]"
                  >
                    <Camera className="w-6 h-6 lg:w-7 lg:h-7 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    {t.reportNow}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg lg:text-xl xl:text-2xl px-8 lg:px-10 xl:px-12 py-6 rounded-2xl border-2 border-border text-foreground hover:bg-background/80 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group min-h-[48px]"
                  >
                    <Play className="w-6 h-6 lg:w-7 lg:h-7 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    {t.watchDemo}
                  </Button>
                </div>
                
                {/* Enhanced Stats */}
                <div className="grid grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center lg:text-left">
                  {[
                    { number: '25,847', label: t.issuesReported, color: 'blue', icon: Camera },
                    { number: '21,203', label: t.issuesResolved, color: 'green', icon: CheckCircle },
                    { number: '500+', label: t.activeCommunities, color: 'purple', icon: Users }
                  ].map((stat, index) => (
                    <div key={index} className="group cursor-pointer min-w-0">
                      <div className={`flex items-center justify-center lg:justify-start mb-2 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                        <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-3xl lg:text-4xl xl:text-5xl font-bold group-hover:scale-105 transition-transform duration-300">
                          {stat.number}
                        </div>
                      </div>
                      <div className="text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Enhanced Phone Mockup */}
              <div className="mt-12 lg:mt-0 lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
                  {/* Phone Frame */}
                  <div className="relative w-full aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-[3rem] p-4 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden border border-border">
                      {/* Status Bar */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 lg:h-40 xl:h-48 relative">
                        <div className="absolute top-4 lg:top-6 left-4 right-4 flex justify-between items-center text-white text-sm lg:text-base xl:text-lg">
                          <div className="font-semibold">9:41 AM</div>
                          <div className="flex space-x-1 lg:space-x-1.5">
                            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-white rounded-full animate-pulse" />
                            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white text-xl lg:text-2xl xl:text-3xl font-bold">Report Issue</h3>
                          <p className="text-blue-100 dark:text-blue-200 text-sm lg:text-base xl:text-lg">Making cities better together</p>
                        </div>
                      </div>
                      
                      {/* App Content */}
                      <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 bg-background">
                        {/* Photo Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Camera className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                            </div>
                            <span className="text-sm lg:text-base xl:text-lg font-semibold text-foreground">{t.step1Title}</span>
                          </div>
                          <div className="bg-muted rounded-xl h-20 lg:h-24 xl:h-28 flex items-center justify-center">
                            <Eye className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {/* Location Section */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl p-4 border border-green-200 dark:border-green-700">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                            </div>
                            <span className="text-sm lg:text-base xl:text-lg font-semibold text-foreground">{t.step2Title}</span>
                          </div>
                          <div className="bg-muted rounded-xl h-16 lg:h-20 xl:h-24 flex items-center justify-center">
                            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse" />
                          </div>
                        </div>
                        
                        {/* Submit Button */}
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl text-base lg:text-lg xl:text-xl py-4 lg:py-5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-green-500 p-3 rounded-2xl shadow-xl animate-bounce">
                    <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div className="absolute top-1/2 -left-4 bg-blue-500 p-3 rounded-2xl shadow-xl animate-pulse">
                    <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-500 p-3 rounded-2xl shadow-xl animate-pulse">
                    <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Common Issues Section */}
        <section className="py-16 lg:py-24 xl:py-32 bg-background/80">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="text-center mb-12 lg:mb-16 xl:mb-20">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 lg:mb-8">
                {t.commonIssues}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Fix</span>
              </h2>
              <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto">
                {t.commonIssues.replace('Fix', '')}from infrastructure problems to environmental concerns
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 xl:gap-16">
              {[
                { 
                  icon: Car, 
                  title: t.roads, 
                  desc: t.roadsDesc,
                  color: 'orange',
                  bgFrom: 'from-orange-100',
                  bgTo: 'to-red-100',
                  bgFromDark: 'from-orange-900/30',
                  bgToDark: 'to-red-900/30'
                },
                { 
                  icon: Lightbulb, 
                  title: t.lighting, 
                  desc: t.lightingDesc,
                  color: 'yellow',
                  bgFrom: 'from-yellow-100',
                  bgTo: 'to-orange-100',
                  bgFromDark: 'from-yellow-900/30',
                  bgToDark: 'to-orange-900/30'
                },
                { 
                  icon: Trash2, 
                  title: t.waste, 
                  desc: t.wasteDesc,
                  color: 'green',
                  bgFrom: 'from-green-100',
                  bgTo: 'to-blue-100',
                  bgFromDark: 'from-green-900/30',
                  bgToDark: 'to-blue-900/30'
                },
                { 
                  icon: CloudRain, 
                  title: t.drainage, 
                  desc: t.drainageDesc,
                  color: 'blue',
                  bgFrom: 'from-blue-100',
                  bgTo: 'to-purple-100',
                  bgFromDark: 'from-blue-900/30',
                  bgToDark: 'to-purple-900/30'
                }
              ].map((issue, index) => (
                <Card key={index} className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 lg:p-8 xl:p-10 text-center">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${issue.bgFrom} ${issue.bgTo} dark:${issue.bgFromDark} dark:${issue.bgToDark} rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-${issue.color}-200 dark:border-${issue.color}-700`}>
                      <issue.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground mb-3 lg:mb-4 group-hover:text-primary transition-colors duration-300">
                      {issue.title}
                    </h3>
                    <p className="text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed">
                      {issue.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced How it Works Section */}
        <section id="how-it-works" className="py-16 lg:py-24 xl:py-32 bg-background">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="text-center mb-12 lg:mb-16 xl:mb-20">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 lg:mb-8">
                {t.howItWorksTitle}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> FixIt</span>
              </h2>
              <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto">
                {t.howItWorksSubtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 xl:gap-20 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-24 lg:top-28 xl:top-32 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-700 dark:via-purple-700 dark:to-green-700" />
              
              {[
                {
                  icon: Camera,
                  title: t.step1Title,
                  desc: t.step1Desc,
                  color: 'blue',
                  step: '01'
                },
                {
                  icon: MapPin,
                  title: t.step2Title,
                  desc: t.step2Desc,
                  color: 'purple',
                  step: '02'
                },
                {
                  icon: Bell,
                  title: t.step3Title,
                  desc: t.step3Desc,
                  color: 'green',
                  step: '03'
                }
              ].map((step, index) => (
                <div key={index} className="text-center relative min-w-0">
                  <div className="relative inline-block mb-6 lg:mb-8">
                    <div className={`w-24 h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-gradient-to-br from-${step.color}-100 to-${step.color}-200 dark:from-${step.color}-900/30 dark:to-${step.color}-800/30 rounded-3xl flex items-center justify-center mx-auto shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-500 border border-${step.color}-200 dark:border-${step.color}-700`}>
                      <step.icon className={`w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 text-${step.color}-600 dark:text-${step.color}-400`} />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 lg:w-10 lg:h-10 bg-${step.color}-600 text-white text-sm lg:text-base font-bold rounded-full flex items-center justify-center shadow-lg`}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-foreground mb-3 lg:mb-4">{step.title}</h3>
                  <p className="text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Additional CTA */}
            <div className="text-center mt-12 lg:mt-16 xl:mt-20">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg lg:text-xl xl:text-2xl px-8 lg:px-10 xl:px-12 py-4 lg:py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[48px]"
              >
                <Smartphone className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                {t.ctaButton}
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-16 lg:py-24 xl:py-32 bg-background/80">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="text-center mb-12 lg:mb-16 xl:mb-20">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 lg:mb-8">
                {t.featuresTitle}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> FixIt?</span>
              </h2>
              <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto">
                {t.featuresSubtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 xl:gap-16">
              {[
                {
                  icon: TrendingUp,
                  title: t.feature1Title,
                  desc: t.feature1Desc,
                  color: 'blue'
                },
                {
                  icon: Users,
                  title: t.feature2Title,
                  desc: t.feature2Desc,
                  color: 'green'
                },
                {
                  icon: Shield,
                  title: t.feature3Title,
                  desc: t.feature3Desc,
                  color: 'orange'
                },
                {
                  icon: Smartphone,
                  title: t.feature4Title,
                  desc: t.feature4Desc,
                  color: 'purple'
                }
              ].map((feature, index) => (
                <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-card/90 backdrop-blur-sm">
                  <CardContent className="p-6 lg:p-8 xl:p-10 text-center h-full flex flex-col">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 dark:from-${feature.color}-900/30 dark:to-${feature.color}-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-${feature.color}-200 dark:border-${feature.color}-700`}>
                      <feature.icon className={`w-8 h-8 lg:w-10 lg:h-10 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                    </div>
                    <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground mb-3 lg:mb-4 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed mt-auto">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section id="testimonials" className="py-16 lg:py-24 xl:py-32 bg-background">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="text-center mb-12 lg:mb-16 xl:mb-20">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 lg:mb-8">
                {t.testimonialsTitle}
              </h2>
              <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Hear from citizens and officials who transformed their communities with FixIt
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
              {[
                {
                  quote: t.testimonial1,
                  author: t.testimonial1Author,
                  role: t.testimonial1Role,
                  color: 'blue',
                  initial: 'S'
                },
                {
                  quote: t.testimonial2,
                  author: t.testimonial2Author,
                  role: t.testimonial2Role,
                  color: 'green',
                  initial: 'D'
                },
                {
                  quote: t.testimonial3,
                  author: t.testimonial3Author,
                  role: t.testimonial3Role,
                  color: 'purple',
                  initial: 'F'
                }
              ].map((testimonial, index) => (
                <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-card/90 backdrop-blur-sm">
                  <CardContent className="p-6 lg:p-8 xl:p-10">
                    <div className="flex items-center mb-4 lg:mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-yellow-400 dark:text-yellow-300 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm lg:text-base xl:text-lg text-foreground mb-6 lg:mb-8 italic leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-${testimonial.color}-400 to-${testimonial.color}-600 rounded-full flex items-center justify-center text-white text-base lg:text-lg xl:text-xl mr-4 lg:mr-5 xl:mr-6`}>
                        {testimonial.initial}
                      </div>
                      <div>
                        <div className="text-foreground font-medium text-base lg:text-lg xl:text-xl">{testimonial.author}</div>
                        <div className="text-sm lg:text-base xl:text-lg text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Trust Section */}
        <section id="trust" className="py-16 lg:py-24 xl:py-32 bg-background/80">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 text-center">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 lg:mb-8">
              {t.trustTitle}
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-12 lg:mb-16 xl:mb-20 max-w-2xl mx-auto">
              {t.trustSubtitle}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-12 xl:gap-16 opacity-70 dark:opacity-80">
              {[
                'Global Cities',
                'Vancouver Metro',
                'Calgary',
                'Ottawa'
              ].map((city, index) => (
                <div key={index} className="bg-muted rounded-2xl p-6 lg:p-8 h-24 lg:h-32 flex items-center justify-center transition-all duration-300 hover:bg-muted/80 hover:shadow-lg">
                  <span className="text-sm lg:text-base xl:text-lg text-muted-foreground font-medium text-center">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 lg:py-24 xl:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 text-center">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 lg:mb-8 tracking-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-blue-100 dark:text-blue-200 mb-12 lg:mb-16 max-w-2xl mx-auto">
              {t.ctaSubtitle}
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-100 text-lg lg:text-xl xl:text-2xl px-8 lg:px-10 xl:px-12 py-4 lg:py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[48px]"
            >
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
              {t.ctaButton}
            </Button>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="bg-card border-t border-border text-foreground py-8 lg:py-12 xl:py-16">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FixIt</h3>
                  <p className="text-sm lg:text-base xl:text-lg text-muted-foreground">{t.footerText}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-4 lg:gap-8 xl:gap-10 text-sm lg:text-base xl:text-lg">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.privacy}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.terms}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.contact}</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}