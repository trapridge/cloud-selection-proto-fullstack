import { useActor } from "@xstate/react";
import { Text, Spinner } from "theme-ui";
import {
  CloudsState,
  CloudsEvents,
  Theme,
  CloudsStateSchema,
  CloudsContext,
} from "./utils/types";
import { Page } from "./ui/Page";
import { Header } from "./ui/Header";
import { ActionPanels } from "./ui/ActionPanels";
import { ResultsGrid } from "./ui/ResultsGrid";
import { Interpreter } from "xstate";

interface AppProps {
  service: Interpreter<CloudsContext, CloudsStateSchema, CloudsEvents>;
}

export const App = ({ service }: AppProps): JSX.Element => {
  const [state, send] = useActor(service);
  const { theme } = state.context;

  return (
    <Page theme={theme}>
      {(state.matches(CloudsState.Positioning) ||
        state.matches(CloudsState.InitialLoading)) && (
        <>
          <Spinner />
          <Text color="primary" as="div">
            {state.matches(CloudsState.Positioning)
              ? "Getting geolocation"
              : "Loading clouds"}
          </Text>
        </>
      )}
      {(state.matches(CloudsState.Ready) ||
        state.matches(CloudsState.Loading)) && (
        <>
          <Header
            theme={theme}
            onSwitch={() =>
              send({
                type: "SET_THEME",
                theme: theme === Theme.Light ? Theme.Dark : Theme.Light,
              })
            }
          />
          <ActionPanels
            context={state.context}
            onSelectProvider={(provider) =>
              send({ type: "SET_SELECTED_PROVIDER", provider })
            }
            onSelectRegion={(region) =>
              send({ type: "SET_SELECTED_REGION", region })
            }
            onSelectSortBy={(sortBy) => send({ type: "SET_SORT_BY", sortBy })}
            onSelectSortOrder={(sortOrder) =>
              send({ type: "SET_SORT_ORDER", sortOrder })
            }
          />
          <ResultsGrid context={state.context} />
        </>
      )}
      {state.matches(CloudsState.Failure) && <Text>Error</Text>}
    </Page>
  );
};
