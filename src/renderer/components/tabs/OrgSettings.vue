<template>
  <div id="orgSettings">
    <div class="form-group row">
      <div class="col-sm-4 toggle" v-on:click="toggleAwsRegions()">
        <i class="fa" v-bind:class="{ 'fa-caret-right': !awsRegionsExpanded, 'fa-caret-down': awsRegionsExpanded }"></i>
        AWS REGIONS ({{awsRegions.length ? awsRegions.length: 0}})
      </div>
      <div class="col-sm-8 text-right">
        <select v-if="newRegion" id="awsRegionId" class="newregion-select form-control" name="awsRegion" v-model="newRegionCode">
          <option value="" selected>Select New Region</option>
          <option v-if="regionAvailable(awsRegion.code)" v-for="awsRegion in awsRegionCodes" :value="awsRegion.code" :key="awsRegion.code">{{ awsRegion.code }} : {{ awsRegion.name }}</option>
        </select>
        <button class="btn btn-sm" v-bind:class="{'btn-default':!newRegion,'btn-success':newRegion}" v-on:click="addRegion()">
          <i class="fa fa-plus"></i> Add Region
        </button>
        <button v-if="newRegion" class="btn btn-sm btn-info" v-on:click="newRegion = false">
          <i class="fa fa-close"></i> Cancel
        </button>
      </div>
    </div>

    <div class="region regionBordered" :id="'region-' + awsRegion.region" v-for="awsRegion in awsRegions" v-bind:key="awsRegion.region" v-if="awsRegionsExpanded">
      {{awsRegion.region}}
      <span style="float: right">
        <button class="btn btn-sm" v-bind:class="{'btn-default':!regionConfig[awsRegion.region],'btn-info':regionConfig[awsRegion.region]}" v-on:click="editRegion(awsRegion,'config')">
          <i class="fa fa-edit"></i> Config
        </button>
        <button class="btn btn-sm" v-bind:class="{'btn-default':!regionKeys[awsRegion.region],'btn-info':regionKeys[awsRegion.region]}" v-on:click="editRegion(awsRegion, 'keys')">
          <i class="fa fa-key"></i> Keys
        </button>
        <button class="btn btn-sm" v-bind:class="{'btn-default':!regionUsers[awsRegion.region],'btn-info':regionUsers[awsRegion.region]}" v-on:click="editRegion(awsRegion, 'users')">
          <i class="fa fa-user-circle"></i> Users
        </button>
        <button class="btn btn-sm" v-bind:class="{'btn-default':!regionSettings[awsRegion.region],'btn-info':regionSettings[awsRegion.region]}" v-on:click="editRegion(awsRegion, 'settings')">
          <i class="fa fa-cog"></i> Settings
        </button>
      </span>

      <div class="regionConfig" v-if="regionConfig[awsRegion.region]">
        <form>
          <div class="form-group">
            <label for="accessKey" class="col-sm col-form-label">
              AWS Access Key Id
              <i class="fa fa-question-circle-o" title="This access key must have the ec2:describeInstances permission"></i>
            </label>
            <div class="col-sm-12">
              <input type="text" class="form-control input-sm" v-model="awsRegion.accessKey" placeholder="Access Key Id">
            </div>
            <label for="accessKey" class="col-sm col-form-label">
              AWS Secret Key
            </label>
            <div class="col-sm-12">
              <input type="text" class="form-control input-sm" v-model="awsRegion.secretKey" placeholder="Access Key Id">
            </div>
            <label for="accessKey" class="col-sm col-form-label">
              Default SSH User
            </label>
            <div class="col-sm-12">
              <select class="userSelect form-control" v-model="awsRegion.defaultUser">
                <option v-for="user in regionSSHUsers" :value="user" :key="user">{{ user }}</option>
              </select>
            </div>
          </div>
          <div class="text-center">
            <button v-on:click="updateAwsRegion(awsRegion)" type="button" class="btn btn-success btn-sm">
              <i class="fa fa-save"></i>
              Update Config
            </button>
            <button v-on:click="deleteRegion(awsRegion)" type="button"class="btn btn-danger btn-sm">
              <i class="fa fa-trash"></i>
              Delete Region
            </button>
            <button class="btn btn-sm btn-default" v-on:click="editRegion(awsRegion, 'config')">
              <i class="fa fa-close"></i> Cancel
            </button>
          </div>
        </form>
      </div>

      <div class="regionKeys" v-if="regionKeys[awsRegion.region]">
        AWS Default User Keys
        <button v-on:click="scanRegion(awsRegion)" class="pull-right btn btn-sm btn-success">
          <i class="fa" v-bind:class="{'fa-spinner fa-spin fa-fw': scanning[awsRegion.region],'fa-key': !scanning[awsRegion.region]}"></i>
          Scan Region for Required Keys
        </button>

        <table class="keystable table table-sm table-condensed table-striped">
          <thead>
            <tr>
              <th style="width: 50%">Key Name</th>
              <th>Imported</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in awsRegion.keys" v-bind:key="key.keyName" v-if="!key.custom">
              <td>{{ key.keyName }}</td>
              <td>
                {{ key.value ? 'Yes' : 'No'}}
                <label class="btn btn-success btn-sm btn-file pull-right">
                  <span v-if="!key.value"><i class="fa fa-save"></i> Import Key</span>
                  <span v-else><i class="fa fa-save"></i> Update Key</span>
                  <input type="file" @change="onFileChange($event, awsRegion, key.keyName)" style="display: none">
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center">
          <button class="btn btn-sm btn-default" v-on:click="editRegion(awsRegion, 'keys')">
            <i class="fa fa-close"></i> Cancel
          </button>
        </div>
      </div>

      <div class="regionKeys" v-if="regionUsers[awsRegion.region]">
        <div class="form-group row">
          <div class="col-sm-4">
            Custom User Keys
          </div>
          <div class="col-sm-8 text-right">
            <label>
              <input v-model="customUser[awsRegion.region]" id="newCustomUser" class="form-control input-sm" placeholder="Enter New User" />
            </label>
            <button class="btn btn-sm btn-success" v-on:click="addUser(awsRegion)">
              <i class="fa fa-plus"></i> Add User
            </button>
          </div>
        </div>

        <table class="keystable table table-sm table-condensed table-striped">
          <thead>
            <tr>
              <th style="width: 50%">User</th>
              <th>Imported</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in awsRegion.keys" v-bind:key="key.keyName" v-if="key.custom">
              <td>{{ key.keyName }}</td>
              <td>
                {{ key.value ? 'Yes' : 'No'}}
                <label class="btn btn-success btn-sm btn-file pull-right">
                  <span v-if="!key.value"><i class="fa fa-save"></i> Import Key</span>
                  <span v-else><i class="fa fa-save"></i> Update Key</span>
                  <input type="file" @change="onFileChange($event, awsRegion, key.keyName)" style="display: none;">
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center">
          <button class="btn btn-sm btn-default" v-on:click="editRegion(awsRegion, 'users')">
            <i class="fa fa-close"></i> Cancel
          </button>
        </div>
      </div>

      <div class="regionKeys" v-if="regionSettings[awsRegion.region]">
        Settings:
        <div class="row">
          <div class="col-sm-4">
            <input type="checkbox" id="useBastion" v-model="useBastion[awsRegion.region]" value="true">
            <label for="useBastion">Use Bastion Host</label>
          </div>
          <div class="col-sm-4" v-if="useBastion[awsRegion.region]">
            <select class="form-control input-sm" v-model="awsRegion.bastionHost">
              <option value="" selected>Select Bastion Host</option>
              <option v-if="instance.publicIp" v-for="instance in regionInstances[awsRegion.region]" :value="instance.instanceId" :key="instance.instanceId">{{ instance.name}} : {{ instance.publicIp }} </option>
            </select>
          </div>
          <div class="col-sm-4" v-if="useBastion[awsRegion.region]">
            <select class="form-control input-sm" v-model="awsRegion.bastionUser">
              <option value="" selected>Select SSH User</option>
              <option v-for="user in awsUsers" :value="user" :key="user">{{ user }}</option>
            </select>
          </div>
        </div>
        <div class="text-center">
          <button class="btn btn-sm btn-success" v-on:click="saveRegionSettings(awsRegion)">
            <i class="fa fa-save"></i> Save Settings
          </button>
          <button class="btn btn-sm btn-default" v-on:click="editRegion(awsRegion, 'settings')">
            <i class="fa fa-close"></i> Cancel
          </button>
        </div>
      </div>

    </div>
    <button id="deleteOrg" class="btn btn-sm btn-danger" v-on:click="deleteOrg()">
      <i class="fa fa-trash"></i>
      Delete Organization
    </button>
  </div>
