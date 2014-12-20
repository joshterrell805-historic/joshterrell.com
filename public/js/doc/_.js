$(document).ready(function() {
var session = JSON.parse(window.session);
if (!session)
  return;

PageActions.add({id: 'edit', href: 'javascript:doc.edit()', tooltip: 'Edit'});
PageActions.add({id: 'view', href: 'javascript:doc.view()', tooltip: 'View'});
PageActions.add({id: 'private', href: 'javascript:doc.setPrivate(true)',
    tooltip: 'Make Private'});
PageActions.add({id: 'public', href: 'javascript:doc.setPrivate(false)',
    tooltip: 'Make Public'});
PageActions.add({id: 'delete', href: 'javascript:doc.delete()',
    tooltip: 'Delete'});
PageActions.enable('edit');
PageActions.enable(doc.private ? 'public' : 'private');
PageActions.enable('delete');
doc.setPrivate = setPrivate;
doc.delete = deleteDoc;
doc.edit = edit;
doc.view = view;

window.editor = CodeMirror.fromTextArea(
    document.getElementById("code"), {
  lineNumbers: true,
  mode: "gfm",
  keyMap: "vim",
  matchBrackets: true,
  showCursorWhenSelecting: true,
  autofocus: true,
  lineWrapping: true,
  theme: "twilight",
});
window.editor.getDoc().on('change', updateBackend);
editor.getDoc().setValue(doc.body);

$('#editor > .title').on('input', updateBackend);

function setPrivate(bool) {
  doc.private = bool;
  updateBackend();
  if (doc.private) {
    PageActions.disable('private');
    PageActions.enable('public');
  } else {
    PageActions.disable('public');
    PageActions.enable('private');
  }
}
function deleteDoc() {
  if (deleteDoc.deleting) return;
  deleteDoc.deleting = true;
  if (confirm("Delete the doc?") && confirm("Fasho-fasho??")) {
    $.ajax({
      type: 'DELETE',
      url: '/api/doc?id=' + doc.id,
      beforeSend: function(response) {
        response.setRequestHeader('csrf', $.cookie('csrf'));
      },
      success: onSuccess,
      error: onError,
      processData: false,
      datatype: 'text'
    });
    function onSuccess(data, textStatus, xhr) {
      window.location = '/';
    }
    function onError(xhr, textStatus) {
      alert('error updating server!');
      console.error(xhr.responseText);
    }
  } else {
    deleteDoc.deleting = false;
  }
}
function edit() {
  $('#view').addClass('hidden');
  $('#editor').removeClass('hidden');
  PageActions.disable('edit');
  PageActions.enable('view');
  editor.refresh();
  editor.focus();
  $('#content').addClass('rem-height-100');
  $('#header').addClass('rem-height-auto');
  $('body').addClass('rem-height-container');
  $('#content > .doc').css('height', '100%');

  $('#editor').addClass('rem-height-container');
  $('#editor > .title').addClass('rem-height-auto');
  $('#editor > .CodeMirror').addClass('rem-height-100');
  $(window).trigger('resize');
}
function view() {
  $('#editor').addClass('hidden');
  $('#view').removeClass('hidden');
  PageActions.disable('view');
  PageActions.enable('edit');
  $('#content').removeClass('rem-height-100');
  $('#header').removeClass('rem-height-auto');
  $('body').removeClass('rem-height-container');
  $('#content > .doc').css('height', '');
  $('#doc').css('height', '');
  $('#content').css('height', '');
}


function updateBackend() {
  if (updateBackend.updating_)
    return;

  updateBackend.updating_ = true;

  doc.old_hash = doc.hash;
  doc.category = null;
  doc.title = $('#editor > .title').text();
  doc.private = doc.private;
  doc.body = editor.getDoc().getValue();
  doc.hash = md5(doc.title + doc.body + (doc.category?doc.category:'NULL') +
    (doc.private?'TRUE':'FALSE'));

  if (doc.old_hash == doc.hash) {
    updateBackend.updating_ = false;
    return;
  }

  $.ajax({
    type: 'POST',
    url: '/api/doc',
    data: JSON.stringify(doc),
    beforeSend: function(response) {
      response.setRequestHeader('csrf', $.cookie('csrf'));
    },
    success: onSuccess,
    error: onError,
    processData: false,
    datatype: 'text'
  });
  function onSuccess(data, textStatus, xhr) {
    data = JSON.parse(data);
    if (!data.success) throw new Error('expected success');
    $("#view").html(data.rendered);
    setTimeout(function() {
      doc.old_hash = doc.hash;
      updateBackend.updating_ = false;
      updateBackend();
    },
    1000); // don't want this getting sent too often
  }
  function onError(xhr, textStatus) {
    alert('error updating server!');
    console.error(xhr.responseText);
  }
}
});
