
import React from 'react';
import { Menu as MantineMenu, MenuProps } from '@mantine/core';

interface MenuWrapperProps extends MenuProps {
  children: React.ReactNode;
}

export const Menu: React.FC<MenuWrapperProps> & {
  Target: typeof MantineMenu.Target;
  Dropdown: typeof MantineMenu.Dropdown;
  Item: typeof MantineMenu.Item;
  Label: typeof MantineMenu.Label;
  Divider: typeof MantineMenu.Divider;
} = ({
  shadow = 'sm',
  radius = 'md',
  offset = 5,
  children,
  ...props
}) => {
  return (
    <MantineMenu
      shadow={shadow}
      radius={radius}
      offset={offset}
      {...props}
    >
      {children}
    </MantineMenu>
  );
};

// Attach sub-components
Menu.Target = MantineMenu.Target;
Menu.Dropdown = MantineMenu.Dropdown;
Menu.Item = MantineMenu.Item;
Menu.Label = MantineMenu.Label;
Menu.Divider = MantineMenu.Divider;
