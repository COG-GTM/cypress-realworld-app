import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "../NotificationBadge";

const renderBadge = (notificationCount: number) => {
  return render(
    <MemoryRouter>
      <NotificationBadge notificationCount={notificationCount} />
    </MemoryRouter>
  );
};

describe("NotificationBadge", () => {
  it("should hide the badge when notification count is zero", () => {
    const { container } = renderBadge(0);
    const badge = container.querySelector(".MuiBadge-badge");
    expect(badge).toHaveClass("MuiBadge-invisible");
  });

  it("should display the correct count for a single notification", () => {
    renderBadge(1);
    const badge = screen.getByText("1");
    expect(badge).toBeVisible();
  });

  it("should display the correct count for multiple notifications", () => {
    renderBadge(5);
    const badge = screen.getByText("5");
    expect(badge).toBeVisible();
  });

  it("should display a large notification count", () => {
    renderBadge(99);
    const badge = screen.getByText("99");
    expect(badge).toBeVisible();
  });

  it("should render the notifications icon", () => {
    const { container } = renderBadge(3);
    const icon = container.querySelector("[data-testid='NotificationsIcon']");
    expect(icon).toBeInTheDocument();
  });

  it("should link to the notifications page", () => {
    const { container } = renderBadge(3);
    const link = container.querySelector("a[href='/notifications']");
    expect(link).toBeInTheDocument();
  });

  it("should have the correct data-test attribute", () => {
    const { container } = renderBadge(3);
    const badge = container.querySelector("[data-test='nav-top-notifications-count']");
    expect(badge).toBeInTheDocument();
  });
});
