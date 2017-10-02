<template>
  <div class="modal" id="addOrgModal" tabindex="-1" role="dialog" aria-labelledby="addOrgModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Organization</h5>
          <i class="fa fa-times-circle-o" style="cursor: pointer; padding: 3px 0" arial-label="Close" data-dismiss="modal"></i>
          </a>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group row">
              <div class="col-sm-10">
                <input type="text" class="form-control input-sm" id="orgName" placeholder="Organization Name">
              </div>
              <label for="inputEmail3" class="col-sm col-form-label">
                <button type="button" v-on:click="add" class="btn btn-success btn-sm">Add</button>
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <i class="fa fa-hand-stop-o"></i>
          </a> &nbsp; Organization already exists! &nbsp; &nbsp;
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  name: 'newOrgModal',
  mounted: function() {
    $('.modal-footer').hide();
  },
  methods: {
    async add() {
      $('.modal-footer').hide();
      const docs = await this.$db.orgs.cfind({ name: $('#orgName').val() }).exec();
      if (docs.length < 1) {
        let doc = {
          name: $('#orgName').val(),
          aws: [
          ]
        };
        const newDoc = await this.$db.orgs.insert(doc);
        ipcRenderer.send('updateOrgSelect');
        $('#addOrgModal').modal('hide');
        ipcRenderer.send('orgSettings', newDoc._id);
      } else {
        $('.modal-footer').show();
      }
    }
  }
}
</script>
