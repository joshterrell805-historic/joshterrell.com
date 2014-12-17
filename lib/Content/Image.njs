module.exports = Image;

function Image() {
}

/**
 * @resolve a url for the imageId
 */
Image.get = function get(ids) {
  return Q('SELECT id, url FROM images WHERE id IN (?)', [ids]);
};
