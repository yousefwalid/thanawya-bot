const superagent = require('superagent');
const fs = require('fs');
const cliProgress = require('cli-progress');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const url = new URL('https://natega.youm7.com/Home/Result');

const getResult = async function (seatingNo) {
  try {
    const response = await superagent
      .post(url)
      .send({
        seating_no: String(seatingNo),
      })
      .set('content-type', 'application/x-www-form-urlencoded')
      .set('referer', 'https://natega.youm7.com/');

    const doc = new JSDOM(response.text).window.document;
    return {
      id: doc.querySelector('#pills-tab > li:nth-child(1) > h1').textContent,
      name: doc.querySelector(
        '#pills-tab > li:nth-child(1) > span:nth-child(2)'
      ).textContent,
      totalMarks: doc.querySelector('#pills-tab > li:nth-child(2) > h1')
        .textContent,
      precentage: doc.querySelector('#pills-tab > li:nth-child(3) > h1')
        .textContent,
      school: doc.querySelector(
        '#pills-tab > li:nth-child(2) > span:nth-child(2)'
      ).textContent,
      division: doc.querySelector(
        '#pills-tab > li:nth-child(7) > span:nth-child(2)'
      ).textContent,
    };
  } catch (error) {
    return 'null';
  }
};

results = [];

(async function () {
  if (process.argv.length !== 4) {
    console.error('Please provide launch arguments');
    return;
  }

  let start = Number(process.argv[2]);
  let end = Number(process.argv[3]);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(end - start, 0);

  const time1 = Date.now();

  for (let i = start; i <= end; i++) {
    const result = await getResult(i);
    results.push(result);
    bar.increment();
  }

  bar.stop();

  const time2 = Date.now();

  console.log('Fetching took ', (time2 - time1) / 1000, ' seconds');

  await fs.writeFileSync('data.json', JSON.stringify(results, null, 4));

  console.log('Done writing data');
})();
