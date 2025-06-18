
import type { Meta, StoryObj } from '@storybook/react';
import { Modal, Menu, Tooltip } from '@/components/mantine';
import { Button } from '@/components/mantine/Button';
import { useDisclosure } from '@mantine/hooks';
import { Settings, Edit, Trash2, User } from 'lucide-react';

const meta: Meta = {
  title: 'Overlays/Mantine',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

// Modal Stories
export const ModalExample: StoryObj = {
  render: () => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
      <>
        <Button onClick={open}>Open Modal</Button>
        <Modal opened={opened} onClose={close} title="Example Modal">
          <p>This is a modal built with Mantine components.</p>
          <p>It includes focus trapping, keyboard navigation, and proper accessibility.</p>
          <Button onClick={close} variant="outline" style={{ marginTop: 16 }}>
            Close Modal
          </Button>
        </Modal>
      </>
    );
  },
};

// Menu Stories
export const MenuExample: StoryObj = {
  render: () => (
    <Menu>
      <Menu.Target>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Actions
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item leftSection={<User className="h-4 w-4" />}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<Edit className="h-4 w-4" />}>
          Edit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger Zone</Menu.Label>
        <Menu.Item leftSection={<Trash2 className="h-4 w-4" />} color="red">
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ),
};

// Tooltip Stories
export const TooltipExample: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tooltip label="This is a simple tooltip">
        <Button>Hover me</Button>
      </Tooltip>
      
      <Tooltip 
        label="This tooltip has an arrow and custom position" 
        position="right"
        withArrow
      >
        <Button variant="outline">Right tooltip</Button>
      </Tooltip>
      
      <Tooltip 
        label="This is a multiline tooltip that demonstrates longer content wrapping properly"
        multiline
        width={200}
      >
        <Button variant="subtle">Multiline tooltip</Button>
      </Tooltip>
    </div>
  ),
};

// Combined Example
export const CombinedOverlays: StoryObj = {
  render: () => {
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Tooltip label="Opens a modal dialog">
          <Button onClick={openModal}>Open Modal</Button>
        </Tooltip>

        <Menu>
          <Menu.Target>
            <Tooltip label="Right-click menu">
              <Button variant="outline">Menu</Button>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openModal}>Open Modal from Menu</Menu.Item>
            <Menu.Item>Another Action</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Modal opened={modalOpened} onClose={closeModal} title="Modal from Menu">
          <p>This modal was opened from a menu item!</p>
          <p>All overlays work together seamlessly.</p>
          <Button onClick={closeModal} variant="outline" style={{ marginTop: 16 }}>
            Close
          </Button>
        </Modal>
      </div>
    );
  },
};
