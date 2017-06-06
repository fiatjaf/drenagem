import { findDOMNode, render } from 'react-dom'
import { observer, observable } from './observations'
import { track, select } from './events'

export function debug () {
  var nodecache = new Map()

  report.render = function reportRender (component) {
    let node = findDOMNode(component)
    if (!node) return
    if (component.displayName === 'Box' ||
        component.displayName === 'DevTool') return

    let rect = node.getBoundingClientRect()
    let id = nodecache.get(node) || Math.random().toString()
    nodecache.set(node, id)
    track.any('box', {id, rect})
  }

  let devtoolnode = document.createElement('div')
  document.body.appendChild(devtoolnode)
  render(<DevTool />, devtoolnode)
}

let boxes$ = select.any('box')
  .fold((boxes, {id, rect}) => {
    var count = 0
    if (boxes.has(id)) {
      let box = boxes.get(id)
      count = box.count
    }
    count += 1
    boxes.set(id, {rect, count})
    return boxes
  }, observable())
  .debug('boxes updated')

let state = observable({
  lifeTime: 4000,
  boxes: boxes$
})

const Box = observer(function Box (node) {
  console.log('updating box', node)
  let {count, rect} = state.boxes.get(node)

  return (
    <div
      ref={el => setTimeout(() => { if (el) el.style.opacity = 0 }, state.lifeTime - 500)}
      style={{
        display: 'block',
        position: 'fixed',
        zIndex: '150',
        minWidth: '60px',
        outline: '3px solid',
        pointerEvents: 'none',
        transition: 'opacity 500ms ease-in',
        left: rect.left,
        top: rect.y,
        width: rect.width,
        height: rect.height
      }}
    >
      <span style={{
        float: 'right',
        pointerEvents: 'none',
        backgroundColor: 'purple',
        color: 'white'
      }}>
        {count}x
      </span>
    </div>
  )
})

const DevTool = observer(function DevTool () {
  return (
    <div id='dreno-devtools'>
      {state.boxes.forEach(([id]) =>
        <Box id={id} />
      )}
    </div>
  )
})

export var report = {}
