import Link from "next/link";
import type {
    BlockObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client";
import { cn } from "@/lib/utils";
import {
    getBlogPostHref,
    getRichTextPlainText,
    type NotionBlockNode,
} from "@/lib/notion";

type NotionRendererProps = {
    blocks: NotionBlockNode[];
    className?: string;
};

type NotionMediaFile =
    | {
          type: "external";
          external: {
              url: string;
          };
      }
    | {
          type: "file";
          file: {
              url: string;
          };
      };

function getColorClasses(color: RichTextItemResponse["annotations"]["color"]) {
    switch (color) {
        case "gray":
            return "text-neutral-500";
        case "brown":
            return "text-amber-700";
        case "orange":
            return "text-orange-600";
        case "yellow":
            return "text-yellow-600";
        case "green":
            return "text-emerald-600";
        case "blue":
            return "text-sky-600";
        case "purple":
            return "text-violet-600";
        case "pink":
            return "text-pink-600";
        case "red":
            return "text-red-600";
        default:
            return "";
    }
}

function renderRichText(richText: RichTextItemResponse[]) {
    return richText.map((segment, index) => {
        const content = (
            <span
                className={cn(
                    segment.annotations.bold && "font-semibold",
                    segment.annotations.italic && "italic",
                    segment.annotations.strikethrough && "line-through",
                    segment.annotations.underline && "underline underline-offset-4",
                    segment.annotations.code &&
                        "rounded bg-neutral-800/90 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-100",
                    getColorClasses(segment.annotations.color),
                )}
            >
                {segment.plain_text}
            </span>
        );

        if (segment.href) {
            return (
                <a
                    className="transition hover:opacity-80"
                    href={segment.href}
                    key={`${segment.plain_text}-${index}`}
                    rel="noreferrer"
                    target="_blank"
                >
                    {content}
                </a>
            );
        }

        return <span key={`${segment.plain_text}-${index}`}>{content}</span>;
    });
}

function getBlockRichText(block: BlockObjectResponse) {
    switch (block.type) {
        case "paragraph":
            return block.paragraph.rich_text;
        case "heading_1":
            return block.heading_1.rich_text;
        case "heading_2":
            return block.heading_2.rich_text;
        case "heading_3":
            return block.heading_3.rich_text;
        case "bulleted_list_item":
            return block.bulleted_list_item.rich_text;
        case "numbered_list_item":
            return block.numbered_list_item.rich_text;
        case "quote":
            return block.quote.rich_text;
        case "to_do":
            return block.to_do.rich_text;
        case "toggle":
            return block.toggle.rich_text;
        case "callout":
            return block.callout.rich_text;
        case "code":
            return block.code.rich_text;
        default:
            return [];
    }
}

function getFileUrl(file: NotionMediaFile | undefined) {
    if (!file) {
        return null;
    }

    if (file.type === "external") {
        return file.external.url;
    }

    return file.file.url;
}

function getMediaValue(
    block: BlockObjectResponse,
): NotionMediaFile | undefined {
    switch (block.type) {
        case "image":
            return block.image;
        case "video":
            return block.video;
        case "audio":
            return block.audio;
        case "pdf":
            return block.pdf;
        case "file":
            return block.file;
        default:
            return undefined;
    }
}

function renderList(
    blocks: NotionBlockNode[],
    type: "bulleted_list_item" | "numbered_list_item",
) {
    const ListTag = type === "bulleted_list_item" ? "ul" : "ol";

    return (
        <ListTag
            className={cn(
                "my-5 space-y-2 pl-6",
                type === "bulleted_list_item" ? "list-disc" : "list-decimal",
            )}
            key={blocks[0]?.block.id}
        >
            {blocks.map((node) => (
                <li className="pl-1 text-[1.05rem] leading-8" key={node.block.id}>
                    {renderRichText(getBlockRichText(node.block))}
                    {node.children.length > 0 ? (
                        <div className="mt-2">{renderBlockSequence(node.children)}</div>
                    ) : null}
                </li>
            ))}
        </ListTag>
    );
}

function renderTable(node: NotionBlockNode) {
    const rows = node.children.filter((child) => child.block.type === "table_row");

    if (rows.length === 0) {
        return null;
    }

    const hasColumnHeader = node.block.type === "table" && node.block.table.has_column_header;

    return (
        <div className="my-6 overflow-x-auto" key={node.block.id}>
            <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-white/10 bg-white/3">
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            className={cn(
                                "align-top",
                                hasColumnHeader && rowIndex === 0 && "bg-white/6 font-medium",
                            )}
                            key={row.block.id}
                        >
                            {row.block.type === "table_row"
                                ? row.block.table_row.cells.map((cell, cellIndex) => (
                                      <td
                                          className="border-b border-r border-white/10 px-4 py-3 text-sm last:border-r-0"
                                          key={`${row.block.id}-${cellIndex}`}
                                      >
                                          {renderRichText(cell)}
                                      </td>
                                  ))
                                : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function renderBlock(node: NotionBlockNode) {
    const { block, children } = node;

    switch (block.type) {
        case "paragraph":
            if (block.paragraph.rich_text.length === 0) {
                return <div className="h-6" key={block.id} />;
            }

            return (
                <p className="my-4 text-[1.05rem] leading-8 text-neutral-200" key={block.id}>
                    {renderRichText(block.paragraph.rich_text)}
                </p>
            );

        case "heading_1":
            return (
                <h1 className="mt-12 text-4xl font-semibold tracking-tight" key={block.id}>
                    {renderRichText(block.heading_1.rich_text)}
                </h1>
            );

        case "heading_2":
            return (
                <h2 className="mt-10 text-3xl font-semibold tracking-tight" key={block.id}>
                    {renderRichText(block.heading_2.rich_text)}
                </h2>
            );

        case "heading_3":
            return (
                <h3 className="mt-8 text-2xl font-semibold tracking-tight" key={block.id}>
                    {renderRichText(block.heading_3.rich_text)}
                </h3>
            );

        case "quote":
            return (
                <blockquote
                    className="my-6 border-l-2 border-white/20 pl-5 text-lg text-neutral-300"
                    key={block.id}
                >
                    {renderRichText(block.quote.rich_text)}
                    {children.length > 0 ? (
                        <div className="mt-3">{renderBlockSequence(children)}</div>
                    ) : null}
                </blockquote>
            );

        case "callout":
            return (
                <div
                    className="my-6 rounded-2xl border border-white/10 bg-white/6 px-5 py-4"
                    key={block.id}
                >
                    <div className="flex gap-3">
                        <div className="text-xl">
                            {block.callout.icon?.type === "emoji"
                                ? block.callout.icon.emoji
                                : "i"}
                        </div>
                        <div className="min-w-0 flex-1 text-neutral-200">
                            {renderRichText(block.callout.rich_text)}
                            {children.length > 0 ? (
                                <div className="mt-3">{renderBlockSequence(children)}</div>
                            ) : null}
                        </div>
                    </div>
                </div>
            );

        case "code":
            return (
                <div
                    className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950 p-4"
                    key={block.id}
                >
                    <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                        {block.code.language}
                    </div>
                    <pre className="font-mono text-sm leading-7 text-neutral-100">
                        <code>{getRichTextPlainText(block.code.rich_text)}</code>
                    </pre>
                </div>
            );

        case "divider":
            return <hr className="my-10 border-white/10" key={block.id} />;

        case "to_do":
            return (
                <div className="my-4" key={block.id}>
                    <label className="flex items-start gap-3 text-[1.05rem] leading-8 text-neutral-200">
                        <input
                            checked={block.to_do.checked}
                            className="mt-2 size-4 rounded border-white/20 bg-transparent"
                            readOnly
                            type="checkbox"
                        />
                        <span
                            className={cn(
                                block.to_do.checked && "text-neutral-500 line-through",
                            )}
                        >
                            {renderRichText(block.to_do.rich_text)}
                        </span>
                    </label>
                    {children.length > 0 ? (
                        <div className="mt-2 pl-7">{renderBlockSequence(children)}</div>
                    ) : null}
                </div>
            );

        case "toggle":
            return (
                <details
                    className="my-5 rounded-2xl border border-white/10 bg-white/4 px-4 py-3"
                    key={block.id}
                    open
                >
                    <summary className="cursor-pointer text-[1.05rem] leading-8 text-neutral-100 marker:text-neutral-500">
                        {renderRichText(block.toggle.rich_text)}
                    </summary>
                    {children.length > 0 ? (
                        <div className="mt-3">{renderBlockSequence(children)}</div>
                    ) : null}
                </details>
            );

        case "image": {
            const imageUrl = getFileUrl(getMediaValue(block));

            if (!imageUrl) {
                return null;
            }

            return (
                <figure className="my-8" key={block.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt={getRichTextPlainText(block.image.caption) || "Notion image"}
                        className="w-full rounded-2xl border border-white/10"
                        src={imageUrl}
                    />
                    {block.image.caption.length > 0 ? (
                        <figcaption className="mt-3 text-sm text-neutral-500">
                            {renderRichText(block.image.caption)}
                        </figcaption>
                    ) : null}
                </figure>
            );
        }

        case "video":
        case "audio":
        case "pdf":
        case "file": {
            const fileUrl = getFileUrl(getMediaValue(block));

            if (!fileUrl) {
                return null;
            }

            return (
                <a
                    className="my-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-neutral-100 transition hover:bg-white/8"
                    href={fileUrl}
                    key={block.id}
                    rel="noreferrer"
                    target="_blank"
                >
                    <span>{block.type}</span>
                    <span className="text-neutral-500">Open</span>
                </a>
            );
        }

        case "bookmark":
        case "embed":
        case "link_preview": {
            const url =
                block.type === "bookmark"
                    ? block.bookmark.url
                    : block.type === "embed"
                      ? block.embed.url
                      : block.link_preview.url;

            return (
                <a
                    className="my-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-neutral-100 transition hover:bg-white/8"
                    href={url}
                    key={block.id}
                    rel="noreferrer"
                    target="_blank"
                >
                    <span className="truncate">{url}</span>
                    <span className="ml-4 shrink-0 text-neutral-500">Visit</span>
                </a>
            );
        }

        case "child_page":
            return (
                <Link
                    className="my-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-neutral-100 transition hover:bg-white/8"
                    href={getBlogPostHref(block.id)}
                    key={block.id}
                >
                    <span>{block.child_page.title || "Untitled"}</span>
                    <span className="text-neutral-500">Open</span>
                </Link>
            );

        case "table":
            return renderTable(node);

        case "column_list":
            return (
                <div className="my-8 grid gap-4 md:grid-cols-2" key={block.id}>
                    {children.map((child) => renderBlock(child))}
                </div>
            );

        case "column":
        case "synced_block":
            return (
                <div className="space-y-2" key={block.id}>
                    {renderBlockSequence(children)}
                </div>
            );

        case "equation":
            return (
                <pre
                    className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 font-mono text-sm text-neutral-100"
                    key={block.id}
                >
                    <code>{block.equation.expression}</code>
                </pre>
            );

        case "breadcrumb":
        case "table_of_contents":
        case "child_database":
        case "unsupported":
        case "meeting_notes":
        case "transcription":
        case "link_to_page":
            return null;

        default:
            return null;
    }
}

function renderBlockSequence(blocks: NotionBlockNode[]) {
    const elements: React.ReactNode[] = [];

    for (let index = 0; index < blocks.length; index += 1) {
        const current = blocks[index];

        if (
            current.block.type === "bulleted_list_item" ||
            current.block.type === "numbered_list_item"
        ) {
            const listType = current.block.type;
            const grouped: NotionBlockNode[] = [current];

            while (
                index + 1 < blocks.length &&
                blocks[index + 1].block.type === listType
            ) {
                grouped.push(blocks[index + 1]);
                index += 1;
            }

            elements.push(renderList(grouped, listType));
            continue;
        }

        elements.push(renderBlock(current));
    }

    return elements;
}

export function NotionRenderer({ blocks, className }: NotionRendererProps) {
    return <div className={cn("text-neutral-100", className)}>{renderBlockSequence(blocks)}</div>;
}
