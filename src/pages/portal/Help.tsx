
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, ExternalLink, Copy, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

const Help: React.FC = () => {
  const { franchiseeSlug } = useParams();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const leadCreatedPayload = `{
  "event": "lead_created",
  "lead_id": "123e4567-e89b-12d3-a456-426614174000",
  "franchisee_id": "987fcdeb-51a2-43d1-b234-567890abcdef", 
  "created_at": "2024-06-04T14:30:00.000Z",
  "payload": {
    "first_name": "John",
    "last_name": "Smith", 
    "email": "john.smith@example.com",
    "phone": "(555) 123-4567",
    "zip": "80202"
  }
}`;

  const bookingCreatedPayload = `{
  "event": "booking_created",
  "lead_id": "123e4567-e89b-12d3-a456-426614174000",
  "booking_id": "456e7890-e12b-34c5-d678-901234567890",
  "franchisee_id": "987fcdeb-51a2-43d1-b234-567890abcdef",
  "created_at": "2024-06-04T14:35:00.000Z",
  "class_schedule_id": "789e0123-e45b-67c8-d901-234567890abc"
}`;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Help & Documentation
        </h1>
        <p className="text-gray-600 mt-1">Learn how to configure and use your portal features</p>
      </div>

      <div className="grid gap-6">
        {/* n8n Workflow Integration Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              n8n Workflow Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Connect your Soccer Stars portal to n8n workflows to automate your lead and booking processes. 
                This integration allows you to trigger custom workflows when leads are captured or bookings are completed.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Benefits:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatic lead notifications via email, SMS, or Slack</li>
                  <li>• CRM integration and data synchronization</li>
                  <li>• Custom follow-up sequences and reminders</li>
                  <li>• Advanced analytics and reporting workflows</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Prerequisites</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      You'll need an active n8n account and basic knowledge of creating workflows. 
                      Visit <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="underline">n8n.io</a> to get started.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setting Up Your Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="step1">
                <AccordionTrigger>Step 1: Configure Webhook in Portal Settings</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Navigate to your <Link to={`/${franchiseeSlug}/portal/settings`} className="text-blue-600 underline">Portal Settings</Link></li>
                    <li>Find the "Workflow Integrations" card</li>
                    <li>Enter your n8n webhook URL (e.g., https://your-n8n-instance.com/webhook/soccer-stars)</li>
                    <li>Optionally add an Authorization header for security</li>
                    <li>Click "Save" to store your settings</li>
                  </ol>
                  
                  <div className="mt-4">
                    <Link to={`/${franchiseeSlug}/portal/settings`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Go to Settings
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step2">
                <AccordionTrigger>Step 2: Create n8n Workflow</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>In n8n, create a new workflow</li>
                    <li>Add a "Webhook" trigger node as your starting point</li>
                    <li>Set the HTTP Method to "POST"</li>
                    <li>Copy the webhook URL and paste it into your portal settings</li>
                    <li>Configure your automation nodes (email, CRM, etc.)</li>
                    <li>Activate your workflow</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step3">
                <AccordionTrigger>Step 3: Test Your Integration</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Submit a test lead through your booking page</li>
                    <li>Check your n8n workflow execution log</li>
                    <li>Verify the webhook payload was received correctly</li>
                    <li>Check the webhook logs in your portal settings</li>
                  </ol>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Success!</span>
                    </div>
                    <p className="text-sm text-green-800 mt-1">
                      If everything is working, you'll see successful webhook deliveries in your logs.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Webhook Events & Payloads */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Events & Payloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Event Types</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Your webhook will receive one of two event types. If a visitor completes a booking, 
                  only the <code className="bg-gray-100 px-1 rounded">booking_created</code> event is sent.
                </p>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="lead-created">
                  <AccordionTrigger>lead_created Event</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Triggered when a visitor submits their contact information but doesn't complete a booking.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">JSON Payload:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(leadCreatedPayload, 'Lead created payload')}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        <code>{leadCreatedPayload}</code>
                      </pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="booking-created">
                  <AccordionTrigger>booking_created Event</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Triggered when a visitor completes a class booking. This supersedes any lead_created event.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">JSON Payload:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(bookingCreatedPayload, 'Booking created payload')}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        <code>{bookingCreatedPayload}</code>
                      </pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        {/* n8n Workflow Examples */}
        <Card>
          <CardHeader>
            <CardTitle>n8n Workflow Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="basic-notification">
                <AccordionTrigger>Basic Lead Notification</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Send an email notification whenever a new lead is captured.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Workflow Steps:</h5>
                    <ol className="text-sm space-y-1">
                      <li>1. Webhook Trigger → Receives lead data</li>
                      <li>2. IF Node → Check if event = "lead_created"</li>
                      <li>3. Email Node → Send notification to your team</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="booking-confirmation">
                <AccordionTrigger>Booking Confirmation Sequence</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Automatically send booking confirmations and follow-up reminders.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Workflow Steps:</h5>
                    <ol className="text-sm space-y-1">
                      <li>1. Webhook Trigger → Receives booking data</li>
                      <li>2. IF Node → Check if event = "booking_created"</li>
                      <li>3. Email Node → Send immediate confirmation</li>
                      <li>4. Wait Node → Wait 24 hours</li>
                      <li>5. Email Node → Send class reminder</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="crm-integration">
                <AccordionTrigger>CRM Integration</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Automatically sync leads and bookings to your CRM system.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Workflow Steps:</h5>
                    <ol className="text-sm space-y-1">
                      <li>1. Webhook Trigger → Receives event data</li>
                      <li>2. Switch Node → Route based on event type</li>
                      <li>3a. HubSpot/Salesforce Node → Create/update contact</li>
                      <li>3b. Set custom properties based on event data</li>
                      <li>4. Slack Node → Notify sales team (optional)</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="common-issues">
                <AccordionTrigger>Common Issues & Solutions</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900">Webhook not receiving data</h5>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>• Verify the webhook URL is correct and accessible</li>
                        <li>• Check that your n8n workflow is activated</li>
                        <li>• Ensure the webhook endpoint accepts POST requests</li>
                        <li>• Test the URL directly with a tool like Postman</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900">Authentication errors</h5>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>• Check your Authorization header format (Bearer token, Basic auth)</li>
                        <li>• Verify the credentials are correct and not expired</li>
                        <li>• Remove auth header temporarily to test without authentication</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900">Timeout errors</h5>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>• Webhooks timeout after 5 seconds</li>
                        <li>• Ensure your n8n workflow responds quickly</li>
                        <li>• Use async processing for long-running tasks</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="checking-logs">
                <AccordionTrigger>Checking Webhook Logs</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Monitor webhook delivery status in your portal settings:
                  </p>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Go to <Link to={`/${franchiseeSlug}/portal/settings`} className="text-blue-600 underline">Portal Settings</Link></li>
                    <li>Find the "Workflow Integrations" card</li>
                    <li>Check the delivery status badge and recent logs</li>
                    <li>Look for HTTP status codes (200 = success, 4xx/5xx = error)</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger>Getting Support</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    If you're still experiencing issues:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>• Check the <a href="https://docs.n8n.io/webhooks/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">n8n webhook documentation</a></li>
                    <li>• Review your webhook logs for specific error messages</li>
                    <li>• Contact our support team with your webhook logs and error details</li>
                    <li>• Include your franchisee ID and the approximate time of the failed webhook</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
