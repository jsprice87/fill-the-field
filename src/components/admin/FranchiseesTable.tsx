
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Phone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

export const FranchiseesTable: React.FC<FranchiseesTableProps> = ({
  franchisees,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [selectedFranchisees, setSelectedFranchisees] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleFranchiseeSelection = (franchiseeId: string, selected: boolean) => {
    const newSelection = new Set(selectedFranchisees);
    if (selected) {
      newSelection.add(franchiseeId);
    } else {
      newSelection.delete(franchiseeId);
    }
    setSelectedFranchisees(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedFranchisees.size === franchisees.length) {
      setSelectedFranchisees(new Set());
    } else {
      setSelectedFranchisees(new Set(franchisees.map(f => f.id)));
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {selectedFranchisees.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <span className="text-body-sm font-medium">
            {selectedFranchisees.size} franchisee{selectedFranchisees.size > 1 ? 's' : ''} selected
          </span>
          <Button variant="outline" size="sm" className="ui-hover">
            Bulk Actions
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedFranchisees.size === franchisees.length && franchisees.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Quick Actions</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {franchisees.map((franchisee) => (
            <TableRow 
              key={franchisee.id}
              interactive
              className={`
                ${selectedFranchisees.has(franchisee.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                ${hoveredRow === franchisee.id ? 'bg-gray-50 dark:bg-gray-800' : ''}
              `}
              onMouseEnter={() => setHoveredRow(franchisee.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedFranchisees.has(franchisee.id)}
                  onChange={(e) => handleFranchiseeSelection(franchisee.id, e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{franchisee.company_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {franchisee.slug && (
                      <span className="font-mono">{franchisee.slug}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{franchisee.contact_name}</div>
                  <div className="text-xs text-muted-foreground">{franchisee.email}</div>
                  {franchisee.phone && (
                    <div className="text-xs text-muted-foreground">{franchisee.phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {franchisee.city && franchisee.state ? (
                    `${franchisee.city}, ${franchisee.state}`
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(franchisee.subscription_status)}>
                  {franchisee.subscription_status || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTierColor(franchisee.subscription_tier)}>
                  {franchisee.subscription_tier || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {new Date(franchisee.created_at).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => franchisee.email && (window.location.href = `mailto:${franchisee.email}`)}
                    className="ui-hover"
                    title="Send email"
                    disabled={!franchisee.email}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => franchisee.phone && (window.location.href = `tel:${franchisee.phone}`)}
                    className="ui-hover"
                    title="Call franchisee"
                    disabled={!franchisee.phone}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ui-hover">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewUser(franchisee)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditUser(franchisee)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Franchisee
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteUser(franchisee)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
