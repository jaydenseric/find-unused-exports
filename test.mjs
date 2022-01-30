import TestDirector from "test-director";

import test_CliError from "./CliError.test.mjs";
import test_cli_find_unused_exports from "./find-unused-exports.test.mjs";
import test_findUnusedExports from "./findUnusedExports.test.mjs";
import test_getVariableDeclarationIdentifierNames from "./getVariableDeclarationIdentifierNames.test.mjs";
import test_isDirectoryPath from "./isDirectoryPath.test.mjs";
import test_reportCliError from "./reportCliError.test.mjs";
import test_scanModuleCode from "./scanModuleCode.test.mjs";
import test_replaceStackTraces from "./test/replaceStackTraces.test.mjs";

const tests = new TestDirector();

test_CliError(tests);
test_cli_find_unused_exports(tests);
test_findUnusedExports(tests);
test_getVariableDeclarationIdentifierNames(tests);
test_isDirectoryPath(tests);
test_reportCliError(tests);
test_scanModuleCode(tests);
test_replaceStackTraces(tests);

tests.run();
