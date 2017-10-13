<template>
  <div class="col" id="left-menu">
    <i v-on:click="toggleOrg" class="fa fa-building-o fa-2x" title="Organizations"></i>
    <!-- <i data-target="#cloudSettings" data-toggle="modal" class="fa fa-cloud-download fa-lg" title="Cloud Settings" /> -->
    <i v-if="!newVersion" v-on:click="openGithub" class="fa fa-github fa-2x" title="Github Repo"></i>
    <span v-if="newVersion" title="Newer version available" class="fa-stack">
      <i class="fa fa-star fa-stack" style="font-size: 1em !important; color: gold; position: absolute; margin-top: 3px; margin-left: 18px;"></i>
      <i class="fa fa-github fa-stack-2x"></i>
    </span>
  </div>
</template>
<script>
import { ipcRenderer, shell } from 'electron';
import request from 'request';
import compareVersion from 'compare-versions';
export default {
  name: 'leftMenu',
  data: function() {
    return {
      newVersion: false
    };
  },
  mounted: function() {
    $('#leftMenuExpanded').hide();
    const vue = this;
    var url = 'http://opshelldownloads.ricktbaker.com/release.json';
    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var pjson = require('../../../package.json');
        if (compareVersion(body.version, pjson.version) > 0) {
          vue.newVersion = true;
        }
      } else {
        console.log(error);
      }
    });
  },
  methods: {
    toggleOrg() {
      $('#leftMenuExpanded').toggle();
      if ($('#leftMenuExpanded').is(':visible')) {
        $('#mainView').css('padding-left', '245px');
        $('#mainView #tabs').css('width', '80vw');
      } else {
        $('#mainView').css('padding-left', '45px');
        $('#mainView #tabs').css('width', '95vw');
      }
      ipcRenderer.send('orgMenuToggle');
    },
    openGithub: () => {
      shell.openExternal('https://github.com/ricktbaker/opshell');
    }
  }
};
</script>

<style>
@import '../assets/css/leftmenu.css'
</style>
