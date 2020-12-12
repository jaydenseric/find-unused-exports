'use strict';

const reportCliError = require('../../../private/reportCliError');

const error = new Error('Message.');
delete error.stack;
reportCliError('CLI', error);
