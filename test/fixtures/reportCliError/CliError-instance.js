'use strict';

const CliError = require('../../../private/CliError');
const reportCliError = require('../../../private/reportCliError');

reportCliError('CLI', new CliError('Message.'));
