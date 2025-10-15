export type ITopology = {
  join(id: string, network: Settings): boolean;
  remove(id: string, network: Settings): void;
  relay(target: string, network: Settings): string;
}

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
type CustomTopology = ITopology & {
  type: "custom";
}


export type Settings = {
  password?: string;
  limit?: number;
  id: string;
  host: string;
  topology: Topology;
}

export type RouterTable = {}