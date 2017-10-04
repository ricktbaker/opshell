<template>
  <div class="col" id="left-menu">
    <i v-on:click="toggleOrg" class="fa fa-building-o fa-lg" title="Organizations"></i>
    <!-- <i data-target="#cloudSettings" data-toggle="modal" class="fa fa-cloud-download fa-lg" title="Cloud Settings" /> -->
  </div>
</template>
<script>
import { ipcRenderer } from 'electron';
export default {
  name: 'leftMenu',
  methods: {
    toggleOrg() {
      $('#leftMenuExpanded').toggle();
      if ($('#leftMenuExpanded').is(':visible')) {
        $('#mainView').css('padding-left', '245px');
      } else {
        $('#mainView').css('padding-left', '45px');
      }
      ipcRenderer.send('orgMenuToggle');
    }
  }
};
</script>

<style>
@import '../assets/css/leftmenu.css'
</style>
