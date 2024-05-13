// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Helpers = require('core/helpers');
  var Origin = require('core/origin');

  Origin.on('origin:dataReady', function init() {
    Origin.on('editor:contentObject', function(data) {
      if(data.action !== 'edit') renderPublishButton(data);
    });
  });

  function renderPublishButton(data) {
    var viewEventName = 'editor' + data.type[0].toUpperCase() + data.type.slice(1);
    Origin.once(viewEventName + ':postRender', function() {
      const $btn = '<button type="button" class="editor-sidebar-publish action-secondary"><span class="publish">Publish</span><span class="publishing display-none">Publishing...</span></button>';
      $('.editor-common-sidebar-download').after($btn);
      $btn.click(handlePublish);
    });
  }

  function handlePublish(event) {
    $(event.currentTarget).blur();
    if($(event.currentTarget).attr('data-isdisabled')) {
      return Origin.Notify.alert({
        type: 'info',
        text: Origin.l10n.t('app.publishdisabled')
      });
    }
    Helpers.validateCourseContent(Origin.editor.data.course, function(error, isValid) {
      if(!isValid) {
        Origin.Notify.alert({ type: 'error', text: error.message });
        return;
      }
      $('.editor-sidebar-publish .publish').addClass('display-none');
      $('.editor-sidebar-publish .publishing').removeClass('display-none');

      $.post('/api/adapt/websitebuild' + Origin.editor.data.course.get('_id'), function(jqXHR, textStatus, errorThrown) {
        $('.editor-sidebar-publish .publishing').addClass('display-none');
        $('.editor-sidebar-publish .publish').removeClass('display-none');
        Origin.Notify.alert({
          type: 'success',
          text: Origin.l10n.t('app.publishsuccess')
        });
      }).fail(function (jqXHR, textStatus, errorThrown) {
        Origin.Notify.alert({
          type: 'error',
          text: jqXHR.responseText
        });
      });
    });
  }
});