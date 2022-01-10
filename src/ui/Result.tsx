import { Flex, Text } from "theme-ui";
import { Cloud } from "../utils/types";

interface ResultProps {
  cloud: Cloud;
  showDistance: boolean;
}

export const Result = ({ cloud, showDistance }: ResultProps): JSX.Element => {
  return (
    <Flex
      data-testid="result"
      p={3}
      key={cloud.cloud_name}
      backgroundColor="muted"
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        ":hover": {
          backgroundColor: "highlight",
        },
      }}
    >
      <Text color="primary" sx={{ fontSize: 1, textTransform: "uppercase" }}>
        {cloud.cloud_name}
      </Text>
      <Text as="div" my={3}>
        {cloud.cloud_description}
      </Text>
      {showDistance && cloud.distance && (
        <Text color="gray" as="div" sx={{ fontSize: 1 }}>
          Distance: {(cloud.distance / 1000).toFixed()} km
        </Text>
      )}
    </Flex>
  );
};
