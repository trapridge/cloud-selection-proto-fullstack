import { ThemeProvider } from "theme-ui";
import { dark, base } from "@theme-ui/presets";
import { Box } from "theme-ui";
import { Theme } from "../utils/types";
import { ReactNode } from "react";

interface PageProps {
  theme: Theme;
  children: ReactNode;
}

export const Page = ({ theme, children }: PageProps): JSX.Element => {
  return (
    <ThemeProvider theme={theme === Theme.Dark ? dark : base}>
      <Box p={2} sx={{ maxWidth: [null, null, "960px"], margin: "auto" }}>
        {children}
      </Box>
    </ThemeProvider>
  );
};
