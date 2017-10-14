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
      <span style="cursor: pointer" v-on:click="toggleCaret('awsRegion')">
      <i id="awsRegionCaret" class="fa" v-bind:class="{'fa-caret-right':awsRegionContent === false,'fa-caret-down':awsRegionContent === true}"></i> AWS Regions
      <span style="float: right">({{awsRegions.length}})</span><br />
      </span>
      <div id="awsRegionContent" v-if="awsRegionContent === true">
        <div v-on:click="openTab('awsRegion',awsRegion._id)" v-for="awsRegion in awsRegions" v-bind:key="awsRegion._id">
          <i class="fa fa-cloud"></i>
          {{awsRegion.region}}
        </div>
      </div>
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
      awsRegions: [],
      orgs: [],
      test: [],
      selected: '',
      orgDetails: false,
      awsRegionContent: false
    };
  },
  mounted: function() {
    ipcRenderer.on('orgmenu.updateSelectBox', this.updateOrgs);
    ipcRenderer.on('orgmenu.updateSelectedOrg', this.changeOrg);
    this.awsRegionContent = false;
  },
  methods: {
    newOrg: function() {
      ipcRenderer.send('alertbox.show', {type: 'newOrg'});
    },
    openTab: function(type, value) {
      const data = {};
      if (type === 'awsRegion') {
        data.org = this.org._id;
        data.type = type;
        data.awsRegion = value;
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
              this.awsRegions = await this.$db.awsRegions.cfind({org: this.org._id}).exec();
              this.orgDetails = true;
              this.awsRegionContent = true;
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
