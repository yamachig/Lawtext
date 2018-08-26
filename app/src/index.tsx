import * as React from "react"
import * as ReactDOM from "react-dom"
import { HashRouter, Route } from "react-router-dom"
import { Provider } from 'react-redux'

import 'bootstrap';
import './index.scss';

import store from './store';
import LawtextAppPageContainer from './containers/LawtextAppPageContainer';



ReactDOM.render(
    <Provider store={store}>
        <HashRouter hashType="noslash">
            <Route path="/:lawSearchKey?" component={LawtextAppPageContainer} />
        </HashRouter>
    </Provider>
    ,
    document.getElementById("root")
);
