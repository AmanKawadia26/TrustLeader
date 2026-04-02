import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.categories": "Categories",
      "nav.about": "About",
      "nav.writeReview": "Write a review",
      "nav.searchPlaceholder": "Search for a company or category...",
      "nav.forBusinesses": "For businesses",
      "nav.login": "Log in",
      "nav.register": "Sign up",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Log out",

      "footer.tagline": "The trusted platform for authentic reviews. Helping consumers make confident decisions.",
      "footer.forConsumers": "For consumers",
      "footer.forBusinesses": "For businesses",
      "footer.company": "Company",
      "footer.copyright": "TrustLeader. All rights reserved.",
      
      "home.hero.title": "Trust built on transparency.",
      "home.hero.subtitle": "Discover businesses you can rely on with our traffic-light trust system.",
      "home.hero.search": "Search for a company or domain...",
      "home.hero.searchButton": "Search",
      "home.stats.reviews": "Verified reviews",
      "home.stats.businesses": "Businesses",
      "home.stats.checks": "Fraud checks",
      "home.stats.score": "Avg trust score",
      "home.cta.title": "Help millions make the right choice",
      "home.cta.subtitle":
        "Share your experience on TrustLeader, where reviews make a difference for shoppers and honest businesses.",
      "home.cta.loginSignup": "Log in or sign up",
      "home.cta.orContinue": "Or continue with",
      "home.cta.noAccount": "New here?",
      "home.featured": "Featured Businesses",
      "home.featured.resultsFor": "Results for \"{{q}}\"",
      "home.featured.emptyTitle": "No businesses found",
      "home.featured.emptyBody": "Try adjusting your search query.",
      "home.recent.title": "Recent reviews",
      "home.recent.hint": "A snapshot refreshed throughout the day",
      "home.recent.unavailable": "Recent reviews will appear when the API is available.",
      "home.pillReview": "Bought something recently? Write a review",
      "home.categories.title": "What are you looking for?",
      "home.categories.seemore": "See more",
      "home.promo.title": "Looking to grow your business? Strengthen your reputation with reviews on TrustLeader.",
      "home.promo.cta": "Get started",
      "home.bestIn.title": "Best in finance",
      "home.apiOffline":
        "The API server is not running or unreachable. Start the Go backend on port 8080 (DATABASE_URL required). Until then, lists stay empty.",
      "home.cat.bank": "Bank",
      "home.cat.travel": "Travel insurance",
      "home.cat.car": "Car dealer",
      "home.cat.furniture": "Furniture",
      "home.cat.jewelry": "Jewelry",
      "home.cat.clothing": "Clothing",
      "home.cat.tech": "Electronics",
      "home.cat.fitness": "Fitness",
      "footer.chooseCountry": "Choose country",
      
      "business.reviews": "Reviews",
      "business.writeReview": "Write a Review",
      "business.insurance": "Markel Guarantee Eligible",
      "business.insurance.desc": "Eligibility displayed for informational purposes only. See terms.",
      
      "review.submit": "Submit Review",
      "review.rating": "Rating",
      "review.text": "Tell us about your experience",
      "review.minChars": "Minimum 10 characters",
      "review.pending": "Pending Approval",
      "review.approved": "Approved",
      "review.rejected": "Rejected",
      "review.companyResponse": "Company Response",
      
      "auth.login.title": "Welcome back",
      "auth.login.email": "Email address",
      "auth.login.password": "Password",
      "auth.login.submit": "Sign in",
      "auth.register.title": "Create an account",
      "auth.register.titleBusiness": "Create a business account",
      "auth.register.subtitleConsumer": "Join to read and write reviews.",
      "auth.register.subtitleBusiness": "For companies claiming or managing a profile.",
      "auth.register.businessLink": "Business sign up",
      "auth.register.role": "I am a...",
      "auth.register.submit": "Sign up",
      
      "dash.company.title": "Company Dashboard",
      "dash.company.respond": "Respond to Review",
      "dash.consumer.title": "My Reviews",
      "dash.consumer.edit": "Edit Review",
      "dash.reseller.title": "Reseller Dashboard",
      "dash.reseller.referrals": "Total Referrals",
      "dash.reseller.earnings": "Total Earnings"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
