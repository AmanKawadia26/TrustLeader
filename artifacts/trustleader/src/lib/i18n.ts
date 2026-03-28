import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.login": "Log in",
      "nav.register": "Sign up",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Log out",
      
      "home.hero.title": "Trust built on transparency.",
      "home.hero.subtitle": "Discover businesses you can rely on with our traffic-light trust system.",
      "home.hero.search": "Search for a company or domain...",
      "home.featured": "Featured Businesses",
      
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
