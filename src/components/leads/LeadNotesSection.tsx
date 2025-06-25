import React, { useState } from 'react';
import { Card, Text, Stack, Button, Group, Textarea } from '@mantine/core';
import { MessageSquare, Plus } from 'lucide-react';
import { useLeadNotes, useCreateLeadNote } from '@/hooks/useLeadNotes';
import NoteCard from './NoteCard';

interface LeadNotesSectionProps {
  leadId: string;
}

const LeadNotesSection: React.FC<LeadNotesSectionProps> = ({ leadId }) => {
  const { data: notes, isLoading, error } = useLeadNotes(leadId);
  const createNote = useCreateLeadNote();
  const [newNoteText, setNewNoteText] = useState('');

  const handleAddNote = async () => {
    if (newNoteText.trim()) {
      try {
        await createNote.mutateAsync({ 
          leadId, 
          body: newNoteText.trim() 
        });
        setNewNoteText('');
      } catch (error) {
        console.error('Failed to add note:', error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleAddNote();
    }
  };

  if (isLoading) {
    return (
      <Card withBorder>
        <Card.Section p="md" withBorder>
          <Group gap="xs" align="center">
            <MessageSquare size={20} />
            <Text size="lg" fw={600}>Notes</Text>
          </Group>
        </Card.Section>
        <Card.Section p="md">
          <Text size="sm" c="dimmed">Loading notes...</Text>
        </Card.Section>
      </Card>
    );
  }

  if (error) {
    return (
      <Card withBorder>
        <Card.Section p="md" withBorder>
          <Group gap="xs" align="center">
            <MessageSquare size={20} />
            <Text size="lg" fw={600}>Notes</Text>
          </Group>
        </Card.Section>
        <Card.Section p="md">
          <Text size="sm" c="red">Error loading notes</Text>
        </Card.Section>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Card.Section p="md" withBorder>
        <Group gap="xs" align="center">
          <MessageSquare size={20} />
          <Text size="lg" fw={600}>Notes</Text>
          {notes && notes.length > 0 && (
            <Text size="sm" c="dimmed">({notes.length})</Text>
          )}
        </Group>
      </Card.Section>

      <Card.Section p="md">
        <Stack gap="md">
          {/* Add Note Section */}
          <div>
            <Textarea
              placeholder="Add a note about this lead... (Ctrl+Enter to save)"
              value={newNoteText}
              onChange={(event) => setNewNoteText(event.currentTarget.value)}
              maxLength={255}
              rows={3}
              autosize
              minRows={2}
              maxRows={4}
              onKeyDown={handleKeyPress}
            />
            <Group justify="space-between" mt="xs">
              <Text size="xs" c="dimmed">
                {newNoteText.length}/255 characters
              </Text>
              <Button
                size="sm"
                leftSection={<Plus size={16} />}
                onClick={handleAddNote}
                loading={createNote.isPending}
                disabled={!newNoteText.trim()}
              >
                Add Note
              </Button>
            </Group>
          </div>

          {/* Notes History */}
          {!notes || notes.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No notes yet. Add the first note above.
            </Text>
          ) : (
            <Stack gap="sm">
              <Text size="sm" fw={500} c="dimmed">Note History:</Text>
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default LeadNotesSection;