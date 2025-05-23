
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";

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

interface FranchiseesTableProps {
  franchisees: Franchisee[];
  onViewUser: (franchisee: Franchisee) => void;
  onEditUser: (franchisee: Franchisee) => void;
  onDeleteUser: (franchisee: Franchisee) => void;
}

const getStatusBadgeColor = (status: string | null) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-red-100 text-red-800";
    case "suspended":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTierBadgeColor = (tier: string | null) => {
  switch (tier) {
    case "premium":
      return "bg-purple-100 text-purple-800";
    case "basic":
      return "bg-blue-100 text-blue-800";
    case "free":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const FranchiseesTable: React.FC<FranchiseesTableProps> = ({
  franchisees,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {franchisees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No franchisees found. When users sign up, they'll appear here.
              </TableCell>
            </TableRow>
          ) : (
            franchisees.map((franchisee) => (
              <TableRow key={franchisee.id}>
                <TableCell className="font-medium">
                  {franchisee.company_name}
                </TableCell>
                <TableCell>{franchisee.contact_name}</TableCell>
                <TableCell>{franchisee.email}</TableCell>
                <TableCell>{franchisee.phone || "—"}</TableCell>
                <TableCell>
                  {franchisee.city && franchisee.state
                    ? `${franchisee.city}, ${franchisee.state}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(franchisee.subscription_status)}>
                    {franchisee.subscription_status || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getTierBadgeColor(franchisee.subscription_tier)}>
                    {franchisee.subscription_tier || "Free"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(franchisee.created_at)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewUser(franchisee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(franchisee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(franchisee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
