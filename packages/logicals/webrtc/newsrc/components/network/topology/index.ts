import { CordTopology } from "./cord";
import { MeshTopology } from "./mesh";
import { RingTopology } from "./ring";
import { StarTopology } from "./star";

export const Topology = {
  "cord": CordTopology,
  "mesh": MeshTopology,
  "ring": RingTopology,
  "star": StarTopology,
}