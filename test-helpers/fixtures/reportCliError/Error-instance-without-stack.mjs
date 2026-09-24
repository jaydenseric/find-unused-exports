import reportCliError from "../../../reportCliError.mjs";

const error = new Error("Message.");
delete error.stack;
reportCliError("CLI", error);
