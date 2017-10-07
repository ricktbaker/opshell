<template>
  <table id="regionTable" class="table table-sm table-condensed">
    <thead>
      <tr id="regionSettingsHeader">
        <th colspan="2">
          <input id="instanceSearch" v-on:keyup="instanceSearch()" class="form-control input-sm" placeholder="Search instances"></input>
        </th>
        <th>
        </th>
        <th colspan="3">
          <i v-on:click="regionSettings()" class="fa fa-cog fa-2x pull-right" title="Region Settings"></i>
        </th>
      <tr id="regionHeaders">
        <th v-on:click="doSort('name')">Name <i id='nameSort'></i></th>
        <th v-on:click="doSort('instanceId')">Instance ID <i id='instanceIdSort'></i></th>
        <th v-on:click="doSort('instanceType')">Instance Type <i id='instanceTypeSort'></i></th>
        <th v-on:click="doSort('state')">State <i id='stateSort'></i></th>
        <th v-on:click="doSort('publicIp')">Public IP <i id='publicIpSort'></i></th>
        <th v-on:click="doSort('privateIp')">Private IP <i id='privateIpSort'></i></th>
      </tr>
    </thead>
    <tbody v-for="instance in instanceData" v-bind:key="instance.instanceId">
      <tr class="instanceData" v-on:click="toggleDetails(instance.instanceId)">
        <td>
          <i :id="'caret' + instance.instanceId" class="fa fa-caret-right"></i> &nbsp;
          {{ instance.name }}
        </td>
        <td>{{ instance.instanceId }}</td>
        <td>{{ instance.instanceType }}</td>
        <td>{{ instance.state }} </td>
        <td>{{ instance.publicIp }}</td>
        <td>{{ instance.privateIp }}</td>
      </tr>
      <tr :id="instance.instanceId" style="display: none">
        <td colspan=7>
          SSH Connect as
          <select class="select" :id="'sshUser' + instance.instanceId">
            <option v-if="user === instance.defaultUser" selected="selected" v-for="user in awsUsers" :value="user" :key="user">{{ user }}</option>
            <option v-if="user !== instance.defaultUser" v-for="user in awsUsers" :value="user" :key="user">{{ user }}</option>
          </select>
          to
          <select class="select" :id="'sshIp' + instance.instanceId">
            <option v-if="instance.privateIp && instance.privateIp === instance.defaultIP" selected="selected" :value="instance.privateIp">Private IP</option>
            <option v-if="instance.privateIp && instance.privateIp !== instance.defaultIP" :value="instance.privateIp">Private IP</option>
            <option v-if="instance.publicIp && instance.publicIp === instance.defaultIp" selected="selected" :value="instance.publicIp">Public IP</option>
            <option v-if="instance.publicIp && instance.publicIp !== instance.defaultIp" :value="instance.publicIp">Public IP</option>
          </select>
          <select v-if="awsRegion.useBastion && awsRegion.bastionHost != instance.instanceId" class="select" :id="'sshBastion' + instance.instanceId">
            <option value="1">Using Bastion Host</option>
            <option value="0">Not Using Bastion Host</option>
          </select>
          <button class="btn btn-success btn-sm" style="cursor: pointer; font-size: 11px; padding: 1px 5px" v-on:click="ssh(instance)">Open SSH Connection</button>
        </td>
      </tr>
    </tbody>
    <tbody id="regionError">
      <tr>
        <td colspan=7 id="regionErrorMessage">
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { ipcRenderer } from 'electron';
import AWS from 'aws-sdk';
import _ from 'lodash';
export default {
  name: 'awsRegion',
  data: function() {
    return {
      awsUsers: [
        'ec2-user',
        'ubuntu',
        'centos',
        'root'
      ],
      orgId: null,
      awsRegionId: null,
      instances: [],
      instanceData: [],
      test: null,
      tab: null,
      awsRegion: null,
      org: null,
      rendered: false,
      tempData: [],
      sortKey: null,
      sortDir: null
    };
  },
  mounted: function () {
    ipcRenderer.on('updateTabData', (e, data) => {
      if (data.tab === this.tab) {
        this.getData();
      }
    });
    ipcRenderer.on('regionData', (e, data) => {
      if (this.rendered === false) {
        this.tab = data.tab;
        this.awsRegionId = data.awsRegion;
        this.orgId = data.org;
        this.rendered = true;
        this.getData(() => {
          this.regionData();
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
      $('#regionHeaders i').removeClass('fa fa-caret-down fa-caret-up');
      if (this.sortDir === 'asc') {
        $('#regionHeaders #' + field + 'Sort').addClass('fa fa-caret-down');
      } else {
        $('#regionHeaders #' + field + 'Sort').addClass('fa fa-caret-up');
      }
      this.instanceData = _.orderBy(this.instanceData, [instance => instance[field].toLowerCase()], [this.sortDir]);
    },

    /**
     * Get data form Db
     */
    getData: async function(cb) {
      this.org = await this.$db.orgs.cfindOne({ _id: this.orgId }).exec();
      this.awsRegion = await this.$db.awsRegions.cfindOne({_id: this.awsRegionId}).exec();
      const tempData = await this.$db.tempData.cfind({org: this.orgId, region: this.awsRegionId, type: 'region'}).exec();
      this.tempData = new Map(tempData.map(element => [element.name, element]));
      _.each(this.awsRegion.keys, (key) => {
        if (key.custom) {
          this.awsUsers.push(key.keyName);
        }
      });
      if (typeof (cb) === 'function') {
        cb();
      }
    },

    /**
     * Open up region settings modal
     */
    regionSettings: function() {
      ipcRenderer.send('regionSettings', {org: this.orgId, awsRegion: this.awsRegionId, instances: this.instances, tab: this.tab});
    },

    /**
     * Show details for a specific instance row
     */
    toggleDetails: function(instanceId) {
      if ($('#tab' + this.tab + ' #caret' + instanceId).hasClass('fa-caret-right')) {
        $('#tab' + this.tab + ' #' + instanceId).show();
        $('#tab' + this.tab + ' #caret' + instanceId).removeClass('fa-caret-right').addClass('fa-caret-down');
      } else {
        $('#tab' + this.tab + ' #' + instanceId).hide();
        $('#tab' + this.tab + ' #caret' + instanceId).removeClass('fa-caret-down').addClass('fa-caret-right');
      }
    },

    /**
     * Initiate an SSH connection in a new tab
     */
    ssh: async function(instance) {
      let bastionHost;
      if ($('#sshBastion' + instance.instanceId).val()) {
        _.each(this.instances, (inst) => {
          if (this.awsRegion.bastionHost === inst.instanceId) {
            bastionHost = inst;
          }
        });
      }
      const data = {
        type: 'ssh',
        org: this.orgId,
        awsRegion: this.awsRegionId,
        instance: instance,
        tab: instance.tab,
        user: $('#sshUser' + instance.instanceId).val(),
        ip: $('#sshIp' + instance.instanceId).val(),
        bastionHost: bastionHost
      };
      const newTemp = {
        instanceId: instance.instanceId,
        name: instance.name,
        org: this.orgId,
        region: this.awsRegionId,
        type: 'region',
        user: data.user,
        ip: data.ip
      };
      await this.$db.tempData.update(
        {
          org: this.orgId,
          region: this.awsRegionId,
          type: 'region',
          instanceId: instance.instanceId
        },
        newTemp,
        { upsert: true });
      this.getData();
      ipcRenderer.send('openTab', data);
    },
    regionData: function() {
      const vue = this;
      $('#regionError').hide();
      $('#regionErrorMessage').html('');

      AWS.config.update({
        region: this.awsRegion.region,
        accessKeyId: this.awsRegion.accessKey,
        secretAccessKey: this.awsRegion.secretKey
      });

      const ec2 = new AWS.EC2();
      ec2.describeInstances(function(err, data) {
        if (err) {
          $('#regionError').show();
          $('#regionErrorMessage').html(err.message);
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
              const tempData = vue.tempData.get(instance.name);
              instance.defaultUser = tempData ? tempData.user : vue.awsRegion.defaultUser;
              instance.defaultIp = tempData ? tempData.ip : null;
            });
            instances.push(instance);
          });
          vue.instances = instances;
          vue.instanceData = vue.instances;
          vue.doSort();
        }
      });
    }
  }
};
</script>
<style>
@import '../../assets/css/awsregion.css'
</style>
