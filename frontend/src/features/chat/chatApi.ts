import apiClient from "../../lib/apiClient";
import type Chat from "./types/chat";
import type Message from "./types/message";
import type MessagePage from "./types/messagePage";

export async function getChats(): Promise<Chat[]> {
  return (await apiClient.get<Chat[]>("/chats")).data;
}

export async function getChat(applicationId: number): Promise<Chat> {
  return (await apiClient.get<Chat>(`/chats/${applicationId}`)).data;
}

export async function getMessages(applicationId: number, beforeId: number | null): Promise<MessagePage> {
  return (await apiClient.get<MessagePage>(`/chats/${applicationId}/messages`, {
    params: beforeId === null ? {} : { beforeId },
  })).data;
}

export async function sendMessage(applicationId: number, body: string): Promise<Message> {
  return (await apiClient.post<Message>(`/chats/${applicationId}/messages`, { body })).data;
}

export async function markChatRead(applicationId: number, throughMessageId: number): Promise<void> {
  await apiClient.patch(`/chats/${applicationId}/read`, null, { params: { throughMessageId } });
}
