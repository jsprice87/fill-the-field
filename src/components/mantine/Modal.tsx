
import React from 'react';
import { Modal as MantineModal, ModalProps as MantineModalProps } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface ModalProps extends Omit<MantineModalProps, 'transitionProps'> {
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  ...props
}) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const transitionProps = prefersReducedMotion 
    ? { transition: 'fade', duration: 0 }
    : { transition: 'pop', duration: 200 };

  return (
    <MantineModal
      radius="lg"
      padding="xl"
      overlayProps={{ blur: 4 }}
      transitionProps={transitionProps}
      withinPortal
      trapFocus
      closeOnEscape
      centered
      {...props}
    >
      {children}
    </MantineModal>
  );
};
