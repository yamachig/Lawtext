import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";

import "bootstrap";
import "./index.scss";

import { LawtextAppPage } from "./components/LawtextAppPage";


ReactDOM.render(
    <HashRouter hashType="noslash">
        <Route path="/:lawSearchKey?" component={LawtextAppPage} />
    </HashRouter>
    ,
    document.getElementById("root"),
);
