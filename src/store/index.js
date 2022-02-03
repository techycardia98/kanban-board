import Vue from 'vue'
import Vuex from 'vuex'
import DataModel from '../components/data.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    schema: DataModel,
    taskSelected: {},
    editTaskURL: []
  },
  mutations: {
    addTask (state, n) {
      state.schema.tasks.push(n)
    },

    updateTask (state, n) {
      const i = state.schema.tasks.indexOf(n.id)
      state.schema.tasks[i].status = n.status
    },

    removeTask (state, n) {
      state.schema.tasks = state.schema.tasks.filter(task => task.id !== n)
    },

    selectTaskEdit (state, n) {
      const a = state.schema.tasks.filter(task => task.id === n.id)[0]
      state.taskSelected = JSON.parse(JSON.stringify(a))
    },

    editTask (state, n) {
      const i = state.schema.tasks.map((task) => {
        return task.id
      })
      const iPos = i.indexOf(n.id)
      Object.assign(state.schema.tasks[iPos], n)
    },

    updateTaskEditURL (state, n) {
      state.schema.editTaskURL = n
    }
  },
  actions: {
  },
  modules: {
  }
})
