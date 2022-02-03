<template lang="pug">
  #board
    AddTask(v-model="showAdd" v-if="showAdd")
    TaskDetails(v-model="showEdit" v-if="showEdit")
    v-overlay(:value="showAttach" :dark="false")
      v-card.pa-10.text-left
        v-card-title.pa-0.mb-2 Attachments:
        v-card-text.pa-0
          v-col.d-flex.flex-wrap.justify-center.text-center.pa-0(cols="12")
            v-img.overlay-img.mr-5.mb-5(v-for="(item, i) in imgUrl" :key="i" :src="item")
        v-card-actions.pa-0
          v-btn(@click="closeImgOverlay" outlined color="blue") Close Overlay
    v-container(fluid style="max-width: 1600px")
      v-row
        v-col(cols="12" color="white")
          h3.mb-3.text-center Progress
          v-progress-linear(:value="completedTasks" height="30" color="green")
            p.ma-0 {{ completedTasks }}% (Done {{ comTasks.length }} out of {{ totalTasks }})

      v-row
        v-col.d-flex.justify-end.text-right(cols="12")
          v-col.pa-0.d-flex.align-center(cols="3")
            v-text-field.pa-0(
              v-model="searchInput"
              @keyup="searchSchema"
              placeholder="Search"
              hide-details
              label="Search"
              outlined
              clearable
              dense
              color="blue"
              @click:clear="removeHighlight"
              )
          v-btn(outlined height="40" color="blue darken-1" @click="showAdd = true").ml-2
            v-icon.mr-1(before) mdi-plus
            | ADD TASK
          v-col(col="1").d-flex.pa-0.flex-grow-0.relative
            v-btn(
              outlined
              height="40"
              color="blue darken-1"
              @click="showTime"
              ).ml-2
              v-icon.mr-1(before) mdi-filter-outline
              | Filter
            .filter-datepicker(v-if="showRange")
              v-col.d-flex.flex-column.pt-0.pl-0.pr-0
                v-col.pa-0(cols="1")
                  v-btn(@click="resetRange" outlined color="blue") Clear Range
                v-col.d-flex.flex-row.pt-0.pl-0.pr-0
                  v-col.text-left.pt-0.pl-0(style="width: 315px; flex: 0 1 auto;")
                    h2 Start:
                    v-time-picker(
                      v-model="startTime"
                      :max="endTime"
                      full-width
                      @click:minute="filterTime"
                    )
                  v-col.text-left.pt-0.pr-0(style="width: 315px; flex: 0 1 auto;")
                    h2 End:
                    v-time-picker(
                      v-model="endTime"
                      :min="startTime"
                      full-width
                      @click:minute="filterTime"
                    )

      v-row.d-flex.flex-row.justify-space-between.text-center

        v-col.ma-2#pending(col="3" @drop="drop" @dragenter.prevent="dragIn" @dragover.prevent)
          v-card.pa-5.relative
            h3 Pending ({{ penTasks.length }}/{{ totalTasks }}) {{ pendingTasks }}%
            //- .drop-zone(:class="{ appear: dragging1 }" @drop="drop" @dragenter="dragIn" @dragover.prevent)
            //- create for loop here to check for all tasks created in JSON model
            v-card.mt-2.mb-5(v-for="(data, i) in penTasks" :key="i" :id="data.id" draggable="true" @dragstart="drag" @dragend="dragCancel")
              v-card.d-flex.flex-row.justify-space-between.pl-5.pr-5.pt-3.pb-3.align-center(color="red lighten-5" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;")
                h3.text-left {{ data.name }}
                .button-container
                  v-btn(icon @click="upgrade(data)")
                    v-icon.ml-1 mdi-file-move-outline
                  v-btn(icon @click="edit(data)")
                    v-icon.ml-1 mdi-pencil-outline
                  v-btn(icon @click="remove(data)")
                    v-icon.ml-1 mdi-trash-can-outline
              v-card.text-left.pa-5(style="border-top-left-radius: 0; border-top-right-radius: 0;")
                p.xs.mb-1 Task:
                p {{ data.name }}
                p.mb-1 Description:
                p {{ data.description }}
                p.mb-1(v-if="data.comment") Comment:
                p(v-if="data.comment") {{ data.comment }}
                p.mb-1 Estimated Time:
                p {{ data.estimatedTime }}
                p.mb-0 Tags:
                v-combobox.pa-0.mb-3(
                  v-model="data.tags"
                  multiple
                  chips
                  flat
                  append-icon=""
                  readonly
                  dense
                  hide-details
                  solo)
                p(v-if="data.attachments") Attachments:
                p(v-if="data.attachments") {{ data.attachments }}
                v-btn.mr-5(v-if="data.attachments" @click="showAttachments(data)" outlined color="blue") View Attachments
                v-btn(@click="move(data)" outlined color="blue") View Task

        v-col.ma-2#processing(col="3" @drop="drop" @dragenter.prevent="dragIn" @dragover.prevent)
          v-card.pa-5.relative
            h3 Processing ({{ proTasks.length }}/{{ totalTasks }}) {{ processingTasks }}%
            //- .drop-zone(:class="{ appear: dragging2 }" @drop="drop" @dragenter="dragIn" @dragover.prevent)
            //- create for loop here to check for all tasks created in JSON model
            v-card.mt-2.mb-5(v-for="(data, i) in proTasks" :key="i" :id="data.id" draggable="true" @dragstart="drag" @dragend="dragCancel")
              v-card.d-flex.flex-row.justify-space-between.pl-5.pr-5.pt-3.pb-3.align-center(color="orange lighten-5" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;")
                h3.text-left {{ data.name }}
                .button-container
                  v-btn(icon @click="upgrade(data)")
                    v-icon.ml-1 mdi-file-move-outline
                  v-btn(icon @click="edit(data)")
                    v-icon.ml-1 mdi-pencil-outline
                  v-btn(icon @click="remove(data)")
                    v-icon.ml-1 mdi-trash-can-outline
              v-card.text-left.pa-5(style="border-top-left-radius: 0; border-top-right-radius: 0;")
                p.xs.mb-1 Task:
                p {{ data.name }}
                p.mb-1 Description:
                p {{ data.description }}
                p.mb-1(v-if="data.comment") Comment:
                p(v-if="data.comment") {{ data.comment }}
                p.mb-1 Estimated Time:
                p {{ data.estimatedTime }}
                p.mb-0 Tags:
                v-combobox.pa-0.mb-3(
                  v-model="data.tags"
                  multiple
                  chips
                  flat
                  append-icon=""
                  readonly
                  dense
                  hide-details
                  solo)
                p(v-if="data.attachments") Attachments:
                p(v-if="data.attachments") {{ data.attachments }}
                v-btn(v-if="data.attachments" @click="showAttachments(data)" outlined color="blue" elevation-10) View Attachments
                v-btn(@click="move(data)" outlined color="blue") View Task

        v-col.ma-2#completed(col="3" @drop="drop" @dragenter.prevent="dragIn" @dragover.prevent)
          v-card.pa-5.relative
            h3 Completed ({{ comTasks.length }}/{{ totalTasks }}) {{ completedTasks }}%
            v-card.mt-2.mb-5(v-for="(data, i) in comTasks" :key="i" :id="data.id" draggable="true" @dragstart="drag" @dragend="dragCancel")
              v-card.d-flex.flex-row.justify-space-between.pl-5.pr-5.pt-3.pb-3.align-center(color="green lighten-5" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;")
                h3.text-left {{ data.name }}
                .button-container
                  v-btn(icon @click="upgrade(data)")
                    v-icon.ml-1 mdi-file-move-outline
                  v-btn(icon @click="edit(data)")
                    v-icon.ml-1 mdi-pencil-outline
                  v-btn(icon @click="remove(data)")
                    v-icon.ml-1 mdi-trash-can-outline
              v-card.text-left.pa-5(style="border-top-left-radius: 0; border-top-right-radius: 0;")
                p.xs.mb-1 Task:
                p {{ data.name }}
                p.mb-1 Description:
                p {{ data.description }}
                p.mb-1(v-if="data.comment") Comment:
                p(v-if="data.comment") {{ data.comment }}
                p.mb-1 Estimated Time:
                p {{ data.estimatedTime }}
                p.mb-0 Tags:
                v-combobox.pa-0.mb-3(
                  v-model="data.tags"
                  multiple
                  chips
                  flat
                  append-icon=""
                  readonly
                  dense
                  hide-details
                  solo)
                p(v-if="data.attachments") Attachments:
                p(v-if="data.attachments") {{ data.attachments }}
                v-btn(v-if="data.attachments" @click="showAttachments(data)" outlined color="blue") View Attachments
                v-btn(@click="move(data)" outlined color="blue") View Task

</template>
<script>
import DataModel from "../components/data.json";
import AddTask from '@/components/AddTaskTemplate.vue'
import TaskDetails from '@/components/TaskDetails.vue'

export default {
  name: "Board",
  components: {
    AddTask,
    TaskDetails
  },
  data: () => ({
    tasks: {
      pending: [],
      processing: [],
      completed: []
    },
    myJson: DataModel,
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
    dataSchema () {
      return this.$store.state.schema
    },

    totalTasks () {
      return this.dataSchema.tasks.length
    },

    pendingTasks () {
      return Math.ceil(this.penTasks.length / this.totalTasks * 100)
    },

    processingTasks () {
      return Math.ceil(this.proTasks.length / this.totalTasks * 100)
    },

    completedTasks () {
      return Math.ceil(this.comTasks.length / this.totalTasks * 100)
    },

    status () {
      return this.comTasks === this.totalTasks ? "Done" : "Pending"
    },

    penTasks () {
      return this.dataSchema.tasks.filter(task => task.status === 'pending')
    },

    proTasks () {
      return this.dataSchema.tasks.filter(task => task.status === 'processing')
    },

    comTasks () {
      return this.dataSchema.tasks.filter(task => task.status === 'completed')
    },

    getInput () {
      return this.searchInput
    }
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
    },

    edit (data) {
      const urls = []
      if (data.url.length !== 0) {
        if (data.attachedFiles.length > 1) {
          for (let i = 0; i < data.attachedFiles.length; i++) {
            urls.push(URL.createObjectURL(data.attachedFiles[i]))
          }
        } else {
          urls.push(URL.createObjectURL(data.attachedFiles[0]))
        }
        this.$store.commit('updateTaskEditURL', urls)
      }
      this.$store.commit('selectTaskEdit', data)
      this.showEdit = true
    },

    move (data) {
      this.$store.commit('selectTaskEdit', data)
      this.$router.push(`/task/${data.id}`)
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