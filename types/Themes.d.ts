declare type ColorType = "red" | "orange" | "yellow" | "green" | "blue" | "indigo" | "violet" | "pink";
declare type ThemeType = "dark" | "light";
declare type ScaleType = "small" | "normal" | "large";
declare type Position = "t" | "b" | "l" | "r" | "tl" | "tr" | "bl" | "br" | "c"

declare interface BaseContext {
    Color: ColorType;
    Theme: ThemeType;
    Compacted: boolean;
    Scale: ScaleType;
    Position: Position
}