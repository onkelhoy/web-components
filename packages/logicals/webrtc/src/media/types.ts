
export enum MediaType {
  Screen = "screen",
  Video = "video",
  Audio = "audio",
  Data = "data",
};
export type MediaConfig = DataChannelConfig | MediaStreamConstraints | DisplayMediaStreamOptions;

export type DataChannelConfig = {
  label: string;
  dataChannelDict?: RTCDataChannelInit | undefined;
}
