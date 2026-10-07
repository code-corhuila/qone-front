import { Link } from "react-router";

// The 404 of the shell (norm 5.5, Annex H: "Una ruta inexistente muestra la página 404").
export function NotFound() {
  return (
    <section aria-labelledby="not-found-title">
      <h2 id="not-found-title">Page not found</h2>
      <p>The address does not exist in Qampus.</p>
      <Link to="/">Go to the home page</Link>
    </section>
  );
}
