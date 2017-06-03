const React = require('react')
const ReactDOM = require('react-dom')
const {observer, observable, track, select} = require('dreno')

const state = observable({
  count: select('a.add-one')
    .events('click')
    .mapTo(1)
    .fold((acc, s) => acc + s, 0)
    .startWith(0)
})

const MainComponent = observer(class MainComponent extends React.Component {
  render () {
    return (
      <div>
        count: <strong>{state.count}</strong>
        <div>
          <a
            href={`#${state.count + 1}`}
            className='add-one'
            onClick={track}
          >click here to add 1</a>
        </div>
      </div>
    )
  }
})

ReactDOM.render(
  <MainComponent />,
  document.getElementById('root')
)
