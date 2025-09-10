
export type Topology =
  | MeshTopology
  | RingTopology
  | StarTopology
  | CordTopology
  | CustomTopology;

type MeshTopology = {
  type: "mesh";
}
type RingTopology = {
  type: "ring";
}
type StarTopology = {
  type: "star";
}
type CordTopology = {
  type: "cord";
}
type CustomTopology = {
  type: "custom";
  join(id: string, network: Settings): boolean;
  remove(id: string, network: Settings): void;
  forward(target: string, network: Settings): string;
}

export type Settings = {
  password?: string;
  limit?: number;
  id: string;
  host: string;
  topology: Topology;
}

export type RouterTable = {}