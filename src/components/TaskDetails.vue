<template lang="pug">
#editTask
  v-dialog(v-model="value" @click:outside="closeOverlay" persistent max-width="600px")
    v-card.card.pa-5
      v-card-title Edit Tasks:
      v-card-text
        v-form(@submit.prevent="submitForm" lazy-validation)
          v-row.d-flex.flex-column.text-left
            v-col(col="12")
              v-text-field(v-model="getSelectedTask.name" :rules="nameRules" :counter="30" label="Task Name:" required)
            v-col(col="12")
              v-text-field(v-model="getSelectedTask.description" :rules="descRules" :counter="200" label="Task Description:" required)
            v-col(col="12")
              v-menu(
                ref="menu"
                v-model="menu2"
                :close-on-content-click="false"
                :return-value.sync="time"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              )
                template(v-slot:activator="{ on, attrs }")
                  v-text-field(
                    v-model="getSelectedTask.estimatedTime"
                    label="Estimated Time:"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  )
                v-time-picker(
                  v-if="menu2"
                  format="ampm"
                  v-model="getSelectedTask.estimatedTime"
                  full-width
                  @click:minute="$refs.menu.save(time)"
                )
              //- v-time-picker(format="ampm" landscape scrollable v-model="getSelectedTask.estimatedTime" label="Estimated Time:" required)
            v-col(col="12")
              v-combobox(v-model="getSelectedTask.tags" :rules="[v => !!v || 'Tags are required']" :items="allTags" label="Tags:" multiple chips required)
            v-col(col="12")
              v-select(v-model="getSelectedTask.status" :rules="[v => !!v || 'Status is required']" :items="allStatus" label="Task Status:" required)
            v-col.d-flex.flex-wrap(col="12")
              v-img.relative.upload-image.mr-2.mb-4(v-for="(links, i) in getImgURLS" :key="i" :src="links")
                v-btn(
                  class="mx-2 delete-btn"
                  fab
                  dark
                  small
                  color="pink"
                  @click="removeUpload(i)"
                )
                  v-icon(dark) mdi-close-outline
            v-col(col="12")
              v-file-input(v-model="getSelectedTask.attachedFiles" label="Attachments:" accept="image/png, image/jpeg, image/bmp" @change="onFileChange(getSelectedTask.attachedFiles)" counter multiple show-size truncate-length="15")
            v-col(col="12")
              v-textarea(
                v-model="getSelectedTask.comment"
                label="Additional Comment:"
                clearable
                counter
                outlined
              )
          v-card-actions
            v-btn(type="submit" :disabled="getSelectedTask.name === '' || getSelectedTask.description === '' || getSelectedTask.time === '' || getSelectedTask.tags === '' || getSelectedTask.status === ''" outlined) Edit Task
            v-btn(type="button" outlined @click="deleteTask(getSelectedTask.id)") Delete Task

</template>
<script>
export default {
  name: "TaskDetails",
  props: ['value'],
  data: () => ({
    task: {
      id: 0,
      name: '',
      description: '',
      estimatedTime: '',
      attachments: 0,
      attachedFiles: [],
      tags: '',
      status: '',
      url: []
    },
    allTags: ['Urgent', 'On Hold', 'Pending Feedback'],
    allStatus: ['pending', 'processing', 'completed'],
    valid: true,
    nameRules: [
        v => !!v || 'Task Name is required',
        v => (v && v.length <= 30) || 'Task Name must be less than 30 characters',
      ],
    descRules: [
        v => !!v || 'Task Description is required',
        v => (v && v.length <= 200) || 'Task Name must be less than 30 characters',
      ],
    time: null,
    menu2: false,
    url: []
  }),

  computed: {
    getSelectedTask () {
      return this.$store.state.taskSelected
    },

    getImgURLS () {
      return this.$store.state.taskSelected.url
    }
  },

  methods: {
    async removeUpload (index) {
      this.getSelectedTask.attachedFiles.splice(index, 1)
      this.getSelectedTask.url.splice(index, 1)
      if (this.getSelectedTask.attachments >= 1) {
        this.getSelectedTask.attachments--
      }
    },

    onFileChange(file) {
      if (!file) {
        return
      }
      this.getSelectedTask.url = []
      if (file.length > 1) {
        for (let i = 0; i < file.length; i++) {
          this.getSelectedTask.url.push(URL.createObjectURL(file[i]))
          this.getSelectedTask.attachments++
          console.log(this.getSelectedTask.url)
        }
      } else {
        this.getSelectedTask.url.push(URL.createObjectURL(file[0]))
        this.getSelectedTask.attachments = 1
      }
    },

    submitForm () {
      // add validation
      this.$store.commit('editTask', this.getSelectedTask)
      this.closeOverlay()
    },

    deleteTask (task) {
      // add validation
      this.$store.commit('removeTask', task)
      this.closeOverlay()
    },

    closeOverlay () {
      this.$emit('input', false)
    }
  }
};
</script>
<style lang="sass" scoped>

#editTask
  .card
    width: 700px

.upload-image
  max-width: 200px
  width: 100%
  overflow: visible
  .delete-btn
    position: absolute
    top: -10px
    right: -15px
    width: 30px
    height: 30px

</style>