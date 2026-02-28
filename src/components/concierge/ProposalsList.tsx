"use client";

import { ProposalData } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Send, CheckCircle, CreditCard } from "lucide-react";

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "secondary" as const,
    icon: FileText,
  },
  sent: {
    label: "Sent",
    variant: "default" as const,
    icon: Send,
  },
  approved: {
    label: "Approved",
    variant: "default" as const,
    icon: CheckCircle,
  },
  paid: {
    label: "Paid & Locked",
    variant: "default" as const,
    icon: CreditCard,
  },
};

function getStatusColor(status: string) {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700";
    case "sent":
      return "bg-blue-100 text-blue-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "paid":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

interface ProposalsListProps {
  proposals: ProposalData[];
}

export default function ProposalsList({ proposals }: ProposalsListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No proposals yet.</p>
        <p className="text-xs mt-1">Create your first proposal above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {proposals.map((proposal) => {
        const config = statusConfig[proposal.status] || statusConfig.draft;
        const Icon = config.icon;

        return (
          <Card key={proposal.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-medium text-sm">
                    Proposal #{proposal.id}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Created{" "}
                    {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {proposal.status === "sent" && (
                  <a
                    href={`/proposal/${proposal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View member link →
                  </a>
                )}
                <Badge
                  className={`${getStatusColor(proposal.status)} border-0 text-xs font-medium`}
                >
                  {config.label}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
