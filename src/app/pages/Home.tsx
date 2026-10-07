import { useSession } from "../../core/auth/useSession";
import { session } from "../../core/auth/session";

// The home of a signed-in person. The navigation to each portal arrives with the layout of
// HU-WEB-001; this page proves the session end to end.
export function Home() {
  const { user } = useSession();
  return (
    <section aria-labelledby="home-title">
      <h2 id="home-title">Welcome</h2>
      <p>
        <strong>{user?.name}</strong> <span>{user?.role}</span>
      </p>
      <p>The domain portals load here by route.</p>
      <button type="button" onClick={() => session.clear()}>
        Sign out
      </button>
    </section>
  );
}
