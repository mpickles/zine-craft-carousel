import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { XCircle, Info } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  created_at: string;
  reviewed_at: string;
  reporter: {
    username: string;
    avatar_url: string | null;
  };
}

export const DismissedReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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
          )
        `)
        .eq("status", "dismissed")
        .order("reviewed_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedData = data?.map((report: any) => ({
        ...report,
        reporter: {
          username: report.reporter?.username?.username || "Unknown",
          avatar_url: report.reporter?.avatar_url?.avatar_url,
        },
      }));

      setReports(transformedData || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No dismissed reports</h3>
        <p className="text-muted-foreground">
          Dismissed reports will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarImage src={report.reporter.avatar_url || undefined} />
                <AvatarFallback>
                  {report.reporter.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">@{report.reporter.username}</p>
                  <Badge variant="outline">{report.reason}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  {" • "}
                  Dismissed {formatDistanceToNow(new Date(report.reviewed_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <XCircle className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      ))}
    </div>
  );
};