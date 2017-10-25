<template>
  <div id="orgSettings">
    <div class="cloudType" v-for="cloudType in cloudTypes" :key="cloudType">
      <div class="form-group row">
        <div class="col-sm-4 toggle" v-on:click="toggleCloudService(cloudType)">
          <i class="fa" v-bind:class="{ 'fa-caret-right': !cloudServicesExpanded[cloudType], 'fa-caret-down': cloudServicesExpanded[cloudType] }"></i>
          <span v-if="cloudType === 'awsRegion'">AWS REGIONS ({{awsRegionCount}})</span>
          <span v-if="cloudType === 'googleProject'">Google Project ({{googleProjectCount}})</span>
        </div>
        <div class="col-sm-8 text-right">
          <select v-if="newCloudService[cloudType] && cloudType === 'awsRegion'" class="newregion-select form-control" v-model="newCloudServiceIdentifier[cloudType]">
            <option value="" selected>Select New Region</option>
            <option v-if="regionAvailable(awsRegion.code)" v-for="awsRegion in awsRegionCodes" :value="awsRegion.code" :key="awsRegion.code">{{ awsRegion.code }} : {{ awsRegion.name }}</option>
          </select>
          <input v-if="newCloudService[cloudType] && cloudType === 'googleProject'" class="input input-sm" v-model="newCloudServiceIdentifier[cloudType]" />
          <button class="btn btn-sm" v-bind:class="{'btn-default':!newCloudService[cloudType],'btn-success':newCloudService[cloudType]}" v-on:click="addCloudService(cloudType)">
            <i class="fa fa-plus"></i>
            <span v-if="cloudType === 'awsRegion'">Add Region</span>
            <span v-if="cloudType === 'googleProject'">Add Project</span>
          </button>
          <button v-if="newCloudService" class="btn btn-sm btn-info" v-on:click="newCloudService[cloudType] = false">
            <i class="fa fa-close"></i> Cancel
          </button>
        </div>
      </div>

      <div class="cloud cloudBordered" v-for="cloudService in cloudServices" v-bind:key="cloudService.identifier" v-if="cloudService.type === cloudType && cloudServicesExpanded[cloudService.type]">
        {{cloudService.identifier}}
        <span style="float: right">
          <button class="btn btn-sm" v-bind:class="{'btn-default':!cloudConfig[cloudService.identifier],'btn-info':cloudConfig[cloudService.identifier]}" v-on:click="editCloud(cloudService,'config')">
            <i class="fa fa-edit"></i> Config
          </button>
          <button v-if="cloudService.type === 'awsRegion'" class="btn btn-sm" v-bind:class="{'btn-default':!cloudKeys[cloudService.identifier],'btn-info':cloudKeys[cloudService.identifier]}" v-on:click="editCloud(cloudService, 'keys')">
            <i class="fa fa-key"></i> Keys
          </button>
          <button class="btn btn-sm" v-bind:class="{'btn-default':!cloudUsers[cloudService.identifier],'btn-info':cloudUsers[cloudService.identifier]}" v-on:click="editCloud(cloudService, 'users')">
            <i class="fa fa-user-circle"></i> Users
          </button>
          <button class="btn btn-sm" v-bind:class="{'btn-default':!cloudSettings[cloudService.identifier],'btn-info':cloudSettings[cloudService.identifier]}" v-on:click="editCloud(cloudService, 'settings')">
            <i class="fa fa-cog"></i> Settings
          </button>
        </span>

        <div class="cloudConfig" v-if="cloudConfig[cloudService.identifier]">
          <form>
            <div class="form-group" v-if="cloudService.type === 'awsRegion'">
              <label for="accessKey" class="col-sm col-form-label">
                AWS Access Key Id
                <i class="fa fa-question-circle-o" title="This access key must have the ec2:describeInstances permission"></i>
              </label>
              <div class="col-sm-12">
                <input type="text" class="form-control input-sm" v-model="cloudService.awsAccessKey" placeholder="Access Key Id">
              </div>
              <label for="accessKey" class="col-sm col-form-label">
                AWS Secret Key
              </label>
              <div class="col-sm-12">
                <input type="text" class="form-control input-sm" v-model="cloudService.awsSecretKey" placeholder="Access Key Id">
              </div>
              <label for="accessKey" class="col-sm col-form-label">
                Default SSH User
              </label>
              <div class="col-sm-12">
                <select class="userSelect form-control" v-model="cloudService.defaultUser">
                  <option v-if="cloudService.type === 'awsRegion'" v-for="user in regionSSHUsers" :value="user" :key="user">{{ user }}</option>
                  <option v-if="cloudService.type === 'googleProject'" v-for="user in projectSSHUsers" :value="user" :key="user">{{ user }}</option>
                </select>
              </div>
            </div>
            <div class="form-group" v-if="cloudService.type === 'googleProject'">
              <label for="accessKey" class="col-sm col-form-label">
                Client Email
              </label>
              <div class="col-sm-12">
                <input type="text" class="form-control input-sm" v-model="cloudService.googleClientEmail" placeholder="Client Email">
              </div>
              <label for="accessKey" class="col-sm col-form-label">
                Private Key
              </label>
              <div class="col-sm-12">
                <input type="text" class="form-control input-sm" v-model="cloudService.googlePrivateKey" />
              </div>
              <label for="accessKey" class="col-sm col-form-label">
                Default SSH User
              </label>
              <div class="col-sm-12">
                <select class="userSelect form-control" v-model="cloudService.defaultUser">
                  <option v-if="cloudService.type === 'awsRegion'" v-for="user in regionSSHUsers" :value="user" :key="user">{{ user }}</option>
                  <option v-if="cloudService.type === 'googleProject'" v-for="user in projectSSHUsers" :value="user" :key="user">{{ user }}</option>
                </select>
              </div>
            </div>
            <div class="text-center">
              <button v-on:click="updateCloudService(cloudService)" type="button" class="btn btn-success btn-sm">
                <i class="fa fa-save"></i>
                Update Config
              </button>
              <button v-on:click="deleteCloudService(cloudService)" type="button"class="btn btn-danger btn-sm">
                <i class="fa fa-trash"></i>
                <span v-if="cloudService.type === 'awsRegion'">
                Delete Region
                </span>
                <span v-if="cloudService.type === 'googleProject'">
                  Delete Project
                </span>
              </button>
              <button class="btn btn-sm btn-default" v-on:click="editCloud(cloudService, 'config')">
                <i class="fa fa-close"></i> Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="cloudKeys" v-if="cloudKeys[cloudService.identifier] && cloudService.type === 'awsRegion'">
          AWS Default User Keys
          <button v-on:click="scanRegion(cloudService)" class="pull-right btn btn-sm btn-success">
            <i class="fa" v-bind:class="{'fa-spinner fa-spin fa-fw': scanning[cloudService.identifier],'fa-key': !scanning[cloudService.identifier]}"></i>
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
              <tr v-for="key in cloudService.keys" v-bind:key="key.keyName" v-if="!key.custom">
                <td>{{ key.keyName }}</td>
                <td>
                  {{ key.value ? 'Yes' : 'No'}}
                  <label class="btn btn-success btn-sm btn-file pull-right">
                    <span v-if="!key.value"><i class="fa fa-save"></i> Import Key</span>
                    <span v-else><i class="fa fa-save"></i> Update Key</span>
                    <input type="file" @change="onFileChange($event, cloudService, key.keyName)" style="display: none">
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-center">
            <button class="btn btn-sm btn-default" v-on:click="editCloud(cloudService, 'keys')">
              <i class="fa fa-close"></i> Cancel
            </button>
          </div>
        </div>

        <div class="cloudKeys" v-if="cloudUsers[cloudService.identifier]">
          <div class="form-group row">
            <div class="col-sm-4">
              Custom User Keys
            </div>
            <div class="col-sm-8 text-right">
              <label>
                <input v-model="customUser[cloudService.identifier]" id="newCustomUser" class="form-control input-sm" placeholder="Enter New User" />
              </label>
              <button class="btn btn-sm btn-success" v-on:click="addUser(cloudService)">
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
              <tr v-for="key in cloudService.keys" v-bind:key="key.keyName" v-if="key.custom">
                <td>{{ key.keyName }}</td>
                <td>
                  {{ key.value ? 'Yes' : 'No'}}
                  <label class="btn btn-success btn-sm btn-file pull-right">
                    <span v-if="!key.value"><i class="fa fa-save"></i> Import Key</span>
                    <span v-else><i class="fa fa-save"></i> Update Key</span>
                    <input type="file" @change="onFileChange($event, cloudService, key.keyName)" style="display: none;">
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-center">
            <button class="btn btn-sm btn-default" v-on:click="editCloud(cloudService, 'users')">
              <i class="fa fa-close"></i> Cancel
            </button>
          </div>
        </div>

        <div class="cloudKeys" v-if="cloudSettings[cloudService.identifier]">
          Settings:
          <div class="row">
            <div class="col-sm-4">
              <input type="checkbox" id="useBastion" v-model="useBastion[cloudService.identifier]" value="true">
              <label for="useBastion">Use Bastion Host</label>
            </div>
            <div class="col-sm-4" v-if="useBastion[cloudService.identifier]">
              <select class="form-control input-sm" v-model="cloudService.bastionHost">
                <option value="" selected>Select Bastion Host</option>
                <option v-if="instance.publicIp" v-for="instance in cloudInstances[cloudService.identifier]" :value="instance.instanceId" :key="instance.instanceId">{{ instance.name}} : {{ instance.publicIp }} </option>
              </select>
            </div>
            <div class="col-sm-4" v-if="useBastion[cloudService.identifier]">
              <select class="form-control input-sm" v-model="cloudService.bastionUser">
                <option value="" selected>Select SSH User</option>
                <option v-if="cloudService.type === 'awsRegion'" v-for="user in regionSSHUsers" :value="user" :key="user">{{ user }}</option>
                <option v-if="cloudService.type === 'googleProject'" v-for="user in projectSSHUsers" :value="user" :key="user">{{ user }}</option>
              </select>
            </div>
          </div>
          <div class="col-sm-12" v-if="isWindows">
            Warning: OpenSSH on Windows does not support Proxy connections at this time.   So this feature will not work currently.   You will need to connect to your bastion host first and then ssh to your other servers from there.
          </div>
          <div class="text-center">
            <button class="btn btn-sm btn-success" v-on:click="saveCloudSettings(cloudService)">
              <i class="fa fa-save"></i> Save Settings
            </button>
            <button class="btn btn-sm btn-default" v-on:click="editCloud(cloudService, 'settings')">
              <i class="fa fa-close"></i> Cancel
            </button>
          </div>
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
import GoogleCloud from 'google-cloud';
const { app } = require('electron').remote;
export default {
  name: 'orgSettings',
  data: function() {
    return {
      cloudTypes: ['awsRegion', 'googleProject'],
      cloudServicesExpanded: {},
      cloudConfig: {},
      cloudKeys: {},
      cloudUsers: {},
      cloudSettings: {},
      cloudInstances: [],
      org: {},
      cloudServices: [],
      awsRegionCount: 0,
      googleProjectCount: 0,
      newCloudService: {},
      newCloudServiceIdentifier: {},
      scanning: {},
      customUser: {},
      useBastion: {},
      isWindows: (process.platform === 'win32') ? 1 : 0,
      tab: null,
      awsUsers: [
        'ec2-user',
        'ubuntu',
        'centos',
        'root'
      ],
      regionSSHUsers: [
      ],
      projectSSHUsers: [],
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
      if (data.cloudSettings) {
        this.editCloud(data.cloudSettings, 'settings');
      }
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
        this.cloudServices = await this.$db.cloudServices.cfind({ org: data.org }).exec();
        this.awsRegionCount = await this.$db.cloudServices.count({org: data.org, type: 'awsRegion'});
        this.googleProjectCount = await this.$db.cloudServices.count({org: data.org, type: 'googleProject'});
        _.each(this.cloudServices, (cloudService) => {
          if (cloudService.useBastion === true) {
            this.$set(this.useBastion, cloudService.identifier, true);
          }
          const keys = this.awsUsers;
          this.projectSSHUsers = [];
          _.each(cloudService.keys, (key) => {
            if (key.custom) {
              keys.push(key.keyName);
              this.projectSSHUsers.push(key.keyName);
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
     * Toggle Cloud Service display
     */
    toggleCloudService: function(type) {
      if (this.cloudServicesExpanded[type]) {
        this.$set(this.cloudServicesExpanded, type, false);
      } else {
        this.$set(this.cloudServicesExpanded, type, true);
      }
    },
    /**
     * Add new cloud service to db
     */
    addCloudService: async function(type) {
      const vue = this;
      if (!this.newCloudService[type]) {
        this.$set(this.newCloudService, type, true);
      } else {
        if (this.newCloudServiceIdentifier[type]) {
          const cloudServiceObj = {
            org: this.org._id,
            identifier: this.newCloudServiceIdentifier[type],
            type: type
          };
          const newCloudService = await this.$db.cloudServices.insert(cloudServiceObj);
          this.getOrgData({org: this.org._id}, () => {
            vue.$set(vue.cloudServicesExpanded, type, true);
            vue.cloudConfig[newCloudService.identifier] = true;
            vue.$set(vue.newCloudService[type], false);
            vue.$set(vue.newCloudServiceIdentifier[type], false);
            ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: vue.newCloudServiceIdentifier + ' has been added.   You can now configure for use'});
          });
        }
      }
    },
    /**
     * Check if region has already been addded
     */
    regionAvailable: function(region) {
      return !_.find(this.cloudServices, {identifier: region, type: 'awsRegion'});
    },
    /**
     * Edit details for a cloud service
     */
    editCloud: function(cloudService, type) {
      const cloudIdentifier = cloudService.identifier;
      if (type === 'config') {
        if (this.cloudConfig[cloudIdentifier]) {
          this.$set(this.cloudConfig, cloudIdentifier, false);
        } else {
          this.$set(this.cloudServicesExpanded, type, true);
          this.$set(this.cloudConfig, cloudIdentifier, true);
          this.$set(this.cloudKeys, cloudIdentifier, false);
          this.$set(this.cloudUsers, cloudIdentifier, false);
          this.$set(this.cloudSettings, cloudIdentifier, false);
        }
      } else if (type === 'keys') {
        if (this.cloudKeys[cloudIdentifier]) {
          this.$set(this.cloudKeys, cloudIdentifier, false);
        } else {
          this.$set(this.cloudServicesExpanded, type, true);
          this.$set(this.cloudKeys, cloudIdentifier, true);
          this.$set(this.cloudConfig, cloudIdentifier, false);
          this.$set(this.cloudUsers, cloudIdentifier, false);
          this.$set(this.cloudSettings, cloudIdentifier, false);
        }
      } else if (type === 'users') {
        if (this.cloudUsers[cloudIdentifier]) {
          this.$set(this.cloudUsers, cloudIdentifier, false);
        } else {
          this.$set(this.cloudServicesExpanded, type, true);
          this.$set(this.cloudUsers, cloudIdentifier, true);
          this.$set(this.cloudConfig, cloudIdentifier, false);
          this.$set(this.cloudKeys, cloudIdentifier, false);
          this.$set(this.cloudSettings, cloudIdentifier, false);
        }
      } else if (type === 'settings') {
        if (this.cloudSettings[cloudIdentifier]) {
          this.$set(this.cloudSettings, cloudIdentifier, false);
        } else {
          this.instanceScan(cloudService);
          this.$set(this.cloudServicesExpanded, type, true);
          this.$set(this.cloudSettings, cloudIdentifier, true);
          this.$set(this.cloudConfig, cloudIdentifier, false);
          this.$set(this.cloudKeys, cloudIdentifier, false);
          this.$set(this.cloudUsers, cloudIdentifier, false);
        }
      }
    },
    /**
     * Delete a cloud service
     */
    deleteCloudService: async function(cloudService) {
      if (confirm('Are you sure you want to delete ' + cloudService.identifier + '?  All associated SSH keys will be purged.')) {
        this.$db.cloudServices.remove({ _id: cloudService._id });
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name, cloudService.identifier).replace(/\s+/g, '-');
        fs.emptyDir(dirPath);
        ipcRenderer.send('orgmenu.updateselectedOrg');
        this.cloudConfig[cloudService.identifier] = false;
        this.cloudKeys[cloudService.identifier] = false;
        this.getOrgData();
      } else {
        return false;
      }
    },
    /**
     * Update an a cloud service
     */
    updateCloudService: async function(cloudService) {
      this.$db.cloudServices.update({_id: cloudService._id}, cloudService);
      ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: cloudService.identifier + ' configuration has been updated'});
      ipcRenderer.send('orgmenu.updateSelectedOrg');
    },
    /**
     * Scan aws region for keys
     */
    scanRegion: function(awsRegion) {
      this.$set(this.scanning, awsRegion.identifier, true);
      const vue = this;
      AWS.config.update({
        region: awsRegion.identifier,
        accessKeyId: awsRegion.awsAccessKey,
        secretAccessKey: awsRegion.awsSecretKey
      });

      const ec2 = new AWS.EC2();
      ec2.describeInstances(async function(err, data) {
        if (err) {
          ipcRenderer.send('alertbox.show', {type: 'tempMessage', error: 'true', msg: err.message});
          vue.$set(vue.scanning, awsRegion.identifier, false);
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
          await vue.$db.cloudServices.update({ _id: awsRegion._id }, awsRegion);
          this.awsRegion = awsRegion;
          vue.getOrgData();
          vue.$set(vue.scanning, awsRegion.identifier, false);
        }
      });
    },
    /**
     * Import an ssh key
     */
    async onFileChange(e, cloudService, keyName) {
      try {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name, cloudService.identifier).replace(/\s+/g, '-');
        const fullPath = path.join(dirPath, keyName);
        const data = await fs.readFile(files[0].path);
        await fs.ensureDir(dirPath);
        await fs.writeFile(fullPath, data);
        await fs.chmod(fullPath, '0600');
        cloudService.keys.some(function(el) {
          if (keyName === el.keyName) {
            el.value = true;
          }
        });
        await this.$db.cloudServices.update({ _id: cloudService._id }, cloudService);
      } catch (err) {
        console.log(err);
      }
    },
    /**
     * Add a new custom user to a cloud service
     */
    addUser: async function(cloudService) {
      const newUser = this.customUser[cloudService.identifier];
      if (newUser) {
        this.$set(this.customUser, cloudService.identifier, '');
        if (!cloudService.keys) {
          cloudService.keys = [];
        }
        cloudService.keys.push({keyName: newUser, value: null, custom: true});
        await this.$db.cloudServices.update({ _id: cloudService._id }, cloudService);
        this.getOrgData();
      }
    },
    /**
     * Scan Instances in this cloud service
     */
    instanceScan: function(cloudService) {
      const vue = this;
      if (cloudService.type === 'googleProject') {
        const gcloud = GoogleCloud({
          projectId: cloudService.identifier,
          credentials: {
            client_email: cloudService.googleClientEmail,
            private_key: cloudService.googlePrivateKey.replace(/\\n/g, '\n')
          }
        });
        const gce = gcloud.compute();

        gce.getVMs(function(err, vms) {
          if (err) {
            ipcRenderer.send('alertbox.show', {type: 'message', error: true, msg: err.message});
          }
          const instances = [];
          _.each(vms, function(vm) {
            const instance = {};
            instance.instanceId = vm.metadata.id;
            instance.state = vm.metadata.status;
            instance.publicIp = vm.metadata.networkInterfaces[0].accessConfigs[0].natIP;
            instance.name = vm.name;
            instances.push(instance);
          });
          vue.$set(vue.cloudInstances, cloudService.identifier, instances);
        });
      }
      if (cloudService.type === 'awsRegion') {
        AWS.config.update({
          region: cloudService.identifier,
          accessKeyId: cloudService.awsAccessKey,
          secretAccessKey: cloudService.awsSecretKey
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
            vue.$set(vue.cloudInstances, cloudService.identifier, instances);
          }
        });
      }
    },
    /**
     * Save Cloud Service Settings
     */
    saveCloudSettings: async function(cloudService) {
      cloudService.useBastion = this.useBastion[cloudService.identifier];
      await this.$db.cloudServices.update({ _id: cloudService._id }, cloudService);
      this.getOrgData();
      ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: cloudService.identifier + ' settings have been saved'});
      if (this.tab) {
        ipcRenderer.send('cloudservice.updateTabData', {tab: this.tab});
      }
    },
    /**
     * Delete organization
     */
    deleteOrg: async function() {
      if (confirm('Are you sure you want to delete this Organization?  All associated configs and SSH keys will be purged.')) {
        this.$db.cloudServices.remove({org: this.org._id}, {multi: true});
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
