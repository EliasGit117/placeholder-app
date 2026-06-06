import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Editor, useCurrentEditor, useEditorState } from '@tiptap/react';
import { IconChevronDown } from '@tabler/icons-react';
import { formatShortcut } from './format-shortcut.ts';
import type { BlockType } from './types.ts';

const HEADING_LEVELS = [1, 2, 3, 4] as const;

function isBlockType(value: string): value is BlockType {
  return value === 'p' || value === 'h1' || value === 'h2' || value === 'h3' || value === 'h4';
}

function getActiveBlockType(editor: Editor): BlockType {
  for (const level of HEADING_LEVELS) {
    if (editor.isActive('heading', { level })) {
      if (level === 1) return 'h1';
      if (level === 2) return 'h2';
      if (level === 3) return 'h3';
      return 'h4';
    }
  }

  return 'p';
}

function setBlockType(editor: Editor, type: BlockType) {
  const chain = editor.chain().focus();

  if (type === 'p') {
    chain.setParagraph().run();
    return;
  }

  const level = Number(type.slice(1)) as 1 | 2 | 3 | 4;
  chain.setHeading({ level }).run();
}

function BlockTypeOption({ label, shortcut }: { label: string; shortcut: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <kbd className="rounded border bg-muted px-1 py-0.5 text-xs font-medium text-muted-foreground">
        {formatShortcut(shortcut)}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

export function BlockTypeDropdown() {
  const { editor } = useCurrentEditor();

  const blockType = useEditorState<BlockType>({
    editor,
    selector: ({ editor: currentEditor }) => (currentEditor ? getActiveBlockType(currentEditor) : 'p'),
  }) ?? 'p';

  const isDisabled = !editor || !editor.isEditable;

  const handleValueChange = (value: string) => {
    if (!editor || isDisabled) return;
    if (!isBlockType(value)) return;
    setBlockType(editor, value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isDisabled}
          className="h-8 justify-between gap-2 shadow-none min-w-18"
          onMouseDown={(event) => event.preventDefault()}
        >
          <span className="inline-flex items-center gap-1.5">{blockType.toUpperCase()}</span>
          <IconChevronDown className="size-4 text-muted-foreground"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuRadioGroup value={blockType} onValueChange={handleValueChange}>
          <DropdownMenuRadioItem value="p">
            <BlockTypeOption label="Paragraph" shortcut="Mod+Alt+0"/>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h1">
            <BlockTypeOption label="Heading 1" shortcut="Mod+Alt+1"/>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h2">
            <BlockTypeOption label="Heading 2" shortcut="Mod+Alt+2"/>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h3">
            <BlockTypeOption label="Heading 3" shortcut="Mod+Alt+3"/>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="h4">
            <BlockTypeOption label="Heading 4" shortcut="Mod+Alt+4"/>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
