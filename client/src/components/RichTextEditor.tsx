import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  testId?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, testId }: Props) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "blockquote"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "blockquote",
    "color",
    "background",
  ];

  return (
    <div className="rich-editor-wrap" data-testid={testId}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Ürün hakkında detaylı, SEO uyumlu açıklama yazın..."}
      />
    </div>
  );
}
