export type VoiceRoomId = string;
export type VoiceUserId = string;

export type VoiceJoinPayload = {
  roomId: VoiceRoomId;
  userId: VoiceUserId;
  displayName?: string | null;
};

export type VoiceLeavePayload = {
  roomId: VoiceRoomId;
  userId: VoiceUserId;
};

export type VoiceOfferPayload = {
  roomId: VoiceRoomId;
  targetUserId: VoiceUserId;
  offer: RTCSessionDescriptionInit;
};

export type VoiceAnswerPayload = {
  roomId: VoiceRoomId;
  targetUserId: VoiceUserId;
  answer: RTCSessionDescriptionInit;
};

export type VoiceIceCandidatePayload = {
  roomId: VoiceRoomId;
  targetUserId: VoiceUserId;
  candidate: RTCIceCandidateInit;
};

export type VoiceOfferReceivedPayload = {
  roomId: VoiceRoomId;
  fromUserId: VoiceUserId;
  offer: RTCSessionDescriptionInit;
};

export type VoiceAnswerReceivedPayload = {
  roomId: VoiceRoomId;
  fromUserId: VoiceUserId;
  answer: RTCSessionDescriptionInit;
};

export type VoiceIceCandidateReceivedPayload = {
  roomId: VoiceRoomId;
  fromUserId: VoiceUserId;
  candidate: RTCIceCandidateInit;
};

export type VoiceUserJoinedPayload = {
  roomId: VoiceRoomId;
  userId: VoiceUserId;
  displayName?: string | null;
};

export type VoiceParticipantsPayload = {
  roomId: VoiceRoomId;
  participants: VoiceUserId[];
};

export type VoiceUserLeftPayload = {
  roomId: VoiceRoomId;
  userId: VoiceUserId;
};

