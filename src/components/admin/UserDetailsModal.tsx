
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Franchisee {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
  slug: string | null;
  city: string | null;
  state: string | null;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchisee: Franchisee | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  franchisee,
}) => {
  if (!franchisee) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{franchisee.company_name}</DialogTitle>
          <DialogDescription>
            Detailed information for this franchisee
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="mt-1">{franchisee.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                <p className="mt-1">{franchisee.contact_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1">{franchisee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="mt-1">{franchisee.phone || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="mt-1">
                  {franchisee.city && franchisee.state
                    ? `${franchisee.city}, ${franchisee.state}`
                    : "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {franchisee.slug || "—"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Subscription Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {franchisee.subscription_status || "Unknown"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tier</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {franchisee.subscription_tier || "Free"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="mt-1">{formatDate(franchisee.subscription_start_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="mt-1">{formatDate(franchisee.subscription_end_date)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">System Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {franchisee.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Joined</label>
                <p className="mt-1">{formatDate(franchisee.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="mt-1">{formatDate(franchisee.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
