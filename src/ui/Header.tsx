import { Flex, Heading, Switch } from "theme-ui";
import { Box } from "theme-ui";
import { Theme } from "../utils/types";

interface HeaderProps {
  theme: Theme;
  onSwitch: () => void;
}

export const Header = ({ theme, onSwitch }: HeaderProps): JSX.Element => {
  return (
    <Flex
      backgroundColor="muted"
      p={[2, null, 4]}
      mb={2}
      sx={{
        justifyContent: "space-between",
        alignContent: "center",
      }}
    >
      <Heading
        color="primary"
        sx={{ textTransform: "uppercase", letterSpacing: ".2em" }}
      >
        Cloud Choosr
      </Heading>
      <Box mt={[2, null, 2]}>
        <Switch
          label={theme === Theme.Dark ? "Dark" : "Light"}
          defaultChecked={theme === Theme.Dark}
          onChange={onSwitch}
        />
      </Box>
    </Flex>
  );
};
