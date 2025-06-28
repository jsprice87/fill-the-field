# Create React Component Template

Generate a new React component for the Fill The Field project.

**Usage:** `/component ComponentName [type]`
- `ComponentName`: Name of the component (PascalCase)
- `type`: Optional - "mantine" or "ui" (default: mantine)

## Mantine Component Template (default):

```tsx
import React from 'react';
import { Card, Text, Group, Stack } from '@mantine/core';

interface {ComponentName}Props {
  // Add your props here
  children?: React.ReactNode;
}

const {ComponentName}: React.FC<{ComponentName}Props> = ({ 
  children,
  ...props 
}) => {
  return (
    <Card withBorder {...props}>
      <Card.Section p="md">
        <Text size="lg" fw={600}>
          {ComponentName}
        </Text>
      </Card.Section>
      
      <Card.Section p="md">
        <Stack gap="md">
          {children}
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default {ComponentName};
```

## shadcn/ui Component Template:

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface {ComponentName}Props {
  // Add your props here
  children?: React.ReactNode;
}

const {ComponentName}: React.FC<{ComponentName}Props> = ({ 
  children,
  ...props 
}) => {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{ComponentName}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default {ComponentName};
```

## Guidelines:
- Use **Mantine components** for portal/admin interfaces
- Use **shadcn/ui components** for public/booking interfaces  
- Follow existing patterns in the codebase
- Add proper TypeScript interfaces
- Include accessibility attributes when needed

**File Location Suggestions:**
- Portal components: `src/components/portal/`
- Booking components: `src/components/booking/`
- Shared components: `src/components/shared/`
- Mantine components: `src/components/mantine/`