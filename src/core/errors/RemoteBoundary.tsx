import { Component, type ErrorInfo, type ReactNode } from "react";
import type { PortalName } from "../../remotes/registry";

interface Props {
  portal: PortalName;
  children: ReactNode;
  /** Called on retry before the children render again (for example to load the remote again). */
  onRetry?: () => void;
}

interface State {
  failed: boolean;
}

// One error boundary per portal (Annex H, "Un portal caído no tumba la aplicación"): a remote
// that fails to load or throws while rendering replaces only its own area with a notice and a
// retry; the shell and the other portals keep working.
export class RemoteBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[shell] portal "${this.props.portal}" failed`, error, info.componentStack);
  }

  private retry = (): void => {
    this.props.onRetry?.();
    this.setState({ failed: false });
  };

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" aria-live="polite">
        <h2>Not available</h2>
        <p>The {this.props.portal} portal is not available right now. The rest of Qampus keeps working.</p>
        <button type="button" onClick={this.retry}>
          Retry
        </button>
      </section>
    );
  }
}
