
import React from 'react';
import { Modal as MantineModal, ModalProps as MantineModalProps } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface ModalProps extends Omit<MantineModalProps, 'transitionProps'> {
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  size = 'lg',
  radius = 'lg',
  padding = 'xl',
  overlayProps = { blur: 3 },
  withinPortal = true,
  trapFocus = true,
  closeOnEscape = true,
  centered = true,
  children,
  ...props
}) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const transitionProps = prefersReducedMotion 
    ? { transition: 'fade' as const, duration: 0 }
    : { transition: 'pop' as const, duration: 200 };

  return (
    <MantineModal
      size={size}
      radius={radius}
      padding={padding}
      overlayProps={overlayProps}
      transitionProps={transitionProps}
      withinPortal={withinPortal}
      trapFocus={trapFocus}
      closeOnEscape={closeOnEscape}
      centered={centered}
      {...props}
    >
      {children}
    </MantineModal>
  );
};
