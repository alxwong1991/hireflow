import type Message from "./message";

export default interface MessagePage {
  items: Message[];
  hasMore: boolean;
}
