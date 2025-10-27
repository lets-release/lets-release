import Docker from "dockerode";

import { createRepo } from "src/helpers/createRepo";

vi.mock("dockerode");

const on = vi
  .fn()
  .mockImplementation((event, cb: (...args: unknown[]) => void) => {
    if (event === "data") {
      cb("data");
    } else if (event === "end") {
      cb();
    }
  });
const duplex = {
  setEncoding: vi.fn(),
  on,
  destroy: vi.fn(),
};
const exec = {
  start: vi.fn().mockResolvedValue(duplex),
};
const container = {
  exec: vi.fn().mockResolvedValue(exec),
};
const docker = {
  getContainer: vi.fn().mockReturnValue(container),
};

const MockedDocker = vi.mocked(Docker);
MockedDocker.prototype.getContainer = docker.getContainer;

describe("createRepo", () => {
  beforeEach(() => {
    exec.start.mockClear();
    container.exec.mockClear();
  });

  it("should create repository", async () => {
    const { url, authUrl } = await createRepo(
      "containerId",
      "localhost",
      2080,
      "git_username:git_password",
      "test-repo",
    );

    expect(container.exec).toHaveBeenCalledOnce();
    expect(exec.start).toHaveBeenCalledOnce();
    expect(url).toBe("http://localhost:2080/git/test-repo.git");
    expect(authUrl).toBe(
      "http://git_username:git_password@localhost:2080/git/test-repo.git",
    );
  });
});
