import TestDirector from 'test-director';
import testFindUnusedExportsCli from './cli/find-unused-exports.test.mjs';
import testCliError from './private/CliError.test.mjs';
import testGetVariableDeclarationIdentifierNames from './private/getVariableDeclarationIdentifierNames.test.mjs';
import testIsDirectoryPath from './private/isDirectoryPath.test.mjs';
import testReportCliError from './private/reportCliError.test.mjs';
import testScanModuleCode from './private/scanModuleCode.test.mjs';
import testFindUnusedExports from './public/findUnusedExports.test.mjs';
import testReplaceStackTraces from './replaceStackTraces.test.mjs';

const tests = new TestDirector();

testReplaceStackTraces(tests);
testFindUnusedExportsCli(tests);
testCliError(tests);
testGetVariableDeclarationIdentifierNames(tests);
testIsDirectoryPath(tests);
testReportCliError(tests);
testScanModuleCode(tests);
testFindUnusedExports(tests);

tests.run();
