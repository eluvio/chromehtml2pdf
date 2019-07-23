#!/usr/bin/env node

const program = require('commander');
const puppeteer = require('puppeteer');

var url = undefined;

program
  .version('1.0.5')
  .arguments('<url>')
  .option('-o, --out <path>', 'Output file name.')
  .option('-s, --no-sandbox', 'Disable chrome sandbox.')
  .option('-t, --timeout <millis>', 'Specify a timeout (in milliseconds).  Defaults to 30 seconds, pass 0 to disable timeout.', parseInt, 30000)
  .option('-j, --disable-javascript', 'Whether to disable JavaScript on the page.  Defaults to enabled.')
  .option('-p, --executable-path <value>', 'If you don\'t want to use the chromium that is packaged with puppeteer, enter the full path to the executable you want here.')
  .option(' --landscape','Whether or not to print in landscape mode. Defaults to false.')
  .option(' --displayHeaderFooter','Display header and footer. Defaults to false.')
  .option(' --printBackground','Print background graphics. Defaults to false.')
  .option(' --scale <n>','Scale of the webpage rendering. Defaults to 1.', parseFloat)
  .option(' --width <n>','Paper width with units. Defaults to 8.5 inches.', parseFloat)
  .option(' --height <n>','Paper height with units. Defaults to 11 inches.', parseFloat)
  .option(' --format <value>', 'Format of page. This takes precedence over height/width. Options are Letter: 8.5in x 11in\n'+
    'Legal: 8.5in x 14in\n'+
    'Tabloid: 11in x 17in\n'+
    'Ledger: 17in x 11in\n'+
    'A0: 33.1in x 46.8in\n'+
    'A1: 23.4in x 33.1in\n'+
    'A2: 16.5in x 23.4in\n'+
    'A3: 11.7in x 16.5in\n'+
    'A4: 8.27in x 11.7in\n'+
    'A5: 5.83in x 8.27in\n'+
    'A6: 4.13in x 5.83in\n')
  .option(' --marginTop <inches>','Top margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --marginBottom <inches>','Bottom margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --marginLeft <inches>','Left margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --marginRight <inches>','Right margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --pageRanges <range>','Paper ranges to print, e.g., \'1-5, 8, 11-13\'. Defaults to the empty string, which means print all pages.')
  .option(' --headerTemplate <html>','HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: - date - formatted print date - title - document title - url - document location - pageNumber - current page number - totalPages - total pages in the document For example, would generate span containing the title.')
  .option(' --footerTemplate <html>','HTML template for the print footer. Should use the same format as the `headerTemplate`.')
  .action(function(urlArg){
    url = urlArg;
  });
  
program.parse(process.argv);
  
console.log('Converting file: %s', url);

if (!program.out) {
  console.log("You need to include a parameter --out to hold the output file name.");
  process.exit(1);
}

const pdfOptions = {
  path: program.out,
  scale: program.scale,
  displayHeaderFooter: program.displayHeaderFooter,
  headerTemplate: program.headerTemplate,
  footerTemplate: program.footerTemplate,
  printBackground: program.printBackground,
  landscape: program.landscape,
  pageRanges: program.pageRanges,
  format: program.format,
  width: program.width,
  height: program.height,
};

if (program.marginTop || program.marginRight || program.marginBottom || program.marginLeft) {
  pdfOptions.margin = {
    top: program.marginTop,
    right: program.marginRight,
    bottom: program.marginBottom,
    left: program.marginLeft
  };
}

// Get the page to create the PDF.
(async () => {
  try {
    var launchConfig = {};
    
    if (!program.sandbox) {
      console.log('Warning: running chrome without sandbox');
      launchConfig.args = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    if (program.executablePath) {
      console.log('Using chrome executable: '+program.executablePath);
      launchConfig.executablePath = program.executablePath;
    }

    const browser = await puppeteer.launch(launchConfig);
    const page = await browser.newPage();

    page.setJavaScriptEnabled(program.disableJavascript ? false : true);

    await page.goto(url, {
      timeout: program.timeout,
      waitUntil: 'networkidle0'
    });

    await page.pdf(pdfOptions);
    await browser.close();
  } catch(e) {
    console.log(e);
    process.exit(1);
  }

})();
