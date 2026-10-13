import { config } from "../../core/config";
import { DevSignIn } from "../../core/auth/DevSignIn";
import { remoteEntryOf } from "../../remotes/registry";
import { PortalPage } from "./PortalPage";

// /login/*, the only public area. Where the environment deploys qone-identity-portal it is
// mounted here (sign-in and student registration, HU-AUT-001) and hands the token to the
// session. The development sign-in of norm 5.5.2 stays only where VITE_DEV_LOGIN is "true":
// alone when there is no identity portal, folded below it when there is one.
export function SignInPage() {
  const identity = remoteEntryOf("identity") !== undefined;
  if (!identity) {
    return config.devLogin ? (
      <DevSignIn />
    ) : (
      <section aria-labelledby="sign-in-title">
        <h2 id="sign-in-title">Sign in</h2>
        <p>The sign-in is not available in this environment.</p>
      </section>
    );
  }
  return (
    <>
      <PortalPage portal="identity" />
      {config.devLogin ? (
        <details>
          <summary>Development sign-in with a token</summary>
          <DevSignIn />
        </details>
      ) : null}
    </>
  );
}
