// NOTE these are just for example purposes

type TB = 'top' | 'bottom';
type LR = 'left' | 'right';

export type Reveal = 'hover' | 'click';
export type Placement = `${TB}-${LR | 'center'}` | `${LR}-${TB | 'center'}`;
export type PlacementInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
  w: number;
  h: number;
};
export type Scores = Partial<Record<Placement, number>>;
export type TBLR = TB | LR;
export type TBLRC = TBLR | 'center';

export const PLACEMENTS: Placement[] = ["top-left", "top-right", "top-center", "bottom-left", "bottom-right", "bottom-center", "left-top", "left-bottom", "left-center", "right-top", "right-bottom", "right-center"];
export const OPPOSITE: Record<TBLRC, TBLRC> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
  center: "center"
};
export const ROTATED: Record<TBLR, TBLR> = {
  top: "left",
  bottom: "left",
  left: "bottom",
  right: "bottom"
}