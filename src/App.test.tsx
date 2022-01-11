import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { interpret, Interpreter } from "xstate";
import { App } from "./App";
import { cloudsMachine, initialContext } from "./machine";
import {
  CloudsContext,
  CloudsEvents,
  CloudsState,
  CloudsStateSchema,
} from "./utils/types";

const response = {
  clouds: [
    {
      cloud_description:
        "Africa, South Africa - Amazon Web Services: Cape Town",
      cloud_name: "aws-af-south-1",
      geo_latitude: -33.92,
      geo_longitude: 18.42,
      geo_region: "africa",
    },
    {
      cloud_description: "Africa, South Africa - Azure: South Africa North",
      cloud_name: "azure-south-africa-north",
      geo_latitude: -26.198,
      geo_longitude: 28.03,
      geo_region: "africa",
    },
    {
      cloud_description: "Asia, Bahrain - Amazon Web Services: Bahrain",
      cloud_name: "aws-me-south-1",
      geo_latitude: 26.07,
      geo_longitude: 50.55,
      geo_region: "south asia",
    },
  ],
};

const location: GeolocationPosition = {
  coords: {
    accuracy: 20,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 60,
    longitude: 24,
    speed: null,
  },
  timestamp: 0,
};

const defaultConfig = {
  services: {
    fetchClouds: () => jest.fn().mockResolvedValue(response),
    getGeoLocation: () => jest.fn().mockResolvedValue(location),
  },
};

// TODO: fix to reflect integration with bff
describe.skip("App", () => {
  let currentStateValue: unknown;
  let service: Interpreter<CloudsContext, CloudsStateSchema, CloudsEvents>;
  const startMachine = (config = defaultConfig, context = initialContext) => {
    service = interpret(
      cloudsMachine.withConfig(config).withContext(context)
    ).onTransition((state) => {
      currentStateValue = state.value;
    });
    service.start();
  };

  afterEach(() => {
    service.stop();
  });

  describe("initially", () => {
    describe("when loading data", () => {
      test("renders loading indicator", async () => {
        startMachine();
        act(() => {
          render(<App service={service} />);
        });

        expect(currentStateValue).toBe(CloudsState.Loading);
        await waitFor(() =>
          expect(screen.getByText(/Loading.../)).toBeInTheDocument()
        );
      });
    });

    describe("when loading fails", () => {
      test("renders error message", async () => {
        startMachine({
          services: {
            ...defaultConfig.services,
            fetchClouds: jest.fn().mockRejectedValue({}),
          },
        });
        render(<App service={service} />);

        await waitFor(() =>
          expect(currentStateValue).toEqual(CloudsState.Failure)
        );
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });

    describe("when loading succeeds", () => {
      test("renders cloud info", async () => {
        startMachine();
        act(() => {
          render(<App service={service} />);
        });

        await waitFor(() =>
          expect(currentStateValue).toEqual(CloudsState.Positioning)
        );
        expect(
          screen.getByText(response.clouds[0].cloud_name)
        ).toBeInTheDocument();
        expect(
          screen.getByText(response.clouds[1].cloud_name)
        ).toBeInTheDocument();
        expect(
          screen.getByText(response.clouds[2].cloud_name)
        ).toBeInTheDocument();
      });
    });
  });

  describe("actions", () => {
    describe("when choosing provider: Azure", () => {
      test("renders only matching info", async () => {
        startMachine();
        render(<App service={service} />);
        await waitFor(() =>
          expect(currentStateValue).toEqual(CloudsState.Positioning)
        );
        userEvent.selectOptions(screen.getByLabelText("Filter by provider"), [
          "azure",
        ]);

        expect(
          screen.queryByText(response.clouds[0].cloud_name)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(response.clouds[1].cloud_name)
        ).toBeInTheDocument();
        expect(
          screen.queryByText(response.clouds[2].cloud_name)
        ).not.toBeInTheDocument();
      });
    });

    describe("when choosing region: South Asia", () => {
      test("renders only matching info", async () => {
        startMachine();
        render(<App service={service} />);
        await waitFor(() =>
          expect(currentStateValue).toEqual(CloudsState.Positioning)
        );
        userEvent.selectOptions(screen.getByLabelText("Filter by region"), [
          "south asia",
        ]);
        expect(
          screen.queryByText(response.clouds[0].cloud_name)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(response.clouds[1].cloud_name)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(response.clouds[2].cloud_name)
        ).toBeInTheDocument();
      });
    });

    describe("when sorting by: Description", () => {
      describe("when sort order is: ascending", () => {
        test("renders results in correct order", async () => {
          startMachine();
          render(<App service={service} />);
          await waitFor(() =>
            expect(currentStateValue).toEqual(CloudsState.Positioning)
          );
          userEvent.click(screen.getByLabelText("Description"));
          userEvent.click(screen.getByLabelText("Ascending"));
          const results = screen.queryAllByTestId("result");
          expect(results[0]).toContainHTML(response.clouds[0].cloud_name);
          expect(results[1]).toContainHTML(response.clouds[1].cloud_name);
          expect(results[2]).toContainHTML(response.clouds[2].cloud_name);
        });
      });

      describe("when sort order is: descending", () => {
        test("renders results in correct order", async () => {
          startMachine();
          render(<App service={service} />);
          await waitFor(() =>
            expect(currentStateValue).toEqual(CloudsState.Positioning)
          );
          userEvent.click(screen.getByLabelText("Description"));
          userEvent.click(screen.getByLabelText("Descending"));
          const results = screen.queryAllByTestId("result");
          expect(results[0]).toContainHTML(response.clouds[2].cloud_name);
          expect(results[1]).toContainHTML(response.clouds[1].cloud_name);
          expect(results[2]).toContainHTML(response.clouds[0].cloud_name);
        });
      });
    });

    describe("when sorting by: Distance", () => {
      describe("when sort order is: ascending (default)", () => {
        test("renders results in correct order", async () => {
          startMachine();
          render(<App service={service} />);
          await waitFor(() =>
            expect(currentStateValue).toEqual(CloudsState.Ready)
          );
          userEvent.click(screen.getByLabelText("Distance to cloud"));
          userEvent.click(screen.getByLabelText("Ascending"));

          const results = screen.queryAllByTestId("result");
          expect(results[0]).toContainHTML(response.clouds[2].cloud_name);
          expect(results[1]).toContainHTML(response.clouds[1].cloud_name);
          expect(results[2]).toContainHTML(response.clouds[0].cloud_name);
        });
      });

      describe("when sort order is: descending", () => {
        test("renders results in correct order", async () => {
          startMachine({
            services: {
              ...defaultConfig.services,
              fetchClouds: jest.fn().mockResolvedValue(response),
            },
          });
          render(<App service={service} />);
          await waitFor(() =>
            expect(currentStateValue).toEqual(CloudsState.Ready)
          );
          userEvent.click(screen.getByLabelText("Distance to cloud"));
          userEvent.click(screen.getByLabelText("Descending"));

          const results = screen.queryAllByTestId("result");
          expect(results[0]).toContainHTML(response.clouds[0].cloud_name);
          expect(results[1]).toContainHTML(response.clouds[1].cloud_name);
          expect(results[2]).toContainHTML(response.clouds[2].cloud_name);
        });
      });
    });
  });
});
