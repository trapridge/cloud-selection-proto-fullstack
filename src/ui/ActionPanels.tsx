import { Grid, Label, Select, Text, Radio } from "theme-ui";
import { Box } from "theme-ui";
import { CloudsContext, SortBy, SortOrder } from "../utils/types";

interface ActionPanelsProps {
  context: CloudsContext;
  onSelectProvider: (provider: string) => void;
  onSelectRegion: (region: string) => void;
  onSelectSortBy: (sortBy: SortBy) => void;
  onSelectSortOrder: (sortOrder: SortOrder) => void;
}

export const ActionPanels = ({
  context,
  onSelectProvider,
  onSelectRegion,
  onSelectSortBy,
  onSelectSortOrder,
}: ActionPanelsProps): JSX.Element => {
  const { providers, regions } = context.data;
  const { selectedProvider, selectedRegion, sortBy, sortOrder, location } =
    context;

  const providerFilterSelect = (
    <Box mb={3}>
      <Label htmlFor="provider" color="text">
        Filter by provider
      </Label>
      <Select
        id="provider"
        name="provider"
        defaultValue={selectedProvider}
        onChange={(e) => onSelectProvider(e.target.value)}
      >
        <option key="all" value="all">
          All
        </option>
        {providers.map(({ shortName, name }) => (
          <option key={shortName} value={shortName}>
            {name}
          </option>
        ))}
      </Select>
    </Box>
  );

  const regionFilterSelect = (
    <Box mb={3}>
      <Label color="text" htmlFor="region">
        Filter by region
      </Label>
      <Select
        id="region"
        name="region"
        defaultValue={selectedRegion}
        onChange={(e) => onSelectRegion(e.target.value)}
      >
        <option key="all" value="all">
          All
        </option>
        {regions.map(({ shortName, name }) => (
          <option key={shortName} value={shortName}>
            {name}
          </option>
        ))}
      </Select>
    </Box>
  );

  const sortByRadios = (
    <>
      <Text color="text" as="div">
        Sort by
      </Text>
      <Box mb={3}>
        <Label>
          <Radio
            name="sortBy"
            defaultChecked={sortBy === SortBy.Description}
            id="description"
            value="description"
            onChange={(e) =>
              onSelectSortBy(
                e.target.checked ? SortBy.Description : SortBy.Distance
              )
            }
          />
          Description
        </Label>
        {location && (
          <Label>
            <Radio
              name="sortBy"
              defaultChecked={sortBy === SortBy.Distance}
              id="distance"
              value="distance"
              onChange={(e) =>
                onSelectSortBy(
                  e.target.checked ? SortBy.Distance : SortBy.Description
                )
              }
            />
            Distance to cloud
          </Label>
        )}
      </Box>
    </>
  );

  const sortOrderRadios = (
    <>
      <Text color="text" as="div">
        Sort order
      </Text>
      <Box mb={3}>
        <Label>
          <Radio
            name="sortOrder"
            defaultChecked={sortOrder === SortOrder.Ascending}
            id="ascending"
            value="ascending"
            onChange={(e) =>
              onSelectSortOrder(
                e.target.checked ? SortOrder.Ascending : SortOrder.Descending
              )
            }
          />
          Ascending
        </Label>
        <Label>
          <Radio
            name="sortOrder"
            defaultChecked={sortOrder === SortOrder.Descending}
            id="descending"
            value="descending"
            onChange={(e) =>
              onSelectSortOrder(
                e.target.checked ? SortOrder.Descending : SortOrder.Ascending
              )
            }
          />
          Descending
        </Label>
      </Box>
    </>
  );

  return (
    <Grid gap={2} columns={[1, null, 2]} mb={2}>
      <Box p={[2, null, 4]} bg="highlight">
        {providerFilterSelect}
        {regionFilterSelect}
      </Box>
      <Box p={[2, null, 4]} bg="highlight">
        {sortByRadios}
        {sortOrderRadios}
      </Box>
    </Grid>
  );
};
