import { capitalize } from "./helpers";

describe("helpers", () => {
  describe("capitalize", () => {
    test("should capitalizes given string", async () => {
      const result = capitalize("lorem ipsum dolor sit amet");
      expect(result).toBe("Lorem Ipsum Dolor Sit Amet");
    });
  });

  // TODO: consider increasing coverage...
});
