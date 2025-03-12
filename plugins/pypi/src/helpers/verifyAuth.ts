import FormData from "form-data";
import { fetch } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { DEFAULT_PYPI_USERNAME } from "src/constants/DEFAULT_PYPI_USERNAME";
import { NeedAuthError } from "src/errors/NeedAuthError";
import { getAuth } from "src/helpers/getAuth";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function verifyAuth(
  context: Pick<AnalyzeCommitsContext, "env" | "package">,
  pkgContext: PyPIPackageContext,
) {
  const {
    registry: { publishUrl },
  } = pkgContext;

  const { token, username, password } = await getAuth(context, pkgContext);

  if (!token && !password) {
    throw new NeedAuthError(publishUrl);
  }

  const form = new FormData();

  form.append(":action", "file_upload");

  const response = await fetch(publishUrl, {
    method: "POST",
    headers: {
      ...form.getHeaders(),
      Authorization: `Basic ${Buffer.from(token ? `${DEFAULT_PYPI_USERNAME}:${token}` : `${username}:${password}`).toString("base64")}`,
    },
    body: form,
  });

  if (response.status == 403) {
    throw new NeedAuthError(publishUrl);
  }
}
