import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter, Route } from "react-router-dom";

import "bootstrap";
import "./index.scss";

import LawtextAppPageContainer from "./containers/LawtextAppPageContainer";
import store from "./store";


ReactDOM.render(
    <Provider store={store}>
        <HashRouter hashType="noslash">
            <Route path="/:lawSearchKey?" component={LawtextAppPageContainer} />
        </HashRouter>
    </Provider>
    ,
    document.getElementById("root"),
);
