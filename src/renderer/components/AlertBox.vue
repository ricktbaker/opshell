<template>
  <div id="alertBox" class="form-inline w-100 row" v-if="showAlert === true">
    <div id="dismissAlert" v-on:click="close()">Dismiss</div>
      <div class="col-sm-12" style="display: flex; justify-content: space-around; ">
        <span v-if="typeAlert" id="msg">
          <i v-if="isError" class="fa fa-exclamation-circle error"></i>
          {{alertMessage}}
        </span>
        <div class="form-group" v-if="typeNewOrg">
          <input v-model="orgName" class="form-control input-sm col-xs-4" style="width: 250px" :placeholder="orgNamePlaceholder" />
          &nbsp; &nbsp;
          <button class="btn btn-success btn-sm" v-on:click="addOrg()">Add Org</button>
        </div>
        <div class="form-group" v-if="typeBastion">
        </div>
      </div>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron';
export default {
  name: 'alertBox',
  data: function() {
    return {
      showAlert: false,
      alertMessage: '',
      typeAlert: false,
      typeNewOrg: false,
      typeBastion: false,
      orgName: '',
      isError: false,
      orgNamePlaceholder: 'Enter Organization Name'
    };
  },
  mounted: function() {
    ipcRenderer.on('alertbox.show', (e, data) => {
      if (data.type === 'message') {
        if (data.error) {
          this.isError = true;
          this.typeAlert = true;
          this.alertMessage = data.msg;
          this.showAlert = true;
        }
      }
      if (data.type === 'newOrg') {
        this.showAlert = true;
        this.typeNewOrg = true;
      }
      if (data.type === 'tempMessage') {
        if (data.error) {
          this.isError = true;
        }
        this.tempMessage(data.msg);
      }
    });
  },
  methods: {

    /**
     * Close all and set everything to blank
     */
    close: function() {
      this.showAlert = false;
      this.alertMessage = '';
      this.typeAlert = false;
      this.typeNewOrg = false;
      this.orgName = '';
      this.typeBastion = false;
    },

    /**
     * Show a temporary message with a 3 second time
     */
    tempMessage: function(msg) {
      this.alertMessage = msg;
      this.typeAlert = true;
      this.showAlert = true;
      setTimeout(() => {
        this.close();
      }, 3000);
    },

    /**
     * Add a new organization
     */
    addOrg: async function() {
      const docs = await this.$db.orgs.cfind({ name: this.orgName }).exec();
      if (docs.length < 1) {
        let doc = {
          name: this.orgName,
          aws: [
          ]
        };
        const newDoc = await this.$db.orgs.insert(doc);
        ipcRenderer.send('orgmenu.updateSelectBox');
        const data = {};
        data.org = newDoc._id;
        data.type = 'orgSettings';
        ipcRenderer.send('mainview.openTab', data);
        this.typeNewOrg = false;
        this.orgName = '';
        this.tempMessage('Organization added');
      } else {
        this.typeNewOrg = false;
        this.alertMessage = 'Organization already exists!';
        this.typeAlert = true;
        this.orgName = '';
        setTimeout(() => {
          this.alertMessage = '';
          this.typeAlert = false;
          this.typeNewOrg = true;
        }, 3000);
      }
    }
  }
};
</script>

<style>
@import '../assets/css/alertbox.css'
</style>
