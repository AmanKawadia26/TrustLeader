import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useConsumerDashboard } from "@/hooks/use-dashboard";
import { useUpdateReviewMutation } from "@/hooks/use-reviews";
import { ReviewCard } from "@/components/ReviewCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "@/components/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import type { Review } from "@workspace/api-client-react";

export default function ConsumerDashboard() {
  const { data, isLoading } = useConsumerDashboard({});
  const updateMutation = useUpdateReviewMutation();

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    
    updateMutation.mutate({
      id: editingReview.id,
      data: {
        rating: editRating,
        text: editText
      }
    }, {
      onSuccess: () => setEditingReview(null)
    });
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            My Reviews
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : data?.reviews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.reviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                showStatus 
                onEdit={openEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border rounded-2xl bg-card">
            <h3 className="text-xl font-medium mb-2">You haven't written any reviews yet.</h3>
            <p className="text-muted-foreground">Search for a business on the home page to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingReview} onOpenChange={(o) => !o && setEditingReview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <StarRating rating={editRating} onRatingChange={setEditRating} interactive />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Review</label>
              <Textarea 
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending || editRating === 0 || editText.length < 10}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
