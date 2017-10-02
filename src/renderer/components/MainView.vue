<template>
  <div class="col" id="mainView">
    <ul class="nav nav-tabs" role="tablist" id="tabs">
      <li v-for="tab in tabs" class="nav-item" v-bind:key="tab.id">
        <a class="nav-link" role="tab" :href="'#tab' + tab.id" data-toggle="tab">
          <table class="navtable">
            <tr>
              <td class="tabicon">
                 <i :class="'fa ' + tab.icon"></i>
              </td>
              <td class="tabname">
                <span>
                  {{ tab.org }}
                </span>
                <br />
                <span>
                  {{ tab.name }}
                </span>
              </td>
              <td class="tabicon">
                <i v-on:click="closeTab(tab.id)" class="fa fa-close"></i>
              </td>
            </tr>
          </table>
        </a>
      </li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
      <div v-for="tab in tabs" v-bind:key="tab.id" role="tabpanel" class="tab-pane fade" :id="'tab' + tab.id">
        <awsRegion v-if="tab.type === 'awsRegion'"></awsRegion>
        <sshConnection class="terminal" v-if="tab.type === 'ssh'"></sshConnection>

      </div>
    </div>
  </div>
</template>

<script>

import { ipcRenderer } from 'electron';
import AwsRegion from './tabs/AwsRegion.vue';
import SshConnection from './tabs/SshConnection.vue';

export default {
  name: 'mainView',
  data: function() {
    return {
      tabs: [],
      tabCount: 0,
      type: null
    };
  },
  mounted: function() {
    ipcRenderer.on('openTab', async (e, data) => {
      const org = await this.$db.orgs.cfindOne({ _id: data.org }).exec();
      const awsRegion = await this.$db.awsRegions.cfindOne({_id: data.awsRegion}).exec();
      const obj = {
        id: this.tabCount,
        type: data.type,
        tab: this.tabCount
      };
      if (data.type === 'awsRegion') {
        obj.org = org.name;
        obj.name = awsRegion.region;
        obj.icon = 'fa-cloud';
      } else if (data.type === 'ssh') {
        obj.org = org.name;
        obj.name = data.instance.name;
        obj.icon = 'fa-server';
      }
      this.tabs.push(obj);
      setTimeout(() => {
        $('.nav-tabs a:last').tab('show');
      }, 1000);

      data.tab = this.tabCount;
      this.tabCount += 1;

      if (data.type === 'awsRegion') {
        ipcRenderer.send('regionData', data);
      } else if (data.type === 'ssh') {
        ipcRenderer.send('doSsh', data);
      }
    })
  },
  components: {
    AwsRegion, SshConnection
  },
  methods: {
    closeTab: function(tabId) {
      if (this.tabs.length === 1) {
        this.tabs = [];
      } else {
        this.tabs = this.tabs.filter(function(tab) {
          return tab.id !== tabId;
        })
      }
      setTimeout(() => {
        $('.nav-tabs a:last').tab('show');
      }, 1000);
    }
  }
}
</script>
<style>
@import '../assets/css/mainview.css'
</style>
