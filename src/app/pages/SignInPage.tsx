import { config } from "../../core/config";
import { DevSignIn } from "../../core/auth/DevSignIn";

// /login. On develop, the development sign-in (norm 5.5.2); otherwise the mount point of
// qone-identity-portal, registered in remotes/registry.ts when the portal exists.
export function SignInPage() {
  if (config.devLogin) {
    return <DevSignIn />;
  }
  return (
    <section aria-labelledby="sign-in-title">
      <h2 id="sign-in-title">Sign in</h2>
      <p>The identity portal loads here.</p>
    </section>
  );
}
