import Docker from "dockerode";

export async function createRepo(
  containerId: string,
  host: string,
  port: number,
  gitCredential: string,
  name: string,
  description = `Repository ${name}`,
) {
  const exec = await new Docker().getContainer(containerId)?.exec({
    Cmd: ["repo-admin", "-n", name, "-d", description],
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

  const url = `http://${host}:${port}/git/${name}.git`;
  const authUrl = `http://${gitCredential}@${host}:${port}/git/${name}.git`;

  return { url, authUrl };
}
