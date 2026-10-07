import { render, screen } from "@testing-library/react";
import { App } from "./App";

// First test of the shell (written before App.tsx): the container renders its brand heading
// and a landmark main region. Routing, session and remotes come with HU-WEB-001 and HU-AUT-001.
describe("App shell", () => {
  it("renders the Qampus heading inside a main landmark", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Qampus" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
