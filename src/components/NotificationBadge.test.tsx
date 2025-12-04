import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides the badge when count is zero", () => {
    const { container } = render(<NotificationBadge count={0} />);

    const badge = container.querySelector('[data-test="nav-top-notifications-count"]');
    expect(badge).toBeInTheDocument();

    const badgeContent = badge?.querySelector(".MuiBadge-badge");
    expect(badgeContent).toHaveClass("MuiBadge-invisible");
  });

  it("displays the correct count when there are notifications", () => {
    const { container } = render(<NotificationBadge count={5} />);

    const badge = container.querySelector('[data-test="nav-top-notifications-count"]');
    expect(badge).toBeInTheDocument();

    const badgeContent = badge?.querySelector(".MuiBadge-badge");
    expect(badgeContent).not.toHaveClass("MuiBadge-invisible");
    expect(badgeContent).toHaveTextContent("5");
  });

  it("displays the correct count for a single notification", () => {
    const { container } = render(<NotificationBadge count={1} />);

    const badge = container.querySelector('[data-test="nav-top-notifications-count"]');
    const badgeContent = badge?.querySelector(".MuiBadge-badge");
    expect(badgeContent).not.toHaveClass("MuiBadge-invisible");
    expect(badgeContent).toHaveTextContent("1");
  });

  it("displays the correct count for large numbers", () => {
    const { container } = render(<NotificationBadge count={99} />);

    const badge = container.querySelector('[data-test="nav-top-notifications-count"]');
    const badgeContent = badge?.querySelector(".MuiBadge-badge");
    expect(badgeContent).not.toHaveClass("MuiBadge-invisible");
    expect(badgeContent).toHaveTextContent("99");
  });

  it("renders the notifications icon", () => {
    const { container } = render(<NotificationBadge count={0} />);

    const badge = container.querySelector('[data-test="nav-top-notifications-count"]');
    const icon = badge?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("applies custom badge styling", () => {
    const { container } = render(<NotificationBadge count={3} />);

    const badge = container.querySelector('[data-test="nav-top-notifications-count"]');
    const badgeContent = badge?.querySelector(".MuiBadge-badge");
    expect(badgeContent).toHaveClass("NotificationBadge-customBadge");
  });
});
