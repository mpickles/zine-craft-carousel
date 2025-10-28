import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  userId?: string;
  type: "post" | "profile";
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam/Scams" },
  { value: "harassment", label: "Harassment" },
  { value: "violence", label: "Violence/Gore" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "sexual_content", label: "Sexual Content" },
  { value: "copyright", label: "Copyright (DMCA)" },
  { value: "ai_unlabeled", label: "AI Unlabeled" },
  { value: "other", label: "Other" },
];

export const ReportModal = ({ open, onOpenChange, postId, userId, type }: ReportModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_post_id: postId || null,
        reported_user_id: userId || null,
        reason,
        details: details.trim() || null,
      });

      if (error) throw error;

      toast.success("Thanks for reporting. We'll review within 24 hours.");
      setReason("");
      setDetails("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error(error.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report {type === "post" ? "Post" : "Profile"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about this report..."
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !reason}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};