import { Redirect, useParams, useSearch } from "wouter";

/** Preserves query string when moving from legacy /search to /explore-listings */
export function RedirectSearchToExplore() {
  const qs = useSearch();
  return <Redirect to={`/explore-listings${qs}`} />;
}

export function RedirectWriteReviewToRecord() {
  const { businessId } = useParams<{ businessId: string }>();
  return <Redirect to={`/record-experience/${businessId}`} />;
}

export function RedirectCategoriesToSectors() {
  return <Redirect to="/browse-sectors" />;
}
