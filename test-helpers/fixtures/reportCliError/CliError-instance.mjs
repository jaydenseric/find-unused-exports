import CliError from "../../../CliError.mjs";
import reportCliError from "../../../reportCliError.mjs";

reportCliError("CLI", new CliError("Message."));
