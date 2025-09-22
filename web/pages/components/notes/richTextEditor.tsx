"use client";

import React, { useRef, useEffect } from "react";
import { Button, Divider } from "antd";
import {
  BoldOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  UndoOutlined,
  RedoOutlined,
} from "@ant-design/icons";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const RichTextEditor = ({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const applyFormat = (command: string, value?: string) => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", ...style }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
        }}
      >
        <Button size="small" icon={<BoldOutlined />} onClick={() => applyFormat("bold")} />
        <Button size="small" icon={<UnorderedListOutlined />} onClick={() => applyFormat("insertUnorderedList")} />
        <Button size="small" icon={<OrderedListOutlined />} onClick={() => applyFormat("insertOrderedList")} />
        <Divider type="vertical" style={{ height: "28px", margin: "0 4px" }} />
        <Button size="small" icon={<UndoOutlined />} onClick={() => applyFormat("undo")} />
        <Button size="small" icon={<RedoOutlined />} onClick={() => applyFormat("redo")} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: "100px",
          padding: "12px",
          fontSize: "14px",
          lineHeight: "1.5",
          fontFamily: FONT_FAMILY,
          outline: "none",
          wordBreak: "break-word",
        }}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
