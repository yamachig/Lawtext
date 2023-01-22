import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import "bootstrap";
import "./index.scss";

import { LawtextAppPage } from "./components/LawtextAppPage";
import { DownloadPage } from "./components/DownloadPage";

const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/download/" element={<DownloadPage/>} />
                <Route path="/*" element={<LawtextAppPage/>} />
                <Route path="" element={<LawtextAppPage/>} />
            </Routes>
        </HashRouter>
    );
};

const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(<App/>);
}

import "./globals/register";
