// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');

  Origin.on('editor:contentObject', data => setTimeout(() => updateButtons(data), 50));

  async function updateButtons(data) {
    Origin.contentHeader.setButtons(Origin.contentHeader.BUTTON_TYPES.ACTIONS, [{ 
      items: [
        {
          id: 'preview',
          buttonText: 'Preview site',
        },
        {
          id: 'publish-to-web',
          buttonText: 'Publish to web',
          buttonClass: 'action-secondary'
        }
      ] 
    }]);

    Origin.on('actions:publish-to-web', async () => {
      const { SweetAlert } = Origin.Notify.alert({ 
        type: 'info',
        title: 'Publishing',
        text: 'Publishing website, please wait.,,' 
      });
      SweetAlert.showLoading();
  
      try {
        await $.post('/api/adapt/websitebuild/' + Origin.editor.data.course.get('_id'), () => {
          Origin.Notify.alert({ 
            type: 'success', 
            text: Origin.l10n.t('app.publishsuccess') 
          });
        });
      } catch(e) {
        Origin.Notify.alert({ 
          type: 'error', 
          text: e.responseJSON.message 
        });
      }
    });
  }
});
