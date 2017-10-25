<template>
  <table id="cloudTable" class="table table-sm table-condensed">
    <thead>
      <tr id="cloudSettingsHeader">
        <th colspan="2">
          <input id="instanceSearch" v-on:keyup="instanceSearch()" class="form-control input-sm" placeholder="Search instances"></input>
        </th>
        <th>
        </th>
        <th colspan="3">
          <i v-on:click="cloudSettings()" class="fa fa-cog fa-2x pull-right" title="Cloud Service Settings"></i>
        </th>
      <tr id="cloudHeaders">
        <th v-on:click="doSort('name')">Name &nbsp;
          <i class="fa" v-if="sortKey === 'name'" v-bind:class="{'fa-caret-down':sortDir==='asc','fa-caret-up':sortDir==='desc'}"></i>
        </th>
        <th v-on:click="doSort('instanceId')">Instance ID &nbsp;
          <i class="fa" v-if="sortKey === 'instanceId'" v-bind:class="{'fa-caret-down':sortDir==='asc','fa-caret-up':sortDir==='desc'}"></i>
        </th>
        <th v-on:click="doSort('instanceType')">Instance Type &nbsp;
          <i class="fa" v-if="sortKey === 'instanceType'" v-bind:class="{'fa-caret-down':sortDir==='asc','fa-caret-up':sortDir==='desc'}"></i>
        </th>
        <th v-on:click="doSort('state')">State &nbsp;
          <i class="fa" v-if="sortKey === 'state'" v-bind:class="{'fa-caret-down':sortDir==='asc','fa-caret-up':sortDir==='desc'}"></i>
        </th>
        <th v-on:click="doSort('publicIp')">Public IP &nbsp;
          <i class="fa" v-if="sortKey === 'publicIp'" v-bind:class="{'fa-caret-down':sortDir==='asc','fa-caret-up':sortDir==='desc'}"></i>
        </th>
        <th v-on:click="doSort('privateIp')">Private IP &nbsp;
          <i class="fa" v-if="sortKey === 'privateIp'" v-bind:class="{'fa-caret-down':sortDir==='asc','fa-caret-up':sortDir==='desc'}"></i>
        </th>
      </tr>
    </thead>
    <tbody v-for="instance in instanceData" v-bind:key="instance.instanceId">
      <tr class="instanceData" v-on:click="toggleDetails(instance.instanceId)">
        <td>
          <i class="fa" v-bind:class="{'fa-caret-right':!details[instance.instanceId],'fa-caret-down':details[instance.instanceId]}"></i> &nbsp;
          {{ instance.name }}
        </td>
        <td>{{ instance.instanceId }}</td>
        <td>{{ instance.instanceType }}</td>
        <td>{{ instance.state }} </td>
        <td>{{ instance.publicIp }}</td>
        <td>{{ instance.privateIp }}</td>
      </tr>
      <tr v-if="details[instance.instanceId]">
        <td colspan=7>
          SSH Connect as
          <select class="select" v-model="sshConnect[instance.instanceId]['user']">
            <option v-if="cloudService.type === 'awsRegion'" v-for="user in awsSshUsers" :value="user" :key="user">{{ user }}</option>
            <option v-if="cloudService.type === 'googleProject'" v-for="user in googleSshUsers" :value="user" :key="user">{{ user }}</option>
          </select>
          to
          <select class="select" v-model="sshConnect[instance.instanceId]['ip']">
            <option v-if="instance.privateIp" :value="instance.privateIp">Private IP</option>
            <option v-if="instance.publicIp" :value="instance.publicIp">Public IP</option>
          </select>
          <select v-if="cloudService.useBastion && cloudService.bastionHost != instance.instanceId" class="select" v-model="sshConnect[instance.instanceId]['bastion']">
            <option value="1">Using Bastion Host</option>
            <option value="0">Not Using Bastion Host</option>
          </select>
          <button class="btn btn-default btn-sm btn-ssh" v-on:click="ssh(instance)">Open SSH Connection</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { ipcRenderer } from 'electron';
