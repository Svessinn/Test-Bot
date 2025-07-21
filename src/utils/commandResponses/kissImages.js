const responses = [
  "https://i.pinimg.com/originals/1f/53/eb/1f53eb3746f94327ca310decffa1aa72.gif",
  "https://c.tenor.com/images/32dd9fafc79ea89f3e73ccd11cdd9668/tenor.gif?itemid=17590301",
  "https://c.tenor.com/images/c4878b4a83169cdc2ce8c1eb08e23394/tenor.gif?itemid=10356310",
  "https://c.tenor.com/images/0e730944f918d06f633762e0b18fea4c/tenor.gif?itemid=13287971",
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExODVlMjI5ZjQ1ZmRjMGRlYjQxNDIxNWY1YWUxMDZlZWEwYmY2MDNhMyZjdD1n/flmwfIpFVrSKI/giphy.gif",
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTkyOWI4ZGVkOTBmNGJkYjU2ZmI4ODk3MmU4NzhlYmE4OWQ5ODA3YyZjdD1n/zkppEMFvRX5FC/giphy.gif",
  "https://media.tenor.co/images/4b5d5afd747fe053ed79317628aac106/raw",
];

/**
 * @return {String}
 */

module.exports = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};
