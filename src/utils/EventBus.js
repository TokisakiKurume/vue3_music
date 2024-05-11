// EventBus.js

import Mitt from 'mitt'

const EventBus = new Mitt()

EventBus.$on = EventBus.on
EventBus.$off = EventBus.off
EventBus.$emit = EventBus.emit

export default EventBus
