import { omit, pick } from "lodash-es";
import { ProxyAgent, fetch as undiciFetch } from "undici";

import { ProxyOptions } from "src/schemas/ProxyOptions";

export function generateFetchFunction(proxy?: ProxyOptions) {
  // https://github.com/octokit/request.js#set-a-custom-agent-to-your-requests
  // https://github.com/octokit/rest.js/issues/43#issuecomment-1826163748
  const fetch: typeof undiciFetch = async (input, init) => {
    // FIXME: https://github.com/nodejs/undici/issues/2155
    // `dispatcher` must not be forwarded from the incoming request/init: a
    // dispatcher from a foreign undici copy (e.g. Node's built-in undici) is
    // incompatible with this undici's fetch handler and throws
    // `UND_ERR_INVALID_ARG: invalid onRequestStart method`. Only the local
    // dispatcher (ProxyAgent or undefined) below is used.
    const url =
      typeof input === "string" || input instanceof URL ? input : input.url;
    const options =
      typeof input === "string" || input instanceof URL
        ? init
        : omit(
            {
              ...pick(input, [
                "method",
                "keepalive",
                "headers",
                "body",
                "redirect",
                "integrity",
                "signal",
                "credentials",
                "mode",
                "referrer",
                "referrerPolicy",
                "window",
                "duplex",
              ]),
              ...init,
            },
            "url",
          );

    const dispatcher = proxy
      ? new ProxyAgent(
          typeof proxy === "string" || proxy instanceof URL
            ? {
                uri: proxy.toString(),
              }
            : proxy,
        )
      : undefined;

    return await undiciFetch(url, {
      ...options,
      dispatcher,
    });
  };

  return fetch;
}
