//Vue components must appear before the Vue instance in which they will appear!

Vue.component('todo-item', {
  props: ['propname'], //props cannot have - in names, fucks it all up. Also, case insensitive. Annoying.
  template: '<li>{{ propname.text }}</li>'
})

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    vis: true,
    list: [
      { text: "First line" },
      { text: "Second line" }
    ],
    rMessage1: "I'm going to reverse the hell out of this sentence!",
    rMessage2: "I'm going to reverse the order of the words now!"
  },
  methods: {
    reverseMessage1() {
      this.rMessage1 = this.rMessage1.split('').reverse().join('')
    },
    reverseMessage2: function() {
      this.rMessage2 = this.rMessage2.split(' ').reverse().join(' ')
    }
  }
})
let app2 = new Vue({
  el: '#app2',
  data: {
    message: "Write something in the box!"
  }
})
let app7 = new Vue({
  el: '#app-7',
  data: {
    list: [
      {id: 0, text: "String1"},
      {id: 1, text: "String2"}
    ]
  }
})
