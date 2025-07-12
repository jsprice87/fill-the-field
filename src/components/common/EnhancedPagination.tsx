import React from 'react';
import { Group, Pagination, Select, Text, Stack, Box } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';

interface EnhancedPaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  showItemCount?: boolean;
  sticky?: boolean;
  itemName?: string; // e.g., "leads", "bookings", "locations"
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];

export const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showItemCount = true,
  sticky = true,
  itemName = 'items'
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Add "All" option if total items is reasonable (< 500)
  const enhancedOptions = totalItems < 500 
    ? [...pageSizeOptions, totalItems]
    : pageSizeOptions;

  const pageSizeSelectData = enhancedOptions.map(size => ({
    value: size.toString(),
    label: size === totalItems ? 'All' : size.toString()
  }));

  const containerStyle = sticky ? {
    position: 'sticky' as const,
    bottom: 0,
    backgroundColor: 'var(--mantine-color-body)',
    borderTop: '1px solid var(--mantine-color-gray-3)',
    zIndex: 100,
    padding: '12px 16px',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
  } : {
    padding: '12px 16px',
    borderTop: '1px solid var(--mantine-color-gray-3)'
  };

  if (totalItems === 0) {
    return (
      <Box style={containerStyle}>
        <Group justify="center">
          <Text size="sm" c="dimmed">
            No {itemName} found
          </Text>
        </Group>
      </Box>
    );
  }

  return (
    <Box style={containerStyle}>
      <Stack gap="xs">
        {/* Main pagination controls */}
        <Group justify="space-between" align="center">
          {/* Page size selector and item count */}
          <Group gap="md" align="center">
            <Group gap="xs" align="center">
              <Text size="sm" c="dimmed">
                Show:
              </Text>
              <Select
                value={pageSize.toString()}
                onChange={(value) => {
                  if (value) {
                    const newSize = parseInt(value);
                    onPageSizeChange(newSize);
                  }
                }}
                data={pageSizeSelectData}
                size="xs"
                style={{ width: '80px' }}
              />
              <Text size="sm" c="dimmed">
                per page
              </Text>
            </Group>

            {showItemCount && (
              <Group gap="xs" align="center">
                <IconUsers size={14} />
                <Text size="sm" c="dimmed">
                  {startItem}-{endItem} of {totalItems} {itemName}
                </Text>
              </Group>
            )}
          </Group>

          {/* Page navigation */}
          {totalPages > 1 && (
            <Pagination
              value={currentPage}
              onChange={onPageChange}
              total={totalPages}
              size="sm"
              siblings={1}
              boundaries={1}
            />
          )}
        </Group>

        {/* Quick page jump for large datasets */}
        {totalPages > 10 && (
          <Group justify="center">
            <Text size="xs" c="dimmed">
              Page {currentPage} of {totalPages}
            </Text>
          </Group>
        )}
      </Stack>
    </Box>
  );
};