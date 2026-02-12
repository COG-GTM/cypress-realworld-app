import { getBankAccountsByUserId } from "../../database";

const Query = {
  listBankAccount(obj: any, args: any, ctx: any) {
    try {
      return getBankAccountsByUserId(ctx.user.id);
    } catch (err: any) {
      throw new Error(err);
    }
  },
};

export default Query;
