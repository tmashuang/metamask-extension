const test = require('../../app/scripts/lib/buy-eth-url')
const assert = require('assert')

describe('handles buy eth urls for all networks', function () {
  let network
  describe('Mainnet buy ether with coinbase', function () {
    let mainnet, address, amount
    beforeEach(function () {
      network = '1'
      address = '0x1678a085c290ebd122dc42cba69373b5953b831d'
      amount = '3'
      mainnet = test({network, amount, address})
    })

    it('should return coinbase url', function () {
      const coinbaseRegex = /https:\/\/buy.coinbase.com/
      assert.equal(coinbaseRegex.exec(mainnet)[0], 'https://buy.coinbase.com')
    })

    it('should set the address for coinbase url', function () {
      var addressRegex = /0x(.*?)(?=&)/
      assert.equal(addressRegex.exec(mainnet)[0], address)
    })

    it('should set the amount for coinbase url', function () {
      const amountRegex = /amount(=)(\d+)/
      assert.equal(amountRegex.exec(mainnet)[2], amount)
    })

    it('should link to the final url', function () {
      assert.equal(mainnet, 'https://buy.coinbase.com/?code=9ec56d01-7e81-5017-930c-513daa27bb6a&amount=3&address=0x1678a085c290ebd122dc42cba69373b5953b831d&crypto_currency=ETH')
    })
  })

  describe('Ropsten buy ether with Metamask faucet', function () {
    let ropsten
    beforeEach(function () {
      network = '3'
      ropsten = test({network})
    })

    it('should return Metamask faucet', function () {
      assert.equal(ropsten, 'https://faucet.metamask.io/')
    })

    describe('Kovan buy ether links to steps on github', function () {
      let kovan
      beforeEach(function () {
        network = '42'
        kovan = test({network})
      })
      it('should return github link for steps for kovan eth', function () {
        assert.equal(kovan, 'https://github.com/kovan-testnet/faucet')
      })
    })

    describe('Rinkeby should return Rinkeby faucet', function () {
      let rinkeby
      beforeEach(function () {
        network = '4'
        rinkeby = test({network})
      })
      
      it('should return rinkeby site with faucet', function () {
        assert.equal(rinkeby, 'https://www.rinkeby.io/')
      })
    })
  })
})
