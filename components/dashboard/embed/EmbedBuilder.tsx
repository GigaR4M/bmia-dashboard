'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'

export interface EmbedField {
    name: string
    value: string
    inline: boolean
}

export interface EmbedData {
    content: string
    title: string
    description: string
    url: string
    color: string
    timestamp: boolean
    author: {
        name: string
        url: string
        icon_url: string
    }
    footer: {
        text: string
        icon_url: string
    }
    image_url: string
    thumbnail_url: string
    fields: EmbedField[]
}

interface EmbedBuilderProps {
    embed: EmbedData
    onChange: (embed: EmbedData) => void
}

export default function EmbedBuilder({ embed, onChange }: EmbedBuilderProps) {
    const updateField = (key: keyof EmbedData, value: any) => {
        onChange({ ...embed, [key]: value })
    }

    const updateNestedField = (parent: 'author' | 'footer', key: string, value: string) => {
        onChange({
            ...embed,
            [parent]: { ...embed[parent], [key]: value }
        })
    }

    const addField = () => {
        onChange({
            ...embed,
            fields: [...embed.fields, { name: 'Field Name', value: 'Field Value', inline: false }]
        })
    }

    const removeField = (index: number) => {
        const newFields = [...embed.fields]
        newFields.splice(index, 1)
        onChange({ ...embed, fields: newFields })
    }

    const updateEmbedField = (index: number, key: keyof EmbedField, value: any) => {
        const newFields = [...embed.fields]
        newFields[index] = { ...newFields[index], [key]: value }
        onChange({ ...embed, fields: newFields })
    }

    return (
        <div className="space-y-6 text-sm">
            {/* Basic Info */}
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Basic Information</h3>

                <div>
                    <label className="block text-gray-400 mb-1">Message Content (Outside Embed)</label>
                    <textarea
                        value={embed.content}
                        onChange={(e) => updateField('content', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-20"
                        placeholder="Text that appears above the embed..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={embed.color}
                                onChange={(e) => updateField('color', e.target.value)}
                                className="h-10 w-14 bg-transparent border-0 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={embed.color}
                                onChange={(e) => updateField('color', e.target.value)}
                                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={embed.timestamp}
                                onChange={(e) => updateField('timestamp', e.target.checked)}
                                className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-700 bg-gray-900"
                            />
                            <span className="text-gray-300">Show Timestamp</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Author */}
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Author</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-gray-400 mb-1">Author Name</label>
                        <input
                            type="text"
                            value={embed.author.name}
                            onChange={(e) => updateNestedField('author', 'name', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Author URL</label>
                        <input
                            type="text"
                            value={embed.author.url}
                            onChange={(e) => updateNestedField('author', 'url', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Author Icon URL</label>
                        <input
                            type="text"
                            value={embed.author.icon_url}
                            onChange={(e) => updateNestedField('author', 'icon_url', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Body</h3>
                <div>
                    <label className="block text-gray-400 mb-1">Title</label>
                    <input
                        type="text"
                        value={embed.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-bold"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Title URL</label>
                    <input
                        type="text"
                        value={embed.url}
                        onChange={(e) => updateField('url', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Description</label>
                    <textarea
                        value={embed.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white h-32"
                    />
                </div>
            </div>

            {/* Images */}
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Image URL (Bottom)</label>
                        <input
                            type="text"
                            value={embed.image_url}
                            onChange={(e) => updateField('image_url', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Thumbnail URL (Top Right)</label>
                        <input
                            type="text"
                            value={embed.thumbnail_url}
                            onChange={(e) => updateField('thumbnail_url', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-white">Fields</h3>
                    <button
                        onClick={addField}
                        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                    >
                        <Plus size={14} /> Add Field
                    </button>
                </div>

                <div className="space-y-3">
                    {embed.fields.map((field, index) => (
                        <div key={index} className="flex gap-2 items-start bg-gray-900/50 p-3 rounded border border-gray-700">
                            <div className="mt-2 text-gray-500 cursor-grab">
                                <GripVertical size={16} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) => updateEmbedField(index, 'name', e.target.value)}
                                            placeholder="Field Name"
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={field.inline}
                                                onChange={(e) => updateEmbedField(index, 'inline', e.target.checked)}
                                                className="form-checkbox h-3 w-3 text-blue-500 rounded border-gray-600 bg-gray-800"
                                            />
                                            <span className="text-gray-400 text-xs">Inline</span>
                                        </label>
                                    </div>
                                </div>
                                <textarea
                                    value={field.value}
                                    onChange={(e) => updateEmbedField(index, 'value', e.target.value)}
                                    placeholder="Field Value"
                                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm h-16"
                                />
                            </div>
                            <button
                                onClick={() => removeField(index)}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {embed.fields.length === 0 && (
                        <div className="text-center text-gray-500 py-4 italic">
                            No fields added yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Footer</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-gray-400 mb-1">Footer Text</label>
                        <input
                            type="text"
                            value={embed.footer.text}
                            onChange={(e) => updateNestedField('footer', 'text', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Footer Icon URL</label>
                        <input
                            type="text"
                            value={embed.footer.icon_url}
                            onChange={(e) => updateNestedField('footer', 'icon_url', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
