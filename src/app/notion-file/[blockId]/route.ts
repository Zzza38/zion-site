import { NextResponse } from "next/server";
import {
    getNotionFileUrl,
    isNotionObjectNotFound,
    isValidNotionId,
} from "@/lib/notion";

// Notion-hosted files are served from signed URLs that expire after about an
// hour, which is shorter than the page cache. This route looks up a fresh URL
// for the block on demand and redirects to it.
export async function GET(
    _request: Request,
    ctx: RouteContext<"/notion-file/[blockId]">,
) {
    const { blockId } = await ctx.params;

    if (!isValidNotionId(blockId)) {
        return new NextResponse(null, { status: 404 });
    }

    let url: string | null;

    try {
        url = await getNotionFileUrl(blockId);
    } catch (error) {
        if (isNotionObjectNotFound(error)) {
            return new NextResponse(null, { status: 404 });
        }

        throw error;
    }

    if (!url) {
        return new NextResponse(null, { status: 404 });
    }

    return NextResponse.redirect(url, {
        status: 302,
        headers: {
            "Cache-Control": "public, max-age=1200, s-maxage=1200",
        },
    });
}
