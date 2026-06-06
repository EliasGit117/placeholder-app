import { type ComponentProps, forwardRef, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { RichEditorToolbar } from './toolbar';
import { cn } from '@/lib/utils';

interface IRichEditorProps extends Omit<ComponentProps<typeof Card>, 'onChange' | 'onBlur'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  contentClassName?: string;
}

export const RichEditor = forwardRef<HTMLDivElement, IRichEditorProps>(function RichEditor(props, ref) {
  const {
    value,
    defaultValue,
    onChange,
    onBlur,
    disabled = false,
    placeholder = '',
    className,
    contentClassName,
    ...cardProps
  } = props;

  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const isUserInteractingRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
          },
        }),
        Placeholder.configure({ placeholder }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      content: value ?? defaultValue ?? '',
      editable: !disabled,
      editorProps: {
        attributes: {
          class: cn(
            'tiptap-editor max-w-none min-h-[360px] px-4 py-3 text-foreground focus:outline-none',
            disabled && 'cursor-not-allowed opacity-80'
          ),
        },
        handleKeyDown: (_view, event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
            event.stopPropagation();
          }

          return false;
        },
      },
      onUpdate: ({ editor }) => {
        if (!isUserInteractingRef.current)
          return;

        onChangeRef.current?.(editor.getHTML());
      },
      onFocus: () => {
        isUserInteractingRef.current = true;
      },
      onBlur: () => {
        isUserInteractingRef.current = false;
        onBlurRef.current?.();
      },
    },
    []
  );

  useEffect(() => {
    if (!editor)
      return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor || value === undefined)
      return;

    const nextValue = value || '';
    const currentValue = editor.getHTML();

    if (currentValue === nextValue)
      return;

    editor.commands.setContent(nextValue, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!ref)
      return;

    const currentElement = editor?.view.dom as HTMLDivElement | null | undefined;

    if (typeof ref === 'function') {
      ref(currentElement ?? null);
      return () => ref(null);
    }

    ref.current = currentElement ?? null;

    return () => {
      ref.current = null;
    };
  }, [editor, ref]);

  return (
    <Card className={cn('p-0', className)} {...cardProps}>
      <CardContent className="space-y-0 p-0">
        <EditorContext.Provider value={{ editor }}>
          <RichEditorToolbar/>

          {editor ? (
            <EditorContent
              editor={editor}
              className={cn(
                'rounded-b-lg border-0 [&_.ProseMirror]:min-h-42 [&_.ProseMirror]:max-h-96 [&_.ProseMirror]:overflow-auto [&_.ProseMirror]:focus:outline-none dark:bg-input/30',
                contentClassName
              )}
            />
          ) : (
            // Editor mounts client-side only (immediatelyRender: false for SSR
            // safety). Render the HTML statically until it's ready to avoid a
            // blank flash and layout shift on load.
            <div
              className={cn('rounded-b-lg border-0 dark:bg-input/30', contentClassName)}
              aria-hidden
            >
              <div
                className="tiptap-editor max-w-none min-h-42 px-4 py-3 text-foreground"
                dangerouslySetInnerHTML={{ __html: value ?? defaultValue ?? '' }}
              />
            </div>
          )}
        </EditorContext.Provider>
      </CardContent>
    </Card>
  );
});
