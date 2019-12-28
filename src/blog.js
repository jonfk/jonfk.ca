const path = require("path");
const parse = require("date-fns/parse");
var isValid = require("date-fns/isValid");

const DATE_FORMAT = "yyyy-MM-dd";

exports.createPageSlug = function createPageSlug(filename) {
  let filenameWithoutExt = path.parse(filename).name;
  let dateStr = filenameWithoutExt.substring(0, 10);
  let date = parse(dateStr, DATE_FORMAT, new Date());
  if (isValid(date)) {
    let postName = filenameWithoutExt.substring(11);
    return {
      slug: `/${dateStr}/${postName}`,
      date: date,
    };
  } else {
    throw `Post did not match filename format 'yyyy-MM-dd-post-name'`;
  }
};
