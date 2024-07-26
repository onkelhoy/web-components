import { HTMLElement } from "node-html-parser";

export type TYPES = "common" | "live" | "notfound" | "directory" | "wrapper";

export type TEMPLATE = {
  file: null | HTMLElement;
  process?(file: string): string;
}