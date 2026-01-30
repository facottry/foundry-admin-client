import React, { useState, useEffect } from 'react';

const BlockEditor = ({ value, onChange }) => {
    // Value is expected to be a JSON string or Object of blocks
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        try {
            if (typeof value === 'string') {
                // Try parse JSON
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) setBlocks(parsed);
                else setBlocks([{ type: 'paragraph', content: value }]); // Fallback if string is raw html
            } else if (Array.isArray(value)) {
                setBlocks(value);
            } else {
                setBlocks([{ id: Date.now(), type: 'paragraph', content: '' }]);
            }
        } catch (e) {
            // Assume initial value is empty or raw text
            setBlocks([{ id: Date.now(), type: 'paragraph', content: '' }]);
        }
    }, [value]);

    const updateBlock = (index, content) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = content;
        setBlocks(newBlocks);
        propagateChange(newBlocks);
    };

    const addBlock = (index, type) => {
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, { id: Date.now(), type, content: '' });
        setBlocks(newBlocks);
        propagateChange(newBlocks);
    };

    const removeBlock = (index) => {
        if (blocks.length === 1) return;
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
        propagateChange(newBlocks);
    };

    const moveBlock = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[index + direction]] = [newBlocks[index + direction], newBlocks[index]];
        setBlocks(newBlocks);
        propagateChange(newBlocks);
    }

    const propagateChange = (newBlocks) => {
        // We propagate both structured blocks AND generated HTML
        const html = newBlocks.map(b => {
            switch (b.type) {
                case 'heading': return `<h2>${b.content}</h2>`;
                case 'image': return `<img src="${b.content}" style="max-width:100%;" alt="Newsletter Image" />`;
                case 'list': return `<ul><li>${b.content.replace(/\n/g, '</li><li>')}</li></ul>`;
                case 'divider': return `<hr />`;
                default: return `<p>${b.content}</p>`;
            }
        }).join('');

        const text = newBlocks.map(b => b.content).join('\n\n');

        onChange({ blocks: newBlocks, html, text });
    };

    return (
        <div className="border rounded-lg bg-white p-4 space-y-4">
            {blocks.map((block, index) => (
                <div key={block.id || index} className="group relative border border-transparent hover:border-gray-200 rounded p-2 transition-all">

                    {/* Controls */}
                    <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                        <div className="flex gap-1">
                            <button onClick={() => moveBlock(index, -1)} className="p-1 text-gray-400 hover:text-blue-500">↑</button>
                            <button onClick={() => moveBlock(index, 1)} className="p-1 text-gray-400 hover:text-blue-500">↓</button>
                        </div>
                        <button onClick={() => removeBlock(index)} className="p-1 text-red-300 hover:text-red-500">×</button>
                    </div>

                    {block.type === 'heading' && (
                        <input
                            className="w-full text-2xl font-bold border-none focus:ring-0 placeholder-gray-300"
                            placeholder="Heading"
                            value={block.content}
                            onChange={e => updateBlock(index, e.target.value)}
                        />
                    )}
                    {block.type === 'paragraph' && (
                        <textarea
                            className="w-full resize-none border-none focus:ring-0 p-0 text-gray-700 min-h-[4rem]"
                            placeholder="Type text..."
                            value={block.content}
                            onChange={e => updateBlock(index, e.target.value)}
                        />
                    )}
                    {block.type === 'image' && (
                        <div className="space-y-2">
                            <input
                                className="w-full text-sm border p-2 rounded bg-gray-50"
                                placeholder="Paste Image URL"
                                value={block.content}
                                onChange={e => updateBlock(index, e.target.value)}
                            />
                            {block.content && <img src={block.content} alt="Preview" className="max-w-xs rounded shadow-sm" />}
                        </div>
                    )}
                    {block.type === 'divider' && <hr className="my-4 border-gray-300" />}

                    {/* Add Buttons */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 z-10 bg-white shadow-md rounded-full flex gap-2 px-2 py-1 text-xs border">
                        <button onClick={() => addBlock(index, 'paragraph')} className="hover:text-blue-600">+ Text</button>
                        <button onClick={() => addBlock(index, 'heading')} className="hover:text-blue-600">+ Heading</button>
                        <button onClick={() => addBlock(index, 'image')} className="hover:text-blue-600">+ Img</button>
                        <button onClick={() => addBlock(index, 'divider')} className="hover:text-blue-600">+ Div</button>
                    </div>
                </div>
            ))}

            {blocks.length === 0 && (
                <div className="text-center py-10 text-gray-400 cursor-pointer" onClick={() => addBlock(-1, 'paragraph')}>
                    Click to add content
                </div>
            )}
        </div>
    );
};

export default BlockEditor;
