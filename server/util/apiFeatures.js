export class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) CLONE & CLEAN
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) RESTRICT FLAT KEYS ( priority[in] -> { priority: { in: ... } })
    Object.keys(queryObj).forEach((key) => {
      if (key.includes("[") && key.includes("]")) {
        const [field, opt] = key.split("[");
        const operator = opt.replace("]", "");
        queryObj[field] = { [operator]: queryObj[key] };
        delete queryObj[key];
      }
    });

    // 3) ADD THE '$'
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`,
    );

    let parsedQuery = JSON.parse(queryStr);

    // 4) SPLIT THE ARRAY (Special Handle for $in)
    Object.keys(parsedQuery).forEach((key) => {
      if (parsedQuery[key].$in && typeof parsedQuery[key].$in === "string") {
        parsedQuery[key].$in = parsedQuery[key].$in.split(",");
      }
    });

    this.query = this.query.find(parsedQuery);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
