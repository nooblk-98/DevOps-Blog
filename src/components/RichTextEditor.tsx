import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/es/languages/javascript.js'
import typescript from 'highlight.js/es/languages/typescript.js'
import bash from 'highlight.js/es/languages/bash.js'
import sql from 'highlight.js/es/languages/sql.js'
import json from 'highlight.js/es/languages/json.js'
import css from 'highlight.js/es/languages/css.js'
import html from 'highlight.js/es/languages/xml.js' // for html
import { EditorToolbar } from './EditorToolbar'

const lowlight = createLowlight()

// Register languages for syntax highlighting
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('bash', bash)
lowlight.register('sql', sql)
lowlight.register('json', json)
lowlight.register('css', css)
lowlight.register('html', html)

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we are using CodeBlockLowlight instead
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  })

  return (
    <div className="border border-input rounded-md">
      {editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
}