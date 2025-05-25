
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import DateSelector from '@/components/booking/DateSelector';

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  classes: {
    name: string;
    min_age?: number;
    max_age?: number;
  };
}

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: any) => void;
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    birthDate: '',
    healthConditions: '',
    ageOverride: false,
    selectedDate: ''
  });

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isAgeInRange = (age: number) => {
    const minAge = classSchedule.classes.min_age;
    const maxAge = classSchedule.classes.max_age;
    
    if (minAge && age < minAge) return false;
    if (maxAge && age > maxAge) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const age = parseInt(formData.age);
    const isValidAge = isAgeInRange(age);
    
    if (!isValidAge && !formData.ageOverride) {
      const minAge = classSchedule.classes.min_age;
      const maxAge = classSchedule.classes.max_age;
      let ageRangeText = '';
      
      if (minAge && maxAge) {
        ageRangeText = `${minAge}-${maxAge} years old`;
      } else if (minAge) {
        ageRangeText = `${minAge}+ years old`;
      } else if (maxAge) {
        ageRangeText = `under ${maxAge + 1} years old`;
      }
      
      toast.error(`This class is designed for children ${ageRangeText}. Please check the age override box if you want to proceed.`);
      return;
    }

    if (!formData.selectedDate) {
      toast.error('Please select a class date');
      return;
    }

    const participant = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: age,
      birthDate: formData.birthDate,
      classScheduleId: classSchedule.id,
      className: classSchedule.classes.name,
      classTime: `${dayNames[classSchedule.day_of_week]} ${formatTime(classSchedule.start_time)} - ${formatTime(classSchedule.end_time)}`,
      selectedDate: formData.selectedDate,
      healthConditions: formData.healthConditions || undefined,
      ageOverride: formData.ageOverride
    };

    onAddParticipant(participant);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      age: '',
      birthDate: '',
      healthConditions: '',
      ageOverride: false,
      selectedDate: ''
    });
    
    onClose();
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, selectedDate: date }));
  };

  const currentAge = formData.age ? parseInt(formData.age) : 0;
  const showAgeWarning = formData.age && !isAgeInRange(currentAge);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-agrandir text-xl text-brand-navy">
            Add Participant
          </DialogTitle>
          <div className="bg-blue-50 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2 text-brand-navy mb-1">
              <Calendar className="h-4 w-4" />
              <span className="font-poppins font-medium">{classSchedule.classes.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="h-3 w-3" />
              <span className="font-poppins">
                {dayNames[classSchedule.day_of_week]} {formatTime(classSchedule.start_time)} - {formatTime(classSchedule.end_time)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="font-poppins">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                className="font-poppins"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="font-poppins">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                className="font-poppins"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age" className="font-poppins">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="18"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
                className="font-poppins"
              />
            </div>
            <div>
              <Label htmlFor="birthDate" className="font-poppins">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="font-poppins"
              />
            </div>
          </div>

          {showAgeWarning && (
            <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-3">
              <p className="font-poppins text-yellow-800 text-sm mb-2">
                ⚠️ This child's age is outside the recommended range for this class.
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ageOverride"
                  checked={formData.ageOverride}
                  onCheckedChange={(checked) => setFormData({...formData, ageOverride: !!checked})}
                />
                <Label htmlFor="ageOverride" className="font-poppins text-sm">
                  I understand and want to proceed anyway
                </Label>
              </div>
            </div>
          )}

          <DateSelector
            classScheduleId={classSchedule.id}
            onDateSelect={handleDateSelect}
            selectedDate={formData.selectedDate}
          />

          <div>
            <Label htmlFor="healthConditions" className="font-poppins">
              Health Conditions or Special Needs
            </Label>
            <Textarea
              id="healthConditions"
              value={formData.healthConditions}
              onChange={(e) => setFormData({...formData, healthConditions: e.target.value})}
              placeholder="Any health conditions, allergies, or special needs we should know about..."
              className="font-poppins resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 font-poppins"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-red hover:bg-brand-red/90 text-white font-poppins"
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
