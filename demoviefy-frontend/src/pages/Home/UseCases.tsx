import { useTranslation } from "react-i18next";

export default function UseCases() {
  const { t } = useTranslation();

    return (
        <section className="w-full pb-20 pt-4 lg:pb-20 lg:pt-8">
            <div className="text-center">
                <h2 className="mx-auto max-w-200 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                    {t("useCasesTitle")}
                </h2>

                <p className="mx-auto mt-6 w-full text-lg leading-8 text-neutral-400 lg:text-xl">
                    {t("useCasesDescription")}
                </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3 lg:mt-20">

                <div>
                    <div className="overflow-hidden rounded-lg">
                        <img
                            src="src/assets/DeMoviefy-Demo.png"
                            alt={t("analysis")}
                            className="w-full"
                        />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                        {t("analysis")}
                    </h3>

                    <p className="mt-3 text-base leading-7 text-neutral-400">
                        {t("featureDescriptionAnalysis")}
                    </p>
                </div>

                <div>
                    <div className="overflow-hidden rounded-lg">
                        <img
                            src="src/assets/DeMoviefy-Demo.png"
                            alt={t("transcription")}
                            className="w-full"
                        />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                        {t("transcription")}
                    </h3>

                    <p className="mt-3 text-base leading-7 text-neutral-400">
                        {t("transcriptionCardDescription")}
                    </p>
                </div>



                <div>
                    <div className="overflow-hidden rounded-lg">
                        <img
                            src="src/assets/DeMoviefy-Demo.png"
                            alt="Novos recursos do DeMoviefy"
                            className="w-full"
                        />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                        {t("moreComing")}
                    </h3>

                    <p className="mt-3 text-base leading-7 text-neutral-400">
                        {t("moreFeaturesDescription")}
                    </p>
                </div>
            </div>
        </section>
    )
}
