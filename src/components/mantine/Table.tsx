
import {
  Table as MTable,
  TableProps as MTableProps,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import { forwardRef } from "react";

export type TableProps = MTableProps & {
  /** Enable horizontal scrolling */
  horizontalSpacing?: string | number;
  /** Enable sticky header */
  stickyHeader?: boolean;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, stickyHeader = true, horizontalSpacing = "md", ...props }, ref) => {
    const tableContent = (
      <MTable 
        ref={ref} 
        horizontalSpacing={horizontalSpacing}
        {...props}
        style={{
          minWidth: '100%',
          ...props.style
        }}
      >
        {children}
      </MTable>
    );

    if (stickyHeader) {
      return (
        <ScrollArea type="auto">
          {tableContent}
        </ScrollArea>
      );
    }

    return tableContent;
  },
);
Table.displayName = "Table";

// Individual table components for compatibility
export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, ...props }, ref) => (
    <thead ref={ref} {...props} style={{ position: 'sticky', top: 0, zIndex: 30, backgroundColor: 'var(--mantine-color-body)', ...props.style }}>
      {children}
    </thead>
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, ...props }, ref) => (
    <tbody ref={ref} {...props}>
      {children}
    </tbody>
  )
);
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }>(
  ({ children, interactive = false, className, ...props }, ref) => {
    return (
      <tr 
        ref={ref} 
        {...props}
        style={{
          transition: 'background-color 200ms cubic-bezier(0.4,0,0.2,1)',
          cursor: interactive ? 'pointer' : undefined,
          ...props.style
        }}
        className={`${className || ''} hover:bg-mantine-hover`}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ children, ...props }, ref) => (
    <th ref={ref} {...props} style={{ padding: '12px 16px', fontWeight: 600, ...props.style }}>
      {children}
    </th>
  )
);
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ children, ...props }, ref) => (
    <td ref={ref} {...props} style={{ padding: '12px 16px', ...props.style }}>
      {children}
    </td>
  )
);
TableCell.displayName = "TableCell";
