import CliError from "../../../private/CliError.mjs";
import reportCliError from "../../../private/reportCliError.mjs";

reportCliError("CLI", new CliError("Message."));
