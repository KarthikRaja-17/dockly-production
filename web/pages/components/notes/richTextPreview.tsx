import React from 'react';

interface RichTextPreviewProps {
  content: string;
  style?: React.CSSProperties;
  maxLength?: number;
  className?: string;
}

const RichTextPreview: React.FC<RichTextPreviewProps> = ({
  content,
  style,
  maxLength,
  className = ''
}) => {
  // Function to truncate HTML content while preserving formatting
  const truncateHTML = (html: string, maxLen: number) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    if (plainText.length <= maxLen) {
      return html;
    }
    
    // If we need to truncate, we'll do a simple text truncation and add ellipsis
    const truncatedText = plainText.substring(0, maxLen);
    const words = truncatedText.split(' ');
    words.pop(); // Remove the last potentially incomplete word
    return words.join(' ') + '...';
  };

  const displayContent = maxLength && maxLength > 0 
    ? truncateHTML(content, maxLength)
    : content;

  return (
    <div 
      className={`rich-text-preview ${className}`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#4b5563',
        wordBreak: 'break-word',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: displayContent }}
    />
  );
};

export default RichTextPreview;