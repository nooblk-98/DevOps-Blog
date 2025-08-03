import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml' // for html
import { EditorToolbar } from './EditorToolbar'

// Register languages for syntax highlighting
lowlight.registerLanguage('javascript', javascript)
lowlight.registerLanguage('typescript', typescript)
lowlight.registerLanguage('bash', bash)
lowlight.registerLanguage('sql', sql)
lowlight.registerLanguage('json', json)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('html', html)

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