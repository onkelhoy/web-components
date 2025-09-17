import { MediaSettings as MediaSettingsOriginal } from "../media";

export type Settings = {
  configuration: RTCConfiguration | undefined;
}

export type StreamSettings = Exclude<MediaSettingsOriginal, { type: 'data' }>;
export type MediaSettings = StreamSettings | Omit<Extract<MediaSettingsOriginal, { type: 'data' }>, 'channel'>;

export type PrimitiveChannelData = string | Blob | ArrayBuffer | ArrayBufferView<ArrayBufferLike>;