export type Medium =
  | DataMedium
  | VideoMedium
  | AudioMedium
  | ScreenMedium;

export type DataMedium = {
  type: "data";
  dataChannelDict: RTCDataChannelInit | undefined;
  channel: RTCDataChannel;
}
type VideoMedium = {
  type: "video";
  stream: MediaStream;
  constraints: MediaStreamConstraints | undefined;
  senders: RTCRtpSender[];
  unlabelled?: boolean;
}
type AudioMedium = {
  type: "audio";
  stream: MediaStream;
  constraints: MediaStreamConstraints | undefined;
  senders: RTCRtpSender[];
  unlabelled?: boolean;
}
type ScreenMedium = {
  type: "screen";
  stream: MediaStream;
  options: DisplayMediaStreamOptions | undefined;
  senders: RTCRtpSender[];
}

export type Settings =
  | DataMedium
  | Omit<VideoMedium, 'stream' | 'senders'> & { stream: MediaStream | undefined }
  | Omit<AudioMedium, 'stream' | 'senders'> & { stream: MediaStream | undefined }
  | Omit<ScreenMedium, 'stream' | 'senders'> & { stream: MediaStream | undefined };