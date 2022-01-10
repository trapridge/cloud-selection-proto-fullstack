import { Flex, Heading, Grid } from "theme-ui";
import { CloudsContext } from "../utils/types";
import * as R from "remeda";
import { Result } from "./Result";

interface ResultsGridProps {
  context: CloudsContext;
}

export const ResultsGrid = ({ context }: ResultsGridProps): JSX.Element => {
  const { clouds } = context.data;
  const { location } = context;

  const results = R.map(clouds, (cloud) => (
    <Result key={cloud.cloud_name} cloud={cloud} showDistance={!!location} />
  ));

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
