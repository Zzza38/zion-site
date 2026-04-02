import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const projectGridClass =
    "grid w-full grid-cols-1 gap-4 md:grid-cols-2";
const sectionWidthClass =
    "w-full xl:max-w-[66vw] 2xl:max-w-6xl";
const navItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
];

function isWideCard(index: number, total: number) {
    return total % 2 === 1 && index === total - 1;
}

export default function Home() {
    const currentProjects = [
        {
            title: "Portfolio",
            description: "This is my portfolio website (this one). It's built with Next.js and Tailwind CSS.",
            image: "",
            link: "https://github.com/Zzza38/zion-site",
        },
        {
            title: "Nexra",
            description: "An unfinished JavaScript compiler to Linux x86_64 Assembly.",
            image: "",
            link: "https://github.com/Zzza38/nexra",
        },
    ];

    const contributions = [
        {
            title: "Interstellar",
            description: "I added a Local Storage export feature, which would allow users to save their data locally and import it later.",
            image: "",
            link: "https://github.com/UseInterstellar/Interstellar",
            prLink: "https://github.com/UseInterstellar/Interstellar/pull/1022",
        },
    ];

    const pastProjects = [
        {
            title: "WebGFA",
            description: "WebGFA is a games website that allows you to play games online. It's built with Fastify and TypeScript.",
            image: "https://raw.githubusercontent.com/Zzza38/WebGFA/refs/heads/main/static/favicon.ico",
            link: "https://github.com/Zzza38/WebGFA",
        },
        {
            title: "Wordwall Hack",
            description: "A leaderboard hack for Wordwall, developed using ChatGPT when I wanted to be first in a Wordwall.",
            image: "",
            link: "https://github.com/Zzza38/wordwallHack",
        },
        {
            title: "Dead Rails Script",
            description: "An exploit script that I developed for the Roblox game Dead Rails.",
            image: "",
            link: "https://github.com/Zzza38/dead-rails-script",
        },
    ];

    return (
        <div id="top" className="flex min-h-screen w-full flex-col items-center text-center">
            <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-background/85 backdrop-blur">
                <nav className={`mx-auto flex min-h-14 w-full items-center justify-center gap-8 px-4 md:gap-12 ${sectionWidthClass}`}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            </header>
            <main className="flex w-full flex-col items-center p-4 pt-8">
                <h1 className="text-4xl font-bold">Zion Aronov (Zzza38)</h1>
                <p className="text-m max-w-3/4 text-neutral-500">
                    I&apos;m a 13 year old software engineer from New York. I love to code and am a self-taught full-stack developer.
                </p>
                <br />
                <h2 className="text-xl font-bold">Current Projects</h2>
                <br />
                <div id="currentProjects" className={`${sectionWidthClass} ${projectGridClass}`}>
                    {currentProjects.map((project, index) => (
                        <ProjectCard
                            key={project.title}
                            title={project.title}
                            description={project.description}
                            image={project.image}
                            link={project.link}
                            wide={isWideCard(index, currentProjects.length)}
                            className={isWideCard(index, currentProjects.length) ? "md:col-span-2" : ""}
                        />
                    ))}
                </div>
                <br />
                <h2 className="text-xl font-bold">Contributions</h2>
                <br />
                <div id="contributions" className={`${sectionWidthClass} ${projectGridClass}`}>
                    {contributions.map((contribution, index) => (
                        <ContributionCard
                            key={contribution.title}
                            title={contribution.title}
                            description={contribution.description}
                            image={contribution.image}
                            link={contribution.link}
                            prLink={contribution.prLink}
                            wide={isWideCard(index, contributions.length)}
                            className={isWideCard(index, contributions.length) ? "md:col-span-2" : ""}
                        />
                    ))}
                </div>
                <br />
                <h2 className="text-xl font-bold">Past Projects</h2>
                <br />
                <div id="pastProjects" className={`${sectionWidthClass} ${projectGridClass}`}>
                    {pastProjects.map((project, index) => (
                        <ProjectCard
                            key={project.title}
                            title={project.title}
                            description={project.description}
                            image={project.image}
                            link={project.link}
                            wide={isWideCard(index, pastProjects.length)}
                            className={isWideCard(index, pastProjects.length) ? "md:col-span-2" : ""}
                        />
                    ))}
                </div>
                <br />
                <h1 className="text-2xl font-bold">Contact Me</h1>
                <br />
                <div className="text-m flex max-w-3/4 flex-col text-neutral-500">
                    <p>Email: <a href="mailto:zion@ziona.dev" className="text-blue-500">zion@ziona.dev</a></p>
                    <p>GitHub: <a href="https://github.com/Zzza38" className="text-blue-500">Zzza38</a></p>
                    <p>Discord: <a href="https://discord.com/users/786069811855491072" className="text-blue-500">@simhosha_pro1</a></p>
                </div>
            </main>
        </div>
    );
}

function ProjectCard({ title, description, image, link, className = "", wide = false }: { title: string, description: string, image: string, link: string, className?: string, wide?: boolean }) {
    return (
        <Card className={`${className} w-full p-4 
        transition ease-in-out duration-250 
        border-2 border-transparent
        hover:border-blue-500 ${wide ? "hover:scale-[1.02]" : "hover:scale-105"}`}>
            <div className="flex flex-1 flex-col items-center justify-center gap-1">
                <div className="flex flex-row items-center gap-3">
                    {image && (
                        <Image src={image} alt={`${title} icon`} width={32} height={32} className="h-8 w-8 rounded object-cover" />
                    )}
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {image && (
                        <span aria-hidden className="h-8 w-8 shrink-0" />
                    )}
                </div>
                <p className="text-medium">{description}</p>
            </div>
            <Button asChild>
                    <a href={link} target="_blank" rel="noreferrer">View Project</a>
            </Button>
        </Card>
    );
}
function ContributionCard({ title, description, image, link, prLink, className = "", wide = false }: { title: string, description: string, image: string, link: string, prLink: string, className?: string, wide?: boolean }) {
    return (
        <Card className={`${className} w-full p-4 
        transition ease-in-out duration-250 
        border-2 border-transparent
        hover:border-blue-500 ${wide ? "hover:scale-[1.02]" : "hover:scale-105"}`}>
            <div className="flex flex-1 flex-col items-center justify-center gap-1">
                <div className="flex flex-row items-center gap-3">
                    {image && (
                        <Image src={image} alt={`${title} icon`} width={32} height={32} className="h-8 w-8 rounded object-cover" />
                    )}
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {image && (
                        <span aria-hidden className="h-8 w-8 shrink-0" />
                    )}
                </div>
                <p className="text-medium">{description}</p>
            </div>
            <div className="mt-4 flex w-full flex-col gap-2 md:flex-row">
                <Button asChild className="w-full md:w-1/2">
                    <a href={link} target="_blank" rel="noreferrer" className="w-full flex justify-center">View Project</a>
                </Button>
                <Button asChild className="w-full md:w-1/2">
                    <a href={prLink} target="_blank" rel="noreferrer" className="w-full flex justify-center">View Pull Request</a>
                </Button>
            </div>
        </Card>
    );
}
