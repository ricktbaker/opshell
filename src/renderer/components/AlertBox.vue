<template>
  <div id="alertBox" class="alert alert-error">
    <span id="msg"></span>
    <button type="button" class="btn btn-danger btn-sm pull-right" data-dismiss="alert">Dismiss</button>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron';
export default {
  name: 'alertBox',
  mounted: function() {
    $('#alertBox').hide();
    ipcRenderer.on('showAlert', (e, msg) => {
      $('#alertBox #msg').html(msg);
      $('#alertBox').show();
    });
  },
  methods: {
  }
};
</script>

<style>
@import '../assets/css/alertbox.css'
</style>
