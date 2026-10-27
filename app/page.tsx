import { AgentChat } from "@/app/_components/agent-chat";
import { getCurrentUser } from "@/lib/current-user";

export default async function Page() {
  return <AgentChat user={await getCurrentUser()} />;
}
