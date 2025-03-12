import path from "node:path";

import { $, ResultPromise } from "execa";

import { Step, StepFunction } from "@lets-release/config";

import { DEFAULT_PYPI_USERNAME } from "src/constants/DEFAULT_PYPI_USERNAME";
import { PYPI_PRIVATE_CLASSIFIER_PREFIX } from "src/constants/PYPI_PRIVATE_CLASSIFIER_PREFIX";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { getAuth } from "src/helpers/getAuth";
import { preparePackage } from "src/helpers/preparePackage";
import { PyPIOptions } from "src/schemas/PyPIOptions";

export const publish: StepFunction<Step.publish, PyPIOptions> = async (
  context,
  options,
) => {
  const { skipPublishing, distDir } = await PyPIOptions.parseAsync(options);
  const {
    env,
    stdout,
    stderr,
    logger,
    package: { path: pkgRoot, name, uniqueName },
    nextRelease: { version },
  } = context;
  const pkgContext = await ensurePyPIPackageContext(context, {
    skipPublishing,
  });

  if (!pkgContext.prepared) {
    await preparePackage(context, pkgContext, { skipPublishing, distDir });
  }

  if (
    !skipPublishing &&
    !pkgContext.pkg.project.classifiers?.some((classifier) =>
      classifier.startsWith(PYPI_PRIVATE_CLASSIFIER_PREFIX),
    )
  ) {
    const { pm, registry } = pkgContext;

    logger.log({
      prefix: `[${uniqueName}]`,
      message: `Publishing version ${version} to PyPI registry`,
    });

    const { token, username, password } = await getAuth(context, pkgContext);

    const execaOptions = {
      cwd: pm.root,
      env,
      preferLocal: true as const,
    };

    let result: ResultPromise<typeof execaOptions>;

    switch (pm.name) {
      case PyPIPackageManagerName.poetry: {
        result = $(
          execaOptions,
        )`poetry publish --repository ${registry.name} --username ${token ? DEFAULT_PYPI_USERNAME : username} --password ${token || password!} --dist-dir ${path.resolve(pkgRoot, distDir)} --skip-existing`;
        break;
      }

      // uv
      default: {
        result = $(
          execaOptions,
        )`uv publish ${path.resolve(pkgRoot, distDir, "*")} -v --project ${pkgRoot} --publish-url ${registry.publishUrl} ${registry.url ? ["--check-url", registry.url] : []} ${token ? ["--token", token] : ["--username", username, "--password", password!]}`;
        break;
      }
    }

    result.stdout?.pipe(stdout, { end: false });
    result.stderr?.pipe(stderr, { end: false });

    logger.log({
      prefix: `[${uniqueName}]`,
      message: `Published ${name}@${version} to ${registry}`,
    });

    return getArtifactInfo(context, pkgContext);
  }

  logger.log({
    prefix: `[${uniqueName}]`,
    message: `Skip publishing to PyPI registry as ${skipPublishing ? "skipPublishing is true" : "project has private classifiers"}`,
  });
};
