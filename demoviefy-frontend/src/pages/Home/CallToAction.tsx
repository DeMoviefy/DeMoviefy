import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CallToAction() {
    const { t } = useTranslation();
    return (
        <section className="w-full pb-24 lg:pb-32">
            <div className="text-center">
                <h2 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                    {t("readyToStart")}
                </h2>

                <p className="mx-auto mt-6 text-lg leading-8 text-neutral-400 lg:text-xl">
                    {t("ctaDescription")}
                </p>

                <Link
                    to="/dashboard"
                    className="mt-8 inline-block rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                    {t("startNow")}
                </Link>
            </div>
        </section>
    );
}
