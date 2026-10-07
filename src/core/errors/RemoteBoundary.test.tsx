import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { RemoteBoundary } from "./RemoteBoundary";

function Explodes({ when }: { when: boolean }) {
  if (when) throw new Error("remoteEntry.js failed to load");
  return <p>portal content</p>;
}

// Annex H: "Un portal caído no tumba la aplicación" - only its area says it is unavailable,
// with a retry; the rest of the shell keeps working.
describe("RemoteBoundary", () => {
  it("renders the portal when nothing fails", () => {
    render(
      <RemoteBoundary portal="catalog">
        <Explodes when={false} />
      </RemoteBoundary>,
    );
    expect(screen.getByText("portal content")).toBeInTheDocument();
  });

  it("replaces only its area with the unavailable message and a retry when the portal throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();

    function Harness() {
      const [broken, setBroken] = useState(true);
      return (
        <>
          <p>rest of the shell</p>
          <button type="button" onClick={() => setBroken(false)}>
            fix
          </button>
          <RemoteBoundary portal="catalog">
            <Explodes when={broken} />
          </RemoteBoundary>
        </>
      );
    }
    render(<Harness />);

    expect(screen.getByRole("alert")).toHaveTextContent("The catalog portal is not available right now.");
    expect(screen.getByText("rest of the shell")).toBeInTheDocument();
    expect(screen.queryByText("portal content")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "fix" }));
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByText("portal content")).toBeInTheDocument();
    spy.mockRestore();
  });
});
