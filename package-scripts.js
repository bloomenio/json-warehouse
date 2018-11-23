require('dotenv').config();

module.exports = {
  scripts: {
    test: 'truffle test',
    console: 'truffle console',
    wclean: 'rd /s /q build',
    development: 'truffle migrate',
    ganache: 'ganache-cli -g 0 -l 100000000 --db ganache_db  -i 123456 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '" ',
    ganache_nodb: 'ganache-cli -g 0 -l 100000000 -i 123456 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '" '
  }
};