
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface LocationFormData {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
}

interface LocationFormProps {
  open: boolean;
  initialData?: LocationFormData;
  onClose: () => void;
  onSubmit: (data: LocationFormData) => void;
}

const defaultLocationData: LocationFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
  isActive: true,
};

const LocationForm: React.FC<LocationFormProps> = ({
  open,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<LocationFormData>(
    initialData || defaultLocationData
  );

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultLocationData);
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id ? 'Update location details' : 'Enter details for your new location'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Location Name*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Soccer Stars Downtown"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Street Address*</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="city">City*</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Denver"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State*</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="CO"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="zip">ZIP Code*</Label>
            <Input
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder="80202"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="(303) 555-1234"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="downtown@soccerstars.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isActive">Location is active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData?.id ? 'Update' : 'Create'} Location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationForm;
