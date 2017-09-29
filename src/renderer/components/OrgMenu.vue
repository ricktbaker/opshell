<template>
  <div class="col" id="leftMenuExpanded">
    <div class="header">
      ORGANIZATIONS &nbsp;
      <span data-target="#addOrgModal" data-toggle="modal">
        <i class="fa fa-plus fa-lg" title="Add New Organization"></i>
      </span>
    </div>
    <div class="select">
      <select v-on:change="changeOrg" class="orgSelect" name="selectedOrg" v-model="selected._id">
        <option value="">Select Organization</option>
        <option v-for="org in orgs" :value="org._id" :key="org._id">{{ org.name }}</option>
      </select>
    </div>

    <div id="orgDetails" class="details">
      <div id="orgSettings">
        <button v-on:click="orgSettings" class="btn btn-sm">
          <i class="fa fa-cog"></i>
          Configure Org
        </button>
      </div>

      <span style="cursor: pointer" v-on:click="toggleCaret('awsRegion')">
      <i id="awsRegionCaret" class="fa fa-caret-right"></i> AWS Regions
      <span style="float: right">({{awsRegions.length}})</span><br />
      </span>
      <div id="awsRegionContent">
        <div v-on:click="openTab('awsRegion',awsRegion._id)" v-for="awsRegion in awsRegions" v-bind:key="awsRegion._id">
          <i class="fa fa-cloud"></i>
          {{awsRegion.region}}
        </div>
      </div>

      <!--
      <i class="fa fa-caret-right"></i> Servers
      <span style="float: right">({{org.servers ? org.servers.length : 0}})</span>
      -->
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { ipcRenderer } from 'electron'

export default {
  name: 'orgMenu',
  data: function() {
    return {
      org: {},
      awsRegions: [],
      orgs: [],
      test: [],
      selected: {
        _id: 'select'
      }
    }
  },
  mounted: function() {
    $('#leftMenuExpanded').hide()
    ipcRenderer.on('updateOrgSelect', this.updateOrgs)
    ipcRenderer.on('updateMenuOrg', this.changeOrg)
    $('#orgDetails').hide()
    $('#awsRegionContent').hide()
  },
  methods: {
    openTab: function(type, value) {
      const data = {}
      if (type === 'awsRegion') {
        data.org = this.org._id
        data.type = type
        data.awsRegion = value
        ipcRenderer.send('openTab', data)
      }
    },
    toggleCaret: function(type, close) {
      if ($('#' + type + 'Caret').hasClass('fa-caret-right') && !close) {
        $('#' + type + 'Caret').removeClass('fa-caret-right').addClass('fa-caret-down')
        $('#' + type + 'Content').show()
      } else {
        $('#' + type + 'Caret').removeClass('fa-caret-down').addClass('fa-caret-right')
        $('#' + type + 'Content').hide()
      }
    },
    orgSettings: function() {
      ipcRenderer.send('orgSettings', this.selected._id)
    },
    changeOrg: async function() {
      if (this.selected._id !== 'select') {
        try {
          this.org = await this.$db.orgs.cfindOne({ _id: this.selected._id }).exec()
          this.awsRegions = await this.$db.awsRegions.cfind({org: this.org._id}).exec()
          $('#orgDetails').show()
        } catch (err) {
          console.log(err)
        }
      } else {
        $('#orgDetails').hide()
      }
    },
    updateOrgs: async function() {
      try {
        const docs = await this.$db.orgs.cfind().sort({ name: 1 }).exec()
        if (docs.length > 0) {
          this.orgs = []
          _.each(docs, (org) => {
            const minimal = {
              _id: org._id,
              name: org.name
            }
            this.orgs.push(minimal)
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>


<style>
@import '../assets/css/orgmenu.css'
</style>
