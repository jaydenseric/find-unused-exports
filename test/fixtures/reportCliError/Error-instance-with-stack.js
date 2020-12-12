'use strict';

const reportCliError = require('../../../private/reportCliError');

reportCliError('CLI', new Error('Message.'));
