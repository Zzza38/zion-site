"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RelativeTimeProps = {
    iso: string;
    className?: string;
};

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
});

const absoluteFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
});

function formatRelativeTime(iso: string, now: number) {
    const timestamp = new Date(iso).getTime();
    const diffSeconds = Math.round((timestamp - now) / 1000);
    const absSeconds = Math.abs(diffSeconds);

    if (absSeconds < 60) {
        return relativeFormatter.format(diffSeconds, "second");
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    const absMinutes = Math.abs(diffMinutes);

    if (absMinutes < 60) {
        return relativeFormatter.format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMinutes / 60);
    const absHours = Math.abs(diffHours);

    if (absHours < 24) {
        return relativeFormatter.format(diffHours, "hour");
    }

    const diffDays = Math.round(diffHours / 24);
    const absDays = Math.abs(diffDays);

    if (absDays < 7) {
        return relativeFormatter.format(diffDays, "day");
    }

    if (absDays < 30) {
        return relativeFormatter.format(Math.round(diffDays / 7), "week");
    }

    if (absDays < 365) {
        return relativeFormatter.format(Math.round(diffDays / 30), "month");
    }

    return relativeFormatter.format(Math.round(diffDays / 365), "year");
}

export function RelativeTime({ iso, className }: RelativeTimeProps) {
    const [now, setNow] = useState(() => Date.now());
    const [isShowingAbsolute, setIsShowingAbsolute] = useState(false);
    const [phase, setPhase] = useState<"idle" | "fading-out" | "fading-in">("idle");
    const swapTimeoutRef = useRef<number | null>(null);
    const settleTimeoutRef = useRef<number | null>(null);
    const absolute = absoluteFormatter.format(new Date(iso));
    const displayText = isShowingAbsolute ? absolute : formatRelativeTime(iso, now);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(Date.now());
        }, 60_000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (swapTimeoutRef.current !== null) {
                window.clearTimeout(swapTimeoutRef.current);
            }

            if (settleTimeoutRef.current !== null) {
                window.clearTimeout(settleTimeoutRef.current);
            }
        };
    }, []);

    function transitionTo(nextIsAbsolute: boolean) {
        if (swapTimeoutRef.current !== null) {
            window.clearTimeout(swapTimeoutRef.current);
        }

        if (settleTimeoutRef.current !== null) {
            window.clearTimeout(settleTimeoutRef.current);
        }

        setPhase("fading-out");

        swapTimeoutRef.current = window.setTimeout(() => {
            setIsShowingAbsolute(nextIsAbsolute);
            setPhase("fading-in");

            settleTimeoutRef.current = window.setTimeout(() => {
                setPhase("idle");
            }, 120);
        }, 90);
    }

    return (
        <time
            className={cn("inline-flex", className)}
            dateTime={iso}
            title={absolute}
        >
            <span
                className={cn(
                    "inline-block cursor-default transition-[opacity,transform] duration-120 ease-out",
                    phase === "fading-out" && "-translate-y-0.5 opacity-0",
                    phase === "fading-in" && "translate-y-0 opacity-100",
                    phase === "idle" && "translate-y-0 opacity-100",
                )}
                onMouseEnter={() => transitionTo(true)}
                onMouseLeave={() => transitionTo(false)}
            >
                {displayText}
            </span>
        </time>
    );
}
