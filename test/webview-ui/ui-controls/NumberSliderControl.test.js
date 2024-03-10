import SwitchControl from "../../../src/webview-ui/ui-controls/SwitchControl.svelte";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

test("click", async () => {
    const user = userEvent.setup();

    const { component } = render(SwitchControl, {
        label: "labelTest",
        path: ["EFFECT", 1, "somebool"],
        params: {
            defValue: false,
        },
        value: false,
    });

    const label = screen.queryByText(/labelTest/iu);
    expect(label).toBeInTheDocument();

    const button = screen.getByRole("checkbox");
    expect(button).toBeInTheDocument();

    // Mock function
    let data = null;
    const mock = vi.fn((event) => {
        data = event.detail;
    });
    component.$on("changed", mock);

    await fireEvent.click(button);
    // await user.click(button);
    // component.onChanged();

    expect(mock).toHaveBeenCalled();
    expect(data).toEqual([{ value: true, path: ["EFFECT", 1, "somebool"] }]);

    await fireEvent.click(button);

    expect(mock).toHaveBeenCalled();
    expect(data).toEqual([{ value: false, path: ["EFFECT", 1, "somebool"] }]);
});
