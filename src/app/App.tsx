// The container's root component. In this first increment it renders the brand and a main
// landmark; routing, the session and the remotes registry are added by HU-WEB-001 and
// HU-AUT-001 on top of this file.
export function App() {
  return (
    <>
      <header>
        <h1>Qampus</h1>
      </header>
      <main>
        <p>Front-end container of Qampus. The domain portals load here by route.</p>
      </main>
    </>
  );
}
