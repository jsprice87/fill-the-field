import React from 'react';
import { Card } from '@mantine/core';
import { Button } from '@mantine/core';
import { MapPin, Phone, Mail, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LocationProps {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
  franchisee_id?: string;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website?: string | null;
  class_count?: number;
  isActive?: boolean; // For backward compatibility with the form
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const LocationCard: React.FC<LocationProps> = ({
  id,
  name,
  address,
  city,
  state,
  zip,
  phone,
  email,
  is_active = true,
  isActive,
  onEdit,
  onDelete
}) => {
  // Use is_active from database or isActive from form, defaulting to true
  const activeStatus = is_active !== undefined ? is_active : isActive !== undefined ? isActive : true;
  
  return (
    <Card className="h-full">
      <Card.Section>
        <Card.Section className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-xl">{name}</h3>
            {activeStatus ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">Inactive</Badge>
            )}
          </div>
        </Card.Section>
      </Card.Section>
      <Card.Section className="space-y-2 pb-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm">{address}</p>
            <p className="text-sm">{city}, {state} {zip}</p>
          </div>
        </div>
        
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{phone}</p>
          </div>
        )}
        
        {email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{email}</p>
          </div>
        )}
      </Card.Section>
      <Card.Section className="flex justify-end gap-2 pt-0">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(id)}>
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </Card.Section>
    </Card>
  );
};

export default LocationCard;
