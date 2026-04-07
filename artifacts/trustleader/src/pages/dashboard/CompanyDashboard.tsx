import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useCompanyDashboard } from "@/hooks/use-dashboard";
import { TrafficLightBadge } from "@/components/TrafficLightBadge";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Loader2, MessageSquareReply, Building } from "lucide-react";
import { ApiError, type Review } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";

export default function CompanyDashboard() {
  const { t } = useTranslation();
  const { businessQuery, reviewsQuery, respondMutation, claimMutation, patchBusinessMutation } =
    useCompanyDashboard();
  const { data: business, isLoading: businessLoading, isError: businessError, error: businessErr } = businessQuery;
  const { data: reviewsData, isLoading: reviewsLoading } = reviewsQuery;
  const [claimBusinessId, setClaimBusinessId] = useState("");
  const needsClaim =
    !businessLoading &&
    businessError &&
    businessErr instanceof ApiError &&
    businessErr.status === 404;

  const [respondingTo, setRespondTo] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (business) {
      setEditName(business.name);
      setEditDesc(business.description ?? "");
    }
  }, [business]);

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingTo || !responseText) return;
    
    respondMutation.mutate({
      data: {
        review_id: respondingTo.id,
        response: responseText
      }
    }, {
      onSuccess: () => {
        setRespondTo(null);
        setResponseText("");
      }
    });
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Building className="w-8 h-8 text-primary" />
            Company Dashboard
          </h1>
          
          {businessLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : needsClaim ? (
            <div className="bg-card border rounded-2xl p-6 shadow-sm max-w-xl space-y-4">
              <p className="text-muted-foreground">{t("dash.company.claimIntro")}</p>
              <form
                className="flex flex-col sm:flex-row gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const id = claimBusinessId.trim();
                  if (!id) return;
                  claimMutation.mutate({ data: { business_id: id } });
                }}
              >
                <Input
                  placeholder={t("dash.company.claimPlaceholder")}
                  value={claimBusinessId}
                  onChange={(e) => setClaimBusinessId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={claimMutation.isPending || !claimBusinessId.trim()}>
                  {claimMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("dash.company.claimSubmit")}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">{t("dash.company.claimHint")}</p>
            </div>
          ) : businessError && !needsClaim ? (
            <p className="text-destructive text-sm">
              {businessErr instanceof Error ? businessErr.message : t("dash.company.loadError")}
            </p>
          ) : business ? (
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{business.name}</h2>
                <p className="text-muted-foreground">{business.domain}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <TrafficLightBadge status={business.traffic_light} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Rating</p>
                  <div className="flex items-center gap-1 font-semibold text-lg">
                    {business.average_rating?.toFixed(1) || "0.0"}
                    <StarRating rating={1} max={1} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {business && !needsClaim && !businessError ? (
            <div className="mt-8 max-w-xl bg-card border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg">Edit business details</h3>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  patchBusinessMutation.mutate({
                    data: {
                      name: editName.trim(),
                      description: editDesc.trim() === "" ? null : editDesc.trim(),
                    },
                  });
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="biz-name">
                    Business name
                  </label>
                  <Input
                    id="biz-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="biz-desc">
                    Description
                  </label>
                  <Textarea
                    id="biz-desc"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Optional description"
                  />
                </div>
                <Button type="submit" disabled={patchBusinessMutation.isPending}>
                  {patchBusinessMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold mb-6">{t("dash.company.recentReviews")}</h3>

        {needsClaim ? (
          <p className="text-muted-foreground">{t("dash.company.reviewsAfterClaim")}</p>
        ) : businessError && !business && !needsClaim ? (
          <p className="text-muted-foreground">{t("dash.company.reviewsUnavailable")}</p>
        ) : reviewsLoading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : reviewsData?.reviews?.length ? (
          <div className="space-y-4">
            {reviewsData.reviews.map(review => (
              <div key={review.id} className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  {!review.company_response && (
                    <Button variant="outline" size="sm" onClick={() => setRespondTo(review)}>
                      <MessageSquareReply className="w-4 h-4 mr-2" /> Respond
                    </Button>
                  )}
                </div>
                <p className="text-foreground mb-4">{review.text}</p>
                
                {review.company_response && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 ml-4 md:ml-8 relative">
                    <div className="absolute -left-3 top-4 w-3 h-[1px] bg-primary/20"></div>
                    <div className="absolute -left-3 top-0 w-[1px] h-4 bg-primary/20"></div>
                    <p className="text-sm font-semibold text-primary mb-1">Your Response</p>
                    <p className="text-sm text-foreground/80">{review.company_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews to manage yet.</p>
        )}
      </div>

      <Dialog open={!!respondingTo} onOpenChange={(o) => !o && setRespondTo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRespond} className="space-y-4 mt-4">
            <div className="bg-muted p-4 rounded-lg text-sm italic border">
              "{respondingTo?.text}"
            </div>
            <Textarea 
              placeholder="Type your public response here..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRespondTo(null)}>Cancel</Button>
              <Button type="submit" disabled={!responseText || respondMutation.isPending}>
                {respondMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Post Response
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
