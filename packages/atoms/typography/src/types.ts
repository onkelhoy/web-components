// DESIRED for clean and html friendly 
export type Variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "caption" | "p" | "p2" | "label";

// adrian logic (but it has all the styles)
// type CommonVariantNames = 'C' | 'T' | 'H' | 'copy' | 'title' | 'heading';
// export type Variant = `${CommonVariantNames | 'B' | 'button'}${1 | 2}` | `${CommonVariantNames}${3 | 4}` | 'H5';
export type Weight = "thin" | "normal" | "semibold" | "semi-bold" | "bold";
export type Alignment = "center" | "justify" | "start" | "end" | "left" | "right" | "unset" | "inherit" | "initial";