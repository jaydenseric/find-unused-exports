'use strict';

const { TestDirector } = require('test-director');

const tests = new TestDirector();

require('./replaceStackTraces.test')(tests);
require('./cli/find-unused-exports.test')(tests);
require('./private/getVariableDeclarationIdentifierNames.test')(tests);
require('./private/isDirectoryPath.test')(tests);
require('./private/scanModuleCode.test')(tests);
require('./private/scanModuleFile.test')(tests);
require('./public/findUnusedExports.test')(tests);

tests.run();
