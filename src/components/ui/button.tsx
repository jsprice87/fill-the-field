
import { Button as MantineButton, ButtonProps } from '@mantine/core';
export { ButtonProps };                 // re-export Mantine's real prop type
export const Button = MantineButton;    // keep old symbol name
export const buttonVariants = () => ''; // temporary stub; returns empty class
