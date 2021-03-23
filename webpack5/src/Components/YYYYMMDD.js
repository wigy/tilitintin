const YYYYMMDD = (props) => {

  var d = new Date(props.date);

  var month = '' + (d.getMonth() + 1);

  var day = '' + d.getDate();

  var year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export default YYYYMMDD;
