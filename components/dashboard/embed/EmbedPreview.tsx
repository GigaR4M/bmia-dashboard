'use client'

import { EmbedData } from './EmbedBuilder'

interface EmbedPreviewProps {
    embed: EmbedData
}

export default function EmbedPreview({ embed }: EmbedPreviewProps) {
    // Default Discord embed color if none selected
    const embedColor = embed.color || '#202225'

    return (
        <div className="bg-[#36393f] p-4 rounded-md font-sans text-gray-100 max-w-lg w-full">
            <div className="flex items-start">
                {/* Side color bar */}
                <div
                    className="w-1 rounded-l-md mr-3 flex-shrink-0 self-stretch"
                    style={{ backgroundColor: embedColor }}
                ></div>

                <div className="flex-grow min-w-0">
                    {/* Author */}
                    {embed.author.name && (
                        <div className="flex items-center mb-2">
                            {embed.author.icon_url && (
                                <img
                                    src={embed.author.icon_url}
                                    alt=""
                                    className="w-6 h-6 rounded-full mr-2 object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            )}
                            <span className="text-sm font-semibold text-white">
                                {embed.author.name}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    {embed.title && (
                        <div className="mb-2">
                            {embed.url ? (
                                <a
                                    href={embed.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline font-semibold text-base block break-words"
                                >
                                    {embed.title}
                                </a>
                            ) : (
                                <div className="font-semibold text-white text-base block break-words">
                                    {embed.title}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {embed.description && (
                        <div className="text-sm text-[#dcddde] whitespace-pre-wrap break-words mb-2">
                            {embed.description}
                        </div>
                    )}

                    {/* Fields */}
                    {embed.fields.length > 0 && (
                        <div className="grid grid-cols-12 gap-2 mt-2">
                            {embed.fields.map((field, index) => (
                                <div
                                    key={index}
                                    className={`${field.inline ? 'col-span-4' : 'col-span-12'} min-w-0`}
                                >
                                    <div className="text-xs font-semibold text-[#8e9297] mb-1 truncate">
                                        {field.name}
                                    </div>
                                    <div className="text-sm text-[#dcddde] whitespace-pre-wrap break-words">
                                        {field.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    {embed.image_url && (
                        <div className="mt-3">
                            <img
                                src={embed.image_url}
                                alt="Embed Image"
                                className="rounded-md max-w-full max-h-[300px] object-cover"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}

                    {/* Footer */}
                    {(embed.footer.text || embed.timestamp) && (
                        <div className="mt-2 flex items-center text-xs text-[#72767d]">
                            {embed.footer.icon_url && (
                                <img
                                    src={embed.footer.icon_url}
                                    alt=""
                                    className="w-5 h-5 rounded-full mr-2 object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            )}
                            <span>
                                {embed.footer.text}
                                {embed.footer.text && embed.timestamp && ' • '}
                                {embed.timestamp && new Date().toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Thumbnail (Top Right) */}
                {embed.thumbnail_url && (
                    <div className="ml-4 flex-shrink-0">
                        <img
                            src={embed.thumbnail_url}
                            alt="Thumbnail"
                            className="w-20 h-20 rounded-md object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
