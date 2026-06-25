import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "./ui/button.tsx"
import { Badge } from "./ui/badge.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select.tsx"
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
  Zap,
  Eye,
  Smartphone,
  Sparkles,
  Scan,
  Mic,
  WifiOff,
  MessageSquare,
  Trophy,
  Box,
  Store
} from 'lucide-react'

const translations = {
  en: {
    features: 'Features',
    howItWorks: 'How it Works',
    testimonials: 'Testimonials',
    openData: 'Open Data',
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
    commonIssues: 'Common Issues We Help ',
    roads: 'Road Issues',
    roadsDesc: 'Potholes, damaged roads, missing signs',
    lighting: 'Street Lighting',
    lightingDesc: 'Broken lights, dark areas, safety concerns',
    waste: 'Waste Management',
    wasteDesc: 'Overflowing bins, illegal dumping, collection issues',
    drainage: 'Drainage Problems',
    drainageDesc: 'Flooding, blocked drains, poor drainage',
    howItWorksTitle: 'How CIRT Works',
    howItWorksSubtitle: 'Reporting community issues has never been easier with our streamlined process',
    step1Title: 'Snap a Photo',
    step1Desc: 'Take a photo of the issue you want to report using our smart camera',
    step2Title: 'Submit with Location',
    step2Desc: 'Add details and location using GPS or manual entry for precise tracking',
    step3Title: 'Get Updates',
    step3Desc: 'Track progress and receive real-time notifications on resolution status',
    addonsTitle: 'Packed With Powerful Features',
    addonsSubtitle: 'CIRT goes beyond simple reporting with AI, AR, and community tools built for real impact',
    addon1Title: 'AI-Powered Categorization',
    addon1Desc: 'Our AI instantly reads your report, assigns the right category and priority, and flags urgent issues for faster action',
    addon2Title: 'AR Camera Capture',
    addon2Desc: 'Point your camera and pin the exact spot with live GPS, compass, and nearby-issue overlays in augmented reality',
    addon3Title: 'Voice Reporting',
    addon3Desc: 'Describe the problem out loud and let our voice assistant fill in the report for you',
    addon4Title: 'Works Offline',
    addon4Desc: 'No signal, no problem — reports are saved on your device and sync automatically once you reconnect',
    addon5Title: 'Community Ideas Board',
    addon5Desc: 'Propose improvements, vote on ideas, and follow them from suggestion to completion',
    addon6Title: 'Leaderboards & Badges',
    addon6Desc: 'Earn points for reporting, volunteering, and upvoting — climb the leaderboard and unlock badges',
    addon7Title: 'Open Data & 3D City Map',
    addon7Desc: 'Explore an interactive 3D map of city issues and access live civic data through our public API',
    addon8Title: 'Contractor Marketplace',
    addon8Desc: 'Verified local pros can browse, claim, and get paid for city maintenance jobs',
    featuresTitle: 'Why Choose ',
    featuresSubtitle: 'Built for communities, trusted by authorities, designed for impact',
    feature1Title: 'Real-time Tracking',
    feature1Desc: 'Monitor your reports from submission to resolution with live updates',
    feature2Title: 'Community Driven',
    feature2Desc: 'Vote on issues, propose ideas, and climb the leaderboard with your neighbors',
    feature3Title: 'Official Integration',
    feature3Desc: 'Direct connection with local authorities and service providers',
    feature4Title: 'Mobile Optimized',
    feature4Desc: 'Report issues anywhere with our responsive mobile-first design',
    testimonialsTitle: 'What Our Community Says',
    testimonial1: '"CIRT helped me report a dangerous pothole that was fixed within a week. Amazing response time!"',
    testimonial1Author: 'Sarah Johnson',
    testimonial1Role: 'Community Member',
    testimonial2: '"As a city official, CIRT has streamlined our issue tracking and improved citizen engagement significantly."',
    testimonial2Author: 'Mayor David Chen',
    testimonial2Role: 'City of Toronto',
    testimonial3: '"The app is so easy to use. I\'ve reported several issues in my neighborhood and they all got resolved."',
    testimonial3Author: 'Fatima Al-Rashid',
    testimonial3Role: 'Resident',
    trustTitle: 'Trusted by Cities Across the Globe',
    trustSubtitle: 'Join thousands of communities already using CIRT',
    ctaTitle: 'Ready to Fix Your City?',
    ctaSubtitle: 'Join thousands of citizens making their communities better',
    ctaButton: 'Start Reporting Issues',
    footerText: '© 2025 CIRT. Making communities better, one issue at a time.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact Us'
  },
  fr: {
    features: 'Fonctionnalités',
    howItWorks: 'Comment ça marche',
    testimonials: 'Témoignages',
    openData: 'Données ouvertes',
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
    howItWorksTitle: 'Comment fonctionne',
    howItWorksSubtitle: 'Signaler les problèmes communautaires n\'a jamais été aussi facile avec notre processus simplifié',
    step1Title: 'Prenez une photo',
    step1Desc: 'Prenez une photo du problème que vous voulez signaler avec notre caméra intelligente',
    step2Title: 'Soumettez avec localisation',
    step2Desc: 'Ajoutez des détails et la localisation via GPS ou saisie manuelle pour un suivi précis',
    step3Title: 'Recevez des mises à jour',
    step3Desc: 'Suivez les progrès et recevez des notifications en temps réel sur l\'état de la résolution',
    addonsTitle: 'Une Plateforme Riche en Fonctionnalités',
    addonsSubtitle: 'CIRT va au-delà du simple signalement grâce à l\'IA, la réalité augmentée et des outils communautaires conçus pour un impact réel',
    addon1Title: 'Catégorisation par IA',
    addon1Desc: 'Notre IA analyse instantanément votre signalement, lui attribue la bonne catégorie et priorité, et signale les urgences pour une action plus rapide',
    addon2Title: 'Capture par caméra AR',
    addon2Desc: 'Visez avec votre caméra et localisez précisément le problème grâce au GPS, à la boussole et aux signalements à proximité en réalité augmentée',
    addon3Title: 'Signalement vocal',
    addon3Desc: 'Décrivez le problème à voix haute et laissez notre assistant vocal remplir le rapport pour vous',
    addon4Title: 'Fonctionne hors ligne',
    addon4Desc: 'Pas de signal, pas de problème : vos signalements sont enregistrés sur votre appareil et synchronisés automatiquement dès la reconnexion',
    addon5Title: 'Espace idées communautaires',
    addon5Desc: 'Proposez des améliorations, votez pour les idées et suivez leur évolution jusqu\'à leur réalisation',
    addon6Title: 'Classements et badges',
    addon6Desc: 'Gagnez des points en signalant, en votant et en faisant du bénévolat — grimpez au classement et débloquez des badges',
    addon7Title: 'Données ouvertes et carte 3D',
    addon7Desc: 'Explorez une carte 3D interactive des problèmes de la ville et accédez aux données civiques via notre API publique',
    addon8Title: 'Marché pour prestataires',
    addon8Desc: 'Les prestataires locaux vérifiés peuvent parcourir, accepter et être payés pour des travaux de maintenance municipale',
    featuresTitle: 'Pourquoi choisir',
    featuresSubtitle: 'Conçu pour les communautés, approuvé par les autorités, conçu pour avoir un impact',
    feature1Title: 'Suivi en temps réel',
    feature1Desc: 'Surveillez vos rapports de la soumission à la résolution avec des mises à jour en direct',
    feature2Title: 'Piloté par la communauté',
    feature2Desc: 'Votez sur les problèmes, proposez des idées et grimpez au classement avec vos voisins',
    feature3Title: 'Intégration officielle',
    feature3Desc: 'Connexion directe avec les autorités locales et les fournisseurs de services',
    feature4Title: 'Optimisé pour mobile',
    feature4Desc: 'Signalez les problèmes n\'importe où avec notre conception mobile-first responsive',
    testimonialsTitle: 'Ce que dit notre communauté',
    testimonial1: '"CIRT m\'a aidé à signaler un nid-de-poule dangereux qui a été réparé en une semaine. Temps de réponse incroyable !"',
    testimonial1Author: 'Sarah Johnson',
    testimonial1Role: 'Membre de la communauté',
    testimonial2: '"En tant qu\'officiel municipal, CIRT a rationalisé notre suivi des problèmes et amélioré l\'engagement citoyen significativement."',
    testimonial2Author: 'Maire David Chen',
    testimonial2Role: 'Ville de Toronto',
    testimonial3: '"L\'application est si facile à utiliser. J\'ai signalé plusieurs problèmes dans mon quartier et ils ont tous été résolus."',
    testimonial3Author: 'Fatima Al-Rashid',
    testimonial3Role: 'Résidente',
    trustTitle: 'Approuvé par les villes du monde entier',
    trustSubtitle: 'Rejoignez des milliers de communautés utilisant déjà CIRT',
    ctaTitle: 'Prêt à réparer votre ville ?',
    ctaSubtitle: 'Rejoignez des milliers de citoyens qui améliorent leurs communautés',
    ctaButton: 'Commencer à signaler des problèmes',
    footerText: '© 2025 CIRT. Améliorer les communautés, un problème à la fois.',
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
      className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-300 rounded-full ${
        activeSection === href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">
      {/* Background ambience */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl opacity-40 animate-float pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl opacity-30 animate-float animation-delay-300 pointer-events-none" />

        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'glass-nav shadow-lg' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo */}
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow transition-transform duration-300 group-hover:scale-110">
                  <img src="/logo.svg" alt="" className="h-6 w-6 lg:h-7 lg:w-7" />
                </div>
                <div>
                  <h1 className="font-display text-xl lg:text-2xl font-bold text-gradient">CIRT</h1>
                  <p className="text-xs lg:text-sm text-muted-foreground font-medium hidden sm:block">Civic Solutions</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <NavLink href="features" onClick={() => scrollToSection('features')}>
                  {t.features}
                </NavLink>
                <NavLink href="how-it-works" onClick={() => scrollToSection('how-it-works')}>
                  {t.howItWorks}
                </NavLink>
                <NavLink href="testimonials" onClick={() => scrollToSection('testimonials')}>
                  {t.testimonials}
                </NavLink>
                <Link
                  to="/open-data"
                  className="relative px-4 py-2 text-sm lg:text-base font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
                >
                  {t.openData}
                </Link>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground"
                  title={t.toggleTheme}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Language Selector */}
                <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                  <SelectTrigger className="w-auto gap-1.5 border-transparent bg-transparent hover:bg-muted/60">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">{language.toUpperCase()}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>

                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                  <Button variant="outline" onClick={onGetStarted}>
                    {t.signIn}
                  </Button>
                  <Button onClick={onGetStarted} className="group">
                    {t.getStarted}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden glass-card mx-4 mt-2 rounded-2xl shadow-xl border border-border animate-scale-in">
              <div className="px-4 py-4 space-y-1">
                {[
                  { id: 'features', label: t.features },
                  { id: 'how-it-works', label: t.howItWorks },
                  { id: 'testimonials', label: t.testimonials }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
                  >
                    {item.label}
                  </button>
                ))}
                <Link
                  to="/open-data"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
                >
                  {t.openData}
                </Link>
                <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
                  <Button onClick={onGetStarted} variant="outline" className="w-full">
                    {t.signIn}
                  </Button>
                  <Button onClick={onGetStarted} className="w-full">
                    {t.getStarted}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section id="hero" className="relative pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
              <div className="lg:col-span-7 text-center lg:text-left animate-fade-in-up">
                {/* Badge */}
                <Badge className="mb-6 gap-1.5 border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                  <Award className="w-3.5 h-3.5" />
                  {t.activeCommunities}
                </Badge>

                {/* Headline */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                  <span className="text-gradient">{t.heroTagline.split('.')[0]}.</span>
                  <br />
                  <span className="text-foreground">{t.heroTagline.split('.')[1]}.</span>
                  <br />
                  <span className="text-gradient">{t.heroTagline.split('.')[2]}.</span>
                </h1>

                <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {t.heroSubtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-12">
                  <Button onClick={onGetStarted} size="lg" className="group text-base lg:text-lg">
                    <Camera className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                    {t.reportNow}
                  </Button>
                  <Button variant="outline" size="lg" className="group text-base lg:text-lg">
                    <Play className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    {t.watchDemo}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 lg:gap-10 text-center lg:text-left">
                  {[
                    { number: '25,847', label: t.issuesReported, icon: Camera, color: 'text-brand-500' },
                    { number: '21,203', label: t.issuesResolved, icon: CheckCircle, color: 'text-success' },
                    { number: '500+', label: t.activeCommunities, icon: Users, color: 'text-info' }
                  ].map((stat, index) => (
                    <div key={index} className="group cursor-pointer min-w-0">
                      <div className={`flex items-center justify-center lg:justify-start gap-2 mb-1 ${stat.color}`}>
                        <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:scale-110" />
                        <div className="font-display text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground">
                          {stat.number}
                        </div>
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="mt-12 lg:mt-0 lg:col-span-5 flex justify-center lg:justify-end animate-fade-in-up animation-delay-300">
                <div className="relative w-full max-w-sm">
                  <div className="relative w-full aspect-[9/16] glass-card rounded-[2.5rem] p-3 shadow-2xl">
                    <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden border border-border">
                      {/* Status Bar */}
                      <div className="bg-gradient-brand h-32 relative">
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white text-sm">
                          <div className="font-semibold">9:41 AM</div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="font-display text-white text-xl font-bold">Report Issue</h3>
                          <p className="text-white/80 text-sm">Making cities better together</p>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="p-5 space-y-4 bg-background">
                        {/* Photo Section */}
                        <div className="rounded-2xl border border-border bg-muted/50 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-info/15 flex items-center justify-center">
                              <Camera className="w-4 h-4 text-info" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{t.step1Title}</span>
                          </div>
                          <div className="bg-muted rounded-xl h-20 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Location Section */}
                        <div className="rounded-2xl border border-border bg-muted/50 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-success" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{t.step2Title}</span>
                          </div>
                          <div className="bg-muted rounded-xl h-16 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button className="w-full">Submit Report</Button>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-success p-3 rounded-2xl shadow-xl animate-float">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -left-4 bg-info p-3 rounded-2xl shadow-xl animate-float animation-delay-150">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-brand p-3 rounded-2xl shadow-xl animate-float animation-delay-300">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Issues Section */}
        <section className="relative py-16 lg:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {t.commonIssues}<span className="text-gradient"> Fix</span>
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.commonIssues.replace('Fix', '')}from infrastructure problems to environmental concerns
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { icon: Car, title: t.roads, desc: t.roadsDesc, badge: 'bg-warning/15 text-warning' },
                { icon: Lightbulb, title: t.lighting, desc: t.lightingDesc, badge: 'bg-info/15 text-info' },
                { icon: Trash2, title: t.waste, desc: t.wasteDesc, badge: 'bg-success/15 text-success' },
                { icon: CloudRain, title: t.drainage, desc: t.drainageDesc, badge: 'bg-gradient-brand text-white' }
              ].map((issue, index) => (
                <Card key={index} className="group hover:shadow-glow hover:-translate-y-1">
                  <CardContent className="p-6 lg:p-8 text-center">
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${issue.badge}`}>
                      <issue.icon className="w-7 h-7 lg:w-8 lg:h-8" />
                    </div>
                    <h3 className="font-display text-lg lg:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {issue.title}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      {issue.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="relative py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {t.howItWorksTitle}<span className="text-gradient"> CIRT</span>
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.howItWorksSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-12 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-brand opacity-30" />

              {[
                { icon: Camera, title: t.step1Title, desc: t.step1Desc, badge: 'bg-info/15 text-info', step: '01' },
                { icon: MapPin, title: t.step2Title, desc: t.step2Desc, badge: 'bg-success/15 text-success', step: '02' },
                { icon: Bell, title: t.step3Title, desc: t.step3Desc, badge: 'bg-gradient-brand text-white', step: '03' }
              ].map((step, index) => (
                <div key={index} className="text-center relative min-w-0">
                  <div className="relative inline-block mb-3 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 hover:scale-110 hover:rotate-3 ${step.badge}`}>
                      <step.icon className="w-5 h-5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" />
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-8 sm:h-8 bg-card border border-border text-foreground text-[10px] sm:text-sm font-bold rounded-full flex items-center justify-center shadow-md">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-display text-sm sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-3">{step.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Additional CTA */}
            <div className="text-center mt-12 lg:mt-16">
              <Button onClick={onGetStarted} size="lg" className="text-base lg:text-lg">
                <Smartphone className="w-5 h-5" />
                {t.ctaButton}
              </Button>
            </div>
          </div>
        </section>

        {/* Add-on Capabilities Section */}
        <section className="relative py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {t.addonsTitle}
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.addonsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Featured spotlight card - spans 2 columns so this grid doesn't
                  read as 8 identical tiles in a row, unlike the other grids. */}
              <Card className="group col-span-2 hover:shadow-glow hover:-translate-y-1 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-brand opacity-90" />
                <CardContent className="relative p-6 lg:p-8 h-full flex flex-col sm:flex-row sm:items-center gap-4 text-white">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shrink-0 bg-white/15 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Sparkles className="w-7 h-7 lg:w-8 lg:h-8" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg lg:text-xl font-semibold mb-1">
                      {t.addon1Title}
                    </h3>
                    <p className="text-sm lg:text-base text-white/85 leading-relaxed">
                      {t.addon1Desc}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {[
                { icon: Scan, title: t.addon2Title, desc: t.addon2Desc, badge: 'bg-info/15 text-info' },
                { icon: Mic, title: t.addon3Title, desc: t.addon3Desc, badge: 'bg-success/15 text-success' },
                { icon: WifiOff, title: t.addon4Title, desc: t.addon4Desc, badge: 'bg-warning/15 text-warning' },
                { icon: MessageSquare, title: t.addon5Title, desc: t.addon5Desc, badge: 'bg-info/15 text-info' },
                { icon: Trophy, title: t.addon6Title, desc: t.addon6Desc, badge: 'bg-warning/15 text-warning' },
                { icon: Box, title: t.addon7Title, desc: t.addon7Desc, badge: 'bg-success/15 text-success' },
                { icon: Store, title: t.addon8Title, desc: t.addon8Desc, badge: 'bg-gradient-brand text-white' }
              ].map((item, index) => (
                <Card key={index} className="group hover:shadow-glow hover:-translate-y-1">
                  <CardContent className="p-6 lg:p-8 text-center h-full flex flex-col">
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${item.badge}`}>
                      <item.icon className="w-7 h-7 lg:w-8 lg:h-8" />
                    </div>
                    <h3 className="font-display text-lg lg:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mt-auto">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {t.featuresTitle}<span className="text-gradient"> CIRT?</span>
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.featuresSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { icon: TrendingUp, title: t.feature1Title, desc: t.feature1Desc, badge: 'bg-info/15 text-info' },
                { icon: Users, title: t.feature2Title, desc: t.feature2Desc, badge: 'bg-success/15 text-success' },
                { icon: Shield, title: t.feature3Title, desc: t.feature3Desc, badge: 'bg-warning/15 text-warning' },
                { icon: Smartphone, title: t.feature4Title, desc: t.feature4Desc, badge: 'bg-gradient-brand text-white' }
              ].map((feature, index) => (
                <Card key={index} className="group hover:shadow-glow hover:-translate-y-1">
                  <CardContent className="p-6 lg:p-8 text-center h-full flex flex-col">
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${feature.badge}`}>
                      <feature.icon className="w-7 h-7 lg:w-8 lg:h-8" />
                    </div>
                    <h3 className="font-display text-lg lg:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mt-auto">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative py-16 lg:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {t.testimonialsTitle}
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                Hear from citizens and officials who transformed their communities with CIRT
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[
                { quote: t.testimonial1, author: t.testimonial1Author, role: t.testimonial1Role, initial: 'S', badge: 'bg-gradient-brand' },
                { quote: t.testimonial2, author: t.testimonial2Author, role: t.testimonial2Role, initial: 'D', badge: 'bg-success' },
                { quote: t.testimonial3, author: t.testimonial3Author, role: t.testimonial3Role, initial: 'F', badge: 'bg-info' }
              ].map((testimonial, index) => (
                <Card key={index} className="group hover:shadow-glow hover:-translate-y-1">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-sm lg:text-base text-foreground mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${testimonial.badge}`}>
                        {testimonial.initial}
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="trust" className="relative py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
              {t.trustTitle}
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t.trustSubtitle}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                'Global Cities',
                'Vancouver Metro',
                'Calgary',
                'Ottawa'
              ].map((city, index) => (
                <div key={index} className="glass-card rounded-2xl p-6 lg:p-8 h-20 lg:h-24 flex items-center justify-center transition-all duration-300 hover:shadow-md">
                  <span className="text-sm lg:text-base text-muted-foreground font-medium text-center">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand bg-[length:200%_200%] animate-gradient-x" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-lg lg:text-xl text-white/85 mb-10 max-w-2xl mx-auto">
              {t.ctaSubtitle}
            </p>
            <Button
              onClick={onGetStarted}
              variant="secondary"
              size="lg"
              className="bg-white text-brand-600 hover:bg-white/90 hover:shadow-2xl hover:-translate-y-0.5 shadow-xl text-base lg:text-lg"
            >
              <ArrowRight className="w-5 h-5" />
              {t.ctaButton}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-border py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gradient">CIRT</h3>
                  <p className="text-sm text-muted-foreground">{t.footerText}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-end gap-4 lg:gap-8 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.privacy}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.terms}</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.contact}</a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  )
}