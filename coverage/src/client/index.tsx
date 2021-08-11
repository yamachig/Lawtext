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
import * as ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
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


ReactDOM.render(
    <HashRouter hashType="noslash">
        <Route path="/:LawID?" component={LawtextDashboardPage} />
    </HashRouter>
    ,
    document.getElementById("root"),
);
