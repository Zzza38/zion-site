import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
    APIErrorCode,
    APIResponseError,
    Client,
    collectPaginatedAPI,
    extractPageId,
    isFullBlock,
    isFullPage,
} from "@notionhq/client";
import type {
    BlockObjectResponse,
    PageObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client";

export type NotionBlockNode = {
    block: BlockObjectResponse;
    children: NotionBlockNode[];
};

export type BlogPostSummary = {
    id: string;
    title: string;
    href: string;
    createdAt: string;
};

const fallbackRootPageId = "32cb7473-11ad-80bd-9a2f-e6d2120e8b03";

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
    notionVersion: "2026-03-11",
});

function assertNotionConfig() {
    if (!process.env.NOTION_API_KEY) {
        throw new Error("Add NOTION_API_KEY to .env.local.");
    }
}

function normalizePageId(input: string) {
    const pageId = extractPageId(input);

    if (!pageId) {
        throw new Error(`"${input}" is not a valid page ID or page URL.`);
    }

    return pageId;
}

export function getRichTextPlainText(richText: RichTextItemResponse[] = []) {
    return richText.map((segment) => segment.plain_text).join("");
}

export function getPageTitle(page: PageObjectResponse) {
    for (const property of Object.values(page.properties)) {
        if (property.type === "title") {
            return getRichTextPlainText(property.title) || "Untitled";
        }
    }

    return "Untitled";
}

export function getBlogPostHref(pageId: string) {
    return `/blog/${normalizePageId(pageId)}`;
}

async function getChildBlocks(blockId: string) {
    const blocks = await collectPaginatedAPI(notion.blocks.children.list, {
        block_id: blockId,
    });

    return blocks.filter(isFullBlock);
}

async function getBlockTree(blockId: string): Promise<NotionBlockNode[]> {
    const blocks = await getChildBlocks(blockId);

    return Promise.all(
        blocks.map(async (block) => ({
            block,
            children: block.has_children ? await getBlockTree(block.id) : [],
        })),
    );
}

const getCachedNotionPage = unstable_cache(
    async (pageId: string): Promise<{
        page: PageObjectResponse;
        blocks: NotionBlockNode[];
    }> => {
        assertNotionConfig();

        const page = await notion.pages.retrieve({ page_id: pageId });

        if (!isFullPage(page)) {
            throw new Error("The page response was incomplete.");
        }

        return {
            page,
            blocks: await getBlockTree(pageId),
        };
    },
    ["blog-page"],
    {
        revalidate: 600,
        tags: ["blog"],
    },
);

const getCachedBlogIndexData = unstable_cache(
    async (rootPageId: string) => {
        const { page, blocks } = await getCachedNotionPage(rootPageId);
        const subpages: BlogPostSummary[] = [];

        for (const node of blocks) {
            if (node.block.type !== "child_page") {
                continue;
            }

            subpages.push({
                id: node.block.id,
                title: node.block.child_page.title || "Untitled",
                href: getBlogPostHref(node.block.id),
                createdAt: node.block.created_time,
            });
        }

        subpages.sort(
            (left, right) =>
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime(),
        );

        return {
            page,
            blocks,
            contentBlocks: blocks.filter(
                (node) => node.block.type !== "child_page",
            ),
            subpages,
        };
    },
    ["blog-index"],
    {
        revalidate: 600,
        tags: ["blog"],
    },
);

export const getNotionPage = cache(async (pageIdOrUrl: string) => {
    return getCachedNotionPage(normalizePageId(pageIdOrUrl));
});

export const getBlogIndexData = cache(async () => {
    return getCachedBlogIndexData(
        normalizePageId(process.env.NOTION_PAGE_ID || fallbackRootPageId),
    );
});

export const getBlogPostData = cache(async (pageIdOrUrl: string) => {
    const pageId = normalizePageId(pageIdOrUrl);
    const blogIndex = await getBlogIndexData();
    const summary = blogIndex.subpages.find((post) => post.id === pageId);

    if (!summary) {
        return null;
    }

    const { page, blocks } = await getNotionPage(pageId);

    return {
        summary,
        page,
        blocks,
    };
});

export function isNotionObjectNotFound(error: unknown) {
    return (
        error instanceof APIResponseError &&
        error.code === APIErrorCode.ObjectNotFound
    );
}
