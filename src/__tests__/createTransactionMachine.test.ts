import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { interpret, Interpreter } from "xstate";
import { createTransactionMachine } from "../machines/createTransactionMachine";
import { authService } from "../machines/authMachine";
import { httpClient } from "../utils/asyncUtils";

const sender = { id: "sender123", firstName: "Edgar", lastName: "Johns" };
const receiver = { id: "receiver123", firstName: "Arely", lastName: "Kertzmann" };
const transactionPayload = {
  transactionType: "payment",
  amount: 100,
  description: "Pizza",
  senderId: sender.id,
  receiverId: receiver.id,
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createTransactionMachine", () => {
  let service: Interpreter<any, any, any, any, any>;

  beforeEach(() => {
    service = interpret(createTransactionMachine.withContext({} as any)).start();
  });

  afterEach(() => {
    service.stop();
    vi.restoreAllMocks();
  });

  it("starts on step one", () => {
    expect(service.state.value).toBe("stepOne");
  });

  it("stores the sender and receiver when users are selected", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);

    expect(service.state.value).toBe("stepTwo");
    expect(service.state.context).toMatchObject({ sender, receiver });
  });

  it("spawns a transaction data machine on step two", () => {
    service.send({ type: "SET_USERS", sender, receiver } as any);

    const child = service.state.children.transactionDataMachine;
    expect(child).toBeDefined();
    expect(child.getSnapshot().value).toBe("idle");
  });

  it("creates the transaction, refreshes the user and moves to step three", async () => {
    const post = vi.spyOn(httpClient, "post").mockResolvedValue({ data: { transaction: {} } });
    const sendToAuth = vi.spyOn(authService, "send");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    service.send({ type: "SET_USERS", sender, receiver } as any);
    service.send({ type: "CREATE", ...transactionPayload } as any);

    expect(service.state.value).toBe("stepThree");
    expect(service.state.context.transactionDetails).toMatchObject(transactionPayload);

    await flush();

    expect(post).toHaveBeenCalledWith(
      expect.stringMatching(/\/transactions$/),
      expect.objectContaining(transactionPayload)
    );
    expect(sendToAuth).toHaveBeenCalledWith("REFRESH");
  });

  it("ignores CREATE before users are selected", () => {
    const { changed } = service.send({ type: "CREATE", ...transactionPayload } as any);

    expect(changed).toBe(false);
    expect(service.state.value).toBe("stepOne");
  });

  it("resets back to step one", () => {
    vi.spyOn(httpClient, "post").mockResolvedValue({ data: {} });

    service.send({ type: "SET_USERS", sender, receiver } as any);
    service.send({ type: "CREATE", ...transactionPayload } as any);
    service.send("RESET");

    expect(service.state.value).toBe("stepOne");
    expect(service.state.children.transactionDataMachine).toBeUndefined();
  });
});
