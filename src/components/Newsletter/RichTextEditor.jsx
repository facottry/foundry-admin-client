import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // 'snow' is the standard theme
import api from '../../utils/api'; // Use our api wrapper

const RichTextEditor = ({ value, onChange }) => {
    const quillRef = useRef(null);

    // Custom Image Handler
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    // Upload to backend
                    const res = await api.post('/admin/uploads', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    // The backend should return { url: '...' }
                    // If api wrapper returns data directly, check implementation.
                    // api.js response interceptor returns response.data
                    // So res should be { url: '...' }

                    const url = res.url;

                    // Insert image into editor
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    const index = range ? range.index : quill.getLength();
                    quill.insertEmbed(index, 'image', url);

                } catch (error) {
                    console.error('Image upload failed', error);
                    const msg = error.response?.data?.error || error.message || 'Upload failed unknown reason';
                    alert(`Image upload failed: ${msg}`);
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image'
    ];

    return (
        <div className="rich-text-editor">
            <style>{`
                .ql-editor {
                    min-height: 300px;
                    font-size: 1.1rem;
                    line-height: 1.75;
                    font-family: 'Georgia', serif; /* Medium-ish font */
                }
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    background: white;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f8f9fa;
                }
            `}</style>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Write your story..."
            />
        </div>
    );
};

export default RichTextEditor;
