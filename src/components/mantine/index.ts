// Mantine component exports for Phase 2
// These components have been migrated from shadcn/ui to Mantine

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './TextInput';
export type { InputProps } from './TextInput';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// Re-export Mantine Card from existing stub
export { Card } from './Card';
export type { CardProps } from './Card';

// Typography components
export { H1, H2, H3, H4, H5, H6, BodyLg, BodySm, CodeText } from './Typography';
export type { HeadingProps, BodyProps, CodeTextProps } from './Typography';

// New Mantine component exports for Phase 3 visual migration
export { Paper } from './Paper';
export type { PaperProps } from './Paper';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
export type { TableProps } from './Table';

// TODO: Add more components as they are migrated in future phases:
// export { Select } from './Select';
// export { Modal } from './Modal';
// export { Menu } from './Menu';
// export { Table } from './Table';