</template>

<script>
import {ipcRenderer} from 'electron';
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';
import AWS from 'aws-sdk';
const { app } = require('electron').remote;
export default {
  name: 'orgSettings',
  data: function() {
    return {
      awsRegionsExpanded: false,
      regionConfig: {},
      regionKeys: {},
      regionUsers: {},
      regionSettings: {},
      regionInstances: [],
      org: {},
      awsRegions: [],
      newRegion: false,
      newRegionCode: '',
      scanning: {},
      customUser: {},
      useBastion: {},
      tab: null,
      awsUsers: [
        'ec2-user',
        'ubuntu',
        'centos',
        'root'
      ],
      regionSSHUsers: [

      ],
      awsRegionCodes: [
        {
          code: 'us-east-1',
          name: 'US East (N. Virginia)',
          config: {}
        },
        {
          code: 'us-east-2',
          name: 'US East (Ohio)',
          config: {}
        },
        {
          code: 'us-west-1',
          name: 'US West (N. California)',
          config: {}
        },
        {
          code: 'us-west-2',
          name: 'US West (Oregon)',
          config: {}
        },
        {
          code: 'ca-central-1',
          name: 'Canada (Central)',
          config: {}
        },
        {
          code: 'eu-west-1',
          name: 'EU (Ireland)',
          config: {}
        },
        {
          code: 'eu-west-2',
          name: 'EU (London)',
          config: {}
        },
        {
          code: 'eu-central-1',
          name: 'EU (Frankfurt)',
          config: {}
        },
        {
          code: 'ap-northeast-1',
          name: 'Asia Pacific (Tokyo)',
          config: {}
        },
        {
          code: 'ap-northeast-2',
          name: 'Asia Pacific (Seoul)',
          config: {}
        },
        {
          code: 'ap-southeast-1',
          name: 'Asia Pacific (Singapore)',
          config: {}
        },
        {
          code: 'ap-southeast-2',
          name: 'Asia Pacific (Syndey)',
          config: {}
        },
        {
          code: 'ap-south-1',
          name: 'Asia Pacific (Mumbai)',
          config: {}
        },
        {
          code: 'sa-east-1',
          name: 'South America (São Paulo)',
          config: {}
        }
      ]
    };
  },
  mounted: function () {
    ipcRenderer.on('orgsettings.loadData', async (e, data) => {
      this.getOrgData(data);
      this.tab = data.tab;
      if (data.regionSettings) {
        this.editRegion(data.regionSettings, 'settings');
      }
      this.awsRegionsExpanded = true;
    });
  },
  methods: {
    /**
     * Get data for this org
     */
    getOrgData: async function(data, cb) {
      try {
        if (!data || !data.org) {
          data = {
            org: this.org._id
          };
        }
        this.org = await this.$db.orgs.cfindOne({ _id: data.org }).exec();
        this.awsRegions = await this.$db.awsRegions.cfind({ org: data.org }).exec();
        _.each(this.awsRegions, (region) => {
          if (region.useBastion === true) {
            this.$set(this.useBastion, region.region, true);
          }
          const keys = this.awsUsers;
          _.each(region.keys, (key) => {
            if (key.custom) {
              keys.push(key.keyName);
            }
          });
          this.regionSSHUsers = keys;
        });
        if (typeof cb === 'function') {
          cb();
        }
      } catch (err) {
        console.log(err);
      }
    },
    /**
     * Toggle AWS Regions display
     */
    toggleAwsRegions: function() {
      if (this.awsRegionsExpanded) {
        this.awsRegionsExpanded = false;
      } else {
        this.awsRegionsExpanded = true;
      }
    },
    /**
     * Add region to db
     */
    addRegion: async function() {
      const vue = this;
      if (!this.newRegion) {
        this.newRegion = true;
      } else {
        if (this.newRegionCode) {
          const awsRegionObj = {
            org: this.org._id,
            region: this.newRegionCode
          };
          const newRegion = await this.$db.awsRegions.insert(awsRegionObj);
          this.getOrgData({org: this.org._id}, () => {
            vue.awsRegionsExpanded = true;
            vue.regionConfig[newRegion.region] = true;
            ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: vue.newRegionCode + ' has been added.   You can now configure for use'});
          });
        }
      }
    },
    /**
     * Check if region has already been addded
     */
    regionAvailable: function(region) {
      return !_.find(this.awsRegions, {region: region});
    },
    /**
     * Edit details for a region
     */
    editRegion: function(awsRegion, type) {
      const region = awsRegion.region;
      if (type === 'config') {
        if (this.regionConfig[region]) {
          this.$set(this.regionConfig, region, false);
        } else {
          this.awsRegionsExpanded = true;
          this.$set(this.regionConfig, region, true);
          this.$set(this.regionKeys, region, false);
          this.$set(this.regionUsers, region, false);
          this.$set(this.regionSettings, region, false);
        }
      } else if (type === 'keys') {
        if (this.regionKeys[region]) {
          this.$set(this.regionKeys, region, false);
        } else {
          this.awsRegionsExpanded = true;
          this.$set(this.regionKeys, region, true);
          this.$set(this.regionConfig, region, false);
          this.$set(this.regionUsers, region, false);
          this.$set(this.regionSettings, region, false);
        }
      } else if (type === 'users') {
        if (this.regionUsers[region]) {
          this.$set(this.regionUsers, region, false);
        } else {
          this.awsRegionsExpanded = true;
          this.$set(this.regionUsers, region, true);
          this.$set(this.regionConfig, region, false);
          this.$set(this.regionKeys, region, false);
          this.$set(this.regionSettings, region, false);
        }
      } else if (type === 'settings') {
        if (this.regionSettings[region]) {
          this.$set(this.regionSettings, region, false);
        } else {
          this.instanceScan(awsRegion);
          this.awsRegionsExpanded = true;
          this.$set(this.regionSettings, region, true);
          this.$set(this.regionConfig, region, false);
          this.$set(this.regionKeys, region, false);
          this.$set(this.regionUsers, region, false);
        }
      }
    },
    /**
     * Delete a region
     */
    deleteRegion: async function(awsRegion) {
      if (confirm('Are you sure you want to delete this region?  All associated SSH keys will be purged.')) {
        this.$db.awsRegions.remove({ _id: awsRegion._id });
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name, awsRegion.region).replace(/\s+/g, '-');
        fs.emptyDir(dirPath);
        ipcRenderer.send('orgmenu.updateselectedOrg');
        this.regionConfig[awsRegion.region] = false;
        this.regionKeys[awsRegion.region] = false;
        this.getOrgData();
      } else {
        return false;
      }
    },
    /**
     * Update an aws region
     */
    updateAwsRegion: async function(awsRegion) {
      this.$db.awsRegions.update({_id: awsRegion._id}, awsRegion);
      ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: this.newRegionCode + ' configuration has been updated'});
      ipcRenderer.send('orgmenu.updateSelectedOrg');
    },
    /**
     * Scan aws region for keys
     */
    scanRegion: function(awsRegion) {
      this.$set(this.scanning, awsRegion.region, true);
      const vue = this;
      AWS.config.update({
        region: awsRegion.region,
        accessKeyId: awsRegion.accessKey,
        secretAccessKey: awsRegion.secretKey
      });

      const ec2 = new AWS.EC2();
      ec2.describeInstances(async function(err, data) {
        if (err) {
          ipcRenderer.send('alertbox.show', {type: 'tempMessage', error: 'true', msg: err.message});
          vue.$set(vue.scanning, awsRegion.region, false);
        } else {
          if (!Array.isArray(awsRegion.keys)) {
            awsRegion.keys = [];
          }
          _.each(data.Reservations, (reservationData) => {
            _.each(reservationData.Instances, (instanceData) => {
              if (!_.includes(awsRegion.keys, instanceData.KeyName)) {
                const found = awsRegion.keys.some(function(el) {
                  if (instanceData.KeyName === el.keyName) return true;
                });
                if (!found) {
                  awsRegion.keys.push({ keyName: instanceData.KeyName, value: null });
                }
              }
            });
          });
          await vue.$db.awsRegions.update({ _id: awsRegion._id }, awsRegion);
          this.awsRegion = awsRegion;
          vue.getOrgData();
          vue.$set(vue.scanning, awsRegion.region, false);
        }
      });
    },
    /**
     * Import an ssh key
     */
    async onFileChange(e, awsRegion, keyName) {
      try {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name, awsRegion.region).replace(/\s+/g, '-');
        const fullPath = path.join(dirPath, keyName);
        const data = await fs.readFile(files[0].path);
        await fs.ensureDir(dirPath);
        await fs.writeFile(fullPath, data);
        await fs.chmod(fullPath, '0600');
        awsRegion.keys.some(function(el) {
          if (keyName === el.keyName) {
            el.value = true;
          }
        });
        await this.$db.awsRegions.update({ _id: awsRegion._id }, awsRegion);
      } catch (err) {
        console.log(err);
      }
    },
    /**
     * Add a new custom user to a region
     */
    addUser: async function(awsRegion) {
      const newUser = this.customUser[awsRegion.region];
      if (newUser) {
        this.$set(this.customUser, awsRegion.region, '');
        if (!awsRegion.keys) {
          awsRegion.keys = [];
        }
        awsRegion.keys.push({keyName: newUser, value: null, custom: true});
        await this.$db.awsRegions.update({ _id: awsRegion._id }, awsRegion);
        this.getOrgData();
      }
    },
    /**
     * Scan Instances in this region
     */
    instanceScan: function(awsRegion) {
      const vue = this;
      AWS.config.update({
        region: awsRegion.region,
        accessKeyId: awsRegion.accessKey,
        secretAccessKey: awsRegion.secretKey
      });

      const ec2 = new AWS.EC2();
      ec2.describeInstances(function(err, data) {
        if (err) {
          ipcRenderer.send('alertbox.show', {type: 'tempMessage', error: 'true', msg: err.message});
        } else {
          const instances = [];
          _.each(data.Reservations, (reservationData) => {
            const instance = {};
            _.each(reservationData.Instances, (instanceData) => {
              instance.instanceId = instanceData.InstanceId;
              instance.state = instanceData.State.Name;
              instance.publicIp = instanceData.PublicIpAddress;
              _.each(instanceData.Tags, (tagData) => {
                if (tagData.Key === 'Name') {
                  instance.name = tagData.Value;
                }
              });
            });
            instances.push(instance);
          });
          vue.$set(vue.regionInstances, awsRegion.region, instances);
        }
      });
    },
    /**
     * Save Region Settings
     */
    saveRegionSettings: async function(awsRegion) {
      awsRegion.useBastion = this.useBastion[awsRegion.region];
      await this.$db.awsRegions.update({ _id: awsRegion._id }, awsRegion);
      this.getOrgData();
      ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: awsRegion.region + ' settings have been saved'});
      if (this.tab) {
        ipcRenderer.send('awsregion.updateTabData', {tab: this.tab});
      }
    },
    /**
     * Delete organization
     */
    deleteOrg: async function() {
      if (confirm('Are you sure you want to delete this Organization?  All associated regions and SSH keys will be purged.')) {
        this.$db.awsRegions.remove({org: this.org._id}, {multi: true});
        this.$db.orgs.remove({_id: this.org._id});
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name).replace(/\s+/g, '-');
        fs.emptyDir(dirPath);
        ipcRenderer.send('orgmenu.updateSelectBox');
        ipcRenderer.send('orgmenu.updateSelectedOrg');
        ipcRenderer.send('mainview.closeTab', this.tab);
        ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: this.org.name + ' has been deleted'});
      } else {
        return false;
      }
    }
  }
};
</script>
<style>
@import '../../assets/css/orgsettings.css'
</style>
