
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, MapPin, Users, Share, ArrowLeft, ExternalLink } from 'lucide-react';
import { useBookingSession } from '@/hooks/useBookingSession';
import { useFranchiseeSettings } from '@/hooks/useFranchiseeSettings';

const BookingConfirmation: React.FC = () => {
  const { franchiseeId } = useParams();
  const navigate = useNavigate();
  const { sessionData } = useBookingSession();
  const { data: settings } = useFranchiseeSettings();

  // Redirect if no session data
  useEffect(() => {
    if (!sessionData.participants || sessionData.participants.length === 0) {
      navigate(`/${franchiseeId}/free-trial`);
    }
  }, [sessionData, franchiseeId, navigate]);

  if (!sessionData.participants || sessionData.participants.length === 0) {
    return null;
  }

  // Group participants by class
  const participantsByClass = sessionData.participants.reduce((acc, participant) => {
    const key = `${participant.classScheduleId}-${participant.className}`;
    if (!acc[key]) {
      acc[key] = {
        className: participant.className,
        classTime: participant.classTime,
        participants: []
      };
    }
    acc[key].participants.push(participant);
    return acc;
  }, {} as Record<string, { className: string; classTime: string; participants: any[] }>);

  const handleShare = () => {
    const shareText = `I just signed up my child for a free soccer trial at Soccer Stars! Check it out: ${window.location.origin}/${franchiseeId}/free-trial`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Soccer Stars Free Trial',
        text: shareText,
        url: `${window.location.origin}/${franchiseeId}/free-trial`
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-2xl">SOCCER STARS - BOOKING CONFIRMED</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="font-agrandir text-4xl text-brand-navy mb-4">Booking Confirmed!</h2>
            <p className="font-poppins text-lg text-gray-600 mb-4">
              Your free trial class has been booked. We're excited to see you on the field!
            </p>
          </div>

          {/* Booking Summary */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="font-agrandir text-xl text-brand-navy flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              {sessionData.selectedLocation && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-brand-red mt-1" />
                  <div>
                    <h4 className="font-poppins font-semibold text-brand-navy">{sessionData.selectedLocation.name}</h4>
                    <p className="font-poppins text-gray-600">{sessionData.selectedLocation.address}</p>
                  </div>
                </div>
              )}

              {/* Classes and Participants */}
              {Object.values(participantsByClass).map((classGroup, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-brand-blue" />
                    <h4 className="font-agrandir text-lg text-brand-navy">{classGroup.className}</h4>
                  </div>
                  <p className="font-poppins text-gray-600 mb-3">{classGroup.classTime}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-brand-red" />
                    <span className="font-poppins font-medium">Participants:</span>
                  </div>
                  <ul className="space-y-1">
                    {classGroup.participants.map((participant) => (
                      <li key={participant.id} className="font-poppins text-gray-700">
                        • {participant.firstName} {participant.lastName} ({participant.age} years old)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Parent/Guardian Info */}
              {sessionData.parentGuardianInfo && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-poppins font-semibold text-brand-navy mb-2">Parent/Guardian Contact:</h4>
                  <p className="font-poppins text-gray-700">
                    {sessionData.parentGuardianInfo.firstName} {sessionData.parentGuardianInfo.lastName}
                  </p>
                  <p className="font-poppins text-gray-600">{sessionData.parentGuardianInfo.email}</p>
                  <p className="font-poppins text-gray-600">{sessionData.parentGuardianInfo.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What to Expect */}
          <Card>
            <CardHeader>
              <CardTitle className="font-agrandir text-xl text-brand-navy">What to Expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-poppins font-semibold text-brand-navy mb-2">What to Bring:</h4>
                  <ul className="space-y-1 font-poppins text-gray-700">
                    <li>• Comfortable athletic clothing</li>
                    <li>• Soccer cleats or athletic shoes</li>
                    <li>• Water bottle</li>
                    <li>• Shin guards (recommended)</li>
                    <li>• Positive attitude and ready to have fun!</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-brand-navy mb-2">What We Provide:</h4>
                  <ul className="space-y-1 font-poppins text-gray-700">
                    <li>• Professional coaching</li>
                    <li>• Soccer balls and training equipment</li>
                    <li>• Age-appropriate curriculum</li>
                    <li>• Fun, supportive environment</li>
                    <li>• Small class sizes for personalized attention</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <h4 className="font-poppins font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                <ul className="space-y-1 font-poppins text-yellow-700 text-sm">
                  <li>• Please arrive 10-15 minutes early for check-in</li>
                  <li>• Parents are welcome to watch from the sidelines</li>
                  <li>• If weather is questionable, we'll contact you with updates</li>
                  <li>• Our coaches will discuss next steps and enrollment options after the trial</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Share with Friends */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <Share className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                <h4 className="font-agrandir text-lg text-brand-navy mb-2">Share with Friends</h4>
                <p className="font-poppins text-gray-600 text-sm mb-4">
                  Know other families who might enjoy soccer? Share your experience!
                </p>
                <Button 
                  onClick={handleShare}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
                >
                  Share Now
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center gap-2 mb-3">
                  {/* Social media icons would go here */}
                  <div className="h-8 w-8 bg-brand-red rounded-full"></div>
                  <div className="h-8 w-8 bg-brand-blue rounded-full"></div>
                </div>
                <h4 className="font-agrandir text-lg text-brand-navy mb-2">Follow Us</h4>
                <p className="font-poppins text-gray-600 text-sm mb-4">
                  Stay connected for updates, tips, and soccer fun!
                </p>
                <div className="space-y-2">
                  {settings?.facebook_url && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                        Facebook
                      </a>
                    </Button>
                  )}
                  {settings?.instagram_url && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learn More */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <ExternalLink className="h-8 w-8 text-brand-red mx-auto mb-3" />
                <h4 className="font-agrandir text-lg text-brand-navy mb-2">Learn More</h4>
                <p className="font-poppins text-gray-600 text-sm mb-4">
                  Discover our full program offerings and philosophy
                </p>
                {settings?.website_url ? (
                  <Button asChild className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins">
                    <a href={settings.website_url} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                ) : (
                  <Button className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild className="font-poppins">
              <Link to={`/${franchiseeId}/free-trial/find-classes`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Register More Children
              </Link>
            </Button>
            <Button asChild className="bg-brand-navy hover:bg-brand-navy/90 text-white font-poppins">
              <Link to={`/${franchiseeId}/free-trial`}>
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
