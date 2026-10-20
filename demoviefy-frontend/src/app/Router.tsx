import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Home from "src/pages/Home";
import Dashboard from "src/pages/Dashboard";
import Video from "src/pages/Video";
import Login from "src/pages/Login";
import Cadastro from "src/pages/Cadastro";

// Define os títulos das páginas com base nas rotas
// Aplica o título na página caso ela esteja declarada acima. Caso não, o valor padrão ("DeMoviefy") será vinculado.
function TitleManager() {
    const { pathname } = useLocation()
    const { t, i18n } = useTranslation();

    useEffect(() => {

        // Workaround para o map acima, pois video/{id} nunca é uma rota fixa.
        if (pathname.startsWith("/video/")) {
            document.title = `DeMoviefy - ${t("analysisTitle")}`;
            return;
        }
        document.title = pathname === "/dashboard" ? `DeMoviefy - ${t("dashboardTitle")}` : "DeMoviefy";
    }, [pathname, t, i18n.language]);

    return null;
}

// Declara todas as rotas disponíveis em nosso projeto. Mais fácil para gerenciamento unificado.
// A úlitma rota (com *) declara um cenário de exceção, caso não atenda nenhuma das anteriores.

export default function Router() {
    return (
        <>
            <TitleManager />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/video/:id" element={<Video />} />
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
        </>
    )
}
