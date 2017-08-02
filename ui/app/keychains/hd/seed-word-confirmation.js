const inherits = require('util').inherits
const Component = require('react').Component
const connect = require('react-redux').connect
const h = require('react-hyperscript')
const actions = require('../../actions')

module.exports = connect(mapStateToProps)(SeedWordConfirmation)

inherits(SeedWordConfirmation, Component)

function SeedWordConfirmation () {
  Component.call(this)
}

function mapStateToProps (state) {
  return {
    seed: state.appState.currentView.seedWords,
    cacheSeed: state.metamask.seedWords,
  }
}

SeedWordConfirmation.prototype.render = function () {
  var seed = this.props.seed
  const scrambledSeed = this.scrambleSeedWords(seed)
  const array = scrambledSeed.map()

  return (
    h('.initialize-screen.flex-column.flex-center.flex-grow', [

      h('.flex-row.flex-center', [
        h('i.fa.fa-arrow-left.fa-lg.cursor-pointer', {
          onClick (event) {
            event.preventDefault()
            // state.dispatch(actions.revealSeedConfirmation())
          },
        }),
        h('h2.page-subtitle', 'Confirm Seed Phrase'),
      ]),

      h('textarea.twelve-word-phrase', {

      }),

      h('button.primary', {

      }),

      h('button.primary', {
        onClick: () => this.scrambleSeedWords(seed),
        style: {
          margin: '24px',
          fontSize: '0.9em',
        },
      }, 'Confirm'),
    ])
  )
}

SeedWordConfirmation.prototype.confirmSeedWords = function () {
  this.props.dispatch(actions.confirmSeedWords())
}

SeedWordConfirmation.prototype.scrambleSeedWords = function (seed) {
  var array = seed.split(' ')
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var tmp = array[i]
    array[i] = array[j]
    array[j] = tmp
  }
  console.log(array)
  return array
}
