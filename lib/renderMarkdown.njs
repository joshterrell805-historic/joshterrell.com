module.exports = renderMarkdown;


var marked = require('marked'),
    render = Promise.denodeify(marked),
    Image = lib('Content/Image'),
    re = /"imageId=[^"]+"/g;

function renderMarkdown() {
  return render.apply(marked, arguments).then(replaceImages);
}

function replaceImages(html) {
  var matches = html.match(re);

  if (!matches)
    return html;

  var imageIds = matches.map(function(match) {
    var imageId = match.substr('"imageId='.length);
    imageId = imageId.substr(0, imageId.length-1); // end quote
    return imageId;
  });

  return Image.get(imageIds)
  .then(function replaceSrc(images) {
    for (var i = 0; i < images.length; ++i) {
      var image = images[i];
      do {
        var newHtml = html.replace('imageId=' + image.id, image.url);
        var changed = newHtml !== html;
        html = newHtml;
      } while (changed);
    }
    return html;
  });
}
