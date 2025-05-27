import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format, differenceInYears } from 'date-fns';
import { toast } from 'sonner';
import DateSelector from './DateSelector';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: any) => void;
  classSchedule: any;
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
  const [selectedDate, setSelectedDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState(0);
  const [isAgeOverride, setIsAgeOverride] = useState(false);

  useEffect(() => {
    if (birthDate) {
      const age = differenceInYears(new Date(), new Date(birthDate));
      setCalculatedAge(age);

      const minAge = classSchedule.classes.min_age || 0;
      const maxAge = classSchedule.classes.max_age || 100;
      setIsAgeOverride(age < minAge || age > maxAge);
    } else {
      setCalculatedAge(0);
      setIsAgeOverride(false);
    }
  }, [birthDate, classSchedule]);

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s-]+$/;
    return nameRegex.test(name);
  };

  const validateBirthDate = (date: string): boolean => {
    return !!date;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !birthDate || !selectedDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const participant = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: calculatedAge,
      birthDate,
      classScheduleId: classSchedule.id,
      className: classSchedule.classes.name,
      classTime: `${formatTime(classSchedule.start_time)} - ${formatTime(classSchedule.end_time)}`,
      selectedDate,
      healthConditions: healthConditions.trim() || undefined,
      ageOverride: isAgeOverride
    };

    onAddParticipant(participant);
    
    // Reset form
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setHealthConditions('');
    setSelectedDate('');
    onClose();
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-agrandir text-xl text-brand-navy">
            Add Participant to {classSchedule.classes.name}
          </DialogTitle>
          <DialogDescription className="font-poppins text-gray-600">
            {dayNames[classSchedule.day_of_week]}s • {formatTime(classSchedule.start_time)} - {formatTime(classSchedule.end_time)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName" className="font-poppins text-sm font-medium text-gray-700">
              First Name *
            </Label>
            <Input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName" className="font-poppins text-sm font-medium text-gray-700">
              Last Name *
            </Label>
            <Input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="birthDate" className="font-poppins text-sm font-medium text-gray-700">
              Date of Birth *
            </Label>
            <Input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          {/* Enhanced Date Selection */}
          <div>
            <Label className="font-poppins text-sm font-medium text-gray-700">
              Select Class Date *
            </Label>
            <DateSelector
              classScheduleId={classSchedule.id}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          <div>
            <Label htmlFor="healthConditions" className="font-poppins text-sm font-medium text-gray-700">
              Any health conditions we should be aware of?
            </Label>
            <Input
              type="text"
              id="healthConditions"
              value={healthConditions}
              onChange={(e) => setHealthConditions(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-poppins">
            Add Participant
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantModal;
