const getPagination = (page, size) => {
    const limit = size ? +size : 3; //quantity of items to fetch
    const offset = page ? (page - 1) * limit : 0; //quantity of items to skip
    
    return { limit, offset };
  };
  
  const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: Data } = data;
     const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);
     return { totalItems, Data, totalPages, currentPage };
  };
  
  module.exports = {
    getPagination,
    getPagingData
  }