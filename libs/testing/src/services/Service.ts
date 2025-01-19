import Docker, { Container, ContainerCreateOptions } from "dockerode";

export class Service {
  docker = new Docker();
  container?: Container;

  constructor(
    public image: string,
    public name: string,
  ) {}

  async pull(): Promise<void> {
    const stream = await this.docker.pull(this.image);

    await new Promise((resolve, reject) => {
      this.docker.modem.followProgress(stream, (err, res) =>
        err ? reject(err) : resolve(res),
      );
    });
  }

  async start(options: ContainerCreateOptions) {
    try {
      const container = this.docker.getContainer(this.name);

      await container?.remove({ force: true });
    } catch {
      // Container does not exist
    }

    this.container = await this.docker.createContainer({
      ...options,
      Image: this.image,
      name: this.name,
    });

    await this.container.start();
  }

  async stop() {
    await this.container?.stop();
    await this.container?.remove();
  }
}
