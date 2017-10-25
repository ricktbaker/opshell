<template>
  <div class="col" id="leftMenuExpanded">
    <div class="header">
      ORGANIZATIONS &nbsp;
      <span v-on:click="newOrg()">
        <i class="fa fa-plus fa-lg" title="Add New Organization"></i>
      </span>
    </div>
    <div class="select">
      <select v-on:change="changeOrg" class="orgSelect" name="selectedOrg" v-model="selected">
        <option value="" selected="selected">Select Organization</option>
        <option v-for="org in orgs" :value="org._id" :key="org._id">{{ org.name }}</option>
      </select>
    </div>

    <div id="orgDetails" class="details" v-if="orgDetails">
      <div id="orgMenu">
        <button v-on:click="orgSettings" class="btn btn-sm btn-default">
          <i class="fa fa-cog"></i>
          Configure Org
        </button>
      </div>

      <span v-if="awsRegionCount > 0">
        <span style="cursor: pointer" v-on:click="toggleCaret('awsRegion')">
        <i id="awsRegionCaret" class="fa" v-bind:class="{'fa-caret-right':awsRegionContent === false,'fa-caret-down':awsRegionContent === true}"></i> AWS Regions
        <span style="float: right">({{awsRegionCount}})</span><br />
        </span>
        <div class="cloudServiceContent" v-if="awsRegionContent === true">
          <div v-on:click="openTab('cloudService', 'awsRegion', cloudService._id)" v-for="cloudService in cloudServices" v-if="cloudService.type === 'awsRegion'" v-bind:key="cloudService._id">
            <i class="fa fa-cloud"></i>
            {{cloudService.identifier}}
          </div>
        </div>
      </span>

      <span v-if="googleProjectCount > 0">
        <span style="cursor: pointer" v-on:click="toggleCaret('googleProject')">
        <i id="googleProjectCaret" class="fa" v-bind:class="{'fa-caret-right':googleProjectContent === false,'fa-caret-down':googleProjectContent === true}"></i> Google Projects
        <span style="float: right">({{googleProjectCount}})</span><br />
        </span>
        <div class="cloudServiceContent" v-if="googleProjectContent === true">
          <div v-on:click="openTab('cloudService', 'googleProject', cloudService._id)" v-for="cloudService in cloudServices" v-if="cloudService.type === 'googleProject'" v-bind:key="cloudService._id">
            <i class="fa fa-cloud"></i>
            {{cloudService.identifier}}
          </div>
        </div>
      </span>

    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { ipcRenderer } from 'electron';

export default {
  name: 'orgMenu',
  data: function() {
    return {
      org: {},
      cloudServices: [],
      orgs: [],
      test: [],
      selected: '',
      orgDetails: false,
      awsRegionCount: 0,
      googleProjectCount: 0,
      awsRegionContent: false,
      googleProjectContent: false
    };
  },
  mounted: function() {
    ipcRenderer.on('orgmenu.updateSelectBox', this.updateOrgs);
    ipcRenderer.on('orgmenu.updateSelectedOrg', this.changeOrg);
    this.awsRegionContent = false;
    this.googleProjectContent = false;
  },
  methods: {
    newOrg: function() {
      ipcRenderer.send('alertbox.show', {type: 'newOrg'});
    },
    openTab: function(type, cloud, value) {
      const data = {};
      if (type === 'cloudService') {
        data.org = this.org._id;
        data.type = 'cloudService';
        data.cloudType = cloud;
        data.cloudId = value;
        ipcRenderer.send('mainview.openTab', data);
      }
    },
    toggleCaret: function(type, close) {
      if (type === 'awsRegion') {
        if (this.awsRegionContent || close) {
          this.awsRegionContent = false;
        } else {
          this.awsRegionContent = true;
        }
      } else if (type === 'googleProject') {
        if (this.googleProjectContent || close) {
          this.googleProjectContent = false;
        } else {
          this.googleProjectContent = true;
        }
      }
    },
    orgSettings: function() {
      const data = {};
      data.org = this.org._id;
      data.type = 'orgSettings';
      ipcRenderer.send('mainview.openTab', data);
    },
    changeOrg: async function() {
      if (this.selected !== '') {
        this.toggleCaret('awsRegion', true);
        try {
          if (!this.selected) {
            this.selected = '';
            this.orgDetails = false;
          } else {
            this.org = await this.$db.orgs.cfindOne({ _id: this.selected }).exec();
            if (this.org) {
              this.cloudServices = await this.$db.cloudServices.cfind({org: this.org._id}).exec();
              this.awsRegionCount = await this.$db.cloudServices.count({org: this.org._id, type: 'awsRegion'});
              this.googleProjectCount = await this.$db.cloudServices.count({org: this.org._id, type: 'googleProject'});
              this.orgDetails = true;
              this.awsRegionContent = false;
              this.googleProjectConect = false;
            } else {
              this.orgDetails = false;
            }
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        this.orgDetails = false;
      }
    },
    updateOrgs: async function() {
      try {
        const docs = await this.$db.orgs.cfind().sort({ name: 1 }).exec();
        if (docs.length > 0) {
          this.orgs = [];
          _.each(docs, (org) => {
            if (org) {
              const minimal = {
                _id: org._id,
                name: org.name
              };
              this.orgs.push(minimal);
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
};
</script>


<style>
@import '../assets/css/orgmenu.css'
</style>
