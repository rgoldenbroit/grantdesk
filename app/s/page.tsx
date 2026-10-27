import { AgentChat } from "@/app/_components/agent-chat";
import { getCurrentUser } from "@/lib/current-user";

export default async function NewSessionPage() {
  return <AgentChat sessionless user={await getCurrentUser()} />;
}
