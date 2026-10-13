import { Link } from "react-router";
import { useSession } from "../../core/auth/useSession";
import { ROLE_TEXT, TERM } from "../../layout/Shell";
import { portalsFor, type PortalName } from "../../remotes/registry";

const KIND: Record<PortalName, string> = {
  identity: "Account",
  catalog: "Academic offer",
  enrollment: "Your studies",
  billing: "Payments",
  advisor: "AI advisor",
};

const WHAT: Record<PortalName, string> = {
  identity: "Your account.",
  catalog: "Subjects, the pensum and the groups open this term with their seats.",
  enrollment: "Your record and progress, enrollments, schedule, certificates and rosters.",
  billing: "The term invoice and its payment.",
  advisor: "Ask the academic advisor and confirm the plans it proposes.",
};

// The home of a signed-in person: one card per portal their role may open.
export function Home() {
  const { user } = useSession();
  const links = user ? portalsFor(user.role) : [];
  const first = user?.name.split(" ")[0];
  return (
    <section aria-labelledby="home-title" className="home">
      <h2 id="home-title">{first ? `Hello, ${first}` : "Welcome"}</h2>
      <p className="lead">
        {user ? `${ROLE_TEXT[user.role]} · ` : ""}Term {TERM}
      </p>
      <ul className="portal-grid">
        {links.map((portal) => (
          <li key={portal.name}>
            <Link className="portal-card" to={portal.route}>
              <span className="kicker">{KIND[portal.name]}</span>
              <strong>{portal.label}</strong>
              <span>{WHAT[portal.name]}</span>
              <span className="go">Open</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
