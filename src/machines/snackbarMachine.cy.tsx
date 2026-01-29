import { interpret } from "xstate";
import { snackbarMachine, Severities } from "./snackbarMachine";

describe("SnackbarMachine State Transitions", () => {
  let snackbarService;

  beforeEach(() => {
    snackbarService = interpret(snackbarMachine);
    snackbarService.start();
  });

  afterEach(() => {
    snackbarService.stop();
  });

  it("starts in invisible state", () => {
    expect(snackbarService.state.value).to.equal("invisible");
  });

  it("has undefined severity in initial context", () => {
    expect(snackbarService.state.context.severity).to.be.undefined;
  });

  it("has undefined message in initial context", () => {
    expect(snackbarService.state.context.message).to.be.undefined;
  });

  it("transitions to visible state on SHOW event", () => {
    snackbarService.send({ type: "SHOW", severity: Severities.success, message: "Test message" });
    expect(snackbarService.state.value).to.equal("visible");
  });

  it("sets severity and message on SHOW event", () => {
    snackbarService.send({ type: "SHOW", severity: Severities.error, message: "Error occurred" });
    expect(snackbarService.state.context.severity).to.equal(Severities.error);
    expect(snackbarService.state.context.message).to.equal("Error occurred");
  });

  it("transitions back to invisible on HIDE event", () => {
    snackbarService.send({ type: "SHOW", severity: Severities.info, message: "Info message" });
    expect(snackbarService.state.value).to.equal("visible");

    snackbarService.send({ type: "HIDE" });
    expect(snackbarService.state.value).to.equal("invisible");
  });

  it("resets context on transition to invisible", () => {
    snackbarService.send({ type: "SHOW", severity: Severities.warning, message: "Warning" });
    snackbarService.send({ type: "HIDE" });

    expect(snackbarService.state.context.severity).to.be.undefined;
    expect(snackbarService.state.context.message).to.be.undefined;
  });

  describe("Severity Types", () => {
    it("handles success severity", () => {
      snackbarService.send({ type: "SHOW", severity: Severities.success, message: "Success!" });
      expect(snackbarService.state.context.severity).to.equal("success");
    });

    it("handles info severity", () => {
      snackbarService.send({ type: "SHOW", severity: Severities.info, message: "Info!" });
      expect(snackbarService.state.context.severity).to.equal("info");
    });

    it("handles warning severity", () => {
      snackbarService.send({ type: "SHOW", severity: Severities.warning, message: "Warning!" });
      expect(snackbarService.state.context.severity).to.equal("warning");
    });

    it("handles error severity", () => {
      snackbarService.send({ type: "SHOW", severity: Severities.error, message: "Error!" });
      expect(snackbarService.state.context.severity).to.equal("error");
    });
  });

  describe("Multiple Show Events", () => {
    it("updates message when showing new message while visible", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.success,
        message: "First message",
      });
      expect(snackbarService.state.context.message).to.equal("First message");

      snackbarService.send({ type: "SHOW", severity: Severities.error, message: "Second message" });
      expect(snackbarService.state.context.message).to.equal("Second message");
      expect(snackbarService.state.context.severity).to.equal(Severities.error);
    });
  });
});
