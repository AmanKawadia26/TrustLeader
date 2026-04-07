import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  useAdminListBusinesses,
  useAdminListReviews,
  useAdminSetReviewStatus,
  type AdminListReviewsParams,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, Shield, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bizQ, setBizQ] = useState("");
  const [bizSubmitted, setBizSubmitted] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string>("pending");

  const businessesQuery = useAdminListBusinesses(
    { q: bizSubmitted || undefined, page: 1, limit: 50 },
    { request: { headers } },
  );

  const reviewsParams: AdminListReviewsParams = { page: 1, limit: 50 };
  if (reviewStatus !== "all") {
    reviewsParams.status = reviewStatus as AdminListReviewsParams["status"];
  }
  const reviewsQuery = useAdminListReviews(reviewsParams, {
    request: { headers },
  });

  const statusMutation = useAdminSetReviewStatus({
    request: { headers },
    mutation: {
      onSuccess: () => {
        toast({ title: "Review updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin/reviews"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/admin/businesses"] });
      },
      onError: (e: Error) => {
        toast({ title: "Update failed", description: e.message, variant: "destructive" });
      },
    },
  });

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Admin
          </h1>
          <p className="text-muted-foreground text-sm">
            Moderate reviews and browse all businesses.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Businesses
          </h2>
          <form
            className="flex flex-col sm:flex-row gap-2 max-w-xl mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              setBizSubmitted(bizQ.trim());
            }}
          >
            <Input
              placeholder="Search name or domain"
              value={bizQ}
              onChange={(e) => setBizQ(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          {businessesQuery.isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Domain</th>
                    <th className="text-left p-3">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {businessesQuery.data?.businesses?.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="p-3 font-medium">{b.name}</td>
                      <td className="p-3 text-muted-foreground">{b.domain}</td>
                      <td className="p-3">{b.review_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!businessesQuery.data?.businesses?.length && (
                <p className="p-4 text-muted-foreground">No businesses found.</p>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Reviews
            </h2>
            <div className="w-full sm:w-48">
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {reviewsQuery.isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <div className="space-y-4">
              {reviewsQuery.data?.reviews?.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-card border rounded-xl p-5 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap gap-3 justify-between items-start">
                    <div>
                      <span className="text-xs uppercase text-muted-foreground">
                        {rev.status}
                      </span>
                      {rev.business_name && (
                        <p className="font-semibold">{rev.business_name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={rev.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rev.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {rev.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: rev.id,
                              data: { status: "approved" },
                            })
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {rev.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: rev.id,
                              data: { status: "rejected" },
                            })
                          }
                        >
                          Reject
                        </Button>
                      )}
                      {rev.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: rev.id,
                              data: { status: "pending" },
                            })
                          }
                        >
                          Pending
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90">{rev.text}</p>
                </div>
              ))}
              {!reviewsQuery.data?.reviews?.length && (
                <p className="text-muted-foreground">No reviews in this filter.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
