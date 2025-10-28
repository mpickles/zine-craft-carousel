import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reported_post_id: string | null;
  reported_user_id: string | null;
  reporter: {
    username: string;
    avatar_url: string | null;
  };
  reported_post?: {
    caption: string | null;
    user_id: string;
  };
  reported_user?: {
    username: string;
  };
}

export const PendingReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          reporter:reporter_id (
            username:profiles!inner(username),
            avatar_url:profiles!inner(avatar_url)
          ),
          reported_post:reported_post_id (
            caption,
            user_id
          ),
          reported_user:reported_user_id (
            username:profiles!inner(username)
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the nested data structure
      const transformedData = data?.map((report: any) => ({
        ...report,
        reporter: {
          username: report.reporter?.username?.username || "Unknown",
          avatar_url: report.reporter?.avatar_url?.avatar_url,
        },
        reported_user: report.reported_user?.username
          ? { username: report.reported_user.username.username }
          : undefined,
      }));

      setReports(transformedData || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (reportId: string) => {
    if (!user) return;

    try {
      setActionLoading(reportId);

      const { error } = await supabase
        .from("reports")
        .update({
          status: "dismissed",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Report dismissed");
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || "Failed to dismiss report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (reportId: string) => {
    if (!user) return;

    try {
      setActionLoading(reportId);

      const { error } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Report marked as resolved");
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveContent = async (report: Report) => {
    if (!user || !report.reported_post_id) return;

    try {
      setActionLoading(report.id);

      const { error } = await supabase
        .from("posts")
        .update({
          is_removed: true,
          removed_reason: report.reason,
          removed_at: new Date().toISOString(),
        })
        .eq("id", report.reported_post_id);

      if (error) throw error;

      // Also mark report as resolved
      await handleResolve(report.id);

      toast.success("Content removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove content");
    } finally {
      setActionLoading(null);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam/Scams",
      harassment: "Harassment",
      violence: "Violence/Gore",
      hate_speech: "Hate Speech",
      sexual_content: "Sexual Content",
      copyright: "Copyright (DMCA)",
      ai_unlabeled: "AI Unlabeled",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No pending reports</h3>
        <p className="text-muted-foreground">
          All reports have been reviewed. Great job!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="p-6">
          <div className="space-y-4">
            {/* Reporter Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={report.reporter.avatar_url || undefined} />
                  <AvatarFallback>
                    {report.reporter.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">@{report.reporter.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {getReasonLabel(report.reason)}
              </Badge>
            </div>

            {/* Reported Content */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Reported Content:</p>
              {report.reported_post_id && (
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Post: {report.reported_post?.caption || "No caption"}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/post/${report.reported_post_id}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Post
                    </Link>
                  </Button>
                </div>
              )}
              {report.reported_user_id && (
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    User: @{report.reported_user?.username || "Unknown"}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/profile/${report.reported_user?.username}`}
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Details */}
            {report.details && (
              <div>
                <p className="text-sm font-semibold mb-1">Additional Details:</p>
                <p className="text-sm text-muted-foreground">{report.details}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {report.reported_post_id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveContent(report)}
                  disabled={actionLoading === report.id}
                >
                  {actionLoading === report.id && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Remove Content
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolve(report.id)}
                disabled={actionLoading === report.id}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDismiss(report.id)}
                disabled={actionLoading === report.id}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};