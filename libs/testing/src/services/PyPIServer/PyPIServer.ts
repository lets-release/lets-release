import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import pRetry from "p-retry";
import { fetch } from "undici";

import { Service } from "src/services/Service";

const IMAGE = "pypiserver/pypiserver:latest";
const SERVER_HOST = "localhost";
const PYPI_TOKEN = "test-token";
const PYPI_USERNAME = "user";
const PYPI_PASSWORD = "test-user";

export class PyPIServer extends Service {
  host = SERVER_HOST;
  pypiToken = PYPI_TOKEN;
  pypiUsername = PYPI_USERNAME;
  pypiPassword = PYPI_PASSWORD;

  get url() {
    return `http://${this.host}:${this.port}`;
  }

  constructor(
    name: string,
    public port = 8080,
  ) {
    super(IMAGE, name);
  }

  async start() {
    await super.start({
      Tty: true,
      HostConfig: {
        PortBindings: {
          [`8080/tcp`]: [{ HostPort: `${this.port}` }],
        },
        Binds: [
          `${path.join(path.dirname(fileURLToPath(import.meta.url)), ".htpasswd")}:/data/.htpasswd`,
        ],
      },
      ExposedPorts: { [`8080/tcp`]: {} },
    });

    await setTimeout(4000);

    try {
      // Wait for the registry to be ready
      await pRetry(async () => await fetch(this.url, { cache: "no-cache" }), {
        retries: 7,
        minTimeout: 1000,
        factor: 2,
      });
    } catch {
      throw new Error(`Couldn't start pypiserver after 2 min`);
    }
  }
}
