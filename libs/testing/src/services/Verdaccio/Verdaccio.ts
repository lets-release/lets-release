import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { got } from "got";
import pRetry from "p-retry";

import { Service } from "src/services/Service";

const IMAGE = "verdaccio/verdaccio:5";
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
      await pRetry(async () => await got(this.url, { cache: false }), {
        retries: 7,
        minTimeout: 1000,
        factor: 2,
      });
    } catch {
      throw new Error(`Couldn't start npm-docker-couchdb after 2 min`);
    }

    // Create user
    await got(`${this.url}/-/user/org.couchdb.user:${NPM_USERNAME}`, {
      method: "PUT",
      json: {
        _id: `org.couchdb.user:${NPM_USERNAME}`,
        name: NPM_USERNAME,
        roles: [],
        type: "user",
        password: NPM_PASSWORD,
        email: NPM_EMAIL,
      },
    });

    // Create token for user
    const { token } = await got(`${this.url}/-/npm/v1/tokens`, {
      username: NPM_USERNAME,
      password: NPM_PASSWORD,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      json: { password: NPM_PASSWORD, readonly: false, cidr_whitelist: [] },
    }).json<{ token: string }>();

    this.npmToken = token;
  }
}
