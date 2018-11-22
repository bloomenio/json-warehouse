require('dotenv').config();


module.exports = {
  scripts: {
    test: 'truffle test',
    console: 'truffle console',
    wclean: 'rd /s /q build',
    development: 'truffle migrate',
    alastria: 'truffle migrate --network  alastria',
    hd: 'truffle migrate --network  hd',
    ganache: 'ganache-cli -g 0 -l 10000000000000 --db ganache_db  -i 123456 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '" ',
    ganache_nodb: 'ganache-cli -g 0 -l 10000000000000 -i 123456 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '" ',
    nohupGanache: 'xnohup nps ganache',
    coffeeCli: 'node src/coffeeCli.js o',
    contractCli: 'node src/contractUtils.js',
    qr: 'node src/qrTest.js'
  }
};