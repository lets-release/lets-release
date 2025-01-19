import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { PluginObject } from "src/schemas/PluginObject";

export const PluginSpec = z.union([
  NonEmptyString,
  PluginObject,
  z.tuple([
    z.union([NonEmptyString, PluginObject]),
    z.object({}).passthrough().optional(),
  ]),
]);

/**
 * Specifies a plugin to use.
 *
 * The plugin is specified by its module name or a plugin object.
 *
 * To pass options to a plugin, specify an array containing the plugin module
 * name or a plugin object and an options object.
 */
export type PluginSpec<T extends object = object> =
  | string
  | PluginObject
  | [string | PluginObject, T?];
