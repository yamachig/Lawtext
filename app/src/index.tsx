import React from "react";
import ReactDOM from "react-dom";
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
                <Route path=":lawSearchKey" element={<LawtextAppPage/>} />
                <Route path="" element={<LawtextAppPage/>} />
            </Routes>
        </HashRouter>
    );
};

ReactDOM.render(
    <App />
    ,
    document.getElementById("root"),
);

import "./globals/register";
