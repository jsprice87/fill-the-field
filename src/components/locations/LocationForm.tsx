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
import { StatusToggle } from "@/components/ui/StatusToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  latitude?: number;
  longitude?: number;
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
  const [isGeocoding, setIsGeocoding] = useState(false);

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

  const handleStatusToggleChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const geocodeAddress = async (addressData: LocationFormData): Promise<{ latitude: number; longitude: number } | null> => {
    const fullAddress = `${addressData.address}, ${addressData.city}, ${addressData.state} ${addressData.zip}`;
    
    try {
      console.log('Geocoding address:', fullAddress);
      setIsGeocoding(true);

      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address: fullAddress }
      });

      if (error) {
        console.error('Geocoding error:', error);
        toast.error('Failed to verify address coordinates');
        return null;
      }

      if (data && data.latitude && data.longitude) {
        console.log('Geocoding successful:', data);
        return {
          latitude: data.latitude,
          longitude: data.longitude
        };
      }

      console.warn('No coordinates returned from geocoding service');
      toast.warning('Could not verify address coordinates');
      return null;

    } catch (error) {
      console.error('Geocoding request failed:', error);
      toast.error('Address verification failed');
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Geocode the address before submitting
    const coordinates = await geocodeAddress(formData);
    
    // Include coordinates in the form data if geocoding was successful
    const dataToSubmit = {
      ...formData,
      ...(coordinates && { 
        latitude: coordinates.latitude, 
        longitude: coordinates.longitude 
      })
    };

    onSubmit(dataToSubmit);
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
              disabled={isGeocoding}
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
              disabled={isGeocoding}
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
                disabled={isGeocoding}
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
                disabled={isGeocoding}
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
              disabled={isGeocoding}
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
              disabled={isGeocoding}
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
              disabled={isGeocoding}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="isActive">Status</Label>
            <StatusToggle
              id="isActive"
              checked={formData.isActive}
              disabled={isGeocoding}
              onChange={handleStatusToggleChange}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isGeocoding}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGeocoding}>
              {isGeocoding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying Address...
                </>
              ) : (
                <>
                  {initialData?.id ? 'Update' : 'Create'} Location
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationForm;
