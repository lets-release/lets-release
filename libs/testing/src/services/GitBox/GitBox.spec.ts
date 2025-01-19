import { Container } from "dockerode";

import { GitBox } from "src/services/GitBox/GitBox";
import { Service } from "src/services/Service";

const on = vi.fn().mockImplementation((event, cb) => {
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
const gitBox = new GitBox("git-box");
const superStart = vi
  .spyOn(Service.prototype, "start")
  .mockImplementation(async () => {
    gitBox.container = container as unknown as Container;
  });

describe("gitBox", () => {
  beforeEach(() => {
    exec.start.mockClear();
    container.exec.mockClear();
    superStart.mockClear();
  });

  it("should start container", async () => {
    await expect(gitBox.start()).resolves.toBeUndefined();
    expect(container.exec).toHaveBeenCalledOnce();
    expect(exec.start).toHaveBeenCalledOnce();
  });
});
