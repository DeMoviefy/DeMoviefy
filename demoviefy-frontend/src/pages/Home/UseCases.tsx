import { useTranslation } from "react-i18next";
import { useThemeStore } from "src/core/stores/useThemeStore";

import imagem2EngDark from "src/pages/Home/assets/Imagem2/Imagem2-ENG-Dark.png";
import imagem2EngLight from "src/pages/Home/assets/Imagem2/Imagem2-ENG-Light.png";
import imagem2PorDark from "src/pages/Home/assets/Imagem2/Imagem2-POR-Dark.png";
import imagem2PorLight from "src/pages/Home/assets/Imagem2/Imagem2-POR-Light.png";
import imagem4EngDark from "src/pages/Home/assets/Imagem4/Imagem4-ENG-Dark.png";
import imagem4EngLight from "src/pages/Home/assets/Imagem4/Imagem4-ENG-Light.png";
import imagem4PorDark from "src/pages/Home/assets/Imagem4/Imagem4-POR-Dark.png";
import imagem4PorLight from "src/pages/Home/assets/Imagem4/Imagem4-POR-Light.png";

export default function UseCases() {
  const { t, i18n } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const isPortuguese = i18n.resolvedLanguage?.toLowerCase().startsWith("pt") ?? false;
  const analysisScreenshot = isPortuguese
    ? theme === "dark" ? imagem2PorDark : imagem2PorLight
    : theme === "dark" ? imagem2EngDark : imagem2EngLight;
  const ratingScreenshot = isPortuguese
    ? theme === "dark" ? imagem4PorDark : imagem4PorLight
    : theme === "dark" ? imagem4EngDark : imagem4EngLight;

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
                    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <img
                            src={analysisScreenshot}
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
                    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <img
                            src={ratingScreenshot}
                            alt={t("rating")}
                            className="w-full"
                        />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                        {t("rating")}
                    </h3>

                    <p className="mt-3 text-base leading-7 text-neutral-400">
                        {t("ratingDescription")}
                    </p>
                </div>
            </div>
        </section>
    )
}
