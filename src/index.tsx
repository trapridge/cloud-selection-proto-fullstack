import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import reportWebVitals from "./reportWebVitals";
import { useMachine } from "@xstate/react";
import { cloudsMachine } from "./machine";
import { fetchClouds, getGeoLocation } from "./utils/helpers";
import { inspect } from "@xstate/inspect";
import { CloudsContext } from "./utils/types";

if (process.env.NODE_ENV === "development") {
  inspect({
    iframe: false,
  });
}

const Root = () => {
  const [, , service] = useMachine(
    cloudsMachine.withConfig({
      services: {
        fetchClouds: (ctx: CloudsContext) => fetchClouds(ctx),
        getGeoLocation,
      },
    }),
    { devTools: process.env.NODE_ENV === "development" }
  );

  return (
    <React.StrictMode>
      <App service={service} />
    </React.StrictMode>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
