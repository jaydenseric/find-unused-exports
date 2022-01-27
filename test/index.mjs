import TestDirector from "test-director";
import test_findUnusedExportsCli from "./cli/find-unused-exports.test.mjs";
import test_CliError from "./private/CliError.test.mjs";
import test_getVariableDeclarationIdentifierNames from "./private/getVariableDeclarationIdentifierNames.test.mjs";
import test_isDirectoryPath from "./private/isDirectoryPath.test.mjs";
import test_reportCliError from "./private/reportCliError.test.mjs";
import test_scanModuleCode from "./private/scanModuleCode.test.mjs";
import test_findUnusedExports from "./public/findUnusedExports.test.mjs";
import test_replaceStackTraces from "./replaceStackTraces.test.mjs";

const tests = new TestDirector();

test_replaceStackTraces(tests);
test_findUnusedExportsCli(tests);
test_CliError(tests);
test_getVariableDeclarationIdentifierNames(tests);
test_isDirectoryPath(tests);
test_reportCliError(tests);
test_scanModuleCode(tests);
test_findUnusedExports(tests);

tests.run();
