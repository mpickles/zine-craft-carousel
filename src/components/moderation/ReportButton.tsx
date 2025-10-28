import { useState } from "react";
import { Flag } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ReportModal } from "./ReportModal";

interface ReportButtonProps {
  postId?: string;
  userId?: string;
  type: "post" | "profile";
}

export const ReportButton = ({ postId, userId, type }: ReportButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <DropdownMenuItem onClick={() => setShowModal(true)}>
        <Flag className="w-4 h-4 mr-2" />
        Report {type}
      </DropdownMenuItem>

      <ReportModal
        open={showModal}
        onOpenChange={setShowModal}
        postId={postId}
        userId={userId}
        type={type}
      />
    </>
  );
};