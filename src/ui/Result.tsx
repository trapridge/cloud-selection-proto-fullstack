import { Flex, Text } from "theme-ui";
import { Cloud } from "../utils/types";

interface ResultProps {
  cloud: Cloud;
}

export const Result = ({ cloud }: ResultProps): JSX.Element => {
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
      <Text
        color="primary"
        as="div"
        sx={{ fontSize: 1, textTransform: "uppercase" }}
      >
        {cloud.cloud_name}
      </Text>
      <Text as="div" my={3}>
        {cloud.cloud_description}
      </Text>
      {location && (
        <Text color="gray" as="div" sx={{ fontSize: 1 }}>
          Distance: {cloud.distance?.toFixed()} km
        </Text>
      )}
    </Flex>
  );
};
