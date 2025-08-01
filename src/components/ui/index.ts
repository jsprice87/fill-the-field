
// Phase 2: Export migrated Mantine components
export { Button } from '../mantine/Button';
export type { ButtonProps } from '../mantine/Button';

export { Input, TextInput } from '../mantine/TextInput';
export type { InputProps } from '../mantine/TextInput';

export { Textarea } from '../mantine/Textarea';
export type { TextareaProps } from '../mantine/Textarea';

export { Badge } from '../mantine/Badge';
export type { BadgeProps } from '../mantine/Badge';

export { Select } from '../mantine/Select';
export type { SelectProps } from '../mantine/Select';

// Legacy adapters for booking pages
export { Button as LegacyButton } from './button';
export { Card, CardContent, CardHeader, CardTitle } from './card';
export { Input as LegacyInput } from './input';

// Still using shadcn/ui - will be migrated in future phases
export * from './dialog';
export * from './table';
export * from './tabs';
export * from './checkbox';
export * from './switch';
export * from './tooltip';
export * from './progress';
export * from './separator';
export * from './scroll-area';
export * from './slider';
export * from './radio-group';
export * from './hover-card';
export * from './skeleton';
export * from './input-otp';
export * from './popover';
export * from './sheet';
export * from './toggle';
export * from './toggle-group';
export * from './pagination';
export * from './drawer';
export * from './resizable';
export * from './label';
export * from './accordion';
export * from './alert-dialog';
export * from './alert';
export * from './aspect-ratio';
export * from './avatar';
export * from './breadcrumb';
export * from './calendar';
export * from './carousel';
export * from './chart';
export * from './collapsible';
export * from './command';
export * from './context-menu';
export * from './enhanced-checkbox';
export * from './enhanced-input';
export * from './enhanced-select';
export * from './enhanced-textarea';
export * from './field-group';
export * from './form-section';
export * from './menubar';
export * from './navigation-menu';

// Simplified sidebar exports (compatibility)
export { default as AppSidebar } from './sidebar';

// Ensure these exports exist (SearchInput and TableRowMenu)
export { default as SearchInput } from '../shared/SearchInput';
export { TableRowMenu } from './TableRowMenu';
