import { PyPIRegistry } from "src/types/PyPIRegistry";

export interface NormalizedPyProjectToml {
  project: {
    name: string;
    version?: string;
    classifiers?: string[];
    dependencies?: string[];
    optionalDependencies?: Record<string, string[]>;
  };
  dependencyGroups?: Record<string, string[]>;
  tool?: {
    uv?: {
      index?: PyPIRegistry[];
      checkUrl?: string;
      publishUrl?: string;
      devDependencies?: string[]; // Legacy https://docs.astral.sh/uv/concepts/projects/dependencies/#legacy-dev-dependencies
    };
    poetry?: {
      dependencies?: Record<string, unknown>; // Legacy https://python-poetry.org/docs/pyproject/#dependencies-and-dependency-groups
      group?: Record<string, { dependencies?: Record<string, unknown> }>;
    };
    letsRelease?: {
      registry?: PyPIRegistry;
      token?: string;
      username?: string;
      password?: string;
    };
  };
}
