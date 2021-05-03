import reportCliError from '../../../private/reportCliError.mjs';

const error = new Error('Message.');
delete error.stack;
reportCliError('CLI', error);
