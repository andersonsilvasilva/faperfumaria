"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const MODULES = {
  toolbar: [
    ["bold", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const FORMATS = ["bold", "underline", "list", "indent", "align", "color", "background"];

export function RichTextEditor({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="mt-1 rounded-sm border border-fa-stone/40 focus-within:border-fa-gold [&_.ql-toolbar]:rounded-t-sm [&_.ql-toolbar]:border-fa-stone/40 [&_.ql-container]:rounded-b-sm [&_.ql-container]:border-fa-stone/40 [&_.ql-editor]:min-h-32">
      <input type="hidden" name={name} value={value} />
      <ReactQuill theme="snow" value={value} onChange={setValue} modules={MODULES} formats={FORMATS} />
    </div>
  );
}
