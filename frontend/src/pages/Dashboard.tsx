import { useAuthGuard } from "../hooks/useAuthGuard";

export default function Dashboard() {
  const user = useAuthGuard();
  if (!user) return null;
  return <div>Welcome {user.email}</div>;
}
