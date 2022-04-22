import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowAltCircleLeft,
    faArrowAltCircleRight,
    faArrowLeft,
    faArrowRight,
    faBan,
    faCheckCircle,
    faEllipsisV,
    faExchangeAlt,
    faExclamationTriangle,
    faExternalLinkAlt,
    faMinus,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap";
import * as moment from "moment";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, Routes } from "react-router-dom";
import { HashRouter } from "react-router-dom";
import { LawtextDashboardPage } from "./components/LawtextDashboardPage";
import "./index.scss";
moment.locale("ja");

library.add(
    faArrowAltCircleLeft,
    faArrowAltCircleRight,
    faArrowLeft,
    faArrowRight,
    faBan,
    faCheckCircle,
    faEllipsisV,
    faExchangeAlt,
    faExclamationTriangle,
    faExternalLinkAlt,
    faMinus,
    faTimes,
);

const rootEL = document.getElementById("root");
if (rootEL) {
    const root = ReactDOM.createRoot(rootEL);
    root.render((
        <HashRouter>
            <Routes>
                <Route path=":LawID" element={<LawtextDashboardPage/>} />
                <Route path="" element={<LawtextDashboardPage/>} />
            </Routes>
        </HashRouter>
    ));
}
