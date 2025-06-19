
import { Button } from '@mantine/core';

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Lovable</h1>
        <p className="text-xl text-gray-600 mb-8">Start building something amazing</p>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
}
