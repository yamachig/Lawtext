import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import "bootstrap";
import "./index.scss";

import { LawtextAppPage } from "./components/LawtextAppPage";
import { DownloadPage } from "./components/DownloadPage";

const App = () => {
    return (
        <HashRouter hashType="noslash">
            <Switch>
                <Route path="/download/" component={DownloadPage} />
                <Route path="/:lawSearchKey?" component={LawtextAppPage} />
            </Switch>
        </HashRouter>
    );
};

ReactDOM.render(
    <App />
    ,
    document.getElementById("root"),
);

import "./globals/register";
