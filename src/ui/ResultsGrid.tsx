import { Flex, Heading, Grid } from "theme-ui";
import { Cloud, CloudsContext, SortBy } from "../utils/types";
import * as R from "remeda";
import { sortAlphabetically, sortCloudsBydistance } from "../utils/helpers";
import { Result } from "./Result";

interface ResultsGridProps {
  context: CloudsContext;
}

export const ResultsGrid = ({ context }: ResultsGridProps): JSX.Element => {
  const { clouds } = context.data;
  const { selectedProvider, selectedRegion, sortBy, sortOrder } = context;

  const byProvider = (cloud: Cloud) =>
    cloud.cloud_name.startsWith(selectedProvider) || selectedProvider === "all";
  const byRegion = (cloud: Cloud) =>
    cloud.geo_region === selectedRegion || selectedRegion === "all";

  const results = R.pipe(
    clouds,
    R.filter(byProvider),
    R.filter(byRegion),
    sortBy === SortBy.Description
      ? sortAlphabetically("cloud_description", sortOrder)
      : sortCloudsBydistance(sortOrder),
    R.map((cloud) => <Result key={cloud.cloud_name} cloud={cloud} />)
  );

  const resultsCount = (
    <Flex
      p={3}
      key="first"
      backgroundColor="gray"
      sx={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Heading color="background" my={3}>
        {results.length} cloud{results.length !== 1 && "s"}
      </Heading>
    </Flex>
  );

  return (
    <Grid gap={2} columns={[2, null, 4]}>
      {[resultsCount, results]}
    </Grid>
  );
};
