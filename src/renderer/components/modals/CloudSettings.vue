<template>
  <div class="modal" id="cloudSettings" tabindex="-1" role="dialog" aria-labelledby="cloudSettingslLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cloud Settings</h5>
          <i class="fa fa-times-circle-o" style="cursor: pointer; padding: 3px 0" arial-label="Close" data-dismiss="modal"></i>
          </a>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group row">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <i class="fa fa-hand-stop-o"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'cloudSettings',
  mounted: function() {
    $('#cloudSettings .modal-footer').hide();
  },
  methods: {
  }
};
</script>
