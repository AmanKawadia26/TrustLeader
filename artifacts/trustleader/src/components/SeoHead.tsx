import { Helmet } from "react-helmet-async";

function siteOrigin(): string {
  const env = import.meta.env.VITE_SITE_URL;
  if (typeof env === "string" && env.length > 0) {
    return env.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

type SeoHeadProps = {
  title: string;
  description: string;
  /** Path only, e.g. /explore-listings */
  canonicalPath: string;
  noindex?: boolean;
};

export function SeoHead({ title, description, canonicalPath, noindex }: SeoHeadProps) {
  const base = siteOrigin();
  const path = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  const canonical = `${base}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
