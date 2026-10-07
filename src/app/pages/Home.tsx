import { useSession } from "../../core/auth/useSession";
import { portalsFor } from "../../remotes/registry";
import { Link } from "react-router";

// The home of a signed-in person: the portals their role may open. The person and the
// sign-out live in the Shell header.
export function Home() {
  const { user } = useSession();
  const links = user ? portalsFor(user.role) : [];
  return (
    <section aria-labelledby="home-title">
      <h2 id="home-title">Welcome</h2>
      <p>Choose a section. Each one is a domain portal that loads when you open it.</p>
      <ul>
        {links.map((portal) => (
          <li key={portal.name}>
            <Link to={portal.route}>{portal.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
