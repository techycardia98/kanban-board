<template lang="pug">
  #board
    TaskDetails(v-model="showEdit" v-if="showEdit")
    v-overlay(:value="showAttach" :dark="false")
      v-card.pa-10.text-left
        v-card-title.pa-0.mb-2 Attachments:
        v-card-text.pa-0
          v-col.d-flex.flex-wrap.justify-center.text-center.pa-0(cols="12")
            v-img.overlay-img.mr-5.mb-5(v-for="(item, i) in imgUrl" :key="i" :src="item")
        v-card-actions.pa-0
          v-btn(@click="closeImgOverlay" outlined color="blue") Close Overlay
    v-container.mt-10(fluid style="max-width: 1600px")
      v-row.d-flex.flex-row.justify-center.text-center
        v-col.ma-2#pending(col="3" style="max-width: 1200px;")
          v-card.pa-5.relative
            h3 Task Status: {{ task.status.toUpperCase() }}
            v-card.mt-2.mb-5(:id="task.id")
              v-card.d-flex.flex-row.justify-space-between.pl-5.pr-5.pt-3.pb-3.align-center(:color="detColour" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;")
                h3.text-left {{ task.name }}
                .button-container
                  v-btn(icon @click="upgrade(task)")
                    v-icon.ml-1 mdi-file-move-outline
                  v-btn(icon @click="edit(task)")
                    v-icon.ml-1 mdi-pencil-outline
                  v-btn(icon @click="remove(task)")
                    v-icon.ml-1 mdi-trash-can-outline
              v-card.text-left.pa-5(style="border-top-left-radius: 0; border-top-right-radius: 0;")
                p.xs.mb-1 Task:
                p {{ task.name }}
                p.mb-1 Description:
                p {{ task.description }}
                p.mb-1(v-if="task.comment") Comment:
                p(v-if="task.comment") {{ task.comment }}
                p.mb-1 Estimated Time:
                p {{ task.estimatedTime }}
                p.mb-0 Tags:
                v-combobox.pa-0.mb-3(
                  v-model="task.tags"
                  multiple
                  chips
                  flat
                  append-icon=""
                  readonly
                  dense
                  hide-details
                  solo)
                p(v-if="task.attachments") Attachments:
                p(v-if="task.attachments") {{ task.attachments }}
                v-btn.mr-5(v-if="task.attachments" @click="showAttachments(task)" outlined color="blue") View Attachments
                v-btn(to="/" outlined color="blue") Back

</template>
<script>
import TaskDetails from '@/components/TaskDetails.vue'

export default {
  name: "Task",
  components: {
    TaskDetails
  },
  data: () => ({
    tasks: {
      pending: [],
      processing: [],
      completed: []
    },
    task: {},
    selectedItem: '',
    endLocation: '',
    searchInput: '',
    showAdd: false,
    showEdit: false,
    matched: [],
    showRange: false,
    startTime: '',
    endTime: '',
    hiddenItems: [],
    showAttach: false,
    imgUrl: []
  }),

  computed: {
    getSelectedTask () {
      return this.$store.state.taskSelected
    },

    detColour () {
      if (this.getSelectedTask.status === 'pending') {
        return 'red lighten-5'
      } else if (this.getSelectedTask.status === 'processing') {
        return 'orange lighten-5'
      } else {
        return 'green lighten-5'
      }
    }
  },

  mounted () {
    this.pageID = this.$route.params.id
    this.task = this.getSelectedTask
  },

  methods: {
    closeImgOverlay () {
      this.showAttach = false
      this.imgUrl = []
    },

    showAttachments (data) {
      this.imgUrl = data.url
      this.showAttach = true
    },

    removeHighlight () {
      for (let a = 0; a < this.matched.length; a++) {
        document.getElementById(this.matched[a].id).classList.remove("elevation-10")
      }
    },

    searchSchema () {
      for (let a = 0; a < this.matched.length; a++) {
        document.getElementById(this.matched[a].id).classList.remove("elevation-10")
      }
      if (this.getInput.length > 3) {
        this.matched = []
        for (let i = 0; i < this.dataSchema.tasks.length; i++) {
          if (this.dataSchema.tasks[i].name.search(this.searchInput) !== -1) {
            let duplicate = false
            for (let j = 0; j < this.matched.length; j++) {
              if (this.matched[j].id === this.dataSchema.tasks[i].id) {
                duplicate = true
              }
            }

            if (!duplicate) {
              this.matched.push(this.dataSchema.tasks[i])
            }
          }

          if (this.dataSchema.tasks[i].description.search(this.searchInput) !== -1) {
            let duplicate = false
            for (let j = 0; j < this.matched.length; j++) {
              if (this.matched[j].id === this.dataSchema.tasks[i].id) {
                duplicate = true
              }
            }

            if (!duplicate) {
              this.matched.push(this.dataSchema.tasks[i])
            }
          }

          if (this.dataSchema.tasks[i].tags.includes(this.searchInput)) {
            let duplicate = false
            for (let j = 0; j < this.matched.length; j++) {
              if (this.matched[j].id === this.dataSchema.tasks[i].id) {
                duplicate = true
              }
            }

            if (!duplicate) {
              this.matched.push(this.dataSchema.tasks[i])
            }
          }
        }

        for (let a = 0; a < this.matched.length; a++) {
          document.getElementById(this.matched[a].id).classList.add("elevation-10")
        }

        // add scroll to found item behaviour
        // document.getElementById(this.matched[0].id).scrollIntoView({ behavior: 'smooth' })
        // const yOffset = -140
        // const y = document.getElementById(this.matched[0].id).getBoundingClientRect().top + window.pageYOffset + yOffset
        // window.scrollTo({ top: y, behavior: 'smooth' })
      }
    },

    showTime () {
      this.showRange = !this.showRange
    },

    resetRange () {
      this.startTime = ''
      this.endTime = ''
      for (let i = 0; i < this.hiddenItems.length; i++) {
        document.getElementById(this.hiddenItems[i]).style.display = 'block'
      }
    },

    filterTime () {
      const newObj = Object.create(this.dataSchema)
      this.hiddenItems = []
      if (this.startTime !== '' && this.endTime !== '') {
        let foundObj = newObj.tasks.filter(task => task.estimatedTime >= this.startTime && task.estimatedTime <= this.endTime)
        const newMap = foundObj.map((obj) => {
          return obj.id
        })

        const noShow = newObj.tasks.filter(task => !newMap.includes(task.id))
        const hideMap = noShow.map((obj) => {
          return obj.id
        })

        for (let i = 0; i < hideMap.length; i++) {
          document.getElementById(hideMap[i]).style.display = 'none'
          this.hiddenItems.push(hideMap[i])
        }

        for (let i = 0; i < newMap.length; i++) {
          document.getElementById(newMap[i]).style.display = 'block'
        }
      } else if (this.startTime !== '' && this.endTime === '') {
        let foundObj = newObj.tasks.filter(task => task.estimatedTime >= this.startTime)
        const newMap = foundObj.map((obj) => {
          return obj.id
        })

        const noShow = newObj.tasks.filter(task => !newMap.includes(task.id))
        const hideMap = noShow.map((obj) => {
          return obj.id
        })

        for (let i = 0; i < hideMap.length; i++) {
          document.getElementById(hideMap[i]).style.display = 'none'
          this.hiddenItems.push(hideMap[i])
        }

        for (let i = 0; i < newMap.length; i++) {
          document.getElementById(newMap[i]).style.display = 'block'
        }
      } else if (this.startTime === '' && this.endTime !== '') {
        let foundObj = newObj.tasks.filter(task => task.estimatedTime >= this.startTime)
        const newMap = foundObj.map((obj) => {
          return obj.id
        })

        const noShow = newObj.tasks.filter(task => !newMap.includes(task.id))
        const hideMap = noShow.map((obj) => {
          return obj.id
        })

        for (let i = 0; i < hideMap.length; i++) {
          document.getElementById(hideMap[i]).style.display = 'none'
          this.hiddenItems.push(hideMap[i])
        }

        for (let i = 0; i < newMap.length; i++) {
          document.getElementById(newMap[i]).style.display = 'block'
        }
      }
    },

    increaseProgress () {
      this.tasks.completed ++
    },

    allowDrop (ev) {
      ev.preventDefault();
    },

    drag (ev) {
      const parentId = ev.target.parentNode.parentNode.id

      if (parentId === 'pending') {
        this.selectedItem = this.penTasks[[...ev.target.parentNode.children].indexOf(ev.target) - 1]
      } else if (parentId === 'processing') {
        this.selectedItem = this.proTasks[[...ev.target.parentNode.children].indexOf(ev.target) - 1]
      } else if (parentId === 'completed') {
        this.selectedItem = this.comTasks[[...ev.target.parentNode.children].indexOf(ev.target) - 1]
      }
    },

    dragIn (ev) {
      // const parentId = ev.target.parentNode.parentNode.id
      const parentId = ev.target.id
      if (parentId === 'pending' || parentId === 'processing' || parentId === 'completed') {
        this.endLocation = parentId
      }
    },

    dragCancel (ev) {
      ev.preventDefault();
      this.dragging1 = false
      this.dragging2 = false
      this.dragging3 = false
      this.selectedItem = ''
    },

    drop (ev) {
      ev.preventDefault();
      this.dragging1 = false
      this.dragging2 = false
      this.dragging3 = false

      const pArr = this.selectedItem.status

      if (this.endLocation === 'pending') {
        if (pArr === 'processing') {
          this.selectedItem.status = 'pending'
          this.$store.commit('updateTask', this.selectedItem)
        } else if (pArr === 'completed') {
          this.selectedItem.status = 'pending'
          this.$store.commit('updateTask', this.selectedItem)
        }
      }

      if (this.endLocation === 'processing') {
        if (pArr === 'pending') {
          this.selectedItem.status = 'processing'
          this.$store.commit('updateTask', this.selectedItem)
        } else if (pArr === 'completed') {
          this.selectedItem.status = 'processing'
          this.$store.commit('updateTask', this.selectedItem)
        }
      }

      if (this.endLocation === 'completed') {
        if (pArr === 'pending') {
          this.selectedItem.status = 'completed'
          this.$store.commit('updateTask', this.selectedItem)
        } else if (pArr === 'processing') {
          this.selectedItem.status = 'completed'
          this.$store.commit('updateTask', this.selectedItem)
        }
      }

      this.selectedItem = ''
      this.endLocation = ''
    },

    upgrade (data) {
      if (data.status === 'pending') {
        data.status = 'processing'
        this.$store.commit('updateTask', data)
      } else if (data.status === 'processing') {
        data.status = 'completed'
        this.$store.commit('updateTask', data)
      } else if (data.status === 'completed') {
        data.status = 'pending'
        this.$store.commit('updateTask', data)
      }
    },

    remove (data) {
      this.$store.commit('removeTask', data.id)
      this.$router.push('/')
    },

    edit () {
      // const urls = []
      // if (data.url.length !== 0) {
      //   if (data.attachedFiles.length > 1) {
      //     for (let i = 0; i < data.attachedFiles.length; i++) {
      //       urls.push(URL.createObjectURL(data.attachedFiles[i]))
      //     }
      //   } else {
      //     urls.push(URL.createObjectURL(data.attachedFiles[0]))
      //   }
      //   this.$store.commit('updateTaskEditURL', urls)
      // }
      this.showEdit = true
    }
  }
};
</script>
<style lang="sass" scoped>

.filter-datepicker
  position: absolute
  top: 40px
  right: 0
  z-index: 10
  background-color: white
  border: 1px solid grey
  padding: 10px
  border-radius: 5px

.relative
  position: relative

.drop-zone
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  opacity: 0.1
  background-color: grey
  display: none
  z-index: 2
  pointer-events: none
  visibility: hidden

.overlay-img
  max-width: 500px
</style>