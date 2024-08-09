export type ThemeConfig = {
  href: string;
  representColor: string;
  name: string;
};

declare global {
  interface Window {
    papTheme: {
      map: Map<string, ThemeConfig>;
      current: string;
      change(name: string): void;
      add(theme: ThemeConfig): void;
    }
  }
}