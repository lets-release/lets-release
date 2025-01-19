import { Artifact } from "@lets-release/config";

import { mergeArtifacts } from "src/utils/branch/mergeArtifacts";

describe("mergeArtifacts", () => {
  it("should merge artifacts with new artifacts correctly", () => {
    const artifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1"],
      },
      {
        pluginName: "plugin2",
        name: "artifact2",
        url: "url2",
        channels: ["channel2"],
      },
    ];

    const newArtifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "newUrl1",
        channels: ["channel3"],
      },
      {
        pluginName: "plugin3",
        name: "artifact3",
        url: "url3",
        channels: ["channel3"],
      },
    ];

    const expected: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "newUrl1",
        channels: ["channel1", "channel3"],
      },
      {
        pluginName: "plugin2",
        name: "artifact2",
        url: "url2",
        channels: ["channel2"],
      },
      {
        pluginName: "plugin3",
        name: "artifact3",
        url: "url3",
        channels: ["channel3"],
      },
    ];

    const result = mergeArtifacts(artifacts, newArtifacts);
    expect(result).toEqual(expected);
  });

  it("should add new artifacts if they do not exist in the original artifacts", () => {
    const artifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1"],
      },
    ];

    const newArtifacts: Artifact[] = [
      {
        pluginName: "plugin2",
        name: "artifact2",
        url: "url2",
        channels: ["channel2"],
      },
    ];

    const expected: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1"],
      },
      {
        pluginName: "plugin2",
        name: "artifact2",
        url: "url2",
        channels: ["channel2"],
      },
    ];

    const result = mergeArtifacts(artifacts, newArtifacts);
    expect(result).toEqual(expected);
  });

  it("should not duplicate channels when merging artifacts", () => {
    const artifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1"],
      },
    ];

    const newArtifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1", "channel2"],
      },
    ];

    const expected: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1", "channel2"],
      },
    ];

    const result = mergeArtifacts(artifacts, newArtifacts);
    expect(result).toEqual(expected);
  });

  it("should keep the original url if new artifact url is undefined", () => {
    const artifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1"],
      },
    ];

    const newArtifacts: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: undefined,
        channels: ["channel2"],
      },
    ];

    const expected: Artifact[] = [
      {
        pluginName: "plugin1",
        name: "artifact1",
        url: "url1",
        channels: ["channel1", "channel2"],
      },
    ];

    const result = mergeArtifacts(artifacts, newArtifacts);
    expect(result).toEqual(expected);
  });
});
