import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Link2,
  Code2,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = useState<HTMLTextAreaElement | null>(null)[0];

  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    onChange(newContent);
  };

  const wrapSelection = (before: string, after: string = before) => {
    const textarea = document.querySelector('textarea[data-editor="true"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    const beforeText = editorContent.substring(0, start);
    const afterText = editorContent.substring(end);

    const newContent = beforeText + before + selectedText + after + afterText;
    setEditorContent(newContent);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertText = (text: string) => {
    const textarea = document.querySelector('textarea[data-editor="true"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = editorContent.substring(0, start);
    const afterText = editorContent.substring(end);

    const newContent = beforeText + text + afterText;
    setEditorContent(newContent);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const addHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    const textarea = document.querySelector('textarea[data-editor="true"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = editorContent.lastIndexOf('\n', start - 1) + 1;
    const beforeText = editorContent.substring(0, lineStart);
    const afterText = editorContent.substring(lineStart);

    const newContent = beforeText + prefix + afterText;
    setEditorContent(newContent);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    }, 0);
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      const alt = window.prompt('Enter image alt text (optional):') || 'Image';
      insertText(`![${alt}](${url})`);
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      const textarea = document.querySelector('textarea[data-editor="true"]') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editorContent.substring(start, end);
      
      if (selectedText) {
        wrapSelection('[', `](${url})`);
      } else {
        const text = window.prompt('Enter link text:') || 'Link';
        insertText(`[${text}](${url})`);
      }
    }
  };

  const addCodeBlock = () => {
    const lang = window.prompt('Enter language (optional):') || '';
    insertText(`\n\`\`\`${lang}\n\n\`\`\`\n`);
  };

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
      <div className="border-b border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-800/50">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => wrapSelection('**')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => wrapSelection('*')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => wrapSelection('~~')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => wrapSelection('`')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => addHeading(1)}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => addHeading(2)}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => addHeading(3)}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertText('\n- ')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertText('\n1. ')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertText('\n> ')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addCodeBlock}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addImage}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addLink}
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </Button>
      </div>
      
      <Textarea
        data-editor="true"
        value={editorContent}
        onChange={handleChange}
        placeholder={placeholder || 'Start writing your blog post...'}
        className="min-h-[400px] p-4 bg-gray-700 text-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono resize-none"
        style={{ fontFamily: 'ui-monospace, monospace' }}
      />

      <div className="border-t border-gray-600 p-2 bg-gray-800/50 text-xs text-gray-400">
        <p>
          Supports Markdown: **bold**, *italic*, `code`, [links](url), ![images](url), # headings, - lists, &gt; quotes, ```code blocks```
        </p>
      </div>
    </div>
  );
}
