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
      "nav.trafficSignals": "How signals work",

      "footer.tagline": "Clear reviews and insurer-backed context so you can choose businesses with confidence.",
      "footer.forConsumers": "For consumers",
      "footer.forBusinesses": "For businesses",
      "footer.company": "Company",
      "footer.copyright": "My Protector. All rights reserved.",
      
      "home.hero.title": "Protection starts with clarity.",
      "home.hero.subtitle": "Discover businesses you can rely on with our traffic-light trust system.",
      "home.hero.search": "Search for a company or domain...",
      "home.hero.searchButton": "Search",
      "home.stats.reviews": "Verified reviews",
      "home.stats.businesses": "Businesses",
      "home.stats.checks": "Fraud checks",
      "home.stats.score": "Avg trust score",
      "home.cta.title": "Help millions make the right choice",
      "home.cta.subtitle":
        "Share your experience on My Protector, where reviews make a difference for shoppers and honest businesses.",
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
      "home.promo.title": "Looking to grow your business? Strengthen your reputation with reviews on My Protector.",
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
      "footer.searchReviews": "Search reviews",
      "footer.browseCategories": "Browse categories",
      "footer.writeReview": "Write a review",
      "footer.claimProfile": "Claim your profile",
      "footer.businessSignup": "Business sign up",
      "footer.apiAccess": "API access",
      "footer.aboutUs": "About us",
      "footer.trustSafety": "Trust & safety",
      "footer.privacyTerms": "Privacy & terms",
      "footer.privacy": "Privacy",
      "footer.terms": "Terms",
      
      "business.reviews": "Reviews",
      "business.writeReview": "Write a Review",
      "business.insurance": "Markel Guarantee Eligible",
      "business.insurance.desc": "Eligibility displayed for informational purposes only. See terms.",
      "business.insuranceBanner": "Insurance-backed on My Protector",
      
      "review.submit": "Submit Review",
      "review.rating": "Rating",
      "review.text": "Tell us about your experience",
      "review.minChars": "Minimum 10 characters",
      "review.pending": "Pending Approval",
      "review.approved": "Approved",
      "review.rejected": "Rejected",
      "review.companyResponse": "Company Response",
      
      "auth.login.title": "Welcome back",
      "auth.login.subtitle": "Log in to your My Protector account",
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
      "dash.company.claimIntro": "Link your account to a business profile by entering its business ID (UUID from search or support).",
      "dash.company.claimPlaceholder": "Business ID (UUID)",
      "dash.company.claimSubmit": "Link business",
      "dash.company.claimHint": "Find a business in Search; the profile URL contains the ID. Your account must use the company role.",
      "dash.company.recentReviews": "Recent Reviews",
      "dash.company.reviewsAfterClaim": "Reviews for your business will appear here after you link a profile above.",
      "dash.company.reviewsUnavailable": "Reviews could not be loaded. Try again later.",
      "dash.company.loadError": "Could not load company profile.",
      "dash.consumer.title": "My Reviews",
      "dash.consumer.edit": "Edit Review",
      "dash.reseller.title": "Reseller Dashboard",
      "dash.reseller.referrals": "Total Referrals",
      "dash.reseller.earnings": "Total Earnings",

      "legal.privacy.title": "Privacy",
      "legal.privacy.body":
        "My Protector processes account and usage data to operate the platform and improve trust signals. For full details, contact your administrator or refer to the privacy policy published by your deployment.\n\nThis placeholder page is provided for navigation; replace with your jurisdiction-specific policy.",
      "legal.terms.title": "Terms of use",
      "legal.terms.body":
        "By using My Protector you agree to post accurate reviews and comply with applicable laws. Business accounts must represent the entity they claim.\n\nThis placeholder page is provided for navigation; replace with counsel-approved terms for your deployment.",
      "legal.developers.title": "API & developers",
      "legal.developers.body":
        "The HTTP API is documented via OpenAPI (see repository lib/api-spec/openapi.yaml). Authenticated requests use a Supabase JWT bearer token.\n\nFor integration details, see docs/FRONTEND_PARTNER.md in the project repository.",

      "about.hero.title": "Building trust in a noisy world.",
      "about.hero.lead":
        "My Protector helps people find honest, unfiltered information about businesses and pairs it with clear signals so you can decide with confidence.",
      "about.story.title": "Our story",
      "about.story.p1":
        "We started My Protector to bring clarity to online reviews: not just stars, but context and protection when insurers partner with us.",
      "about.story.p2":
        "Businesses can claim their profiles; listings may also come from data partners or consumer first reviews. Every listing shows how it was added.",
      "about.story.p3":
        "Our traffic-light system reflects aggregate ratings and insurer-backed status—so you see risk and protection at a glance.",
      "about.values.title": "What we stand for",
      "about.values.lead": "Principles that guide My Protector products and moderation.",

      "traffic.page.title": "How protector signals work",
      "traffic.page.intro":
        "Each business shows a green, orange, or red signal (HRS) based on verified reviews and insurer proof in our system. The rules below match how the platform calculates them today.",
      "traffic.page.visualCaption": "Neon-style icons are a visual shorthand; meaning comes from the rules, not the artwork alone.",
      "traffic.page.greenShort": "Green",
      "traffic.page.orangeShort": "Orange",
      "traffic.page.redShort": "Red",
      "traffic.page.greenTitle": "Green signal",
      "traffic.page.greenBody":
        "Green means the business has verified insurance proof on file, the average rating from approved reviews is at least 2 stars, and the business is not in the red case. It reflects insurer-backed context as implemented in the product today—not a guarantee of future performance.",
      "traffic.page.orangeTitle": "Orange signal",
      "traffic.page.orangeBody":
        "Orange appears when there are no approved reviews yet, or when there are approved reviews with an average of at least 2 stars but insurance proof is not true. Treat these listings with extra care and read recent reviews.",
      "traffic.page.redTitle": "Red signal",
      "traffic.page.redBody":
        "Red applies when there is at least one approved review and the average rating is below 2 stars. This state overrides insurance proof in the calculation—so a red signal means we do not recommend based on current review data."
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
