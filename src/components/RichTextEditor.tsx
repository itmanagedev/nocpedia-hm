import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900/50 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-800 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-800 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[100px] p-4 font-sans',
      },
    },
  });

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden focus-within:border-emerald-500/50 transition-colors">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