import AWS from 'aws-sdk';
import GoogleCloud from 'google-cloud';
import _ from 'lodash';
export default {
  name: 'cloudService',
  data: function() {
    return {
      defaultUsers: [
        'ec2-user',
        'ubuntu',
        'centos',
        'root'
      ],
      awsSshUsers: [],
      googleSshUsers: [],
      details: {},
      orgId: null,
      cloudServiceId: null,
      instances: [],
      instanceData: [],
      test: null,
      tab: null,
      cloudService: null,
      org: null,
      rendered: false,
      sortKey: null,
      sortDir: null,
      sshConnect: {}
    };
  },
  mounted: function () {
    ipcRenderer.on('cloudservice.updateTabData', (e, data) => {
      if (data.tab === this.tab) {
        this.getData();
      }
    });
    ipcRenderer.on('cloudservice.data', (e, data) => {
      if (this.rendered === false) {
        this.tab = data.tab;
        this.cloudServiceId = data.cloudId;
        this.orgId = data.org;
        this.rendered = true;
        this.getData(() => {
          this.getInstances();
        });
      }
    });
  },
  methods: {

    /**
     * Search Instances
     */
    instanceSearch: function() {
      const searchString = $('#instanceSearch').val();
      if (!searchString) {
        this.instanceData = this.instances;
        return;
      }
      _.each(this.instanceData, (instance) => {
        let found = false;
        _.each(instance, (val, key) => {
          if (_.includes(val, searchString)) {
            found = true;
          }
        });
        if (!found) {
          this.instanceData = _.reject(this.instanceData, {instanceId: instance.instanceId});
        }
      });
    },

    /**
     * Sort Instances
     */
    doSort: function(field) {
      if (!field) {
        field = 'name';
      }
      if (field === this.sortKey) {
        if (this.sortDir === 'asc') {
          this.sortDir = 'desc';
        } else {
          this.sortDir = 'asc';
        }
      } else {
        this.sortDir = 'asc';
      }
      this.sortKey = field;
      this.instanceData = _.orderBy(this.instanceData, [instance => instance[field].toLowerCase()], [this.sortDir]);
    },

    /**
     * Get data from Db
     */
    getData: async function(cb) {
      this.org = await this.$db.orgs.cfindOne({ _id: this.orgId }).exec();
      this.cloudService = await this.$db.cloudServices.cfindOne({_id: this.cloudServiceId}).exec();
      this.awsSshUsers = this.defaultUsers;
      _.each(this.cloudService.keys, (key) => {
        if (key.custom) {
          this.awsSshUsers.push(key.keyName);
          this.googleSshUsers.push(key.keyName);
        }
      });
      if (typeof (cb) === 'function') {
        cb();
      }
    },

    /**
     * Open up cloud settings modal
     */
    cloudSettings: function() {
      const data = {};
      data.org = this.org._id;
      data.type = 'orgSettings';
      data.cloudSettings = this.cloudService;
      ipcRenderer.send('mainview.openTab', data);
    },

    /**
     * Show details for a specific instance row
     */
    toggleDetails: function(instanceId) {
      if (this.details[instanceId]) {
        this.$set(this.details, instanceId, false);
      } else {
        this.$set(this.details, instanceId, true);
      }
    },

    /**
     * Initiate an SSH connection in a new tab
     */
    ssh: async function(instance) {
      let bastionHost;
      if (this.sshConnect[instance.instanceId]['bastion'] === 1) {
        _.each(this.instances, (inst) => {
          if (this.cloudService.bastionHost === inst.instanceId) {
            bastionHost = inst;
          }
        });
      }
      const data = {
        type: 'ssh',
        org: this.orgId,
        cloudServiceId: this.cloudServiceId,
        instance: instance,
        tab: instance.tab,
        user: this.sshConnect[instance.instanceId]['user'],
        ip: this.sshConnect[instance.instanceId]['ip'],
        bastionHost: bastionHost
      };
      if (!_.find(this.cloudService.connections, {name: instance.name})) {
        const newTemp = {
          instanceId: instance.instanceId,
          name: instance.name,
          user: data.user,
          ip: data.ip
        };
        await this.$db.cloudServices.update(
          {_id: this.cloudService._id},
          {$push: {connections: newTemp}});

        this.getData();
      }
      ipcRenderer.send('mainview.openTab', data);
    },
    getInstances: function() {
      const vue = this;
      if (this.cloudService.type === 'googleProject') {
        const gcloud = GoogleCloud({
          projectId: this.cloudService.identifier,
          credentials: {
            client_email: this.cloudService.googleClientEmail,
            private_key: this.cloudService.googlePrivateKey.replace(/\\n/g, '\n')
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
            instance.instanceId = vm.metadata.id.toString();
            instance.instanceType = vm.metadata.machineType.substr(vm.metadata.machineType.lastIndexOf('/') + 1);
            instance.availabilityZone = vm.metadata.zone.substr(vm.metadata.zone.lastIndexOf('/') + 1);
            instance.state = vm.metadata.status;
            instance.publicIp = vm.metadata.networkInterfaces[0].accessConfigs[0].natIP;
            instance.privateIp = vm.metadata.networkInterfaces[0].networkIP;
            instance.keyFile = '';
            instance.name = vm.name;
            let matching = _.find(vue.cloudService.connections, {name: instance.name});
            instance.defaultUser = matching ? matching.user : vue.cloudService.defaultUser;
            instance.defaultIp = matching ? matching.ip : null;
            instances.push(instance);
            vue.$set(vue.sshConnect, instance.instanceId, {
              user: instance.defaultUser,
              ip: instance.defaultIp,
              bastion: vue.cloudService.useBastion ? 1 : 0
            });
          });
          vue.instances = instances;
          vue.instanceData = vue.instances;
          vue.doSort();
        });
      }

      if (this.cloudService.type === 'awsRegion') {
        AWS.config.update({
          region: this.cloudService.identifier,
          accessKeyId: this.cloudService.awsAccessKey,
          secretAccessKey: this.cloudService.awsSecretKey
        });

        const ec2 = new AWS.EC2();
        ec2.describeInstances(function(err, data) {
          if (err) {
            ipcRenderer.send('alertbox.show', {type: 'message', error: true, msg: err.message});
          } else {
            const instances = [];
            _.each(data.Reservations, (reservationData) => {
              const instance = {};
              _.each(reservationData.Instances, (instanceData) => {
                instance.instanceId = instanceData.InstanceId;
                instance.instanceType = instanceData.InstanceType;
                instance.availabilityZone = instanceData.Placement.AvailabilityZone;
                instance.state = instanceData.State.Name;
                instance.publicIp = instanceData.PublicIpAddress;
                instance.privateIp = instanceData.PrivateIpAddress;
                instance.keyFile = instanceData.KeyName;
                _.each(instanceData.Tags, (tagData) => {
                  if (tagData.Key === 'Name') {
                    instance.name = tagData.Value;
                  }
                });
                let matching = _.find(vue.cloudService.connections, {name: instance.name});
                instance.defaultUser = matching ? matching.user : vue.cloudService.defaultUser;
                instance.defaultIp = matching ? matching.ip : null;
              });
              instances.push(instance);
              vue.$set(vue.sshConnect, instance.instanceId, {
                user: instance.defaultUser,
                ip: instance.defaultIp,
                bastion: vue.cloudService.useBastion ? 1 : 0
              });
            });
            vue.instances = instances;
            vue.instanceData = vue.instances;
            vue.doSort();
          }
        });
      }
    }
  }
};
</script>
<style>
@import '../../assets/css/cloudservice.css'
</style>
