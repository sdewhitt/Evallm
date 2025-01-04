import React from 'react';
import ReactMarkdown from 'react-markdown';
import './styles.css';

interface MarkdownRendererProps {
    content: string;
}
// prose prose-stone max-w-none
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="markdown-content max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;