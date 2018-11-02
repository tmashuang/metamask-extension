import assert from 'assert'
import {
  shapeShiftTxListSelector,
  unapprovedMsgsSelector,
  selectedAddressTxListSelector,
  transactionsSelector,
  pendingTransactionsSelector,
  submittedPendingTransactionsSelector,
  completedTransactionsSelector,
} from '../../../../../ui/app/selectors/transactions'

describe('Transaction Selectors', () => {

  const tokens = [
    {
      address: '0xToken',
      decimals: 0,
      symbol: 'TOKEN',
    },
  ]

  const unapprovedMsgs = {
    1: {
      msg: 1,
    },
    2: {
      msg: 2,
    },
  }

  const selectedAddressTxList = [
    {
      time: 1,
      txParams: {
        to: '0xToken',
      },
      status: 'unapproved',
    },
    {
      time: 1,
      txParams: {
        to: '0xToken',
      },
      status: 'approved',
    },
    {
      time: 1,
      txParams: {
        to: '0xToken',
      },
      status: 'submitted',
    },
    {
      time: 1,
      txParams: {
        to: '0xToken',
      },
      status: 'completed',
    },
  ]

  const shapeShiftTxList = [
    {
      shapeshift: 1,
    },
    {
      shapeshift: 2,
    },
  ]

  const state = {
    metamask: {
      selectedTokenAddress: '0xToken',
      tokens,
      unapprovedMsgs,
      selectedAddressTxList,
      shapeShiftTxList,
    },
  }

  it('gets shapeshift tx list', () => {
    const getShapeShiftTxList = shapeShiftTxListSelector(state)
    assert.equal(getShapeShiftTxList, shapeShiftTxList)
  })

  it('gets unapproved messages list', () => {
    const getUnapprovedMsgs = unapprovedMsgsSelector(state)
    assert.equal(getUnapprovedMsgs, unapprovedMsgs)
  })

  it('gets selected address tx list', () => {
    const getTxList = selectedAddressTxListSelector(state)
    assert.equal(getTxList, selectedAddressTxList)
  })

  it('gets all transactions', () => {
    const transactions = transactionsSelector(state)
    assert.equal(transactions.length, 4)
  })

  it('gets transactions that arent completed', () => {
    const transactions = pendingTransactionsSelector(state)
    assert.equal(transactions.length, 3)
  })

  it('gets submitted transaction', () => {
    const submittedTxs = submittedPendingTransactionsSelector(state)
    assert.equal(submittedTxs.length, 1)
    assert.equal(submittedTxs[0].status, 'submitted')
  })

  it('gets txs that are not unapproved, approved, or submitted', () => {
    const completedTx = completedTransactionsSelector(state)
    assert.equal(completedTx.length, 1)
    assert.equal(completedTx[0].status, 'completed')
  })
})
