import { Link } from "react-router-dom";
import UseCases from "src/pages/Home/UseCases";
import FeaturesSection from "src/pages/Home/FeaturesSection";

export default function Home() {
  return (
    <main>
        <section className="grid w-full items-center gap-16 px-8 pb-20 pt-12 lg:grid-cols-2 lg:gap-24 lg:px-16 lg:pb-20 lg:pt-16">   
          <div>
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            Analise seus vídeos.
            <br />
            Extraia mais deles.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400 lg:text-xl">
            O DeMoviefy utiliza inteligência artificial para processar vídeos,
            detectar informações e gerar resultados estruturados.
          </p>

          <Link
            to="/upload"
            className="mt-8 inline-block rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
          >
            Começar agora
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-800">
          <img
            src="src/assets/DeMoviefy-Demo.png"
            alt="Prévia de um vídeo sendo analisado pelo DeMoviefy"
            className="w-full"
          />
        </div>
        
      </section>

      <UseCases/>

      <FeaturesSection/>

    </main>
  );
}