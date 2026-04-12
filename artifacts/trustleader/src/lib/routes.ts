/** Canonical client routes (avoid generic marketplace URL patterns). */

export const ROUTES = {
  home: "/",
  exploreListings: "/explore-listings",
  browseSectors: "/browse-sectors",
  recordExperience: (businessId: string) => `/record-experience/${businessId}`,
  trustSignals: "/trust-signals",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  developers: "/developers",
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  authRegisterBusiness: "/auth/register/business",
  authRegisterReseller: "/auth/register/reseller",
} as const;
