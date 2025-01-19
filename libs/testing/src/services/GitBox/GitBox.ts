import { Service } from "src/services/Service";

const IMAGE = "semanticrelease/docker-gitbox:latest";
const SERVER_HOST = "localhost";
const GIT_USERNAME = "git_username";
const GIT_PASSWORD = "git_password";

export class GitBox extends Service {
  host = SERVER_HOST;
  gitCredential = `${GIT_USERNAME}:${GIT_PASSWORD}`;

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
          [`80/tcp`]: [{ HostPort: `${this.port}` }],
        },
      },
      ExposedPorts: { [`80/tcp`]: {} },
    });

    const exec = await this.container?.exec({
      Cmd: ["ng-auth", "-u", GIT_USERNAME, "-p", GIT_PASSWORD],
      AttachStdout: true,
      AttachStderr: true,
    });

    const duplex = await exec?.start({});

    duplex?.setEncoding("utf8");
    duplex?.on("data", () => {
      //
    });
    duplex?.on("end", () => {
      duplex?.destroy();
    });
  }
}
