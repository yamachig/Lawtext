import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import "bootstrap";
import "./index.scss";

import { LawtextAppPage } from "./components/LawtextAppPage";
import { DownloadPage } from "./components/DownloadPage";

ReactDOM.render(
    <HashRouter hashType="noslash">
        <Switch>
            <Route path="/download/" component={DownloadPage} />
            <Route path="/:lawSearchKey?" component={LawtextAppPage} />
        </Switch>
    </HashRouter>
    ,
    document.getElementById("root"),
);

import lawtextGlobals from "./globals";
for (const key in lawtextGlobals) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window[key] = lawtextGlobals[key];
}
