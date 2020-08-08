import assert from 'assert'

let mapStateToProps

jest.mock('react-redux', () => ({
  connect: (ms) => {
    mapStateToProps = ms
    return () => ({})
  }
}));

jest.mock('../../../../../selectors', () => ({
  getSendErrors: (s) => `mockErrors:${s}`
}));

require('../send-row-error-message.container.js')

describe('send-row-error-message container', () => {

  describe('mapStateToProps()', () => {

    it('should map the correct properties to props', () => {
      assert.deepEqual(mapStateToProps('mockState', { errorType: 'someType' }), {
        errors: 'mockErrors:mockState',
        errorType: 'someType' })
    })

  })

})
