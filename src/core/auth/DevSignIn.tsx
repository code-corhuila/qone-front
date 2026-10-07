import { useId, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { session } from "./session";

const MESSAGES = {
  malformed: "This is not a JWT: expected header.payload.signature.",
  expired: "This token has expired. Mint a new one with dev-token.sh.",
} as const;

// Development sign-in of norm 5.5.2: accepts a token minted by qone-infra/scripts/dev-token.sh
// while qone-identity-portal does not exist. Rendered only when VITE_DEV_LOGIN is "true"
// (see SignInPage); ci.yml fails a build for main that contains the "dev-sign-in" marker.
// Form rules of Annex H: label per field, error beside the field, button disabled while empty.
export function DevSignIn() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | undefined>();
  const fieldId = useId();
  const errorId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = session.signIn(token.trim());
    if (!result.ok) {
      setError(MESSAGES[result.reason]);
      return;
    }
    void navigate(from, { replace: true });
  }

  return (
    <section data-testid="dev-sign-in" aria-labelledby={`${fieldId}-title`}>
      <h2 id={`${fieldId}-title`}>Sign in</h2>
      <p>
        Development environment: paste a token from <code>qone-infra/scripts/dev-token.sh &lt;user-id&gt; [minutes] [role]</code>.
        The identity portal replaces this screen.
      </p>
      <form onSubmit={submit} noValidate>
        <label htmlFor={fieldId}>Development token</label>
        <textarea
          id={fieldId}
          name="token"
          rows={4}
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setError(undefined);
          }}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {error ? (
          <p id={errorId} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={token.trim() === ""}>
          Sign in
        </button>
      </form>
    </section>
  );
}
