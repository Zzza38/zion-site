import Link from "next/link";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
];

export default function BlogLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-background/85 backdrop-blur">
                <nav className="mx-auto flex min-h-14 w-full max-w-4xl items-center justify-center gap-8 px-6 md:gap-12">
                    {navItems.map((item) => (
                        <Link
                            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                            href={item.href}
                            key={item.label}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>
            {children}
        </div>
    );
}
