"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Heading from "@tiptap/extension-heading";
import { lowlight } from "lowlight/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import "highlight.js/styles/github-dark.css"; // or any other style you prefer
import { Button } from "../../button";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

// Register the languages you want to support
lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("javascript", javascript);

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const { t } = useTranslation();

  const addImage = () => {
    const url = window.prompt(t("insertImage"));
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt(t("insertLink"));
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  };

  return (
    <div className={`mb15 f g2`}>
      {/* Text Style */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleBold().run(),
          disabled: !editor.can().chain().focus().toggleBold().run(),
          className: editor.isActive("bold") ? "bg-accent" : "",
          title: t("bold"),
        }}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleItalic().run(),
          className: editor.isActive("italic") ? "bg-accent" : "",
          title: t("italic"),
        }}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          className: editor.isActive("underline") ? "bg-accent" : "",
          title: t("underline"),
        }}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleStrike().run(),
          className: editor.isActive("strike") ? "bg-accent" : "",
          title: t("strikethrough"),
        }}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      {/* Lists */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          className: editor.isActive("bulletList") ? "bg-accent" : "",
          title: t("bulletList"),
        }}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          className: editor.isActive("orderedList") ? "bg-accent" : "",
          title: t("numberedList"),
        }}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      {/* Alignment */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
          className: editor.isActive({ textAlign: "left" }) ? "bg-accent" : "",
          title: t("alignLeft"),
        }}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
          className: editor.isActive({ textAlign: "center" })
            ? "bg-accent"
            : "",
          title: t("alignCenter"),
        }}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
          className: editor.isActive({ textAlign: "right" }) ? "bg-accent" : "",
          title: t("alignRight"),
        }}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().setTextAlign("justify").run(),
          className: editor.isActive({ textAlign: "justify" })
            ? "bg-accent"
            : "",
          title: t("justify"),
        }}
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      {/* Special Text */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleSubscript().run(),
          className: editor.isActive("subscript") ? "bg-accent" : "",
          title: t("subscript"),
        }}
      >
        <SubscriptIcon className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleSuperscript().run(),
          className: editor.isActive("superscript") ? "bg-accent" : "",
          title: t("superscript"),
        }}
      >
        <SuperscriptIcon className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleHighlight().run(),
          className: editor.isActive("highlight") ? "bg-accent" : "",
          title: t("highlight"),
        }}
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      {/* Block Elements */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
          className: editor.isActive("blockquote") ? "bg-accent" : "",
          title: t("blockQuote"),
        }}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
          className: editor.isActive("codeBlock") ? "bg-accent" : "",
          title: t("codeBlock"),
        }}
      >
        <Code className="h-4 w-4" />
      </Button>

      {/* Headings */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
          className: editor.isActive("heading", { level: 1 })
            ? "bg-accent"
            : "",
          title: t("heading1"),
        }}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          className: editor.isActive("heading", { level: 2 })
            ? "bg-accent"
            : "",
          title: t("heading2"),
        }}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          className: editor.isActive("heading", { level: 3 })
            ? "bg-accent"
            : "",
          title: t("heading3"),
        }}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 4 }).run(),
          className: editor.isActive("heading", { level: 4 })
            ? "bg-accent"
            : "",
          title: t("heading4"),
        }}
      >
        <Heading4 className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 5 }).run(),
          className: editor.isActive("heading", { level: 5 })
            ? "bg-accent"
            : "",
          title: t("heading5"),
        }}
      >
        <Heading5 className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 6 }).run(),
          className: editor.isActive("heading", { level: 6 })
            ? "bg-accent"
            : "",
          title: t("heading6"),
        }}
      >
        <Heading6 className="h-4 w-4" />
      </Button>

      {/* Media */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: addImage,
          title: t("insertImage"),
        }}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: addLink,
          title: t("insertLink"),
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: addTable,
          title: t("insertTable"),
        }}
      >
        <TableIcon className="h-4 w-4" />
      </Button>

      {/* Color Picker */}
      <input
        {...{
          type: "color",
          onInput: (e) => editor.chain().focus().setColor(e.target.value).run(),
          value: editor.getAttributes("textStyle").color || "#000000",
          className: "w-9 h-9 p-1 rounded-lg bg-transparent bw1",
          title: t("textColor"),
        }}
      />

      {/* History */}
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().chain().focus().undo().run(),
          title: t("undo"),
        }}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        {...{
          variant: "outline",
          size: "icon",
          onClick: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().chain().focus().redo().run(),
          title: t("redo"),
        }}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function TipTap({
  content = "",
  onChange,
  placeholder = "",
  settingsPosition = "top",
  isSettingsVisible = true,
  editorClassName,
}) {
  const { t } = useTranslation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable the default code block
      }),
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      Color,
      TextStyle,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-700 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || t("composePost"),
        showOnlyWhenEditable: true,
        emptyEditorClass: "is-editor-empty",
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `fz16 prose dark:prose-invert prose-sm m-5 focus:outline-none min-h-[200px] ${editorClassName} [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:h-0`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    // HACK TO MAKE IT WF w/ settings on/off
    // TODO !! bad on mobile
    <div className="wf">
      {settingsPosition === "top" ? (
        <>
          {/* SETTINGS  */}
          {isSettingsVisible && (
            <div className={`👋 wf border-none rounded-lg p15`}>
              <MenuBar {...{ editor }} />
            </div>
          )}
          {/* TEXT EDITOR  */}
          <div
            className={`wf border-none rounded-lg ${
              !isSettingsVisible ? "mt-4" : ""
            }`}
          >
            <EditorContent {...{ editor }} />
          </div>
        </>
      ) : (
        <>
          {/* TEXT EDITOR  */}
          <div className="wf border-none rounded-lg">
            <EditorContent {...{ editor }} />
          </div>
          {/* SETTINGS  */}
          {isSettingsVisible && (
            <div className={`👋 wf border-none rounded-lg p15 mt-4`}>
              <MenuBar {...{ editor }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
