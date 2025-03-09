import { PrepareContext } from "@lets-release/config";

import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { preparePackage } from "src/helpers/preparePackage";
import { PyPIOptions, ResolvedPyPIOptions } from "src/schemas/PyPIOptions";
import { prepare } from "src/steps/prepare";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("src/helpers/ensurePyPIPackageContext");
vi.mock("src/helpers/preparePackage");
vi.mock("src/schemas/PyPIOptions");

const context = {
  cwd: "/path/to/cwd",
} as PrepareContext;
const options = {
  foo: "bar",
} as unknown as PyPIOptions;
const parsedOptions = {
  bar: "baz",
} as unknown as ResolvedPyPIOptions;
const pkgContext = {
  pkg: {
    project: {
      name: "project-name",
    },
  },
} as PyPIPackageContext;

const parseAsync = vi.spyOn(PyPIOptions, "parseAsync");

describe("prepare", () => {
  it("should call ensurePyPIPackageContext and preparePackage with correct arguments", async () => {
    parseAsync.mockResolvedValue(parsedOptions);
    vi.mocked(ensurePyPIPackageContext).mockResolvedValue(pkgContext);

    await prepare(context, options);

    expect(parseAsync).toHaveBeenCalledWith(options);
    expect(ensurePyPIPackageContext).toHaveBeenCalledWith(
      context,
      parsedOptions,
    );
    expect(preparePackage).toHaveBeenCalledWith(
      context,
      pkgContext,
      parsedOptions,
    );
  });
});
