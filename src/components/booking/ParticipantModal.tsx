
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';
import { calculateAge, isAgeInRange } from '@/utils/ageCalculator';

interface ClassSchedule {
  id: string;
  classes: {
    name: string;
    min_age?: number;
    max_age?: number;
  };
  start_time: string;
  end_time: string;
  day_of_week: number;
}

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: {
    firstName: string;
    lastName: string;
    birthDate: string;
    age: number;
    classScheduleId: string;
    className: string;
    classTime: string;
    healthConditions?: string;
    ageOverride?: boolean;
  }) => void;
  classSchedule: ClassSchedule;
  dayNames: string[];
}

const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  onAddParticipant,
  classSchedule,
  dayNames
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [ageOverride, setAgeOverride] = useState(false);
  
  const calculatedAge = birthDate ? calculateAge(birthDate) : 0;
  const isAgeValid = isAgeInRange(calculatedAge, classSchedule.classes.min_age, classSchedule.classes.max_age);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      return;
    }

    onAddParticipant({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      age: calculatedAge,
      classScheduleId: classSchedule.id,
      className: classSchedule.classes.name,
      classTime: `${dayNames[classSchedule.day_of_week]} ${formatTime(classSchedule.start_time)} - ${formatTime(classSchedule.end_time)}`,
      healthConditions: healthConditions.trim() || undefined,
      ageOverride: !isAgeValid ? ageOverride : undefined
    });

    // Reset form
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setHealthConditions('');
    setAgeOverride(false);
    onClose();
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setHealthConditions('');
    setAgeOverride(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-agrandir text-brand-navy">
            Add Participant
          </DialogTitle>
          <DialogDescription className="font-poppins">
            Adding participant to: <strong>{classSchedule.classes.name}</strong><br />
            {dayNames[classSchedule.day_of_week]} {formatTime(classSchedule.start_time)} - {formatTime(classSchedule.end_time)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="font-poppins">Child's First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
                className="font-poppins"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="font-poppins">Child's Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
                className="font-poppins"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="birthDate" className="font-poppins">Date of Birth</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="font-poppins"
            />
            {birthDate && (
              <p className="text-sm text-gray-600 mt-1 font-poppins">
                Calculated age: {calculatedAge} years old
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="healthConditions" className="font-poppins">Health Conditions <span className="text-gray-500">(Optional)</span></Label>
            <Textarea
              id="healthConditions"
              value={healthConditions}
              onChange={(e) => setHealthConditions(e.target.value)}
              placeholder="Any allergies, medical conditions, or special needs we should be aware of..."
              className="font-poppins resize-none"
              rows={3}
            />
          </div>

          {birthDate && !isAgeValid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 font-poppins">
                    Age Outside Recommended Range
                  </p>
                  <p className="text-sm text-yellow-700 font-poppins mb-3">
                    This class is recommended for ages {classSchedule.classes.min_age || 'Any'} - {classSchedule.classes.max_age || 'Any'}.
                    Your child is {calculatedAge} years old.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ageOverride"
                      checked={ageOverride}
                      onCheckedChange={(checked) => setAgeOverride(checked as boolean)}
                    />
                    <Label htmlFor="ageOverride" className="text-sm font-poppins text-yellow-800">
                      I understand and want to proceed anyway
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="font-poppins">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!firstName.trim() || !lastName.trim() || !birthDate || (!isAgeValid && !ageOverride)}
              className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins"
            >
              Add Participant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantModal;
