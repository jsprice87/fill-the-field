import React, { useState } from 'react';
import { Card, Text, Group, Button, Textarea, Menu, ActionIcon } from '@mantine/core';
import { MessageSquare, Edit, Trash, MoreVertical, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUpdateLeadNote, useDeleteLeadNote, type LeadNote } from '@/hooks/useLeadNotes';

interface NoteCardProps {
  note: LeadNote;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.body);
  const updateNote = useUpdateLeadNote();
  const deleteNote = useDeleteLeadNote();

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(note.body);
  };

  const handleSave = async () => {
    if (editText.trim() && editText.trim() !== note.body) {
      try {
        await updateNote.mutateAsync({ 
          noteId: note.id, 
          body: editText.trim() 
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update note:', error);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(note.body);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote.mutateAsync(note.id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const noteAge = formatDistanceToNow(new Date(note.created_at), { addSuffix: true });
  const wasUpdated = note.updated_at !== note.created_at;

  return (
    <Card withBorder>
      <Card.Section p="sm">
        <Group justify="space-between" align="flex-start" mb="xs">
          <Group gap="xs" align="center">
            <MessageSquare size={16} />
            <Text size="xs" c="dimmed">
              {noteAge}
              {wasUpdated && (
                <Text component="span" c="dimmed"> (edited)</Text>
              )}
            </Text>
          </Group>

          {!isEditing && (
            <Menu shadow="md" withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm">
                  <MoreVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<Edit size={14} />}
                  onClick={handleEdit}
                >
                  Edit Note
                </Menu.Item>
                <Menu.Item 
                  leftSection={<Trash size={14} />}
                  color="red"
                  onClick={handleDelete}
                >
                  Delete Note
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {isEditing ? (
          <div>
            <Textarea
              value={editText}
              onChange={(event) => setEditText(event.currentTarget.value)}
              maxLength={255}
              rows={3}
              mb="xs"
              autosize
              minRows={2}
              maxRows={4}
            />
            <Group gap="xs" justify="flex-end">
              <Button
                variant="outline"
                size="xs"
                leftSection={<X size={14} />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                leftSection={<Check size={14} />}
                onClick={handleSave}
                loading={updateNote.isPending}
                disabled={!editText.trim() || editText.trim() === note.body}
              >
                Save
              </Button>
            </Group>
          </div>
        ) : (
          <Text size="sm">{note.body}</Text>
        )}
      </Card.Section>
    </Card>
  );
};

export default NoteCard;