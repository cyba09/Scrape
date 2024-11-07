import * as cheerio from 'cheerio';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { writeFile, readFile } from 'fs';
import express from 'express'


const app = express();
const PORT = 4000;
////////////////////////////////
function saveDict(dict, filePath = 'last.json') {
    const jsonData = JSON.stringify(dict, null, 2); // Convert dict to JSON string
    writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error(`Error saving dictionary: ${err}`);
      } else {
        console.log(`Dictionary saved to ${filePath}`);
      }
    });
  }
  
  function loadDict(filePath = 'last.json') {
      return new Promise((resolve, reject) => {
        readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reject(`Error loading dictionary: ${err}`);
          } else {
            try {
              const dict = JSON.parse(data);
              resolve(dict);
            } catch (parseErr) {
              reject(`Error parsing JSON: ${parseErr}`);
            }
          }
        });
      });
    }
  
  let creds = ''
  let lastData = []
  const INTERVAL = 60000 //put delay time here 1000=> 1sec
  
  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ];
  
  const jwt = new JWT({
    email: "secscrape@secscrape-440414.iam.gserviceaccount.com",
    key:  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC4HfRcDo2HuSvT\noeWgJgcFlBDIVp9LG9EIQk8dTlis38W3LUEvsrN6BhMkHER1aEcEsK6TB++NXWHs\nrfbK6cYVyAHKq6WejmqTozFNY2QtXMwRFsIcRAOk6/dpjW1NZmTTsiv1aleINj03\nArCjorvjaejTOcVzPzLZSItKQChLi3jf/XcsfChpv7KhQUoCmTzbrEGrP2wgKYsX\nNCe/xQPG0YTRRctOYsCgBNmxq9a2M7lOtlgbH4nwXQu+Nah69mv9hFDqpyG0jf/O\noDxAG8vdmO4fOlpFWR2EZJ2D4Bygy0N+mNavjS3F6gLIhY0Jd74KgtWvk8M3mzOn\nntizdnKZAgMBAAECggEABurN/AnQuwRzwN8e2TYOIq4eAn89CHDCf4GJc8icv90l\n+KxqyL4smToFma0bzIY4nNSyfY2mLCgRyypiA9xlxJQfrrVlYu0A1HK+IguVsoQy\nmoKOk/2uKvg+jFwNR9CMzmZ6plBZFFUzvMLAgvVUz8XYqUIZyMTbRgFZ6++eU/Ay\nKHZzBEmIlnsEnuNk5fvgAU2NqiG1OnSV4dj2W02RiCfUUxY8Rk2OVi/MXIQjNo9U\nbcxj2lD+Q8PwUIJNzkowa0X0ay8jLA4slRTcCmw+g+LokrEnQ6a615rV/ro5Ma9D\nyxzn9pbnVEfsAoLpme3u3FthjPVuGUD/iQF8J6jjzQKBgQDmiAdpKtlULw6HRVS/\nwtaFd4THImPwKsW49dBcmZnxh33CpL8FoJ1fSlU+zRmPU/xXDn+za0GuECzVaY15\n2E7AE0BwZg0Dgdua5CBdrch17hXZEAUvO+yP3+Iy2zzOqMPms4d43w/jzzVHCo/S\nmRZtEhNapVT8LuizjqmPQpYR0wKBgQDMdTfXCFZG6LL3zHY4oh72Jqthh+dXV+mT\ns8HN/bscTIkhIUKSDXwIwahFH/MwKr4nTl9ae0CCcXqAmnY+K2D1j/qBOToSuGPE\nQKrME6hu0BwqH8SHglLHf9yPd/ohH/f8vwR8ny3M4wzJy6vleqN8MVMbGdJ+uRtj\ndpKPIPV6YwKBgQC2OXiCLRi1bqzxSGCBZCXmQl92eTy+L1EzrzsQt2n0fcFvBoLo\nk9lR5ZQUnFND9INW3WMcFABK8wY9e74VPmKheZZKQqCu0QsiGIltA12duqESf5NZ\njuijoblPsfUS9lxEFE1VwhzxWm0mxraBJfmQJeWelWnkHcBbjr2BPIUbeQKBgEDr\nIyzSx9pB/rlxoUQALgaIZrhUF5+DGXY9iFborqWgo5XyYpnPUEfTfaNdLrFnkPMY\nDmzDX8tLTtNQuCSrT2EJM0gerJLPG1ZwFgswXrW4vIifh55jQfd4YMbpGHG2Hd6R\npFIRlNBOc3wLgGwf0ZMYckPToiN8kPa26ngpxefzAoGBAIN//DanxWPzzVh/yHRm\n+fcamD9ClcPC+fPj4H9lwut0TtSCsNImvHnTZji0qmnjiFbMoiHG/lKFt/5LS46y\nZYAnH7ViXkYl2/iPXfuAJo4N4WjUhqmXARW+DFDb9FduF8Q+YbNe3XrO09j0JYDa\nD/4GKhmbMH7yId/Wd/fgxH9Q\n-----END PRIVATE KEY-----\n",
    scopes: SCOPES,
  });
  
  const doc = new GoogleSpreadsheet('1zy_pgkSzy9jkEFsBilRRgFFgOsbLCmQRAoN4ZFGj-88', jwt);
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[0]
  //const sheet = await doc.addSheet({ headerValues: ['name', 'email'] });
  //const sheet1 = await doc.addSheet({ headerValues: ["Name","Ticker","Relationship","Cost","Shares","Transaction","Date","Url"]})
  //const larryRow = await sheet.addRow({ name: 'john doe', email: 'john@doe.com', phone:'23453' });
  let hd = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-ZA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control': 'max-age=0',
      'cookie': 'nmstat=891756e9-a78e-9bb3-a82e-c13770ef859a; _gid=GA1.2.2109077336.1730302428; ak_bmsc=E561070C31666825D6A37762FBB9B0C6~000000000000000000000000000000~YAAQBfsTAuEvP9OSAQAAI9DU5RlE9ABBSna37tuOa7t0IN0p2CXJD2gzUiDNbFt6HH/aSjfcCd4PX+cafA/a3BBnH+0brn2CsxzD9qvEmmqv2VaFon5+1ICrl0wsGEWbH3M23/EX9Y7ayiO1BplkZeqLPi2TvpFQ6QDCsTeNWOee9TUzOHybDOX/BoPckxm4xtBPJd1vXGBZdDjSk6h+1umOVT8EtId97IJmLSpENUNtj33mH1n1ENlFbOFp801rEZ5sB2dR0plKuT7mDjhuCUszF7jwaVfU6cdNJ3/+xxYWCWfiEWbVh3txf9jLif9B/ZOe91/x3r/bYieubjmzH/y4Qrv3EvsSg2HdjDp3nBwofNABvjPT+G5EQUJdK227aWDYpeV9pRrg656AnBYDKcNOpZQDGthzTFCyC1NUQLuoqnIbIaqYJvrOxw2qK2LTHTJQ1QcikrA=; _ga=GA1.1.417854797.1730136641; _4c_=%7B%22_4c_s_%22%3A%22dZJBb5wwEIX%2FysrnhcWAwUaKomgrRTkkVaM2Pa5YewArDSDjrJuu%2BO8ZA5u2SOFi%2BOa957GHM3ENtKSgeRKlScy5wHVLnuFtIMWZGK38ciIFURWVtBRZwBSIIM2YCgTIKMhZnpWMVlVMGdmS31NWLmicJYJyNm6Jai8ZBhQMum7%2F03GapFmKOt3bRei7oUmGFZ6wlRaJ114iy3XWXDfub9RcYDlfRXmC0t6sd%2F1UKvtFeiayU4DbUxFSHkZBNWAf9o8ncUR8aKdepT3Yt97LHBw3g3rGgoKTlnBwWtlm8k%2FyhTag68Z6HPEJ%2B94IxTenW9W5tW2hHzZBBdKj6dwA3rlvTPcCG5p4cYcTJT8nh2%2FWQAXGTLLG2n4odjvnXDiADOvutJO1Do663c1hAai6NNeltLprr2qw8hW9rcWcQVt%2FwsW3APx%2FZhbM7El7qjbf94%2FIH%2F4h3%2FZf7xd0e3P4cfcFP1KK153mIg%2BXkWQpJeNlIhGjeE7B4ghv3P4iBc%2FSyD%2FjOL4D%22%7D; _ga_CSLL4ZEK4L=GS1.1.1730432782.9.1.1730433111.0.0.0; _ga_300V1CHKH1=GS1.1.1730432782.9.1.1730433111.0.0.0; bm_sv=FD6502D464788DCD475AA367FA4F63D5~YAAQBfsTAnwxP9OSAQAABQza5Rm6tj2AoywFjnwBMiGYRelv1A+yamUUoI+dh3BCOxdtGUVLitpQIhsG3h4B+G3G/t/039AgV9oqVLNcyVyY4k0gkI8d7NRADUcv8v+DYSbN2F8woRE9ktUhPRNlPJDKRa+2wkBPsDk5nzmHdpeyrkWxei8qe9l+fRcLhYL8OSiv/aFLhP0UbJxeu0y69tn9lbHxWaS2PuLZsnUQdSooXZGuUtov3YXC3Cyr~1',
      'priority': 'u=0, i',
      'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    }
    function filterCurrentArray(currentArray, oldArray) {
      return currentArray.filter(currentDict => 
        !oldArray.find(oldDict => 
          JSON.stringify(currentDict) === JSON.stringify(oldDict)
        )
      );
    }
  
  function extractSubstring(str) {
      const match = str.match(/\[(.*?)\]/);
      return match && match[1].trim();
    }
  
    function extractDate(str) {
      const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;
      const match = str.match(dateRegex);
      
      return match&& match[0].trim();
    }
  
  function extractData(inputString) {
      const nameMatch = inputString.match(/1\. Name and Address of Reporting Person\*\s*(.+?)\n/);
      const tickerMatch = extractSubstring(inputString)
      const dateMatch = extractDate(inputString)
  
      const Name = nameMatch ? nameMatch[1].trim() : null;
      const Ticker = tickerMatch ? tickerMatch.trim() : null;
      const DATE = dateMatch ? dateMatch.trim() : null;
  
      return { Name, Ticker };
  }
  
  function scrape144(url){
      fetch(url, {
          headers: hd
        })
        .then(response => response.text())
        .then(html => {
          //console.log(html)
         const $ = cheerio.load(html);
      
         const elementName = $("*").filter(function() {
          return $(this).text().trim() === 'Name of Issuer';
      });
      
      const elementRel = $("*").filter(function() {
          return $(this).text().trim() === 'Relationship to Issuer';
      });
      
      const elementAll = $("*").filter(function() {
          return $(this).text().trim() === 'Title of the Class of Securities To Be Sold';
      }).parent().parent();
      
      
          let data = {
              "Name":elementName.next().text(),
              "Ticker":'',
              "Relationship":elementRel.next().text(),
              "Cost": `$${elementAll.find('tr:nth-child(2) td:nth-child(4)').text()}`,
              "Shares": elementAll.find('tr:nth-child(2) td:nth-child(3)').text(),
              "Transaction": '',
              "Date": elementAll.find('tr:nth-child(2) td:nth-child(6)').text(),
              "Url":url
          }
          
          //console.log(data) //put gsheet code here
          const larryRow = sheet.addRow(data);
      
          
          
        })
        .catch(error => console.error('Error:', error));
  }
  
  function scrape4(url){
      fetch(url, {
          headers: hd
        })
        .then(response => response.text())
        .then(html => {
          //console.log(html)
         const $ = cheerio.load(html);
        
        // Query elements using $
        const table2 = $('table:nth-child(2)');
          
          
      
          const result = extractData(table2.text());
          
          ///////////////
          //const table3 = $('table:nth-child(3) tbody tr td:nth-child(1)');
          
          let data = {
              "Relationship":'',
              "Cost": $('table:nth-child(3) tbody tr:nth-child(1) td:nth-child(8)').text().trim().replace(/\(.*?\)/, ''),
              "Shares": $('table:nth-child(3) tbody tr:nth-child(1) td:nth-child(6)').text().trim().replace(/\(.*?\)/, ''),
              "Transaction": $('table:nth-child(3) tbody tr:nth-child(1) td:nth-child(4)').text().trim().replace(/\(.*?\)/, ''),
              "Date": $('table:nth-child(3) tbody tr:nth-child(1) td:nth-child(2)').text().trim().replace(/\(.*?\)/, ''),
              "Url": url
          }
          const mergedDict = { ...result, ...data}
          //console.log('hello world') //put gsheet code here
          const larryRow = sheet.addRow(mergedDict);
      
          
          
        })
        .catch(error => console.error('Error:', error));
  }
  async function fetchSecData(arr) {
      const promises = arr.map(async (item) => {
        const cik = item.CIK.padStart(10, '0'); // Ensure CIK is 10 digits
        const formattedCik = cik.replace(/^0+/, '')
        const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
        
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const jsonData = await response.json();
          // Process the JSON data here
          const filings = jsonData.filings?.recent;
  
      if (filings) {
          // Extract the first accession number and primary document
          const firstAccessionNumber = filings.accessionNumber[0];
          let  formattedAcc = firstAccessionNumber.replaceAll('-', '');
          const firstPrimaryDocument = filings.primaryDocument[0];   //You can put Date Processsed here
  
          
          let link = 'https://www.sec.gov/Archives/edgar/data/' + formattedCik + '/'+ formattedAcc + '/' + firstPrimaryDocument
          //console.log(link,item.formType)
          if (item.formType == '4'){
              scrape4(link)
          }
          else{
              scrape144(link)
          }
          //https://www.sec.gov/Archives/edgar/data/1906133/000149315224043108/xslF345X05/ownership.xml
      } else {
          console.log("No recent filings found.");
      }
          // or return it for further processing
          //return jsonData;
        } catch (error) {
          console.error(`Error fetching ${url}: ${error.message}`);
        }
      });
      
      await Promise.all(promises);
    }
  
  
  function runScrape(){
    (async () => {
      const fetch = (await import('node-fetch')).default;
      const { DOMParser } = await import('xmldom');
  
      async function fetchAndParseEntries() {
          const response = await fetch('https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=&company=&dateb=&owner=include&start=0&count=40&output=atom', {
              headers: {
                  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                  'accept-language': 'en-ZA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
                  'cache-control': 'max-age=0',
                  'cookie': 'nmstat=891756e9-a78e-9bb3-a82e-c13770ef859a; _gid=GA1.2.2109077336.1730302428; _ga=GA1.1.417854797.1730136641; _4c_=%7B%22_4c_s_%22%3A%22dZLLboMwEEV%2FJfI6IBu%2FMLsqlaou2qpVH8sowSZYaQEZNzSN%2BPeOgfSBVDbGZ%2B69Ho19Ql1pKpQRSTHFXEqWpGKJ9ubYouyEnNVhOaAM6YLkZKNExLVRERNcR8rkOJJcig0nRZEQjpboY8iSiiSCKpLyfol0dc5wRpvW7qo%2FupRQJhjobOMnYeiGUAGVlPKZFkjQniM386yx7rqfqLHAZTqLCgSkjZuf%2Bq80bybpCeW1NnA8UTFJYxwVLfThPwNJMAqhtX7P%2FdofmyDrzHbR6j0UtDnY3Kw7q305%2BAf5REtjd6UPGKcDDr0hAn%2BdrXTdzW0T%2FbYpooBuXd21JjhXpavfzILQIK7hRtHL4AjNOlMY5wYZ7FrrQ5%2BtyeNdfZgAvIKRRSN7toHqxePqAfjtL3K%2FuruZ0NXF%2Bun6EjaMwNCYVDKeBisYQf15rpiqBBZ4czA3%2F4qyVDAcvr7vvwA%3D%22%7D; _ga_300V1CHKH1=GS1.1.1730305771.6.1.1730307079.0.0.0; _ga_CSLL4ZEK4L=GS1.1.1730305771.6.1.1730307079.0.0.0',
                  'priority': 'u=0, i',
                  'referer': 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent',
                  'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                  'sec-ch-ua-mobile': '?0',
                  'sec-ch-ua-platform': '"Windows"',
                  'sec-fetch-dest': 'document',
                  'sec-fetch-mode': 'navigate',
                  'sec-fetch-site': 'same-origin',
                  'sec-fetch-user': '?1',
                  'upgrade-insecure-requests': '1',
                  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
                }
          });
  
          if (!response.ok) {
              console.error('Network response was not ok');
              return;
          }
  
          const text = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'application/xml');
          const entries = xmlDoc.getElementsByTagName('entry');
  
          // List to hold the results
          const entryList = [];
  
          // Loop through each entry and extract data
          for (let i = 0; i < entries.length; i++) {
              const entry = entries[i];
  
              // Extract the CIK number from <title>
              const titleTag = entry.getElementsByTagName('title')[0];
              const titleText = titleTag && titleTag.textContent;
              const cikMatch = titleText && titleText.match(/\((\d+)\)/);
              const cik = cikMatch ? cikMatch[1] : null;
  
              // Extract the time from <updated>
              const updatedTag = entry.getElementsByTagName('updated')[0];
              const time = updatedTag ? updatedTag.textContent : null;
  
              // Extract the term attribute from <category>
              const categoryTag = entry.getElementsByTagName('category')[0];
              const formType = categoryTag ? categoryTag.getAttribute('term') : null;
  
              // Append the extracted data to the entry list
              if (cik && time && formType) {
                  entryList.push({ CIK: cik, time, formType });
              }
          }
          //console.log(entryList)
  
   
    
    
    
    const filteredArray = filterCurrentArray(entryList, lastData)
    console.log(`got ${filteredArray.length} entries`)
    lastData = [...entryList]
  
          const filteredEntries = filteredArray.filter(entry => entry.formType === '4' || entry.formType === '144');
          console.log(`filter ${filteredEntries.length} forms`)
          console.log('#######')
          return filteredEntries;
      }
  
      // Fetch and log the parsed entries
      const entries = await fetchAndParseEntries();
      //console.log(entries.length)
      //const firstThree = entries.slice(0, 1)
      fetchSecData(entries)
  })();
  }
  
/////////////////////////////

app.get('/activate', (req, res) => {
  res.status(200).json('Welcome, the script is running in the background');
  const intervalId = setInterval(runScrape,INTERVAL)
});

app.get('/', (req, res) => {
    res.status(200).json('Welcome Home!!');
  });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
