import Link from "next/link";
import { NotionRenderer } from "@/components/notion-renderer";
import { RelativeTime } from "@/components/relative-time";
import { getBlogIndexData, getPageTitle } from "@/lib/notion";

export const revalidate = 600;

export default async function BlogIndexPage() {
    const { page, contentBlocks, subpages } = await getBlogIndexData();
    const title = getPageTitle(page);

    return (
        <main className="mx-auto w-full max-w-4xl px-6 py-16">
            <header className="border-b border-white/10 pb-8">
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-neutral-50">
                    {title}
                </h1>
            </header>

            {contentBlocks.length > 0 ? (
                <section className="mt-10">
                    <NotionRenderer blocks={contentBlocks} />
                </section>
            ) : null}

            <section className="mt-14">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                            Posts
                        </p>
                    </div>
                    <p className="text-sm text-neutral-500">
                        {subpages.length} {subpages.length === 1 ? "post" : "posts"}
                    </p>
                </div>

                {subpages.length === 0 ? (
                    <p className="mt-6 text-neutral-500">
                        No blogs found.
                    </p>
                ) : (
                    <ul className="mt-6 space-y-3">
                        {subpages.map((subpage, index) => (
                            <li key={subpage.id}>
                                <Link
                                    className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-white/20 hover:bg-white/[0.06]"
                                    href={subpage.href}
                                >
                                    <div className="min-w-0 pr-6">
                                        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                                            Post {String(index + 1).padStart(2, "0")}
                                        </p>
                                        <h3 className="mt-2 truncate text-lg font-medium text-neutral-100">
                                            {subpage.title}
                                        </h3>
                                        <RelativeTime
                                            className="mt-2 text-sm text-neutral-500"
                                            iso={subpage.createdAt}
                                        />
                                    </div>
                                    <span className="text-sm text-neutral-500 transition group-hover:text-neutral-300">
                                        Read
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
