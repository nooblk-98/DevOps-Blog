import { useEditor } from '@tiptap/react'
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Rows,
  Image as ImageIcon,
  Palette,
  Highlighter,
  Eraser,
  ChevronDown,
  Terminal,
  Minus,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useState, useRef } from 'react'
import { ImageUploadDialog } from './ImageUploadDialog'

type Props = {
  editor: ReturnType<typeof useEditor>
  stickyOffset?: number
  sticky?: boolean
}

export function EditorToolbar({ editor, stickyOffset = 0, sticky = true }: Props) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const highlightColorInputRef = useRef<HTMLInputElement>(null);
  const [lastTextColor, setLastTextColor] = useState('#000000');
  const [lastHighlightColor, setLastHighlightColor] = useState('#ffff00');

  if (!editor) {
    return null
  }

  const handleInsertImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    editor.chain().focus().setColor(newColor).run();
    setLastTextColor(newColor);
  };

  const handleHighlightColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    editor.chain().focus().toggleHighlight({ color: newColor }).run();
    setLastHighlightColor(newColor);
  };

  const preventDefault = (e: Event) => e.preventDefault();

  const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New'];
  
  const getDisplayFont = () => {
    const fontFamily = editor.getAttributes('textStyle').fontFamily;
    if (!fontFamily) {
      return 'Default';
    }
    // Get the first font from the stack, remove quotes
    return fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  };
  
  const currentFont = getDisplayFont();

  return (
    <>
      <div
        className={(sticky ? 'sticky z-20 ' : '') + 'bg-background border-b border-input p-2 flex flex-wrap items-center gap-1'}
        style={sticky ? { top: `calc(var(--settings-nav-offset, 0px) + ${stickyOffset}px)` } : undefined}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="w-32 justify-between">
              <span className="truncate">{currentFont}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {fonts.map((font) => (
              <DropdownMenuItem
                key={font}
                onSelect={preventDefault}
                onClick={() => editor.chain().focus().setFontFamily(font).run()}
                style={{ fontFamily: font }}
              >
                {font}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={preventDefault} onClick={() => editor.chain().focus().unsetFontFamily().run()}>
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => textColorInputRef.current?.click()}
          className="w-8 h-8 p-0"
          title="Text Color"
        >
          <Palette className="h-4 w-4" />
        </Button>
        <input
          type="color"
          ref={textColorInputRef}
          className="w-0 h-0 p-0 border-0 absolute -z-10"
          onChange={handleTextColorChange}
          value={editor.getAttributes('textStyle').color || lastTextColor}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="w-8 h-8 p-0"
          title="Clear Text Color"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => highlightColorInputRef.current?.click()}
          className="w-8 h-8 p-0"
          title="Highlight Color"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <input
          type="color"
          ref={highlightColorInputRef}
          className="w-0 h-0 p-0 border-0 absolute -z-10"
          onChange={handleHighlightColorChange}
          value={editor.getAttributes('highlight').color || lastHighlightColor}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="w-8 h-8 p-0"
          title="Clear Highlight"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('codeBlock')}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Terminal className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="w-8 h-8 p-0"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsImageDialogOpen(true)}
          className="w-8 h-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        {/* Alignment controls */}
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'justify' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>
        {/* Line Height Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 h-8 p-0">
              <Rows className="h-4 w-4" />
              <span className="sr-only">Line Height</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={preventDefault} onClick={() => editor.chain().focus().setMark('textStyle', { lineHeight: '1.2' }).run()}>
              Compact (1.2)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={preventDefault} onClick={() => editor.chain().focus().setMark('textStyle', { lineHeight: '1.5' }).run()}>
              Normal (1.5)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={preventDefault} onClick={() => editor.chain().focus().setMark('textStyle', { lineHeight: '2.0' }).run()}>
              Spacious (2.0)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={preventDefault} onClick={() => editor.chain().focus().unsetMark('textStyle').run()}>
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ImageUploadDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onInsert={handleInsertImage}
      />
    </>
  )
}
