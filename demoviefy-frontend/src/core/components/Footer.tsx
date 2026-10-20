import { type JSX } from "react";
import { FaGithub } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Footer(): JSX.Element {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex w-full items-center justify-between px-4 py-6 lg:px-8">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    DeMoviefy {year}
                </p>

                <a
                    href="https://github.com/DeMoviefy/DeMoviefy"
                    rel="noopener noreferrer"
                    aria-label={t("githubRepository")}
                    className="shrink-0 text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                    <FaGithub className="h-8 w-8" />
                </a>
            </div>
        </footer>
    );
}
