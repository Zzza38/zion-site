import Link from "next/link";
import { notFound } from "next/navigation";
import { NotionRenderer } from "@/components/notion-renderer";
import { RelativeTime } from "@/components/relative-time";
import {
    getBlogIndexData,
    getBlogPostData,
    getPageTitle,
    isNotionObjectNotFound,
} from "@/lib/notion";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
    const { subpages } = await getBlogIndexData();

    return subpages.map((subpage) => ({
        pageId: subpage.id,
    }));
}

export async function generateMetadata(
    props: PageProps<"/blog/[pageId]">,
) {
    try {
        const { pageId } = await props.params;
        const post = await getBlogPostData(pageId);

        if (!post) {
            return {
                title: "Blog Post",
            };
        }

        return {
            title: getPageTitle(post.page),
        };
    } catch {
        return {
            title: "Blog Post",
        };
    }
}

export default async function BlogPostPage(
    props: PageProps<"/blog/[pageId]">,
) {
    const { pageId } = await props.params;
    let post: Awaited<ReturnType<typeof getBlogPostData>>;

    try {
        post = await getBlogPostData(pageId);
    } catch (error) {
        if (isNotionObjectNotFound(error)) {
            notFound();
        }

        throw error;
    }

    if (!post) {
        notFound();
    }

    const title = getPageTitle(post.page);

    return (
        <main className="mx-auto w-full max-w-4xl px-6 py-16">
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                <Link className="transition hover:text-neutral-200" href="/blog">
                    Back to blog
                </Link>
            </div>

            <header className="mt-8 border-b border-white/10 pb-8">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                    Blog Post
                </p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-neutral-50">
                    {title}
                </h1>
                <RelativeTime
                    className="mt-4 text-sm text-neutral-500"
                    iso={post.page.created_time}
                />
            </header>

            <article className="mt-10">
                <NotionRenderer blocks={post.blocks} />
            </article>
        </main>
    );
}
