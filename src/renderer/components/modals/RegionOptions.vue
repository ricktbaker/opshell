<template>
  <div class="modal" id="regionOptions" tabindex="-1" role="dialog" aria-labelledby="regionOptionsLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header" id="regionOptionsHeader">
          <h5 class="modal-title">{{org.name}} {{ awsRegion.region }} Options</h5>
          <i class="fa fa-times-circle-o" arial-label="Close" v-on:click="closeRegionOptions()"></i>
          </a>
        </div>
        <div class="modal-body" id="regionOptionsBody">
          <div class="row">
            <div class="col-sm-4">
              <input type="checkbox" id="useBastion" v-model="useBastion">
              <label for="useBastion">Use Bastion Host</label>
            </div>
            <div class="col-sm-4" v-if="useBastion">
              <select class="form-control input-sm" v-model="bastionHost">
                <option value="">Select Bastion Host</option>
                <option v-if="instance.publicIp" v-for="instance in instances" :value="instance.instanceId" :key="instance.instanceId">{{ instance.name}} : {{ instance.publicIp }} </option>
              </select>
            </div>
            <div class="col-sm-4" v-if="useBastion">
              <select class="form-control input-sm" v-model="bastionUser">
                <option value="">Select SSH User</option>
                <option v-for="user in awsUsers" :value="user" :key="user">{{ user }}</option>
              </select>
            </div>
          </div>

          <div class="col-sm-12 text-center" style="margin-top: 10px;">
            <button type="button" class="btn btn-primary btn-sm" v-on:click="updateRegion">Submit</button>
            <button type="button" class="btn btn-sm" v-on:click="closeRegionOptions()" >Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  name: 'regionOptions',
  data: function() {
    return {
      org: {},
      awsRegion: {},
      useBastion: false,
      bastionHost: '',
      bastionUser: '',
      instances: [],
      tab: null,
      awsUsers: [
        'ec2-user',
        'ubuntu',
        'centos',
        'root'
      ]
    };
  },
  mounted: function() {
    ipcRenderer.on('regionSettings', async (e, data) => {
      this.tab = data.tab;
      this.org = await this.$db.orgs.cfindOne({ _id: data.org }).exec();
      this.awsRegion = await this.$db.awsRegions.cfindOne({_id: data.awsRegion}).exec();
      if (!this.awsRegion.useBastion) {
        this.awsRegion.useBastion = false;
      }
      this.bastionHost = this.awsRegion.bastionHost;
      this.bastionUser = this.awsRegion.bastionUser;
      this.useBastion = this.awsRegion.useBastion;
      this.instances = data.instances;
      $('#regionOptions').modal('show');
    });
  },
  methods: {
    updateRegion: async function() {
      this.awsRegion.useBastion = this.useBastion;
      this.awsRegion.bastionHost = this.bastionHost.instanceId;
      this.awsRegion.bastionUser = this.bastionUser;
      await this.$db.awsRegions.update({_id: this.awsRegion._id}, this.awsRegion);
      ipcRenderer.send('updateTabData', {tab: this.tab});
    },
    closeRegionOptions: function() {
      $('#regionOptions').modal('hide');
    }
  }
}
</script>

<style>
@import '../../assets/css/regionoptions.css'
</style>
