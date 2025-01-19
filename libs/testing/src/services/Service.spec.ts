import Docker, { Container } from "dockerode";

import { Service } from "src/services/Service";

vi.mock("dockerode");

const container = { start: vi.fn(), stop: vi.fn(), remove: vi.fn() };
const docker = {
  pull: vi.fn(),
  createContainer: vi.fn().mockResolvedValue(container),
  getContainer: vi.fn().mockReturnValue(container),
  modem: {
    followProgress: vi.fn(),
  },
};

vi.mocked(Docker).mockReturnValue(docker as unknown as Docker);

const image = "test-image";
const name = "test";

describe("Service", () => {
  beforeEach(() => {
    container.start.mockClear();
    container.stop.mockClear();
    container.remove.mockClear();
    docker.pull.mockClear();
    docker.createContainer.mockClear();
    docker.getContainer.mockReset().mockReturnValue(container);
    docker.modem.followProgress
      .mockReset()
      .mockImplementation((_, callback) => {
        callback(undefined);
      });
  });

  it("should pull the image", async () => {
    const service = new Service(image, name);

    await expect(service.pull()).resolves.toBeUndefined();
    expect(docker.pull).toHaveBeenCalledWith(service.image);
    expect(docker.modem.followProgress).toHaveBeenCalledOnce();
  });

  it("should throw error if failed to pull the image", async () => {
    docker.modem.followProgress.mockImplementation((_, callback) => {
      callback(new Error("Failed to pull image"));
    });

    const service = new Service(image, name);

    await expect(service.pull()).rejects.toThrow(Error);
    expect(docker.pull).toHaveBeenCalledWith(service.image);
    expect(docker.modem.followProgress).toHaveBeenCalledOnce();
  });

  it("should stop current container and create a new one", async () => {
    const service = new Service(image, name);

    await expect(service.start({})).resolves.toBeUndefined();
    expect(docker.createContainer).toHaveBeenCalledWith({
      Image: service.image,
      name: service.name,
    });
    expect(container.start).toHaveBeenCalledOnce();
  });

  it("should create a new container if container does not exist", async () => {
    docker.getContainer.mockReset().mockImplementation(() => {
      throw new Error("Container does not exist");
    });

    const service = new Service(image, name);

    await expect(service.start({})).resolves.toBeUndefined();
    expect(docker.createContainer).toHaveBeenCalledWith({
      Image: service.image,
      name: service.name,
    });
    expect(container.start).toHaveBeenCalledOnce();
  });

  it("should stop and remove the container", async () => {
    const service = new Service(image, name);
    service.container = container as unknown as Container;

    await expect(service.stop()).resolves.toBeUndefined();
    expect(container.stop).toHaveBeenCalledOnce();
    expect(container.remove).toHaveBeenCalledOnce();
  });
});
