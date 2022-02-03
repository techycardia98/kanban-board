<template lang="pug">
#addTask
  //- Overlay for images
  //- v-overlay(:value="showImage")
  //-   v-img(:src="selectedImage")
  v-dialog(v-model="value" @click:outside="closeOverlay" persistent max-width="600px")
    v-card.card.pa-5
      v-card-title Add Tasks:
      v-card-text
        v-form(@submit.prevent="submitForm" lazy-validation)
          v-row.d-flex.flex-column.text-left
            v-col(col="12")
              v-text-field(v-model="task.name" :rules="nameRules" :counter="30" label="Task Name:" required)
            v-col(col="12")
              v-text-field(v-model="task.description" :rules="descRules" :counter="200" label="Task Description:" required)
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
                    v-model="time"
                    label="Estimated Time:"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    :rules="[v => !!v || 'Time is required']"
                  )
                v-time-picker(
                  v-if="menu2"
                  format="ampm"
                  v-model="time"
                  full-width
                  @click:minute="$refs.menu.save(time)"
                )
              //- v-time-picker(format="ampm" landscape scrollable v-model="task.estimatedTime" label="Estimated Time:" required)
            v-col(col="12")
              v-combobox(v-model="task.tags" :rules="[v => !!v || 'Tags are required']" :items="allTags" label="Tags:" multiple chips required)
            v-col(col="12")
              v-select(v-model="task.status" :rules="[v => !!v || 'Status is required']" :items="allStatus" label="Task Status:" required)
            v-col.d-flex.flex-wrap(col="12" v-if="task.attachedFiles !== ''")
              v-img.relative.upload-image.mr-2.mb-4(v-for="(links, i) in url" :key="i" :src="links")
                v-btn(
                  class="mx-2 delete-btn"
                  fab
                  dark
                  small
                  color="pink"
                  @click="removeUpload(i)"
                )
                  v-icon(dark) mdi-close-outline
                //- v-btn(icon @click="removeUpload(i)")
                //-   v-icon.ml-1 mdi-close-outline
            //- write commit that adds new file into schema state
            v-col(col="12")
              v-file-input(v-model="task.attachedFiles" :disabled="task.attachedFiles.length > 4" label="Attachments:" accept="image/png, image/jpeg, image/bmp" @change="onFileChange(task.attachedFiles)" counter multiple show-size truncate-length="15")
          v-card-actions
            v-btn(type="submit" :disabled="task.name === '' || task.description === '' || task.time === '' || task.tags === '' || task.status === ''") Save Task

</template>
<script>
export default {
  name: "AddTaskTemplate",
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
    url: [],
    trueId: false,
    ranId: ''
  }),

  computed: {
    dataSchema () {
      return this.$store.state.schema.tasks
    },

    runningIDs () {
      return this.dataSchema.map((item) =>  {
        return item.id
      })
    }
  },

  methods: {
    removeUpload (index) {
      console.log(index)
      this.task.attachedFiles.splice(index, 1)
      this.url.splice(index, 1)
    },

    onFileChange(file) {
      this.url = []
      if (!file) {
        return;
      }
      // console.log(file)
      if (file.length > 1) {
        for (let i = 0; i < file.length; i++) {
          this.url.push(URL.createObjectURL(file[i]))
          this.task.url.push(URL.createObjectURL(file[i]))
          this.task.attachments++
        }
      } else {
        this.url.push(URL.createObjectURL(file[0]))
        this.task.url.push(URL.createObjectURL(file[0]))
        this.task.attachments = 1
      }
    },

    submitForm () {
      // add validation
      this.ranId = Math.ceil(Math.random() * (999999 - 100000 + 1) + 100000)

      while(!this.trueId) {
        if (this.runningIDs.indexOf(this.ranId) === -1) {
          this.trueId = true
          this.task.id = this.ranId
        } else {
          this.ranId = Math.ceil(Math.random() * (999999 - 100000 + 1) + 100000)
        }
      }

      this.$store.commit('addTask', this.task)
      this.ranId = ''
      this.trueId = false
      this.closeOverlay()
      // console.log(this.$store.state.schema)
    },

    closeOverlay () {
      this.$emit('input', false)
    }
  }
};
</script>
<style lang="sass" scoped>

#addTask
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