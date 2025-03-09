import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import pRetry from "p-retry";
import { fetch } from "undici";

import { Service } from "src/services/Service";

const IMAGE = "verdaccio/verdaccio:latest";
const SERVER_HOST = "localhost";
const NPM_USERNAME = "npm_username";
const NPM_PASSWORD = "npm_password";
const NPM_EMAIL = "email@example.com";

export class Verdaccio extends Service {
  host = SERVER_HOST;
  npmToken?: string;

  get url() {
    return `http://${this.host}:${this.port}`;
  }

  constructor(
    name: string,
    public port = 4873,
  ) {
    super(IMAGE, name);
  }

  async start() {
    await super.start({
      Tty: true,
      HostConfig: {
        PortBindings: {
          [`4873/tcp`]: [{ HostPort: `${this.port}` }],
        },
        Binds: [
          `${path.join(path.dirname(fileURLToPath(import.meta.url)), "config.yaml")}:/verdaccio/conf/config.yaml`,
        ],
      },
      ExposedPorts: { [`4873/tcp`]: {} },
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
      throw new Error(`Couldn't start verdaccio after 2 min`);
    }

    // Create user
    await fetch(`${this.url}/-/user/org.couchdb.user:${NPM_USERNAME}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: `org.couchdb.user:${NPM_USERNAME}`,
        name: NPM_USERNAME,
        roles: [],
        type: "user",
        password: NPM_PASSWORD,
        email: NPM_EMAIL,
      }),
    });

    // Create token for user
    const response = await fetch(`${this.url}/-/npm/v1/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${NPM_USERNAME}:${NPM_PASSWORD}`).toString("base64")}`,
      },
      body: JSON.stringify({
        password: NPM_PASSWORD,
        readonly: false,
        cidr_whitelist: [],
      }),
    });

    const { token } = (await response.json()) as { token: string };

    this.npmToken = token;
  }
}
